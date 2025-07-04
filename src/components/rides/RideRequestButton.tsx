
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RideRequestButtonProps {
  ride: any;
  existingBooking: any;
  onShowAuth: () => void;
}

export function RideRequestButton({ ride, existingBooking, onShowAuth }: RideRequestButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [seatsToBook, setSeatsToBook] = useState(1);

  const requestRideMutation = useMutation({
    mutationFn: async (seats: number) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          ride_id: ride.id,
          seats_booked: seats,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('🚗 Ride request sent! The driver will be notified.');
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['user-booking'] });
      queryClient.invalidateQueries({ queryKey: ['ride-details'] });
    },
    onError: (error) => {
      toast.error('Failed to send ride request');
      console.error('Error requesting ride:', error);
    }
  });

  const handleRequestRide = () => {
    if (!user) {
      onShowAuth();
      return;
    }
    requestRideMutation.mutate(seatsToBook);
  };

  const isDriverView = user?.id === ride.driver_id;
  const isExpired = new Date(ride.departure_time) < new Date();
  const canRequestRide = user && !existingBooking && ride.available_seats > 0 && !isDriverView && !isExpired;
  const chatEnabled = existingBooking?.status === 'confirmed';

  if (isDriverView) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-700 dark:text-blue-300">
            This is your ride
          </span>
        </div>
      </div>
    );
  }

  if (existingBooking) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-700 dark:text-green-300">
              {existingBooking.status === 'pending' 
                ? `Request sent (${existingBooking.seats_booked} seat${existingBooking.seats_booked > 1 ? 's' : ''})`
                : `Booked (${existingBooking.seats_booked} seat${existingBooking.seats_booked > 1 ? 's' : ''})`
              }
            </span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Status: {existingBooking.status}
          </p>
        </div>
        
        {chatEnabled && (
          <Button variant="outline" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message Driver
          </Button>
        )}
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
            className="px-3 py-2 border rounded-md bg-background"
          >
            {Array.from({ length: Math.min(ride.available_seats, 4) }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <Button 
          onClick={handleRequestRide} 
          disabled={requestRideMutation.isPending}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
        >
          {requestRideMutation.isPending ? 'Sending Request...' : 'Request Ride'}
          {ride.price_per_seat > 0 && (
            <span className="ml-2">
              (${(ride.price_per_seat * seatsToBook).toFixed(2)})
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <p className="text-gray-600 dark:text-gray-400 text-center">
        {isExpired ? 'This ride has expired' : 'No seats available'}
      </p>
    </div>
  );
}
