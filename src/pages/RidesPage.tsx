
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
  Search, MapPin, Calendar, Car, Clock, CalendarClock, Plus, Users, Route
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
          id,
          driver_id,
          origin,
          destination,
          departure_time,
          available_seats,
          seats,
          price_per_seat,
          status,
          event_id,
          profiles:driver_id (
            id, name, image_url, bio
          ),
          events (
            id, title, location
          )
        `)
        .is('event_id', null)
        .order('departure_time', { ascending: true });

      if (debouncedFrom) {
        query = query.ilike('origin', `%${debouncedFrom}%`);
      }

      if (debouncedTo) {
        query = query.ilike('destination', `%${debouncedTo}%`);
      }

      if (debouncedDate) {
        const startDate = new Date(debouncedDate);
        const endDate = new Date(debouncedDate);
        endDate.setDate(endDate.getDate() + 1);
        
        query = query.gte('departure_time', startDate.toISOString())
                     .lt('departure_time', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
      <AnimatedBanner
        title="Find Your Perfect Ride"
        subtitle="Join a community of travelers sharing rides, reducing costs, and making new connections along the way."
        gradient="from-blue-600 via-cyan-600 to-blue-800"
      >
        <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
          <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Car className="h-5 w-5" />
            <span className="text-sm font-medium">{activeRides.length} Active Rides</span>
          </div>
          <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">25+ Destinations</span>
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
              <h1 className="text-3xl font-bold font-display mb-2 text-gradient-primary">Available Rides</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Have a car? Offer a ride to someone going your way and split the costs.
              </p>
            </div>

            <Button
              onClick={handleCreateRide}
              size="lg"
              className="bg-gradient-primary text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 btn-hover-glow ripple"
            >
              <Plus className="h-5 w-5 mr-2" />
              Offer a Ride
            </Button>
          </div>
        </div>

        {/* Enhanced Search */}
        <Card className="card-modern border-0 mb-8 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Route className="h-5 w-5 text-blue-600" />
              Search Rides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="From"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="pl-10 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-300"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="To"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="pl-10 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-300"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="pl-10 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-300"
                />
              </div>
              <Button className="bg-gradient-primary hover:bg-gradient-primary/90 rounded-xl btn-hover-glow">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs and Ride List */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-card h-14 rounded-2xl">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white font-medium rounded-xl transition-all duration-300"
            >
              <Car className="h-4 w-4 mr-2" />
              Upcoming ({activeRides.length})
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white font-medium rounded-xl transition-all duration-300"
            >
              <Clock className="h-4 w-4 mr-2" />
              Departing Soon ({upcomingRides.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-slate-600 data-[state=active]:text-white font-medium rounded-xl transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Completed ({completedRides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeRides.length > 0 ? (
              <div className="space-y-4">
                {activeRides.map((ride, index) => (
                  <div key={ride.id} className={`animate-fade-in-up animate-delay-${index * 100}`}>
                    <RideCard ride={ride} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16 card-modern border-0 animate-fade-in-up">
                <CardContent>
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <Car className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gradient-primary">No upcoming rides found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Be the first to offer a ride in your area! Share your journey and help build our carpooling community.
                  </p>
                  <Button onClick={handleCreateRide} className="bg-gradient-primary text-white px-6 py-3 rounded-xl btn-hover-glow">
                    <Plus className="h-4 w-4 mr-2" />
                    Offer a Ride
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingRides.length > 0 ? (
              <div className="space-y-4">
                {upcomingRides.map((ride, index) => (
                  <div key={ride.id} className={`animate-fade-in-up animate-delay-${index * 100}`}>
                    <RideCard ride={ride} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16 card-modern border-0 animate-fade-in-up">
                <CardContent>
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <Clock className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">No rides departing soon</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Rides that are departing soon will appear here with real-time updates.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedRides.length > 0 ? (
              <div className="space-y-4">
                {completedRides.map((ride, index) => (
                  <div key={ride.id} className={`animate-fade-in-up animate-delay-${index * 100}`}>
                    <RideCard ride={ride} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16 card-modern border-0 animate-fade-in-up">
                <CardContent>
                  <div className="w-20 h-20 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">No completed rides yet</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Your completed ride history will appear here once you start carpooling.
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
