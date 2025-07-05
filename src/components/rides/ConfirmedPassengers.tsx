
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface ConfirmedPassengersProps {
  rideId: string;
  onMessagePassenger?: (passengerId: string, passengerName: string) => void;
}

export function ConfirmedPassengers({ rideId, onMessagePassenger }: ConfirmedPassengersProps) {
  const { data: confirmedPassengers, isLoading } = useQuery({
    queryKey: ['confirmed-passengers', rideId],
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
        .eq('status', 'confirmed')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Confirmed Passengers
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

  if (!confirmedPassengers || confirmedPassengers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Confirmed Passengers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No confirmed passengers yet</p>
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
          Confirmed Passengers ({confirmedPassengers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {confirmedPassengers.map((passenger) => (
          <div
            key={passenger.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={passenger.profiles?.image_url} />
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  {passenger.profiles?.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{passenger.profiles?.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {passenger.seats_booked} seat{passenger.seats_booked > 1 ? 's' : ''}
                  </Badge>
                  <span>•</span>
                  <span>Confirmed {new Date(passenger.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {onMessagePassenger && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMessagePassenger(passenger.user_id, passenger.profiles?.name || 'Passenger')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              )}
              <Link to={`/profile/${passenger.user_id}`}>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
