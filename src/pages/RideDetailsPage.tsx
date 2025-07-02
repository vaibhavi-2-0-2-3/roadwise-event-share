
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, Car, MessageCircle, Star, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RideChat } from '@/components/rides/RideChat';
import { DriverReviews } from '@/components/rides/DriverReviews';
import { RideStatusButton } from '@/components/rides/RideStatusButton';
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/rides" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to Rides
        </Link>

        {/* Hero Section */}
        <Card className="mb-8 border-0 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                    <AvatarImage src={ride.profiles?.image_url} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {ride.profiles?.name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                      {ride.origin} → {ride.destination}
                    </h1>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Driver: {ride.profiles?.name}
                      </span>
                      <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">4.8</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(ride.departure_time).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Date</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">Time</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {ride.available_seats} of {ride.seats} left
                          </p>
                          <p className="text-xs text-gray-500">Seats</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Car className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <Badge variant={ride.available_seats > 0 && !isExpired ? 'default' : 'secondary'}>
                            {ride.status === 'completed' ? 'Completed' : 
                             isExpired ? 'Expired' : 
                             ride.available_seats > 0 ? 'Available' : 'Full'}
                          </Badge>
                          <p className="text-xs text-gray-500">Status</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-4">
                  {ride.price_per_seat > 0 ? (
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${ride.price_per_seat}
                      <span className="text-lg font-normal text-gray-600">/seat</span>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="text-lg px-4 py-2 mb-2 bg-green-100 text-green-800">
                      Free Ride
                    </Badge>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    {canBookRide && !isExpired && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Seats:</label>
                          <select 
                            value={seatsToBook} 
                            onChange={(e) => setSeatsToBook(Number(e.target.value))}
                            className="px-3 py-1 border rounded-md bg-background"
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
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {bookRideMutation.isPending ? 'Booking...' : `Book ${seatsToBook} Seat${seatsToBook > 1 ? 's' : ''}`}
                          {ride.price_per_seat > 0 && (
                            <span className="ml-2">
                              (${(ride.price_per_seat * seatsToBook).toFixed(2)})
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <RideStatusButton ride={ride} />
                  </div>
                </div>
              </div>

              {/* Event Badge */}
              {ride.events && (
                <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      Going to {ride.events.title}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Join other attendees heading to this event
                  </p>
                </div>
              )}

              {existingBooking && (
                <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-700 dark:text-green-300">
                      You've booked {existingBooking.seats_booked} seat(s) for this ride
                    </span>
                  </div>
                  <Badge className="mt-2 bg-green-500">
                    Status: {existingBooking.status}
                  </Badge>
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white dark:bg-gray-800 border-0 shadow-sm">
                <TabsTrigger value="reviews" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Star className="h-4 w-4" />
                  Driver Reviews
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
                  <MessageCircle className="h-4 w-4" />
                  Ride Chat
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="reviews">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-0">
                    <DriverReviews driverId={ride.driver_id} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="chat">
                {user && (existingBooking || user.id === ride.driver_id) ? (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-0">
                      <RideChat rideId={ride.id} driverId={ride.driver_id} />
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="text-center py-12">
                      <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Book to start chatting</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Book this ride to chat with the driver and coordinate your trip
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Driver Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link 
                  to={`/profile/${ride.driver_id}`} 
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={ride.profiles?.image_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {ride.profiles?.name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ride.profiles?.name}</p>
                    <p className="text-sm text-blue-600 hover:text-blue-800">View Profile →</p>
                  </div>
                </Link>
                {ride.profiles?.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {ride.profiles.bio}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Route Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Pickup Location</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ride.origin}</p>
                    </div>
                  </div>
                  <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-8"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Drop-off Location</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ride.destination}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ride Stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Ride Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Total Seats</span>
                    <span className="font-semibold">{ride.seats}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                    <span className="font-semibold">{ride.available_seats}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Price per seat</span>
                    <span className="font-semibold">
                      {ride.price_per_seat > 0 ? `$${ride.price_per_seat}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <Badge variant={ride.status === 'active' && !isExpired ? 'default' : 'secondary'}>
                      {ride.status === 'completed' ? 'Completed' : 
                       isExpired ? 'Expired' : 
                       ride.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
