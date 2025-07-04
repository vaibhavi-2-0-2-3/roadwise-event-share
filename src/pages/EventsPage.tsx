
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Calendar, MapPin, Users, Plus, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedBanner } from '@/components/shared/AnimatedBanner';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Events');

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
    if (diffDays === 0) return { label: 'Today', color: 'bg-green-500' };
    if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-blue-500' };
    if (diffDays <= 7) return { label: 'This Week', color: 'bg-purple-500' };
    return { label: 'Upcoming', color: 'bg-orange-500' };
  };

  const eventCategories = ['All Events', 'Music', 'Entertainment', 'Food', 'Cultural', 'Film'];

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatedBanner
        title="Upcoming Events"
        subtitle="Discover amazing events in Goa and find carpool partners to share the journey"
        gradient="from-indigo-600 via-purple-600 to-pink-600"
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
        {/* Category Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 bg-white shadow-lg border-0 h-12">
              {eventCategories.map((category) => (
                <TabsTrigger 
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const status = getEventStatus(event.event_date);
              return (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group shadow-lg border-0 bg-white">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`${status.color} text-white border-0`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <Badge className="bg-black/50 text-white border-0">
                          entertainment
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-3 text-sm text-gray-600 mb-4">
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
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">89 attending</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">Free</span>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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
