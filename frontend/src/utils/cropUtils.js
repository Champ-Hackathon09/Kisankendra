export const CROP_DATA_MAP = {
  'Wheat (Sharbati / Common)': {
    id: 'wheat',
    name: 'Wheat (Sharbati / Common)',
    shortName: 'Wheat / Gehun',
    image: '/crops/wheat.jpg',
    msp: 2275,
    season: 'Rabi Harvest',
    maxMoisture: '12.0%',
    oilOrProtein: '12% Protein',
    color: 'amber',
  },
  'Paddy (Basmati / Common)': {
    id: 'paddy',
    name: 'Paddy (Basmati / Common)',
    shortName: 'Paddy / Basmati Dhan',
    image: '/crops/paddy.jpg',
    msp: 2300,
    season: 'Kharif Harvest',
    maxMoisture: '14.0%',
    oilOrProtein: 'Fine Grain',
    color: 'emerald',
  },
  'Mustard / Rapeseed': {
    id: 'mustard',
    name: 'Mustard / Rapeseed',
    shortName: 'Mustard / Sarson',
    image: '/crops/mustard.jpg',
    msp: 5650,
    season: 'Rabi Harvest',
    maxMoisture: '8.0%',
    oilOrProtein: '42%+ Oil',
    color: 'yellow',
  },
  'Gram / Chickpea': {
    id: 'chana',
    name: 'Gram / Chickpea',
    shortName: 'Gram / Desi Chana',
    image: '/crops/chana.jpg',
    msp: 5440,
    season: 'Rabi Harvest',
    maxMoisture: '10.0%',
    oilOrProtein: '22% Protein',
    color: 'orange',
  },
  'Maize / Corn': {
    id: 'maize',
    name: 'Maize / Corn',
    shortName: 'Maize / Makka',
    image: '/crops/maize.jpg',
    msp: 2090,
    season: 'Kharif Harvest',
    maxMoisture: '14.0%',
    oilOrProtein: 'Industrial Starch',
    color: 'yellow',
  },
  'Soybean': {
    id: 'soybean',
    name: 'Soybean',
    shortName: 'Soybean / Soya',
    image: '/crops/soybean.jpg',
    msp: 4600,
    season: 'Kharif Harvest',
    maxMoisture: '10.0%',
    oilOrProtein: '38% Protein / 18% Oil',
    color: 'lime',
  },
  'Cotton (Medium / Long Staple)': {
    id: 'cotton',
    name: 'Cotton (Medium / Long Staple)',
    shortName: 'Cotton / Kapas',
    image: '/crops/cotton.jpg',
    msp: 6620,
    season: 'Kharif Harvest',
    maxMoisture: '8.5%',
    oilOrProtein: 'CCI Long Staple',
    color: 'teal',
  },
};

// Beautiful vector SVG fallback generators for 100% reliable image display
export const getCropFallbackSvg = (cropName = '') => {
  const c = (cropName || '').toLowerCase();
  let emoji = '🌾';
  let bg1 = '#092518';
  let bg2 = '#04160d';
  let accent = '#10b981';
  let label = 'Crop';

  if (c.includes('wheat') || c.includes('gehun')) {
    emoji = '🌾';
    bg1 = '#382208';
    bg2 = '#1b1003';
    accent = '#f59e0b';
    label = 'Wheat / Gehun';
  } else if (c.includes('paddy') || c.includes('rice') || c.includes('dhan') || c.includes('basmati')) {
    emoji = '🍚';
    bg1 = '#0b2b1d';
    bg2 = '#051810';
    accent = '#34d399';
    label = 'Paddy / Basmati';
  } else if (c.includes('mustard') || c.includes('sarson') || c.includes('rapeseed')) {
    emoji = '🌼';
    bg1 = '#302606';
    bg2 = '#171202';
    accent = '#eab308';
    label = 'Mustard / Sarson';
  } else if (c.includes('gram') || c.includes('chana') || c.includes('chickpea')) {
    emoji = '🌱';
    bg1 = '#331d09';
    bg2 = '#1a0e04';
    accent = '#f97316';
    label = 'Gram / Chana';
  } else if (c.includes('maize') || c.includes('corn') || c.includes('makka')) {
    emoji = '🌽';
    bg1 = '#2b2408';
    bg2 = '#171202';
    accent = '#fbbf24';
    label = 'Maize / Makka';
  } else if (c.includes('soybean') || c.includes('soya')) {
    emoji = '🌿';
    bg1 = '#13280c';
    bg2 = '#081404';
    accent = '#84cc16';
    label = 'Soybean / Soya';
  } else if (c.includes('cotton') || c.includes('kapas')) {
    emoji = '☁️';
    bg1 = '#0b2728';
    bg2 = '#051415';
    accent = '#2dd4bf';
    label = 'Cotton / Kapas';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g)"/>
    <circle cx="300" cy="180" r="110" fill="${accent}" opacity="0.15"/>
    <text x="50%" y="48%" font-size="88" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    <rect x="150" y="270" width="300" height="42" rx="12" fill="${accent}" opacity="0.2" stroke="${accent}" stroke-width="1.5"/>
    <text x="50%" y="296" font-size="18" font-weight="bold" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const handleCropImageError = (e, cropName = '') => {
  if (e && e.target) {
    e.target.onerror = null;
    e.target.src = getCropFallbackSvg(cropName);
  }
};

export const getCropImage = (cropType = '') => {
  const c = (cropType || '').toLowerCase();
  if (c.includes('wheat') || c.includes('gehun')) return '/crops/wheat.jpg';
  if (c.includes('paddy') || c.includes('rice') || c.includes('dhan') || c.includes('basmati')) return '/crops/paddy.jpg';
  if (c.includes('mustard') || c.includes('sarson') || c.includes('rapeseed')) return '/crops/mustard.jpg';
  if (c.includes('gram') || c.includes('chana') || c.includes('chickpea')) return '/crops/chana.jpg';
  if (c.includes('maize') || c.includes('corn') || c.includes('makka')) return '/crops/maize.jpg';
  if (c.includes('soybean') || c.includes('soya')) return '/crops/soybean.jpg';
  if (c.includes('cotton') || c.includes('kapas')) return '/crops/cotton.jpg';
  return '/crops/wheat.jpg';
};

export const getCropMsp = (cropType = '') => {
  for (const [key, val] of Object.entries(CROP_DATA_MAP)) {
    if (cropType.toLowerCase().includes(val.id) || key.toLowerCase().includes(cropType.toLowerCase())) {
      return val.msp;
    }
  }
  return 2275;
};

