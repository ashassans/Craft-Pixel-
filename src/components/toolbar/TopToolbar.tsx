import {
  Download,
  FolderOpen,
  Keyboard,
  Maximize2,
  Minus,
  Plus,
  Redo2,
  Save,
  Type,
  Undo2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

interface TopToolbarProps {
  onBackToHome: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ onBackToHome }) => {
  const {
    project,
    scale,
    undoStack,
    redoStack,
    isSaving,
    undo,
    redo,
    zoomIn,
    zoomOut,
    zoomFit,
    saveCurrentProject,
    setExportModalOpen,
    setShortcutsModalOpen,
    setFontModalOpen,
    setProject,
  } = useEditorStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project?.name || 'Untitled Artwork');

  if (!project) return null;

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== project.name) {
      setProject({
        ...project,
        name: titleValue.trim(),
        updatedAt: Date.now(),
      });
      saveCurrentProject().catch(console.error);
    }
  };

  return (
    <header className="h-14 bg-neutral-900 border-b border-white/8 px-4 flex items-center justify-between gap-4 z-20 shrink-0">
      {/* Zone 1: Brand & Project Navigation */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors text-xs font-medium cursor-pointer"
          title="Back to Projects"
        >
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Projects</span>
        </button>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Project Name editable */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') setIsEditingTitle(false);
            }}
            autoFocus
            className="bg-neutral-950 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white font-medium focus:outline-none w-28 sm:w-56"
          />
        ) : (
          <button
            onClick={() => {
              setTitleValue(project.name);
              setIsEditingTitle(true);
            }}
            className="text-xs font-semibold text-neutral-200 hover:text-indigo-400 truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[220px] text-left transition-colors cursor-pointer"
            title="Click to rename project"
          >
            {project.name}
          </button>
        )}

        {/* Dimension indicator */}
        <span className="hidden lg:inline-flex text-[11px] font-mono text-neutral-400 bg-neutral-800/60 px-2 py-0.5 rounded">
          {project.width} × {project.height}
        </span>
      </div>

      {/* Zone 2: History & Zoom Center Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Zoom Controls (Hidden on small mobile screens to prevent overflow; mobile users pinch-to-zoom) */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={zoomOut}
            className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-neutral-300 w-12 text-center select-none">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const container = document.querySelector('.bg-checkered');
              if (container) {
                const rect = container.getBoundingClientRect();
                zoomFit(rect.width, rect.height);
              }
            }}
            className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer transition-colors"
            title="Fit Canvas to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zone 3: Actions (Fonts, Shortcuts, Save, Export) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={() => setFontModalOpen(true)}
          className="p-1.5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer hidden lg:inline-flex"
          title="Custom Fonts & Bengali Unicode"
        >
          <Type className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="p-1.5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer hidden lg:inline-flex"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          onClick={() => saveCurrentProject()}
          disabled={isSaving}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Save to Browser IndexedDB"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Saved'}</span>
        </button>

        <button
          onClick={() => setExportModalOpen(true)}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm shadow-indigo-500/20 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
