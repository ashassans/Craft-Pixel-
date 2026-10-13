import { CanvasObject, TransformHandle } from '../types/editor';

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Converts screen/viewport coordinates (mouse/touch event) to world (canvas project) coordinates
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  canvasRect: DOMRect,
  scale: number,
  panX: number,
  panY: number
): Point {
  const relX = screenX - canvasRect.left;
  const relY = screenY - canvasRect.top;
  return {
    x: (relX - panX) / scale,
    y: (relY - panY) / scale,
  };
}

/**
 * Converts world (canvas project) coordinates to screen coordinates
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  scale: number,
  panX: number,
  panY: number
): Point {
  return {
    x: worldX * scale + panX,
    y: worldY * scale + panY,
  };
}

/**
 * Rotates a point around an origin by given angle in degrees
 */
export function rotatePoint(point: Point, origin: Point, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const dx = point.x - origin.x;
  const dy = point.y - origin.y;

  return {
    x: origin.x + (dx * cos - dy * sin),
    y: origin.y + (dx * sin + dy * cos),
  };
}

/**
 * Checks if a world point lies inside an object's rotated bounding box
 */
export function isPointInObject(point: Point, obj: CanvasObject): boolean {
  if (!obj.visible) return false;

  const center: Point = {
    x: obj.x + obj.width / 2,
    y: obj.y + obj.height / 2,
  };

  // Un-rotate the point relative to the object's center
  const unrotated = rotatePoint(point, center, -obj.rotation);

  return (
    unrotated.x >= obj.x &&
    unrotated.x <= obj.x + obj.width &&
    unrotated.y >= obj.y &&
    unrotated.y <= obj.y + obj.height
  );
}

/**
 * Computes world positions of all 8 resize handles and the 1 rotation handle
 */
export function getObjectHandles(obj: CanvasObject): Record<TransformHandle, Point> {
  const center: Point = {
    x: obj.x + obj.width / 2,
    y: obj.y + obj.height / 2,
  };

  const halfW = obj.width / 2;
  const halfH = obj.height / 2;

  const rawHandles: Record<TransformHandle, Point> = {
    nw: { x: center.x - halfW, y: center.y - halfH },
    n: { x: center.x, y: center.y - halfH },
    ne: { x: center.x + halfW, y: center.y - halfH },
    e: { x: center.x + halfW, y: center.y },
    se: { x: center.x + halfW, y: center.y + halfH },
    s: { x: center.x, y: center.y + halfH },
    sw: { x: center.x - halfW, y: center.y + halfH },
    w: { x: center.x - halfW, y: center.y },
    rotate: { x: center.x, y: center.y - halfH - 30 }, // 30px above top edge
  };

  const rotatedHandles: Partial<Record<TransformHandle, Point>> = {};
  for (const [key, pt] of Object.entries(rawHandles) as [TransformHandle, Point][]) {
    rotatedHandles[key] = rotatePoint(pt, center, obj.rotation);
  }

  return rotatedHandles as Record<TransformHandle, Point>;
}

/**
 * Checks which handle is clicked, if any
 */
export function getClickedHandle(
  point: Point,
  obj: CanvasObject,
  tolerance: number = 10
): TransformHandle | null {
  const handles = getObjectHandles(obj);
  for (const [handle, pos] of Object.entries(handles) as [TransformHandle, Point][]) {
    const dist = Math.hypot(point.x - pos.x, point.y - pos.y);
    if (dist <= tolerance) {
      return handle;
    }
  }
  return null;
}
