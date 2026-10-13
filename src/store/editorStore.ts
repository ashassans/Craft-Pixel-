import { create } from 'zustand';
import { generateProjectThumbnail } from '../engine/export-renderer';
import { saveProjectToDB } from '../services/projectStorage';
import { BackgroundSettings, CanvasObject, ProjectMetadata } from '../types/editor';

const MAX_HISTORY = 30;

export interface EditorState {
  // Current active project
  project: ProjectMetadata | null;
  selectedObjectId: string | null;
  activeSidebarTab: 'templates' | 'text' | 'shapes' | 'images' | 'stickers' | 'background' | 'layers' | 'settings';
  
  // Viewport
  scale: number;
  panX: number;
  panY: number;

  // History
  undoStack: ProjectMetadata[];
  redoStack: ProjectMetadata[];

  // UI state
  isExportModalOpen: boolean;
  isNewProjectModalOpen: boolean;
  isFontModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;

  // Actions
  setProject: (project: ProjectMetadata) => void;
  createNewProject: (name: string, width: number, height: number, background?: BackgroundSettings) => void;
  setSelectedObjectId: (id: string | null) => void;
  setActiveSidebarTab: (tab: EditorState['activeSidebarTab']) => void;
  setViewport: (scale: number, panX: number, panY: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  zoomFit: (viewportWidth: number, viewportHeight: number) => void;

  // Object Operations
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, partial: Partial<CanvasObject>, recordHistory?: boolean) => void;
  deleteObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;
  renameObject: (id: string, name: string) => void;
  reorderLayer: (id: string, direction: 'up' | 'down' | 'front' | 'back') => void;
  alignObject: (id: string, alignment: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;

  // Background
  setBackground: (bg: Partial<BackgroundSettings>) => void;
  resizeCanvas: (width: number, height: number) => void;

  // History & Persistence
  pushHistorySnapshot: () => void;
  undo: () => void;
  redo: () => void;
  saveCurrentProject: () => Promise<void>;

  // Modals
  setExportModalOpen: (open: boolean) => void;
  setNewProjectModalOpen: (open: boolean) => void;
  setFontModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  selectedObjectId: null,
  activeSidebarTab: 'text',
  scale: 1,
  panX: 0,
  panY: 0,
  undoStack: [],
  redoStack: [],
  isExportModalOpen: false,
  isNewProjectModalOpen: false,
  isFontModalOpen: false,
  isShortcutsModalOpen: false,
  isSaving: false,
  lastSavedAt: null,

  setProject: (project) => {
    set({
      project,
      selectedObjectId: null,
      undoStack: [],
      redoStack: [],
      lastSavedAt: Date.now(),
    });
  },

  createNewProject: (name, width, height, background) => {
    const defaultBg: BackgroundSettings = background || {
      type: 'solid',
      color: '#0f172a',
      opacity: 1,
    };

    const newProject: ProjectMetadata = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'Untitled Artwork',
      width: Math.max(100, width),
      height: Math.max(100, height),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      background: defaultBg,
      objects: [],
      version: '1.0',
    };

    set({
      project: newProject,
      selectedObjectId: null,
      undoStack: [],
      redoStack: [],
      lastSavedAt: Date.now(),
    });

    // Save to IndexedDB
    saveProjectToDB(newProject).catch(console.error);
  },

  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),

  setViewport: (scale, panX, panY) => set({ scale, panX, panY }),

  zoomIn: () => {
    const { scale } = get();
    const newScale = Math.min(5, scale * 1.25);
    set({ scale: newScale });
  },

  zoomOut: () => {
    const { scale } = get();
    const newScale = Math.max(0.1, scale / 1.25);
    set({ scale: newScale });
  },

  zoomReset: () => set({ scale: 1, panX: 0, panY: 0 }),

  zoomFit: (viewportWidth, viewportHeight) => {
    const { project } = get();
    if (!project || viewportWidth <= 0 || viewportHeight <= 0) return;

    const padding = 60;
    const availW = Math.max(100, viewportWidth - padding);
    const availH = Math.max(100, viewportHeight - padding);

    const scaleX = availW / project.width;
    const scaleY = availH / project.height;
    const fitScale = Math.min(scaleX, scaleY, 1.5);

    const panX = (viewportWidth - project.width * fitScale) / 2;
    const panY = (viewportHeight - project.height * fitScale) / 2;

    set({ scale: fitScale, panX, panY });
  },

  pushHistorySnapshot: () => {
    const { project, undoStack } = get();
    if (!project) return;

    const cloned = JSON.parse(JSON.stringify(project));
    const newUndo = [...undoStack, cloned].slice(-MAX_HISTORY);

    set({
      undoStack: newUndo,
      redoStack: [], // clearing redo branch on new change
    });
  },

  addObject: (obj) => {
    const { project, pushHistorySnapshot } = get();
    if (!project) return;

    pushHistorySnapshot();

    const maxZ = project.objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
    const newObj = { ...obj, zIndex: maxZ + 1 };

    const updatedProject: ProjectMetadata = {
      ...project,
      updatedAt: Date.now(),
      objects: [...project.objects, newObj],
    };

    set({
      project: updatedProject,
      selectedObjectId: newObj.id,
    });

    get().saveCurrentProject().catch(console.error);
  },

  updateObject: (id, partial, recordHistory = true) => {
    const { project, pushHistorySnapshot } = get();
    if (!project) return;

    if (recordHistory) {
      pushHistorySnapshot();
    }

    const updatedObjects = project.objects.map((obj) => {
      if (obj.id !== id) return obj;
      return { ...obj, ...partial } as CanvasObject;
    });

    const updatedProject: ProjectMetadata = {
      ...project,
      updatedAt: Date.now(),
      objects: updatedObjects,
    };

    set({ project: updatedProject });

    if (recordHistory) {
      get().saveCurrentProject().catch(console.error);
    }
  },

  deleteObject: (id) => {
    const { project, pushHistorySnapshot, selectedObjectId } = get();
    if (!project) return;

    pushHistorySnapshot();

    const updatedObjects = project.objects.filter((obj) => obj.id !== id);
    const updatedProject: ProjectMetadata = {
      ...project,
      updatedAt: Date.now(),
      objects: updatedObjects,
    };

    set({
      project: updatedProject,
      selectedObjectId: selectedObjectId === id ? null : selectedObjectId,
    });

    get().saveCurrentProject().catch(console.error);
  },

  duplicateObject: (id) => {
    const { project, pushHistorySnapshot } = get();
    if (!project) return;

    const target = project.objects.find((o) => o.id === id);
    if (!target) return;

    pushHistorySnapshot();

    const maxZ = project.objects.reduce((max, o) => Math.max(max, o.zIndex), 0);
    const duplicated: CanvasObject = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'obj_' + Math.random().toString(36).substring(2, 9),
      name: `${target.name} (Copy)`,
      x: target.x + 24,
      y: target.y + 24,
      zIndex: maxZ + 1,
    };

    const updatedProject: ProjectMetadata = {
      ...project,
      updatedAt: Date.now(),
      objects: [...project.objects, duplicated],
    };

    set({
      project: updatedProject,
      selectedObjectId: duplicated.id,
    });

    get().saveCurrentProject().catch(console.error);
  },

  toggleLock: (id) => {
    const { project } = get();
    if (!project) return;

    const target = project.objects.find((o) => o.id === id);
    if (!target) return;

    get().updateObject(id, { locked: !target.locked });
  },

  toggleVisibility: (id) => {
    const { project, selectedObjectId } = get();
    if (!project) return;

    const target = project.objects.find((o) => o.id === id);
    if (!target) return;

    const newVisible = !target.visible;
    get().updateObject(id, { visible: newVisible });

    if (!newVisible && selectedObjectId === id) {
      set({ selectedObjectId: null });
    }
  },

  renameObject: (id, name) => {
    get().updateObject(id, { name });
  },

  reorderLayer: (id, direction) => {
    const { project, pushHistorySnapshot } = get();
    if (!project) return;

    pushHistorySnapshot();

    const sorted = [...project.objects].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((o) => o.id === id);
    if (idx === -1) return;

    if (direction === 'up' && idx < sorted.length - 1) {
      const temp = sorted[idx];
      sorted[idx] = sorted[idx + 1];
      sorted[idx + 1] = temp;
    } else if (direction === 'down' && idx > 0) {
      const temp = sorted[idx];
      sorted[idx] = sorted[idx - 1];
      sorted[idx - 1] = temp;
    } else if (direction === 'front') {
      const item = sorted.splice(idx, 1)[0];
      sorted.push(item);
    } else if (direction === 'back') {
      const item = sorted.splice(idx, 1)[0];
      sorted.unshift(item);
    }

    // Reassign sequential zIndex
    const reindexed = sorted.map((obj, i) => ({ ...obj, zIndex: i + 1 }));

    const updatedProject: ProjectMetadata = {
      ...project,
      updatedAt: Date.now(),
      objects: reindexed,
    };

    set({ project: updatedProject });
    get().saveCurrentProject().catch(console.error);
  },

  alignObject: (id, alignment) => {
    const { project, pushHistorySnapshot } = get();
    if (!project) return;

    const obj = project.objects.find((o) => o.id === id);
    if (!obj) return;

    pushHistorySnapshot();

    let newX = obj.x;
    let newY = obj.y;

    switch (alignment) {
      case 'left':
        newX = 0;
        break;
      case 'center-h':
        newX = (project.width - obj.width) / 2;
        break;
      case 'right':
        newX = project.width - obj.width;
        break;
      case 'top':
        newY = 0;
        break;
      case 'center-v':
        newY = (project.height - obj.height) / 2;
        break;
      case 'bottom':
        newY = project.height - obj.height;
        break;
    }

    get().updateObject(id, { x: newX, y: newY });
  },

  setBackground: (bgPartial) => {
    const { project, pushHistorySnapshot } = get();
    if (!project) return;

    pushHistorySnapshot();

    const updatedProject: ProjectMetadata = {
      ...project,
      updatedAt: Date.now(),
      background: {
        ...project.background,
        ...bgPartial,
      },
    };

    set({ project: updatedProject });
    get().saveCurrentProject().catch(console.error);
  },

  resizeCanvas: (width, height) => {
    const { project, pushHistorySnapshot } = get();
    if (!project) return;

    pushHistorySnapshot();

    const updatedProject: ProjectMetadata = {
      ...project,
      width: Math.max(100, Math.round(width)),
      height: Math.max(100, Math.round(height)),
      updatedAt: Date.now(),
    };

    set({ project: updatedProject });
    get().saveCurrentProject().catch(console.error);
  },

  undo: () => {
    const { project, undoStack, redoStack } = get();
    if (!project || undoStack.length === 0) return;

    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    const newRedo = [JSON.parse(JSON.stringify(project)), ...redoStack].slice(0, MAX_HISTORY);

    set({
      project: previous,
      undoStack: newUndo,
      redoStack: newRedo,
    });

    saveProjectToDB(previous).catch(console.error);
  },

  redo: () => {
    const { project, undoStack, redoStack } = get();
    if (!project || redoStack.length === 0) return;

    const next = redoStack[0];
    const newRedo = redoStack.slice(1);
    const newUndo = [...undoStack, JSON.parse(JSON.stringify(project))].slice(-MAX_HISTORY);

    set({
      project: next,
      undoStack: newUndo,
      redoStack: newRedo,
    });

    saveProjectToDB(next).catch(console.error);
  },

  saveCurrentProject: async () => {
    const { project } = get();
    if (!project) return;

    set({ isSaving: true });
    try {
      const thumbnail = await generateProjectThumbnail(project, 320);
      const projectWithThumb: ProjectMetadata = {
        ...project,
        thumbnail,
        updatedAt: Date.now(),
      };
      await saveProjectToDB(projectWithThumb);
      set({ project: projectWithThumb, isSaving: false, lastSavedAt: Date.now() });
    } catch (err) {
      console.error('Failed to save project:', err);
      set({ isSaving: false });
    }
  },

  setExportModalOpen: (open) => set({ isExportModalOpen: open }),
  setNewProjectModalOpen: (open) => set({ isNewProjectModalOpen: open }),
  setFontModalOpen: (open) => set({ isFontModalOpen: open }),
  setShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
}));
