
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Calendar, Car, Phone, Mail, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ProfilePage() {
  const { profileId } = useParams();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  const { data: ridesOffered } = useQuery({
    queryKey: ['profile-rides', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          events (title, location)
        `)
        .eq('driver_id', profileId)
        .eq('status', 'completed')
        .order('departure_time', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  const { data: reviews } = useQuery({
    queryKey: ['profile-reviews', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer_profile:profiles!reviews_reviewer_id_fkey (name, image_url),
          rides (origin, destination, departure_time)
        `)
        .eq('driver_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            </div>
            <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The user profile you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile.image_url} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {profile.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                {reviews && reviews.length > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">No reviews yet</span>
                )}
              </div>
              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 max-w-2xl">{profile.bio}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Verified Driver
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                {ridesOffered?.length || 0} Rides Completed
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Reviews */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.reviewer_profile?.image_url} />
                            <AvatarFallback>
                              {review.reviewer_profile?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.reviewer_profile?.name}</p>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.rides && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Route: {review.rides.origin} → {review.rides.destination}
                        </div>
                      )}
                      {review.comment && (
                        <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This driver hasn't received any reviews yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Rides */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-500" />
                Recent Rides
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ridesOffered && ridesOffered.length > 0 ? (
                <div className="space-y-4">
                  {ridesOffered.map((ride) => (
                    <div key={ride.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{ride.origin} → {ride.destination}</span>
                        </div>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(ride.departure_time).toLocaleDateString()}
                        </span>
                        {ride.events && (
                          <span>Event: {ride.events.title}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No completed rides</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This driver hasn't completed any rides yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Driver Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Rides</span>
                <span className="font-semibold">{ridesOffered?.length || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Reviews</span>
                <span className="font-semibold">{reviews?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
