
import { Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarButtonProps {
  ride: any;
}

export function CalendarButton({ ride }: CalendarButtonProps) {
  const handleAddToCalendar = () => {
    const startDate = new Date(ride.departure_time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Ride: ${ride.origin} to ${ride.destination}`)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(`Ride with ${ride.profiles?.name || 'Driver'} from ${ride.origin} to ${ride.destination}`)}&location=${encodeURIComponent(ride.origin)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Add to Calendar</h3>
      <Button 
        onClick={handleAddToCalendar}
        variant="outline" 
        className="w-full flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Add to Google Calendar
        <ExternalLink className="h-4 w-4" />
      </Button>
    </div>
  );
}
