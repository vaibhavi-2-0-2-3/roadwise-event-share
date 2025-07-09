
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, ArrowRight, Heart, Check, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EventCardProps {
  event: any;
}

export function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const queryClient = useQueryClient();

  // Check if user is already going to this event
  const { data: isGoing } = useQuery({
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
    enabled: !!user
  });

  // Get participant count
  const { data: participantCount } = useQuery({
    queryKey: ['event-participants-count', event.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Get rides count for this event
  const { data: ridesCount } = useQuery({
    queryKey: ['event-rides-count', event.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Join/Leave event mutation
  const joinEventMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      if (isGoing) {
        // Leave event
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Join event
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: event.id,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-participant', event.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['event-participants-count', event.id] });
      toast.success(isGoing ? 'No longer interested' : 'Marked as interested!');
    },
    onError: (error) => {
      toast.error('Failed to update interest');
      console.error('Error updating event participation:', error);
    }
  });

  const handleJoinEvent = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    joinEventMutation.mutate();
  };

  const isUpcoming = new Date(event.event_date) > new Date();

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-0">
          {/* Image header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4">
              <Badge variant={isUpcoming ? 'default' : 'secondary'} className="bg-white/90 text-gray-900">
                {isUpcoming ? 'Upcoming' : 'Past'}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>

            {/* Event details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.event_date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                  <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.location}
                  </p>
                  <p className="text-xs text-gray-500">Location</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {participantCount || 0} interested
                    </p>
                    <p className="text-xs text-gray-500">Participants</p>
                  </div>
                </div>
                
                {ridesCount !== undefined && ridesCount > 0 && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                      <Car className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {ridesCount} rides
                      </p>
                      <p className="text-xs text-gray-500">Available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link to={`/events/${event.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
              
              {isUpcoming && (
                <Button 
                  onClick={handleJoinEvent}
                  disabled={joinEventMutation.isPending}
                  className={`flex-1 ${
                    isGoing 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {joinEventMutation.isPending ? (
                    'Loading...'
                  ) : isGoing ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Interested
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-1" />
                      I'm Interested
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
