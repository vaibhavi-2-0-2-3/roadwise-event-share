
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LiveTrackingMapProps {
  rideId: string;
  ride: any;
}

interface Location {
  id: string;
  user_id: string;
  ride_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  user_type: 'driver' | 'passenger';
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function LiveTrackingMap({ rideId, ride }: LiveTrackingMapProps) {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const [distanceToDestination, setDistanceToDestination] = useState<number>(0);

  // Check if user has booking for this ride
  const { data: userBooking } = useQuery({
    queryKey: ['user-booking', rideId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('ride_id', rideId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

  // Get live locations for this ride - using any type to avoid TypeScript issues
  const { data: liveLocations, refetch: refetchLocations } = useQuery({
    queryKey: ['live-locations', rideId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ride_locations' as any)
        .select(`
          *,
          profiles:user_id (name, image_url)
        `)
        .eq('ride_id', rideId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!userBooking || user?.id === ride.driver_id,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const isDriver = user?.id === ride.driver_id;
  const hasBooking = !!userBooking;
  const canTrack = isDriver || hasBooking;

  // Start location tracking
  useEffect(() => {
    if (!canTrack || !user) return;

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Update location in database using any type to avoid TypeScript issues
          await supabase
            .from('ride_locations' as any)
            .upsert({
              user_id: user.id,
              ride_id: rideId,
              latitude,
              longitude,
              user_type: isDriver ? 'driver' : 'passenger'
            });

          // Calculate distance to destination (simplified - would need geocoding for real addresses)
          // For demo, using a fixed coordinate for destination
          const destLat = 37.7749; // San Francisco
          const destLng = -122.4194;
          const distance = calculateDistance(latitude, longitude, destLat, destLng);
          setDistanceToDestination(distance);

          // Simple ETA calculation (assuming 50 km/h average speed)
          const eta = new Date(Date.now() + (distance / 50) * 60 * 60 * 1000);
          setEstimatedArrival(eta.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
      setWatchId(id);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [canTrack, user, rideId, isDriver, watchId]);

  // Check if ride should be auto-completed
  useEffect(() => {
    if (isDriver && userLocation && distanceToDestination < 0.2) { // Within 200m
      // Auto-complete logic could be added here
      console.log('Near destination - ready to complete ride');
    }
  }, [isDriver, userLocation, distanceToDestination]);

  if (!canTrack) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center py-12">
          <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Live Tracking Unavailable</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Book this ride to access live tracking features
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            Live Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MapPin className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <p className="font-semibold">{distanceToDestination.toFixed(1)} km</p>
              <p className="text-sm text-gray-600">To destination</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <p className="font-semibold">{estimatedArrival || '--:--'}</p>
              <p className="text-sm text-gray-600">ETA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Live Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="text-center z-10">
              <MapPin className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <p className="font-medium">Interactive Map</p>
              <p className="text-sm text-gray-600">Live tracking with OpenStreetMap</p>
              <Badge className="mt-2">
                {userLocation ? 'Location Active' : 'Getting Location...'}
              </Badge>
            </div>
            
            {/* Animated location markers */}
            {userLocation && (
              <>
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">You</span>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Destination</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      {liveLocations && liveLocations.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Live Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveLocations.map((location: any) => (
                <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      location.user_type === 'driver' ? 'bg-blue-500' : 'bg-green-500'
                    } animate-pulse`}></div>
                    <span className="font-medium">{location.profiles?.name || 'Unknown'}</span>
                    <Badge variant="outline">
                      {location.user_type}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(location.updated_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
