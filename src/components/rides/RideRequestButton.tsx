
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { RideChat } from './RideChat';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RideRequestButtonProps {
  ride: any;
  existingBooking: any;
  onShowAuth: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RideRequestButton({ ride, existingBooking, onShowAuth }: RideRequestButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [showChatDialog, setShowChatDialog] = useState(false);

  const requestRideMutation = useMutation({
    mutationFn: async (seats: number) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        ride_id: ride.id,
        seats_booked: seats,
        status: 'pending'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      const rideType = ride.event_id ? 'event ride' : 'ride';
      toast.success(`🚗 ${rideType} request sent! The driver will be notified.`);
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['user-booking'] });
      queryClient.invalidateQueries({ queryKey: ['ride-details'] });
      queryClient.invalidateQueries({ queryKey: ['event-rides'] });
    },
    onError: (error) => {
      toast.error('Failed to send ride request');
      console.error('Error requesting ride:', error);
    }
  });

  const handleRequestRide = () => {
    if (!user) return onShowAuth();
    requestRideMutation.mutate(seatsToBook);
  };

  const handleRazorpayPayment = async () => {
    const amount = Number(ride?.price_per_seat || 0) * Number(existingBooking?.seats_booked || 1);
    const rawName = user?.user_metadata?.full_name || user?.email || 'Passenger';
    const name = typeof rawName === 'string' && rawName.trim() !== '' ? rawName.trim().substring(0, 50) : 'Passenger';

    try {
      const res = await fetch('http://localhost:3000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name }),
      });

      const data = await res.json();
      const { order, key } = data;

      const options = {
        key,
        amount: order.amount,
        currency: 'INR',
        name: 'RoadWise',
        description: ride.event_id ? 'Event Ride Fare Payment' : 'Ride Fare Payment',
        order_id: order.id,
        handler: async function (response: any) {
          const { error } = await supabase
            .from('bookings')
            .update({
              payment_status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingBooking.id);

          if (!error) {
            toast.success('✅ Payment successful');
            queryClient.invalidateQueries({ queryKey: ['user-booking'] });
            queryClient.invalidateQueries({ queryKey: ['ride-details'] });
          } else {
            toast.error('❌ Failed to update payment status');
          }
        },
        prefill: {
          name: 'Test User',
          email: user?.email || 'test@example.com',
          contact: '0000000000'
        },
        notes: {
          ride_id: ride.id,
          event_id: ride.event_id || null,
        },
        theme: { color: '#3B82F6' },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      toast.error('❌ Payment initialization failed');
    }
  };

  const handleMessageClick = () => {
    if (!user) return onShowAuth();
    if (!existingBooking || existingBooking.status === 'pending') {
      toast.error('Please book the ride first to start chatting.');
      return;
    }
    setShowChatDialog(true);
  };

  const isDriverView = user?.id === ride.driver_id;
  const isExpired = new Date(ride.departure_time) < new Date();
  const canRequestRide = user && !existingBooking && ride.available_seats > 0 && !isDriverView && !isExpired;
  const chatEnabled = existingBooking?.status === 'confirmed' || existingBooking?.status === 'completed';

  if (isDriverView) {
    return (
      <div className="p-3 border border-dashed border-blue-200 bg-blue-50 text-blue-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="font-medium">
            This is your {ride.event_id ? 'event ride' : 'ride'}
          </span>
        </div>
      </div>
    );
  }

  if (existingBooking) {
    return (
      <div className="space-y-4">
        <div className="p-3 border border-dashed border-blue-200 bg-blue-50 text-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              {existingBooking.status === 'pending'
                ? `Request sent (${existingBooking.seats_booked} seat${existingBooking.seats_booked > 1 ? 's' : ''})`
                : existingBooking.status === 'confirmed'
                  ? `Accepted ✅ (${existingBooking.seats_booked} seat${existingBooking.seats_booked > 1 ? 's' : ''})`
                  : `${existingBooking.status} (${existingBooking.seats_booked} seat${existingBooking.seats_booked > 1 ? 's' : ''})`}
            </span>
          </div>

          {existingBooking.status === 'confirmed' && existingBooking.payment_status !== 'paid' && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-blue-700">🚧 Payment pending</p>
              <Button
                className="w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={handleRazorpayPayment}
              >
                Pay Now ₹{ride.price_per_seat * existingBooking.seats_booked}
              </Button>
            </div>
          )}

          <p className="text-xs mt-1">Status: {existingBooking.status}</p>
        </div>

        <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
              onClick={handleMessageClick}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Chat with Driver{ride.event_id ? ' - Event Ride' : ''}
              </DialogTitle>
            </DialogHeader>
            {chatEnabled && (
              <RideChat rideId={ride.id} driverId={ride.driver_id} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (canRequestRide) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Seats to request:</span>
          <select
            value={seatsToBook}
            onChange={(e) => setSeatsToBook(Number(e.target.value))}
            className="px-2 py-1 border border-blue-200 rounded-lg bg-white text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: Math.min(ride.available_seats, 4) }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleRequestRide}
          disabled={requestRideMutation.isPending}
          className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm hover:bg-blue-700 transition"
        >
          {requestRideMutation.isPending ? 'Sending Request...' : `Request ${ride.event_id ? 'Event Ride' : 'Ride'}`}
          {ride.price_per_seat > 0 && (
            <span className="ml-2">₹{(ride.price_per_seat * seatsToBook).toFixed(2)}</span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 border border-dashed border-gray-200 text-center text-gray-600 rounded-lg bg-gray-50">
      <p className="text-sm">
        {isExpired ? `This ${ride.event_id ? 'event ride' : 'ride'} has expired` : 'No seats available'}
      </p>
    </div>
  );
}
