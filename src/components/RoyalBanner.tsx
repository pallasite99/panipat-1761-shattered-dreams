/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, BookOpen, Shield, Award, Calendar, ChevronRight, X, Heart } from 'lucide-react';
import { HISTORICAL_PROFILES, HistoricalProfile } from '../utils/historyData';

interface RoyalBannerProps {
  generalId?: string; // Optional, otherwise retrieved from localStorage
}

export const RoyalBanner: React.FC<RoyalBannerProps> = ({ generalId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeGeneralId = generalId || localStorage.getItem('panipat_campaign_general') || 'bhau';
  const profile: HistoricalProfile = HISTORICAL_PROFILES[activeGeneralId] || HISTORICAL_PROFILES['bhau'];

  // Render vertical hanging banner with realistic shadow & gold trim
  return (
    <>
      {/* TRIGGER: Floating Vertical Banner Badge */}
      <div className="fixed top-28 right-4 z-40 select-none">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ y: 4, scale: 1.03 }}
          className="relative flex flex-col items-center cursor-pointer group focus:outline-none"
          title={`Read legacy of ${profile.name}`}
        >
          {/* Wooden vertical support rod */}
          <div className="w-16 h-1.5 bg-amber-800 rounded-full border border-amber-900 shadow-sm relative z-30">
            {/* Gold knobs */}
            <div className="absolute -left-1.5 -top-0.5 w-2 h-2 rounded-full bg-yellow-500 border border-yellow-600" />
            <div className="absolute -right-1.5 -top-0.5 w-2 h-2 rounded-full bg-yellow-500 border border-yellow-600" />
          </div>

          {/* Hanging cords */}
          <div className="w-10 h-3 border-x border-[#ca8a04]/40 border-t border-t-transparent mx-auto relative z-20 -mt-0.5" />

          {/* Actual banner fabric */}
          <div className={`w-12 pt-4 pb-6 px-1.5 ${profile.bannerColor} border-t-2 border-[#ca8a04] shadow-[0_10px_16px_rgba(0,0,0,0.55),_inset_0_2px_4px_rgba(255,255,255,0.2)] rounded-b-sm flex flex-col items-center justify-between text-center relative z-10 transition-all group-hover:shadow-[0_12px_22px_rgba(0,0,0,0.7)]`}>
            {/* Fine gold fringe trims on left/right margins */}
            <div className="absolute inset-y-0 left-0 w-[1.5px] bg-[#ca8a04]/45" />
            <div className="absolute inset-y-0 right-0 w-[1.5px] bg-[#ca8a04]/45" />

            {/* Emblem */}
            <span className="text-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-pulse">{profile.emblem}</span>

            {/* Micro initials */}
            <span className="text-[7.5px] font-mono font-black tracking-widest text-[#fef3c7] uppercase leading-none mt-2 select-none filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </span>

            {/* Interlaced gold crest tassel at bottom point */}
            <div className="absolute bottom-[-11px] left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-3 h-3 bg-[#ca8a04] rotate-45 border border-yellow-600 shadow-xs" />
              <div className="w-1 h-3 bg-[#a16207]/80 rounded-b-xs" />
            </div>
          </div>

          {/* Tooltip hint */}
          <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950/95 border border-saffron px-2.5 py-1 text-[9px] font-mono whitespace-nowrap text-saffron uppercase rounded-xs tracking-wider shadow-lg pointer-events-none">
            ⚔️ Read Legacy Of {profile.name}
          </div>
        </motion.button>
      </div>

      {/* FULL HISTORICAL LEDGER DIALOG OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-sm">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)} />

            {/* Ledger Container Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-4xl bg-stone-900 border-2 border-amber-900/50 text-stone-200 shadow-2xl relative z-10 flex flex-col md:flex-row rounded-sm overflow-hidden min-h-[480px] font-sans"
            >
              {/* Left Segment: Huge Royal Flag Ribbon */}
              <div className={`w-full md:w-[280px] ${profile.bannerColor} p-8 flex flex-col items-center justify-between text-center relative border-b md:border-b-0 md:border-r border-amber-900/35 shadow-[inset_-6px_0_12px_rgba(0,0,0,0.3)]`}>
                <div className="absolute inset-y-0 left-0 w-1 bg-[#ca8a04]/40" />
                <div className="absolute inset-y-0 right-0 w-1 bg-[#ca8a04]/40" />
                
                {/* Vintage gold ornamental pattern */}
                <div className="border border-[#ca8a04]/40 p-4 rounded-xs w-full h-full flex flex-col items-center justify-between">
                  <div className="space-y-4">
                    <span className="text-7xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] animate-bounce inline-block">
                      {profile.emblem}
                    </span>
                    <h3 className="text-amber-100 text-3xl font-serif font-black tracking-wide uppercase select-none leading-tight filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      {profile.name}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-950/80 border border-[#ca8a04] text-[9.5px] font-mono uppercase tracking-widest text-saffron rounded-full">
                      <Calendar size={11} /> {profile.birthDeath}
                    </div>
                  </div>

                  <div className="text-left mt-10 bg-stone-950/75 p-3 border border-stone-800 rounded-sm">
                    <span className="text-[9px] text-stone-500 font-mono font-black uppercase tracking-widest block mb-1">
                      Banner Heraldry
                    </span>
                    <p className="text-[10px] text-stone-300 font-sans leading-relaxed">
                      {profile.bannerSymbolDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Segment: Scrollable Historical Codex */}
              <div className="flex-1 p-7 md:p-9 flex flex-col justify-between overflow-y-auto max-h-[90vh] md:max-h-none">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 text-stone-500 hover:text-white hover:bg-stone-800 transition-all rounded-full cursor-pointer"
                  title="Close Codex"
                >
                  <X size={20} />
                </button>

                <div className="space-y-6">
                  {/* Codex Title */}
                  <div className="border-b border-stone-800 pb-4">
                    <span className="text-[9px] font-black text-saffron font-mono tracking-widest uppercase block mb-1">
                      🏛️ IMPERIAL BIOGRAPHICAL CHRONICLE
                    </span>
                    <h2 className="text-3xl text-white font-serif font-black uppercase tracking-wide">
                      {profile.title}
                    </h2>
                  </div>

                  {/* Narrative detailed history */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-mono font-bold text-stone-400 tracking-widest flex items-center gap-2">
                      <BookOpen size={14} className="text-saffron" /> Legacy in the Panipat Campaign (1761)
                    </h4>
                    <p className="text-stone-300 text-xs md:text-sm font-sans leading-relaxed text-justify">
                      {profile.detailedHistory}
                    </p>
                  </div>

                  {/* Historical Accomplishments Bullet points (Visualized like awards) */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs uppercase font-mono font-bold text-stone-400 tracking-widest flex items-center gap-2">
                      <Award size={14} className="text-saffron" /> Key Historical Milestones
                    </h4>
                    <ul className="space-y-2">
                      {profile.achievements.map((ach, index) => (
                        <li key={index} className="flex gap-2.5 items-start text-xs text-stone-300 leading-relaxed bg-stone-950/40 p-2.5 border border-stone-800 hover:border-[#8B5E3C]/30 rounded-xs transition-colors">
                          <span className="text-saffron select-none font-bold mt-0.5">•</span>
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer seal metadata */}
                <div className="mt-8 pt-4 border-t border-stone-800 flex justify-between items-center text-[10px] font-mono text-stone-500">
                  <span className="uppercase tracking-widest">
                    ARCHIVE ID: HIST-1761-{profile.id.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 bg-saffron text-stone-950 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all cursor-pointer"
                  >
                    Return to Campaign
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
