export interface StickerItem {
  id: string;
  name: string;
  category: 'badges' | 'arrows' | 'decorative' | 'icons';
  svgPath: string;
  viewBox: string;
  defaultColor: string;
}

export const STICKER_COLLECTION: StickerItem[] = [
  {
    id: 'badge-star-burst',
    name: 'Sunburst Badge',
    category: 'badges',
    viewBox: '0 0 100 100',
    defaultColor: '#f59e0b',
    svgPath: 'M50 0 L58 30 L85 15 L74 42 L100 50 L74 58 L85 85 L58 70 L50 100 L42 70 L15 85 L26 58 L0 50 L26 42 L15 15 L42 30 Z',
  },
  {
    id: 'badge-shield',
    name: 'Shield Emblem',
    category: 'badges',
    viewBox: '0 0 100 100',
    defaultColor: '#6366f1',
    svgPath: 'M50 5 L85 20 L85 55 C85 75 50 95 50 95 C50 95 15 75 15 55 L15 20 Z',
  },
  {
    id: 'lightning-bolt',
    name: 'Lightning Energy',
    category: 'decorative',
    viewBox: '0 0 100 100',
    defaultColor: '#eab308',
    svgPath: 'M55 5 L20 55 L48 55 L35 95 L80 42 L52 42 Z',
  },
  {
    id: 'arrow-dynamic',
    name: 'Dynamic Arrow',
    category: 'arrows',
    viewBox: '0 0 100 100',
    defaultColor: '#06b6d4',
    svgPath: 'M10 40 L60 40 L60 20 L95 50 L60 80 L60 60 L10 60 Z',
  },
  {
    id: 'curved-swoosh-arrow',
    name: 'Swoosh Pointer',
    category: 'arrows',
    viewBox: '0 0 100 100',
    defaultColor: '#10b981',
    svgPath: 'M15 80 C20 40 50 30 75 35 L70 20 L95 40 L75 60 L75 48 C55 45 30 55 25 80 Z',
  },
  {
    id: 'sparkle-star',
    name: 'Glitter Sparkle',
    category: 'decorative',
    viewBox: '0 0 100 100',
    defaultColor: '#ec4899',
    svgPath: 'M50 0 C50 35 65 50 100 50 C65 50 50 65 50 100 C50 65 35 50 0 50 C35 50 50 35 50 0 Z',
  },
  {
    id: 'crown-royal',
    name: 'Crown',
    category: 'badges',
    viewBox: '0 0 100 100',
    defaultColor: '#f59e0b',
    svgPath: 'M10 75 L15 35 L38 55 L50 25 L62 55 L85 35 L90 75 Z',
  },
  {
    id: 'ribbon-banner',
    name: 'Curved Ribbon',
    category: 'decorative',
    viewBox: '0 0 120 60',
    defaultColor: '#f43f5e',
    svgPath: 'M10 20 L30 10 L110 10 L90 20 L110 50 L30 50 L10 20 Z',
  },
  {
    id: 'flame-fire',
    name: 'Flame',
    category: 'decorative',
    viewBox: '0 0 100 100',
    defaultColor: '#f97316',
    svgPath: 'M50 5 C55 25 70 35 70 55 C70 75 58 90 45 95 C65 85 75 65 65 45 C60 55 50 60 45 60 C40 45 45 30 50 5 Z',
  },
  {
    id: 'verified-check',
    name: 'Verified Badge',
    category: 'badges',
    viewBox: '0 0 100 100',
    defaultColor: '#3b82f6',
    svgPath: 'M50 5 L63 12 L77 8 L85 20 L98 23 L98 37 L105 48 L98 59 L98 73 L85 76 L77 88 L63 84 L50 91 L37 84 L23 88 L15 76 L2 73 L2 59 L-5 48 L2 37 L2 23 L15 20 L23 8 L37 12 Z M45 65 L75 35 L68 28 L45 51 L32 38 L25 45 Z',
  },
];
