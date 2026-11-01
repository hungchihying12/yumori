// Yumori shared configuration. Keep secret API keys on a backend, never here.
export const CONFIG = {
  storageKey: 'yumori-prototype-v1',
  weatherBaseUrl: 'https://api.open-meteo.com/v1/forecast',
  geocodingBaseUrl: 'https://geocoding-api.open-meteo.com/v1/search',
  maxImageBytes: 1_500_000,
  mascot: { hero: 150, camera: 90, chat: 32, outfit: 40, auth: 110 }
};
