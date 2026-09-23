import React from 'react';
import { Globe, CreditCard, Compass, AlertCircle, Zap, Trash2, Wifi, Utensils } from 'lucide-react';

interface TravelTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const TravelTipsModal: React.FC<TravelTipsModalProps> = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  const tips = [
    {
      icon: Compass,
      title: 'South Korea Maps & Navigation Truth',
      ko: '지도 및 길찾기 안내',
      desc: 'Due to national security regulations, Google Maps walking navigation is restricted in South Korea. Locals use Naver Map or KakaoMap. This app provides direct offline coordinates, transit station landmarks, and a live compass so you never lose your direction.'
    },
    {
      icon: CreditCard,
      title: 'T-Money & Transit Cards (Must Use Cash to Reload)',
      ko: '교통카드 충전 안내',
      desc: 'T-Money, WOWPASS, and Climate Cards work on all subways, buses, and taxis. Crucial tip: You CANNOT reload transit cards with a foreign credit card! You must carry physical Korean cash (₩10,000 / ₩50,000 bills) to reload at convenience stores (CU, GS25, 7-Eleven) or station machines.'
    },
    {
      icon: Utensils,
      title: 'Strict No Tipping Culture',
      ko: '팁 문화 없음',
      desc: 'There is zero tipping in South Korea. Leaving extra money on the table will confuse waitstaff, and they may chase after you thinking you forgot your change. Service charge and 10% VAT are already legally included in all prices.'
    },
    {
      icon: AlertCircle,
      title: 'Subway Priority & Pink Seats',
      ko: '노약자석 및 임산부 배려석',
      desc: 'Seats at the ends of subway cars are strictly reserved for the elderly and disabled. The bright pink seats in the middle are for pregnant women. Even if the train is packed and these seats are empty, locals leave them vacant.'
    },
    {
      icon: Zap,
      title: 'Electrical Plugs: 220V Type C / F',
      ko: '전기 플러그 규격',
      desc: 'Korea uses standard European two-round-pin plugs (Type C and F, 220V at 60Hz). If you are from the US, UK, or Australia, bring a travel adapter plug.'
    },
    {
      icon: Trash2,
      title: 'Where Are the Street Trash Bins?',
      ko: '쓰레기통 찾기',
      desc: 'Korea strictly recycles waste (Pay-As-You-Throw system), so public street bins are rare. You can dispose of empty beverage cups and wrappers inside subway stations, next to convenience store entrances, or in cafe drop-boxes.'
    },
    {
      icon: Wifi,
      title: 'Free Government Wi-Fi Everywhere',
      ko: '공공 무료 와이파이',
      desc: 'Most subway cars, stations, and major tourist streets have free public networks named "PublicWiFi@Seoul" or "Free_WiFi_Korea".'
    }
  ];

  return (
    <div
      id="travel-tips-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
    >
      <div
        className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Essential South Korea Travel Tips</h3>
              <p className="text-xs text-neutral-400">Important customs and practical rules for first-time visitors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 divide-y divide-neutral-800/40">
          {tips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <div key={idx} className="pt-3.5 first:pt-0 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-neutral-800/50 text-amber-400 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-neutral-100">{tip.title}</h4>
                    <span className="text-[11px] font-semibold text-amber-400/90">{tip.ko}</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
