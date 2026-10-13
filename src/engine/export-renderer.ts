import { ProjectMetadata } from '../types/editor';
import { renderScene } from './renderer';

export interface ExportOptions {
  format: 'png' | 'jpeg';
  scale: number; // 1, 2, 3, or custom factor
  quality?: number; // 0.1 to 1.0 for jpeg
  transparent?: boolean; // only for png
}

/**
 * Renders the full composition onto an offscreen canvas at the exact requested output resolution
 */
export async function renderProjectToBlob(
  project: ProjectMetadata,
  options: ExportOptions
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const targetWidth = Math.round(project.width * options.scale);
  const targetHeight = Math.round(project.height * options.scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to get 2D rendering context for export');
  }

  // Adjust background if transparent export is requested
  const exportBackground = { ...project.background };
  if (options.format === 'png' && options.transparent) {
    exportBackground.type = 'transparent';
  }

  // Render complete scene scaled to target resolution
  ctx.save();
  ctx.scale(options.scale, options.scale);

  renderScene({
    ctx,
    canvasWidth: project.width,
    canvasHeight: project.height,
    background: exportBackground,
    objects: project.objects,
    selectedObjectId: null,
    scale: 1,
    panX: 0,
    panY: 0,
    isExporting: true,
  });

  ctx.restore();

  const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = options.format === 'jpeg' ? options.quality ?? 0.92 : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export failed to produce blob'));
          return;
        }
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({
          blob,
          dataUrl,
          width: targetWidth,
          height: targetHeight,
        });
      },
      mimeType,
      quality
    );
  });
}

/**
 * Generates a lightweight thumbnail dataUrl for project cards in IndexedDB
 */
export async function generateProjectThumbnail(
  project: ProjectMetadata,
  maxDimension: number = 320
): Promise<string> {
  const aspect = project.width / project.height;
  let thumbW = maxDimension;
  let thumbH = maxDimension;

  if (aspect > 1) {
    thumbH = Math.round(maxDimension / aspect);
  } else {
    thumbW = Math.round(maxDimension * aspect);
  }

  const canvas = document.createElement('canvas');
  canvas.width = thumbW;
  canvas.height = thumbH;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const scale = thumbW / project.width;
  ctx.scale(scale, scale);

  renderScene({
    ctx,
    canvasWidth: project.width,
    canvasHeight: project.height,
    background: project.background,
    objects: project.objects,
    selectedObjectId: null,
    scale: 1,
    panX: 0,
    panY: 0,
    isExporting: true,
  });

  return canvas.toDataURL('image/jpeg', 0.8);
}
