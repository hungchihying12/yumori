// Lightweight, transparent wardrobe matching rules.
// This is not a body or beauty scoring system.

export function pickWardrobeItems(items = [], preferences = {}) {
  const wanted = String(preferences.category || '').toLowerCase();

  const avoid = new Set(
    (preferences.avoid || []).map(x => String(x).toLowerCase())
  );

  return items.filter(item =>
    !avoid.has(String(item.name || '').toLowerCase()) &&
    (!wanted || String(item.category || '').toLowerCase() === wanted)
  );
}

export function buildEssentials({ weather, occasion = '' } = {}) {
  const list = [];

  if (
    weather?.precipitation_probability >= 40 ||
    /rain/i.test(weather?.summary || '')
  ) {
    list.push('Umbrella');
  }

  if (weather?.temperature_2m >= 28) {
    list.push('Water bottle');
  }

  if (/school|work|day out|outing/i.test(occasion)) {
    list.push('Transit card');
  }

  return [...new Set(list)];
}
