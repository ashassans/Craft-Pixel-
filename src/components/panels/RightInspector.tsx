import {
  AlignCenter,
  AlignHorizontalDistributeCenter,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignVerticalDistributeCenter,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Bold,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  Italic,
  Layers as LayersIcon,
  Lock,
  Sliders,
  Strikethrough,
  Trash2,
  Underline,
  Unlock,
} from 'lucide-react';
import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import {
  CanvasObject,
  ImageObject,
  ShapeObject,
  StickerObject,
  TextObject,
} from '../../types/editor';

const FONT_OPTIONS = [
  { name: 'Plus Jakarta Sans', category: 'Modern' },
  { name: 'Hind Siliguri', category: 'বাংলা (Bengali)' },
  { name: 'Noto Sans Bengali', category: 'বাংলা (Bengali)' },
  { name: 'Montserrat', category: 'Display' },
  { name: 'Anton', category: 'Bold Impact' },
  { name: 'Playfair Display', category: 'Serif' },
  { name: 'Oswald', category: 'Condensed' },
  { name: 'JetBrains Mono', category: 'Monospace' },
  { name: 'Caveat', category: 'Handwriting' },
  { name: 'Bangers', category: 'Comic' },
];

export const RightInspector: React.FC = () => {
  const {
    project,
    selectedObjectId,
    setSelectedObjectId,
    updateObject,
    deleteObject,
    duplicateObject,
    toggleLock,
    toggleVisibility,
    reorderLayer,
    alignObject,
    resizeCanvas,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState<string>('');

  // Canvas dimension edit states
  const [canvasW, setCanvasW] = useState<number>(project?.width || 1280);
  const [canvasH, setCanvasH] = useState<number>(project?.height || 720);

  if (!project) return null;

  const selectedObj = project.objects.find((o) => o.id === selectedObjectId);

  // Sync canvas width and height input when project changes
  if (canvasW !== project.width && !selectedObj) {
    setCanvasW(project.width);
  }
  if (canvasH !== project.height && !selectedObj) {
    setCanvasH(project.height);
  }

  // Handle Layer Rename
  const handleSaveLayerName = (id: string) => {
    if (editingLayerName.trim()) {
      updateObject(id, { name: editingLayerName.trim() });
    }
    setEditingLayerId(null);
  };

  return (
    <div className="w-80 bg-neutral-900 border-l border-white/8 flex flex-col h-full z-10 shrink-0">
      {/* Top Inspector Tab Switcher */}
      <div className="h-11 border-b border-white/8 px-3 flex items-center gap-1 shrink-0 bg-neutral-950">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'properties'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Properties</span>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <LayersIcon className="w-3.5 h-3.5" />
          <span>Layers ({project.objects.length})</span>
        </button>
      </div>

      {/* Main Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* ================= LAYERS VIEW ================= */}
        {activeTab === 'layers' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">Layer Stack</span>
              {selectedObjectId && (
                <button
                  onClick={() => setSelectedObjectId(null)}
                  className="text-[11px] text-neutral-400 hover:text-indigo-400 cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {project.objects.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs">
                No layers added yet. Use the tools on the left to add text, shapes, or images.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {[...project.objects]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((obj) => {
                    const isSelected = obj.id === selectedObjectId;
                    return (
                      <div
                        key={obj.id}
                        onClick={() => setSelectedObjectId(obj.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500/50 text-white'
                            : 'bg-neutral-800/60 border-white/6 text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate flex-1 mr-2">
                          <span className="text-[10px] uppercase font-mono px-1 rounded bg-neutral-900 text-neutral-400 shrink-0">
                            {obj.type}
                          </span>

                          {editingLayerId === obj.id ? (
                            <input
                              type="text"
                              value={editingLayerName}
                              onChange={(e) => setEditingLayerName(e.target.value)}
                              onBlur={() => handleSaveLayerName(obj.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveLayerName(obj.id);
                                if (e.key === 'Escape') setEditingLayerId(null);
                              }}
                              autoFocus
                              className="bg-neutral-950 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-28"
                            />
                          ) : (
                            <span
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingLayerId(obj.id);
                                setEditingLayerName(obj.name);
                              }}
                              className="truncate font-medium select-none"
                              title="Double click to rename"
                            >
                              {obj.name}
                            </span>
                          )}
                        </div>

                        {/* Layer Actions */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => toggleVisibility(obj.id)}
                            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700 cursor-pointer"
                            title={obj.visible ? 'Hide' : 'Show'}
                          >
                            {obj.visible ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-neutral-600" />
                            )}
                          </button>

                          <button
                            onClick={() => toggleLock(obj.id)}
                            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700 cursor-pointer"
                            title={obj.locked ? 'Unlock' : 'Lock'}
                          >
                            {obj.locked ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => reorderLayer(obj.id, 'up')}
                            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700 cursor-pointer"
                            title="Bring Forward"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => reorderLayer(obj.id, 'down')}
                            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700 cursor-pointer"
                            title="Send Backward"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => duplicateObject(obj.id)}
                            className="p-1 text-neutral-400 hover:text-indigo-400 rounded hover:bg-neutral-700 cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteObject(obj.id)}
                            className="p-1 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-700 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ================= PROPERTIES VIEW ================= */}
        {activeTab === 'properties' && (
          <>
            {/* NO OBJECT SELECTED: CANVAS PROPERTIES */}
            {!selectedObj && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-semibold text-neutral-300">Canvas Dimensions</h3>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={canvasW}
                      onChange={(e) => setCanvasW(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={canvasH}
                      onChange={(e) => setCanvasH(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => resizeCanvas(canvasW, canvasH)}
                  className="w-full py-2 bg-neutral-800 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Apply Canvas Size
                </button>

                <div className="pt-3 border-t border-white/8 flex flex-col gap-2">
                  <span className="text-[11px] text-neutral-400">Current Background</span>
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-white/6 text-xs text-neutral-300 flex items-center justify-between">
                    <span className="capitalize">{project.background.type}</span>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {project.background.type === 'solid'
                        ? project.background.color
                        : project.background.type === 'gradient'
                        ? `${project.background.gradient?.stops.length} stops`
                        : 'Transparent'}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    Use the Canvas tab on the left sidebar to change colors or gradients.
                  </span>
                </div>
              </div>
            )}

            {/* AN OBJECT IS SELECTED */}
            {selectedObj && (
              <div className="flex flex-col gap-4">
                {/* Object Name & Transform Alignment Header */}
                <div className="flex items-center justify-between border-b border-white/8 pb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {selectedObj.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateObject(selectedObj.id)}
                      className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                      title="Duplicate (Ctrl+D)"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleLock(selectedObj.id)}
                      className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                      title={selectedObj.locked ? 'Unlock' : 'Lock'}
                    >
                      {selectedObj.locked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteObject(selectedObj.id)}
                      className="p-1 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 cursor-pointer"
                      title="Delete (Backspace)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Transform Geometry (X, Y, W, H, Rotation) */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold text-neutral-300">Position & Size</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1.5 rounded-lg border border-neutral-800">
                      <span className="text-neutral-400 font-mono text-[10px]">W</span>
                      <input
                        type="number"
                        value={Math.round(selectedObj.width)}
                        onChange={(e) =>
                          updateObject(selectedObj.id, { width: Number(e.target.value) })
                        }
                        className="bg-transparent text-white font-mono w-full focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1.5 rounded-lg border border-neutral-800">
                      <span className="text-neutral-400 font-mono text-[10px]">H</span>
                      <input
                        type="number"
                        value={Math.round(selectedObj.height)}
                        onChange={(e) =>
                          updateObject(selectedObj.id, { height: Number(e.target.value) })
                        }
                        className="bg-transparent text-white font-mono w-full focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1.5 rounded-lg border border-neutral-800">
                      <span className="text-neutral-400 font-mono text-[10px]">X</span>
                      <input
                        type="number"
                        value={Math.round(selectedObj.x)}
                        onChange={(e) =>
                          updateObject(selectedObj.id, { x: Number(e.target.value) })
                        }
                        className="bg-transparent text-white font-mono w-full focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1.5 rounded-lg border border-neutral-800">
                      <span className="text-neutral-400 font-mono text-[10px]">Y</span>
                      <input
                        type="number"
                        value={Math.round(selectedObj.y)}
                        onChange={(e) =>
                          updateObject(selectedObj.id, { y: Number(e.target.value) })
                        }
                        className="bg-transparent text-white font-mono w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Alignment buttons */}
                  <div className="flex items-center justify-between bg-neutral-950 p-1 rounded-lg border border-neutral-800 mt-1">
                    <button
                      onClick={() => alignObject(selectedObj.id, 'left')}
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                      title="Align Left"
                    >
                      <AlignHorizontalJustifyStart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alignObject(selectedObj.id, 'center-h')}
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                      title="Center Horizontally"
                    >
                      <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alignObject(selectedObj.id, 'right')}
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                      title="Align Right"
                    >
                      <AlignHorizontalJustifyEnd className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alignObject(selectedObj.id, 'top')}
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                      title="Align Top"
                    >
                      <AlignVerticalJustifyStart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alignObject(selectedObj.id, 'center-v')}
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                      title="Center Vertically"
                    >
                      <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alignObject(selectedObj.id, 'bottom')}
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                      title="Align Bottom"
                    >
                      <AlignVerticalJustifyEnd className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Opacity & Flip Controls */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-300">
                    <span>Opacity</span>
                    <span className="font-mono">{Math.round((selectedObj.opacity ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={selectedObj.opacity ?? 1}
                    onChange={(e) =>
                      updateObject(selectedObj.id, { opacity: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() =>
                        updateObject(selectedObj.id, { flipX: !selectedObj.flipX })
                      }
                      className={`flex-1 py-1 px-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        selectedObj.flipX
                          ? 'bg-indigo-950 border-indigo-500 text-white'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip X</span>
                    </button>
                    <button
                      onClick={() =>
                        updateObject(selectedObj.id, { flipY: !selectedObj.flipY })
                      }
                      className={`flex-1 py-1 px-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        selectedObj.flipY
                          ? 'bg-indigo-950 border-indigo-500 text-white'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <FlipVertical className="w-3.5 h-3.5" />
                      <span>Flip Y</span>
                    </button>
                  </div>
                </div>

                {/* ================= TEXT PROPERTIES ================= */}
                {selectedObj.type === 'text' && (
                  <TextPropertiesPanel
                    textObj={selectedObj as TextObject}
                    onChange={(partial) => updateObject(selectedObj.id, partial)}
                  />
                )}

                {/* ================= SHAPE PROPERTIES ================= */}
                {selectedObj.type === 'shape' && (
                  <ShapePropertiesPanel
                    shapeObj={selectedObj as ShapeObject}
                    onChange={(partial) => updateObject(selectedObj.id, partial)}
                  />
                )}

                {/* ================= IMAGE PROPERTIES ================= */}
                {selectedObj.type === 'image' && (
                  <ImagePropertiesPanel
                    imageObj={selectedObj as ImageObject}
                    onChange={(partial) => updateObject(selectedObj.id, partial)}
                  />
                )}

                {/* ================= STICKER PROPERTIES ================= */}
                {selectedObj.type === 'sticker' && (
                  <StickerPropertiesPanel
                    stickerObj={selectedObj as StickerObject}
                    onChange={(partial) => updateObject(selectedObj.id, partial)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ---------------- Text Specific Property Panel ----------------
const TextPropertiesPanel: React.FC<{
  textObj: TextObject;
  onChange: (partial: Partial<TextObject>) => void;
}> = ({ textObj, onChange }) => {
  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-white/8">
      <span className="text-xs font-semibold text-neutral-300">Text Content & Font</span>

      {/* Text Area */}
      <textarea
        rows={3}
        value={textObj.text}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
        placeholder="Enter text..."
      />

      {/* Font Family Selection */}
      <div>
        <label className="text-[11px] text-neutral-400 block mb-1">Font Family</label>
        <select
          value={textObj.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name} ({f.category})
            </option>
          ))}
        </select>
      </div>

      {/* Size & Weight */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Size (px)</label>
          <input
            type="number"
            value={textObj.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] text-neutral-400 block mb-1">Weight</label>
          <select
            value={textObj.fontWeight}
            onChange={(e) => onChange({ fontWeight: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">SemiBold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">ExtraBold (800)</option>
          </select>
        </div>
      </div>

      {/* Alignment & Style Buttons */}
      <div className="flex items-center justify-between gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
        <button
          onClick={() => onChange({ textAlign: 'left' })}
          className={`p-1.5 rounded cursor-pointer ${
            textObj.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-neutral-400'
          }`}
          title="Left Align"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange({ textAlign: 'center' })}
          className={`p-1.5 rounded cursor-pointer ${
            textObj.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-neutral-400'
          }`}
          title="Center Align"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange({ textAlign: 'right' })}
          className={`p-1.5 rounded cursor-pointer ${
            textObj.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-neutral-400'
          }`}
          title="Right Align"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-white/10" />
        <button
          onClick={() =>
            onChange({ fontStyle: textObj.fontStyle === 'italic' ? 'normal' : 'italic' })
          }
          className={`p-1.5 rounded cursor-pointer ${
            textObj.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'text-neutral-400'
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() =>
            onChange({
              textDecoration: textObj.textDecoration === 'underline' ? 'none' : 'underline',
            })
          }
          className={`p-1.5 rounded cursor-pointer ${
            textObj.textDecoration === 'underline' ? 'bg-indigo-600 text-white' : 'text-neutral-400'
          }`}
          title="Underline"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() =>
            onChange({
              textDecoration: textObj.textDecoration === 'line-through' ? 'none' : 'line-through',
            })
          }
          className={`p-1.5 rounded cursor-pointer ${
            textObj.textDecoration === 'line-through'
              ? 'bg-indigo-600 text-white'
              : 'text-neutral-400'
          }`}
          title="Strike-through"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Text Color */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-neutral-400 w-16">Color</label>
        <input
          type="color"
          value={textObj.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={textObj.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
        />
      </div>

      {/* Stroke */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-neutral-400 w-16">Stroke</label>
        <input
          type="color"
          value={textObj.strokeColor || '#000000'}
          onChange={(e) => onChange({ strokeColor: e.target.value })}
          className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
        />
        <input
          type="number"
          min="0"
          max="20"
          value={textObj.strokeWidth || 0}
          onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
          placeholder="Width px"
          className="w-16 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
        />
        <span className="text-[10px] text-neutral-400">px</span>
      </div>

      {/* Shadow Toggle & Settings */}
      <div className="pt-2 border-t border-white/8 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-neutral-300">Drop Shadow</span>
          <button
            onClick={() => {
              if (textObj.shadow) {
                onChange({ shadow: undefined });
              } else {
                onChange({
                  shadow: { color: 'rgba(0,0,0,0.7)', blur: 12, offsetX: 3, offsetY: 4 },
                });
              }
            }}
            className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
              textObj.shadow ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {textObj.shadow ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {textObj.shadow && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-neutral-400">Blur: {textObj.shadow.blur}</span>
              <input
                type="range"
                min="0"
                max="40"
                value={textObj.shadow.blur}
                onChange={(e) =>
                  onChange({
                    shadow: { ...textObj.shadow!, blur: Number(e.target.value) },
                  })
                }
                className="w-full h-1 bg-neutral-800 rounded"
              />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400">Offset Y: {textObj.shadow.offsetY}</span>
              <input
                type="range"
                min="-20"
                max="30"
                value={textObj.shadow.offsetY}
                onChange={(e) =>
                  onChange({
                    shadow: { ...textObj.shadow!, offsetY: Number(e.target.value) },
                  })
                }
                className="w-full h-1 bg-neutral-800 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3D Effect Toggle */}
      <div className="pt-2 border-t border-white/8 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-neutral-300">3D Extrusion</span>
          <button
            onClick={() => {
              if (textObj.effect3d) {
                onChange({ effect3d: undefined });
              } else {
                onChange({ effect3d: { depth: 5, color: '#4338ca', angle: 45 } });
              }
            }}
            className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
              textObj.effect3d ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {textObj.effect3d ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {textObj.effect3d && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textObj.effect3d.color}
              onChange={(e) =>
                onChange({
                  effect3d: { ...textObj.effect3d!, color: e.target.value },
                })
              }
              className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
            />
            <input
              type="range"
              min="1"
              max="20"
              value={textObj.effect3d.depth}
              onChange={(e) =>
                onChange({
                  effect3d: { ...textObj.effect3d!, depth: Number(e.target.value) },
                })
              }
              className="flex-1 h-1 bg-neutral-800 rounded"
            />
            <span className="text-[10px] text-neutral-400 font-mono">
              {textObj.effect3d.depth}px
            </span>
          </div>
        )}
      </div>

      {/* Curved Text Toggle */}
      <div className="pt-2 border-t border-white/8 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-neutral-300">Curved Text</span>
          <button
            onClick={() => {
              onChange({
                curved: !textObj.curved,
                curveRadius: textObj.curved ? undefined : 200,
              });
            }}
            className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
              textObj.curved ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {textObj.curved ? 'Curved' : 'Normal'}
          </button>
        </div>

        {textObj.curved && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400">Radius</span>
            <input
              type="range"
              min="80"
              max="600"
              value={textObj.curveRadius || 200}
              onChange={(e) => onChange({ curveRadius: Number(e.target.value) })}
              className="flex-1 h-1 bg-neutral-800 rounded"
            />
            <span className="text-[10px] text-neutral-400 font-mono">
              {textObj.curveRadius}px
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- Shape Specific Property Panel ----------------
const ShapePropertiesPanel: React.FC<{
  shapeObj: ShapeObject;
  onChange: (partial: Partial<ShapeObject>) => void;
}> = ({ shapeObj, onChange }) => {
  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-white/8">
      <span className="text-xs font-semibold text-neutral-300">Shape Fill & Stroke</span>

      {/* Fill Color */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-neutral-400 w-16">Fill Color</label>
        <input
          type="color"
          value={shapeObj.fill}
          onChange={(e) => onChange({ fill: e.target.value })}
          className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={shapeObj.fill}
          onChange={(e) => onChange({ fill: e.target.value })}
          className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
        />
      </div>

      {/* Stroke Color & Width */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-neutral-400 w-16">Border</label>
        <input
          type="color"
          value={shapeObj.stroke || '#ffffff'}
          onChange={(e) => onChange({ stroke: e.target.value })}
          className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
        />
        <input
          type="number"
          min="0"
          max="30"
          value={shapeObj.strokeWidth}
          onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
          className="w-16 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
        />
        <span className="text-[10px] text-neutral-400">px</span>
      </div>

      {/* Corner radius for rounded rectangle */}
      {shapeObj.shapeType === 'rounded-rectangle' && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Corner Radius</span>
            <span className="font-mono">{shapeObj.cornerRadius ?? 12}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={shapeObj.cornerRadius ?? 12}
            onChange={(e) => onChange({ cornerRadius: Number(e.target.value) })}
            className="w-full h-1 bg-neutral-800 rounded"
          />
        </div>
      )}

      {/* Points for star or polygon */}
      {(shapeObj.shapeType === 'star' || shapeObj.shapeType === 'polygon') && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Points / Sides</span>
            <span className="font-mono">{shapeObj.points ?? 5}</span>
          </div>
          <input
            type="range"
            min="3"
            max="12"
            value={shapeObj.points ?? 5}
            onChange={(e) => onChange({ points: Number(e.target.value) })}
            className="w-full h-1 bg-neutral-800 rounded"
          />
        </div>
      )}
    </div>
  );
};

// ---------------- Image Specific Property Panel ----------------
const ImagePropertiesPanel: React.FC<{
  imageObj: ImageObject;
  onChange: (partial: Partial<ImageObject>) => void;
}> = ({ imageObj, onChange }) => {
  const f = imageObj.filters;

  const updateFilter = (key: keyof ImageObject['filters'], val: number) => {
    onChange({
      filters: {
        ...imageObj.filters,
        [key]: val,
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-white/8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-300">Filters & Adjustments</span>
        <button
          onClick={() =>
            onChange({
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
            })
          }
          className="text-[10px] text-neutral-400 hover:text-indigo-400 cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

      {/* Brightness */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Brightness</span>
          <span className="font-mono">{f.brightness}%</span>
        </div>
        <input
          type="range"
          min="20"
          max="200"
          value={f.brightness}
          onChange={(e) => updateFilter('brightness', Number(e.target.value))}
          className="w-full h-1 bg-neutral-800 rounded"
        />
      </div>

      {/* Contrast */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Contrast</span>
          <span className="font-mono">{f.contrast}%</span>
        </div>
        <input
          type="range"
          min="20"
          max="200"
          value={f.contrast}
          onChange={(e) => updateFilter('contrast', Number(e.target.value))}
          className="w-full h-1 bg-neutral-800 rounded"
        />
      </div>

      {/* Saturation */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Saturation</span>
          <span className="font-mono">{f.saturation}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="250"
          value={f.saturation}
          onChange={(e) => updateFilter('saturation', Number(e.target.value))}
          className="w-full h-1 bg-neutral-800 rounded"
        />
      </div>

      {/* Blur */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Blur</span>
          <span className="font-mono">{f.blur}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={f.blur}
          onChange={(e) => updateFilter('blur', Number(e.target.value))}
          className="w-full h-1 bg-neutral-800 rounded"
        />
      </div>

      {/* Grayscale */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Grayscale</span>
          <span className="font-mono">{f.grayscale}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={f.grayscale}
          onChange={(e) => updateFilter('grayscale', Number(e.target.value))}
          className="w-full h-1 bg-neutral-800 rounded"
        />
      </div>

      {/* Border Radius */}
      <div className="pt-2 border-t border-white/8 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>Rounded Corners</span>
          <span className="font-mono">{imageObj.border.radius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={imageObj.border.radius}
          onChange={(e) =>
            onChange({
              border: { ...imageObj.border, radius: Number(e.target.value) },
            })
          }
          className="w-full h-1 bg-neutral-800 rounded"
        />

        {/* Border Stroke Width & Color */}
        <div className="flex items-center gap-2 mt-1">
          <label className="text-[11px] text-neutral-400 w-16">Border</label>
          <input
            type="color"
            value={imageObj.border.color === 'transparent' ? '#ffffff' : imageObj.border.color}
            onChange={(e) =>
              onChange({
                border: { ...imageObj.border, color: e.target.value },
              })
            }
            className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
          />
          <input
            type="number"
            min="0"
            max="30"
            value={imageObj.border.width}
            onChange={(e) =>
              onChange({
                border: { ...imageObj.border, width: Number(e.target.value) },
              })
            }
            className="w-16 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
          />
          <span className="text-[10px] text-neutral-400">px</span>
        </div>
      </div>
    </div>
  );
};

// ---------------- Sticker Specific Property Panel ----------------
const StickerPropertiesPanel: React.FC<{
  stickerObj: StickerObject;
  onChange: (partial: Partial<StickerObject>) => void;
}> = ({ stickerObj, onChange }) => {
  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-white/8">
      <span className="text-xs font-semibold text-neutral-300">Sticker Color</span>

      <div className="flex items-center gap-2">
        <label className="text-[11px] text-neutral-400 w-16">Color</label>
        <input
          type="color"
          value={stickerObj.fill}
          onChange={(e) => onChange({ fill: e.target.value })}
          className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={stickerObj.fill}
          onChange={(e) => onChange({ fill: e.target.value })}
          className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
        />
      </div>
    </div>
  );
};
