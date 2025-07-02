
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, ArrowLeft, Car, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function EventDetailsPage() {
  const { eventId } = useParams();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event-details', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId
  });

  const { data: participants } = useQuery({
    queryKey: ['event-participants', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          *,
          profiles (name, image_url)
        `)
        .eq('event_id', eventId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId
  });

  const { data: rides } = useQuery({
    queryKey: ['event-rides', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (name, image_url)
        `)
        .eq('event_id', eventId)
        .eq('status', 'active')
        .order('departure_time', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId
  });

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Past Event', color: 'bg-gray-500' };
    if (diffDays === 0) return { label: 'Today', color: 'bg-red-500' };
    if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-orange-500' };
    if (diffDays <= 7) return { label: 'This Week', color: 'bg-blue-500' };
    return { label: 'Upcoming', color: 'bg-green-500' };
  };

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The event you're looking for doesn't exist.
            </p>
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getEventStatus(event.event_date);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to="/events" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Hero Section */}
      <Card className="mb-8 overflow-hidden shadow-xl border-0">
        <div className="relative h-64 md:h-80">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Badge className={`${status.color} text-white`}>
                {status.label}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(event.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {participants?.length || 0} attending
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Description */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              {event.description ? (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">
                  No description available for this event.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Available Rides */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-500" />
                Available Rides to This Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rides && rides.length > 0 ? (
                <div className="space-y-4">
                  {rides.map((ride) => (
                    <Card key={ride.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={ride.profiles?.image_url} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {ride.profiles?.name?.charAt(0) || 'D'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{ride.profiles?.name}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {ride.origin} → {ride.destination}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(ride.departure_time).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {ride.available_seats} seats left
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {ride.price_per_seat > 0 && (
                              <p className="font-semibold text-green-600 mb-2">
                                ${ride.price_per_seat}/seat
                              </p>
                            )}
                            <Link to={`/rides/${ride.id}`}>
                              <Button size="sm">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No rides available</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Be the first to offer a ride to this event!
                  </p>
                  <Link to="/rides">
                    <Button>Offer a Ride</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(event.event_date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {event.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Attendees ({participants?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {participants && participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.slice(0, 8).map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.profiles?.image_url} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {participant.profiles?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{participant.profiles?.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Joined {new Date(participant.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {participants.length > 8 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center pt-2">
                      +{participants.length - 8} more attendees
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No attendees yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
