import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, AlertCircle, Coins, Award, Users, ChevronRight, HelpCircle, Flame } from 'lucide-react';

interface CavalryChargeSimulatorProps {
  onClose: () => void;
  onApplyRewards: (rewards: { gold: number; morale: number; text: string }) => void;
}

export const CavalryChargeSimulator: React.FC<CavalryChargeSimulatorProps> = ({
  onClose,
  onApplyRewards,
}) => {
  // Gameplay States
  const [terrainType, setTerrainType] = useState<'Deep Sand' | 'Dune Slip' | 'Dry Riverbank'>('Deep Sand');
  const [pace, setPace] = useState<'Trot' | 'Canter' | 'Gallop' | 'Full Charge'>('Trot');
  const [chargeProgress, setChargeProgress] = useState(0); // 0 to 100%
  const [momentum, setMomentum] = useState(20); // 0 to 100
  const [drag, setDrag] = useState(40); // Sandy resistance factor
  const [isCharging, setIsCharging] = useState(false);
  
  // Oscillating indicator for tactical timing
  const [timingIndicator, setTimingIndicator] = useState(50);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left

  // Simulation Results
  const [simStep, setSimStep] = useState<'brief' | 'maneuvering' | 'outcome'>('brief');
  const [outcomeMessage, setOutcomeMessage] = useState('');
  const [casualties, setCasualties] = useState(0);
  const [resultStatus, setResultStatus] = useState<'victory' | 'defeat' | 'undecided'>('undecided');
  
  // Logs of actions
  const [tacticalLogs, setTacticalLogs] = useState<string[]>([
    "Heavy lines assemble at the sandy edge of Panipat basin.",
  ]);

  // Adjust timing oscillation
  useEffect(() => {
    let intervalId: any;
    if (simStep === 'maneuvering' && isCharging) {
      intervalId = setInterval(() => {
        setTimingIndicator(prev => {
          let next = prev + direction * 4;
          if (next >= 100) {
            setDirection(-1);
            return 100;
          }
          if (next <= 0) {
            setDirection(1);
            return 0;
          }
          return next;
        });
      }, 35);
    }
    return () => clearInterval(intervalId);
  }, [simStep, isCharging, direction]);

  // Handle terrain configurations
  useEffect(() => {
    if (terrainType === 'Deep Sand') setDrag(45);
    else if (terrainType === 'Dune Slip') setDrag(60);
    else setDrag(30);
  }, [terrainType]);

  // Core Maneuvers Action Toggles
  const handleSpurHorses = () => {
    // Timing Sweet-spot check: between 40 and 60 is the perfect timing
    const timingDiff = Math.abs(timingIndicator - 50);
    const isPerfect = timingDiff <= 12;
    const isGood = timingDiff > 12 && timingDiff <= 25;

    let logMessage = "";
    let momentumBoost = 0;
    let stressLoss = 0;

    if (isPerfect) {
      momentumBoost = 25;
      stressLoss = 10;
      logMessage = `⭐ PERFECT METRONOMIC TIMING! Cavalry lines coordinate their stride on ${terrainType}. Drag minimized!`;
    } else if (isGood) {
      momentumBoost = 15;
      stressLoss = 20;
      logMessage = `👍 GOOD SYNCHRONIZATION! Spur-timing adjusted to current draft conditions. Momentum builds.`;
    } else {
      momentumBoost = 5;
      stressLoss = 35; // major horse fatigue / stumbling on sand
      logMessage = `⚠️ DESYNCHRONIZED SPUR! Horses stumble on sandy dunes. Severe drag penalty applied.`;
    }

    setMomentum(prev => Math.min(100, Math.max(0, prev + momentumBoost - (drag / 3))));
    setCasualties(c => c + Math.floor(stressLoss / 2));
    setTacticalLogs(prev => [logMessage, ...prev]);

    // Fast-track progress
    setChargeProgress(p => {
      const next = p + Math.floor((momentum * 0.15) + 8);
      if (next >= 100) {
        clearInterval(autoMarchRef.current);
        resolveOutcome();
        return 100;
      }
      return next;
    });
  };

  const autoMarchRef = useRef<any>(null);

  const startChargeSimulation = () => {
    setIsCharging(true);
    setSimStep('maneuvering');
    setChargeProgress(0);
    setMomentum(30);
    setCasualties(0);
    setTacticalLogs([
      "Trumpet horns signal the initial trot across local sandy plains.",
      "The Durrani high defense square expands shields, preparing matches."
    ]);
  };

  // Automated incremental progress if player doesn't click, drag slows down
  useEffect(() => {
    let timer: any;
    if (simStep === 'maneuvering' && isCharging) {
      timer = setInterval(() => {
        setMomentum(prev => Math.max(10, prev - (drag / 16)));
        setChargeProgress(p => {
          const next = p + Math.max(1, Math.floor(momentum / 12));
          if (next >= 100) {
            resolveOutcome();
            return 100;
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [simStep, isCharging, momentum, drag]);

  const resolveOutcome = () => {
    setIsCharging(false);
    setSimStep('outcome');

    const criticalMomentumNeeded = 60 + (drag / 4);
    const finalImpactEnergy = momentum;

    if (finalImpactEnergy >= criticalMomentumNeeded) {
      setResultStatus('victory');
      setOutcomeMessage(
        `SUCCESSFUL BREAKTHROUGH! With a devastating velocity of ${finalImpactEnergy.toFixed(0)} units, your heavy cavalry crushed the outer shields of the Afghan infantry square, routing their matchlock gunners into the sands!`
      );
    } else {
      setResultStatus('defeat');
      setOutcomeMessage(
        `CHARGE STALLED! The sandy friction (${drag}% drag) combined with poor synchronization drained your horses' velocity to ${finalImpactEnergy.toFixed(0)} units. The Durrani infantry held their iron shields tight, picking off your lines with heavy flintlock fire.`
      );
    }
  };

  const handleClaimSuccess = () => {
    if (resultStatus === 'victory') {
      onApplyRewards({
        gold: 15000,
        morale: 20,
        text: "Timing Cavalry Charge Victory: Shattered the enemy's front-flank defense infantry square, adding 15,000 Gold Treasury and +20% Troop Morale."
      });
    } else {
      onApplyRewards({
        gold: 0,
        morale: -10,
        text: "Failed Cavalry Charge: Retreated with significant cavalry casualties (-10% Morale)."
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div id="cavalry-charge-modal" className="w-full max-w-4xl bg-stone-900 border-4 border-amber-600 rounded-sm relative flex flex-col max-h-[92vh] text-[#F3E5AB]">
        
        {/* Header decoration */}
        <div className="p-4 border-b border-amber-600/30 bg-stone-950 flex justify-between items-center decoration-golden font-serif">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐎</span>
            <div className="text-left">
              <h3 className="text-lg font-black uppercase text-saffron tracking-widest">Interactive Cavalry Charge Simulator</h3>
              <p className="text-[10px] text-stone-400 font-sans italic lowercase">"break the steel walls of infantry squares through metronomic timing over heavy shifting sands"</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-3 bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs rounded-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
          
          {/* Brief Screen */}
          {simStep === 'brief' && (
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-xs border-l-4 border-saffron bg-[#2b1f14] text-stone-200">
                <h4 className="font-serif font-black text-xs text-saffron uppercase mb-1">TACTICAL DIRECTIVE: COALESCE FRONT MANEUVER</h4>
                <p className="text-xs leading-relaxed font-sans">
                  The Durrani General has defensive matchlock brigades arranged in tight <strong>Infantry Squares</strong> on the dry Yamuna flood plains. Charging headfirst without rhythm will cause our horses to sink into the deep drift sands, rendering them target practice for Afghan rifle fire. 
                  You must closely synchronize your horse spurs with the oscillating momentum meter to gain optimal velocity before impact!
                </p>
              </div>

              {/* Simulation Configuration Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm">
                  <h5 className="font-serif font-bold text-xs uppercase text-saffron mb-3">1. Terrain Navigation</h5>
                  <div className="space-y-2">
                    {[
                      { name: 'Dry Riverbank', drag: '30%', text: 'Lower sand density. Fairly solid soil with moderate traction.' },
                      { name: 'Deep Sand', drag: '45%', text: 'Heavy friction. Shifting silt that tires horses instantly.' },
                      { name: 'Dune Slip', drag: '60%', text: 'Extremely treacherous slopes. Massive drag, severe accident risk.' }
                    ].map(t => (
                      <button
                        key={t.name}
                        onClick={() => setTerrainType(t.name as any)}
                        className={`w-full p-2.5 text-left border rounded-xs transition-all cursor-pointer ${terrainType === t.name ? 'border-saffron bg-saffron/10 text-saffron' : 'border-stone-800 bg-stone-900 text-stone-400'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-serif font-bold text-xs uppercase">{t.name}</span>
                          <span className="text-[10px] font-mono font-black">{t.drag} drag</span>
                        </div>
                        <p className="text-[10px] mt-1 text-stone-400 leading-snug">{t.text}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm flex flex-col justify-between">
                  <div>
                    <h5 className="font-serif font-bold text-xs uppercase text-saffron mb-2">2. Physics Dynamics</h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                      • Shifting sand causes a constant <strong>-{drag}% traction penalty</strong> to your galloping speed.<br/>
                      • Spur timing has a sweet-spot range <span className="text-emerald-400">(40% - 60% center)</span> on the timing bar. Hit it precisely to compound momentum!<br/>
                      • Reaching <strong>{60 + (drag / 4)} Target Momentum</strong> is mandatory to crack the infantry square defense lines.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={startChargeSimulation}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-saffron to-amber-700 hover:from-yellow-500 hover:to-orange-700 text-stone-950 font-serif font-black uppercase text-xs tracking-wider rounded-sm cursor-pointer shadow-md transition-all active:scale-[0.98]"
                  >
                    🐎 DEPLOY CAVALRY LINE & MARCH
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Maneuvering Phase Screen */}
          {simStep === 'maneuvering' && (
            <div className="space-y-6">
              
              {/* Charge Field Interactive representation */}
              <div className="h-40 bg-stone-950 border border-stone-850 rounded-sm relative overflow-hidden flex flex-col justify-end p-4">
                <div 
                  className="absolute inset-0 opacity-15 bg-cover bg-bottom"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1968&auto=format&fit=crop')" }}
                />

                {/* Progress markers */}
                <div className="absolute top-2 left-2 right-2 flex justify-between text-[9px] font-mono text-stone-500 font-bold uppercase">
                  <span>Deccan Lancers</span>
                  <span>Impact Distance: {chargeProgress}/100m</span>
                  <span>Afghan Defensive Line</span>
                </div>

                {/* Simulated Running track */}
                <div className="w-full h-10 border-b border-dashed border-stone-800/60 relative mb-4">
                  {/* Player Cavalry Icon */}
                  <div 
                    className="absolute bottom-1 transition-all duration-300"
                    style={{ left: `${chargeProgress * 0.82}%` }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl animate-bounce">🐎</span>
                      <span className="text-[8px] px-1 py-0.5 bg-saffron text-stone-950 font-mono font-black uppercase tracking-tighter">
                        {momentum.toFixed(0)} MV
                      </span>
                    </div>
                  </div>

                  {/* Enemy square block */}
                  <div className="absolute bottom-1 right-2">
                    <div className="flex flex-col items-center">
                      <div className="flex gap-0.5">
                        <span className="text-md">🛡️</span>
                        <span className="text-md">💂</span>
                        <span className="text-md">🛡️</span>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 bg-red-650 text-white font-mono font-black uppercase tracking-tighter">
                        DURRANI UNIT SQ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sand effect particles */}
                <div className="flex gap-2">
                  <div className="flex-1 bg-stone-900 border border-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${chargeProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Timing Metronome Bar */}
              <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm text-left">
                <div className="flex justify-between items-center mb-1.5">
                  <h5 className="font-serif font-black text-[11px] text-saffron uppercase">COORDINATED SPUR SYNC METRONOME</h5>
                  <span className="text-[10px] font-mono text-stone-400">Sweet Spot: Center 40% - 60%</span>
                </div>

                {/* Oscillating Slider track */}
                <div className="w-full bg-stone-900 h-6 border border-stone-800 rounded-sm relative overflow-hidden">
                  {/* Perfect Zone in Middle */}
                  <div className="absolute left-[40%] right-[40%] top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40 flex items-center justify-center">
                    <span className="text-[8px] font-mono font-black text-emerald-400">SPUR TIMING EXCELLENCE</span>
                  </div>

                  {/* Dynamic Pointer */}
                  <div 
                    className="absolute w-2.5 h-full top-0 bg-red-500 shadow-[0_0_10px_#ef4444]"
                    style={{ left: `${timingIndicator}%` }}
                  />
                </div>

                {/* Action Trigger button */}
                <div className="mt-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSpurHorses}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-stone-950 font-serif font-black text-[13px] uppercase tracking-wider rounded-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    ⚡ SPUR STIRRUP (ENGAGE RHYTHM)
                  </button>

                  <div className="w-48 bg-stone-900 p-2.5 border border-stone-850 rounded-sm font-mono text-left">
                    <div className="text-[8px] text-stone-500 uppercase leading-none mb-1">Momentum Force</div>
                    <div className="text-base font-black text-white">{momentum.toFixed(0)} <span className="text-[9px] text-stone-400 uppercase">kts</span></div>
                    <div className="w-full bg-stone-950 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-saffron" style={{ width: `${momentum}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical Logs Grid */}
              <div className="bg-stone-950 border border-stone-850 p-3 h-28 overflow-y-auto text-left rounded-sm font-mono text-[10px] space-y-1 text-stone-300">
                <span className="text-stone-500 block font-bold uppercase tracking-widest border-b border-stone-900 pb-1 mb-1.5">Sirdar Charge Chronicle:</span>
                {tacticalLogs.map((log, idx) => (
                  <div key={idx} className="leading-snug">
                    <span className="text-saffron">»</span> {log}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Outcome Screen */}
          {simStep === 'outcome' && (
            <div className="space-y-4 text-center py-6">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center border-2 text-3xl shadow-lg ${resultStatus === 'victory' ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' : 'border-red-650 bg-red-950/20 text-red-400'}`}>
                {resultStatus === 'victory' ? '🏆' : '💀'}
              </div>
              
              <div className="max-w-xl mx-auto space-y-2">
                <h4 className="font-serif text-lg font-black uppercase tracking-wider text-stone-100">
                  {resultStatus === 'victory' ? 'SUCCESSFUL COINCIDENT IMPACT' : 'THE CAVALRY ROW SHALL DECREASE'}
                </h4>
                <p className="text-xs leading-relaxed text-stone-300 font-sans">
                  {outcomeMessage}
                </p>
                <div className="mt-4 p-3 bg-stone-950 border border-stone-850 rounded-xs inline-flex items-center gap-4 text-left font-mono">
                  <div>
                    <span className="text-[8px] text-stone-500 uppercase block">Impact Velocity</span>
                    <span className="text-sm font-black text-white">{momentum.toFixed(0)} MV</span>
                  </div>
                  <div className="h-8 w-px bg-stone-850" />
                  <div>
                    <span className="text-[8px] text-stone-500 uppercase block">Total Casualties</span>
                    <span className="text-sm font-black text-red-400">{casualties} Lancers</span>
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto pt-4 border-t border-stone-850 mt-6">
                <button
                  type="button"
                  onClick={handleClaimSuccess}
                  className="w-full py-3 bg-saffron hover:bg-yellow-500 text-stone-950 font-serif font-black uppercase text-xs tracking-widest rounded-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {resultStatus === 'victory' ? 'CLAIM VICTORY WAR COUNDS' : 'DISMISS CASUALTY DRILL'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
