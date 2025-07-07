import { Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarButtonProps {
  ride: any;
  className?: string;
}

export function CalendarButton({ ride, className }: CalendarButtonProps) {
  const handleAddToCalendar = () => {
    const startDate = new Date(ride.departure_time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2-hour ride

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Ride: ${ride.origin} to ${ride.destination}`
    )}&dates=${startDate
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0]}Z/${endDate
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0]}Z&details=${encodeURIComponent(
          `Ride with ${ride.profiles?.name || 'Driver'} from ${ride.origin} to ${ride.destination}`
        )}&location=${encodeURIComponent(ride.origin)}`;

    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className={`text-left ${className}`}>
      <Button
        onClick={handleAddToCalendar}
        variant="ghost"
        className="w-full justify-start px-3 py-2 bg-white text-black text-sm transition-all"
      >
        <Calendar className="h-4 w-4 mr-2" />
        Add to Google Calendar
        <ExternalLink className="h-4 w-4 ml-auto" />
      </Button>
    </div>
  );
}
