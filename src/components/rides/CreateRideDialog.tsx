
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CreateRideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId?: string;
  eventTitle?: string;
  eventLocation?: string;
  eventDate?: string;
}

export function CreateRideDialog({ 
  open, 
  onOpenChange, 
  eventId, 
  eventTitle, 
  eventLocation,
  eventDate
}: CreateRideDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: eventLocation || '',
    seats: 4,
    departureDate: '',
    departureTime: '',
    pricePerSeat: 0,
    description: ''
  });

  // Pre-fill form data when event details are provided
  useEffect(() => {
    if (eventId && eventLocation && eventDate) {
      const eventDateTime = new Date(eventDate);
      // Set departure time 1 hour before event time
      const departureDateTime = new Date(eventDateTime.getTime() - 60 * 60 * 1000);
      
      setFormData(prev => ({
        ...prev,
        destination: eventLocation,
        departureDate: departureDateTime.toISOString().split('T')[0],
        departureTime: departureDateTime.toTimeString().slice(0, 5),
        description: `Ride to ${eventTitle || 'event'}`
      }));
    }
  }, [eventId, eventLocation, eventDate, eventTitle]);

  const createRideMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('Must be logged in');
      
      const departureDateTime = new Date(`${data.departureDate}T${data.departureTime}`);
      
      const { error } = await supabase
        .from('rides')
        .insert({
          driver_id: user.id,
          event_id: eventId || null,
          origin: data.origin,
          destination: data.destination,
          seats: data.seats,
          available_seats: data.seats,
          departure_time: departureDateTime.toISOString(),
          price_per_seat: data.pricePerSeat
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ride created successfully!');
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['event-rides'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create ride');
      console.error('Error creating ride:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: eventLocation || '',
      seats: 4,
      departureDate: '',
      departureTime: '',
      pricePerSeat: 0,
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.destination || !formData.departureDate || !formData.departureTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    createRideMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {eventId ? `Offer ride to ${eventTitle}` : 'Offer a Ride'}
          </DialogTitle>
          {eventId && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Destination and timing are pre-filled based on the event details
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="origin">From *</Label>
            <Input
              id="origin"
              placeholder="Starting location"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">To *</Label>
            <Input
              id="destination"
              placeholder="Destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
              disabled={!!eventId}
            />
            {eventId && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Pre-filled from event location
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                required
              />
              {eventId && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Pre-filled from event
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                required
              />
              {eventId && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  1hr before event
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seats">Available Seats</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max="8"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per Seat ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.pricePerSeat}
                onChange={(e) => setFormData({ ...formData, pricePerSeat: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Notes</Label>
            <Textarea
              id="description"
              placeholder="Any additional information about the ride..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRideMutation.isPending}>
              {createRideMutation.isPending ? 'Creating...' : 'Create Ride'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
