
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CompletedRideReviewProps {
  ride: any;
  booking: any;
}

export function CompletedRideReview({ ride, booking }: CompletedRideReviewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          driver_id: ride.driver_id,
          ride_id: ride.id,
          rating,
          comment: comment.trim() || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('🌟 Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['driver-reviews'] });
      setOpen(false);
      setComment('');
      setRating(5);
    },
    onError: (error) => {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  });

  const handleSubmit = () => {
    submitReviewMutation.mutate();
  };

  const renderStars = (interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-300 transition-colors' : ''}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ));
  };

  if (ride.status !== 'completed' || !booking) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
          <Star className="h-4 w-4 mr-2" />
          Give Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Ride</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">How was your ride with {ride.profiles?.name}?</h3>
            <p className="text-sm text-gray-600 mb-4">
              {ride.origin} → {ride.destination}
            </p>
            <div className="flex justify-center gap-1 mb-2">
              {renderStars(true)}
            </div>
            <p className="text-xs text-gray-500">
              Click the stars to rate (1 = Poor, 5 = Excellent)
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tell us about your experience (optional)
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
          
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitReviewMutation.isPending}
              className="flex-1"
            >
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
