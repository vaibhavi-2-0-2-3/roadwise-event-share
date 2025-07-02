
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';
import { markRideAsCompleted } from '@/utils/rideStatus';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RideStatusButtonProps {
  ride: any;
}

export function RideStatusButton({ ride }: RideStatusButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState(false);

  const completeMutation = useMutation({
    mutationFn: () => markRideAsCompleted(ride.id, ride.driver_id, user?.id || ''),
    onSuccess: () => {
      toast.success('Ride marked as completed!');
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['ride-details'] });
    },
    onError: (error) => {
      toast.error('Failed to complete ride');
      console.error('Error completing ride:', error);
    }
  });

  const handleComplete = () => {
    setIsCompleting(true);
    completeMutation.mutate();
  };

  // Don't show button if not the driver or ride is already completed
  if (!user || user.id !== ride.driver_id || ride.status !== 'active') {
    return null;
  }

  // Only show if departure time has passed
  const departureTime = new Date(ride.departure_time);
  const now = new Date();
  if (now < departureTime) {
    return null;
  }

  return (
    <Button
      onClick={handleComplete}
      disabled={completeMutation.isPending || isCompleting}
      variant="outline"
      size="sm"
      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
    >
      {completeMutation.isPending ? (
        <>
          <Clock className="h-4 w-4 mr-2 animate-spin" />
          Completing...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as Completed
        </>
      )}
    </Button>
  );
}
