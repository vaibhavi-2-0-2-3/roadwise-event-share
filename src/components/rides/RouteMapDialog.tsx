
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Navigation, MapPin } from 'lucide-react';

interface RouteMapDialogProps {
  origin: string;
  destination: string;
  trigger?: React.ReactNode;
}

export function RouteMapDialog({ origin, destination, trigger }: RouteMapDialogProps) {
  const openGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
    window.open(mapsUrl, '_blank');
  };

  const openGoogleMapsLocation = (location: string) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Navigation className="h-4 w-4 mr-1" />
            Map
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Route Navigation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium">{origin}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openGoogleMapsLocation(origin)}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-medium">{destination}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openGoogleMapsLocation(destination)}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={openGoogleMaps}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Full Route in Google Maps
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            This will open Google Maps in a new tab for navigation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
