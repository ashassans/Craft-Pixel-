import {
  BackgroundSettings,
  CanvasObject,
  ImageObject,
  ShapeObject,
  StickerObject,
  TextObject,
  TransformHandle,
} from '../types/editor';
import { getObjectHandles, Point } from './coordinate-system';

// Image element cache to avoid re-decoding images on every render loop
const imageCache = new Map<string, HTMLImageElement>();
const pathCache = new Map<string, Path2D>();

export function getCachedImage(src: string): HTMLImageElement | null {
  if (imageCache.has(src)) {
    const img = imageCache.get(src)!;
    return img.complete && img.naturalWidth > 0 ? img : null;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  imageCache.set(src, img);
  return null;
}

export function getCachedPath(svgPath: string): Path2D {
  if (pathCache.has(svgPath)) {
    return pathCache.get(svgPath)!;
  }
  const path = new Path2D(svgPath);
  pathCache.set(svgPath, path);
  return path;
}

export interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number; // project width
  canvasHeight: number; // project height
  background: BackgroundSettings;
  objects: CanvasObject[];
  selectedObjectId: string | null;
  scale: number;
  panX: number;
  panY: number;
  showGuides?: boolean;
  activeGuideLines?: { x?: number; y?: number };
  isExporting?: boolean;
}

/**
 * Main render function for CraftPixel Studio canvas engine
 */
export function renderScene({
  ctx,
  canvasWidth,
  canvasHeight,
  background,
  objects,
  selectedObjectId,
  scale,
  panX,
  panY,
  activeGuideLines,
  isExporting = false,
}: RenderOptions): void {
  // If not exporting, clear the entire screen canvas
  if (!isExporting) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  ctx.save();

  // Apply viewport camera transform
  if (!isExporting) {
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);
  }

  // 1. Draw Canvas Outer Drop Shadow & Project Boundary
  if (!isExporting) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 28 / scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8 / scale;
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 2. Render Project Background
  ctx.save();
  // Clip to canvas area
  ctx.beginPath();
  ctx.rect(0, 0, canvasWidth, canvasHeight);
  ctx.clip();

  renderBackground(ctx, canvasWidth, canvasHeight, background, isExporting);

  // 3. Render Objects in Z-Order
  const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

  for (const obj of sortedObjects) {
    if (!obj.visible) continue;
    renderObject(ctx, obj);
  }

  ctx.restore(); // restore clip

  // 4. Render Active Snap Guide Lines (if dragging/moving)
  if (!isExporting && activeGuideLines) {
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1 / scale;
    ctx.setLineDash([4 / scale, 4 / scale]);

    if (activeGuideLines.x !== undefined) {
      ctx.beginPath();
      ctx.moveTo(activeGuideLines.x, -500);
      ctx.lineTo(activeGuideLines.x, canvasHeight + 500);
      ctx.stroke();
    }
    if (activeGuideLines.y !== undefined) {
      ctx.beginPath();
      ctx.moveTo(-500, activeGuideLines.y);
      ctx.lineTo(canvasWidth + 500, activeGuideLines.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 5. Render Selection Bounding Box & Transformation Handles
  if (!isExporting && selectedObjectId) {
    const selectedObj = objects.find((o) => o.id === selectedObjectId);
    if (selectedObj && selectedObj.visible) {
      renderSelectionGizmo(ctx, selectedObj, scale);
    }
  }

  ctx.restore(); // restore viewport transform
}

/**
 * Render Project Background (Solid, Gradient, Transparent checker, or Image)
 */
function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bg: BackgroundSettings,
  isExporting: boolean
): void {
  if (bg.type === 'transparent') {
    if (!isExporting) {
      // Draw checkered pattern for transparency preview in editor
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 24;
      patternCanvas.height = 24;
      const pctx = patternCanvas.getContext('2d');
      if (pctx) {
        pctx.fillStyle = '#1e2430';
        pctx.fillRect(0, 0, 24, 24);
        pctx.fillStyle = '#272f3d';
        pctx.fillRect(0, 0, 12, 12);
        pctx.fillRect(12, 12, 12, 12);
        const pattern = ctx.createPattern(patternCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, width, height);
        }
      }
    } else {
      // When exporting transparent, keep clear
      ctx.clearRect(0, 0, width, height);
    }
    return;
  }

  ctx.globalAlpha = bg.opacity ?? 1;

  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color || '#0f172a';
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'gradient' && bg.gradient) {
    const grad = bg.gradient;
    let gradientFill: CanvasGradient;

    if (grad.type === 'radial') {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.max(width, height) / 2;
      gradientFill = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    } else {
      const rad = ((grad.angle || 0) * Math.PI) / 180;
      const length = Math.max(width, height);
      const cx = width / 2;
      const cy = height / 2;
      const x1 = cx - (Math.cos(rad) * length) / 2;
      const y1 = cy - (Math.sin(rad) * length) / 2;
      const x2 = cx + (Math.cos(rad) * length) / 2;
      const y2 = cy + (Math.sin(rad) * length) / 2;
      gradientFill = ctx.createLinearGradient(x1, y1, x2, y2);
    }

    for (const stop of grad.stops) {
      gradientFill.addColorStop(stop.offset, stop.color);
    }

    ctx.fillStyle = gradientFill;
    ctx.fillRect(0, 0, width, height);
  } else if (bg.type === 'image' && bg.imageUrl) {
    const img = getCachedImage(bg.imageUrl);
    if (img) {
      ctx.drawImage(img, 0, 0, width, height);
    }
  }

  ctx.globalAlpha = 1;
}

