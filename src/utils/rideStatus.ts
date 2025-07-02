
import { supabase } from '@/integrations/supabase/client';

export async function updateCompletedRides() {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('rides')
    .update({ status: 'completed' })
    .eq('status', 'active')
    .lt('departure_time', now);
    
  if (error) {
    console.error('Error updating ride statuses:', error);
    return false;
  }
  
  return true;
}

export async function markRideAsCompleted(rideId: string, driverId: string, currentUserId: string) {
  if (currentUserId !== driverId) {
    throw new Error('Only the driver can mark the ride as completed');
  }
  
  const { error } = await supabase
    .from('rides')
    .update({ status: 'completed' })
    .eq('id', rideId)
    .eq('driver_id', driverId);
    
  if (error) throw error;
  
  return true;
}
