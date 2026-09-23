import React, { useState, useMemo, useEffect } from 'react';
import { CurrencyRate } from '../types';
import { CURRENCY_RATES, KOREA_PRICE_GUIDE, TAX_REFUND_INFO } from '../data/currency';
import { syncLiveCurrencyRates } from '../utils/onlineSync';
import {
  Coins,
  ArrowRightLeft,
  Receipt,
  CreditCard,
  Percent,
  Sparkles,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface CurrencyTabProps {
  darkMode: boolean;
}

export const CurrencyTab: React.FC<CurrencyTabProps> = ({ darkMode }) => {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [foreignAmount, setForeignAmount] = useState<string>('50');
  const [krwAmount, setKrwAmount] = useState<string>('');
  const [activeDirection, setActiveDirection] = useState<'foreign_to_krw' | 'krw_to_foreign'>('foreign_to_krw');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastUpdateDate, setLastUpdateDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem('kr_travel_currency_last_update');
    } catch {}
    return null;
  });

  // Custom rate overrides stored in state/storage
  const [rates, setRates] = useState<CurrencyRate[]>(() => {
    try {
      const saved = localStorage.getItem('kr_travel_currency_rates');
      if (saved) return JSON.parse(saved);
    } catch {}
    return CURRENCY_RATES;
  });

  // Listen for instant live rate updates from background sync
  useEffect(() => {
    const onRatesUpdated = (e: any) => {
      if (e.detail?.rates) {
        setRates(e.detail.rates);
        setLastUpdateDate(new Date().toISOString());
      }
    };
    window.addEventListener('currency-rates-updated', onRatesUpdated);
    return () => window.removeEventListener('currency-rates-updated', onRatesUpdated);
  }, []);

  const handleManualRatesSync = async () => {
    setIsSyncing(true);
    await syncLiveCurrencyRates();
    try {
      const saved = localStorage.getItem('kr_travel_currency_rates');
      if (saved) setRates(JSON.parse(saved));
      setLastUpdateDate(new Date().toISOString());
    } catch {}
    setIsSyncing(false);
  };

  const selectedCurrency = useMemo(() => {
    return rates.find((r) => r.code === selectedCurrencyCode) || rates[0];
  }, [rates, selectedCurrencyCode]);

  // Tax refund purchase input
  const [taxPurchaseAmount, setTaxPurchaseAmount] = useState<string>('85000');

  // T-money card trip days estimator
  const [tripDays, setTripDays] = useState<number>(5);

  // Synchronize conversions
  const calculatedKrw = useMemo(() => {
    if (activeDirection === 'foreign_to_krw') {
      const num = parseFloat(foreignAmount) || 0;
      return Math.round(num * selectedCurrency.rateToKrw);
    } else {
      return Math.round(parseFloat(krwAmount) || 0);
    }
  }, [foreignAmount, krwAmount, activeDirection, selectedCurrency]);

  const calculatedForeign = useMemo(() => {
    if (activeDirection === 'krw_to_foreign') {
      const num = parseFloat(krwAmount) || 0;
      return selectedCurrency.rateToKrw > 0 ? (num / selectedCurrency.rateToKrw).toFixed(2) : '0';
    } else {
      return foreignAmount;
    }
  }, [krwAmount, foreignAmount, activeDirection, selectedCurrency]);

  const handleForeignChange = (val: string) => {
    setActiveDirection('foreign_to_krw');
    setForeignAmount(val);
  };

  const handleKrwChange = (val: string) => {
    setActiveDirection('krw_to_foreign');
    setKrwAmount(val);
  };

  const handleAddKrwQuick = (amount: number) => {
    setActiveDirection('krw_to_foreign');
    const current = parseFloat(krwAmount) || calculatedKrw || 0;
    setKrwAmount((current + amount).toString());
  };

  // Tax refund estimation
  const taxRefundEstimate = useMemo(() => {
    const purchase = parseFloat(taxPurchaseAmount) || 0;
    if (purchase < TAX_REFUND_INFO.minPurchaseKrw) {
      return { eligible: false, refundKrw: 0, refundForeign: 0 };
    }
    const refundKrw = Math.round(purchase * TAX_REFUND_INFO.estimatedVatRate);
    const refundForeign = (refundKrw / selectedCurrency.rateToKrw).toFixed(2);
    return { eligible: true, refundKrw, refundForeign };
  }, [taxPurchaseAmount, selectedCurrency]);

  // T-money reload recommendation
  const tmoneyRecommendation = useMemo(() => {
    // Average 4 subway/bus rides per day @ 1,400 KRW = ~5,600 KRW/day + 3,000 KRW buffer/convenience store drinks
    const dailyTransitCost = 8600;
    const totalEstimate = tripDays * dailyTransitCost;
    return {
      totalKrw: Math.round(totalEstimate / 10000) * 10000, // round to neat 10k won bills
      totalForeign: ((Math.round(totalEstimate / 10000) * 10000) / selectedCurrency.rateToKrw).toFixed(2)
    };
  }, [tripDays, selectedCurrency]);

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-5 space-y-4 pb-16">
      {/* Top Banner */}
      <div
        className={`p-4 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              Korean Won (₩ KRW) Currency Converter
            </h2>
            <p className="text-xs text-neutral-400">
              Offline calculator with preloaded rates, denomination cheat sheet, and tax refund estimator.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Converter Box */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm space-y-4`}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Foreign Currency Selector */}
          <div className="flex-1">
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">
              Your Home Currency
            </label>
            <div className="flex items-center gap-2">
              <select
                id="currency-selector"
                value={selectedCurrencyCode}
                onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-sm font-bold border outline-none cursor-pointer ${
                  darkMode ? 'bg-neutral-950 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300'
                }`}
              >
                {rates.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {r.code} - {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center pt-5">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Rate Tag */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="text-[11px] font-mono text-neutral-400 mb-1">Exchange Reference Rate</div>
            <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 text-xs font-mono font-bold text-neutral-200 flex items-center justify-between">
              <span>1 {selectedCurrency.code} =</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                ₩ {selectedCurrency.rateToKrw.toLocaleString()} KRW
              </span>
            </div>
          </div>
        </div>

        {/* Input Cards: Dual Entry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Home Currency Input */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              activeDirection === 'foreign_to_krw'
                ? 'border-blue-500/70 bg-blue-500/5 ring-1 ring-blue-500/30'
                : 'border-neutral-800 bg-neutral-950/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>{selectedCurrency.flag} {selectedCurrency.name}</span>
              <span className="font-mono font-bold">{selectedCurrency.symbol}</span>
            </div>
            <input
              id="foreign-amount-input"
              type="number"
              value={activeDirection === 'foreign_to_krw' ? foreignAmount : calculatedForeign}
              onChange={(e) => handleForeignChange(e.target.value)}
              placeholder="0.00"
              className="w-full text-2xl sm:text-3xl font-mono font-black bg-transparent outline-none text-neutral-100"
            />
          </div>

          {/* Korean Won (KRW) Input */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              activeDirection === 'krw_to_foreign'
                ? 'border-emerald-500/70 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                : 'border-neutral-800 bg-neutral-950/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span className="font-medium text-emerald-400">🇰🇷 Korean Won (한화)</span>
              <span className="font-mono font-bold">₩ KRW</span>
            </div>
            <input
              id="krw-amount-input"
              type="number"
              value={activeDirection === 'krw_to_foreign' ? krwAmount : calculatedKrw}
              onChange={(e) => handleKrwChange(e.target.value)}
              placeholder="0"
              className="w-full text-2xl sm:text-3xl font-mono font-black bg-transparent outline-none text-emerald-400"
            />
          </div>
        </div>

        {/* Live Market Rate Bar & Instant Sync Button */}
        <div
          className={`px-3.5 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
            darkMode ? 'bg-neutral-950/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-400">
              1 {selectedCurrency.code} = ₩{selectedCurrency.rateToKrw.toLocaleString()} KRW
            </span>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              • {lastUpdateDate ? 'Live market rates active' : 'Offline benchmark'}
            </span>
          </div>
          <button
            onClick={handleManualRatesSync}
            disabled={isSyncing}
            className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 active:scale-95 text-white font-medium text-[11px] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Updating Rates...' : 'Sync Live Rates'}</span>
          </button>
        </div>

        {/* Quick Won Keypad Adders */}
        <div>
          <div className="text-[11px] font-mono text-neutral-400 mb-1.5 flex items-center justify-between">
            <span>Quick Won Adders (tap to calculate):</span>
            <button
              onClick={() => {
                setKrwAmount('');
                setForeignAmount('');
              }}
              className="text-neutral-400 hover:text-white text-[11px] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[1000, 5000, 10000, 50000].map((amount) => (
              <button
                key={amount}
                onClick={() => handleAddKrwQuick(amount)}
                className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
                  darkMode
                    ? 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
                    : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                }`}
              >
                + ₩{amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Korean Banknotes Denomination Cheat Sheet */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          Korea Cash Denomination Cheat Sheet
        </h3>
        <p className="text-xs text-neutral-400 mb-3">
          Quickly understand what each Korean bill is worth in your home currency:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            {
              bill: '1,000 ₩',
              color: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
              equiv: (1000 / selectedCurrency.rateToKrw).toFixed(2),
              example: 'Subway single ticket, street snack'
            },
            {
              bill: '5,000 ₩',
              color: 'border-orange-500/40 bg-orange-950/20 text-orange-400',
              equiv: (5000 / selectedCurrency.rateToKrw).toFixed(2),
              example: 'Iced Americano, convenience store bento'
            },
            {
              bill: '10,000 ₩',
              color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
              equiv: (10000 / selectedCurrency.rateToKrw).toFixed(2),
              example: 'Traditional restaurant meal (Bibimbap)'
            },
            {
              bill: '50,000 ₩',
              color: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
              equiv: (50000 / selectedCurrency.rateToKrw).toFixed(2),
              example: 'Yellow bill, KTX train, K-BBQ for two'
            }
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-xl border ${item.color} flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm">{item.bill}</span>
                <span className="text-[11px] font-mono font-bold">
                  ≈ {selectedCurrency.symbol}{item.equiv}
                </span>
              </div>
              <div className="text-[11px] text-neutral-300 mt-2 line-clamp-2">
                {item.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Tax-Free & Tax Refund Estimator */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm space-y-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm">Korea Tax-Free Refund Estimator</h3>
          </div>
          <span className="text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Instant VAT Deduction
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          Purchases over ₩15,000 in cosmetics, fashion, and electronics qualify for ~6% to 8% tax refund.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">
              Store Purchase Total (₩ KRW)
            </label>
            <input
              type="number"
              value={taxPurchaseAmount}
              onChange={(e) => setTaxPurchaseAmount(e.target.value)}
              placeholder="85000"
              className={`w-full p-2 rounded-xl text-sm font-mono font-bold border outline-none ${
                darkMode ? 'bg-neutral-950 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300'
              }`}
            />
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col justify-center">
            <span className="text-[11px] uppercase font-mono text-neutral-400">Estimated Cash Back</span>
            <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
              {taxRefundEstimate.eligible
                ? `₩ ${taxRefundEstimate.refundKrw.toLocaleString()} (≈ ${selectedCurrency.symbol}${taxRefundEstimate.refundForeign})`
                : 'Below ₩15,000 minimum threshold'}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-400 space-y-1 pt-1">
          {TAX_REFUND_INFO.requirements.map((req, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-emerald-500">•</span>
              <span>{req}</span>
            </div>
          ))}
        </div>
      </div>

      {/* T-Money Card Reload Planner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-blue-500" />
          <h3 className="font-bold text-sm">T-Money Card Transit Reload Estimator</h3>
        </div>
        <p className="text-xs text-neutral-400 mb-3">
          T-Money cards must be reloaded with physical Korean cash at convenience stores (CU, GS25) or subway kiosks.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-neutral-950/40 border border-neutral-800">
          <div>
            <span className="text-xs font-semibold text-neutral-200">Trip Duration in Korea:</span>
            <div className="flex items-center gap-2 mt-1">
              {[3, 5, 7, 10, 14].map((days) => (
                <button
                  key={days}
                  onClick={() => setTripDays(days)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    tripDays === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block">Recommended Cash Reload</span>
            <span className="text-lg font-black font-mono text-blue-400">
              ₩ {tmoneyRecommendation.totalKrw.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-neutral-400 block">
              (≈ {selectedCurrency.symbol}{tmoneyRecommendation.totalForeign})
            </span>
          </div>
        </div>
      </div>

      {/* Typical Price Reference */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <h3 className="font-bold text-sm mb-3">Real-Life South Korea Price Reference</h3>
        <div className="space-y-3">
          {KOREA_PRICE_GUIDE.map((cat, i) => (
            <div key={i} className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">
                {cat.category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.items.map((item, j) => (
                  <div
                    key={j}
                    className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-neutral-200">{item.name}</div>
                      <div className="text-[10px] text-neutral-400">{item.note}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2 font-mono">
                      <div className="text-xs font-bold text-emerald-400">
                        ₩{item.krw.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        ≈ {selectedCurrency.symbol}{(item.krw / selectedCurrency.rateToKrw).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
