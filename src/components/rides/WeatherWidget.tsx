
import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Eye, Wind, Droplets } from 'lucide-react';

interface WeatherWidgetProps {
  date: string;
  location?: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
}

export function WeatherWidget({ date, location = "San Francisco" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedKey = localStorage.getItem('openweather_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      fetchWeather(storedKey);
    } else {
      // Show mock data if no API key
      setWeather({
        temp: 12,
        condition: 'Light rain',
        description: 'Light rain expected',
        humidity: 65,
        windSpeed: 17,
        visibility: 10,
        icon: '10d'
      });
      setLoading(false);
    }
  }, [date, location]);

  const fetchWeather = async (key: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${key}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather data not available');
      }
      
      const data = await response.json();
      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        visibility: Math.round(data.visibility / 1000), // Convert m to km
        icon: data.weather[0].icon
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Fallback to mock data
      setWeather({
        temp: 12,
        condition: 'Light rain',
        description: 'Weather data unavailable',
        humidity: 65,
        windSpeed: 17,
        visibility: 10,
        icon: '10d'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('openweather_api_key', key);
    setApiKey(key);
    fetchWeather(key);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="h-8 w-8 text-blue-300" />;
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  if (!apiKey && !weather) {
    return (
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="space-y-3">
          <p className="text-sm text-blue-700">Add OpenWeather API key for live weather data:</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter OpenWeather API key"
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApiKeySubmit((e.target as HTMLInputElement).value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                handleApiKeySubmit(input.value);
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-blue-600">
            Get your free API key at <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline">openweathermap.org</a>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-200 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-blue-200 rounded mb-2"></div>
            <div className="h-3 bg-blue-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather?.condition || 'cloud')}
          <div>
            <div className="font-semibold text-blue-800 text-lg">
              {weather?.temp}°C
            </div>
            <div className="text-sm text-blue-600 capitalize">
              {weather?.description}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-blue-800">
            {new Date(date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center gap-3 text-xs text-blue-600 mt-1">
            <div className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              {weather?.windSpeed} km/h
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              {weather?.humidity}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
