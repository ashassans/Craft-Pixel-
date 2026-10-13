import { Download, Share2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { renderProjectToBlob } from '../../engine/export-renderer';
import { useEditorStore } from '../../store/editorStore';

export const ExportModal: React.FC = () => {
  const { project, isExportModalOpen, setExportModalOpen } = useEditorStore();

  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [scale, setScale] = useState<number>(1);
  const [quality, setQuality] = useState<number>(0.92);
  const [transparent, setTransparent] = useState<boolean>(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [outputDim, setOutputDim] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Render preview whenever settings change
  useEffect(() => {
    if (!project || !isExportModalOpen) return;

    let isMounted = true;
    setIsRendering(true);
    setErrorMsg(null);

    renderProjectToBlob(project, {
      format,
      scale,
      quality,
      transparent,
    })
      .then((res) => {
        if (!isMounted) return;
        setPreviewUrl(res.dataUrl);
        setPreviewBlob(res.blob);
        setOutputDim({ width: res.width, height: res.height });
        setIsRendering(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Export error:', err);
        setErrorMsg('Failed to render project. Resolution may be too large.');
        setIsRendering(false);
      });

    return () => {
      isMounted = false;
    };
  }, [project, isExportModalOpen, format, scale, quality, transparent]);

  if (!isExportModalOpen || !project) return null;

  const handleDownload = () => {
    if (!previewBlob) return;
    const url = URL.createObjectURL(previewBlob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.download = `${sanitizedName}_${outputDim.width}x${outputDim.height}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleShare = async () => {
    if (!previewBlob || !navigator.share) return;
    try {
      const file = new File(
        [previewBlob],
        `${project.name}.${format}`,
        { type: previewBlob.type }
      );
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: project.name,
          text: 'Created with CraftPixel Studio',
        });
      }
    } catch (err) {
      console.warn('Share cancelled or not supported:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="h-14 px-6 border-b border-white/8 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Export Artwork</h2>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Split: Settings Left, Preview Right */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Settings */}
          <div className="flex flex-col gap-4">
            {/* Format Selection */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Image Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormat('png')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                    format === 'png'
                      ? 'bg-indigo-950 border-indigo-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  PNG (Lossless)
                </button>
                <button
                  onClick={() => {
                    setFormat('jpeg');
                    setTransparent(false);
                  }}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                    format === 'jpeg'
                      ? 'bg-indigo-950 border-indigo-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  JPEG (Compact)
                </button>
              </div>
            </div>

            {/* Resolution Multiplier */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Resolution Scale
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors cursor-pointer text-center ${
                      scale === s
                        ? 'bg-indigo-950 border-indigo-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s}x {s === 1 ? '(Standard)' : s === 2 ? '(High-Res)' : '(Ultra)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Transparent PNG Toggle */}
            {format === 'png' && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <div>
                  <span className="text-xs text-neutral-200 block font-medium">
                    Transparent Background
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Omit canvas background for cutout exports
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </div>
            )}

            {/* JPEG Quality Slider */}
            {format === 'jpeg' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <span>Compression Quality</span>
                  <span className="font-mono">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Resolution specs summary */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-white/6 text-xs flex flex-col gap-1">
              <span className="text-neutral-400 text-[11px]">Output Dimensions:</span>
              <span className="font-mono text-neutral-200 text-sm font-semibold">
                {outputDim.width} × {outputDim.height} px
              </span>
              {previewBlob && (
                <span className="text-[10px] text-neutral-400">
                  Approx. Size: {(previewBlob.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Real-time Render Preview */}
          <div className="flex flex-col items-center justify-center bg-neutral-950 rounded-xl border border-white/8 p-3 min-h-[220px]">
            {isRendering ? (
              <div className="flex flex-col items-center gap-2 text-neutral-400 text-xs">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>Rendering High-Res Preview...</span>
              </div>
            ) : previewUrl ? (
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Export Preview"
                  className="max-h-[240px] max-w-full object-contain rounded shadow-lg border border-white/10"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="h-16 px-6 border-t border-white/8 flex items-center justify-end gap-3 shrink-0 bg-neutral-950">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleShare}
              disabled={isRendering || !previewBlob}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          )}

          <button
            onClick={() => setExportModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleDownload}
            disabled={isRendering || !previewBlob}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
