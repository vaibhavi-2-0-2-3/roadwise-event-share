
import { supabase } from '@/integrations/supabase/client';

export async function updateCompletedRides() {
  const now = new Date().toISOString();
  
  // Update ride statuses
  const { data, error } = await supabase
    .from('rides')
    .update({ status: 'completed' })
    .eq('status', 'active')
    .lt('departure_time', now);
    
  if (error) {
    console.error('Error updating ride statuses:', error);
    return false;
  }
  
  // Update booking statuses for completed rides
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ status: 'completed' })
    .eq('status', 'confirmed')
    .in('ride_id', await getCompletedRideIds());
    
  if (bookingError) {
    console.error('Error updating booking statuses:', error);
  }
  
  return true;
}

async function getCompletedRideIds() {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('rides')
    .select('id')
    .eq('status', 'completed')
    .lt('departure_time', now);
    
  return data?.map(ride => ride.id) || [];
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
  
  // Also update all confirmed bookings for this ride
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ status: 'completed' })
    .eq('ride_id', rideId)
    .eq('status', 'confirmed');
    
  if (bookingError) throw bookingError;
  
  return true;
}
