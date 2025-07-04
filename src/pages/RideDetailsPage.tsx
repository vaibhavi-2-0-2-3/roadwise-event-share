import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, Car, Star, Shield, Music, Baby, Cigarette, Heart, Luggage, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RideStatusButton } from '@/components/rides/RideStatusButton';
import { LiveTrackingMap } from '@/components/rides/LiveTrackingMap';
import { toast } from 'sonner';

export default function RideDetailsPage() {
  const { rideId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [seatsToBook, setSeatsToBook] = useState(1);

  const { data: ride, isLoading: rideLoading } = useQuery({
    queryKey: ['ride-details', rideId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (
            id,
            name,
            image_url,
            bio,
            phone
          ),
          events (
            id,
            title,
            location
          )
        `)
        .eq('id', rideId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!rideId
  });

  const { data: existingBooking } = useQuery({
    queryKey: ['user-booking', rideId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('ride_id', rideId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && !!rideId
  });

  const bookRideMutation = useMutation({
    mutationFn: async (seats: number) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          ride_id: rideId!,
          seats_booked: seats
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('🎉 Ride booked successfully! The driver has been notified.');
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['user-booking'] });
      queryClient.invalidateQueries({ queryKey: ['ride-details'] });
    },
    onError: (error) => {
      toast.error('Failed to book ride');
      console.error('Error booking ride:', error);
    }
  });

  const handleBookRide = () => {
    bookRideMutation.mutate(seatsToBook);
  };

  if (rideLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12 border-0 shadow-sm">
            <CardContent>
              <h2 className="text-2xl font-bold mb-2">Ride Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The ride you're looking for doesn't exist.
              </p>
              <Link to="/rides">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Browse Rides</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const canBookRide = user && !existingBooking && ride.available_seats > 0 && user.id !== ride.driver_id;
  const isExpired = new Date(ride.departure_time) < new Date();
  const isDriverView = user?.id === ride.driver_id;
  const showLiveTracking = ride.status === 'in_progress' || (existingBooking && ride.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/rides" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to Rides
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Driver View Badge */}
            {isDriverView && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    ✅ This is your ride (driver view)
                  </span>
                </div>
              </div>
            )}

            {/* Route Card */}
            <Card className="mb-6 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Trip Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Route */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-lg">{ride.origin}</p>
                        <p className="text-sm text-gray-600">Start</p>
                      </div>
                    </div>
                    <div className="border-t-2 border-dashed border-gray-300 flex-1 mx-4"></div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-lg text-right">{ride.destination}</p>
                        <p className="text-sm text-gray-600 text-right">Destination</p>
                      </div>
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    </div>
                  </div>

                  <Separator />

                  {/* Trip Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <p className="font-semibold">{new Date(ride.departure_time).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Date</p>
                    </div>
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="font-semibold">
                        {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">Time</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                      <p className="font-semibold">{ride.available_seats} seats</p>
                      <p className="text-sm text-gray-600">Available</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                      <p className="font-semibold">
                        {ride.price_per_seat > 0 ? `$${ride.price_per_seat}` : 'Free'}
                      </p>
                      <p className="text-sm text-gray-600">Per seat</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card className="mb-6 shadow-lg border-0">
              <CardHeader>
                <CardTitle>Travel Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Heart className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Pets OK</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Music className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Music OK</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Cigarette className="h-5 w-5 text-red-600" />
                    <span className="text-sm">No Smoking</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <Baby className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm">Kids OK</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Luggage className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Luggage Policy</span>
                  </div>
                  <p className="text-sm text-gray-600">Medium bags allowed • No detours • Comfort guaranteed</p>
                </div>
              </CardContent>
            </Card>

            {/* Live Tracking Tab */}
            {showLiveTracking && (
              <Tabs defaultValue="tracking" className="w-full">
                <TabsList className="grid w-full grid-cols-1 mb-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <TabsTrigger 
                    value="tracking" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <Navigation className="h-4 w-4" />
                    Live Tracking
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="tracking">
                  <LiveTrackingMap rideId={rideId!} ride={ride} />
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Card */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <Link 
                  to={`/profile/${ride.driver_id}`} 
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800 mb-6"
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={ride.profiles?.image_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                      {ride.profiles?.name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{ride.profiles?.name}</h3>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-sm text-gray-600">(127 reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </Link>

                {/* Booking Section */}
                {!isDriverView && canBookRide && !isExpired && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Seats to book:</span>
                      <select 
                        value={seatsToBook} 
                        onChange={(e) => setSeatsToBook(Number(e.target.value))}
                        className="px-3 py-2 border rounded-md bg-background"
                      >
                        {Array.from({ length: Math.min(ride.available_seats, 4) }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={handleBookRide} 
                      disabled={bookRideMutation.isPending}
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                    >
                      {bookRideMutation.isPending ? 'Booking...' : 'Start Booking'}
                      {ride.price_per_seat > 0 && (
                        <span className="ml-2">
                          (${(ride.price_per_seat * seatsToBook).toFixed(2)})
                        </span>
                      )}
                    </Button>
                  </div>
                )}

                {existingBooking && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-700 dark:text-green-300">
                        You've booked {existingBooking.seats_booked} seat(s)
                      </span>
                    </div>
                    <Badge className="mt-2 bg-green-500">
                      Status: {existingBooking.status}
                    </Badge>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Trip Stats */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Trip Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Total Seats</span>
                  <span className="font-semibold">{ride.seats}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Available</span>
                  <span className="font-semibold">{ride.available_seats}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <Badge variant={ride.status === 'active' && !isExpired ? 'default' : 'secondary'}>
                    {ride.status === 'completed' ? 'Completed' : 
                     isExpired ? 'Expired' : 
                     ride.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Event Badge */}
            {ride.events && (
              <Card className="shadow-lg border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      Going to {ride.events.title}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Join other attendees heading to this event
                  </p>
                </CardContent>
              </Card>
            )}

            <RideStatusButton ride={ride} />
          </div>
        </div>
      </div>
    </div>
  );
}
