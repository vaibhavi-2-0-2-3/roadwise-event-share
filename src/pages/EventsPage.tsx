
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, Users, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', searchTerm],
    queryFn: async () => {
      let query = supabase.from('events').select('*').order('event_date', { ascending: true });
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Past', color: 'bg-gray-500' };
    if (diffDays === 0) return { label: 'Today', color: 'bg-red-500' };
    if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-orange-500' };
    if (diffDays <= 7) return { label: 'This Week', color: 'bg-blue-500' };
    return { label: 'Upcoming', color: 'bg-green-500' };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover Events</h1>
            <p className="text-gray-600 dark:text-gray-400">Find exciting events and connect with fellow attendees</p>
          </div>
          <Button className="md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search events by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const status = getEventStatus(event.event_date);
            return (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group shadow-md border-0">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        <span>View Details</span>
                      </div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Learn More →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'No events are currently available'}
          </p>
          <Button>Create the First Event</Button>
        </div>
      )}
    </div>
  );
}
