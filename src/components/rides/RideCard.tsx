
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, DollarSign, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RideCardProps {
  ride: any;
}

export function RideCard({ ride }: RideCardProps) {
  const isExpired = new Date(ride.departure_time) < new Date();
  const departureDate = new Date(ride.departure_time);

  return (
    <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with driver info */}
          <div className="flex items-center justify-between">
            <Link 
              to={`/profile/${ride.driver_id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={ride.profiles?.image_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {ride.profiles?.name?.charAt(0) || 'D'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{ride.profiles?.name}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">4.8 (127)</span>
                </div>
              </div>
            </Link>
            
            <div className="text-right">
              {ride.price_per_seat > 0 ? (
                <div className="text-xl font-bold text-green-600">
                  ${ride.price_per_seat}
                  <span className="text-sm font-normal text-gray-600">/seat</span>
                </div>
              ) : (
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-800">
                  Free
                </Badge>
              )}
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-sm">{ride.origin}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="font-medium text-sm">{ride.destination}</span>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>

          {/* Trip details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{departureDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {departureDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm">{ride.available_seats} seats left</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              <Badge variant={ride.status === 'active' && !isExpired ? 'default' : 'secondary'} className="text-xs">
                {ride.status === 'completed' ? 'Completed' : 
                 isExpired ? 'Expired' : 
                 ride.status}
              </Badge>
            </div>
          </div>

          {/* Event badge */}
          {ride.events && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Going to {ride.events.title}
                </span>
              </div>
            </div>
          )}

          {/* Action button */}
          <Link to={`/rides/${ride.id}`}>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:scale-[1.02] transition-transform"
              size="lg"
            >
              View Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
