import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, MapPin, Clock, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface EventWallProps {
  eventId: string;
}

interface RideRequest {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: {
    name: string;
    image_url?: string;
  };
}

export function EventWall({ eventId }: EventWallProps) {
  const { user } = useAuth();
  const [newRequest, setNewRequest] = useState('');
  const queryClient = useQueryClient();

  const { data: rideRequests, isLoading } = useQuery({
    queryKey: ['event-wall', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles!messages_sender_id_fkey (
            name,
            image_url
          )
        `)
        .eq('event_id', eventId)
        .is('ride_id', null)
        .is('receiver_id', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RideRequest[];
    }
  });

  const postRequestMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          event_id: eventId,
          sender_id: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-wall', eventId] });
      setNewRequest('');
    }
  });

  const handlePostRequest = () => {
    if (!newRequest.trim()) return;
    postRequestMutation.mutate(newRequest);
  };

  return (
    <div className="space-y-6">
      {/* Post new request */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Post a Ride Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Ask for a ride or share ride plans... e.g., 'Anyone leaving around 6 PM from Margao?' or 'Need a ride from Mapusa.'"
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handlePostRequest}
              disabled={!newRequest.trim() || postRequestMutation.isPending}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {postRequestMutation.isPending ? 'Posting...' : 'Post Request'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ride requests */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rideRequests && rideRequests.length > 0 ? (
          rideRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.profiles?.image_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {request.profiles?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{request.profiles?.name}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {request.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No ride requests yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {user 
                  ? 'Be the first to post a ride request!' 
                  : 'Join this event to see and post ride requests.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}