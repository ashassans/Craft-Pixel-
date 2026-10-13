import { describe, expect, it } from 'vitest';
import {
  getClickedHandle,
  getObjectHandles,
  isPointInObject,
  rotatePoint,
  screenToWorld,
  worldToScreen,
} from '../engine/coordinate-system';
import { CanvasObject } from '../types/editor';

describe('Coordinate System Engine', () => {
  it('converts screen to world coordinates correctly with scale and pan', () => {
    const canvasRect = { left: 100, top: 50, right: 900, bottom: 650, width: 800, height: 600 } as DOMRect;
    const scale = 2;
    const panX = 40;
    const panY = 20;

    const screenX = 100 + 40 + 200; // relativeX = 240, worldX should be (240 - 40) / 2 = 100
    const screenY = 50 + 20 + 300; // relativeY = 320, worldY should be (320 - 20) / 2 = 150

    const world = screenToWorld(screenX, screenY, canvasRect, scale, panX, panY);
    expect(world.x).toBe(100);
    expect(world.y).toBe(150);
  });

  it('converts world to screen coordinates correctly', () => {
    const scale = 1.5;
    const panX = 50;
    const panY = 100;

    const screen = worldToScreen(200, 300, scale, panX, panY);
    expect(screen.x).toBe(200 * 1.5 + 50);
    expect(screen.y).toBe(300 * 1.5 + 100);
  });

  it('rotates points accurately', () => {
    const origin = { x: 0, y: 0 };
    const pt = { x: 10, y: 0 };
    const rotated90 = rotatePoint(pt, origin, 90);
    expect(Math.round(rotated90.x)).toBe(0);
    expect(Math.round(rotated90.y)).toBe(10);
  });

  it('detects point in unrotated bounding box', () => {
    const obj: CanvasObject = {
      id: 'test_1',
      name: 'Rect',
      type: 'shape',
      shapeType: 'rectangle',
      x: 50,
      y: 50,
      width: 100,
      height: 80,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      flipX: false,
      flipY: false,
      zIndex: 1,
      fill: '#ffffff',
      stroke: 'transparent',
      strokeWidth: 0,
    };

    expect(isPointInObject({ x: 60, y: 60 }, obj)).toBe(true);
    expect(isPointInObject({ x: 140, y: 120 }, obj)).toBe(true);
    expect(isPointInObject({ x: 20, y: 20 }, obj)).toBe(false);
    expect(isPointInObject({ x: 200, y: 200 }, obj)).toBe(false);
  });

  it('calculates handles and detects handle clicks', () => {
    const obj: CanvasObject = {
      id: 'test_2',
      name: 'Box',
      type: 'shape',
      shapeType: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      flipX: false,
      flipY: false,
      zIndex: 1,
      fill: '#ffffff',
      stroke: 'transparent',
      strokeWidth: 0,
    };

    const handles = getObjectHandles(obj);
    expect(handles.se).toEqual({ x: 300, y: 200 });
    expect(handles.nw).toEqual({ x: 100, y: 100 });

    const clickedHandle = getClickedHandle({ x: 302, y: 201 }, obj, 10);
    expect(clickedHandle).toBe('se');
  });
});
