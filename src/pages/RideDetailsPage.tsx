import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Clock, Users, DollarSign, Star, Shield, MessageCircle, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RideRequestButton } from '@/components/rides/RideRequestButton';
import { WeatherWidget } from '@/components/rides/WeatherWidget';
import { CalendarButton } from '@/components/rides/CalendarButton';
import { RouteMapDialog } from '@/components/rides/RouteMapDialog';
import { CompletedRideReview } from '@/components/rides/CompletedRideReview';
import { PendingRequests } from '@/components/rides/PendingRequests';
import { ConfirmedPassengers } from '@/components/rides/ConfirmedPassengers';
import { RideChat } from '@/components/rides/RideChat';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { RideStatusButton } from '@/components/rides/RideStatusButton';

export default function RideDetailsPage() {
  const { rideId } = useParams();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showDriverChat, setShowDriverChat] = useState(false);

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

  const isDriverView = user?.id === ride.driver_id;

  const handleMessagePassenger = (passengerId: string, passengerName: string) => {
    setShowDriverChat(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/rides" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to rides
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weather Widget */}
            <WeatherWidget
              date={ride.departure_time}
              location={ride.destination.split(',')[0]}
            />

            {/* Driver's Pending Requests Section */}
            {isDriverView && (
              <PendingRequests rideId={ride.id} />
            )}

            {/* Driver's Confirmed Passengers Section */}
            {isDriverView && (
              <>
                <ConfirmedPassengers
                  rideId={ride.id}
                  onMessagePassenger={handleMessagePassenger}
                />
                <RideStatusButton ride={ride} />
              </>
            )}


            {/* Ride Details Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Ride Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Location */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-semibold text-lg">{ride.origin}</p>
                    </div>
                  </div>
                  <RouteMapDialog
                    origin={ride.origin}
                    destination={ride.destination}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Navigation className="h-4 w-4 mr-1" />
                        Map
                      </Button>
                    }
                  />
                </div>

                {/* To Location */}
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-semibold text-lg">{ride.destination}</p>
                    </div>
                  </div>
                  <RouteMapDialog
                    origin={ride.origin}
                    destination={ride.destination}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Navigation className="h-4 w-4 mr-1" />
                        Map
                      </Button>
                    }
                  />
                </div>

                <Separator />

                {/* Departure Info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Clock className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-semibold">
                      {new Date(ride.departure_time).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-lg font-bold">
                      {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Full Route Button */}
                <RouteMapDialog
                  origin={ride.origin}
                  destination={ride.destination}
                  trigger={
                    <Button variant="outline" className="w-full">
                      <Navigation className="h-4 w-4 mr-2" />
                      View Full Route on Google Maps
                    </Button>
                  }
                />
              </CardContent>
            </Card>

            {/* Driver Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Driver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={ride.profiles?.image_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                      {ride.profiles?.name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{ride.profiles?.name}</h3>
                    <p className="text-sm text-gray-600">New driver</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-sm text-gray-600">(127 reviews)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Message button for passengers with confirmed booking */}
                    {!isDriverView && existingBooking?.status === 'confirmed' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Chat with {ride.profiles?.name}</DialogTitle>
                          </DialogHeader>
                          <RideChat rideId={ride.id} driverId={ride.driver_id} />
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Message button for drivers */}
                    {isDriverView && (
                      <Dialog open={showDriverChat} onOpenChange={setShowDriverChat}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Ride Chat</DialogTitle>
                          </DialogHeader>
                          <RideChat rideId={ride.id} driverId={ride.driver_id} />
                        </DialogContent>
                      </Dialog>
                    )}

                    <Link to={`/profile/${ride.driver_id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <CalendarButton ride={ride} />
              </CardContent>
            </Card>

            {/* Price and Booking */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-lg">Price per person</span>
                  <span className="text-2xl font-bold ml-auto">
                    {ride.price_per_seat > 0 ? `$${ride.price_per_seat}` : 'Free'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-lg">Available seats</span>
                  <span className="text-2xl font-bold ml-auto">{ride.available_seats}</span>
                </div>

                <Separator />

                <RideRequestButton
                  ride={ride}
                  existingBooking={existingBooking}
                  onShowAuth={() => setShowAuthDialog(true)}
                />

                {/* Review for completed rides */}
                {existingBooking && (
                  <CompletedRideReview ride={ride} booking={existingBooking} />
                )}
              </CardContent>
            </Card>

            {/* Secure Payment Info */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Secure Payment</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Encrypted payment processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Booking protection guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free cancellation up to 24h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