/**
 * Render individual object with transformation matrix
 */
function renderObject(ctx: CanvasRenderingContext2D, obj: CanvasObject): void {
  ctx.save();

  // Compute center origin
  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;

  // Transform coordinates to object center
  ctx.translate(cx, cy);
  ctx.rotate((obj.rotation * Math.PI) / 180);
  ctx.scale(obj.flipX ? -1 : 1, obj.flipY ? -1 : 1);
  ctx.translate(-obj.width / 2, -obj.height / 2);

  ctx.globalAlpha = obj.opacity ?? 1;

  // Object Type Specific Rendering
  switch (obj.type) {
    case 'text':
      renderTextObject(ctx, obj as TextObject);
      break;
    case 'shape':
      renderShapeObject(ctx, obj as ShapeObject);
      break;
    case 'image':
      renderImageObject(ctx, obj as ImageObject);
      break;
    case 'sticker':
      renderStickerObject(ctx, obj as StickerObject);
      break;
  }

  ctx.restore();
}

/**
 * Render Text Object (Bengali & Unicode shaping, stroke, shadow, background, gradient, 3d, curved)
 */
function renderTextObject(ctx: CanvasRenderingContext2D, obj: TextObject): void {
  const fontStyle = obj.fontStyle || 'normal';
  const fontWeight = obj.fontWeight || 600;
  const fontSize = obj.fontSize || 32;
  const fontFamily = obj.fontFamily || 'Plus Jakarta Sans';

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", "Hind Siliguri", "Noto Sans Bengali", sans-serif`;
  ctx.textAlign = obj.textAlign || 'left';
  ctx.textBaseline = 'top';

  const lines = obj.text.split('\n');
  const lineHeightPx = fontSize * (obj.lineHeight || 1.3);

  // Background Box with Padding if defined
  if (obj.backgroundColor && obj.backgroundColor !== 'transparent') {
    const pad = obj.backgroundPadding ?? 8;
    ctx.save();
    ctx.fillStyle = obj.backgroundColor;
    ctx.beginPath();
    ctx.roundRect(-pad, -pad, obj.width + pad * 2, obj.height + pad * 2, 6);
    ctx.fill();
    ctx.restore();
  }

  // 3D Extrusion Effect
  if (obj.effect3d && obj.effect3d.depth > 0) {
    const depth = obj.effect3d.depth;
    const effectColor = obj.effect3d.color;
    const angleRad = ((obj.effect3d.angle ?? 45) * Math.PI) / 180;
    const stepX = Math.cos(angleRad);
    const stepY = Math.sin(angleRad);

    ctx.save();
    ctx.fillStyle = effectColor;
    for (let d = depth; d >= 1; d--) {
      drawTextLines(ctx, obj, lines, lineHeightPx, d * stepX, d * stepY);
    }
    ctx.restore();
  }

  // Shadow
  if (obj.shadow) {
    ctx.shadowColor = obj.shadow.color;
    ctx.shadowBlur = obj.shadow.blur;
    ctx.shadowOffsetX = obj.shadow.offsetX;
    ctx.shadowOffsetY = obj.shadow.offsetY;
  }

  // Stroke
  if (obj.strokeColor && obj.strokeWidth && obj.strokeWidth > 0) {
    ctx.save();
    ctx.strokeStyle = obj.strokeColor;
    ctx.lineWidth = obj.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    drawTextLines(ctx, obj, lines, lineHeightPx, 0, 0, true);
    ctx.restore();
  }

  // Text Fill (Gradient or Solid)
  if (obj.gradientFill && obj.gradientFill.stops.length > 1) {
    const rad = ((obj.gradientFill.angle || 0) * Math.PI) / 180;
    const grad = ctx.createLinearGradient(
      0,
      0,
      Math.cos(rad) * obj.width,
      Math.sin(rad) * obj.height
    );
    for (const stop of obj.gradientFill.stops) {
      grad.addColorStop(stop.offset, stop.color);
    }
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = obj.color || '#ffffff';
  }

  drawTextLines(ctx, obj, lines, lineHeightPx, 0, 0, false);

  // Underline / Strike-through
  if (obj.textDecoration && obj.textDecoration !== 'none') {
    ctx.save();
    ctx.strokeStyle = obj.color || '#ffffff';
    ctx.lineWidth = Math.max(1, fontSize / 14);
    for (let i = 0; i < lines.length; i++) {
      const lineY = i * lineHeightPx;
      const lineMetrics = ctx.measureText(lines[i]);
      let startX = 0;
      if (obj.textAlign === 'center') startX = (obj.width - lineMetrics.width) / 2;
      else if (obj.textAlign === 'right') startX = obj.width - lineMetrics.width;

      const yOffset =
        obj.textDecoration === 'underline' ? lineY + fontSize * 1.05 : lineY + fontSize * 0.55;

      ctx.beginPath();
      ctx.moveTo(startX, yOffset);
      ctx.lineTo(startX + lineMetrics.width, yOffset);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawTextLines(
  ctx: CanvasRenderingContext2D,
  obj: TextObject,
  lines: string[],
  lineHeightPx: number,
  offsetX: number = 0,
  offsetY: number = 0,
  isStroke: boolean = false
): void {
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    let x = 0;
    if (obj.textAlign === 'center') x = obj.width / 2;
    else if (obj.textAlign === 'right') x = obj.width;

    const y = i * lineHeightPx;

    // Curved Text Option
    if (obj.curved && obj.curveRadius) {
      drawCurvedText(ctx, text, x + offsetX, y + offsetY, obj.curveRadius, isStroke);
    } else {
      if (isStroke) {
        ctx.strokeText(text, x + offsetX, y + offsetY);
      } else {
        ctx.fillText(text, x + offsetX, y + offsetY);
      }
    }
  }
}

function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  isStroke: boolean
): void {
  ctx.save();
  const chars = Array.from(text);
  const totalAngle = (chars.length * 14 * Math.PI) / (180 * (radius / 100));
  let currentAngle = -totalAngle / 2;

  ctx.translate(cx, cy + radius);

  for (const ch of chars) {
    ctx.save();
    ctx.rotate(currentAngle);
    ctx.translate(0, -radius);
    if (isStroke) ctx.strokeText(ch, 0, 0);
    else ctx.fillText(ch, 0, 0);
    ctx.restore();
    currentAngle += totalAngle / chars.length;
  }
  ctx.restore();
}

/**
 * Render Shape Object (Rect, Rounded Rect, Circle, Star, Heart, Polygon, Arrow, Line)
 */
function renderShapeObject(ctx: CanvasRenderingContext2D, obj: ShapeObject): void {
  const w = obj.width;
  const h = obj.height;

  ctx.beginPath();

  switch (obj.shapeType) {
    case 'rectangle':
      ctx.rect(0, 0, w, h);
      break;

    case 'rounded-rectangle': {
      const radius = Math.min(obj.cornerRadius ?? 12, w / 2, h / 2);
      ctx.roundRect(0, 0, w, h, radius);
      break;
    }

    case 'circle':
    case 'ellipse':
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;

    case 'triangle':
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      break;

    case 'star': {
      const points = obj.points || 5;
      const outerRadius = Math.min(w, h) / 2;
      const innerRadius = outerRadius * 0.45;
      const cx = w / 2;
      const cy = h / 2;
      let angle = -Math.PI / 2;
      const step = Math.PI / points;

      ctx.moveTo(cx + Math.cos(angle) * outerRadius, cy + Math.sin(angle) * outerRadius);
      for (let i = 0; i < points; i++) {
        angle += step;
        ctx.lineTo(cx + Math.cos(angle) * innerRadius, cy + Math.sin(angle) * innerRadius);
        angle += step;
        ctx.lineTo(cx + Math.cos(angle) * outerRadius, cy + Math.sin(angle) * outerRadius);
      }
      ctx.closePath();
      break;
    }

    case 'heart': {
      const topCurveHeight = h * 0.3;
      ctx.moveTo(w / 2, topCurveHeight);
      ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.bezierCurveTo(0, h * 0.6, w * 0.4, h * 0.8, w / 2, h);
      ctx.bezierCurveTo(w * 0.6, h * 0.8, w, h * 0.6, w, topCurveHeight);
      ctx.bezierCurveTo(w, 0, w / 2, 0, w / 2, topCurveHeight);
      ctx.closePath();
      break;
    }

    case 'polygon': {
      const sides = obj.points || 6;
      const r = Math.min(w, h) / 2;
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < sides; i++) {
        const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }

    case 'arrow': {
      const stemH = h * 0.4;
      const stemTop = (h - stemH) / 2;
      const headW = w * 0.4;
      ctx.moveTo(0, stemTop);
      ctx.lineTo(w - headW, stemTop);
      ctx.lineTo(w - headW, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w - headW, h);
      ctx.lineTo(w - headW, stemTop + stemH);
      ctx.lineTo(0, stemTop + stemH);
      ctx.closePath();
      break;
    }

    case 'line':
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      break;
  }

  // Fill (solid or gradient)
  if (obj.shapeType !== 'line') {
    if (obj.gradientFill && obj.gradientFill.stops.length > 1) {
      const rad = ((obj.gradientFill.angle || 0) * Math.PI) / 180;
      const grad = ctx.createLinearGradient(0, 0, Math.cos(rad) * w, Math.sin(rad) * h);
      for (const stop of obj.gradientFill.stops) {
        grad.addColorStop(stop.offset, stop.color);
      }
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = obj.fill || '#6366f1';
    }
    ctx.fill();
  }

  // Stroke
  if (obj.stroke && obj.stroke !== 'transparent' && obj.strokeWidth > 0) {
    ctx.strokeStyle = obj.stroke;
    ctx.lineWidth = obj.strokeWidth;
    ctx.stroke();
  }
}

/**
 * Render Image Object with filters (brightness, contrast, saturation, blur, grayscale, sepia, invert)
 */
function renderImageObject(ctx: CanvasRenderingContext2D, obj: ImageObject): void {
  const img = getCachedImage(obj.src);
  if (!img) return;

  const w = obj.width;
  const h = obj.height;

  ctx.save();

  // Apply filters
  const f = obj.filters;
  if (f) {
    const filterParts: string[] = [];
    if (f.brightness !== 100) filterParts.push(`brightness(${f.brightness}%)`);
    if (f.contrast !== 100) filterParts.push(`contrast(${f.contrast}%)`);
    if (f.saturation !== 100) filterParts.push(`saturate(${f.saturation}%)`);
    if (f.blur > 0) filterParts.push(`blur(${f.blur}px)`);
    if (f.grayscale > 0) filterParts.push(`grayscale(${f.grayscale}%)`);
    if (f.sepia > 0) filterParts.push(`sepia(${f.sepia}%)`);
    if (f.invert > 0) filterParts.push(`invert(${f.invert}%)`);
    if (f.hueRotate > 0) filterParts.push(`hue-rotate(${f.hueRotate}deg)`);

    if (filterParts.length > 0) {
      ctx.filter = filterParts.join(' ');
    }
  }

  // Border radius clipping if specified
  if (obj.border && obj.border.radius > 0) {
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, Math.min(obj.border.radius, w / 2, h / 2));
    ctx.clip();
  }

  // Draw image
  if (obj.crop) {
    ctx.drawImage(img, obj.crop.x, obj.crop.y, obj.crop.width, obj.crop.height, 0, 0, w, h);
  } else {
    ctx.drawImage(img, 0, 0, w, h);
  }

  ctx.restore();

  // Draw border stroke if defined
  if (obj.border && obj.border.width > 0 && obj.border.color !== 'transparent') {
    ctx.save();
    ctx.strokeStyle = obj.border.color;
    ctx.lineWidth = obj.border.width;
    ctx.beginPath();
    if (obj.border.radius > 0) {
      ctx.roundRect(0, 0, w, h, Math.min(obj.border.radius, w / 2, h / 2));
    } else {
      ctx.rect(0, 0, w, h);
    }
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Render Vector Sticker
 */
function renderStickerObject(ctx: CanvasRenderingContext2D, obj: StickerObject): void {
  const path = getCachedPath(obj.svgPath);
  ctx.save();

  // Parse viewBox e.g. "0 0 100 100"
  const vb = obj.viewBox.split(' ').map(Number);
  const vbW = vb[2] || 100;
  const vbH = vb[3] || 100;

  ctx.scale(obj.width / vbW, obj.height / vbH);

  ctx.fillStyle = obj.fill || '#6366f1';
  ctx.fill(path);

  if (obj.stroke && obj.strokeWidth) {
    ctx.strokeStyle = obj.stroke;
    ctx.lineWidth = obj.strokeWidth;
    ctx.stroke(path);
  }

  ctx.restore();
}

/**
 * Render Selection Gizmo with 8 transform handles and 1 rotation lollipop handle
 */
function renderSelectionGizmo(
  ctx: CanvasRenderingContext2D,
  obj: CanvasObject,
  scale: number
): void {
  ctx.save();

  const cx = obj.x + obj.width / 2;
  const cy = obj.y + obj.height / 2;

  // Transform coordinates to object center
  ctx.translate(cx, cy);
  ctx.rotate((obj.rotation * Math.PI) / 180);

  const halfW = obj.width / 2;
  const halfH = obj.height / 2;
  const handleSize = 10 / scale;
  const handleRadius = 2 / scale;

  // 1. Draw Bounding Box Outline
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 1.5 / scale;
  ctx.setLineDash([4 / scale, 4 / scale]);
  ctx.strokeRect(-halfW, -halfH, obj.width, obj.height);
  ctx.setLineDash([]);

  // 2. Draw Rotation Lollipop Stem and Top Handle
  const rotDist = 26 / scale;
  ctx.beginPath();
  ctx.moveTo(0, -halfH);
  ctx.lineTo(0, -halfH - rotDist);
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 1.5 / scale;
  ctx.stroke();

  // Rotation Handle Circle
  ctx.beginPath();
  ctx.arc(0, -halfH - rotDist, 5 / scale, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  // 3. Draw 8 Corner & Edge Handles
  const handles = [
    { x: -halfW, y: -halfH }, // nw
    { x: 0, y: -halfH }, // n
    { x: halfW, y: -halfH }, // ne
    { x: halfW, y: 0 }, // e
    { x: halfW, y: halfH }, // se
    { x: 0, y: halfH }, // s
    { x: -halfW, y: halfH }, // sw
    { x: -halfW, y: 0 }, // w
  ];

  for (const h of handles) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 4 / scale;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2 / scale;

    ctx.beginPath();
    ctx.roundRect(
      h.x - handleSize / 2,
      h.y - handleSize / 2,
      handleSize,
      handleSize,
      handleRadius
    );
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 4. Dimension Badge below object when selected
  ctx.save();
  ctx.font = `${Math.max(10, 11 / scale)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const dimText = `${Math.round(obj.width)} × ${Math.round(obj.height)} px`;
  ctx.fillText(dimText, 0, halfH + 6 / scale);
  ctx.restore();

  ctx.restore();
}
