import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from 'lucide-react';

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
  icon: string;
}

export function WeatherWidget({ date, location = "San Francisco" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const storedKey = localStorage.getItem('openweather_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      fetchWeather(storedKey);
    } else {
      // fallback mock
      setWeather({
        temp: 21,
        condition: 'Clouds',
        description: 'broken clouds',
        humidity: 60,
        windSpeed: 10,
        icon: '03d'
      });
      setLoading(false);
    }
  }, [date, location]);

  const fetchWeather = async (key: string) => {
    try {
      setLoading(true);
      const key = 'b6f230985747dd589ac84aa168d28b20';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${key}&units=metric`
      );
      const data = await response.json();
      if (!response.ok) throw new Error('Weather API failed');

      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        icon: data.weather[0].icon
      });
    } catch (err) {
      console.error(err);
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
        return <Sun className="h-5 w-5 text-black" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-5 w-5 text-black" />;
      case 'snow':
        return <CloudSnow className="h-5 w-5 text-black" />;
      default:
        return <Cloud className="h-5 w-5 text-black" />;
    }
  };

  if (!apiKey && !weather) {
    return (
      <div className="border border-dashed border-black text-sm text-black bg-white p-4 rounded-none">
        <p>Enter your OpenWeather API key:</p>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="API key"
            className="border border-black px-2 py-1 text-sm w-full rounded-none bg-white"
            onKeyDown={(e) => {
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
            className="px-3 py-1 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors rounded-none"
          >
            Save
          </button>
        </div>
        <p className="text-xs mt-2">
          Get your key at <a href="https://openweathermap.org/api" target="_blank" className="underline">OpenWeather</a>
        </p>
      </div>
    );
  }

  if (loading || !weather) {
    return (
      <div className="p-4 border border-dashed border-black text-black text-sm bg-white rounded-none animate-pulse">
        Loading weather...
      </div>
    );
  }

  return (
    <div className="p-4 border border-dashed border-black bg-white text-black text-sm rounded-none">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.condition)}
          <div>
            <p className="font-bold">{weather.temp}°C</p>
            <p className="capitalize">{weather.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}
          </p>
          <div className="flex gap-2 justify-end mt-1 text-xs">
            <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{weather.windSpeed} km/h</span>
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{weather.humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
