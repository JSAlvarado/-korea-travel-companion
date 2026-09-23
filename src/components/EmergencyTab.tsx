import React, { useState, useEffect } from 'react';
import { Coordinates, EmergencyContact, UserEmergencyProfile } from '../types';
import { EMERGENCY_CONTACTS, KOREAN_MEDICAL_TERMS } from '../data/emergency';
import {
  startEmergencySiren,
  stopEmergencySiren,
  speakKoreanText
} from '../utils/geo';
import {
  PhoneCall,
  AlertTriangle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Send,
  Shield,
  HeartPulse,
  User,
  ExternalLink,
  Info,
  Radio,
  Share2
} from 'lucide-react';

interface EmergencyTabProps {
  userLocation: Coordinates | null;
  darkMode: boolean;
}

export const EmergencyTab: React.FC<EmergencyTabProps> = ({ userLocation, darkMode }) => {
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [copiedSos, setCopiedSos] = useState(false);
  const [profile, setProfile] = useState<UserEmergencyProfile>(() => {
    try {
      const saved = localStorage.getItem('kr_travel_emergency_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fullName: 'Traveler',
      passportNumber: '',
      bloodType: 'O+',
      allergies: 'None',
      emergencyContactName: 'Family / Next of Kin',
      emergencyContactPhone: '+1-555-0199'
    };
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Save profile to localStorage
  const handleSaveProfile = (newProfile: UserEmergencyProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('kr_travel_emergency_profile', JSON.stringify(newProfile));
    } catch {}
    setIsEditingProfile(false);
  };

  // Toggle siren sound & screen flasher
  const toggleSiren = () => {
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
      setIsStrobeActive(false);
    } else {
      startEmergencySiren();
      setIsSirenActive(true);
      setIsStrobeActive(true);
    }
  };

  // Clean up siren on unmount
  useEffect(() => {
    return () => {
      stopEmergencySiren();
    };
  }, []);

  // Build SOS notification text
  const sosMessage = React.useMemo(() => {
    const lat = userLocation ? userLocation.lat.toFixed(5) : 'Unknown (GPS loading)';
    const lng = userLocation ? userLocation.lng.toFixed(5) : 'Unknown (GPS loading)';
    const mapLink = userLocation
      ? `https://maps.google.com/?q=${lat},${lng}`
      : 'Location pending';

    return `🚨 EMERGENCY ALERT - SOUTH KOREA 🚨\nI am in need of urgent assistance.\nName: ${profile.fullName}\nBlood Type: ${profile.bloodType}\nGPS Coordinates: ${lat}, ${lng}\nMap Link: ${mapLink}\nLocal Time: ${new Date().toLocaleString()}\nPlease contact Korean Emergency Services (112 Police / 119 Ambulance) or my emergency contact immediately.`;
  }, [userLocation, profile]);

  const handleCopySos = () => {
    navigator.clipboard.writeText(sosMessage);
    setCopiedSos(true);
    setTimeout(() => setCopiedSos(false), 2500);
  };

  const handleShareSms = () => {
    const encoded = encodeURIComponent(sosMessage);
    window.open(`sms:?body=${encoded}`, '_self');
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-5 space-y-4 pb-16">
      {/* Visual Strobe alert when active */}
      {isStrobeActive && (
        <div className="fixed inset-0 z-50 bg-red-600 animate-pulse pointer-events-none opacity-40 flex items-center justify-center">
          <div className="text-white text-3xl font-black tracking-widest uppercase bg-black/80 px-6 py-3 rounded-2xl border-4 border-white">
            🚨 SOS DISTRESS BEACON ACTIVE 🚨
          </div>
        </div>
      )}

      {/* Primary Emergency Quick Call Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border-2 transition-colors ${
          darkMode ? 'bg-neutral-900 border-red-900/60' : 'bg-red-50/70 border-red-200'
        } shadow-sm`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-red-600 dark:text-red-400">
              National Emergency Hotlines (Toll-Free)
            </h2>
            <p className="text-xs text-neutral-400">
              Direct tap-to-call. No country code needed from any phone in South Korea.
            </p>
          </div>
        </div>

        {/* 3 Big Primary Hotlines: 112, 119, 1330 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 112 Police */}
          <a
            id="call-112-btn"
            href="tel:112"
            className="p-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white flex flex-col justify-between shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-100">
                Crime / Police
              </span>
              <PhoneCall className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">112</span>
              <div className="text-xs font-semibold text-red-100">경찰청 (Police)</div>
            </div>
            <div className="text-[10px] text-red-200 leading-tight">
              Auto English interpreter connected
            </div>
          </a>

          {/* 119 Fire & Medical */}
          <a
            id="call-119-btn"
            href="tel:119"
            className="p-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white flex flex-col justify-between shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100">
                Ambulance / Fire
              </span>
              <HeartPulse className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">119</span>
              <div className="text-xs font-semibold text-amber-100">소방 및 응급환자</div>
            </div>
            <div className="text-[10px] text-amber-200 leading-tight">
              Emergency rescue & hospital dispatch
            </div>
          </a>

          {/* 1330 Korea Tourist Hotline */}
          <a
            id="call-1330-btn"
            href="tel:1330"
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex flex-col justify-between shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">
                Tourist Help 24/7
              </span>
              <Radio className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">1330</span>
              <div className="text-xs font-semibold text-blue-100">관광통역안내전화</div>
            </div>
            <div className="text-[10px] text-blue-200 leading-tight">
              3-way English interpretation on call
            </div>
          </a>
        </div>
      </div>

      {/* Distress Siren Buzzer & Flash Alarm */}
      <div
        className={`p-4 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              Audible Distress Siren & Strobe
            </h3>
            <p className="text-xs text-neutral-400">
              Emits a loud police siren frequency and flashing screen for night danger or distress. Works 100% offline.
            </p>
          </div>

          <button
            id="distress-siren-toggle-btn"
            onClick={toggleSiren}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              isSirenActive
                ? 'bg-red-600 text-white ring-4 ring-red-600/40 animate-pulse'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700'
            }`}
          >
            {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
            <span>{isSirenActive ? 'STOP SIREN ALARM' : 'ACTIVATE LOUD SIREN'}</span>
          </button>
        </div>
      </div>

      {/* Instant SOS Notification Generator */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm">One-Touch Emergency SMS / Alert Generator</h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-500 font-semibold">
            {userLocation ? 'GPS Acquired' : 'Locating...'}
          </span>
        </div>
        <p className="text-xs text-neutral-400 mb-3">
          Generates an emergency distress message with your exact GPS coordinates and map pin link to send to family or embassy.
        </p>

        {/* Message Preview Box */}
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
          {sosMessage}
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-3">
          <button
            id="copy-sos-btn"
            onClick={handleCopySos}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedSos ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSos ? 'Copied to Clipboard!' : 'Copy SOS Message'}</span>
          </button>

          <button
            id="send-sms-sos-btn"
            onClick={handleShareSms}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send SMS / Message</span>
          </button>
        </div>
      </div>

      {/* Korean Emergency Bystander Flashcard (도와주세요!) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm">Korean Bystander Card (Show on Screen)</h3>
          </div>
          <button
            onClick={() => speakKoreanText('도와주세요! 긴급 상황입니다. 119 또는 112에 전화해 주세요.')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speak in Korean</span>
          </button>
        </div>

        {/* High Contrast Korean Card for locals to read */}
        <div className="p-4 sm:p-5 rounded-xl bg-red-950/20 border-2 border-red-500/40 text-center space-y-3">
          <div className="text-2xl sm:text-3xl font-black text-red-500 tracking-tight">
            도와주세요! (Please Help!)
          </div>
          <p className="text-sm sm:text-base font-bold text-neutral-100 leading-snug">
            저는 한국어를 잘 못하는 외국인 여행자입니다.<br />
            지금 긴급한 상황입니다. 119 또는 112에 신고를 부탁드립니다.
          </p>
          <div className="text-xs text-neutral-400">
            (I am a foreign traveler and cannot speak Korean well. This is an emergency. Please call 119 or 112 for me.)
          </div>

          {/* Traveler Emergency Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800 text-left text-xs">
            <div className="p-2 rounded-lg bg-neutral-950/50">
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Name (이름)</span>
              <span className="font-bold text-neutral-200">{profile.fullName}</span>
            </div>
            <div className="p-2 rounded-lg bg-neutral-950/50">
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Blood Type (혈액형)</span>
              <span className="font-bold text-red-400">{profile.bloodType}</span>
            </div>
            <div className="p-2 rounded-lg bg-neutral-950/50">
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Allergies (알레르기)</span>
              <span className="font-bold text-neutral-200">{profile.allergies || 'None'}</span>
            </div>
            <div className="p-2 rounded-lg bg-neutral-950/50">
              <span className="text-[10px] uppercase font-mono text-neutral-500 block">Emergency # (비상연락처)</span>
              <span className="font-bold text-neutral-200">{profile.emergencyContactPhone}</span>
            </div>
          </div>
        </div>

        {/* Edit profile toggle */}
        <div className="flex justify-end mt-2">
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-xs text-blue-400 hover:underline"
          >
            {isEditingProfile ? 'Done Editing' : 'Edit Medical & Emergency Profile'}
          </button>
        </div>

        {/* Edit Profile Form */}
        {isEditingProfile && (
          <div className="mt-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs rounded bg-neutral-900 border border-neutral-700 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Blood Type</label>
                <select
                  value={profile.bloodType}
                  onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs rounded bg-neutral-900 border border-neutral-700 text-white outline-none"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Medical Allergies</label>
                <input
                  type="text"
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Peanuts, None"
                  className="w-full px-2.5 py-1 text-xs rounded bg-neutral-900 border border-neutral-700 text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={profile.emergencyContactPhone}
                  onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs rounded bg-neutral-900 border border-neutral-700 text-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleSaveProfile(profile)}
              className="px-3 py-1 rounded text-xs font-bold bg-blue-600 text-white mt-1"
            >
              Save Profile
            </button>
          </div>
        )}
      </div>

      {/* Foreign Embassies in Seoul */}
      <div
        className={`p-4 rounded-2xl border transition-colors ${
          darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        } shadow-sm`}
      >
        <h3 className="font-bold text-sm mb-2">Major Foreign Embassies in Seoul</h3>
        <p className="text-xs text-neutral-400 mb-3">
          For lost passports, legal detention, or consular emergencies.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EMERGENCY_CONTACTS.filter(c => c.category === 'embassy').map((contact) => (
            <div
              key={contact.id}
              className="p-2.5 rounded-xl bg-neutral-950/50 border border-neutral-800/80 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-xs text-neutral-200">{contact.titleEn}</div>
                <div className="text-[10px] text-neutral-400">{contact.description}</div>
              </div>
              <a
                href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 shrink-0 ml-2"
              >
                {contact.number}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
