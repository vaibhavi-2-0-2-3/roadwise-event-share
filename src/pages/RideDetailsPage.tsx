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
import { CompletedRideReview } from '@/components/rides/CompletedRideReview';
import { PendingRequests } from '@/components/rides/PendingRequests';
import { ConfirmedPassengers } from '@/components/rides/ConfirmedPassengers';
import { RideChat } from '@/components/rides/RideChat';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { RideStatusButton } from '@/components/rides/RideStatusButton';
import banner from '@/assets/details-banner-img.png';
import { ChevronDown, ChevronUp, Car } from 'lucide-react';
import RideLiveTracker from '@/components/liveTracking/RideLiveTracker';


export default function RideDetailsPage() {
  const { rideId } = useParams();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [open, setOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Banner with Illustration */}
      <div
        className="relative bg-cover bg-center bg-no-repeat border-b border-border/50"
        style={{
          backgroundImage: `url(${banner})`,
          height: '220px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/50 dark:from-black/80 dark:via-black/60 dark:to-black/40" />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col items-start">
            <Link
              to="/rides"
              className="inline-flex items-center gap-2 text hover:text-foreground mb-3 font-medium transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to rides
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
              Ride Details
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about this journey
            </p>
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                currentUserId={user.id}
                participants={[
                  { userId: ride.driver_id, name: ride.profiles?.name, rideId: ride.id },
                  ...(existingBooking?.status === 'confirmed'
                    ? [{ userId: user.id, name: user.user_metadata?.full_name || user.email, rideId: ride.id }]
                    : []
                  )
                ]}
              />
            )}



            {/* Ride Details Card */}
            <Card className="border border-black bg-white text-black shadow-none rounded-none">
              <CardHeader className="border-b border-black px-6 py-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <Navigation className="h-5 w-5" />
                  Journey Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 p-6">
                {/* Journey Summary */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-base">
                  {/* Origin */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-black" />
                    <div>
                      <p className="text-sm uppercase text-muted-foreground font-medium">From</p>
                      <p className="text-lg font-bold">{ride.origin}</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center w-full my-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <div className="h-1 w-6 bg-dotted-line bg-repeat-x bg-center" />
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div className="h-1 w-6 bg-dotted-line bg-repeat-x bg-center" />
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-full my-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <div className="h-1 w-6 bg-dotted-line bg-repeat-x bg-center" />
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div className="h-1 w-6 bg-dotted-line bg-repeat-x bg-center" />
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-black" />
                    <div>
                      <p className="text-sm uppercase text-muted-foreground font-medium">To</p>
                      <p className="text-lg font-bold">{ride.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Departure Info */}
                <div className="flex items-center gap-3 pt-2 border-t border-dashed border-muted">
                  <Clock className="h-5 w-5 text-black" />
                  <div>
                    <p className="text-sm uppercase text-muted-foreground font-medium mb-1">Departure</p>
                    <p className="text-base font-semibold text-black">
                      {new Date(ride.departure_time).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xl font-bold text-black">
                      {new Date(ride.departure_time).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>

                {/* Route Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border border-black rounded-none h-12 text-base font-semibold hover:bg-muted"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/${encodeURIComponent(ride.origin)}/${encodeURIComponent(ride.destination)}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  View Full Route on Google Maps
                </Button>
              </CardContent>
            </Card>











          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Calendar */}
            <Card className="bg-white dark:bg-black border border-black dark:border-white rounded-none shadow-none w-full max-w-xs">
              <CardContent className="p-3 text-center space-y-2">
                <h3 className="text-base font-bold text-black dark:text-white">Never miss your ride</h3>

                <CalendarButton
                  ride={ride}
                  className="mt-2 bg-white text-black text-xs font-semibold py-1 px-3 border border-black rounded-none hover:bg-[#ff4da3] hover:text-white transition-all"
                />

              </CardContent>
            </Card>


            {/* Price and Booking */}
            <Card
              className="border border-dashed border-black bg-white text-black rounded-none transition-all duration-200"
            >
              <CardContent className="p-4 space-y-6">
                {/* Price Card */}
                <div className="flex items-center justify-between p-3 border border-black bg-white rounded-none transition-all duration-200 hover:border-2 hover:border-[#ff4da3]">

                  <div className="flex items-center gap-2">
                    <div className="p-1 border border-black">
                      <span className="text-sm font-bold">₹</span>
                    </div>
                    <span className="text-sm font-semibold">Price per seat</span>
                  </div>
                  <span className="text-lg font-bold">
                    {ride.price_per_seat > 0 ? `₹${ride.price_per_seat}` : 'Free'}
                  </span>
                </div>

                {/* Seats Available */}
                <div className="flex items-center justify-between p-3 border border-black bg-white rounded-none transition-all duration-200 hover:border-2 hover:border-[#ff4da3]">

                  <div className="flex items-center gap-2">
                    <div className="p-1 border border-black">
                      <Users className="h-4 w-4 text-black" />
                    </div>
                    <span className="text-sm font-semibold">Available seats</span>
                  </div>
                  <span className="text-lg font-bold">{ride.available_seats}</span>
                </div>

                {/* Dashed Line Separator */}
                <div className="border-t border-dashed border-black my-2" />

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



            {/* Driver Card */}
            <Card className="border border-black bg-white text-black shadow-none rounded-none">
              <CardHeader className="border-b border-black px-6 py-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  Your Driver
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border border-black">
                        <AvatarImage src={ride.profiles?.image_url} />
                        <AvatarFallback className="bg-black text-white text-lg font-bold">
                          {ride.profiles?.name?.charAt(0) || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">{ride.profiles?.name}</h3>
                      <p className="text-sm text-muted-foreground">Verified Driver</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded-full">
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-700">4.8</span>
                        </div>
                        <span className="text-xs text-muted-foreground">(127 reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons on the Right */}
                  <div className="flex flex-col gap-2 items-end">
                    {isDriverView ? (
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
                    ) : (
                      existingBooking?.status === 'confirmed' && (
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
                      )
                    )}

                    <Link to={`/profile/${ride.driver_id}`}>
                      <Button variant="secondary" size="sm" className="rounded-md">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>







            {/* Driver's Confirmed Passengers Section */}

            {isDriverView && (
              <>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-black">
                  <Users className="h-5 w-5" />
                  Confirmed Passengers
                </CardTitle>
                <ConfirmedPassengers
                  rideId={ride.id}
                  onMessagePassenger={handleMessagePassenger}
                />

              </>
            )}

            {/* Secure Payment Info */}
            <Card className="border border-black bg-white text-black shadow-none p-4 rounded-none space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-bold text-base">Secure Online Payment</h3>
                </div>
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>

              {open && (
                <div className="text-sm space-y-4 pt-1">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Payment</span>
                    <p className="text-muted-foreground">
                      The money is first transferred to the driver 24 hours after ride departure.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Guarantee</span>
                    <p className="text-muted-foreground">
                      If the ride is cancelled, we will automatically delete your payment.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Secure</span>
                    <p className="text-muted-foreground">
                      See ratings and reviews before you book.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
