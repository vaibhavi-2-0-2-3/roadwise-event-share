
import { useState, useEffect } from 'react';

interface DemandData {
  id: string;
  location: string;
  demand: number;
  coordinates: [number, number];
}

export function useDemandData() {
  const [demandData, setDemandData] = useState<DemandData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading demand data
    setTimeout(() => {
      setDemandData([
        { id: '1', location: 'Downtown', demand: 85, coordinates: [40.7128, -74.0060] },
        { id: '2', location: 'Airport', demand: 92, coordinates: [40.6892, -74.1745] },
        { id: '3', location: 'University', demand: 78, coordinates: [40.7489, -73.9680] },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return { demandData, isLoading };
}
