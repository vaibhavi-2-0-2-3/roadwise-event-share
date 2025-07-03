
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Filter, MapPin, Clock, Car } from 'lucide-react';
import { RideCard } from '@/components/rides/RideCard';
import { CreateRideDialog } from '@/components/rides/CreateRideDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRideStatusUpdater } from '@/hooks/useRideStatusUpdater';
import { AuthDialog } from '@/components/auth/AuthDialog';

export default function RidesPage() {
  useRideStatusUpdater(); // Auto-update ride statuses
  
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateRide, setShowCreateRide] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { data: rides, isLoading } = useQuery({
    queryKey: ['rides', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (
            id,
            name,
            image_url,
            bio
          ),
          events (
            id,
            title,
            location
          )
        `)
        .is('event_id', null) // Only show rides not associated with events
        .order('departure_time', { ascending: true });

      if (searchTerm) {
        query = query.or(`origin.ilike.%${searchTerm}%,destination.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
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

  const activeRides = rides?.filter(ride => 
    ride.status === 'active' && 
    new Date(ride.departure_time) > new Date()
  ) || [];

  const upcomingRides = rides?.filter(ride => 
    ride.status === 'active' && 
    new Date(ride.departure_time) <= new Date()
  ) || [];

  const completedRides = rides?.filter(ride => ride.status === 'completed') || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Find Your Ride
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Connect with drivers heading to your destination
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                General rides only • Event-specific rides are shown on event pages
              </p>
            </div>
            
            <Button 
              onClick={handleCreateRide}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
            >
              <Plus className="h-5 w-5 mr-2" />
              Offer a Ride
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by origin or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-0 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <Button variant="outline" size="lg" className="px-6">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg mr-4">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeRides.length}</p>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">Active Rides</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingRides.length}</p>
                  <p className="text-green-600 dark:text-green-400 font-medium">Departing Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-lg mr-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedRides.length}</p>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rides tabs */}
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
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-12">
                  <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No active rides</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Be the first to offer or find a ride
                  </p>
                  <Button onClick={handleCreateRide} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ride
                  </Button>
                </CardContent>
              </Card>
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
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-12">
                  <Clock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No upcoming departures</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later for rides departing soon
                  </p>
                </CardContent>
              </Card>
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
              <Card className="border-0 shadow-sm">
                <CardContent className="text-center py-12">
                  <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No completed rides</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Completed rides will appear here
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
