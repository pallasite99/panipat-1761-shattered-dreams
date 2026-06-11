/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scroll, X, Award, MapPin, Feather, CheckCircle2 } from 'lucide-react';
import { getAdvisorFeedbackForPolicy, HISTORICAL_PROFILES } from '../utils/historyData';

interface CommanderMessengerProps {
  isOpen: boolean;
  onClose: () => void;
  policyId: string | null;
  faction: 'maratha' | 'durrani';
}

export const CommanderMessenger: React.FC<CommanderMessengerProps> = ({
  isOpen,
  onClose,
  policyId,
  faction
}) => {
  const [sealState, setSealState] = useState<'hidden' | 'stamping' | 'stamped'>('hidden');

  useEffect(() => {
    if (isOpen) {
      setSealState('hidden');
      // Delay the stamps to look extremely deliberate & dramatic
      const timer = setTimeout(() => {
        setSealState('stamping');
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isOpen, policyId]);

  if (!isOpen || !policyId) return null;

  const data = getAdvisorFeedbackForPolicy(policyId, faction);
  const generalName = localStorage.getItem('panipat_campaign_general_name') || 'Lajward General';
  const generalId = localStorage.getItem('panipat_campaign_general') || 'bhau';
  const profile = HISTORICAL_PROFILES[generalId];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
          {/* Backdrop click to dismiss */}
          <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

          {/* Parchment Container Scroll */}
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 150, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full max-w-2xl bg-[#f5e6d3] text-[#3e2716] p-7 md:p-9 shadow-[0_0_50px_rgba(0,0,0,0.8),_inset_0_0_60px_rgba(94,62,30,0.25)] rounded-sm border-y-8 border-amber-900 relative z-10 font-serif"
            style={{
              backgroundImage: 'radial-gradient(#f9f1e6 15%, transparent 16%), radial-gradient(#f9f1e6 15%, transparent 16%)',
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0, 6px 6px',
              backgroundColor: '#ede0d4'
            }}
          >
            {/* Fine Ornamental Corners */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-900/35" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-900/35" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-900/35" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-900/35" />

            {/* Close Button banner */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-amber-900/60 hover:text-amber-950 hover:bg-amber-900/10 rounded-full transition-colors cursor-pointer"
              title="Close Dispatch"
            >
              <X size={20} />
            </button>

            {/* Dispatch Header */}
            <div className="text-center pb-5 mb-5 border-b-2 border-dashed border-amber-900/25">
              <span className="flex justify-center items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.25em] text-amber-900/80 mb-1 leading-none">
                <Scroll size={12} /> IMPERIAL HIGH MILITARY DISPATCH
              </span>
              <h3 className="text-3xl font-black tracking-wide text-amber-950 uppercase select-none">
                State Covenant Signed
              </h3>
              <p className="text-[11px] font-mono text-amber-900 italic font-medium mt-1">
                To the Honorable Commander, <strong className="text-amber-950 font-black">{generalName}</strong>
              </p>
            </div>

            {/* Main scroll content partition */}
            <div className="space-y-6">
              {/* Advisor Response Area */}
              <div className="bg-[#ebd9c5] border border-amber-900/20 p-5 rounded-xs relative overflow-hidden flex flex-col sm:flex-row gap-5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
                {/* Advisor Avatar */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="w-16 h-16 bg-[#e0ccb6] border border-amber-900/30 rounded-xs flex items-center justify-center text-4xl shadow-inner select-none">
                    {data.advisor.avatar}
                  </div>
                  <p className="text-xs font-sans font-black text-amber-950 text-center mt-2 uppercase tracking-tight max-w-[100px] leading-tight">
                    {data.advisor.name}
                  </p>
                  <p className="text-[9px] font-mono text-amber-800 text-center font-bold uppercase tracking-tighter mt-0.5">
                    {data.advisor.role}
                  </p>
                </div>

                {/* Hand-written letter & wax seal */}
                <div className="flex-1 space-y-3 relative min-h-[110px]">
                  <div className="text-amber-900 text-xs font-serif leading-relaxed italic max-w-[95%]">
                    " {data.quote} "
                  </div>

                  {/* Operational impact box */}
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-950/5 p-2 border border-emerald-900/10 rounded-xs w-fit">
                    <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                    <span>IMPACT: {data.impactScore}</span>
                  </div>

                  {/* ANIMATED WAX SEAL INTERACTION */}
                  <div className="absolute -bottom-2 -right-4 sm:bottom-0 sm:right-0 z-20 pointer-events-none select-none">
                    <AnimatePresence>
                      {sealState !== 'hidden' && (
                        <motion.div
                          initial={{ scale: 3.5, opacity: 0, rotate: -30 }}
                          animate={
                            sealState === 'stamping'
                              ? {
                                  scale: [3.5, 0.85, 1],
                                  opacity: [0, 1, 1],
                                  rotate: -12
                                }
                              : { scale: 1, opacity: 1, rotate: -12 }
                          }
                          transition={{
                            type: 'spring',
                            damping: 12,
                            stiffness: 180,
                            duration: 0.45
                          }}
                          onAnimationComplete={() => setSealState('stamped')}
                          className="relative flex items-center justify-center"
                        >
                          {/* Crimson wax seal outer blob */}
                          <div
                            className="bg-[#b91c1c] text-white p-3.5 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-red-900/40 font-serif flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.35),_inset_0_2px_4px_rgba(255,255,255,0.25)] relative"
                            style={{
                              backgroundImage: 'radial-gradient(#cc2222 20%, transparent 80%)',
                              borderRadius: '50% 48% 52% 49% / 49% 51% 48% 52%'
                            }}
                          >
                            <span className="text-[7px] font-sans font-black tracking-widest text-red-200 uppercase leading-[1]">
                              ADVISORY
                            </span>
                            <span className="text-[10px] font-serif font-black tracking-tighter text-red-100 uppercase uppercase break-words leading-tight mt-1 mb-1 max-w-[85px]">
                              {data.sealText.split(' • ')[0]}
                            </span>
                            <span className="text-[6px] font-mono tracking-widest text-[#fecdd3] font-bold uppercase leading-none">
                              ★ SEALED ★
                            </span>

                            {/* Inner concentric ring */}
                            <div className="absolute inset-1 border border-dashed border-red-200/25 rounded-full pointer-events-none" />
                          </div>

                          {/* Visual shockwave effect when stamping */}
                          {sealState === 'stamping' && (
                            <motion.div
                              initial={{ scale: 0.4, opacity: 0.8 }}
                              animate={{ scale: 1.8, opacity: 0 }}
                              transition={{ duration: 0.45 }}
                              className="absolute w-28 h-28 border-4 border-red-600 rounded-full"
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Educational History Scroll Field */}
              <div className="border-t border-amber-900/15 pt-5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs text-amber-950 font-bold uppercase tracking-wider">
                  <Feather size={14} className="text-amber-800" />
                  <span>Historical Chronicle Footnote</span>
                </div>
                <p className="text-amber-900/85 text-[11px] md:text-xs font-sans leading-relaxed text-justify">
                  {data.historicalContext}
                </p>
                <p className="text-amber-800/70 text-[10px] font-mono italic">
                  *This administrative maneuver is derived directly from the royal archives of Pune/Kabul (1760 campaign logs).
                </p>
              </div>
            </div>

            {/* Dynamic Saffron Seal footer border */}
            <div className="mt-7 pt-4 border-t-2 border-dashed border-amber-900/25 flex flex-col sm:flex-row justify-between items-center text-amber-950/70 font-mono text-[10px] gap-2">
              <span className="uppercase font-bold tracking-widest">
                VERIFIED SEAL NO. PT2026
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-amber-950 text-[#ede0d4] tracking-widest text-[9px] uppercase font-bold hover:bg-amber-900 hover:text-white transition-all transform hover:scale-103 active:scale-97 cursor-pointer"
              >
                Assemble Camp Troops
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
