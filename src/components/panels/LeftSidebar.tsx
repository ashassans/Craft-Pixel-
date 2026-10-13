import {
  FileText,
  Image as ImageIcon,
  Layers,
  Palette,
  Shapes,
  Sparkles,
  Type,
  Upload,
} from 'lucide-react';
import React, { useRef } from 'react';
import { SAMPLE_PHOTOS } from '../../data/samplePhotos';
import { STICKER_COLLECTION } from '../../data/stickers';
import { EDITABLE_TEMPLATES } from '../../data/templates';
import { useEditorStore } from '../../store/editorStore';
import { CanvasObject, ShapeType } from '../../types/editor';

const COLOR_PALETTE_SWATCHES = [
  '#ffffff',
  '#f8fafc',
  '#cbd5e1',
  '#64748b',
  '#0f172a',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
];

const GRADIENT_PRESETS = [
  {
    name: 'Midnight Indigo',
    gradient: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#090d16' },
        { offset: 1, color: '#1e1b4b' },
      ],
    },
  },
  {
    name: 'Sunset Crimson',
    gradient: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#4c0519' },
        { offset: 1, color: '#e11d48' },
      ],
    },
  },
  {
    name: 'Emerald Aurora',
    gradient: {
      type: 'linear' as const,
      angle: 135,
      stops: [
        { offset: 0, color: '#064e3b' },
        { offset: 1, color: '#10b981' },
      ],
    },
  },
  {
    name: 'Deep Slate',
    gradient: {
      type: 'linear' as const,
      angle: 180,
      stops: [
        { offset: 0, color: '#1e293b' },
        { offset: 1, color: '#0f172a' },
      ],
    },
  },
];

