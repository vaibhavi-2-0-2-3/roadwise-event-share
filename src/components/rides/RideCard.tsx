
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, DollarSign, Star, Navigation, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RideCardProps {
  ride: any;
}

export function RideCard({ ride }: RideCardProps) {
  const isExpired = new Date(ride.departure_time) < new Date();
  const departureDate = new Date(ride.departure_time);

  return (
    <Card className="shadow-sm border hover:shadow-md transition-all duration-300 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Left Side - Route and Time */}
          <div className="flex-1 space-y-4">
            {/* Time */}
            <div className="text-lg font-semibold">
              Today at {departureDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            
            {/* Route */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">{ride.origin}</div>
                  <div className="text-sm text-gray-500">Pickup location</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-6">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <div className="font-medium">{ride.destination}</div>
                  <div className="text-sm text-gray-500">Drop-off location</div>
                </div>
              </div>
            </div>

            {/* See route on map button */}
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
              <Navigation className="h-4 w-4 mr-2" />
              See route on map
            </Button>
          </div>

          {/* Center - Driver Info */}
          <div className="flex flex-col items-center space-y-3">
            <Link 
              to={`/profile/${ride.driver_id}`}
              className="flex flex-col items-center hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={ride.profiles?.image_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                  {ride.profiles?.name?.charAt(0) || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center mt-2">
                <div className="font-medium">{ride.profiles?.name}</div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Side - Booking Info */}
          <div className="flex flex-col items-end space-y-4 min-w-[200px]">
            <div className="text-right">
              <div className="text-sm text-gray-500">1 seat available</div>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={ride.profiles?.image_url} />
                  <AvatarFallback className="text-xs">
                    {ride.profiles?.name?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{ride.profiles?.name}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Price per seat</div>
              {ride.price_per_seat > 0 ? (
                <div className="text-2xl font-bold">
                  ${ride.price_per_seat}
                </div>
              ) : (
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-800">
                  Free
                </Badge>
              )}
            </div>

            <Link to={`/rides/${ride.id}`} className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start booking
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Row - Preferences */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-green-600">
            <span className="text-sm">✓ Music</span>
          </div>
          <div className="flex items-center gap-2 text-red-600">
            <span className="text-sm">✗ Pets</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <span className="text-sm">✓ Children</span>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            <Users className="h-4 w-4 inline mr-1" />
            {ride.available_seats} seats left
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
