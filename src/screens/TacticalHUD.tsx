import React from 'react';
import { motion } from 'motion/react';
import { Swords, Shield, Heart, Zap, Target, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { Screen, Unit } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

const MOCK_UNITS: Unit[] = [
  {
    id: '1',
    name: 'Gardi Infantry',
    type: 'Infantry',
    strength: 850,
    maxStrength: 1000,
    ammunition: 45,
    stamina: 72,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1M09Q6X1-7e8iP_Tz1_Q-2l9S8g2X0w8X5y6z7w8u9v0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n',
    description: 'Disciplined infantry trained in European flintlock tactics.'
  },
  {
    id: '2',
    name: 'Huzurat Cavalry',
    type: 'Cavalry',
    strength: 400,
    maxStrength: 500,
    stamina: 60,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6',
    description: 'Elite heavy cavalry forming the shock element of the army.'
  },
  {
    id: '3',
    name: 'Heavy Gun Carriage',
    type: 'Artillery',
    strength: 12,
    maxStrength: 15,
    ammunition: 20,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuG-7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3',
    description: 'Large-caliber bronze cannons capable of shattering fortifications.'
  }
];

export const TacticalHUD: React.FC<{ 
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose }) => {
  return (
    <div className="relative h-screen w-screen bg-stone-950 overflow-hidden">
      <TopBar screen={Screen.TACTICAL_HUD} onNavigate={onNavigate} onToggleMenu={onToggleMenu} />
      <SideNav screen={Screen.TACTICAL_HUD} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />
      
      <main className="lg:pl-64 pt-16 h-[calc(100vh-6rem)] overflow-y-auto bg-stone-950/50 custom-scrollbar">
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 min-h-full">
          {/* Tactical Overview */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-stone-900/60 border border-stone-800 p-4 md:p-6 bronze-bevel hammered-metal"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl md:text-2xl text-saffron uppercase tracking-widest flex items-center gap-2 md:gap-3">
                  <Swords size={20} className="md:w-6 md:h-6" /> Combat Registry
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] md:text-[10px] text-stone-500 uppercase tracking-widest font-bold">Intensity</span>
                    <span className="text-afghan-red font-bold text-xs md:text-md">HIGH</span>
                  </div>
                  <TrendingUp className="text-afghan-red animate-pulse w-4 h-4 md:w-6 md:h-6" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-stone-950/40 p-3 md:p-4 border border-stone-800/50">
                  <span className="text-[8px] md:text-[10px] text-stone-500 uppercase tracking-widest font-bold block mb-1">Army Resolve</span>
                  <div className="h-1.5 md:h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '78%' }} className="h-full bg-saffron" />
                  </div>
                  <span className="text-lg md:text-xl text-white font-serif mt-1 block">78/100</span>
                </div>
                <div className="bg-stone-950/40 p-3 md:p-4 border border-stone-800/50">
                  <span className="text-[8px] md:text-[10px] text-stone-500 uppercase tracking-widest font-bold block mb-1">Advantage</span>
                  <div className="h-1.5 md:h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '52%' }} className="h-full bg-blue-500" />
                  </div>
                  <span className="text-lg md:text-xl text-white font-serif mt-1 block">+12%</span>
                </div>
                <div className="bg-stone-950/40 p-3 md:p-4 border border-stone-800/50">
                  <span className="text-[8px] md:text-[10px] text-stone-500 uppercase tracking-widest font-bold block mb-1">Attrition</span>
                  <div className="h-1.5 md:h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '14%' }} className="h-full bg-afghan-red" />
                  </div>
                  <span className="text-lg md:text-xl text-white font-serif mt-1 block">0.8% / HR</span>
                </div>
              </div>
            </motion.div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {MOCK_UNITS.map((unit, idx) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-stone-900 border border-stone-800 p-4 md:p-5 group flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-stone-800 border border-stone-700 overflow-hidden relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent" />
                      <div className="absolute bottom-1 right-1">
                        <Shield className="text-stone-500" size={12} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-md md:text-lg text-white uppercase tracking-wider truncate">{unit.name}</h3>
                      <div className="flex items-center gap-2 text-[8px] md:text-[10px] text-saffron uppercase font-bold tracking-widest mb-1">
                        {unit.type === 'Infantry' && <Users size={10} />}
                        {unit.type === 'Cavalry' && <Target size={10} />}
                        {unit.type === 'Artillery' && <Zap size={10} />}
                        {unit.type}
                      </div>
                      <p className="text-[10px] md:text-xs text-stone-500 line-clamp-1 md:line-clamp-2">{unit.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-[8px] md:text-[10px] uppercase font-bold text-stone-500 mb-1">
                        <span>HP</span>
                        <span className="text-white">{unit.strength}</span>
                      </div>
                      <div className="h-1 md:h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500/80" style={{ width: `${(unit.strength / unit.maxStrength) * 100}%` }} />
                      </div>
                    </div>
                    {unit.ammunition !== undefined && (
                      <div>
                        <div className="flex justify-between text-[8px] md:text-[10px] uppercase font-bold text-stone-500 mb-1">
                          <span>Ammo</span>
                          <span className="text-white">{unit.ammunition}</span>
                        </div>
                        <div className="h-1 md:h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500/80" style={{ width: '45%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Side Feedback Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-stone-900 border border-stone-800 p-4 md:p-6 flex-1 flex flex-col">
              <h3 className="font-serif text-white uppercase tracking-widest mb-6 border-b border-stone-800 pb-2 flex items-center gap-2 text-sm md:text-base">
                <AlertTriangle size={16} className="text-afghan-red" /> Intelligence
              </h3>
              
              <div className="space-y-3">
                {[
                  { title: "Enemy Flank Observed", time: "2m", severity: "High" },
                  { title: "Artillery Zeroing In", time: "5m", severity: "Critical" },
                  { title: "Supply Line Pressure", time: "12m", severity: "Med" }
                ].map((alert, i) => (
                  <div key={i} className="bg-stone-950/60 p-3 border-l-4 border-afghan-red">
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{alert.title}</span>
                      <span className="text-[8px] text-stone-600 font-bold uppercase">{alert.time}</span>
                    </div>
                    <span className="text-[8px] text-afghan-red font-bold uppercase tracking-wider">Sev: {alert.severity}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onNavigate(Screen.BATTLE)}
              className="bg-afghan-red hover:bg-red-800 text-white font-serif uppercase tracking-widest py-3 md:py-4 transition-all active:scale-95 bronze-bevel shadow-[0_0_20px_rgba(139,0,0,0.5)] text-sm md:text-base"
            >
              Engage Enemy
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
