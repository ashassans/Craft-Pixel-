export interface SamplePhoto {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
  width: number;
  height: number;
}

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'sample_neon_cyber',
    name: 'Cyberpunk Neon',
    category: 'Abstract',
    width: 800,
    height: 800,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%23818cf8"/>
          <stop offset="50%" stop-color="%236366f1"/>
          <stop offset="100%" stop-color="%230f172a"/>
        </radialGradient>
        <linearGradient id="neonBar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23ec4899"/>
          <stop offset="100%" stop-color="%2306b6d4"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="%23090d16"/>
      <circle cx="400" cy="400" r="320" fill="url(%23neonGlow)" opacity="0.8"/>
      <polygon points="400,120 660,620 140,620" fill="none" stroke="url(%23neonBar)" stroke-width="24" stroke-linejoin="round"/>
      <circle cx="400" cy="450" r="120" fill="%23f43f5e" opacity="0.9"/>
      <rect x="250" y="320" width="300" height="18" rx="9" fill="%23ffffff" opacity="0.9"/>
    </svg>`,
  },
  {
    id: 'sample_studio_portrait',
    name: 'Creative Portrait',
    category: 'People',
    width: 800,
    height: 800,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="warmBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%23fef3c7"/>
          <stop offset="100%" stop-color="%23fed7aa"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(%23warmBg)"/>
      <circle cx="400" cy="310" r="160" fill="%231e293b"/>
      <path d="M180,680 C180,500 270,440 400,440 C530,440 620,500 620,680 Z" fill="%230f172a"/>
      <circle cx="400" cy="270" r="90" fill="%23f8fafc"/>
      <circle cx="400" cy="300" r="28" fill="%23f59e0b"/>
      <circle cx="340" cy="240" r="16" fill="%231e293b"/>
      <circle cx="460" cy="240" r="16" fill="%231e293b"/>
      <rect x="360" y="360" width="80" height="12" rx="6" fill="%23e11d48"/>
    </svg>`,
  },
  {
    id: 'sample_sunset_mountains',
    name: 'Sunset Peaks',
    category: 'Nature',
    width: 800,
    height: 600,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%23f97316"/>
          <stop offset="40%" stop-color="%23ec4899"/>
          <stop offset="100%" stop-color="%23312e81"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(%23skyGrad)"/>
      <circle cx="400" cy="300" r="110" fill="%23fef08a"/>
      <polygon points="0,600 240,320 480,600" fill="%231e1b4b" opacity="0.9"/>
      <polygon points="320,600 560,260 800,600" fill="%230f172a"/>
      <polygon points="120,600 380,390 640,600" fill="%234338ca" opacity="0.6"/>
    </svg>`,
  },
  {
    id: 'sample_tech_device',
    name: 'Smart Device',
    category: 'Tech',
    width: 800,
    height: 800,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <rect width="800" height="800" fill="%2318181b"/>
      <rect x="240" y="140" width="320" height="520" rx="42" fill="%2327272a" stroke="%2352525b" stroke-width="8"/>
      <rect x="260" y="170" width="280" height="460" rx="26" fill="%2309090b"/>
      <circle cx="400" cy="200" r="6" fill="%2338bdf8"/>
      <circle cx="400" cy="400" r="80" fill="%234f46e5" opacity="0.8"/>
      <circle cx="400" cy="400" r="45" fill="%2306b6d4" opacity="0.9"/>
      <rect x="330" y="520" width="140" height="12" rx="6" fill="%23a1a1aa"/>
    </svg>`,
  },
];
