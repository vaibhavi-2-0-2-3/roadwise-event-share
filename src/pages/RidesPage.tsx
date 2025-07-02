
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Users, Plus, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RideDetailsDialog } from '@/components/rides/RideDetailsDialog';
import { CreateRideDialog } from '@/components/rides/CreateRideDialog';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';

export default function RidesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRide, setSelectedRide] = useState<any>(null);
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

  const handleBookRide = (ride: any) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setSelectedRide(ride);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Available Rides</h1>
            <p className="text-gray-600 dark:text-gray-400">Find your perfect ride or offer one to fellow travelers</p>
          </div>
          <Button onClick={handleCreateRide} className="md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Offer a Ride
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by origin or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Rides List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rides && rides.length > 0 ? (
        <div className="space-y-4">
          {rides.map((ride) => (
            <Card 
              key={ride.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => handleBookRide(ride)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    {/* Driver Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {ride.profiles?.image_url ? (
                          <img 
                            src={ride.profiles.image_url} 
                            alt={ride.profiles.name} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          ride.profiles?.name?.charAt(0) || 'D'
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{ride.profiles?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Driver</p>
                      </div>
                      {ride.available_seats === 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          Fully Booked
                        </Badge>
                      )}
                    </div>

                    {/* Route & Event Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium">{ride.origin}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{ride.destination}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2 text-green-500" />
                        <span>
                          {new Date(ride.departure_time).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                        <span>
                          {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2 text-purple-500" />
                        <span>{ride.available_seats} seats left</span>
                      </div>
                    </div>

                    {/* Event Badge */}
                    {ride.events && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                          🎉 Going to {ride.events.title}
                        </Badge>
                      </div>
                    )}

                    {/* Price */}
                    {ride.price_per_seat > 0 && (
                      <div className="flex items-center text-lg font-semibold text-green-600">
                        <DollarSign className="h-5 w-5 mr-1" />
                        {ride.price_per_seat} per seat
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 lg:w-48">
                    <Button 
                      disabled={ride.available_seats === 0} 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookRide(ride);
                      }}
                    >
                      {ride.available_seats === 0 ? 'Fully Booked' : 'Book Ride'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRide(ride);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No rides found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'No rides are currently available'}
          </p>
          <Button onClick={handleCreateRide}>
            <Plus className="mr-2 h-4 w-4" />
            Offer the First Ride
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {selectedRide && (
        <RideDetailsDialog
          ride={selectedRide}
          open={!!selectedRide}
          onOpenChange={() => setSelectedRide(null)}
        />
      )}

      <CreateRideDialog
        open={showCreateRide}
        onOpenChange={setShowCreateRide}
      />

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
