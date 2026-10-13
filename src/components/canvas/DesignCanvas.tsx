import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  getClickedHandle,
  isPointInObject,
  Point,
  rotatePoint,
  screenToWorld,
} from '../../engine/coordinate-system';
import { renderScene } from '../../engine/renderer';
import { useEditorStore } from '../../store/editorStore';
import { CanvasObject, TransformHandle } from '../../types/editor';

type DragMode = 'none' | 'move' | 'handle' | 'rotate' | 'pan';

export const DesignCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    project,
    selectedObjectId,
    scale,
    panX,
    panY,
    setSelectedObjectId,
    updateObject,
    pushHistorySnapshot,
    setViewport,
    zoomFit,
  } = useEditorStore();

  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [activeHandle, setActiveHandle] = useState<TransformHandle | null>(null);
  const [cursorStyle, setCursorStyle] = useState<string>('default');
  const [activeGuides, setActiveGuides] = useState<{ x?: number; y?: number }>({});

  // Refs for tracking drag operations
  const dragStartRef = useRef<{
    startWorldPt: Point;
    startScreenPt: Point;
    initialObjectState: CanvasObject | null;
    initialPan: { x: number; y: number };
    pinchDist: number | null;
  }>({
    startWorldPt: { x: 0, y: 0 },
    startScreenPt: { x: 0, y: 0 },
    initialObjectState: null,
    initialPan: { x: 0, y: 0 },
    pinchDist: null,
  });

  const isSpacePressedRef = useRef<boolean>(false);

  // Resize canvas to container dimensions with devicePixelRatio
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Fit canvas on initial project load
  useEffect(() => {
    if (containerRef.current && project) {
      updateCanvasDimensions();
      const rect = containerRef.current.getBoundingClientRect();
      zoomFit(rect.width, rect.height);
    }
  }, [project?.id]);

  useEffect(() => {
    window.addEventListener('resize', updateCanvasDimensions);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [updateCanvasDimensions]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderScene({
      ctx,
      canvasWidth: project.width,
      canvasHeight: project.height,
      background: project.background,
      objects: project.objects,
      selectedObjectId,
      scale,
      panX,
      panY,
      activeGuideLines: activeGuides,
      isExporting: false,
    });
  }, [project, selectedObjectId, scale, panX, panY, activeGuides]);

  // Keyboard controls (Space to pan, Arrow keys to nudge, Delete, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input / textarea / contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        isSpacePressedRef.current = true;
        setCursorStyle('grab');
      }

      if (e.key === 'Escape') {
        setSelectedObjectId(null);
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) {
          e.preventDefault();
          useEditorStore.getState().deleteObject(selectedObjectId);
        }
      }

      // Arrow keys fine-tuning
      if (selectedObjectId && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const obj = project?.objects.find((o) => o.id === selectedObjectId);
        if (obj && !obj.locked) {
          const delta = e.shiftKey ? 10 : 1;
          let dx = 0;
          let dy = 0;
          if (e.key === 'ArrowLeft') dx = -delta;
          if (e.key === 'ArrowRight') dx = delta;
          if (e.key === 'ArrowUp') dy = -delta;
          if (e.key === 'ArrowDown') dy = delta;

          updateObject(selectedObjectId, { x: obj.x + dx, y: obj.y + dy }, true);
        }
      }

      // Undo / Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          useEditorStore.getState().redo();
        } else {
          useEditorStore.getState().undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        useEditorStore.getState().redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedObjectId) {
          useEditorStore.getState().duplicateObject(selectedObjectId);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        setCursorStyle('default');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [project, selectedObjectId, setSelectedObjectId, updateObject]);

  // Pointer Down Handler
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;

    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const worldPt = screenToWorld(e.clientX, e.clientY, rect, scale, panX, panY);

    dragStartRef.current = {
      startWorldPt: worldPt,
      startScreenPt: { x: e.clientX, y: e.clientY },
      initialObjectState: null,
      initialPan: { x: panX, y: panY },
      pinchDist: null,
    };

    // 1. Spacebar pressed or Middle click -> Pan canvas
    if (isSpacePressedRef.current || e.button === 1) {
      setDragMode('pan');
      setCursorStyle('grabbing');
      return;
    }

    // 2. Check if a handle on selected object was clicked
    if (selectedObjectId) {
      const selectedObj = project.objects.find((o) => o.id === selectedObjectId);
      if (selectedObj && !selectedObj.locked) {
        const handle = getClickedHandle(worldPt, selectedObj, 14 / scale);
        if (handle) {
          pushHistorySnapshot();
          dragStartRef.current.initialObjectState = JSON.parse(JSON.stringify(selectedObj));

          if (handle === 'rotate') {
            setDragMode('rotate');
            setCursorStyle('crosshair');
          } else {
            setDragMode('handle');
            setActiveHandle(handle);
            setCursorStyle(getHandleCursor(handle, selectedObj.rotation));
          }
          return;
        }
      }
    }

    // 3. Hit-test objects in reverse z-index (top to bottom)
    const sorted = [...project.objects].sort((a, b) => b.zIndex - a.zIndex);
    let hitObject: CanvasObject | null = null;

    for (const obj of sorted) {
      if (isPointInObject(worldPt, obj)) {
        hitObject = obj;
        break;
      }
    }

    if (hitObject) {
      setSelectedObjectId(hitObject.id);
      if (!hitObject.locked) {
        pushHistorySnapshot();
        dragStartRef.current.initialObjectState = JSON.parse(JSON.stringify(hitObject));
        setDragMode('move');
        setCursorStyle('move');
      }
    } else {
      // Clicked on empty canvas background
      setSelectedObjectId(null);
      // Allow pan if drag begins on background
      setDragMode('pan');
      setCursorStyle('grabbing');
    }
  };

  // Pointer Move Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;

    const rect = canvas.getBoundingClientRect();
    const worldPt = screenToWorld(e.clientX, e.clientY, rect, scale, panX, panY);

    // Dynamic Hover Cursors when idle
    if (dragMode === 'none') {
      if (isSpacePressedRef.current) {
        setCursorStyle('grab');
        return;
      }

      if (selectedObjectId) {
        const selectedObj = project.objects.find((o) => o.id === selectedObjectId);
        if (selectedObj && !selectedObj.locked) {
          const handle = getClickedHandle(worldPt, selectedObj, 12 / scale);
          if (handle) {
            if (handle === 'rotate') {
              setCursorStyle('crosshair');
            } else {
              setCursorStyle(getHandleCursor(handle, selectedObj.rotation));
            }
            return;
          }
        }
      }

      // Check if hovering over any object
      const hovered = project.objects.some((o) => isPointInObject(worldPt, o));
      setCursorStyle(hovered ? 'move' : 'default');
      return;
    }

    // Dragging: Panning Canvas Viewport
    if (dragMode === 'pan') {
      const dx = e.clientX - dragStartRef.current.startScreenPt.x;
      const dy = e.clientY - dragStartRef.current.startScreenPt.y;
      setViewport(
        scale,
        dragStartRef.current.initialPan.x + dx,
        dragStartRef.current.initialPan.y + dy
      );
      return;
    }

    // Moving Selected Object
    if (dragMode === 'move' && selectedObjectId && dragStartRef.current.initialObjectState) {
      const initial = dragStartRef.current.initialObjectState;
      const dx = worldPt.x - dragStartRef.current.startWorldPt.x;
      const dy = worldPt.y - dragStartRef.current.startWorldPt.y;

      let targetX = initial.x + dx;
      let targetY = initial.y + dy;

      // Smart Snapping to Canvas Center & Edges
      const objCenterX = targetX + initial.width / 2;
      const objCenterY = targetY + initial.height / 2;
      const canvasCenterX = project.width / 2;
      const canvasCenterY = project.height / 2;
      const snapThreshold = 8 / scale;

      const guides: { x?: number; y?: number } = {};

      if (Math.abs(objCenterX - canvasCenterX) <= snapThreshold) {
        targetX = canvasCenterX - initial.width / 2;
        guides.x = canvasCenterX;
      } else if (Math.abs(targetX) <= snapThreshold) {
        targetX = 0;
        guides.x = 0;
      } else if (Math.abs(targetX + initial.width - project.width) <= snapThreshold) {
        targetX = project.width - initial.width;
        guides.x = project.width;
      }

      if (Math.abs(objCenterY - canvasCenterY) <= snapThreshold) {
        targetY = canvasCenterY - initial.height / 2;
        guides.y = canvasCenterY;
      } else if (Math.abs(targetY) <= snapThreshold) {
        targetY = 0;
        guides.y = 0;
      } else if (Math.abs(targetY + initial.height - project.height) <= snapThreshold) {
        targetY = project.height - initial.height;
        guides.y = project.height;
      }

      setActiveGuides(guides);
      updateObject(selectedObjectId, { x: targetX, y: targetY }, false);
      return;
    }

    // Rotating Selected Object
    if (dragMode === 'rotate' && selectedObjectId && dragStartRef.current.initialObjectState) {
      const initial = dragStartRef.current.initialObjectState;
      const centerX = initial.x + initial.width / 2;
      const centerY = initial.y + initial.height / 2;

      const angleRad = Math.atan2(worldPt.y - centerY, worldPt.x - centerX);
      let angleDeg = (angleRad * 180) / Math.PI + 90;
      if (angleDeg < 0) angleDeg += 360;

      // Snap to 0, 45, 90, 180, 270 degrees
      const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      for (const sa of snapAngles) {
        if (Math.abs(angleDeg - sa) <= 3) {
          angleDeg = sa === 360 ? 0 : sa;
          break;
        }
      }

      updateObject(selectedObjectId, { rotation: Math.round(angleDeg) }, false);
      return;
    }

    // Resizing via Transform Handles
    if (
      dragMode === 'handle' &&
      activeHandle &&
      selectedObjectId &&
      dragStartRef.current.initialObjectState
    ) {
      const initial = dragStartRef.current.initialObjectState;
      const center: Point = {
        x: initial.x + initial.width / 2,
        y: initial.y + initial.height / 2,
      };

      // Unrotate both start point and current point to work in object local space
      const localStart = rotatePoint(dragStartRef.current.startWorldPt, center, -initial.rotation);
      const localCurrent = rotatePoint(worldPt, center, -initial.rotation);

      const dLocalX = localCurrent.x - localStart.x;
      const dLocalY = localCurrent.y - localStart.y;

      let newWidth = initial.width;
      let newHeight = initial.height;
      let localShiftX = 0;
      let localShiftY = 0;

      switch (activeHandle) {
        case 'se':
          newWidth = Math.max(20, initial.width + dLocalX);
          newHeight = Math.max(20, initial.height + dLocalY);
          localShiftX = (newWidth - initial.width) / 2;
          localShiftY = (newHeight - initial.height) / 2;
          break;
        case 'nw':
          newWidth = Math.max(20, initial.width - dLocalX);
          newHeight = Math.max(20, initial.height - dLocalY);
          localShiftX = -(newWidth - initial.width) / 2;
          localShiftY = -(newHeight - initial.height) / 2;
          break;
        case 'ne':
          newWidth = Math.max(20, initial.width + dLocalX);
          newHeight = Math.max(20, initial.height - dLocalY);
          localShiftX = (newWidth - initial.width) / 2;
          localShiftY = -(newHeight - initial.height) / 2;
          break;
        case 'sw':
          newWidth = Math.max(20, initial.width - dLocalX);
          newHeight = Math.max(20, initial.height + dLocalY);
          localShiftX = -(newWidth - initial.width) / 2;
          localShiftY = (newHeight - initial.height) / 2;
          break;
        case 'e':
          newWidth = Math.max(20, initial.width + dLocalX);
          localShiftX = (newWidth - initial.width) / 2;
          break;
        case 'w':
          newWidth = Math.max(20, initial.width - dLocalX);
          localShiftX = -(newWidth - initial.width) / 2;
          break;
        case 's':
          newHeight = Math.max(20, initial.height + dLocalY);
          localShiftY = (newHeight - initial.height) / 2;
          break;
        case 'n':
          newHeight = Math.max(20, initial.height - dLocalY);
          localShiftY = -(newHeight - initial.height) / 2;
          break;
      }

      // Re-rotate the local center displacement back to world space
      const worldCenterShift = rotatePoint(
        { x: localShiftX, y: localShiftY },
        { x: 0, y: 0 },
        initial.rotation
      );

      const newX = initial.x + (localShiftX - (newWidth - initial.width) / 2) + worldCenterShift.x;
      const newY = initial.y + (localShiftY - (newHeight - initial.height) / 2) + worldCenterShift.y;

      updateObject(
        selectedObjectId,
        {
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          x: Math.round(newX),
          y: Math.round(newY),
        },
        false
      );
    }
  };

  // Pointer Up Handler
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    if (dragMode !== 'none') {
      // Save state to IndexedDB after drag concludes
      if (dragMode === 'move' || dragMode === 'handle' || dragMode === 'rotate') {
        useEditorStore.getState().saveCurrentProject().catch(console.error);
      }
    }

    setDragMode('none');
    setActiveHandle(null);
    setActiveGuides({});
    setCursorStyle(isSpacePressedRef.current ? 'grab' : 'default');
  };

  // Mouse Wheel Zoom centered at cursor
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.min(6, Math.max(0.1, scale * zoomFactor));

    // Keep point under mouse fixed in world coordinates
    const newPanX = mouseX - (mouseX - panX) * (newScale / scale);
    const newPanY = mouseY - (mouseY - panY) * (newScale / scale);

    setViewport(newScale, newPanX, newPanY);
  };

  // Touch pinch-to-zoom support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      dragStartRef.current.pinchDist = dist;
      setDragMode('none');
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2 && dragStartRef.current.pinchDist !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const newDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const ratio = newDist / dragStartRef.current.pinchDist;

      const newScale = Math.min(6, Math.max(0.1, scale * ratio));
      setViewport(newScale, panX, panY);
      dragStartRef.current.pinchDist = newDist;
    }
  };

  const handleTouchEnd = () => {
    dragStartRef.current.pinchDist = null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const canvas = canvasRef.current;
    if (!canvas || !project) return;
    const rect = canvas.getBoundingClientRect();
    const worldPt = screenToWorld(e.clientX, e.clientY, rect, scale, panX, panY);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = Math.min(project.width * 0.7, 500);
        const s = Math.min(1, maxWidth / img.naturalWidth);
        const w = Math.round(img.naturalWidth * s);
        const h = Math.round(img.naturalHeight * s);

        const newImgObj: CanvasObject = {
          id: 'img_' + Math.random().toString(36).substring(2, 9),
          name: file.name.replace(/\.[^/.]+$/, '') || 'Dropped Image',
          type: 'image',
          x: Math.round(worldPt.x - w / 2),
          y: Math.round(worldPt.y - h / 2),
          width: w,
          height: h,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          flipX: false,
          flipY: false,
          zIndex: 1,
          src: dataUrl,
          aspectRatioLocked: true,
          filters: {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: 0,
            sepia: 0,
            hueRotate: 0,
            invert: 0,
          },
          border: { color: 'transparent', width: 0, radius: 0 },
        };
        useEditorStore.getState().addObject(newImgObj);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative flex-1 w-full h-full overflow-hidden bg-neutral-950 bg-checkered select-none flex items-center justify-center cursor-default"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="canvas-interactive block"
        style={{ cursor: cursorStyle }}
      />
    </div>
  );
};

function getHandleCursor(handle: TransformHandle, rotation: number): string {
  const handleAngles: Record<TransformHandle, number> = {
    n: 0,
    ne: 45,
    e: 90,
    se: 135,
    s: 180,
    sw: 225,
    w: 270,
    nw: 315,
    rotate: 0,
  };

  const totalAngle = (handleAngles[handle] + rotation) % 360;
  const normalized = (totalAngle + 360) % 360;

  if (normalized >= 337.5 || normalized < 22.5) return 'ns-resize';
  if (normalized >= 22.5 && normalized < 67.5) return 'nesw-resize';
  if (normalized >= 67.5 && normalized < 112.5) return 'ew-resize';
  if (normalized >= 112.5 && normalized < 157.5) return 'nwse-resize';
  if (normalized >= 157.5 && normalized < 202.5) return 'ns-resize';
  if (normalized >= 202.5 && normalized < 247.5) return 'nesw-resize';
  if (normalized >= 247.5 && normalized < 292.5) return 'ew-resize';
  return 'nwse-resize';
}
