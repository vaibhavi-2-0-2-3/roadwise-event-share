
import { Cloud } from 'lucide-react';

interface WeatherWidgetProps {
  date: string;
}

export function WeatherWidget({ date }: WeatherWidgetProps) {
  // Mock weather data for demo purposes
  const weatherData = {
    temp: '12°C',
    condition: 'Light rain',
    windSpeed: '17 km/h'
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
      <Cloud className="h-8 w-8 text-blue-600" />
      <div>
        <div className="font-semibold text-blue-800">{weatherData.temp}</div>
        <div className="text-sm text-blue-600">{weatherData.condition}</div>
      </div>
      <div className="ml-auto text-right">
        <div className="text-sm font-medium text-blue-800">
          {new Date(date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
        <div className="text-xs text-blue-600">💨 {weatherData.windSpeed}</div>
      </div>
    </div>
  );
}
