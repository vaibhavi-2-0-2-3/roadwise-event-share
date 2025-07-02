
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { updateCompletedRides } from '@/utils/rideStatus';

export function useRideStatusUpdater() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const updateStatuses = async () => {
      try {
        await updateCompletedRides();
        // Refresh ride queries after updating statuses
        queryClient.invalidateQueries({ queryKey: ['rides'] });
      } catch (error) {
        console.error('Failed to update ride statuses:', error);
      }
    };

    // Update on mount
    updateStatuses();

    // Set up interval to check every 5 minutes
    const interval = setInterval(updateStatuses, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queryClient]);
}
