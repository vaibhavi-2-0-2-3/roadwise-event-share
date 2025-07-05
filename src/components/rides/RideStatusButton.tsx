import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RideStatusButtonProps {
  ride: any;
}

export function RideStatusButton({ ride }: RideStatusButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const isDriver = user?.id === ride.driver_id;

  const updateStatus = async (newStatus: 'active' | 'in_progress' | 'completed') => {
    if (!user || !isDriver) return;

    // 1. Update ride status
    const { error: rideError } = await supabase
      .from('rides')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ride.id);

    if (rideError) throw rideError;

    // 2. If completed, mark all confirmed bookings as completed
    if (newStatus === 'completed') {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('ride_id', ride.id)
        .eq('status', 'confirmed');

      if (bookingError) throw bookingError;
    }
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
      {ride.status === 'active' && (
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

      {ride.status === 'in_progress' && (
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
