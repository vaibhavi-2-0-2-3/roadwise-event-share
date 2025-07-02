
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Clock, Users, DollarSign, Calendar, MessageCircle, Star, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RideChat } from './RideChat';
import { DriverReviews } from './DriverReviews';
import { toast } from 'sonner';

interface RideDetailsDialogProps {
  ride: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RideDetailsDialog({ ride, open, onOpenChange }: RideDetailsDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [seatsToBook, setSeatsToBook] = useState(1);

  const { data: existingBooking } = useQuery({
    queryKey: ['user-booking', ride.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('ride_id', ride.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && open
  });

  const bookRideMutation = useMutation({
    mutationFn: async (seats: number) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          ride_id: ride.id,
          seats_booked: seats
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('🎉 Ride booked successfully! The driver has been notified.');
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['user-booking'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to book ride');
      console.error('Error booking ride:', error);
    }
  });

  const handleBookRide = () => {
    bookRideMutation.mutate(seatsToBook);
  };

  const canBookRide = user && !existingBooking && ride.available_seats > 0 && user.id !== ride.driver_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Ride Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver & Route Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={ride.profiles?.image_url} />
                    <AvatarFallback className="text-lg">
                      {ride.profiles?.name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{ride.profiles?.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Driver</p>
                    <div className="flex items-center mt-1">
                      <Shield className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Verified Driver</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {ride.price_per_seat > 0 ? (
                    <div className="text-2xl font-bold text-green-600">
                      ${ride.price_per_seat}
                      <span className="text-sm font-normal text-gray-600">/seat</span>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      Free Ride
                    </Badge>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">{ride.origin} → {ride.destination}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Route</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(ride.departure_time).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Departure Date</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Departure Time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">{ride.available_seats} of {ride.seats} seats available</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Availability</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Badge */}
              {ride.events && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
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

              {/* Booking Section */}
              {canBookRide && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold mb-3 text-green-800 dark:text-green-200">Book This Ride</h4>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="text-sm font-medium">Seats to book:</label>
                      <select 
                        value={seatsToBook} 
                        onChange={(e) => setSeatsToBook(Number(e.target.value))}
                        className="ml-2 px-3 py-1 border rounded-md"
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
                    >
                      {bookRideMutation.isPending ? 'Booking...' : `Book ${seatsToBook} Seat${seatsToBook > 1 ? 's' : ''}`}
                      {ride.price_per_seat > 0 && (
                        <span className="ml-2">
                          (${(ride.price_per_seat * seatsToBook).toFixed(2)})
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {existingBooking && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      You've already booked {existingBooking.seats_booked} seat(s) for this ride
                    </span>
                  </div>
                  <Badge className="mt-2 bg-blue-500">
                    Status: {existingBooking.status}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Chat and Reviews */}
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reviews">
                <Star className="h-4 w-4 mr-2" />
                Driver Reviews
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ride Chat
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <DriverReviews driverId={ride.driver_id} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chat" className="mt-6">
              {user && (existingBooking || user.id === ride.driver_id) ? (
                <Card>
                  <CardContent className="p-0">
                    <RideChat rideId={ride.id} driverId={ride.driver_id} />
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Book to start chatting</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Book this ride to chat with the driver and coordinate your trip
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
