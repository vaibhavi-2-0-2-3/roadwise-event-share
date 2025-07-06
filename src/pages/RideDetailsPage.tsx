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
import rideHeroIllustration from '@/assets/ride-hero-illustration.svg';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Banner with Illustration */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/50">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Link to="/rides" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-medium transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to rides
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground/90 mb-2">Ride Details</h1>
              <p className="text-muted-foreground text-lg">Everything you need to know about this journey</p>
            </div>
            <div className="hidden md:block">
              <img src={rideHeroIllustration} alt="Ride illustration" className="w-32 h-32 opacity-60" />
            </div>
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
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Navigation className="h-6 w-6 text-primary" />
                  </div>
                  Journey Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                {/* From Location */}
                <div className="relative flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/30"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Departure Point</p>
                      <p className="font-bold text-xl text-emerald-900 dark:text-emerald-100">{ride.origin}</p>
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
                <div className="relative flex items-center justify-between p-6 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 rounded-2xl border border-rose-200/50 dark:border-rose-800/30">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-4 h-4 bg-rose-500 rounded-full shadow-lg shadow-rose-500/30"></div>
                      <div className="absolute -inset-1 w-6 h-6 border-2 border-rose-500 rounded-full opacity-30"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-rose-700 dark:text-rose-300 uppercase tracking-wide">Destination</p>
                      <p className="font-bold text-xl text-rose-900 dark:text-rose-100">{ride.destination}</p>
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

                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-rose-500 opacity-30"></div>
                </div>

                {/* Departure Info */}
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">Departure Schedule</p>
                    <p className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                      {new Date(ride.departure_time).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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
                    <Button variant="outline" className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all group">
                      <Navigation className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                      View Full Route on Google Maps
                    </Button>
                  }
                />
              </CardContent>
            </Card>

            {/* Driver Card */}
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  Your Driver
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-accent/5 to-primary/5 hover:from-accent/10 hover:to-primary/10 transition-all duration-300 border border-accent/20 hover:border-accent/40 hover:shadow-lg group">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <AvatarImage src={ride.profiles?.image_url} />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-white text-2xl font-bold">
                        {ride.profiles?.name?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">{ride.profiles?.name}</h3>
                    <p className="text-muted-foreground font-medium">Verified Driver</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">4.8</span>
                      </div>
                      <span className="text-sm text-muted-foreground">(127 reviews)</span>
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
          <div className="space-y-8">
            {/* Calendar */}
            <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-foreground/90 mb-2">Add to Calendar</h3>
                  <p className="text-sm text-muted-foreground">Never miss your ride</p>
                </div>
                <CalendarButton ride={ride} />
              </CardContent>
            </Card>

            {/* Price and Booking */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm ring-1 ring-primary/10">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200/50 dark:border-green-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-lg font-medium">Price per seat</span>
                  </div>
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {ride.price_per_seat > 0 ? `$${ride.price_per_seat}` : 'Free'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-lg font-medium">Available seats</span>
                  </div>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{ride.available_seats}</span>
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
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm ring-1 ring-green-200/50 dark:ring-green-800/30">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-xl text-green-800 dark:text-green-200">100% Secure</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shadow-lg shadow-green-500/30"></div>
                    <span className="text-green-700 dark:text-green-300 font-medium">Bank-grade encryption for all transactions</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shadow-lg shadow-green-500/30"></div>
                    <span className="text-green-700 dark:text-green-300 font-medium">Full refund protection guarantee</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shadow-lg shadow-green-500/30"></div>
                    <span className="text-green-700 dark:text-green-300 font-medium">Cancel free up to 24 hours before</span>
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
