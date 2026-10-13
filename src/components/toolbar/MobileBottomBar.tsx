import {
  FileText,
  Image as ImageIcon,
  Layers,
  Palette,
  Shapes,
  Sparkles,
  Type,
} from 'lucide-react';
import React from 'react';
import { useEditorStore } from '../../store/editorStore';

interface MobileBottomBarProps {
  onTabClick?: (tabId: string) => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onTabClick }) => {
  const { activeSidebarTab, setActiveSidebarTab } = useEditorStore();

  const tabs = [
    { id: 'text' as const, label: 'Text', icon: Type },
    { id: 'shapes' as const, label: 'Shapes', icon: Shapes },
    { id: 'images' as const, label: 'Image', icon: ImageIcon },
    { id: 'stickers' as const, label: 'Stickers', icon: Sparkles },
    { id: 'background' as const, label: 'Canvas', icon: Palette },
    { id: 'templates' as const, label: 'Templates', icon: FileText },
    { id: 'layers' as const, label: 'Layers', icon: Layers },
  ];

  return (
    <nav className="h-14 bg-neutral-900 border-t border-white/8 flex items-center justify-around px-2 z-20 shrink-0 md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSidebarTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSidebarTab(tab.id);
              if (onTabClick) onTabClick(tab.id);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
              isActive ? 'text-indigo-400 bg-neutral-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
