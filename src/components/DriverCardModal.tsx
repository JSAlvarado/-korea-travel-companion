import React from 'react';
import { speakKoreanText } from '../utils/geo';
import { Volume2, Copy, Check, Car, Phone, MapPin } from 'lucide-react';

interface DriverCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  nameEn: string;
  nameKo: string;
  addressEn: string;
  addressKo: string;
  phone?: string;
}

export const DriverCardModal: React.FC<DriverCardModalProps> = ({
  isOpen,
  onClose,
  nameEn,
  nameKo,
  addressEn,
  addressKo,
  phone
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${nameKo}\n${addressKo}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    speakKoreanText(`기사님, ${nameKo || addressKo}로 가주세요.`);
  };

  return (
    <div
      id="driver-card-modal"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 text-white overflow-y-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold">
            Taxi Driver Flash Card (택시 기사님용 화면)
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white font-bold text-sm"
        >
          ✕ Close
        </button>
      </div>

      {/* Main Center Message for Driver */}
      <div className="my-auto max-w-2xl mx-auto w-full text-center space-y-6 py-6">
        {/* Friendly Driver Header in Korean */}
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            기사님, 여기로 가주세요!
          </div>
          <div className="text-sm font-semibold text-neutral-400">
            (Driver, please take me to the location below. Thank you!)
          </div>
        </div>

        {/* Big Korean Destination Box */}
        <div className="p-6 rounded-2xl bg-neutral-900 border-2 border-amber-500/60 shadow-2xl text-left space-y-4">
          <div>
            <span className="text-[11px] uppercase font-mono text-neutral-400 block mb-1">
              목적지 (Destination)
            </span>
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug select-all">
              {nameKo || nameEn}
            </div>
            {nameKo && nameEn && (
              <div className="text-sm font-semibold text-neutral-400 mt-1">
                {nameEn}
              </div>
            )}
          </div>

          {/* Road Address */}
          <div className="pt-3 border-t border-neutral-800">
            <span className="text-[11px] uppercase font-mono text-neutral-400 block mb-1">
              도로명 주소 (Road Address)
            </span>
            <div className="text-lg sm:text-xl font-bold text-amber-300 select-all leading-normal">
              {addressKo || addressEn || '주소 정보 확인 필요'}
            </div>
            {addressEn && addressKo && (
              <div className="text-xs text-neutral-400 mt-1">
                {addressEn}
              </div>
            )}
          </div>

          {/* Phone if available */}
          {phone && (
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-mono text-neutral-400 block">
                  전화번호 (Phone)
                </span>
                <span className="text-sm font-mono font-bold text-neutral-200">{phone}</span>
              </div>
              <a
                href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Call Front Desk
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="max-w-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-800">
        <button
          onClick={handleSpeak}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Volume2 className="w-5 h-5" />
          <span>Speak to Driver (음성 안내)</span>
        </button>

        <button
          onClick={handleCopy}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Address!' : 'Copy Korean Address'}</span>
        </button>

        <button
          onClick={onClose}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-semibold text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
};
