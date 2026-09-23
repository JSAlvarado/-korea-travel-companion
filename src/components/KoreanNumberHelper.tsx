import React, { useState } from 'react';
import { convertWonToKorean, KOREAN_COUNTERS } from '../utils/koreanNumbers';
import { speakKoreanText } from '../utils/geo';
import { Volume2, Coins, Sparkles, Copy, Check, Hash, Info } from 'lucide-react';

interface KoreanNumberHelperProps {
  darkMode: boolean;
}

export const KoreanNumberHelper: React.FC<KoreanNumberHelperProps> = ({ darkMode }) => {
  const [inputAmount, setInputAmount] = useState<number>(15000);
  const [customText, setCustomText] = useState<string>('15000');
  const [copied, setCopied] = useState<boolean>(false);

  const presets = [
    { label: '₩1,000 (Coffee/Snack)', value: 1000 },
    { label: '₩3,000 (Subway/Bus)', value: 3000 },
    { label: '₩5,000 (Convenience)', value: 5000 },
    { label: '₩10,000 (Lunch meal)', value: 10000 },
    { label: '₩25,000 (Dinner BBQ)', value: 25000 },
    { label: '₩50,000 (Hotel/Taxi)', value: 50000 },
    { label: '₩100,000 (Shopping)', value: 100000 }
  ];

  const result = convertWonToKorean(inputAmount);

  const handleInputChange = (val: string) => {
    setCustomText(val);
    const parsed = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(parsed)) {
      setInputAmount(parsed);
    } else {
      setInputAmount(0);
    }
  };

  const handlePreset = (val: number) => {
    setInputAmount(val);
    setCustomText(val.toString());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    speakKoreanText(result.hangul);
  };

  return (
    <div className="space-y-4">
      {/* Title & Info Banner */}
      <div
        className={`p-4 rounded-2xl border shadow-xs ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Korean Won Price & Number Pronouncer</h3>
            <p className="text-xs text-neutral-400">
              Korean currency uses the 10,000 unit (만 / Man). Enter any amount below to see the Hangul pronunciation and hear audio playback.
            </p>
          </div>
        </div>
      </div>

      {/* Input & Output Card */}
      <div
        className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
          darkMode ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-400">Enter Price or Number (KRW / ₩)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-base">
              ₩
            </span>
            <input
              type="text"
              value={customText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="e.g. 15000"
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl text-lg font-mono font-bold outline-none border transition-colors ${
                darkMode
                  ? 'bg-neutral-950 border-neutral-700 text-white focus:border-amber-500'
                  : 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-amber-500'
              }`}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePreset(p.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                inputAmount === p.value
                  ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-xs'
                  : darkMode
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Pronunciation Output Display */}
        <div
          className={`p-4 rounded-xl border space-y-2 ${
            darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-bold text-amber-400">Korean Pronunciation</span>
            <span className="font-mono">{result.amount.toLocaleString()} KRW</span>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
            {result.hangul}
          </div>

          <div className="text-sm font-mono text-neutral-300">
            Pronounced: <span className="font-bold text-white">{result.roman}</span>
          </div>

          <div className="text-xs text-neutral-400 pt-1 border-t border-neutral-800 flex items-center justify-between">
            <span>Formula: {result.breakdown}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 flex items-center gap-1 font-bold text-xs"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Audio</span>
              </button>
              <button
                onClick={() => handleCopy(result.hangul)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Everyday Korean Counting Units (People, Beer, Servings) */}
      <div
        className={`p-4 rounded-2xl border space-y-2.5 shadow-xs ${
          darkMode ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
          <Info className="w-4 h-4 text-purple-400" />
          <span>Everyday Ordering Counters (Restaurant & Bar Essentials)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {KOREAN_COUNTERS.map((c, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                darkMode ? 'bg-neutral-950/70 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="text-neutral-400 font-medium">{c.item}</div>
              <div className="font-bold text-amber-400">{c.counter}</div>
              <div className="font-mono text-[11px] text-neutral-300">{c.example}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
