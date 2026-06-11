import React from 'react';
import { motion } from 'motion/react';
import { Star, Zap, Shield, Eye, GraduationCap, Award, Compass, MessageSquare } from 'lucide-react';
import { Screen } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

export const CommanderDev: React.FC<{ 
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose }) => {
  const skills = [
    { title: 'Grand Strategy', level: 4, icon: Compass, desc: 'Improves map visibility and movement speed.' },
    { title: 'Artillery Drill', level: 2, icon: Zap, desc: 'Increases artillery accuracy and reload speeds.' },
    { title: 'Entrenchment', level: 3, icon: Shield, desc: 'Boosts defensive bonuses in rough terrain.' },
    { title: 'Espionage', level: 5, icon: Eye, desc: 'Unlock detailed enemy strength reports.' },
  ];

  return (
    <div className="relative h-screen w-screen bg-stone-950 overflow-hidden">
      <TopBar screen={Screen.COMMANDER_DEV} onNavigate={onNavigate} onToggleMenu={onToggleMenu} />
      <SideNav screen={Screen.COMMANDER_DEV} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />
      
      <main className="lg:pl-64 pt-16 h-[calc(100vh-6rem)] overflow-y-auto bg-stone-950/80 custom-scrollbar">
        <div className="p-4 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 min-h-full">
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-serif text-2xl md:text-4xl text-white uppercase tracking-widest flex items-center gap-3 md:gap-4">
                  <GraduationCap size={28} className="text-saffron md:w-10 md:h-10" /> Mastery
                </h2>
                <p className="text-stone-500 font-serif italic mt-1 md:mt-2 text-xs md:text-base">Sadashivrao Bhau — Generalissimo</p>
              </motion.div>
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none bg-stone-900 border border-stone-800 px-4 md:px-6 py-2 flex flex-col items-center">
                   <span className="text-[8px] md:text-[10px] text-stone-500 uppercase font-bold tracking-widest">Level</span>
                   <span className="text-xl md:text-2xl text-saffron font-serif">14</span>
                </div>
                <div className="flex-1 sm:flex-none bg-stone-900 border border-stone-800 px-4 md:px-6 py-2 flex flex-col items-center">
                   <span className="text-[8px] md:text-[10px] text-stone-500 uppercase font-bold tracking-widest">Points</span>
                   <span className="text-xl md:text-2xl text-white font-serif">3</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">
              {skills.map((skill, idx) => (
                <motion.div
                  key={skill.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-stone-900/60 border border-stone-800 p-4 md:p-8 flex flex-col sm:flex-row gap-4 md:gap-8 group hover:bg-stone-800/40 transition-colors bronze-bevel"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-stone-950 border border-stone-800 flex items-center justify-center relative shrink-0">
                     <skill.icon size={24} className="text-saffron md:w-8 md:h-8" />
                     <div className="absolute -bottom-2 -right-2 bg-saffron text-stone-950 text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-sm">
                       LVL {skill.level}
                     </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-serif text-base md:text-xl text-white uppercase tracking-wider">{skill.title}</h3>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={8} className={i <= skill.level ? 'fill-saffron text-saffron' : 'text-stone-700 md:w-2.5 md:h-2.5'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] md:text-sm text-stone-500 italic mb-4 md:mb-6 leading-relaxed line-clamp-2 md:line-clamp-none">{skill.desc}</p>
                    <button className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-[8px] md:text-[10px] font-bold text-white tracking-widest uppercase transition-all active:scale-95 border border-stone-700">
                      Upgrade (1 PT)
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 md:mt-12 bg-stone-900/40 border border-stone-800 p-6 md:p-8 text-center hammered-metal">
               <Award className="text-saffron/40 mx-auto mb-4 w-10 h-10 md:w-12 md:h-12" />
               <h3 className="font-serif text-base md:text-xl text-stone-300 uppercase tracking-widest mb-2">Legendary Feats</h3>
               <p className="text-[10px] md:text-sm text-stone-600 max-w-lg mx-auto italic">Complete objectives to unlock relics of power from the archives.</p>
            </div>
          </div>

          {/* Intelligence Panel */}
          <div className="w-full md:w-64 lg:w-80 border-t-2 md:border-t-0 md:border-l-4 border-stone-800 bg-stone-900/50 p-6 md:p-8 flex flex-col gap-6 md:gap-8 shrink-0">
             <h3 className="font-serif text-lg md:text-xl text-white uppercase tracking-widest border-b border-stone-800 pb-3 flex items-center gap-2">
               <Eye size={18} className="text-saffron md:w-5 md:h-5" /> Intelligence
             </h3>
             
             <div className="space-y-4 md:space-y-6">
                {[
                  { label: 'Enemy Morale', value: 'Shaken', icon: MessageSquare },
                  { label: 'Terrain Adv.', value: 'Negligible', icon: Compass },
                  { label: 'Strategic Depth', value: 'High', icon: Star },
                ].map((intel, i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-4 group">
                    <div className="p-2 bg-stone-800 group-hover:text-saffron transition-colors shrink-0">
                      <intel.icon size={16} className="md:w-4.5 md:h-4.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] md:text-[10px] text-stone-500 uppercase font-bold tracking-widest truncate">{intel.label}</span>
                      <span className="text-xs md:text-sm text-white font-serif tracking-wide truncate">{intel.value}</span>
                    </div>
                  </div>
                ))}
             </div>

             <div className="mt-auto p-4 bg-black/40 border border-stone-800 rounded-sm">
               <p className="text-[8px] md:text-[10px] text-stone-500 leading-relaxed italic">
                 "Intelligence suggests the Durrani forces are massing near the northern ridge."
               </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};
