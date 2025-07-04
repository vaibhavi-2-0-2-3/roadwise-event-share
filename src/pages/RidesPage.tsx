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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">

      <AnimatedBanner
        title="Find Your Perfect Ride"
        subtitle="Join a community of travelers sharing rides to events, reducing costs, and making new friends."
        gradient="from-blue-950 via-blue-900 to-blue-800"
      >
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 text-white/90">
            <Car className="h-5 w-5" />
            <span className="text-sm font-medium">47 Active Rides</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">15+ Destinations</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <CalendarClock className="h-5 w-5" />
            <span className="text-sm font-medium">Real-time Updates</span>
          </div>
        </div>
      </AnimatedBanner>

      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-card border border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Search Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="From"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="pl-10 bg-input border border-border"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="To"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="pl-10 bg-input border border-border"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="pl-10 bg-input border border-border"
                />
              </div>
              <Button className="bg-primary/90 text-white hover:bg-primary/60 transition-colors flex items-center justify-center">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>


          </CardContent>


        </Card>

        <div className='mb-4'>
          <Button onClick={handleCreateRide} className="md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Offer a Ride
          </Button>

        </div>
        {/* Tabs and Ride List */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white dark:bg-gray-800 border-0 shadow-sm">
            <TabsTrigger value="active" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Active Rides ({activeRides.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Departing Soon ({upcomingRides.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">
              Completed ({completedRides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeRides.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            ) : (
              <p className="text-center pt-4 text-s font-medium text-gray-600 dark:text-gray-300">
                No active rides found.
              </p>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingRides.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            ) : (
              <p className="text-center pt-4 text-s font-medium text-gray-600 dark:text-gray-300">No upcoming rides.</p>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedRides.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            ) : (
              <p className="text-center pt-4 text-s font-medium text-gray-600 dark:text-gray-300">No completed rides.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateRideDialog open={showCreateRide} onOpenChange={setShowCreateRide} />
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
