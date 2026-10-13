import { Command, X } from 'lucide-react';
import React from 'react';
import { useEditorStore } from '../../store/editorStore';

const SHORTCUTS = [
  { key: 'Ctrl / Cmd + Z', desc: 'Undo last action' },
  { key: 'Ctrl / Cmd + Shift + Z', desc: 'Redo action' },
  { key: 'Ctrl / Cmd + D', desc: 'Duplicate selected layer' },
  { key: 'Delete / Backspace', desc: 'Delete selected layer' },
  { key: 'Escape', desc: 'Deselect current layer' },
  { key: 'Space + Drag', desc: 'Pan canvas workspace' },
  { key: 'Mouse Wheel', desc: 'Zoom in / zoom out' },
  { key: 'Arrow Keys', desc: 'Nudge selected layer by 1px' },
  { key: 'Shift + Arrow Keys', desc: 'Nudge selected layer by 10px' },
];

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useEditorStore();

  if (!isShortcutsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-6 border-b border-white/8 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-6 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-white/6 text-xs"
            >
              <span className="text-neutral-300">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded bg-neutral-800 text-indigo-300 font-mono text-[11px] border border-white/10">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="h-12 px-6 border-t border-white/8 flex items-center justify-end shrink-0 bg-neutral-950">
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
