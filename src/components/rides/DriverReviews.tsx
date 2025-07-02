
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
        .eq('status', 'completed');
      
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
      const { data: ride, error: rideError } = await supabase
        .from('bookings')
        .select(`
          ride_id,
          rides!inner (
            id,
            driver_id
          )
        `)
        .eq('user_id', user.id)
        .eq('rides.driver_id', driverId)
        .eq('status', 'completed')
        .limit(1)
        .single();
      
      if (rideError) throw rideError;
      
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          driver_id: driverId,
          ride_id: ride.ride_id,
          rating,
          comment: comment.trim() || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['driver-reviews', driverId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', driverId, user?.id] });
      setShowReviewForm(false);
      setComment('');
      setRating(5);
    },
    onError: (error) => {
      toast.error('Failed to submit review');
      console.error('Error submitting review:', error);
    }
  });

  const renderStars = (ratingValue: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < ratingValue 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer' : ''}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ));
  };

  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (isLoading) {
    return <div className="p-4">Loading reviews...</div>;
  }

  return (
    <div className="space-y-4">
      {reviews && reviews.length > 0 && (
        <div className="flex items-center space-x-4 pb-4 border-b">
          <div className="flex items-center space-x-1">
            {renderStars(Math.round(averageRating))}
          </div>
          <span className="text-sm text-gray-600">
            {averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      {canReview && !showReviewForm && (
        <Button onClick={() => setShowReviewForm(true)} variant="outline" size="sm">
          Write a Review
        </Button>
      )}

      {showReviewForm && (
        <div className="border rounded-lg p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex space-x-1">
              {renderStars(rating, true)}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this driver..."
              className="min-h-[80px]"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => submitReviewMutation.mutate()}
              disabled={submitReviewMutation.isPending}
              size="sm"
            >
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              onClick={() => setShowReviewForm(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-64 overflow-y-auto">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-sm">{review.reviewer_profile?.name}</span>
                <div className="flex space-x-1">
                  {renderStars(review.rating)}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at!).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700">{review.comment}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
