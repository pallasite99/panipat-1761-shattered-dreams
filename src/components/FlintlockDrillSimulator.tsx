import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Target, Zap, RotateCcw, AlertTriangle, Disc, Flame, RefreshCw } from 'lucide-react';

interface FlintlockDrillSimulatorProps {
  onApplyRewards: (rewards: { gold: number; morale: number; text: string }) => void;
}

export const FlintlockDrillSimulator: React.FC<FlintlockDrillSimulatorProps> = ({ onApplyRewards }) => {
  const [activeDrill, setActiveDrill] = useState<'rank-fire' | 'calibration'>('rank-fire');

  // Drill 1: Rank Fire Timing State
  const [currentRank, setCurrentRank] = useState<'front' | 'middle' | 'rear'>('front');
  const [drillScore, setDrillScore] = useState<number>(0);
  const [isDrillActive, setIsDrillActive] = useState<boolean>(false);
  const [sweepValue, setSweepValue] = useState<number>(0);
  const [sweepDirection, setSweepDirection] = useState<'up' | 'down'>('up');
  const [feedbackText, setFeedbackText] = useState<string>('Ready your flintlocks, cadet.');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; scale: number; opacity: number }>>([]);
  const [consecutiveHits, setConsecutiveHits] = useState<number>(0);

  // Drill 2: Aim Circle State
  const [aimScale, setAimScale] = useState<number>(2.0);
  const [aimDirection, setAimDirection] = useState<'shrink' | 'grow'>('shrink');

  const animationRef = useRef<number | null>(null);

  // Trigger smoke particle effects
  const triggerSmoke = (x: number, y: number) => {
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() * 40 - 20),
      y: y - (Math.random() * 30),
      scale: Math.random() * 1.5 + 0.5,
      opacity: 1
    }));
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Animate sweep indicator
  useEffect(() => {
    if (!isDrillActive) return;

    const tick = () => {
      if (currentRank === 'front') {
        // Sweeping Bar
        setSweepValue(prev => {
          let next = prev + (sweepDirection === 'up' ? 2.5 : -2.5);
          if (next >= 100) {
            setSweepDirection('down');
            next = 100;
          } else if (next <= 0) {
            setSweepDirection('up');
            next = 0;
          }
          return next;
        });
      } else if (currentRank === 'middle') {
        // Shrinking Aim Focus Circle
        setAimScale(prev => {
          let next = prev + (aimDirection === 'shrink' ? -0.04 : 0.04);
          if (next <= 0.4) {
            setAimDirection('grow');
            next = 0.4;
          } else if (next >= 2.2) {
            setAimDirection('shrink');
            next = 2.2;
          }
          return next;
        });
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDrillActive, currentRank, sweepDirection, aimDirection]);

  // Handle particle lifecycle
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, y: p.y - 1.5, opacity: p.opacity - 0.08, scale: p.scale + 0.1 }))
          .filter(p => p.opacity > 0)
      );
    }, 45);
    return () => clearInterval(interval);
  }, [particles]);

  const startDrill = () => {
    setIsDrillActive(true);
    setCurrentRank('front');
    setSweepValue(0);
    setSweepDirection('up');
    setAimScale(2.0);
    setAimDirection('shrink');
    setDrillScore(0);
    setConsecutiveHits(0);
    setFeedbackText('FRONT RANK: KNEEL! Get ready to match the sweep range!');
  };

  const stopDrill = () => {
    setIsDrillActive(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const handleRankFireClick = () => {
    if (!isDrillActive) return;

    if (currentRank === 'front') {
      // Sweeping bar target: 70% to 85% is ideal sweet spot
      const success = sweepValue >= 70 && sweepValue <= 88;
      triggerSmoke(120, 100);

      if (success) {
        setDrillScore(prev => prev + 35);
        setConsecutiveHits(prev => prev + 1);
        setFeedbackText('✨ PERFECT RELEASES! Front rank fired solid row volley! MIDDLE RANK: AIM!');
        setCurrentRank('middle');
        setAimScale(2.0);
        setAimDirection('shrink');
      } else {
        setConsecutiveHits(0);
        setFeedbackText('💨 MISSED TIMING! Misfire or premature lock flash. Middle rank taking over...');
        setCurrentRank('middle');
        setAimScale(2.0);
        setAimDirection('shrink');
      }
    } else if (currentRank === 'middle') {
      // Aim circle target scale: 0.8 to 1.1 is perfect
      const success = aimScale >= 0.75 && aimScale <= 1.15;
      triggerSmoke(240, 100);

      if (success) {
        setDrillScore(prev => prev + 45);
        setConsecutiveHits(prev => prev + 1);
        setFeedbackText('🎯 DIRECT SHOT! Middle rank muskets unleashed! REAR RANK: RECTIFY WEAPONRY!');
        setCurrentRank('rear');
      } else {
        setConsecutiveHits(0);
        setFeedbackText('❌ WIDE SCATTER! Shot flew over the enemy lines. Rear rank stepping up...');
        setCurrentRank('rear');
      }
    }
  };

  // Reload click tap game
  const [reloadClicks, setReloadClicks] = useState<number>(0);
  const handleReloadClick = () => {
    if (reloadClicks >= 6) {
      triggerSmoke(360, 120);
      setDrillScore(prev => prev + 50);
      const hitStreak = consecutiveHits + 1;
      setConsecutiveHits(hitStreak);
      
      const scoreGained = drillScore + 50;
      setFeedbackText(`🎉 CONGRATULATIONS! Complete 3-Rank fire succession executed flawlessly! Final Score: ${scoreGained} pts`);
      
      // Apply campaign rewards if they scored high
      if (scoreGained >= 100) {
        onApplyRewards({
          gold: 5000,
          morale: 12,
          text: `Flawless Flintlock Barracks drill session! Gained +5,000 Gold Subsidies and +12 Camp Morale!`
        });
      } else {
        onApplyRewards({
          gold: 2000,
          morale: 5,
          text: `Drill training complete! Sirdar rewarded your efforts with +2,000 Gold and +5 Morale.`
        });
      }
      
      setReloadClicks(0);
      setIsDrillActive(false);
    } else {
      setReloadClicks(prev => prev + 1);
    }
  };

  return (
    <div id="flintlock-drill-simulator" className="bg-stone-900/40 border border-stone-850 p-6 rounded-sm text-left shadow-lg space-y-6 relative overflow-hidden">
      {/* Spark particles overlay */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-400"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.scale * 6}px`,
              height: `${p.scale * 6}px`,
              opacity: p.opacity,
              boxShadow: '0 0 8px #f59e0b',
              transition: 'transform 0.05s linear'
            }}
          />
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-850 pb-4">
        <div>
          <span className="text-[10px] text-saffron uppercase font-mono tracking-widest font-black flex items-center gap-1.5 animate-pulse">
            <Sparkles size={12} className="text-saffron" />
            BARRACKS MANUAL DRILL DECK
          </span>
          <h3 className="font-serif text-lg text-white font-black uppercase mt-1">
            Grand Academy Flintlock Drill grounds
          </h3>
          <p className="text-xs text-stone-400 font-serif italic mt-0.5">
            "Keep the line straight, lock the frizzen tight, and discharge as one unified firestorm!"
          </p>
        </div>

        <div className="flex bg-stone-950 p-1 border border-stone-800 rounded-xs self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => setActiveDrill('rank-fire')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-[9px] font-mono uppercase font-black tracking-wider transition-all rounded-xs cursor-pointer ${
              activeDrill === 'rank-fire'
                ? 'bg-saffron text-stone-950 font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            🔥 Flintlock Rank-Fire
          </button>
          <button
            type="button"
            onClick={() => setActiveDrill('calibration')}
            className={`flex-1 md:flex-none px-4 py-1.5 text-[9px] font-mono uppercase font-black tracking-wider transition-all rounded-xs cursor-pointer ${
              activeDrill === 'calibration'
                ? 'bg-saffron text-stone-950 font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            🎯 Artillery Calibration
          </button>
        </div>
      </div>

      {activeDrill === 'rank-fire' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visual Simulator Canvas / Representation */}
            <div className="md:col-span-8 h-64 bg-stone-950 rounded border border-stone-800 p-4 relative overflow-hidden flex flex-col justify-between">
              {/* Sunbeam and smoke overlay backgrounds */}
              <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-2 right-2 flex items-center gap-2 font-mono text-[9px]">
                <span className="text-stone-500">CONSECUTIVE HITS:</span>
                <span className="text-saffron font-bold">{consecutiveHits} 🔥</span>
              </div>

              {/* Top info and score */}
              <div className="flex justify-between items-center relative z-10">
                <span className="px-2 py-0.5 bg-stone-900 border border-stone-800 text-stone-300 font-mono text-[9px] rounded uppercase font-bold">
                  TACTICAL DRILL SIMULATION
                </span>
                <span className="font-mono text-xs text-saffron font-black">
                  DRILL SCORE: {drillScore} PTS
                </span>
              </div>

              {/* Core interactive drill display */}
              <div className="flex-1 flex flex-col justify-center items-center relative z-10 py-4">
                {!isDrillActive ? (
                  <div className="text-center space-y-3">
                    <Flame className="w-10 h-10 text-saffron mx-auto animate-pulse" />
                    <h4 className="font-serif text-sm text-white uppercase font-black tracking-wider">
                      Musketry Line Not Commenced
                    </h4>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                      Train with your platoon to master rhythmic reloading. A sequence of 3 ranks must be successfully synchronized to gain military honors!
                    </p>
                    <button
                      type="button"
                      onClick={startDrill}
                      className="px-5 py-2 bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black uppercase text-[10px] tracking-widest rounded-xs cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      ⚡ START MUSKETRY DRILL
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-6">
                    {/* Soldier Regiment Silhouettes Represented through high-contrast graphics */}
                    <div className="flex justify-center items-end gap-16 h-20">
                      {/* Front Rank */}
                      <div className="flex flex-col items-center">
                        <span className={`text-4xl transition-all duration-300 ${currentRank === 'front' ? 'scale-125 filter drop-shadow-[0_0_8px_#f59e0b]' : 'opacity-40 filter grayscale'}`}>
                          🧎‍♂️
                        </span>
                        <span className="text-[8px] font-mono text-stone-500 mt-1 uppercase">FRONT RANK</span>
                      </div>

                      {/* Middle Rank */}
                      <div className="flex flex-col items-center">
                        <span className={`text-4xl transition-all duration-300 ${currentRank === 'middle' ? 'scale-125 filter drop-shadow-[0_0_8px_#f59e0b]' : 'opacity-40 filter grayscale'}`}>
                          🧍‍♂️
                        </span>
                        <span className="text-[8px] font-mono text-stone-500 mt-1 uppercase">MIDDLE RANK</span>
                      </div>

                      {/* Rear Rank */}
                      <div className="flex flex-col items-center">
                        <span className={`text-4xl transition-all duration-300 ${currentRank === 'rear' ? 'scale-125 filter drop-shadow-[0_0_8px_#f59e0b]' : 'opacity-40 filter grayscale'}`}>
                          🚴‍♂️
                        </span>
                        <span className="text-[8px] font-mono text-stone-500 mt-1 uppercase">REAR RANK</span>
                      </div>
                    </div>

                    {/* Active Minigame mechanic overlay */}
                    <div className="max-w-md mx-auto">
                      {currentRank === 'front' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[8px] font-mono text-stone-400 uppercase">
                            <span>RELOAD DEPOT</span>
                            <span className="text-saffron font-bold">FIRE ZONE (70% - 88%)</span>
                            <span>PEAK POWER</span>
                          </div>
                          <div className="h-6 w-full bg-stone-900 rounded border border-stone-800 relative overflow-hidden">
                            {/* Target Zone */}
                            <div className="absolute top-0 bottom-0 left-[70%] right-[12%] bg-emerald-500/20 border-x-2 border-emerald-500/40 flex items-center justify-center">
                              <span className="text-[7.5px] text-emerald-400 font-mono font-black">RELEASE!</span>
                            </div>
                            {/* Sweeping bar indicator */}
                            <div
                              className="absolute top-0 bottom-0 w-1.5 bg-saffron shadow-[0_0_10px_#f59e0b] transition-all duration-75"
                              style={{ left: `${sweepValue}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {currentRank === 'middle' && (
                        <div className="flex flex-col items-center space-y-2">
                          <span className="text-[8px] font-mono text-stone-400 uppercase">SYNCHRONIZE INNER AIM CIRCLE (MATCH SCALES!)</span>
                          <div className="h-20 w-20 rounded-full border-2 border-dashed border-stone-700 flex items-center justify-center relative">
                            {/* Dynamic Aim circle */}
                            <div
                              className={`rounded-full border-4 ${aimScale >= 0.75 && aimScale <= 1.15 ? 'border-emerald-500' : 'border-saffron'} absolute transition-all duration-75`}
                              style={{
                                width: `${aimScale * 40}px`,
                                height: `${aimScale * 40}px`,
                                opacity: 0.8
                              }}
                            />
                            {/* Inner Target circle */}
                            <div className="h-10 w-10 rounded-full bg-[#8B5E3C]/20 border-2 border-[#8B5E3C] flex items-center justify-center">
                              <Target className="w-5 h-5 text-saffron" />
                            </div>
                          </div>
                        </div>
                      )}

                      {currentRank === 'rear' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[8.5px] font-mono text-stone-400 uppercase">
                            <span>FILL POWDER CARTRIDGES</span>
                            <span className="text-saffron font-bold">{reloadClicks} / 6 DISCHARGES COMPLETE</span>
                          </div>
                          <div className="h-4 w-full bg-stone-900 rounded border border-stone-800 relative overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-saffron to-amber-600 transition-all duration-150"
                              style={{ width: `${(reloadClicks / 6) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt and description feedback */}
              <div className="relative z-10 bg-stone-900/90 p-2.5 rounded border border-stone-800/60 text-center font-mono text-[9.5px] text-stone-300">
                {feedbackText}
              </div>
            </div>

            {/* Left Action and manual logs column */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-stone-950 p-4 rounded border border-stone-850 space-y-3.5">
                <span className="text-[9px] font-mono uppercase text-stone-500 font-bold block">
                  DRILL BARB WIRE COMMANDS:
                </span>

                <div className="space-y-2">
                  <button
                    disabled={!isDrillActive || currentRank === 'rear'}
                    type="button"
                    onClick={handleRankFireClick}
                    className="w-full py-3 bg-red-950/40 hover:bg-red-900 border-2 border-red-700/60 text-red-200 font-mono text-xs font-black uppercase tracking-wider rounded-xs cursor-pointer transition-all disabled:opacity-30 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    🔥 TRIGGER DISCHARGE
                  </button>

                  <button
                    disabled={!isDrillActive || currentRank !== 'rear'}
                    type="button"
                    onClick={handleReloadClick}
                    className="w-full py-3 bg-emerald-950/40 hover:bg-emerald-900 border-2 border-emerald-700/60 text-emerald-200 font-mono text-xs font-black uppercase tracking-wider rounded-xs cursor-pointer transition-all disabled:opacity-30 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    ⚡ RAM & RECHARGE CARTRIDGE
                  </button>
                </div>

                <div className="border-t border-stone-900 pt-3 flex justify-between items-center">
                  <span className="text-[8.5px] font-mono text-stone-400 uppercase">Emergency Safety:</span>
                  <button
                    onClick={stopDrill}
                    disabled={!isDrillActive}
                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-white font-mono text-[8.5px] border border-stone-800 rounded cursor-pointer disabled:opacity-20"
                  >
                    ⏹️ HALT DRILL
                  </button>
                </div>
              </div>

              {/* Explanatory tips box */}
              <div className="p-3 bg-[#1c120c] border border-[#8B5E3C]/30 text-stone-300 rounded-sm text-xs leading-relaxed space-y-1 font-serif">
                <h4 className="font-mono text-[8.5px] font-black text-saffron uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="text-saffron shrink-0" size={12} /> Drill Tip & Calibration
                </h4>
                <p className="text-[10px] leading-normal italic text-stone-400">
                  "Wait for the bar to slide exactly within the highlighted green zone (70%-88%) before clicking Trigger Discharge. Once inside middle rank aiming, lock focus when the flashing circle matches the center ring size!"
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-stone-950 rounded border border-stone-800 text-center space-y-4">
          <div className="max-w-md mx-auto space-y-2">
            <Target className="w-10 h-10 text-saffron mx-auto animate-bounce" />
            <h4 className="font-serif text-base text-white uppercase font-black">Professional Artillery Alignment</h4>
            <p className="text-xs text-stone-400 leading-relaxed font-sans">
              Train with General Ibrahim Khan Gardi's elite 9-pounder brass batteries to calibrate mortar impact angles, boost gunpowder charge calculations, and permanently secure high precision explosive ratings on active battlefields.
            </p>
          </div>

          <div className="border border-stone-850 p-4 rounded-sm bg-stone-900/25">
            <p className="text-xs font-mono text-stone-300 italic">
              "The Artillery Calibration simulator is fully primed for high-grade field tests."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
