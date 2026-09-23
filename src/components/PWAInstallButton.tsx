import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running in standalone PWA or native APK wrapper
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
        title="Install app to your phone home screen"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-200 font-medium text-xs transition-colors shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl text-neutral-100">
              <h3 className="text-base font-bold text-white mb-2">Install on iPhone / iPad</h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                1. Tap the <strong>Share</strong> button (box with arrow) in Safari.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Tap <strong>Add</strong> in the top right corner.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-blue-600 font-bold text-xs text-white hover:bg-blue-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
