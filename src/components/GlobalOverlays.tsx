import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Monitor, Shield, Info, HelpCircle, ArrowRight, Settings as SettingsIcon } from 'lucide-react';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpOverlay: React.FC<OverlayProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-6 md:p-12 overflow-y-auto"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-4xl bg-stone-900 border border-stone-800 p-8 md:p-12 relative shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-6 mb-12">
               <div className="w-16 h-16 bg-saffron/10 border border-saffron/20 flex items-center justify-center">
                  <HelpCircle size={32} className="text-saffron" />
               </div>
               <div>
                  <h2 className="text-3xl font-serif text-white uppercase tracking-tighter">Tactical Manual</h2>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black">Imperial War College • Section 1761</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-serif">
               <section>
                  <h3 className="text-saffron text-xs uppercase tracking-[0.4em] font-black mb-6">Strategic Map</h3>
                  <div className="space-y-6 text-stone-300">
                     <div className="flex gap-4">
                        <div className="text-saffron font-black">01</div>
                        <p className="text-sm italic italic leading-relaxed">Advance across North India by securing major hubs from Burhanpur to Delhi.</p>
                     </div>
                     <div className="flex gap-4">
                        <div className="text-saffron font-black">02</div>
                        <p className="text-sm italic italic leading-relaxed">Each location requires a successful battle engagement to open the next road.</p>
                     </div>
                  </div>
               </section>

               <section>
                  <h3 className="text-saffron text-xs uppercase tracking-[0.4em] font-black mb-6">Battle Dynamics</h3>
                  <div className="space-y-6 text-stone-300">
                     <div className="flex gap-4">
                        <div className="text-saffron font-black">01</div>
                        <p className="text-sm italic italic leading-relaxed">Battles are automated simulations of mass attrition. Watch the morale indicators closely.</p>
                     </div>
                     <div className="flex gap-4">
                        <div className="text-saffron font-black">02</div>
                        <p className="text-sm italic italic leading-relaxed">Success depends on the stage difficulty and the simulated performance of your vanguard.</p>
                     </div>
                  </div>
               </section>
            </div>

            <div className="mt-16 pt-8 border-t border-stone-800 flex justify-between items-center">
               <p className="text-[10px] text-stone-600 uppercase font-black tracking-widest italic">Experience the fall of an empire from the front lines.</p>
               <button 
                 onClick={onClose}
                 className="flex items-center gap-4 text-xs text-white pb-1 group"
               >
                  <span className="uppercase font-black tracking-widest group-hover:mr-2 transition-all">Dismiss Record</span>
                  <ArrowRight size={14} className="text-saffron" />
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import { panipatAudioEngine } from '../utils/audioSystem';

