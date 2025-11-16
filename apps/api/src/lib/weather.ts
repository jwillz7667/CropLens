export type WeatherOutlook = {
  rainfallNext3Days: number;
  avgTempNext3Days: number;
};

export const fetchWeatherOutlook = async (lat: number, lng: number): Promise<WeatherOutlook> => {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    hourly: 'precipitation',
    daily: 'temperature_2m_max',
    forecast_days: '3',
    timezone: 'UTC',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather outlook');
  }
  const data = await response.json();
  const rainfallNext3Days = (data.hourly?.precipitation ?? []).slice(0, 72).reduce((sum: number, value: number) => sum + value, 0);
  const temps = data.daily?.temperature_2m_max ?? [];
  const avgTempNext3Days = temps.length ? temps.slice(0, 3).reduce((sum: number, value: number) => sum + value, 0) / Math.min(temps.length, 3) : 0;
  return { rainfallNext3Days, avgTempNext3Days };
};
