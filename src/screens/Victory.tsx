import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Trophy, Scroll, Star, History, Flag, ArrowLeft, ChevronRight, Shield } from 'lucide-react';
import { Screen } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

export const Victory: React.FC<{ 
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose }) => {
  useEffect(() => {
    const finalGold = Number(localStorage.getItem('panipat_campaign_treasury') || 0);
    const finalMorale = Number(localStorage.getItem('panipat_campaign_morale') || 0);
    const totalScore = finalGold + finalMorale * 1000;
    
    const currentHigh = Number(localStorage.getItem('panipat_high_score') || 0);
    if (totalScore > currentHigh) {
      localStorage.setItem('panipat_high_score', totalScore.toString());
    }

    if (finalGold > 200000) {
      localStorage.setItem('achieve_treasury', 'true');
    }
  }, []);
  const archives = [
    { title: 'The Seige of Kunjpura', date: 'Oct 17, 1760', result: 'Decisive Victory', stars: 3 },
    { title: 'Skirmish at Yamuna', date: 'Dec 05, 1760', result: 'Tactical Draw', stars: 2 },
    { title: 'The Fall of Delhi', date: 'Aug 04, 1760', result: 'Strategic Win', stars: 3 },
  ];

  return (
    <div className="relative h-screen w-screen bg-stone-950 overflow-hidden">
      <TopBar screen={Screen.VICTORY} onNavigate={onNavigate} onToggleMenu={onToggleMenu} />
      <SideNav screen={Screen.VICTORY} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />
      
      <main className="lg:pl-64 pt-16 h-[calc(100vh-6rem)] overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(255,153,51,0.1),transparent_50%)] custom-scrollbar">
        <div className="flex-1 p-6 md:p-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 md:mb-16 text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-4 md:mb-6">
               <Trophy size={48} className="text-saffron animate-bounce md:w-16 md:h-16" style={{ animationDuration: '3s' }} />
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-white uppercase tracking-[0.2em] md:tracking-[0.3em] mb-4">Imperial Archives</h2>
            <div className="flex items-center justify-center gap-2 md:gap-4 text-stone-500 uppercase tracking-widest text-[8px] md:text-[10px] font-bold">
               <div className="h-px w-12 md:w-24 bg-stone-800" />
               <span className="truncate">Chronicles of 1761 Campaign</span>
               <div className="h-px w-12 md:w-24 bg-stone-800" />
            </div>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
            {archives.map((entry, idx) => (
              <motion.div
                key={entry.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-stone-900/40 border-2 border-stone-800 p-4 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center group hover:border-saffron/40 transition-all bronze-bevel relative overflow-hidden gap-4"
              >
                <div className="absolute inset-0 silk-wave-shader opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                <div className="flex items-center gap-4 md:gap-8 relative z-10 w-full">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
                    <Flag className="text-saffron/60 md:w-7 md:h-7" size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg md:text-2xl text-white tracking-wide uppercase truncate">{entry.title}</h3>
                    <div className="flex items-center gap-3 md:gap-4 mt-1">
                      <span className="text-[8px] md:text-[10px] text-stone-600 font-bold uppercase tracking-widest">{entry.date}</span>
                      <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${entry.result.includes('Victory') ? 'bg-green-900/30 text-green-500' : 'bg-saffron/20 text-saffron'}`}>
                        {entry.result}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-3 relative z-10 border-t sm:border-t-0 border-stone-800 pt-3 sm:pt-0">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <Star key={i} size={12} className={i <= entry.stars ? 'fill-saffron text-saffron' : 'text-stone-800 md:w-3.5 md:h-3.5'} />
                    ))}
                  </div>
                  <button className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-stone-500 hover:text-white transition-colors tracking-widest uppercase">
                    REVIEW <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 md:mt-24 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
             {[
               { label: 'Battles Won', value: '14', icon: Trophy },
               { label: 'Stability', value: 'High', icon: Shield },
               { label: 'Completion', value: '42%', icon: BookOpen },
             ].map((stat, i) => (
               <div key={i} className="text-center p-6 md:p-8 bg-stone-900/20 border border-stone-800/40">
                  <stat.icon className="mx-auto mb-4 text-stone-600 md:w-8 md:h-8" size={24} />
                  <div className="text-[8px] md:text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">{stat.label}</div>
                  <div className="text-xl md:text-2xl font-serif text-white">{stat.value}</div>
               </div>
             ))}
          </div>

          <div className="mt-8 md:mt-16 text-center">
            <button 
              onClick={() => onNavigate(Screen.MAIN_MENU)}
              className="inline-flex items-center gap-2 md:gap-3 text-stone-500 hover:text-saffron transition-all group font-serif uppercase tracking-widest text-xs md:text-base"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform md:w-5 md:h-5" /> Back to Palace
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
