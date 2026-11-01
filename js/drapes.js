import { mountDonkey } from './donkey.js';

export const DRAPE_COLOURS = [
  {
    name: 'Warm cream',
    hex: '#e9ddc9',
    note: 'A soft warm neutral.'
  },
  {
    name: 'Misty blue',
    hex: '#a9bdc8',
    note: 'A gentle cool blue.'
  },
  {
    name: 'Dusty rose',
    hex: '#d5a6a5',
    note: 'A muted rosy shade.'
  },
  {
    name: 'Sage',
    hex: '#a9bda5',
    note: 'A calm muted green.'
  },
  {
    name: 'Berry',
    hex: '#986779',
    note: 'A deeper, cooler accent.'
  },
  {
    name: 'Warm cocoa',
    hex: '#9b7961',
    note: 'A rich earthy neutral.'
  }
];

export function initDrapes({
  element,
  donkeyElement,
  colours = DRAPE_COLOURS,
  onChange
} = {}) {
  let index = 0;

  if (donkeyElement) {
    mountDonkey(donkeyElement, 'think', 90);
  }

  function show(next = index) {
    if (!element || !colours.length) return null;

    index = (next + colours.length) % colours.length;

    const item = colours[index];

    element.style.setProperty('--drape-colour', item.hex);
    element.dataset.colour = item.name;
    element.setAttribute('aria-label', `${item.name} fabric drape`);

    if (donkeyElement) {
      mountDonkey(donkeyElement, 'point', 90);
    }

    onChange?.(item, index);

    return item;
  }

  function next() {
    return show(index + 1);
  }

  function replay() {
    return show(index);
  }

  show(0);

  return {
    next,
    replay,
    get current() {
      return colours[index] || null;
    }
  };
}

export function markCameraStarted(donkeyElement) {
  mountDonkey(donkeyElement, 'idle', 90);
}

export function showDrapeChange(donkeyElement) {
  mountDonkey(donkeyElement, 'point', 90);
}
