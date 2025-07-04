
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Calendar, Car, Phone, Mail, Award, Shield, Leaf } from 'lucide-react';
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

  const ratingDistribution = reviews ? 
    Array.from({ length: 5 }, (_, i) => {
      const starCount = 5 - i;
      const count = reviews.filter(r => r.rating === starCount).length;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      return { stars: starCount, count, percentage };
    }) : [];

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Banner */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarImage src={profile.image_url} />
              <AvatarFallback className="text-3xl bg-white text-blue-600">
                {profile.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-white/80">
                    ({reviews?.length || 0} review{reviews?.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Shield className="h-4 w-4 mr-1" />
                  Phone Verified
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rating Breakdown */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Rating Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{item.stars}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={review.reviewer_profile?.image_url} />
                            <AvatarFallback>
                              {review.reviewer_profile?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold">{review.reviewer_profile?.name}</p>
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.rides && (
                              <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{review.rides.origin} → {review.rides.destination}</span>
                              </div>
                            )}
                            {review.comment && (
                              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This driver hasn't received any reviews yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Car className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold">{ridesOffered?.length || 0}</p>
                  <p className="text-sm text-gray-600">Total Rides</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Leaf className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold">1.2 tons</p>
                  <p className="text-sm text-gray-600">CO₂ Saved</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-2xl font-bold">Member</p>
                  <p className="text-sm text-gray-600">Since 2023</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {profile.bio && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
