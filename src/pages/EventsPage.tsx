
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, MapPin, Users, Plus, Clock, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedBanner } from '@/components/shared/AnimatedBanner';

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

  // Get participant counts for all events
  const { data: eventParticipants } = useQuery({
    queryKey: ['all-event-participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id');
      
      if (error) throw error;
      
      // Count participants per event
      const counts: { [key: string]: number } = {};
      data.forEach(p => {
        counts[p.event_id] = (counts[p.event_id] || 0) + 1;
      });
      
      return counts;
    }
  });

  // Get ride counts for all events
  const { data: eventRides } = useQuery({
    queryKey: ['all-event-rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('event_id')
        .eq('status', 'active')
        .not('event_id', 'is', null);
      
      if (error) throw error;
      
      // Count rides per event
      const counts: { [key: string]: number } = {};
      data.forEach(r => {
        if (r.event_id) {
          counts[r.event_id] = (counts[r.event_id] || 0) + 1;
        }
      });
      
      return counts;
    }
  });

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Past', color: 'bg-gray-500' };
    if (diffDays === 0) return { label: 'Today', color: 'bg-green-500' };
    if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-blue-500' };
    if (diffDays <= 7) return { label: 'This Week', color: 'bg-purple-500' };
    return { label: 'Upcoming', color: 'bg-orange-500' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatedBanner
        title="Discover Events in Goa"
        subtitle="Find amazing events and connect with fellow travelers for shared rides"
        gradient="from-blue-600 via-cyan-600 to-blue-800"
      >
        <div className="mt-8">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
            <Input
              placeholder="Search events or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/70 backdrop-blur-sm"
            />
          </div>
        </div>
      </AnimatedBanner>

      <div className="container mx-auto px-4 py-12">
        {/* Filter Options */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Events</h2>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {events?.length || 0} events found
            </Badge>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse shadow-lg border-0">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const status = getEventStatus(event.event_date);
              const participantCount = eventParticipants?.[event.id] || 0;
              const rideCount = eventRides?.[event.id] || 0;
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group shadow-md border-0 bg-white rounded-2xl">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={`${status.color} text-white border-0 font-medium`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">
                            {new Date(event.event_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-500 line-clamp-3 mb-6 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm text-green-600">
                            {participantCount} interested
                          </span>
                        </div>
                        {rideCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm text-blue-600">
                              {rideCount} rides
                            </span>
                          </div>
                        )}
                      </div>
                      <Link to={`/events/${event.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 px-6">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-20 w-20 mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-bold mb-4">No events found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search terms or browse all events' : 'No events are currently available. Be the first to create one!'}
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
