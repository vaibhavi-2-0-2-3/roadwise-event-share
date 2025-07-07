
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Clock, Users, DollarSign, Star, Shield, MessageCircle, Navigation, Calendar, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RideRequestButton } from '@/components/rides/RideRequestButton';
import { WeatherWidget } from '@/components/rides/WeatherWidget';
import { CalendarButton } from '@/components/rides/CalendarButton';
import { CompletedRideReview } from '@/components/rides/CompletedRideReview';
import { PendingRequests } from '@/components/rides/PendingRequests';
import { ConfirmedPassengers } from '@/components/rides/ConfirmedPassengers';
import { RideChat } from '@/components/rides/RideChat';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { RideStatusButton } from '@/components/rides/RideStatusButton';
import RideLiveTracker from '@/components/liveTracking/RideLiveTracker';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-blue-100 rounded-xl w-1/4"></div>
            <div className="h-64 bg-blue-100 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-blue-100 rounded-2xl"></div>
              <div className="h-96 bg-blue-100 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-16 bg-white shadow-lg rounded-2xl border-0">
            <CardContent>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Ride Not Found</h2>
              <p className="text-gray-600 mb-6">
                The ride you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/rides">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105">
                  Browse Available Rides
                </Button>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            to="/rides"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 font-medium transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to rides
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                {ride.origin.split(',')[0]} → {ride.destination.split(',')[0]}
              </h1>
              <p className="text-blue-100 text-lg">
                {new Date(ride.departure_time).toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })} at {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            {ride.status && (
              <Badge 
                variant={ride.status === 'active' ? 'default' : 'secondary'}
                className={`px-4 py-2 text-sm font-semibold rounded-full ${
                  ride.status === 'active' 
                    ? 'bg-green-500 text-white' 
                    : ride.status === 'in_progress'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                {ride.status === 'active' ? 'Available' : 
                 ride.status === 'in_progress' ? 'In Progress' : 
                 ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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

            <RideStatusButton ride={ride} />

            {ride.status === 'in_progress' && (
              <RideLiveTracker
                currentUserId={user?.id}
                participants={[
                  { userId: ride.driver_id, name: ride.profiles?.name, rideId: ride.id },
                  ...(existingBooking?.status === 'confirmed'
                    ? [{ userId: user.id, name: user.user_metadata?.full_name || user.email, rideId: ride.id }]
                    : []
                  )
                ]}
              />
            )}

            {/* Journey Details Card */}
            <Card className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="text-xl font-bold flex items-center gap-3 text-blue-900">
                  <Navigation className="h-6 w-6" />
                  Journey Details
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Route Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700 uppercase tracking-wide">From</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{ride.origin}</p>
                  </div>

                  {/* To */}
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-red-700 uppercase tracking-wide">To</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{ride.destination}</p>
                  </div>
                </div>

                {/* Departure Time */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 uppercase tracking-wide">Departure</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(ride.departure_time).toLocaleDateString('en-US', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Google Maps Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/${encodeURIComponent(ride.origin)}/${encodeURIComponent(ride.destination)}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <Navigation className="h-5 w-5 mr-2" />
                    View Route on Google Maps
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Card - Clickable */}
            <Link to={`/profile/${ride.driver_id}`}>
              <Card className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-[1.02]">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900">
                    <Users className="h-5 w-5" />
                    Your Driver
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-blue-200">
                        <AvatarImage src={ride.profiles?.image_url} />
                        <AvatarFallback className="bg-blue-600 text-white text-lg font-bold">
                          {ride.profiles?.name?.charAt(0) || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900">{ride.profiles?.name}</h3>
                      <p className="text-sm text-blue-600 font-medium">Verified Driver</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-700">4.8</span>
                        </div>
                        <span className="text-xs text-gray-500">(127 reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Button for confirmed passengers */}
                  {!isDriverView && existingBooking?.status === 'confirmed' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message Driver
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

                  {/* Driver Chat for driver view */}
                  {isDriverView && (
                    <Dialog open={showDriverChat} onOpenChange={setShowDriverChat}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat with Passengers
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
                </CardContent>
              </Card>
            </Link>

            {/* Price and Booking Card */}
            <Card className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
              <CardContent className="p-6 space-y-4">
                {/* Price Display */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">Price per seat</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {ride.price_per_seat > 0 ? `₹${ride.price_per_seat}` : 'Free'}
                    </span>
                  </div>
                </div>

                {/* Available Seats */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">Available seats</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{ride.available_seats}</span>
                  </div>
                </div>

                <Separator />

                {/* Request Button */}
                <RideRequestButton
                  ride={ride}
                  existingBooking={existingBooking}
                  onShowAuth={() => setShowAuthDialog(true)}
                />

                {/* Completed Ride Review */}
                {existingBooking && (
                  <CompletedRideReview ride={ride} booking={existingBooking} />
                )}
              </CardContent>
            </Card>

            {/* Calendar Card */}
            <Card className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Never miss your ride</h3>
                <CalendarButton
                  ride={ride}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-105"
                />
              </CardContent>
            </Card>

            {/* Driver's Confirmed Passengers Section */}
            {isDriverView && (
              <Card className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-900">
                    <Users className="h-5 w-5" />
                    Confirmed Passengers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ConfirmedPassengers
                    rideId={ride.id}
                    onMessagePassenger={handleMessagePassenger}
                  />
                </CardContent>
              </Card>
            )}

            {/* Security Card */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-green-900">Secure & Safe</h3>
                </div>
                <div className="space-y-2 text-sm text-green-800">
                  <p>✓ Verified drivers only</p>
                  <p>✓ Secure payment processing</p>
                  <p>✓ 24/7 customer support</p>
                  <p>✓ Full refund if cancelled</p>
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
