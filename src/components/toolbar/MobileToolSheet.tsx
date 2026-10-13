import {
  FileText,
  Image as ImageIcon,
  Layers as LayersIcon,
  Palette,
  Shapes,
  Sparkles,
  Type,
  Upload,
  X,
} from 'lucide-react';
import React, { useRef } from 'react';
import { SAMPLE_PHOTOS } from '../../data/samplePhotos';
import { STICKER_COLLECTION } from '../../data/stickers';
import { EDITABLE_TEMPLATES } from '../../data/templates';
import { useEditorStore } from '../../store/editorStore';
import { CanvasObject, ShapeType } from '../../types/editor';
import { RightInspector } from '../panels/RightInspector';

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

interface MobileToolSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileToolSheet: React.FC<MobileToolSheetProps> = ({ isOpen, onClose }) => {
  const {
    project,
    activeSidebarTab,
    selectedObjectId,
    addObject,
    setBackground,
    setProject,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !project) return null;

  // Add Text Handler
  const handleAddText = (
    preset: 'heading' | 'subheading' | 'body' | 'bengali-heading' | 'bengali-body'
  ) => {
    let text = 'Heading Text';
    let fontSize = 48;
    let fontWeight: string | number = 700;
    let fontFamily = 'Montserrat';
    let width = 380;
    let height = 65;

    if (preset === 'subheading') {
      text = 'Subheading Text';
      fontSize = 28;
      fontWeight = 600;
      fontFamily = 'Plus Jakarta Sans';
      width = 320;
      height = 45;
    } else if (preset === 'body') {
      text = 'Add some descriptive body text here to tell your story.';
      fontSize = 18;
      fontWeight = 400;
      fontFamily = 'Plus Jakarta Sans';
      width = 380;
      height = 55;
    } else if (preset === 'bengali-heading') {
      text = 'গ্রাফিক ডিজাইন';
      fontSize = 50;
      fontWeight = 700;
      fontFamily = 'Hind Siliguri';
      width = 360;
      height = 70;
    } else if (preset === 'bengali-body') {
      text = 'আপনার সুন্দর বক্তব্য এখানে যুক্ত করুন।';
      fontSize = 24;
      fontWeight = 500;
      fontFamily = 'Noto Sans Bengali';
      width = 400;
      height = 55;
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
    onClose();
  };

  // Add Shape Handler
  const handleAddShape = (shapeType: ShapeType) => {
    const size = 160;
    const newShapeObj: CanvasObject = {
      id: 'shape_' + Math.random().toString(36).substring(2, 9),
      name: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
      type: 'shape',
      shapeType,
      x: Math.round((project.width - size) / 2),
      y: Math.round((project.height - size) / 2),
      width: shapeType === 'line' ? 260 : size,
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
    onClose();
  };

  // Add Image File Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = Math.min(project.width * 0.7, 500);
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
        onClose();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Add Sticker Handler
  const handleAddSticker = (item: (typeof STICKER_COLLECTION)[0]) => {
    const size = 130;
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
    onClose();
  };

  const getSheetTitle = () => {
    switch (activeSidebarTab) {
      case 'text':
        return 'Add Text & Typography';
      case 'shapes':
        return 'Choose Vector Shape';
      case 'images':
        return 'Photos & Graphics';
      case 'stickers':
        return 'Vector Stickers';
      case 'background':
        return 'Canvas Background';
      case 'templates':
        return 'Template Gallery';
      case 'layers':
        return 'Layer Management';
      default:
        return 'Design Options';
    }
  };

  return (
    <div className="md:hidden fixed inset-x-0 bottom-14 z-30 bg-neutral-900 border-t border-white/10 rounded-t-2xl shadow-2xl flex flex-col max-h-[65vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
      {/* Drawer Header */}
      <div className="h-12 px-4 border-b border-white/8 flex items-center justify-between shrink-0 bg-neutral-950">
        <span className="text-xs font-bold text-white flex items-center gap-2">
          {getSheetTitle()}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* TEXT OPTIONS */}
        {activeSidebarTab === 'text' && (
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => handleAddText('heading')}
              className="w-full py-3 px-4 rounded-xl bg-neutral-800 active:bg-neutral-700 text-white text-left font-bold text-base transition-colors cursor-pointer border border-white/6"
            >
              + Add Heading
            </button>
            <button
              onClick={() => handleAddText('subheading')}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 active:bg-neutral-700 text-neutral-200 text-left font-semibold text-sm transition-colors cursor-pointer border border-white/6"
            >
              + Add Subheading
            </button>
            <button
              onClick={() => handleAddText('body')}
              className="w-full py-2 px-4 rounded-xl bg-neutral-800 active:bg-neutral-700 text-neutral-300 text-left text-xs transition-colors cursor-pointer border border-white/6"
            >
              + Add Paragraph Body
            </button>

            <div className="pt-2 border-t border-white/8 flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-amber-400">
                বাংলা ইউনিকোড (Bengali Fonts)
              </span>
              <button
                onClick={() => handleAddText('bengali-heading')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-950/40 active:bg-amber-900/50 border border-amber-600/30 text-amber-200 text-left font-bold text-base transition-colors cursor-pointer"
              >
                + বাংলা শিরোনাম যুক্ত করুন
              </button>
              <button
                onClick={() => handleAddText('bengali-body')}
                className="w-full py-2 px-4 rounded-xl bg-amber-950/30 active:bg-amber-900/40 border border-amber-600/20 text-amber-300 text-left text-xs transition-colors cursor-pointer"
              >
                + বাংলা বর্ণনা / উক্তি যুক্ত করুন
              </button>
            </div>
          </div>
        )}

        {/* SHAPES OPTIONS */}
        {activeSidebarTab === 'shapes' && (
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleAddShape('rectangle')}
              className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center gap-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <div className="w-8 h-6 bg-indigo-500 rounded-xs" />
              <span>Rectangle</span>
            </button>
            <button
              onClick={() => handleAddShape('rounded-rectangle')}
              className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center gap-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <div className="w-8 h-6 bg-indigo-500 rounded-md" />
              <span>Rounded</span>
            </button>
            <button
              onClick={() => handleAddShape('circle')}
              className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center gap-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <div className="w-7 h-7 bg-indigo-500 rounded-full" />
              <span>Circle</span>
            </button>
            <button
              onClick={() => handleAddShape('triangle')}
              className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center gap-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-indigo-500" />
              <span>Triangle</span>
            </button>
            <button
              onClick={() => handleAddShape('star')}
              className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center gap-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <span className="text-xl text-indigo-400">★</span>
              <span>Star</span>
            </button>
            <button
              onClick={() => handleAddShape('heart')}
              className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center gap-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <span className="text-xl text-indigo-400">♥</span>
              <span>Heart</span>
            </button>
            <button
              onClick={() => handleAddShape('polygon')}
              className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center gap-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <div className="w-6 h-6 border-2 border-indigo-500 rotate-45" />
              <span>Polygon</span>
            </button>
            <button
              onClick={() => handleAddShape('arrow')}
              className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center gap-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <span className="text-lg text-indigo-400 font-bold">➜</span>
              <span>Arrow</span>
            </button>
            <button
              onClick={() => handleAddShape('line')}
              className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center gap-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <div className="w-8 h-1 bg-indigo-500 my-2" />
              <span>Line</span>
            </button>
          </div>
        )}

        {/* IMAGES OPTIONS */}
        {activeSidebarTab === 'images' && (
          <div className="flex flex-col gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-neutral-700 active:border-indigo-500 rounded-xl bg-neutral-950 flex flex-col items-center justify-center gap-1.5 text-neutral-300 cursor-pointer"
            >
              <Upload className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold text-white">Upload from Phone / Device</span>
              <span className="text-[10px] text-neutral-400">PNG, JPEG, WebP</span>
            </button>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-neutral-300">Sample Stock Photos</span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_PHOTOS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      const maxWidth = Math.min(project.width * 0.7, 400);
                      const s = maxWidth / sample.width;
                      const w = Math.round(sample.width * s);
                      const h = Math.round(sample.height * s);

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
                        border: { color: 'transparent', width: 0, radius: 0 },
                      };
                      addObject(newImgObj);
                      onClose();
                    }}
                    className="p-1.5 bg-neutral-950 border border-white/8 rounded-lg flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <img
                      src={sample.dataUrl}
                      alt={sample.name}
                      className="w-full h-16 object-cover rounded"
                    />
                    <span className="text-[10px] text-neutral-300 truncate w-full text-center">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STICKERS OPTIONS */}
        {activeSidebarTab === 'stickers' && (
          <div className="grid grid-cols-3 gap-2.5">
            {STICKER_COLLECTION.map((stk) => (
              <button
                key={stk.id}
                onClick={() => handleAddSticker(stk)}
                className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] text-neutral-300 cursor-pointer"
              >
                <svg viewBox={stk.viewBox} className="w-7 h-7" fill={stk.defaultColor}>
                  <path d={stk.svgPath} />
                </svg>
                <span className="truncate w-full text-center">{stk.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* CANVAS BACKGROUND OPTIONS */}
        {activeSidebarTab === 'background' && (
          <div className="flex flex-col gap-4">
            {/* Background Mode */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg">
              <button
                onClick={() => setBackground({ type: 'solid' })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer ${
                  project.background.type === 'solid' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
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
                className={`flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer ${
                  project.background.type === 'gradient'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400'
                }`}
              >
                Gradient
              </button>
              <button
                onClick={() => setBackground({ type: 'transparent' })}
                className={`flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer ${
                  project.background.type === 'transparent'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400'
                }`}
              >
                Clear
              </button>
            </div>

            {/* Solid Swatches */}
            {project.background.type === 'solid' && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-neutral-400">Color Palette</span>
                <div className="grid grid-cols-7 gap-2">
                  {COLOR_PALETTE_SWATCHES.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackground({ color })}
                      className="w-8 h-8 rounded-lg border border-white/20 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={project.background.color || '#0f172a'}
                    onChange={(e) => setBackground({ color: e.target.value })}
                    className="w-9 h-9 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={project.background.color || '#0f172a'}
                    onChange={(e) => setBackground({ color: e.target.value })}
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Gradient Presets */}
            {project.background.type === 'gradient' && (
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setBackground({ gradient: preset.gradient })}
                    className="h-14 rounded-xl border border-white/10 active:scale-95 p-2 flex items-end cursor-pointer"
                    style={{
                      background: `linear-gradient(${preset.gradient.angle}deg, ${preset.gradient.stops[0].color}, ${preset.gradient.stops[1].color})`,
                    }}
                  >
                    <span className="text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEMPLATES OPTIONS */}
        {activeSidebarTab === 'templates' && (
          <div className="flex flex-col gap-2.5">
            {EDITABLE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => {
                  if (confirm(`Load "${tmpl.name}"? This replaces current canvas layers.`)) {
                    setProject({
                      ...tmpl,
                      id: 'proj_' + Math.random().toString(36).substring(2, 9),
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    });
                    onClose();
                  }
                }}
                className="p-3 bg-neutral-800 active:bg-neutral-700 rounded-xl text-left border border-white/6 cursor-pointer"
              >
                <span className="text-xs font-semibold text-white block mb-0.5">{tmpl.name}</span>
                <span className="text-[10px] text-neutral-400">
                  {tmpl.width} × {tmpl.height} · {tmpl.objects.length} layers
                </span>
              </button>
            ))}
          </div>
        )}

        {/* LAYERS OPTIONS */}
        {activeSidebarTab === 'layers' && (
          <div className="flex flex-col">
            <RightInspector />
          </div>
        )}
      </div>
    </div>
  );
};
