import React from 'react';
import { X, Download, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface AppIconModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const AppIconModal: React.FC<AppIconModalProps> = ({ isOpen, onClose, darkMode }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const iconVariants = [
    {
      label: '512×512 PNG (Master App Store & PWA Icon)',
      file: `${import.meta.env.BASE_URL}pwa-512x512.png`,
      downloadName: 'korea-travel-icon-512x512.png',
      desc: 'Full high-resolution icon for PWABuilder, Google Play, and desktop launchers.',
      badge: 'Recommended'
    },
    {
      label: '192×192 PNG (Mobile Home Screen)',
      file: `${import.meta.env.BASE_URL}pwa-192x192.png`,
      downloadName: 'korea-travel-icon-192x192.png',
      desc: 'Standard Android and mobile browser installation icon.',
      badge: 'Standard'
    },
    {
      label: '512×512 Maskable PNG (Android Adaptive Safe-Zone)',
      file: `${import.meta.env.BASE_URL}pwa-maskable-512x512.png`,
      downloadName: 'korea-travel-icon-maskable.png',
      desc: 'Specially padded so Android can crop into circles or squircles without clipping edges.',
      badge: 'Android'
    },
    {
      label: '180×180 PNG (Apple Touch Icon for iOS Safari)',
      file: `${import.meta.env.BASE_URL}apple-touch-icon.png`,
      downloadName: 'apple-touch-icon.png',
      desc: 'Required icon format when users tap "Add to Home Screen" on iPhone and iPad.',
      badge: 'iOS'
    },
    {
      label: 'Scalable SVG Vector Graphic',
      file: `${import.meta.env.BASE_URL}icon.svg`,
      downloadName: 'korea-travel-icon.svg',
      desc: 'Lossless vector format, perfect for Figma, Illustrator, or web UI scaling.',
      badge: 'Vector'
    },
    {
      label: 'High-Res App Store Render (JPG)',
      file: `${import.meta.env.BASE_URL}app-icon.jpg`,
      downloadName: 'korea-travel-icon-render.jpg',
      desc: 'AI-generated high-fidelity concept art mockup.',
      badge: 'Concept'
    }
  ];

  return (
    <div
      id="app-icon-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          darkMode
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">App Icon Assets</h3>
              <p className="text-[11px] text-neutral-400">South Korea Travel Companion Official Branding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Main Icon Visual Display */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 text-center sm:text-left">
            <div className="relative group shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}pwa-512x512.png`}
                alt="App Icon Preview"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-xl border border-neutral-700 object-cover bg-neutral-950"
              />
              <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                512px
              </div>
            </div>
            <div className="space-y-1.5 min-w-0">
              <h4 className="font-bold text-sm text-white">South Korea Travel Companion</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Taegeuk navigation emblem combining South Korea's iconic yin-yang motif with a high-contrast GPS compass dial and midnight blue background.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <a
                  href={`${import.meta.env.BASE_URL}pwa-512x512.png`}
                  download="korea-travel-icon-512x512.png"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 512px PNG</span>
                </a>
              </div>
            </div>
          </div>

          {/* Download Options List */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Available Formats</h5>
            <div className="grid gap-2">
              {iconVariants.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-200 truncate">{item.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-neutral-800 text-neutral-300 border border-neutral-700 shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{item.desc}</p>
                  </div>
                  <a
                    href={item.file}
                    download={item.downloadName}
                    title={`Download ${item.downloadName}`}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Save</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-800/60 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-neutral-400">PWABuilder, iOS & Android compatible</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
