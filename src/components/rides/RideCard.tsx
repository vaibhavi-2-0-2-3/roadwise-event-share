
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, Users, DollarSign, Calendar, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { RideStatusButton } from './RideStatusButton';

interface RideCardProps {
  ride: any;
}

export function RideCard({ ride }: RideCardProps) {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleBookRide = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
  };

  const isExpired = new Date(ride.departure_time) < new Date();

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
        <CardContent className="p-0">
          {/* Header with status */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                  <AvatarImage src={ride.profiles?.image_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                    {ride.profiles?.name?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{ride.profiles?.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Driver
                    </Badge>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <Badge 
                  variant={ride.status === 'active' && !isExpired ? 'default' : 'secondary'}
                  className={`${ride.status === 'completed' ? 'bg-green-100 text-green-800' : ''}`}
                >
                  {ride.status === 'completed' ? 'Completed' : isExpired ? 'Expired' : 'Active'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Route */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  {ride.origin}
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
                <div className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  {ride.destination}
                  <div className="w-3 h-3 bg-red-500 rounded-full ml-3"></div>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(ride.departure_time).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">Date</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Time</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ride.available_seats} of {ride.seats}
                  </p>
                  <p className="text-xs text-gray-500">Seats available</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
                  <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ride.price_per_seat > 0 ? `$${ride.price_per_seat}` : 'Free'}
                  </p>
                  <p className="text-xs text-gray-500">Per seat</p>
                </div>
              </div>
            </div>

            {/* Event badge */}
            {ride.events && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    Going to {ride.events.title}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Link to={`/rides/${ride.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
              
              {ride.available_seats > 0 && ride.status === 'active' && !isExpired && (
                <Button 
                  onClick={handleBookRide} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Book Ride
                </Button>
              )}
              
              <RideStatusButton ride={ride} />
            </div>
          </div>
        </CardContent>
      </Card>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
