
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Clock, Users, DollarSign, Calendar } from 'lucide-react';
import { RideDetailsDialog } from './RideDetailsDialog';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';

interface RideCardProps {
  ride: any; // Complex type with joins
}

export function RideCard({ ride }: RideCardProps) {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleBookRide = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setShowDetails(true);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {ride.profiles?.image_url ? (
                    <img 
                      src={ride.profiles.image_url} 
                      alt={ride.profiles.name} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{ride.profiles?.name}</p>
                  <p className="text-sm text-gray-500">Driver</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{ride.origin} → {ride.destination}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(ride.departure_time).toLocaleDateString()} at{' '}
                    {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{ride.available_seats} seats available</span>
                </div>
                
                {ride.price_per_seat > 0 && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>${ride.price_per_seat} per seat</span>
                  </div>
                )}
              </div>

              {ride.events && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <Badge variant="secondary">
                    Going to {ride.events.title}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Button onClick={handleBookRide} disabled={ride.available_seats === 0}>
                {ride.available_seats === 0 ? 'Fully Booked' : 'Book Ride'}
              </Button>
              <Button variant="outline" onClick={() => setShowDetails(true)}>
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RideDetailsDialog 
        ride={ride} 
        open={showDetails} 
        onOpenChange={setShowDetails} 
      />

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
