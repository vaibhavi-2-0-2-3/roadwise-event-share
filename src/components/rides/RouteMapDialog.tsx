
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface RouteMapDialogProps {
  origin: string;
  destination: string;
  trigger?: React.ReactNode;
}

export function RouteMapDialog({ origin, destination, trigger }: RouteMapDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Navigation className="h-4 w-4 mr-2" />
            Map
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Route: {origin} → {destination}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <MapPin className="h-16 w-16 mx-auto text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
              <p className="text-gray-600 mb-4">
                Route from <strong>{origin}</strong> to <strong>{destination}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Map integration with Leaflet/OpenStreetMap would be implemented here
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
