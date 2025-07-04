
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Users, MessageCircle, Shield, Calendar, MapPin, Star, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function HomePage() {
  const { data: recentEvents } = useQuery({
    queryKey: ['recent-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  const { data: recentRides } = useQuery({
    queryKey: ['recent-rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles:driver_id (
            name,
            image_url
          ),
          events (
            title
          )
        `)
        .eq('status', 'active')
        .order('departure_time', { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  const features = [
    {
      icon: Car,
      title: "Easy Ride Sharing",
      description: "Find or offer rides with just a few clicks",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Event-Based Carpooling",
      description: "Connect with others going to the same events",
      color: "bg-green-500"
    },
    {
      icon: MessageCircle,
      title: "Real-Time Chat",
      description: "Coordinate with drivers and fellow passengers",
      color: "bg-purple-500"
    },
    {
      icon: Shield,
      title: "Trusted Community",
      description: "Rate and review drivers for everyone's safety",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom_right,#ffffff,#f5f9ff,#edf5ff)]"></div>

        <div className="container mx-auto px-4">

          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">

            <div className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              <span className="flex h-2 w-2 rounded-full bg-brand-500 mr-2"></span>
              <span>Welcome to the Future of Carpooling</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-fade-in opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              Share Your Journey With <br />
              <span className="text-brand-800">Roadwise</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 animate-fade-in opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
              Connect with fellow travelers, share rides to events, and make every journey memorable while reducing your carbon footprint.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4 animate-fade-in opacity-0" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/events">
                  <Calendar className="mr-2 h-5 w-5" />
                  Browse Events
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/rides">
                  <Car className="mr-2 h-5 w-5" />
                  Find Rides
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 animate-fade-in opacity-0" style={{ animationDelay: '1.1s', animationFillMode: 'forwards' }}>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-foreground">5K+</span>
                <span className="text-sm text-muted-foreground">Users</span>
              </div>
              <div className="h-10 w-px bg-border"></div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-foreground">10K+</span>
                <span className="text-sm text-muted-foreground">Rides</span>
              </div>
              <div className="h-10 w-px bg-border"></div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-foreground">50+</span>
                <span className="text-sm text-muted-foreground">Cities</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Roadwise?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the most convenient and social way to travel to your favorite events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} text-white mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Events Section */}
      {recentEvents && recentEvents.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
                <p className="text-gray-600 dark:text-gray-400">Join exciting events happening near you</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/events">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-video relative">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{event.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Rides Section */}
      {recentRides && recentRides.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Available Rides</h2>
                <p className="text-gray-600 dark:text-gray-400">Book your next adventure</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/rides">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {recentRides.map((ride) => (
                <Card key={ride.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="font-medium text-blue-700 dark:text-blue-300">
                              {ride.profiles?.name?.charAt(0) || 'D'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{ride.profiles?.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Driver</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mr-2" />
                            {ride.origin} → {ride.destination}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(ride.departure_time).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-2" />
                            {ride.available_seats} seats
                          </div>
                        </div>
                      </div>

                      <Button asChild>
                        <Link to={`/rides/${ride.id}`}>Book Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of travelers who are already sharing rides and making connections
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/events">Browse Events</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Link to="/rides">Find a Ride</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
