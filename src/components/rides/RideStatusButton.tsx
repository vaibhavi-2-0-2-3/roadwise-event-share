import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CheckCircle, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RideStatusButtonProps {
  ride: {
    id: string;
    status: 'active' | 'in_progress' | 'completed' | 'cancelled';
    driver_id: string;
  };
}

export function RideStatusButton({ ride }: RideStatusButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDriver = user?.id === ride.driver_id;
  const [localStatus, setLocalStatus] = useState(ride.status);
  const [anyPaid, setAnyPaid] = useState(false); // ✅ Only one flag needed now

  useEffect(() => {
    const checkAnyPaid = async () => {
      if (isDriver && ride.status === 'active') {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('payment_status')
          .eq('ride_id', ride.id)
          .eq('status', 'confirmed');

        if (error) {
          console.error('Error fetching bookings:', error);
          return;
        }

        const somePaid = bookings.some((b) => b.payment_status === 'paid');
        setAnyPaid(somePaid);
      }
    };

    checkAnyPaid();
  }, [ride.id, ride.status, isDriver]);

  const updateStatus = async (newStatus: 'in_progress' | 'completed') => {
    if (!user || !isDriver) return;

    if (newStatus === 'in_progress') {
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('payment_status')
        .eq('ride_id', ride.id)
        .eq('status', 'confirmed');

      if (bookingsError) throw bookingsError;
      if (!bookings || bookings.length === 0) {
        toast.error('❌ No confirmed passengers found.');
        return;
      }

      const somePaid = bookings.some((b) => b.payment_status === 'paid');
      if (!somePaid) {
        toast.error('❌ At least one passenger must pay before starting the ride.');
        return;
      }
    }

    const { error: rideError } = await supabase
      .from('rides')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ride.id);

    if (rideError) throw rideError;

    if (newStatus === 'completed') {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('ride_id', ride.id)
        .eq('status', 'confirmed');

      if (bookingError) throw bookingError;
    }

    setLocalStatus(newStatus); // ✅ Update local UI
  };

  const mutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      toast.success('✅ Ride status updated!');
      queryClient.invalidateQueries({ queryKey: ['ride-details'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['user-booking'] });
    },
    onError: (err) => {
      console.error(err);
      toast.error('Failed to update ride status.');
    },
  });

  if (!isDriver) return null;

  return (
    <div className="flex gap-4 mt-4">
      {localStatus === 'active' && anyPaid && (
        <Button
          onClick={() => mutation.mutate('in_progress')}
          disabled={mutation.isPending}
          variant="outline"
          size="sm"
          className="bg-yellow-50 text-yellow-800 border-yellow-200"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Ride
        </Button>
      )}

      {localStatus === 'in_progress' && (
        <Button
          onClick={() => mutation.mutate('completed')}
          disabled={mutation.isPending}
          variant="outline"
          size="sm"
          className="bg-green-50 text-green-800 border-green-200"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          End Ride
        </Button>
      )}
    </div>
  );
}
