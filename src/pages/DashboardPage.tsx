
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Car, Users, Star, Calendar, MapPin, MessageCircle, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's rides as driver
  const { data: myRides } = useQuery({
    queryKey: ['my-rides', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          events (title, location),
          bookings (
            id,
            seats_booked,
            status,
            profiles:user_id (name, image_url)
          )
        `)
        .eq('driver_id', user.id)
        .order('departure_time', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch user's bookings as passenger
  const { data: myBookings } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rides (
            *,
            profiles:driver_id (name, image_url),
            events (title, location)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch reviews received as driver
  const { data: reviewsReceived } = useQuery({
    queryKey: ['reviews-received', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer_profile:profiles!reviews_reviewer_id_fkey (name, image_url)
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch reviews given by user
  const { data: reviewsGiven } = useQuery({
    queryKey: ['reviews-given', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          driver_profile:profiles!reviews_driver_id_fkey (name, image_url),
          rides (origin, destination, departure_time)
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Calculate stats
  const stats = {
    totalRidesOffered: myRides?.length || 0,
    totalRidesBooked: myBookings?.length || 0,
    totalPassengers: myRides?.reduce((acc, ride) => acc + ride.bookings.length, 0) || 0,
    averageRating: reviewsReceived?.length 
      ? (reviewsReceived.reduce((acc, review) => acc + review.rating, 0) / reviewsReceived.length).toFixed(1)
      : 'N/A'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your rides, bookings, and reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRidesOffered}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rides Offered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRidesBooked}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rides Booked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPassengers}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="my-rides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-rides">My Rides</TabsTrigger>
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="reviews-received">Reviews Received</TabsTrigger>
          <TabsTrigger value="reviews-given">Reviews Given</TabsTrigger>
        </TabsList>

        {/* My Rides Tab */}
        <TabsContent value="my-rides" className="space-y-4">
          {myRides && myRides.length > 0 ? (
            myRides.map((ride) => (
              <Card key={ride.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{ride.origin} → {ride.destination}</span>
                        <Badge className={ride.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                          {ride.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(ride.departure_time).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {ride.bookings.length}/{ride.seats} passengers
                        </div>
                      </div>
                      {ride.events && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Event: {ride.events.title}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {ride.bookings.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Passengers:</h4>
                      <div className="space-y-2">
                        {ride.bookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={booking.profiles?.image_url} />
                                <AvatarFallback>
                                  {booking.profiles?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{booking.profiles?.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {booking.seats_booked} seat(s)
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No rides offered yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Start offering rides to help fellow travelers!</p>
            </div>
          )}
        </TabsContent>

        {/* My Bookings Tab */}
        <TabsContent value="my-bookings" className="space-y-4">
          {myBookings && myBookings.length > 0 ? (
            myBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {booking.rides.origin} → {booking.rides.destination}
                        </span>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(booking.rides.departure_time).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {booking.seats_booked} seat(s) booked
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={booking.rides.profiles?.image_url} />
                          <AvatarFallback>
                            {booking.rides.profiles?.name?.charAt(0) || 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Driver: {booking.rides.profiles?.name}</span>
                      </div>
                      {booking.rides.events && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Event: {booking.rides.events.title}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Book your first ride to get started!</p>
            </div>
          )}
        </TabsContent>

        {/* Reviews Received Tab */}
        <TabsContent value="reviews-received" className="space-y-4">
          {reviewsReceived && reviewsReceived.length > 0 ? (
            reviewsReceived.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.reviewer_profile?.image_url} />
                        <AvatarFallback>
                          {review.reviewer_profile?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.reviewer_profile?.name}</p>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews received yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Complete more rides to receive reviews!</p>
            </div>
          )}
        </TabsContent>

        {/* Reviews Given Tab */}
        <TabsContent value="reviews-given" className="space-y-4">
          {reviewsGiven && reviewsGiven.length > 0 ? (
            reviewsGiven.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.driver_profile?.image_url} />
                        <AvatarFallback>
                          {review.driver_profile?.name?.charAt(0) || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Driver: {review.driver_profile?.name}</p>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.rides && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Ride: {review.rides.origin} → {review.rides.destination}
                    </p>
                  )}
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Award className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews given yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Complete rides and leave reviews for drivers!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
