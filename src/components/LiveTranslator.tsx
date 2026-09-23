import React, { useState, useEffect, useRef } from 'react';
import {
  translateTravelText,
  TranslationResult,
  OFFLINE_DICTIONARY
} from '../utils/translator';
import { speakKoreanText } from '../utils/geo';
import {
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  ArrowRightLeft,
  Eye,
  Sparkles,
  RotateCcw,
  History,
  Trash2,
  Languages,
  Clock
} from 'lucide-react';

interface LiveTranslatorProps {
  darkMode: boolean;
}

interface HistoryItem {
  id: string;
  source: string;
  translated: string;
  roman: string;
  direction: 'en-ko' | 'ko-en';
  time: string;
}

export const LiveTranslator: React.FC<LiveTranslatorProps> = ({ darkMode }) => {
  const [inputText, setInputText] = useState<string>('');
  const [direction, setDirection] = useState<'en-ko' | 'ko-en'>('en-ko');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [slowAudio, setSlowAudio] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [giantModalOpen, setGiantModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kr_travel_translation_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const recognitionRef = useRef<any>(null);

  // Quick Starters
  const quickStarters = [
    { label: 'Where is...', text: 'Where is ' },
    { label: 'How much is this?', text: 'How much is this?' },
    { label: 'Not spicy please', text: 'Please make it not spicy' },
    { label: 'No pork please', text: 'Please remove pork' },
    { label: 'Can I pay by card?', text: 'Can I pay by credit card?' },
    { label: 'Take me here', text: 'Please take me to this address' },
    { label: 'Water please', text: 'Water please' },
    { label: 'English menu?', text: 'Do you have an English menu?' },
    { label: 'Wi-Fi password?', text: 'What is the Wi-Fi password?' }
  ];

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleTranslate(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [direction]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported on this browser. You can type directly in the box.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = direction === 'en-ko' ? 'en-US' : 'ko-KR';
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate !== undefined ? textToTranslate : inputText;
    if (!text.trim()) return;

    setIsTranslating(true);
    const res = await translateTravelText(text, direction);
    setResult(res);
    setIsTranslating(false);

    // Save to history
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      source: text,
      translated: res.translatedText,
      roman: res.romanization,
      direction,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newItem, ...history.filter((h) => h.source !== text)].slice(0, 15);
    setHistory(updated);
    try {
      localStorage.setItem('kr_travel_translation_history', JSON.stringify(updated));
    } catch {}
  };

  const swapDirection = () => {
    setDirection((prev) => (prev === 'en-ko' ? 'ko-en' : 'en-ko'));
    if (result) {
      setInputText(result.translatedText);
      setResult(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string) => {
    speakKoreanText(text);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('kr_travel_translation_history');
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Top Direction & Controls Bar */}
      <div
        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 shadow-xs ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20">
            {direction === 'en-ko' ? '🇺🇸 English' : '🇰🇷 한국어 (Korean)'}
          </span>
          <button
            id="swap-translation-direction-btn"
            onClick={swapDirection}
            title="Swap translation direction"
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
          </button>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-600/15 text-purple-400 border border-purple-500/20">
            {direction === 'en-ko' ? '🇰🇷 한국어 (Korean)' : '🇺🇸 English'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            Offline dictionary active
          </span>
        </div>
      </div>

      {/* Main Translation Input & Output Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Source Text Input Card */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between shadow-xs ${
            darkMode ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
              <span>{direction === 'en-ko' ? 'Speak or type English' : '한국어 입력'}</span>
              {inputText && (
                <button
                  onClick={() => {
                    setInputText('');
                    setResult(null);
                  }}
                  className="hover:text-neutral-200"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              id="translator-input-area"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
              placeholder={
                direction === 'en-ko'
                  ? 'Type or speak: e.g., "Where is the subway?", "Not spicy please", "Can I pay by card?"...'
                  : '한국어를 입력하거나 마이크로 말하세요...'
              }
              className={`w-full bg-transparent text-sm sm:text-base resize-none outline-none leading-relaxed ${
                darkMode ? 'text-neutral-100 placeholder-neutral-500' : 'text-neutral-900 placeholder-neutral-400'
              }`}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/40 mt-2">
            <button
              id="mic-speech-input-btn"
              onClick={toggleListening}
              title="Voice Input (Speech-to-Text)"
              className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-md'
                  : darkMode
                  ? 'bg-neutral-800 text-neutral-300 hover:text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-purple-400" />}
              <span>{isListening ? 'Listening...' : 'Voice Mic'}</span>
            </button>

            <button
              id="submit-translate-btn"
              onClick={() => handleTranslate()}
              disabled={isTranslating || !inputText.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white shadow-md flex items-center gap-1.5 transition-colors"
            >
              {isTranslating ? (
                <span>Translating...</span>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  <span>Translate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Translation Output Card */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between shadow-xs ${
            result
              ? darkMode
                ? 'bg-neutral-900/90 border-purple-500/40 ring-1 ring-purple-500/20'
                : 'bg-white border-purple-300 ring-1 ring-purple-200'
              : darkMode
              ? 'bg-neutral-900/50 border-neutral-800'
              : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          {result ? (
            <div className="space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                  <span className="font-bold text-purple-400">
                    {direction === 'en-ko' ? '🇰🇷 Korean Translation' : '🇺🇸 English Translation'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                    {result.isOffline ? '⚡ Offline Match' : '🌐 Live Translated'}
                  </span>
                </div>

                {/* Big Translated Text */}
                <div className="text-xl sm:text-2xl font-black text-amber-400 leading-snug tracking-tight">
                  {result.translatedText}
                </div>

                {/* Romanized Pronunciation */}
                {result.romanization && (
                  <div className="mt-1.5 font-mono text-xs text-neutral-300 bg-neutral-800/40 p-1.5 rounded-lg">
                    Pronunciation: <span className="font-bold text-white">{result.romanization}</span>
                  </div>
                )}

                {result.notes && (
                  <div className="mt-1.5 text-[11px] text-neutral-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{result.notes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/40 mt-3">
                <div className="flex items-center gap-1">
                  {/* Audio Playback */}
                  <button
                    id="speak-translation-btn"
                    onClick={() => handleSpeak(result.translatedText)}
                    title="Speak in Korean"
                    className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Speak</span>
                  </button>

                  {/* Show Big Screen */}
                  <button
                    id="giant-screen-btn"
                    onClick={() => setGiantModalOpen(true)}
                    title="Show Giant Korean text to local"
                    className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Show to Local</span>
                  </button>
                </div>

                {/* Copy */}
                <button
                  onClick={() => handleCopy(result.translatedText)}
                  title="Copy translated text"
                  className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
              <Languages className="w-8 h-8 opacity-40 text-purple-400" />
              <p className="text-xs">
                Type above or tap a quick phrase below to translate instantly.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Phrase Prompt Chips */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Quick Travel Starters
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {quickStarters.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(starter.text);
                handleTranslate(starter.text);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                darkMode
                  ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                  : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
              }`}
            >
              {starter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Translation History Section */}
      {history.length > 0 && (
        <div
          className={`p-4 rounded-2xl border ${
            darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-white border-neutral-200'
          } shadow-xs space-y-2.5`}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-neutral-400">
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Recent Translations ({history.length})</span>
            </div>
            <button
              onClick={clearHistory}
              className="text-neutral-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setInputText(item.source);
                  setResult({
                    sourceText: item.source,
                    translatedText: item.translated,
                    romanization: item.roman,
                    isOffline: true
                  });
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs ${
                  darkMode
                    ? 'bg-neutral-950/60 border-neutral-800/80 hover:border-purple-500/40'
                    : 'bg-neutral-50 border-neutral-200 hover:border-purple-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-neutral-200 truncate">{item.source}</div>
                  <div className="font-bold text-amber-400 truncate">{item.translated}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(item.translated);
                    }}
                    title="Speak Korean"
                    className="p-1 rounded-md hover:bg-neutral-800 text-purple-400"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-neutral-500">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Giant Text Flashcard Modal (Show to Local Server / Taxi Driver) */}
      {giantModalOpen && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 text-center ${
              darkMode ? 'bg-neutral-950 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-neutral-950'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
              <span className="font-bold text-amber-400 tracking-wider uppercase">
                Show this screen to Korean local
              </span>
              <button
                onClick={() => setGiantModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Giant Hangul Text */}
            <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight leading-snug break-keep py-4">
              {result.translatedText}
            </div>

            {/* Romanized Pronunciation */}
            {result.romanization && (
              <div className="text-sm sm:text-base font-mono font-bold text-neutral-300 bg-neutral-900/80 px-3 py-2 rounded-xl">
                Pronunciation: {result.romanization}
              </div>
            )}

            {/* Original English Meaning */}
            <div className="text-sm text-neutral-400 italic">
              Meaning: "{result.sourceText}"
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleSpeak(result.translatedText)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 shadow-lg transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Pronounce (발음 듣기)</span>
              </button>

              <button
                onClick={() => setGiantModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
              >
                Close (닫기)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
