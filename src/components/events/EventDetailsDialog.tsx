
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, MessageCircle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { RideCard } from '@/components/rides/RideCard';
import { CreateRideDialog } from '@/components/rides/CreateRideDialog';
import { EventChat } from './EventChat';
import { AuthDialog } from '@/components/auth/AuthDialog';

interface EventDetailsDialogProps {
  event: Tables<'events'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
  const { user } = useAuth();
  const [showCreateRide, setShowCreateRide] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const { data: rides, isLoading: ridesLoading } = useQuery({
    queryKey: ['event-rides', event.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (
            id,
            name,
            image_url
          )
        `)
        .eq('event_id', event.id)
        .eq('status', 'active')
        .order('departure_time', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: open
  });

  const { data: isParticipant } = useQuery({
    queryKey: ['event-participant', event.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && open
  });

  const handleJoinEvent = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    const { error } = await supabase
      .from('event_participants')
      .insert({
        event_id: event.id,
        user_id: user.id
      });

    if (error) {
      console.error('Error joining event:', error);
    }
  };

  const handleOfferRide = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setShowCreateRide(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img
                src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3" />
                <div>
                  <p className="font-medium">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm">
                    {new Date(event.event_date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3" />
                <p>{event.location}</p>
              </div>
            </div>

            <p className="text-gray-700">{event.description}</p>

            <div className="flex flex-wrap gap-3">
              {!isParticipant && (
                <Button onClick={handleJoinEvent} variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Join Event
                </Button>
              )}
              <Button onClick={handleOfferRide}>
                <Plus className="h-4 w-4 mr-2" />
                Offer a Ride
              </Button>
            </div>

            <Tabs defaultValue="rides" className="w-full">
              <TabsList>
                <TabsTrigger value="rides">Available Rides</TabsTrigger>
                <TabsTrigger value="chat">Event Chat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rides" className="space-y-4">
                {ridesLoading ? (
                  <div>Loading rides...</div>
                ) : rides && rides.length > 0 ? (
                  <div className="grid gap-4">
                    {rides.map((ride) => (
                      <RideCard key={ride.id} ride={ride} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rides available for this event yet.</p>
                    <p className="text-sm">Be the first to offer a ride!</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="chat">
                {user && isParticipant ? (
                  <EventChat eventId={event.id} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Join the event to participate in the chat</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <CreateRideDialog
        open={showCreateRide}
        onOpenChange={setShowCreateRide}
        eventId={event.id}
        eventTitle={event.title}
        eventLocation={event.location}
      />

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
