import { Copy, Sliders, Trash2, X } from 'lucide-react';
import React from 'react';
import { useEditorStore } from '../../store/editorStore';

interface MobileContextBarProps {
  onOpenProperties: () => void;
}

export const MobileContextBar: React.FC<MobileContextBarProps> = ({ onOpenProperties }) => {
  const { project, selectedObjectId, setSelectedObjectId, deleteObject, duplicateObject } =
    useEditorStore();

  if (!project || !selectedObjectId) return null;

  const selectedObj = project.objects.find((o) => o.id === selectedObjectId);
  if (!selectedObj) return null;

  return (
    <div className="md:hidden fixed bottom-16 inset-x-3 z-30 bg-neutral-900/95 backdrop-blur-md border border-indigo-500/40 rounded-xl px-3 py-2 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-150">
      {/* Object badge */}
      <div className="flex items-center gap-1.5 truncate max-w-[130px]">
        <span className="text-[10px] uppercase font-mono px-1 rounded bg-indigo-950 text-indigo-300 shrink-0">
          {selectedObj.type}
        </span>
        <span className="text-xs font-semibold text-white truncate">{selectedObj.name}</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenProperties}
          className="px-2.5 py-1 rounded-lg bg-indigo-600 active:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 shadow-sm cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          onClick={() => duplicateObject(selectedObj.id)}
          className="p-1.5 rounded-lg bg-neutral-800 active:bg-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
          title="Duplicate"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => deleteObject(selectedObj.id)}
          className="p-1.5 rounded-lg bg-neutral-800 active:bg-neutral-700 text-neutral-300 hover:text-red-400 cursor-pointer"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setSelectedObjectId(null)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
          title="Deselect"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
