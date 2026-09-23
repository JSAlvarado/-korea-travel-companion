import React, { useState, useMemo } from 'react';
import { Phrase, PhraseCategory } from '../types';
import { PHRASES } from '../data/phrases';
import { speakKoreanText } from '../utils/geo';
import { LiveTranslator } from './LiveTranslator';
import { KoreanNumberHelper } from './KoreanNumberHelper';
import {
  Volume2,
  Search,
  Star,
  Copy,
  Check,
  Languages,
  Sparkles,
  Eye,
  MessageSquare,
  BookOpen,
  Coins,
  MapPin
} from 'lucide-react';

interface PhrasebookTabProps {
  darkMode: boolean;
}

export const PhrasebookTab: React.FC<PhrasebookTabProps> = ({ darkMode }) => {
  const [subMode, setSubMode] = useState<'translator' | 'phrasebook' | 'numbers' | 'dialect'>('translator');
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kr_travel_favorite_phrases');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['t-1', 'f-1', 'f-3', 'f-4', 'b-1', 'b-2', 'e-1', 'db-1'];
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [giantPhrase, setGiantPhrase] = useState<Phrase | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(updated);
    try {
      localStorage.setItem('kr_travel_favorite_phrases', JSON.stringify(updated));
    } catch {}
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPhrases = useMemo(() => {
    return PHRASES.filter((phrase) => {
      const matchCategory =
        subMode === 'dialect'
          ? phrase.category === 'daegu_busan'
          : selectedCategory === 'all' || phrase.category === selectedCategory;

      const matchFavorites = !showOnlyFavorites || favorites.includes(phrase.id);
      const matchSearch =
        !searchQuery ||
        phrase.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phrase.ko.includes(searchQuery) ||
        phrase.roman.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchFavorites && matchSearch;
    });
  }, [subMode, selectedCategory, searchQuery, showOnlyFavorites, favorites]);

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-5 space-y-4 pb-16">
      {/* Top Title & Sub-Mode Navigation Bar */}
      <div
        className={`p-4 rounded-2xl border transition-colors shadow-sm ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Bilingual Korean Travel Communications
              </h2>
              <p className="text-xs text-neutral-400">
                Live speech & text translator, 80+ offline phrases, and Korean Won currency pronouncer.
              </p>
            </div>
          </div>

          {/* Sub-Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-neutral-800/60 p-1 rounded-xl border border-neutral-700/60 overflow-x-auto no-scrollbar">
            <button
              id="subtab-translator-btn"
              onClick={() => setSubMode('translator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                subMode === 'translator'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Translator</span>
            </button>

            <button
              id="subtab-phrasebook-btn"
              onClick={() => setSubMode('phrasebook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                subMode === 'phrasebook'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Phrases ({PHRASES.length})</span>
            </button>

            <button
              id="subtab-numbers-btn"
              onClick={() => setSubMode('numbers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                subMode === 'numbers'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Numbers & Prices</span>
            </button>

            <button
              id="subtab-dialect-btn"
              onClick={() => setSubMode('dialect')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                subMode === 'dialect'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Daegu & Busan</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: LIVE TRANSLATOR */}
      {subMode === 'translator' && <LiveTranslator darkMode={darkMode} />}

      {/* MODE 3: NUMBERS & PRICES */}
      {subMode === 'numbers' && <KoreanNumberHelper darkMode={darkMode} />}

      {/* MODE 2 & 4: PHRASEBOOK / DAEGU & BUSAN DIALECT */}
      {(subMode === 'phrasebook' || subMode === 'dialect') && (
        <div className="space-y-3">
          {/* Search and Category Filters */}
          <div className="space-y-2">
            {/* Search Bar & Favorites Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="phrase-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search phrases (e.g. water, spicy, subway, bill, help)..."
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-colors ${
                    darkMode
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-100 focus:border-purple-500'
                      : 'bg-white border-neutral-200 text-neutral-900 focus:border-purple-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                id="favorites-filter-btn"
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors shrink-0 ${
                  showOnlyFavorites
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : darkMode
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:text-neutral-900'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span className="hidden sm:inline">Saved</span>
                <span>({favorites.length})</span>
              </button>
            </div>

            {/* Category Pills (Only in General Phrasebook mode) */}
            {subMode === 'phrasebook' && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: 'All Phrases' },
                  { id: 'transit', label: '🚇 Subway & Transit' },
                  { id: 'food', label: '🍲 Food & Dietary' },
                  { id: 'hotel', label: '🏨 Hotel & 1-Mo Stay' },
                  { id: 'shopping', label: '🛍️ Shopping' },
                  { id: 'medical', label: '🏥 Medical & Health' },
                  { id: 'emergency', label: '🚨 Emergency & Police' },
                  { id: 'basic', label: '👋 Politeness' },
                  { id: 'daegu_busan', label: '🏯 Daegu & Busan' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    id={`phrase-cat-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : darkMode
                        ? 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                        : 'bg-neutral-100 border border-neutral-200 text-neutral-700 hover:text-black'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phrases Grid / List */}
          <div className="space-y-2.5">
            {filteredPhrases.length === 0 ? (
              <div
                className={`p-8 text-center rounded-2xl border ${
                  darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
                }`}
              >
                <p className="text-sm text-neutral-400">No phrases found matching "{searchQuery}".</p>
              </div>
            ) : (
              filteredPhrases.map((phrase) => {
                const isFav = favorites.includes(phrase.id);
                return (
                  <div
                    key={phrase.id}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                      darkMode
                        ? 'bg-neutral-900/90 border-neutral-800/80 hover:border-neutral-700'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    } shadow-xs space-y-2`}
                  >
                    {/* Top Row: English Meaning & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm sm:text-base font-bold text-neutral-100">
                        {phrase.en}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Speak Button */}
                        <button
                          id={`speak-btn-${phrase.id}`}
                          onClick={() => speakKoreanText(phrase.ko)}
                          title="Pronounce in Korean"
                          className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-purple-600/30 text-purple-400 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Show Big Screen to Local */}
                        <button
                          id={`giant-btn-${phrase.id}`}
                          onClick={() => setGiantPhrase(phrase)}
                          title="Show Giant Korean Text on Screen"
                          className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-700 text-neutral-300 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-amber-400" />
                        </button>

                        {/* Copy Hangul */}
                        <button
                          onClick={() => handleCopy(phrase.ko, phrase.id)}
                          title="Copy Korean"
                          className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                        >
                          {copiedId === phrase.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Favorite Star */}
                        <button
                          onClick={() => toggleFavorite(phrase.id)}
                          title={isFav ? 'Remove favorite' : 'Save phrase'}
                          className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Korean Hangul Text */}
                    <div className="text-lg sm:text-xl font-extrabold text-amber-400 tracking-tight">
                      {phrase.ko}
                    </div>

                    {/* Romanization & Cultural Tips */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-neutral-800/50 text-xs">
                      <div className="font-mono text-neutral-400 italic">
                        Pronunciation: <span className="text-neutral-200 not-italic font-semibold">{phrase.roman}</span>
                      </div>
                      {phrase.tips && (
                        <div className="text-[11px] text-purple-400/90 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span>{phrase.tips}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Giant Phrase Display Modal (Show to Local) */}
      {giantPhrase && (
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
                onClick={() => setGiantPhrase(null)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Giant Korean Text */}
            <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight leading-snug break-keep py-4">
              {giantPhrase.ko}
            </div>

            {/* Romanized Pronunciation */}
            <div className="text-sm sm:text-base font-mono font-bold text-neutral-300 bg-neutral-900/80 px-3 py-2 rounded-xl">
              Pronunciation: {giantPhrase.roman}
            </div>

            {/* Original English Meaning */}
            <div className="text-sm text-neutral-400 italic">
              Meaning: "{giantPhrase.en}"
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => speakKoreanText(giantPhrase.ko)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 shadow-lg transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Pronounce (발음 듣기)</span>
              </button>

              <button
                onClick={() => setGiantPhrase(null)}
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
