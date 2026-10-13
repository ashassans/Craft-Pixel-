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
    <div className="w-screen h-screen overflow-hidden bg-neutral-950 text-white flex flex-col font-sans select-none">
      {currentView === 'home' ? (
        <HomeScreen onOpenProject={handleOpenProject} />
      ) : (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
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

              {/* Mobile Inspector / Tools Drawer Floating Toggle */}
              <div className="md:hidden absolute bottom-16 right-4 z-20 flex flex-col gap-2">
                <button
                  onClick={() =>
                    setMobileDrawerOpen((prev) => (prev === 'inspector' ? 'none' : 'inspector'))
                  }
                  className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  {mobileDrawerOpen === 'inspector' ? 'Hide Inspector' : 'Layer & Props'}
                </button>
              </div>

              {/* Mobile Floating Drawer for Inspector or Tools */}
              {mobileDrawerOpen !== 'none' && (
                <div className="md:hidden absolute inset-x-0 bottom-14 top-16 z-30 bg-neutral-900/98 backdrop-blur-md border-t border-white/10 flex flex-col shadow-2xl">
                  <div className="p-2.5 flex items-center justify-between border-b border-white/8 bg-neutral-950">
                    <span className="text-xs font-semibold text-neutral-200">
                      {mobileDrawerOpen === 'inspector' ? 'Layer & Object Properties' : 'Design Tools'}
                    </span>
                    <button
                      onClick={() => setMobileDrawerOpen('none')}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-xs cursor-pointer"
                    >
                      Close ✕
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {mobileDrawerOpen === 'inspector' ? <RightInspector /> : <LeftSidebar />}
                  </div>
                </div>
              )}
            </div>

            {/* Right Context Inspector (Desktop) */}
            <div className="hidden lg:flex h-full">
              <RightInspector />
            </div>
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <MobileBottomBar onTabClick={() => setMobileDrawerOpen('tools')} />
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
