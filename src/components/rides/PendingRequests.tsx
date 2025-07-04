import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingRequestsProps {
  rideId: string;
}

export function PendingRequests({ rideId }: PendingRequestsProps) {
  const queryClient = useQueryClient();
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);

  const { data: pendingRequests, isLoading } = useQuery({
    queryKey: ['pending-requests', rideId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          seats_booked,
          created_at,
          profiles:user_id (
            id,
            name,
            image_url
          )
        `)
        .eq('ride_id', rideId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const handleRequestMutation = useMutation({
    mutationFn: async ({
      bookingId,
      user_id,
      status
    }: {
      bookingId: string;
      user_id: string;
      status: 'confirmed' | 'cancelled';
    }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      return { bookingId, user_id, status };
    },
    onSuccess: ({ bookingId, user_id, status }) => {
      if (status === 'confirmed') {
        setAcceptedIds(prev => [...prev, bookingId]);
        toast.success('✅ Request accepted!');
      } else {
        toast.success('❌ Request rejected');
      }

      queryClient.invalidateQueries({ queryKey: ['pending-requests', rideId] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['ride-details'] });
      queryClient.invalidateQueries({ queryKey: ['user-booking', rideId, user_id] });
    },
    onError: () => {
      toast.error('Failed to update request');
    }
  });

  const handleAccept = (bookingId: string, user_id: string) => {
    handleRequestMutation.mutate({ bookingId, user_id, status: 'confirmed' });
  };

  const handleReject = (bookingId: string, user_id: string) => {
    handleRequestMutation.mutate({ bookingId, user_id, status: 'cancelled' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No pending requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Pending Requests ({pendingRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.map((request) => {
          const isAccepted = acceptedIds.includes(request.id);

          return (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.profiles?.image_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {request.profiles?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{request.profiles?.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Badge variant="secondary">
                      {request.seats_booked} seat{request.seats_booked > 1 ? 's' : ''}
                    </Badge>
                    <span>•</span>
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {!isAccepted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request.id, request.user_id)}
                    disabled={handleRequestMutation.isPending}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => !isAccepted && handleAccept(request.id, request.user_id)}
                  disabled={handleRequestMutation.isPending || isAccepted}
                  className={isAccepted ? 'bg-green-100 text-green-700 cursor-default' : 'bg-green-600 hover:bg-green-700'}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {isAccepted ? 'Accepted' : 'Accept'}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
