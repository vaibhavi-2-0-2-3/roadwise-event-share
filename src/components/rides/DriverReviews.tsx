
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DriverReviewsProps {
  driverId: string;
}

export function DriverReviews({ driverId }: DriverReviewsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['driver-reviews', driverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer_profile:profiles!reviews_reviewer_id_fkey (
            name,
            image_url
          )
        `)
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: canReview } = useQuery({
    queryKey: ['can-review', driverId, user?.id],
    queryFn: async () => {
      if (!user || user.id === driverId) return false;
      
      // Check if user has completed rides with this driver and hasn't reviewed yet
      const { data: completedBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          ride_id,
          rides!inner (
            driver_id,
            status
          )
        `)
        .eq('user_id', user.id)
        .eq('rides.driver_id', driverId)
        .eq('rides.status', 'completed');
      
      if (bookingsError) throw bookingsError;
      
      if (!completedBookings || completedBookings.length === 0) return false;
      
      // Check if already reviewed
      const { data: existingReview, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq('driver_id', driverId)
        .maybeSingle();
      
      if (reviewError) throw reviewError;
      
      return !existingReview;
    },
    enabled: !!user
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      
      // Get a completed ride for this reviewer and driver
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          ride_id,
          rides!inner (
            id,
            driver_id,
            status
          )
        `)
        .eq('user_id', user.id)
        .eq('rides.driver_id', driverId)
        .eq('rides.status', 'completed')
        .limit(1)
        .single();
      
      if (bookingError) throw bookingError;
      
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          driver_id: driverId,
          ride_id: booking.ride_id,
          rating,
          comment: comment.trim() || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('🌟 Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['driver-reviews', driverId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', driverId, user?.id] });
      setShowReviewForm(false);
      setComment('');
      setRating(5);
    },
    onError: (error) => {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  });

  const renderStars = (ratingValue: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < ratingValue 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-300 transition-colors' : ''}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ));
  };

  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Driver Reviews
          </div>
          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <Badge variant="secondary">
                {averageRating.toFixed(1)} ({reviews.length})
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canReview && !showReviewForm && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
              Share Your Experience
            </h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
              How was your ride with this driver? Your feedback helps other travelers.
            </p>
            <Button onClick={() => setShowReviewForm(true)} className="w-full">
              Write a Review
            </Button>
          </div>
        )}

        {showReviewForm && (
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 space-y-4">
              <h4 className="font-semibold text-lg">Rate Your Experience</h4>
              <div>
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                <div className="flex gap-1 mb-1">
                  {renderStars(rating, true)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Click the stars to rate (1 = Poor, 5 = Excellent)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tell us about your ride (optional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the ride? Was the driver punctual, friendly, and safe?"
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {comment.length}/500 characters
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={submitReviewMutation.isPending}
                  className="flex-1"
                >
                  {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  onClick={() => {
                    setShowReviewForm(false);
                    setComment('');
                    setRating(5);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.reviewer_profile?.image_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {review.reviewer_profile?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{review.reviewer_profile?.name}</p>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to share your experience with this driver!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
