
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRideStatusUpdater } from '@/hooks/useRideStatusUpdater';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedBanner } from '@/components/shared/AnimatedBanner';
import { RideCard } from '@/components/rides/RideCard';
import { CreateRideDialog } from '@/components/rides/CreateRideDialog';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  Search, MapPin, Calendar, Car, Clock, CalendarClock, Plus
} from 'lucide-react';

export default function RidesPage() {
  useRideStatusUpdater();
  const { user } = useAuth();

  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const [debouncedFrom] = useDebounce(searchFrom, 300);
  const [debouncedTo] = useDebounce(searchTo, 300);
  const [debouncedDate] = useDebounce(searchDate, 300);

  const [showCreateRide, setShowCreateRide] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { data: rides, isLoading } = useQuery({
    queryKey: ['rides', debouncedFrom, debouncedTo, debouncedDate],
    queryFn: async () => {
      let query = supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (
            id, name, image_url, bio
          ),
          events (
            id, title, location
          )
        `)
        .is('event_id', null) // Only show general rides, not event-specific ones
        .order('departure_time', { ascending: true });

      if (debouncedFrom) {
        query = query.ilike('origin', `%${debouncedFrom}%`);
      }

      if (debouncedTo) {
        query = query.ilike('destination', `%${debouncedTo}%`);
      }

      if (debouncedDate) {
        query = query.eq('departure_date', debouncedDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleCreateRide = () => {
    if (!user) {
      setShowAuthDialog(true);
    } else {
      setShowCreateRide(true);
    }
  };

  const activeRides = rides?.filter(r =>
    r.status === 'active' && new Date(r.departure_time) > new Date()
  ) || [];

  const upcomingRides = rides?.filter(r =>
    r.status === 'active' && new Date(r.departure_time) <= new Date()
  ) || [];

  const completedRides = rides?.filter(r => r.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatedBanner
        title="Find Your Perfect Ride"
        subtitle="Join a community of travelers sharing rides to events, reducing costs, and making new friends."
        gradient="from-blue-600 via-purple-600 to-blue-800"
      >
        <div className="flex items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Car className="h-5 w-5" />
            <span className="text-sm font-medium">{activeRides.length} Active Rides</span>
          </div>
          <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">15+ Destinations</span>
          </div>
          <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <CalendarClock className="h-5 w-5" />
            <span className="text-sm font-medium">Real-time Updates</span>
          </div>
        </div>
      </AnimatedBanner>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Available Rides</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Have a car? Offer a ride to someone going your way.
              </p>
            </div>

            <Button
              onClick={handleCreateRide}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Offer a Ride
            </Button>
          </div>
        </div>

        <Card className="mb-8 shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl">Search Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="From"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="pl-10 h-12 shadow-sm"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="To"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="pl-10 h-12 shadow-sm"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="pl-10 h-12 shadow-sm"
                />
              </div>
              <Button disabled className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Ride List */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white dark:bg-gray-800 border-0 shadow-lg h-14">
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium"
            >
              Active Rides ({activeRides.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-medium"
            >
              Departing Soon ({upcomingRides.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-gray-700 data-[state=active]:text-white font-medium"
            >
              Completed ({completedRides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeRides.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16 shadow-lg border-0">
                <CardContent>
                  <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active rides found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Be the first to offer a ride in your area!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingRides.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcomingRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16 shadow-lg border-0">
                <CardContent>
                  <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming rides</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Rides departing soon will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedRides.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {completedRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16 shadow-lg border-0">
                <CardContent>
                  <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No completed rides</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Completed rides will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateRideDialog open={showCreateRide} onOpenChange={setShowCreateRide} />
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
