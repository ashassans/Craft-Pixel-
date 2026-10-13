import React, { useEffect, useState } from 'react';
import { DesignCanvas } from './components/canvas/DesignCanvas';
import { ExportModal } from './components/dialogs/ExportModal';
import { FontModal } from './components/dialogs/FontModal';
import { NewProjectModal } from './components/dialogs/NewProjectModal';
import { ShortcutsModal } from './components/dialogs/ShortcutsModal';
import { HomeScreen } from './components/home/HomeScreen';
import { LeftSidebar } from './components/panels/LeftSidebar';
import { RightInspector } from './components/panels/RightInspector';
import { MobileBottomBar } from './components/toolbar/MobileBottomBar';
import { MobileContextBar } from './components/toolbar/MobileContextBar';
import { MobileToolSheet } from './components/toolbar/MobileToolSheet';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { loadAllCustomFonts } from './services/projectStorage';
import { useEditorStore } from './store/editorStore';
import { ProjectMetadata } from './types/editor';

export default function App() {
  const { project, setProject } = useEditorStore();
  const [currentView, setCurrentView] = useState<'home' | 'editor'>('home');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<'none' | 'tools' | 'inspector'>('none');

  // Load custom stored fonts on boot
  useEffect(() => {
    loadAllCustomFonts().catch(console.error);
  }, []);

  const handleOpenProject = (proj: ProjectMetadata) => {
    setProject(proj);
    setCurrentView('editor');
  };

  const handleBackToHome = () => {
    useEditorStore.getState().saveCurrentProject().catch(console.error);
    setCurrentView('home');
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-neutral-950 text-white flex flex-col font-sans select-none">
      {currentView === 'home' ? (
        <HomeScreen onOpenProject={handleOpenProject} />
      ) : (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
          {/* Top Bar */}
          <TopToolbar onBackToHome={handleBackToHome} />

          {/* Main Studio Workspace Split */}
          <div className="flex-1 flex w-full h-full overflow-hidden relative">
            {/* Left Design Tools Sidebar (Desktop) */}
            <div className="hidden md:flex h-full">
              <LeftSidebar />
            </div>

            {/* Central Design Canvas */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
              <DesignCanvas />

              {/* Floating Context Action Bar when an object is selected on mobile */}
              <MobileContextBar onOpenProperties={() => setMobileDrawerOpen('inspector')} />
            </div>

            {/* Right Context Inspector (Desktop) */}
            <div className="hidden lg:flex h-full">
              <RightInspector />
            </div>
          </div>

          {/* Mobile Bottom Tool Sheet (Text, Shapes, Photos, Stickers, Canvas, Templates) */}
          <MobileToolSheet
            isOpen={mobileDrawerOpen === 'tools'}
            onClose={() => setMobileDrawerOpen('none')}
          />

          {/* Mobile Properties / Layers Drawer */}
          {mobileDrawerOpen === 'inspector' && (
            <div className="md:hidden fixed inset-x-0 bottom-16 z-40 bg-neutral-900 border-t border-white/10 rounded-t-2xl shadow-2xl flex flex-col max-h-[70vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
              <div className="h-12 px-4 border-b border-white/8 flex items-center justify-between shrink-0 bg-neutral-950">
                <span className="text-xs font-bold text-white">Layer & Object Properties</span>
                <button
                  onClick={() => setMobileDrawerOpen('none')}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <RightInspector />
              </div>
            </div>
          )}

          {/* Mobile Bottom Navigation Bar: always pinned above safe area */}
          <MobileBottomBar
            onTabClick={(tabId) => {
              if (tabId === 'layers') {
                setMobileDrawerOpen('inspector');
              } else {
                setMobileDrawerOpen('tools');
              }
            }}
          />
        </div>
      )}

      {/* Global Modals */}
      <ExportModal />
      <FontModal />
      <ShortcutsModal />
      <NewProjectModal onProjectCreated={() => setCurrentView('editor')} />
    </div>
  );
}
