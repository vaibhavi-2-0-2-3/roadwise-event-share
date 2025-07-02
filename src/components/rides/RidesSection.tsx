
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RideCard } from './RideCard';
import { CreateRideDialog } from './CreateRideDialog';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Skeleton } from '@/components/ui/skeleton';

export function RidesSection() {
  const { user } = useAuth();
  const [showCreateRide, setShowCreateRide] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { data: rides, isLoading } = useQuery({
    queryKey: ['rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (
            id,
            name,
            image_url
          ),
          events (
            id,
            title,
            location
          )
        `)
        .eq('status', 'active')
        .order('departure_time', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const handleCreateRide = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setShowCreateRide(true);
  };

  if (isLoading) {
    return (
      <section id="rides" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Available Rides</h2>
            <Button onClick={handleCreateRide}>
              <Plus className="h-4 w-4 mr-2" />
              Offer a Ride
            </Button>
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="rides" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Available Rides</h2>
            <Button onClick={handleCreateRide}>
              <Plus className="h-4 w-4 mr-2" />
              Offer a Ride
            </Button>
          </div>
          
          {rides && rides.length > 0 ? (
            <div className="grid gap-6">
              {rides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No rides available at the moment.</p>
              <Button onClick={handleCreateRide}>
                <Plus className="h-4 w-4 mr-2" />
                Be the first to offer a ride!
              </Button>
            </div>
          )}
        </div>
      </section>

      <CreateRideDialog
        open={showCreateRide}
        onOpenChange={setShowCreateRide}
      />

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
