export type LayerType = 'text' | 'image' | 'shape' | 'sticker';

export type ShapeType =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'heart'
  | 'polygon'
  | 'arrow'
  | 'line';

export interface GradientColor {
  type: 'linear' | 'radial';
  angle: number; // in degrees
  stops: { offset: number; color: string }[];
}

export interface ShadowEffect {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface Effect3D {
  depth: number;
  color: string;
  angle: number; // degrees
}

export interface ImageFilters {
  brightness: number; // 0 to 200, default 100
  contrast: number; // 0 to 200, default 100
  saturation: number; // 0 to 200, default 100
  blur: number; // 0 to 20, default 0
  grayscale: number; // 0 to 100, default 0
  sepia: number; // 0 to 100, default 0
  hueRotate: number; // 0 to 360, default 0
  invert: number; // 0 to 100, default 0
}

export interface ImageBorder {
  color: string;
  width: number;
  radius: number;
}

export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BaseObject {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  opacity: number; // 0 to 1
  visible: boolean;
  locked: boolean;
  flipX: boolean;
  flipY: boolean;
  zIndex: number;
}

export interface TextObject extends BaseObject {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textAlign: 'left' | 'center' | 'right';
  color: string;
  letterSpacing: number; // in px
  lineHeight: number; // multiplier, e.g. 1.2
  strokeColor?: string;
  strokeWidth?: number;
  shadow?: ShadowEffect;
  backgroundColor?: string;
  backgroundPadding?: number;
  gradientFill?: GradientColor;
  curved?: boolean;
  curveRadius?: number; // positive = arch up, negative = arch down
  effect3d?: Effect3D;
}

export interface ImageObject extends BaseObject {
  type: 'image';
  src: string; // base64 or objectUrl
  naturalWidth: number;
  naturalHeight: number;
  aspectRatioLocked: boolean;
  crop?: ImageCrop;
  filters: ImageFilters;
  border: ImageBorder;
}

export interface ShapeObject extends BaseObject {
  type: 'shape';
  shapeType: ShapeType;
  fill: string;
  gradientFill?: GradientColor;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
  points?: number; // for star/polygon
}

export interface StickerObject extends BaseObject {
  type: 'sticker';
  stickerId: string;
  svgPath: string;
  viewBox: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export type CanvasObject = TextObject | ImageObject | ShapeObject | StickerObject;

export type BackgroundType = 'solid' | 'gradient' | 'transparent' | 'image';

export interface BackgroundSettings {
  type: BackgroundType;
  color: string;
  gradient?: GradientColor;
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'tile';
  opacity: number;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  background: BackgroundSettings;
  objects: CanvasObject[];
  version: string;
}

export interface PresetDimension {
  id: string;
  name: string;
  category: 'social' | 'marketing' | 'print' | 'custom';
  width: number;
  height: number;
  aspectRatio: string;
  iconName: string;
}

export type TransformHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'rotate';

export interface ViewportTransform {
  scale: number;
  panX: number;
  panY: number;
}
