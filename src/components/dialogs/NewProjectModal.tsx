import { Layout, Plus, Sparkles, X } from 'lucide-react';
import React, { useState } from 'react';
import { CANVAS_PRESETS } from '../../data/presets';
import { useEditorStore } from '../../store/editorStore';
import { BackgroundSettings } from '../../types/editor';

interface NewProjectModalProps {
  onProjectCreated?: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onProjectCreated }) => {
  const { isNewProjectModalOpen, setNewProjectModalOpen, createNewProject } = useEditorStore();

  const [projectName, setProjectName] = useState<string>('My Graphic Artwork');
  const [width, setWidth] = useState<number>(1280);
  const [height, setHeight] = useState<number>(720);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('yt-thumb');
  const [bgType, setBgType] = useState<'dark' | 'black' | 'light' | 'transparent'>('dark');

  if (!isNewProjectModalOpen) return null;

  const handleSelectPreset = (preset: (typeof CANVAS_PRESETS)[0]) => {
    setSelectedPresetId(preset.id);
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleCreate = () => {
    let background: BackgroundSettings;
    if (bgType === 'transparent') {
      background = { type: 'transparent', color: 'transparent', opacity: 1 };
    } else if (bgType === 'black') {
      background = { type: 'solid', color: '#09090b', opacity: 1 };
    } else if (bgType === 'light') {
      background = { type: 'solid', color: '#f8fafc', opacity: 1 };
    } else {
      background = {
        type: 'solid',
        color: '#0f172a',
        opacity: 1,
      };
    }

    createNewProject(projectName, width, height, background);
    setNewProjectModalOpen(false);
    if (onProjectCreated) onProjectCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-white/8 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Create New Project</h2>
          </div>
          <button
            onClick={() => setNewProjectModalOpen(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Project Name */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. YouTube Tech Thumbnail"
            />
          </div>

          {/* Preset Grid */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-indigo-400" />
              <span>Canvas Preset</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CANVAS_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    selectedPresetId === p.id
                      ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                      : 'bg-neutral-950 border-white/6 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-xs font-semibold truncate block">{p.name}</span>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-mono">
                      {p.width} × {p.height}
                    </span>
                    <span>{p.aspectRatio}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Width (pixels)
              </label>
              <input
                type="number"
                min="100"
                max="8000"
                value={width}
                onChange={(e) => {
                  setWidth(Number(e.target.value));
                  setSelectedPresetId('custom');
                }}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Height (pixels)
              </label>
              <input
                type="number"
                min="100"
                max="8000"
                value={height}
                onChange={(e) => {
                  setHeight(Number(e.target.value));
                  setSelectedPresetId('custom');
                }}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Initial Background Color */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Initial Background
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => setBgType('dark')}
                className={`py-2 rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer ${
                  bgType === 'dark'
                    ? 'bg-slate-900 border-indigo-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-white/20" />
                <span>Slate</span>
              </button>
              <button
                onClick={() => setBgType('black')}
                className={`py-2 rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer ${
                  bgType === 'black'
                    ? 'bg-neutral-950 border-indigo-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-black border border-white/20" />
                <span>Black</span>
              </button>
              <button
                onClick={() => setBgType('light')}
                className={`py-2 rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer ${
                  bgType === 'light'
                    ? 'bg-neutral-950 border-indigo-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-slate-100" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setBgType('transparent')}
                className={`py-2 rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer ${
                  bgType === 'transparent'
                    ? 'bg-neutral-950 border-indigo-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-neutral-800 border border-dashed border-white/40" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-16 px-6 border-t border-white/8 flex items-center justify-end gap-3 shrink-0 bg-neutral-950">
          <button
            onClick={() => setNewProjectModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Artwork</span>
          </button>
        </div>
      </div>
    </div>
  );
};
