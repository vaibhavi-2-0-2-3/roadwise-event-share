import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ConfirmedPassengers({ rideId, onMessagePassenger }) {
  const { data: passengers, isLoading } = useQuery({
    queryKey: ['confirmed-passengers', rideId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, seats_booked, payment_status,
          profiles (
            id, name, image_url
          )
        `)
        .eq('ride_id', rideId)
        .eq('status', 'confirmed');

      if (error) throw error;
      return data;
    },
    enabled: !!rideId
  });

  if (isLoading) return <p>Loading passengers...</p>;
  if (!passengers || passengers.length === 0) return <p>No confirmed passengers yet.</p>;

  return (
    <div className="space-y-4">
      {passengers.map((passenger: any) => (
        <Card key={passenger.id} className="flex items-center justify-between p-4 shadow-sm rounded-lg">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={passenger.profiles?.image_url} />
              <AvatarFallback>{passenger.profiles?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{passenger.profiles?.name}</p>
              <p className="text-sm text-gray-500">Seats: {passenger.seats_booked}</p>
            </div>
          </div>

          {/* ✅ Show payment status */}
          <div>
            {passenger.payment_status === 'paid' ? (
              <Badge variant="default">Paid</Badge>
            ) : passenger.payment_status === 'refunded' ? (
              <Badge variant="secondary">Refunded</Badge>
            ) : (
              <Badge variant="destructive">Unpaid</Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
