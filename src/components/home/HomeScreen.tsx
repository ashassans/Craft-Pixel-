import {
  Copy,
  Download,
  FolderOpen,
  Image as ImageIcon,
  Layout,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { EDITABLE_TEMPLATES } from '../../data/templates';
import {
  deleteProjectFromDB,
  duplicateProjectInDB,
  exportProjectToJSON,
  getAllProjectsFromDB,
  importProjectFromJSONFile,
  StoredProject,
} from '../../services/projectStorage';
import { useEditorStore } from '../../store/editorStore';
import { ProjectMetadata } from '../../types/editor';

interface HomeScreenProps {
  onOpenProject: (project: ProjectMetadata) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenProject }) => {
  const { setNewProjectModalOpen, createNewProject } = useEditorStore();

  const [recentProjects, setRecentProjects] = useState<StoredProject[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'recents' | 'templates'>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const importFileInputRef = useRef<HTMLInputElement>(null);
  const openImageInputRef = useRef<HTMLInputElement>(null);

  const loadProjects = async () => {
    try {
      const list = await getAllProjectsFromDB();
      setRecentProjects(list);
    } catch (err) {
      console.error('Failed to load recent projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Handle Import Project JSON
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importProjectFromJSONFile(file);
      await loadProjects();
      onOpenProject(imported);
    } catch (err) {
      alert('Could not import project: ' + (err as Error).message);
    }
  };

  // Handle Open Image as New Project
  const handleOpenImageAsProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const projName = file.name.replace(/\.[^/.]+$/, '') || 'Photo Project';
        const newProj: ProjectMetadata = {
          id: 'proj_' + Math.random().toString(36).substring(2, 9),
          name: projName,
          width: img.naturalWidth,
          height: img.naturalHeight,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          background: { type: 'solid', color: '#09090b', opacity: 1 },
          version: '1.0',
          objects: [
            {
              id: 'img_' + Math.random().toString(36).substring(2, 9),
              name: 'Background Photo',
              type: 'image',
              x: 0,
              y: 0,
              width: img.naturalWidth,
              height: img.naturalHeight,
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
            },
          ],
        };

        onOpenProject(newProj);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Handle Delete Project
  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this project from browser storage?')) {
      await deleteProjectFromDB(id);
      await loadProjects();
    }
  };

  // Handle Duplicate Project
  const handleDuplicateProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateProjectInDB(id);
    await loadProjects();
  };

  // Handle Export Project JSON
  const handleExportJSON = (project: StoredProject, e: React.MouseEvent) => {
    e.stopPropagation();
    exportProjectToJSON(project.data);
  };

  // Filtered Templates
  const filteredTemplates = EDITABLE_TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Recents
  const filteredRecents = recentProjects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 w-full h-full bg-neutral-950 overflow-y-auto flex flex-col">
      {/* Top Header - Domain Top Bar Contract: Brand | Navigation | Primary CTA */}
      <header className="h-16 border-b border-white/8 px-6 lg:px-12 flex items-center justify-between gap-8 shrink-0 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            CraftPixel Studio
          </span>
        </div>

        {/* Zone 2: Navigation / Quick Search */}
        <div className="hidden md:flex items-center gap-3 max-w-md w-full">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates or recent projects..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <input
            type="file"
            ref={importFileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => importFileInputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Import previously saved .json project file"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Import Project</span>
          </button>

          <input
            type="file"
            ref={openImageInputRef}
            onChange={handleOpenImageAsProject}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => openImageInputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Open an image as a new canvas"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Open Image</span>
          </button>

          <button
            onClick={() => setNewProjectModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* Main Home Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-10 flex flex-col gap-10">
        {/* Hero Banner / Quick Action Row */}
        <section className="bg-gradient-to-r from-neutral-900 via-indigo-950/40 to-neutral-900 border border-white/8 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Professional Graphic Design & Layout Studio
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl">
              Create YouTube thumbnails, banners, social graphics, and Bengali typography.
              Runs 100% offline in your browser with high-resolution export.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setNewProjectModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-transform hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Blank Canvas</span>
            </button>
            <button
              onClick={() => {
                const tmpl = EDITABLE_TEMPLATES[0];
                onOpenProject({
                  ...tmpl,
                  id: 'proj_' + Math.random().toString(36).substring(2, 9),
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Try Sample Template
            </button>
          </div>
        </section>

        {/* Tab Filters */}
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Artworks
            </button>
            <button
              onClick={() => setActiveTab('recents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'recents'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Recent Projects ({recentProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Template Gallery ({EDITABLE_TEMPLATES.length})
            </button>
          </div>

          <div className="text-xs text-neutral-400 hidden sm:block">
            Storage: Browser IndexedDB (Private & Offline)
          </div>
        </div>

        {/* RECENT PROJECTS SECTION */}
        {(activeTab === 'all' || activeTab === 'recents') && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                <span>Recent Projects</span>
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-xl bg-neutral-900 border border-white/6 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredRecents.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 text-center flex flex-col items-center justify-center gap-2">
                <FolderOpen className="w-8 h-8 text-neutral-600 mb-1" />
                <span className="text-xs font-medium text-neutral-300">
                  No saved projects yet
                </span>
                <p className="text-[11px] text-neutral-400 max-w-sm">
                  Click &quot;New Project&quot; above or pick a ready template below to begin designing.
                </p>
                <button
                  onClick={() => setNewProjectModalOpen(true)}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredRecents.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenProject(item.data)}
                    className="group bg-neutral-900 border border-white/8 hover:border-indigo-500/50 rounded-xl overflow-hidden flex flex-col transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/10"
                  >
                    {/* Thumbnail Preview Area */}
                    <div className="h-36 bg-neutral-950 flex items-center justify-center overflow-hidden relative">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-neutral-600">
                          <Layout className="w-6 h-6" />
                          <span className="text-[10px]">No Thumbnail</span>
                        </div>
                      )}

                      {/* Dimension Pill Overlay */}
                      <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/75 backdrop-blur-xs text-neutral-300 px-1.5 py-0.5 rounded border border-white/10">
                        {item.width} × {item.height}
                      </span>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="p-3 flex items-center justify-between gap-2 border-t border-white/6 bg-neutral-900">
                      <div className="truncate flex-1">
                        <span className="text-xs font-semibold text-white block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => handleDuplicateProject(item.id, e)}
                          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                          title="Duplicate Project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleExportJSON(item, e)}
                          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
                          title="Download Editable JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(item.id, e)}
                          className="p-1 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TEMPLATE GALLERY SECTION */}
        {(activeTab === 'all' || activeTab === 'templates') && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Editable Template Gallery</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onOpenProject({
                      ...tmpl,
                      id: 'proj_' + Math.random().toString(36).substring(2, 9),
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    });
                  }}
                  className="group bg-neutral-900 border border-white/8 hover:border-indigo-500 rounded-xl overflow-hidden flex flex-col transition-all cursor-pointer shadow-md hover:shadow-indigo-500/10"
                >
                  {/* Template Visual Banner Preview */}
                  <div
                    className="h-36 p-4 flex flex-col justify-center items-center text-center relative overflow-hidden"
                    style={{
                      background:
                        tmpl.background.type === 'gradient' && tmpl.background.gradient
                          ? `linear-gradient(${tmpl.background.gradient.angle}deg, ${tmpl.background.gradient.stops[0].color}, ${tmpl.background.gradient.stops[1].color})`
                          : tmpl.background.color || '#09090b',
                    }}
                  >
                    <span className="text-white text-sm font-bold line-clamp-2 px-2 drop-shadow-md">
                      {tmpl.objects.find((o) => o.type === 'text')?.name || tmpl.name}
                    </span>

                    <span className="absolute bottom-2 right-2 text-[9px] font-mono bg-black/60 text-white/90 px-1.5 py-0.5 rounded backdrop-blur-xs">
                      {tmpl.width} × {tmpl.height}
                    </span>
                  </div>

                  {/* Template Details */}
                  <div className="p-3 flex items-center justify-between bg-neutral-900 border-t border-white/6">
                    <div className="truncate flex-1">
                      <span className="text-xs font-semibold text-white block truncate">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {tmpl.objects.length} editable layers
                      </span>
                    </div>

                    <button className="px-2.5 py-1 rounded bg-indigo-600/30 text-indigo-300 text-[11px] font-medium group-hover:bg-indigo-600 group-hover:text-white transition-colors cursor-pointer shrink-0">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-white/8 px-6 flex items-center justify-between text-[11px] text-neutral-400 shrink-0 bg-neutral-950">
        <span>CraftPixel Studio · Graphic Design & Typography Editor</span>
        <span>Offline-First · IndexedDB Local Storage</span>
      </footer>
    </div>
  );
};