export const LeftSidebar: React.FC = () => {
  const {
    project,
    activeSidebarTab,
    setActiveSidebarTab,
    addObject,
    setBackground,
    setProject,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  if (!project) return null;

  // Add Text Handler
  const handleAddText = (
    preset: 'heading' | 'subheading' | 'body' | 'bengali-heading' | 'bengali-body'
  ) => {
    let text = 'Heading Text';
    let fontSize = 54;
    let fontWeight: string | number = 700;
    let fontFamily = 'Montserrat';
    let width = 450;
    let height = 75;

    if (preset === 'subheading') {
      text = 'Subheading Text';
      fontSize = 32;
      fontWeight = 600;
      fontFamily = 'Plus Jakarta Sans';
      width = 380;
      height = 50;
    } else if (preset === 'body') {
      text = 'Add some descriptive body text here to tell your story.';
      fontSize = 20;
      fontWeight = 400;
      fontFamily = 'Plus Jakarta Sans';
      width = 460;
      height = 65;
    } else if (preset === 'bengali-heading') {
      text = 'গ্রাফিক ডিজাইন';
      fontSize = 58;
      fontWeight = 700;
      fontFamily = 'Hind Siliguri';
      width = 420;
      height = 80;
    } else if (preset === 'bengali-body') {
      text = 'আপনার সুন্দর বক্তব্য এখানে যুক্ত করুন।';
      fontSize = 26;
      fontWeight = 500;
      fontFamily = 'Noto Sans Bengali';
      width = 480;
      height = 60;
    }

    const newTextObj: CanvasObject = {
      id: 'text_' + Math.random().toString(36).substring(2, 9),
      name: text.substring(0, 15),
      type: 'text',
      x: Math.round((project.width - width) / 2),
      y: Math.round((project.height - height) / 2),
      width,
      height,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      flipX: false,
      flipY: false,
      zIndex: 1,
      text,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      color: '#ffffff',
      letterSpacing: preset.startsWith('bengali') ? 0.5 : 1,
      lineHeight: 1.25,
    };

    addObject(newTextObj);
  };

  // Add Shape Handler
  const handleAddShape = (shapeType: ShapeType) => {
    const size = 180;
    const newShapeObj: CanvasObject = {
      id: 'shape_' + Math.random().toString(36).substring(2, 9),
      name: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
      type: 'shape',
      shapeType,
      x: Math.round((project.width - size) / 2),
      y: Math.round((project.height - size) / 2),
      width: shapeType === 'line' ? 300 : size,
      height: shapeType === 'line' ? 6 : size,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      flipX: false,
      flipY: false,
      zIndex: 1,
      fill: shapeType === 'line' ? '#6366f1' : '#6366f1',
      stroke: 'transparent',
      strokeWidth: 0,
      cornerRadius: shapeType === 'rounded-rectangle' ? 18 : undefined,
      points: shapeType === 'star' ? 5 : shapeType === 'polygon' ? 6 : undefined,
    };

    addObject(newShapeObj);
  };

  // Upload Image Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = Math.min(project.width * 0.7, 600);
        const scale = Math.min(1, maxWidth / img.naturalWidth);
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);

        const newImgObj: CanvasObject = {
          id: 'img_' + Math.random().toString(36).substring(2, 9),
          name: file.name.substring(0, 15) || 'Image',
          type: 'image',
          x: Math.round((project.width - w) / 2),
          y: Math.round((project.height - h) / 2),
          width: w,
          height: h,
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
          border: {
            color: 'transparent',
            width: 0,
            radius: 0,
          },
        };

        addObject(newImgObj);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Add Sticker Handler
  const handleAddSticker = (item: (typeof STICKER_COLLECTION)[0]) => {
    const size = 140;
    const newStickerObj: CanvasObject = {
      id: 'sticker_' + Math.random().toString(36).substring(2, 9),
      name: item.name,
      type: 'sticker',
      stickerId: item.id,
      svgPath: item.svgPath,
      viewBox: item.viewBox,
      x: Math.round((project.width - size) / 2),
      y: Math.round((project.height - size) / 2),
      width: size,
      height: size,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      flipX: false,
      flipY: false,
      zIndex: 1,
      fill: item.defaultColor,
    };

    addObject(newStickerObj);
  };

  return (
    <div className="flex h-full bg-neutral-900 border-r border-white/8 z-10 shrink-0">
      {/* Icon Navigation Column */}
      <div className="w-16 bg-neutral-950 flex flex-col items-center py-3 gap-2 border-r border-white/8">
        <button
          onClick={() => setActiveSidebarTab('text')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeSidebarTab === 'text'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Text Tools"
        >
          <Type className="w-4 h-4 mb-1" />
          <span>Text</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab('shapes')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeSidebarTab === 'shapes'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Shapes & Elements"
        >
          <Shapes className="w-4 h-4 mb-1" />
          <span>Shapes</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab('images')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeSidebarTab === 'images'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Image Upload"
        >
          <ImageIcon className="w-4 h-4 mb-1" />
          <span>Image</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab('stickers')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeSidebarTab === 'stickers'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Vector Stickers"
        >
          <Sparkles className="w-4 h-4 mb-1" />
          <span>Stickers</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab('background')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeSidebarTab === 'background'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Canvas Background"
        >
          <Palette className="w-4 h-4 mb-1" />
          <span>Canvas</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab('templates')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeSidebarTab === 'templates'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Template Presets"
        >
          <FileText className="w-4 h-4 mb-1" />
          <span>Templates</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab('layers')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeSidebarTab === 'layers'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
          }`}
          title="Layer Management"
        >
          <Layers className="w-4 h-4 mb-1" />
          <span>Layers</span>
        </button>
      </div>

      {/* Detail Tool Drawer (260px) */}
      <div className="w-64 p-4 overflow-y-auto flex flex-col gap-4">
        {/* TEXT TAB */}
        {activeSidebarTab === 'text' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-neutral-300">Typography</h3>

            <button
              onClick={() => handleAddText('heading')}
              className="w-full py-2.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700/80 text-white text-left font-bold text-sm transition-colors cursor-pointer border border-white/6"
            >
              Add Heading
            </button>

            <button
              onClick={() => handleAddText('subheading')}
              className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 text-left font-semibold text-xs transition-colors cursor-pointer border border-white/6"
            >
              Add Subheading
            </button>

            <button
              onClick={() => handleAddText('body')}
              className="w-full py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 text-left text-xs transition-colors cursor-pointer border border-white/6"
            >
              Add Paragraph Body
            </button>

            <div className="pt-2 border-t border-white/8">
              <span className="text-[11px] font-medium text-amber-400 block mb-2">
                বাংলা ইউনিকোড (Bengali)
              </span>

              <button
                onClick={() => handleAddText('bengali-heading')}
                className="w-full py-2 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/40 border border-amber-600/30 text-amber-200 text-left font-bold text-sm transition-colors cursor-pointer mb-2"
              >
                বাংলা শিরোনাম যুক্ত করুন
              </button>

              <button
                onClick={() => handleAddText('bengali-body')}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-950/30 hover:bg-amber-900/30 border border-amber-600/20 text-amber-300 text-left text-xs transition-colors cursor-pointer"
              >
                বাংলা বর্ণনা / উক্তি যুক্ত করুন
              </button>
            </div>
          </div>
        )}

        {/* SHAPES TAB */}
        {activeSidebarTab === 'shapes' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-neutral-300">Shapes</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddShape('rectangle')}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex flex-col items-center gap-1.5 text-xs text-neutral-200 transition-colors cursor-pointer"
              >
                <div className="w-8 h-6 bg-indigo-500 rounded-sm" />
                <span>Rectangle</span>
              </button>

              <button
                onClick={() => handleAddShape('rounded-rectangle')}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex flex-col items-center gap-1.5 text-xs text-neutral-200 transition-colors cursor-pointer"
              >
                <div className="w-8 h-6 bg-indigo-500 rounded-md" />
                <span>Rounded</span>
              </button>

              <button
                onClick={() => handleAddShape('circle')}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex flex-col items-center gap-1.5 text-xs text-neutral-200 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 bg-indigo-500 rounded-full" />
                <span>Circle</span>
              </button>

              <button
                onClick={() => handleAddShape('triangle')}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex flex-col items-center gap-1.5 text-xs text-neutral-200 transition-colors cursor-pointer"
              >
                <div
                  className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-indigo-500"
                />
                <span>Triangle</span>
              </button>

              <button
                onClick={() => handleAddShape('star')}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex flex-col items-center gap-1.5 text-xs text-neutral-200 transition-colors cursor-pointer"
              >
                <span className="text-xl text-indigo-400">★</span>
                <span>Star</span>
              </button>

              <button
                onClick={() => handleAddShape('heart')}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex flex-col items-center gap-1.5 text-xs text-neutral-200 transition-colors cursor-pointer"
              >
                <span className="text-xl text-indigo-400">♥</span>
                <span>Heart</span>
              </button>

              <button
                onClick={() => handleAddShape('polygon')}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex flex-col items-center gap-1.5 text-xs text-neutral-200 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 border-2 border-indigo-500 rotate-45" />
                <span>Polygon</span>
              </button>

              <button
                onClick={() => handleAddShape('line')}
                className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex flex-col items-center gap-1.5 text-xs text-neutral-200 transition-colors cursor-pointer"
              >
                <div className="w-8 h-1 bg-indigo-500 my-2" />
                <span>Line</span>
              </button>
            </div>
          </div>
        )}

        {/* IMAGES TAB */}
        {activeSidebarTab === 'images' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-neutral-300">Images</h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 border-2 border-dashed border-neutral-700 hover:border-indigo-500 rounded-xl bg-neutral-950/60 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white transition-colors cursor-pointer group"
            >
              <Upload className="w-5 h-5 text-neutral-500 group-hover:text-indigo-400 transition-colors" />
              <div className="text-center">
                <span className="text-xs font-medium block text-neutral-200">
                  Upload Photo
                </span>
                <span className="text-[10px] text-neutral-400">
                  PNG, JPEG, WebP, SVG or drag-and-drop
                </span>
              </div>
            </button>

            <div className="pt-2 border-t border-white/8 flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-neutral-300">Sample Stock Graphics</span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_PHOTOS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      const maxWidth = Math.min(project.width * 0.6, 400);
                      const scale = maxWidth / sample.width;
                      const w = Math.round(sample.width * scale);
                      const h = Math.round(sample.height * scale);

                      const newImgObj: CanvasObject = {
                        id: 'img_' + Math.random().toString(36).substring(2, 9),
                        name: sample.name,
                        type: 'image',
                        x: Math.round((project.width - w) / 2),
                        y: Math.round((project.height - h) / 2),
                        width: w,
                        height: h,
                        naturalWidth: sample.width,
                        naturalHeight: sample.height,
                        rotation: 0,
                        opacity: 1,
                        visible: true,
                        locked: false,
                        flipX: false,
                        flipY: false,
                        zIndex: 1,
                        src: sample.dataUrl,
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
                        border: {
                          color: 'transparent',
                          width: 0,
                          radius: 0,
                        },
                      };
                      addObject(newImgObj);
                    }}
                    className="p-1.5 bg-neutral-950 border border-white/6 hover:border-indigo-500/50 rounded-lg flex flex-col items-center gap-1.5 cursor-pointer group transition-colors"
                  >
                    <img
                      src={sample.dataUrl}
                      alt={sample.name}
                      className="w-full h-16 object-cover rounded"
                    />
                    <span className="text-[10px] text-neutral-300 group-hover:text-indigo-400 truncate w-full text-center">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STICKERS TAB */}
        {activeSidebarTab === 'stickers' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-neutral-300">Vector Stickers</h3>
            <div className="grid grid-cols-2 gap-2">
              {STICKER_COLLECTION.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => handleAddSticker(sticker)}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex flex-col items-center justify-center gap-2 text-[11px] text-neutral-300 transition-colors cursor-pointer group"
                >
                  <svg
                    viewBox={sticker.viewBox}
                    className="w-8 h-8 transition-transform group-hover:scale-110"
                    fill={sticker.defaultColor}
                  >
                    <path d={sticker.svgPath} />
                  </svg>
                  <span className="truncate w-full text-center">{sticker.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BACKGROUND TAB */}
        {activeSidebarTab === 'background' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-neutral-300">Canvas Background</h3>

            {/* Background Mode */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg">
              <button
                onClick={() => setBackground({ type: 'solid' })}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                  project.background.type === 'solid'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Solid
              </button>
              <button
                onClick={() =>
                  setBackground({
                    type: 'gradient',
                    gradient: GRADIENT_PRESETS[0].gradient,
                  })
                }
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                  project.background.type === 'gradient'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Gradient
              </button>
              <button
                onClick={() => setBackground({ type: 'transparent' })}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                  project.background.type === 'transparent'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Clear
              </button>
            </div>

            {/* Solid Swatches */}
            {project.background.type === 'solid' && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-neutral-400">Color Palette</span>
                <div className="grid grid-cols-7 gap-1.5">
                  {COLOR_PALETTE_SWATCHES.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackground({ color })}
                      className="w-6 h-6 rounded-md border border-white/20 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={project.background.color || '#0f172a'}
                    onChange={(e) => setBackground({ color: e.target.value })}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={project.background.color || '#0f172a'}
                    onChange={(e) => setBackground({ color: e.target.value })}
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Gradient Presets */}
            {project.background.type === 'gradient' && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-neutral-400">Gradient Styles</span>
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setBackground({ gradient: preset.gradient })}
                      className="h-12 rounded-lg border border-white/10 hover:border-indigo-400 transition-colors p-1 flex items-end cursor-pointer"
                      style={{
                        background: `linear-gradient(${preset.gradient.angle}deg, ${preset.gradient.stops[0].color}, ${preset.gradient.stops[1].color})`,
                      }}
                    >
                      <span className="text-[9px] text-white/90 bg-black/60 px-1 py-0.5 rounded backdrop-blur-xs">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Background Image upload */}
            <div className="pt-2 border-t border-white/8">
              <input
                type="file"
                ref={bgImageInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const dataUrl = event.target?.result as string;
                    setBackground({ type: 'image', imageUrl: dataUrl });
                  };
                  reader.readAsDataURL(file);
                }}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => bgImageInputRef.current?.click()}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload BG Image</span>
              </button>
            </div>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeSidebarTab === 'templates' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-neutral-300">Templates</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Click a template to load editable layers onto canvas.
            </p>

            <div className="flex flex-col gap-2.5">
              {EDITABLE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    if (
                      confirm(
                        `Load "${tmpl.name}"? This will replace current canvas layers.`
                      )
                    ) {
                      setProject({
                        ...tmpl,
                        id: 'proj_' + Math.random().toString(36).substring(2, 9),
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                      });
                    }
                  }}
                  className="p-3 bg-neutral-800 hover:bg-neutral-700/80 rounded-xl text-left border border-white/6 hover:border-indigo-500/40 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-neutral-100 block truncate mb-1">
                    {tmpl.name}
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span>
                      {tmpl.width} × {tmpl.height}
                    </span>
                    <span>{tmpl.objects.length} layers</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LAYERS TAB (Quick Access from Left or Right) */}
        {activeSidebarTab === 'layers' && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-neutral-300">Layers</h3>
            <p className="text-[11px] text-neutral-400">
              Layers are synchronized with canvas selection.
            </p>
            <div className="text-xs text-neutral-400 italic">
              See the inspector on the right for full layer controls.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
