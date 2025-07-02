
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';

interface EventCardProps {
  event: any;
}

export function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleJoinEvent = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
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
              
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {event.participant_count || 0} attending
                  </p>
                  <p className="text-xs text-gray-500">Participants</p>
                </div>
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
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Join Event
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
