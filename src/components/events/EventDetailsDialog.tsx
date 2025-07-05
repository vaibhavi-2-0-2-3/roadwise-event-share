
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, MessageCircle, Plus, Clock, Car, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { RideCard } from '@/components/rides/RideCard';
import { CreateRideDialog } from '@/components/rides/CreateRideDialog';
import { EventChat } from './EventChat';
import { EventWall } from './EventWall';
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

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const diffTime = eventTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Past Event', color: 'bg-gray-500' };
    if (diffDays === 0) return { label: 'Today', color: 'bg-red-500' };
    if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-orange-500' };
    if (diffDays <= 7) return { label: 'This Week', color: 'bg-blue-500' };
    return { label: 'Upcoming', color: 'bg-green-500' };
  };

  const status = getEventStatus(event.event_date);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2">{event.title}</DialogTitle>
                <Badge className={`${status.color} text-white mb-2`}>
                  {status.label}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Event Image */}
            <div className="aspect-video relative overflow-hidden rounded-xl">
              <img
                src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Event Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Date & Time</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.event_date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Location</h4>
                  <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border">
                <h4 className="font-semibold mb-3">About This Event</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!isParticipant && (
                <Button onClick={handleJoinEvent} size="lg" className="flex-1 md:flex-none">
                  <Users className="h-4 w-4 mr-2" />
                  Join Event
                </Button>
              )}
              <Button onClick={handleOfferRide} variant="outline" size="lg" className="flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                Offer a Ride
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="rides" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rides" className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Rides ({rides?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="wall" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ride Wall
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Group Chat
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="rides" className="space-y-4 mt-6">
                {ridesLoading ? (
                  <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : rides && rides.length > 0 ? (
                  <div className="grid gap-4">
                    {rides.map((ride) => (
                      <RideCard key={ride.id} ride={ride} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No rides available yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Be the first to offer a ride to this amazing event!
                    </p>
                    <Button onClick={handleOfferRide}>
                      <Plus className="h-4 w-4 mr-2" />
                      Offer the First Ride
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="wall" className="mt-6">
                <EventWall eventId={event.id} />
              </TabsContent>
              
              <TabsContent value="chat" className="mt-6">
                {user && isParticipant ? (
                  <div className="bg-white dark:bg-gray-900 rounded-lg border">
                    <EventChat eventId={event.id} />
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Join the conversation</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {user ? 'Join this event to participate in the group chat' : 'Sign in and join this event to chat with other attendees'}
                    </p>
                    {!user ? (
                      <Button onClick={() => setShowAuthDialog(true)}>
                        Sign In to Join
                      </Button>
                    ) : (
                      <Button onClick={handleJoinEvent}>
                        <Users className="h-4 w-4 mr-2" />
                        Join Event
                      </Button>
                    )}
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
