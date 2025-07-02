
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { EventDetailsDialog } from './EventDetailsDialog';
import { Tables } from '@/integrations/supabase/types';

interface EventCardProps {
  event: Tables<'events'>;
}

export function EventCard({ event }: EventCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader>
          <CardTitle className="text-lg">{event.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(event.event_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3 line-clamp-2">
            {event.description}
          </p>
          <Button className="w-full mt-4" onClick={(e) => {
            e.stopPropagation();
            setShowDetails(true);
          }}>
            <Users className="h-4 w-4 mr-2" />
            View Carpools
          </Button>
        </CardContent>
      </Card>

      <EventDetailsDialog 
        event={event} 
        open={showDetails} 
        onOpenChange={setShowDetails} 
      />
    </>
  );
}
