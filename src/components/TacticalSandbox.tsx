import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, Shield, RotateCcw, Cloud, Flame, Sun, Sparkles } from 'lucide-react';
import { SANDBOX_UNITS, TacticalUnit } from '../data/lmsData';

type Weather = 'Sunny' | 'Winter Frost' | 'Dust Storm';

interface Slot {
  id: string;
  name: string;
  faction: 'Maratha' | 'Afghan';
  unit: TacticalUnit | null;
}

export const TacticalSandbox: React.FC = () => {
  const [weather, setWeather] = useState<Weather>('Sunny');
  const [slots, setSlots] = useState<Slot[]>([
    { id: 'maratha-left', name: 'Maratha Left Flank', faction: 'Maratha', unit: null },
    { id: 'maratha-center', name: 'Maratha Center Line', faction: 'Maratha', unit: null },
    { id: 'maratha-right', name: 'Maratha Right Flank', faction: 'Maratha', unit: null },
    { id: 'afghan-left', name: 'Afghan Left Flank', faction: 'Afghan', unit: null },
    { id: 'afghan-center', name: 'Afghan Center Line', faction: 'Afghan', unit: null },
    { id: 'afghan-right', name: 'Afghan Right Flank', faction: 'Afghan', unit: null }
  ]);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simWinner, setSimWinner] = useState<string | null>(null);

  const marathaUnits = SANDBOX_UNITS.filter(u => u.faction === 'Maratha');
  const afghanUnits = SANDBOX_UNITS.filter(u => u.faction === 'Afghan');

  const handlePlaceUnit = (slotId: string, unitId: string | null) => {
    if (!unitId) {
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, unit: null } : s));
      return;
    }
    const targetUnit = SANDBOX_UNITS.find(u => u.id === unitId);
    if (targetUnit) {
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, unit: targetUnit } : s));
    }
  };

  const handleReset = () => {
    setSlots(slots.map(s => ({ ...s, unit: null })));
    setSimLogs([]);
    setIsSimulating(false);
    setSimWinner(null);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimLogs([]);
    setSimWinner(null);

    const logs: string[] = [];
    logs.push("🎺 Kettledrums and brass war-horns sound across the plains...");
    logs.push(`🌍 Combat Environment configured to [${weather}] conditions.`);

    // Check weather impacts
    if (weather === 'Winter Frost') {
      logs.push("❄️ WARNING: Extreme frost (3°C) forces Maratha cotton brigades to shiver; speed reduced globally.");
    } else if (weather === 'Dust Storm') {
      logs.push("💨 WARNING: Blinding desert dust reduces high artillery cannon precision but favors heavy infantry melee.");
    } else {
      logs.push("☀️ Normal clear visibility on the Hindusthan battlefield plains.");
    }

    let marathaScore = 0;
    let afghanScore = 0;

    // Simulate Lanes
    const lanes = ['left', 'center', 'right'];
    lanes.forEach(lane => {
      const marathaSlot = slots.find(s => s.id === `maratha-${lane}`);
      const afghanSlot = slots.find(s => s.id === `afghan-${lane}`);

      const mUnit = marathaSlot?.unit;
      const aUnit = afghanSlot?.unit;

      if (!mUnit && !aUnit) {
        logs.push(`• Flank [${lane.toUpperCase()}]: Skirmishers trace empty lines, no major engagement.`);
        return;
      }

      logs.push(`⚔️ Clash initiated in the [${lane.toUpperCase()}] Sector...`);

      let mVal = mUnit ? (mUnit.assault + mUnit.defense) / 2 : 15;
      let aVal = aUnit ? (aUnit.assault + aUnit.defense) / 2 : 15;

      // Apply weather coefficients
      if (mUnit) {
        let actualMVal = mVal;
        if (weather === 'Winter Frost') {
          actualMVal -= 15; // Shivering penalty
          logs.push(`  └─ Maratha [${mUnit.name}] suffers frostbite penalty (-15 rating).`);
        } else if (weather === 'Dust Storm' && mUnit.type === 'Artillery') {
          actualMVal -= 25; // Smoke and sand blind cannon lines
          logs.push(`  └─ Gardi artillery accuracy heavily penalized by dust storm (-25 precision).`);
        }
        marathaScore += actualMVal;
        logs.push(`  └─ deployed: Maratha [${mUnit.name}] (Base rating: ${actualMVal})`);
      }

      if (aUnit) {
        let actualAVal = aVal;
        if (weather === 'Dust Storm' && aUnit.id === 'rohilla') {
          actualAVal += 15; // Rohilla hills storm charge
          logs.push("  └─ Afghan [Rohilla Heavies] gain battle fury under sandy visual cover (+15 melee).");
        }
        afghanScore += actualAVal;
        logs.push(`  └─ deployed: Afghan [${aUnit.name}] (Base rating: ${actualAVal})`);
      }

      // Advantage calculations
      if (mUnit && aUnit) {
        if (mUnit.id === 'gardi' && aUnit.id === 'zamburak') {
          marathaScore += 10;
          logs.push(`✨ Gardi artillery grape-shot successfully counters the soft-armored camel line! (+10 Maratha advantage)`);
        } else if (aUnit.id === 'rohilla' && mUnit.id === 'mawala') {
          afghanScore += 15;
          logs.push(`✨ Rohilla heavy armored sword-shield phalanx repels light Mawala raiders. (+15 Afghan advantage)`);
        }
      }
    });

    setTimeout(() => {
      logs.push("\n🛡️ RESOLUTION STATISTICS:");
      logs.push(`• Combined Maratha Command Rating: ${Math.round(marathaScore)}`);
      logs.push(`• Combined Afghan Coalition Rating: ${Math.round(afghanScore)}`);

      if (marathaScore > afghanScore + 10) {
        setSimWinner('Maratha');
        logs.push("🎉 VICTORY: Sadashivrao Bhau\'s Deccan alignment successfully punches through!');");
        logs.push("General Ibrahim Khan Gardi\'s batteries hold, preventing the encirclement!");
      } else if (afghanScore > marathaScore + 10) {
        setSimWinner('Afghan');
        logs.push("💀 CATASTROPHE: Ahmad Shah Abdali\'s crescent wedge surrounds and breaks the line!");
        logs.push("Camel zamburaks flanking rounds scatter the backup infantry.");
      } else {
        setSimWinner('Draw');
        logs.push("⚖️ BLOODY STALEMATE: The lines are exhausted; both armies withdraw to winter barricades.");
      }

      setSimLogs(logs);
      setIsSimulating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-left">
        
        {/* Step A: Selection Panel */}
        <div className="space-y-4">
          <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm">
            <span className="text-[8.5px] font-mono text-[#8B5E3C] uppercase font-black tracking-widest block mb-2">Step 1: Environmental Modifiers</span>
            <div className="grid grid-cols-3 gap-2">
              {(['Sunny', 'Winter Frost', 'Dust Storm'] as Weather[]).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeather(w)}
                  className={`py-2 px-1 text-[9.5px] font-mono rounded border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 leading-tight ${weather === w ? 'bg-saffron text-stone-950 font-black border-saffron' : 'bg-transparent text-stone-400 border-stone-800'}`}
                >
                  {w === 'Sunny' && <Sun size={13} />}
                  {w === 'Winter Frost' && <Cloud size={13} className="text-sky-300" />}
                  {w === 'Dust Storm' && <Flame size={13} className="text-amber-600 animate-pulse" />}
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm space-y-3">
            <span className="text-[8.5px] font-mono text-[#8B5E3C] uppercase font-black tracking-widest block">Step 2: Tactical Unit Ledger</span>
            
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-saffron uppercase tracking-widest block">Maratha Deccan Forces</span>
              {marathaUnits.map(unit => (
                <div key={unit.id} className="flex gap-2 items-center p-2 bg-[#20150d] border border-orange-950/40 rounded-xs text-xs">
                  <span className="text-2xl bg-stone-900 px-2.5 py-1.5 rounded">{unit.icon}</span>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-white font-serif">{unit.name}</strong>
                    <span className="block text-[8px] text-stone-400 truncate leading-tight font-sans mt-0.5">{unit.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-900">
              <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest block">Afghan Coalition Forces</span>
              {afghanUnits.map(unit => (
                <div key={unit.id} className="flex gap-2 items-center p-2 bg-[#121b27] border border-blue-900/30 rounded-xs text-xs">
                  <span className="text-2xl bg-stone-900 px-2.5 py-1.5 rounded">{unit.icon}</span>
                  <div className="flex-1 min-w-0">
                    <strong className="block text-white font-serif">{unit.name}</strong>
                    <span className="block text-[8px] text-stone-400 truncate leading-tight font-sans mt-0.5">{unit.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step B: The Layout Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#18110b] border border-[#8B5E3C]/30 p-4 md:p-6 rounded-sm relative overflow-hidden">
            <span className="text-[8.5px] font-mono text-saffron uppercase font-black block mb-4 tracking-widest">
              🏟️ BATTLEFIELD SECTOR PLACEMENT LANES
            </span>

            {/* Grid display lanes */}
            <div className="grid grid-cols-2 gap-4 items-stretch">
              
              {/* Maratha Sides */}
              <div className="space-y-4 bg-orange-950/10 p-3 rounded border border-orange-900/10">
                <span className="text-[9px] font-mono uppercase font-black text-saffron text-center block">Deccan Vanguard</span>
                {slots.filter(s => s.faction === 'Maratha').map(slot => (
                  <div key={slot.id} className="space-y-1.5 text-left">
                    <span className="text-[8.5px] text-stone-500 font-mono font-medium block">{slot.name}</span>
                    <div className="relative">
                      {slot.unit ? (
                        <div className="p-3 bg-[#2a170b] border-2 border-saffron rounded-sm flex justify-between items-center relative">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{slot.unit.icon}</span>
                            <div>
                              <strong className="font-serif text-xs text-white uppercase block leading-tight">{slot.unit.name}</strong>
                              <span className="text-[8px] font-mono text-[#8B5E3C]">⚔️ {slot.unit.assault}% | 🛡️ {slot.unit.defense}%</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePlaceUnit(slot.id, null)}
                            className="text-[8px] font-mono font-black text-rose-500 hover:text-rose-400 bg-stone-900/80 px-2 py-1 rounded cursor-pointer transition-colors"
                          >
                            REMOVE
                          </button>
                        </div>
                      ) : (
                        <select
                          onChange={(e) => handlePlaceUnit(slot.id, e.target.value || null)}
                          className="w-full bg-stone-950 border border-stone-850 p-2 text-xs font-mono rounded text-stone-400 focus:border-saffron focus:text-white"
                        >
                          <option value="">-- Click to deploy unit --</option>
                          {marathaUnits.map(u => (
                            <option key={u.id} value={u.id}>{u.icon} {u.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Afghan Sides */}
              <div className="space-y-4 bg-blue-950/10 p-3 rounded border border-blue-900/15">
                <span className="text-[9px] font-mono uppercase font-black text-sky-400 text-center block">Afghan Encampment</span>
                {slots.filter(s => s.faction === 'Afghan').map(slot => (
                  <div key={slot.id} className="space-y-1.5 text-left">
                    <span className="text-[8.5px] text-stone-500 font-mono font-medium block">{slot.name}</span>
                    <div className="relative">
                      {slot.unit ? (
                        <div className="p-3 bg-[#0d1622] border-2 border-blue-500 rounded-sm flex justify-between items-center relative">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{slot.unit.icon}</span>
                            <div>
                              <strong className="font-serif text-xs text-white uppercase block leading-tight">{slot.unit.name}</strong>
                              <span className="text-[8px] font-mono text-sky-400">⚔️ {slot.unit.assault}% | 🛡️ {slot.unit.defense}%</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePlaceUnit(slot.id, null)}
                            className="text-[8px] font-mono font-black text-rose-500 hover:text-rose-400 bg-stone-900/80 px-2 py-1 rounded cursor-pointer transition-colors"
                          >
                            REMOVE
                          </button>
                        </div>
                      ) : (
                        <select
                          onChange={(e) => handlePlaceUnit(slot.id, e.target.value || null)}
                          className="w-full bg-stone-950 border border-stone-850 p-2 text-xs font-mono rounded text-stone-400 focus:border-blue-500 focus:text-white"
                        >
                          <option value="">-- Click to deploy unit --</option>
                          {afghanUnits.map(u => (
                            <option key={u.id} value={u.id}>{u.icon} {u.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Launch Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-900/60 justify-center">
              <button
                type="button"
                disabled={isSimulating || !slots.some(s => s.unit !== null)}
                onClick={runSimulation}
                className="px-6 py-3 bg-gradient-to-r from-saffron to-amber-600 text-stone-950 font-mono text-xs uppercase font-black tracking-widest rounded transition-all cursor-pointer shadow-lg hover:brightness-115 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-20 disabled:pointer-events-none"
              >
                {isSimulating ? (
                  <>🤖 CALIBRATING ARTILLERY LORDS...</>
                ) : (
                  <>
                    <PlayCircle size={15} /> RUN TACTICAL ENGAGEMENT
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 bg-stone-900 hover:bg-stone-850 text-stone-300 font-mono text-xs uppercase tracking-widest border border-stone-800 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={13} /> Reset Lanes
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Simulator Log Output Console */}
      <AnimatePresence>
        {simLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-left"
          >
            <div className="p-5 bg-stone-950 border-2 border-stone-900 rounded-sm relative shadow-2xl">
              <span className="text-[8.5px] font-mono text-saffron font-black uppercase tracking-widest block mb-3 border-b border-stone-900 pb-2">
                📜 SCRIPTED COMBUSTION console logs:
              </span>
              <div className="font-mono text-[10px] md:text-[11.5px] leading-relaxed space-y-1.5 max-h-56 overflow-y-auto pr-2 text-stone-300">
                {simLogs.map((log, lIdx) => (
                  <p key={lIdx} className={log.startsWith('✨') ? 'text-emerald-400 font-bold' : log.startsWith('🎉') ? 'text-emerald-300 font-black tracking-wider border-l-2 border-emerald-500 pl-2 mt-2 bg-emerald-950/10 py-1' : log.startsWith('💀') ? 'text-rose-400 font-black tracking-wider border-l-2 border-rose-500 pl-2 mt-2 bg-rose-950/10 py-1' : log.startsWith('•') ? 'text-stone-400 font-black' : ''}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
