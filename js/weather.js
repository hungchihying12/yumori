const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const API = 'https://api.open-meteo.com/v1/forecast';

export async function getWeather(place) {
  const query = String(place || '').trim();

  if (!query) {
    throw new Error('Enter a city or town to check the weather.');
  }

  const geoRes = await fetch(
    `${GEO}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  );

  if (!geoRes.ok) {
    throw new Error('Could not look up that location.');
  }

  const geo = await geoRes.json();
  const location = geo.results?.[0];

  if (!location) {
    throw new Error('No matching location was found.');
  }

  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: 'temperature_2m,precipitation,rain,weather_code,wind_speed_10m',
    daily: 'precipitation_probability_max,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '1'
  });

  const res = await fetch(`${API}?${params}`);

  if (!res.ok) {
    throw new Error('Weather information is unavailable right now.');
  }

  const data = await res.json();

  return {
    location: `${location.name}${location.country ? `, ${location.country}` : ''}`,
    current: data.current,
    daily: data.daily
  };
}
