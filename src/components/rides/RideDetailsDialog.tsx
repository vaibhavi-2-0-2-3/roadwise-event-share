
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Clock, Users, DollarSign, Calendar, MessageCircle, Star } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { RideChat } from './RideChat';
import { DriverReviews } from './DriverReviews';

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
    queryKey: ['booking', ride.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('ride_id', ride.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
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
          seats_booked: seats,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ride booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
    onError: (error) => {
      toast.error('Failed to book ride');
      console.error('Error booking ride:', error);
    }
  });

  const handleBookRide = () => {
    bookRideMutation.mutate(seatsToBook);
  };

  const isOwnRide = user?.id === ride.driver_id;
  const canBook = user && !isOwnRide && !existingBooking && ride.available_seats > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ride Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              {ride.profiles?.image_url ? (
                <img 
                  src={ride.profiles.image_url} 
                  alt={ride.profiles.name} 
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <User className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">{ride.profiles?.name}</h3>
              <p className="text-sm text-gray-500">Driver</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Route</p>
                  <p className="text-sm">{ride.origin} → {ride.destination}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Departure</p>
                  <p className="text-sm">
                    {new Date(ride.departure_time).toLocaleDateString()} at{' '}
                    {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">Available Seats</p>
                  <p className="text-sm">{ride.available_seats} of {ride.seats}</p>
                </div>
              </div>
              
              {ride.price_per_seat > 0 && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-medium">Price per Seat</p>
                    <p className="text-sm">${ride.price_per_seat}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {ride.events && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <Badge variant="secondary" className="text-sm">
                Going to {ride.events.title} at {ride.events.location}
              </Badge>
            </div>
          )}

          {canBook && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium mb-3">Book this ride</h4>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="text-sm font-medium">Seats to book:</label>
                  <select
                    value={seatsToBook}
                    onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                    className="ml-2 px-3 py-1 border rounded"
                  >
                    {Array.from({ length: Math.min(ride.available_seats, 4) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleBookRide} disabled={bookRideMutation.isPending}>
                  {bookRideMutation.isPending ? 'Booking...' : `Book ${seatsToBook} seat${seatsToBook > 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          )}

          {existingBooking && (
            <div className="border rounded-lg p-4 bg-green-50">
              <p className="text-green-800 font-medium">
                ✓ You have booked {existingBooking.seats_booked} seat{existingBooking.seats_booked > 1 ? 's' : ''} for this ride
              </p>
              <p className="text-sm text-green-600 mt-1">
                Status: {existingBooking.status}
              </p>
            </div>
          )}

          <Tabs defaultValue="chat" className="w-full">
            <TabsList>
              <TabsTrigger value="chat">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with Driver
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="h-4 w-4 mr-2" />
                Driver Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat">
              {user && (existingBooking || isOwnRide) ? (
                <RideChat rideId={ride.id} driverId={ride.driver_id} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Book this ride to chat with the driver</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews">
              <DriverReviews driverId={ride.driver_id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