export const SettingsOverlay: React.FC<OverlayProps> = ({ isOpen, onClose }) => {
  const [vol, setVol] = React.useState(() => panipatAudioEngine.getVolume());
  const [campaignTrack, setCampaignTrack] = React.useState(() => panipatAudioEngine.getCampaignTrack());
  const [battleTrack, setBattleTrack] = React.useState(() => panipatAudioEngine.getBattleTrack());
  
  const [fxEnabled, setFxEnabled] = React.useState(true);
  const [voiceEnabled, setVoiceEnabled] = React.useState(true);

  React.useEffect(() => {
    if (isOpen) {
      setVol(panipatAudioEngine.getVolume());
      setCampaignTrack(panipatAudioEngine.getCampaignTrack());
      setBattleTrack(panipatAudioEngine.getBattleTrack());
    }
  }, [isOpen]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    panipatAudioEngine.setVolume(val);
    setVol(val);
  };

  const selectCampaign = (track: 'yaman_darbar' | 'deccan_march' | 'silence') => {
    panipatAudioEngine.setCampaignTrack(track);
    setCampaignTrack(track);
  };

  const selectBattle = (track: 'panipat_anthem' | 'gardi_drill' | 'silence') => {
    panipatAudioEngine.setBattleTrack(track);
    setBattleTrack(track);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-6 md:p-12 overflow-y-auto"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-stone-900 border border-stone-800 p-8 md:p-10 relative shadow-2xl overflow-hidden"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF9933 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-stone-500 hover:text-white transition-colors z-20"
            >
              <X size={24} />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                    <SettingsIcon size={32} className="text-stone-300" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-serif text-white uppercase tracking-tighter">System Config</h2>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black">Engine Parameters • Build 1761.4</p>
                 </div>
              </div>

              <div className="space-y-8">
                 {/* 1. MASTER VOLUME */}
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-4 text-white">
                          <Volume2 size={18} className="text-saffron" />
                          <span className="text-xs uppercase font-black tracking-widest">Master Audio</span>
                       </div>
                       <span className="text-xs font-mono text-saffron font-bold">{Math.round(vol * 100)}%</span>
                    </div>
                    <div className="relative w-full flex items-center">
                       <input 
                         type="range" 
                         min="0" 
                         max="1" 
                         step="0.05" 
                         value={vol} 
                         onChange={handleVolumeChange}
                         className="w-full h-1 bg-stone-800 rounded-full appearance-none cursor-pointer accent-saffron outline-none" 
                       />
                    </div>
                 </div>

                 {/* 2. BACKGROUND SOUNDTRACK CONTROL PANEL */}
                 <div className="p-5 border border-[#8B5E3C]/35 bg-stone-950/45 rounded-sm">
                    <p className="text-xs text-saffron font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span>🎵</span> Soundscape Orchestra Settings
                    </p>
                    
                    {/* Campaign Mode Tracks */}
                    <div className="mb-5">
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block mb-2">
                        Campaign Mode Soundtrack (Continuous Raga Drone / March)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => selectCampaign('yaman_darbar')}
                          className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider text-left border rounded-xs transition-all flex items-center justify-between cursor-pointer
                            ${campaignTrack === 'yaman_darbar' 
                              ? 'bg-saffron text-stone-950 border-saffron shadow-md' 
                              : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                        >
                          <span>🏰 Yaman Darbar</span>
                          {campaignTrack === 'yaman_darbar' && <span className="text-[8px] font-mono font-bold">• ACTIVE</span>}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectCampaign('deccan_march')}
                          className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider text-left border rounded-xs transition-all flex items-center justify-between cursor-pointer
                            ${campaignTrack === 'deccan_march' 
                              ? 'bg-saffron text-stone-950 border-saffron shadow-md' 
                              : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                        >
                          <span>🥁 Deccan March</span>
                          {campaignTrack === 'deccan_march' && <span className="text-[8px] font-mono font-bold">• ACTIVE</span>}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectCampaign('silence')}
                          className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider text-left border rounded-xs transition-all flex items-center justify-between cursor-pointer
                            ${campaignTrack === 'silence' 
                              ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]' 
                              : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                            }`}
                        >
                          <span>🔇 Ambient Wind</span>
                        </button>
                      </div>
                    </div>

                    {/* Battle Mode Tracks */}
                    <div>
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block mb-2">
                        Battle Mode Soundtrack (High Intensity Kettle Drums & Horns)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => selectBattle('panipat_anthem')}
                          className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider text-left border rounded-xs transition-all flex items-center justify-between cursor-pointer
                            ${battleTrack === 'panipat_anthem' 
                              ? 'bg-saffron text-stone-950 border-saffron shadow-md' 
                              : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                        >
                          <span>⚔️ Panipat Cry</span>
                          {battleTrack === 'panipat_anthem' && <span className="text-[8px] font-mono font-bold">• ACTIVE</span>}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectBattle('gardi_drill')}
                          className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider text-left border rounded-xs transition-all flex items-center justify-between cursor-pointer
                            ${battleTrack === 'gardi_drill' 
                              ? 'bg-saffron text-stone-950 border-saffron shadow-md' 
                              : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                        >
                          <span>🥁 Ibrahim's Drill</span>
                          {battleTrack === 'gardi_drill' && <span className="text-[8px] font-mono font-bold">• ACTIVE</span>}
                        </button>
                        <button
                          type="button"
                          onClick={() => selectBattle('silence')}
                          className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider text-left border rounded-xs transition-all flex items-center justify-between cursor-pointer
                            ${battleTrack === 'silence' 
                              ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444]' 
                              : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                            }`}
                        >
                          <span>🔇 Battle Quiet</span>
                        </button>
                      </div>
                    </div>
                 </div>

                 {/* 3. HARDWARE & OTHER DRIVERS */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex items-center justify-between p-4 border border-stone-800 hover:border-saffron/30 transition-colors bg-stone-950/40">
                      <div className="flex items-center gap-4 text-white">
                         <Monitor size={18} className="text-stone-500" />
                         <div>
                            <p className="text-xs uppercase font-black tracking-widest">High Fidelity FX</p>
                            <p className="text-[9px] text-stone-600 uppercase font-bold tracking-widest">Advanced dust particles</p>
                         </div>
                      </div>
                      <div 
                        onClick={() => setFxEnabled(!fxEnabled)}
                        className={`w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors duration-200 ${fxEnabled ? 'bg-saffron' : 'bg-stone-800'}`}
                      >
                         <motion.div 
                           animate={{ x: fxEnabled ? 24 : 0 }}
                           className="w-4 h-4 bg-white rounded-full shadow-sm" 
                         />
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-4 border border-stone-800 hover:border-saffron/30 transition-colors bg-stone-950/40">
                      <div className="flex items-center gap-4 text-white">
                         <Shield size={18} className="text-stone-500" />
                         <div>
                            <p className="text-xs uppercase font-black tracking-widest">Marathi Voiceovers</p>
                            <p className="text-[9px] text-stone-600 uppercase font-bold tracking-widest">Authentic callouts</p>
                         </div>
                      </div>
                      <div 
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors duration-200 ${voiceEnabled ? 'bg-saffron' : 'bg-stone-800'}`}
                      >
                         <motion.div 
                           animate={{ x: voiceEnabled ? 24 : 0 }}
                           className="w-4 h-4 bg-white rounded-full shadow-sm" 
                         />
                      </div>
                   </div>
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div className="flex items-center gap-4 text-[10px] text-stone-500 uppercase font-black tracking-widest">
                    <Info size={14} />
                    <span>Project Panipat v1.0.0 - All rights of the Confederacy reserved.</span>
                 </div>
                 <a 
                   href="mailto:salil.apte99@gmail.com?subject=Panipat 1761 App Inquiry"
                   className="text-[10px] text-saffron hover:underline h-full uppercase tracking-wider font-extrabold flex items-center gap-1 shrink-0"
                 >
                    Send Direct Feedback
                 </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
