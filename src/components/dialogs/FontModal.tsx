import { CheckCircle2, Type, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  loadAllCustomFonts,
  saveCustomFont,
  StoredCustomFont,
} from '../../services/projectStorage';
import { useEditorStore } from '../../store/editorStore';

const BENGALI_TEST_PHRASES = [
  { label: 'সাধারণ বাক্য', text: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।' },
  { label: 'যুক্তবর্ণ পরীক্ষা (Conjuncts)', text: 'শিক্ষা, বিজ্ঞান, প্রযুক্তি, ব্রাহ্মণ, কৃষ্ণ, শৃঙ্খলা।' },
  { label: 'উক্তি (Quote)', text: 'জ্ঞান যেখানে সীমাবদ্ধ, বুদ্ধি সেখানে আড়ষ্ট, মুক্তি সেখানে অসম্ভব।' },
];

export const FontModal: React.FC = () => {
  const { isFontModalOpen, setFontModalOpen } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customFonts, setCustomFonts] = useState<StoredCustomFont[]>([]);
  const [selectedPreviewFont, setSelectedPreviewFont] = useState<string>('Hind Siliguri');
  const [testText, setTestText] = useState<string>(BENGALI_TEST_PHRASES[1].text);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isFontModalOpen) {
      loadAllCustomFonts().then(setCustomFonts).catch(console.error);
    }
  }, [isFontModalOpen]);

  if (!isFontModalOpen) return null;

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Loading font file...');
      const fontName = file.name.replace(/\.[^/.]+$/, '');
      const buffer = await file.arrayBuffer();

      const fontFace = new FontFace(fontName, buffer);
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);

      // Convert to base64 for IndexedDB persistence
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        await saveCustomFont(fontName, file.type || 'font/ttf', dataUrl);
        const all = await loadAllCustomFonts();
        setCustomFonts(all);
        setSelectedPreviewFont(fontName);
        setUploadStatus(`Successfully registered "${fontName}"!`);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Font load error:', err);
      setUploadStatus('Failed to load font. Please ensure it is a valid TTF/OTF file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-white/8 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">
              Font Manager & Bengali Unicode
            </h2>
          </div>
          <button
            onClick={() => setFontModalOpen(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Custom Font Uploader */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-white/6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white">Import Custom Font</h3>
                <p className="text-[11px] text-neutral-400">
                  Load your own TTF or OTF fonts into the browser workspace.
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFontUpload}
                accept=".ttf,.otf,.woff,.woff2"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload TTF / OTF</span>
              </button>
            </div>

            {uploadStatus && (
              <span className="text-[11px] text-indigo-300 bg-indigo-950/40 p-2 rounded border border-indigo-500/20">
                {uploadStatus}
              </span>
            )}

            {customFonts.length > 0 && (
              <div className="pt-2 border-t border-white/6 flex flex-wrap gap-2">
                <span className="text-[10px] text-neutral-400 w-full">Installed Custom Fonts:</span>
                {customFonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedPreviewFont(f.name)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      selectedPreviewFont === f.name
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bengali Unicode & Conjunct Shaping Verifier */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bengali Shaping & Glyph Ligature Tester</span>
              </h3>
              <span className="text-[10px] text-neutral-400">
                Verifies HarfBuzz / OpenType conjunct rendering
              </span>
            </div>

            {/* Font Selector for preview */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-neutral-400">Preview Font:</label>
              <select
                value={selectedPreviewFont}
                onChange={(e) => setSelectedPreviewFont(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="Hind Siliguri">Hind Siliguri (Google Fonts)</option>
                <option value="Noto Sans Bengali">Noto Sans Bengali (Google Fonts)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                {customFonts.map((cf) => (
                  <option key={cf.id} value={cf.name}>
                    {cf.name} (Custom)
                  </option>
                ))}
              </select>
            </div>

            {/* Test Sample Quick Buttons */}
            <div className="flex flex-wrap gap-2">
              {BENGALI_TEST_PHRASES.map((phrase) => (
                <button
                  key={phrase.label}
                  onClick={() => setTestText(phrase.text)}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] transition-colors cursor-pointer"
                >
                  {phrase.label}
                </button>
              ))}
            </div>

            {/* Interactive Preview Canvas Box */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3 min-h-[120px] justify-center">
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                rows={2}
                style={{ fontFamily: `"${selectedPreviewFont}", sans-serif` }}
                className="w-full bg-transparent text-xl sm:text-2xl text-amber-200 border-0 focus:outline-none resize-none leading-relaxed"
              />
              <div className="text-[10px] text-neutral-400 flex items-center justify-between border-t border-white/6 pt-2">
                <span>Font: {selectedPreviewFont}</span>
                <span>Conjuncts: ক্ষ (ক+ষ), জ্ঞ (জ+ঞ), ত্ত (ত+ত), ঙ্ক (ঙ+ক)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 px-6 border-t border-white/8 flex items-center justify-end shrink-0 bg-neutral-950">
          <button
            onClick={() => setFontModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
