import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Shield, Compass, Wind, RotateCcw, Award, AlertTriangle } from 'lucide-react';

interface ArtilleryCalibrationProps {
  onClose: () => void;
  onApplyRewards: (rewards: { gold: number; morale: number; text: string }) => void;
}

export const ArtilleryCalibration: React.FC<ArtilleryCalibrationProps> = ({
  onClose,
  onApplyRewards
}) => {
  // Cannon Physics Variables
  const [elevation, setElevation] = useState<number>(20); // Slider: 5 to 45 degrees
  const [powderCharge, setPowderCharge] = useState<'Standard (3 lbs)' | 'Heavy (4 lbs)' | 'Reduced (2 lbs)'>('Standard (3 lbs)');
  const [windAim, setWindAim] = useState<number>(0); // Wind offset slider: -15 to +15 milliradians
  
  // Current Target Scenario
  const [targetDistance, setTargetDistance] = useState<number>(1150); // random distance in yards (800 - 1500)
  const [windSpeed, setWindSpeed] = useState<number>(12); // wind in mph (-25 to +25, positive is blowing east/right)
  const [attempts, setAttempts] = useState<number>(3);
  
  // Animation states
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [fireProgress, setFireProgress] = useState<number>(0);
  const [shotsFired, setShotsFired] = useState<Array<{ elevation: number; charge: string; horizontalErr: number; verticalErr: number; hit: boolean }>>([]);
  
  // Game Outcomes
  const [currentResult, setCurrentResult] = useState<'idle' | 'miss_short' | 'miss_long' | 'miss_wind' | 'direct_hit'>('idle');
  const [victoryConfirmed, setVictoryConfirmed] = useState<boolean>(false);

  // Initialize fresh dynamic coordinates
  useEffect(() => {
    setTargetDistance(Math.floor(Math.random() * 600) + 900); // 900 to 1500 yards
    setWindSpeed(Math.floor(Math.random() * 36) - 18); // -18 to +18 mph
  }, []);

  const handleResetTest = () => {
    setElevation(20);
    setPowderCharge('Standard (3 lbs)');
    setWindAim(0);
    setAttempts(3);
    setShotsFired([]);
    setCurrentResult('idle');
    setVictoryConfirmed(false);
    setTargetDistance(Math.floor(Math.random() * 600) + 900);
    setWindSpeed(Math.floor(Math.random() * 36) - 18);
  };

  const calculateTargetPhysics = () => {
    // 9-pounder brass cannon custom ballistics
    let initialVelocity = 380; // yards per second roughly
    if (powderCharge === 'Heavy (4 lbs)') initialVelocity = 440;
    if (powderCharge === 'Reduced (2 lbs)') initialVelocity = 310;

    // Standard physics approximation for interactive gun calibration
    // Range roughly = (V^2 * sin(2*theta)) / gravity
    const gravityY = 9.8;
    const thetaRad = (elevation * Math.PI) / 180;
    const calculatedRawRange = ((initialVelocity * initialVelocity) * Math.sin(2 * thetaRad)) / gravityY;
    
    // Adjust range representation to our campaign grid
    const expectedImpactYards = Math.floor(calculatedRawRange * 0.12);
    
    // Wind drift calculations
    // Each mph of wind speed drifts the shell by 8 yards. Positive wind drifts right, so we need negative windAim to balance.
    const windDriftYards = windSpeed * 7.5;
    const counterAimCorrection = windAim * -11.5;
    const netHorizontalOffset = windDriftYards + counterAimCorrection;

    const rangeDifference = expectedImpactYards - targetDistance;
    const isVerticalHit = Math.abs(rangeDifference) <= 25;
    const isHorizontalHit = Math.abs(netHorizontalOffset) <= 30;

    return {
      impactDistance: expectedImpactYards,
      verticalError: rangeDifference,
      horizontalError: netHorizontalOffset,
      isHit: isVerticalHit && isHorizontalHit,
      short: rangeDifference < -25,
      long: rangeDifference > 25,
      windMiss: !isHorizontalHit
    };
  };

  const handleFireCannon = () => {
    if (attempts <= 0 || isFiring || victoryConfirmed) return;

    setIsFiring(true);
    setFireProgress(0);

    const simulation = calculateTargetPhysics();

    // Trigger projectile arc countdown animation
    const interval = setInterval(() => {
      setFireProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          resolveShot(simulation);
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  const resolveShot = (sim: ReturnType<typeof calculateTargetPhysics>) => {
    setIsFiring(false);
    setAttempts(prev => prev - 1);

    const newShot = {
      elevation,
      charge: powderCharge,
      horizontalErr: sim.horizontalError,
      verticalErr: sim.verticalError,
      hit: sim.isHit
    };

    setShotsFired(prev => [...prev, newShot]);

    if (sim.isHit) {
      setCurrentResult('direct_hit');
      setVictoryConfirmed(true);
    } else if (sim.windMiss && Math.abs(sim.horizontalError) > Math.abs(sim.verticalError)) {
      setCurrentResult('miss_wind');
    } else if (sim.short) {
      setCurrentResult('miss_short');
    } else {
      setCurrentResult('miss_long');
    }
  };

  const handleClaimArtilleryBonus = () => {
    if (victoryConfirmed) {
      onApplyRewards({
        gold: 18000,
        morale: 25,
        text: "Artillery Calibration Excellence: Ibrahim Khan Gardi's heavy 9-pounder brass cannons recorded massive hits on enemy redoubts (+18,000 Gold Treasury, +25% Troop Morale)."
      });
    } else {
      onApplyRewards({
        gold: 0,
        morale: -10,
        text: "Cannon Battery Recalibrated: Fledgling artillery rounds failed to hit fortifications before batteries overheated."
      });
    }
    onClose();
  };

  const physics = calculateTargetPhysics();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div id="artillery-calibration-modal" className="w-full max-w-4xl bg-stone-900 border-4 border-saffron rounded-sm relative flex flex-col max-h-[92vh] text-[#F3E5AB]">
        
        {/* Header bar */}
        <div className="p-4 border-b border-saffron/30 bg-stone-950 flex justify-between items-center font-serif">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div className="text-left">
              <h3 className="text-lg font-black uppercase text-saffron tracking-widest">French Artillery Battery Calibration</h3>
              <p className="text-[10px] text-stone-400 font-sans italic">"direct calculations for ibrahim khan gardi's 9-pounder ordnance under heavy wind currents"</p>
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
          
          {/* Target Status Board */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-stone-950 p-3 border border-stone-850 rounded-sm text-left">
              <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold">Fort Outpost Location</span>
              <span className="text-xs font-serif font-black text-white flex items-center gap-1.5 mt-1">
                <Target size={12} className="text-red-500" />
                {targetDistance} YARDS
              </span>
            </div>

            <div className="bg-stone-950 p-3 border border-stone-850 rounded-sm text-left">
              <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold">Yamuna Crosswind</span>
              <span className="text-xs font-serif font-black text-white flex items-center gap-1.5 mt-1">
                <Wind size={12} className={windSpeed > 0 ? "text-blue-400" : "text-amber-400"} />
                {Math.abs(windSpeed)} MPH {windSpeed > 0 ? '→ EAST (DRIFT RIGHT)' : windSpeed < 0 ? '← WEST (DRIFT LEFT)' : 'STILL'}
              </span>
            </div>

            <div className="bg-stone-950 p-3 border border-stone-850 rounded-sm text-left">
              <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold">Heavy Ammunition</span>
              <span className="text-xs font-serif font-black text-white block mt-1">
                {attempts} COMPASS SHELLS LEFT
              </span>
            </div>

            <div className="bg-stone-950 p-3 border border-stone-850 rounded-sm text-left flex items-center justify-between">
              <div>
                <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold">Calibration Status</span>
                <span className={`text-[10px] font-black uppercase tracking-wider block mt-1 ${victoryConfirmed ? 'text-green-400' : 'text-amber-500'}`}>
                  {victoryConfirmed ? 'CALIBRATED ✓' : 'UNCALIBRATED'}
                </span>
              </div>
              <button
                onClick={handleResetTest}
                title="Reset Coordinates"
                className="p-1 px-1.5 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded-xs transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
              </button>
            </div>

          </div>

          {/* Canvas trajectory visualization */}
          <div className="h-44 bg-stone-950 border border-stone-850 rounded-sm relative overflow-hidden flex flex-col justify-end p-4">
            <div className="absolute top-2 left-2 text-[9px] font-mono text-stone-500 uppercase font-black">
              Battery Fire trajectory preview
            </div>

            {/* Simulated projectile animation trajectory */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {isFiring && (
                <motion.path
                  d={`M 50,150 Q ${200 + (elevation * 3)},${150 - (elevation * 4)} ${200 + (physics.impactDistance / 4)},150`}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeDasharray="6 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: fireProgress / 100 }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              )}
            </svg>

            {/* Ground line components */}
            <div className="w-full h-1.5 bg-stone-900 relative">
              {/* Gardi Brass Cannons */}
              <div className="absolute left-6 -top-5">
                <span className="text-2xl">💣</span>
              </div>

              {/* Target Outpost Fort */}
              <div className="absolute right-12 -top-6">
                <span className="text-3xl">🕌</span>
                <span className="absolute -top-4 left-2.5 text-[8px] bg-red-800 text-white font-mono px-1 rounded-sm uppercase">Fort</span>
              </div>
            </div>
          </div>

          {/* Shell Flight Diagnostics overlay */}
          <AnimatePresence>
            {currentResult !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-xs border text-xs text-left flex gap-3 items-center ${currentResult === 'direct_hit' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-red-950/40 border-red-500/30 text-red-300'}`}
              >
                <div className="text-xl">
                  {currentResult === 'direct_hit' ? '🎯' : '💥'}
                </div>
                <div className="flex-1">
                  <h5 className="font-serif font-black uppercase text-[10px]">
                    {currentResult === 'direct_hit' ? 'DIRECT HIT! TARGET LIQUIDATED!' : 'trajectory diagnostic report'}
                  </h5>
                  <p className="mt-1 font-sans text-[11px] text-stone-200">
                    {currentResult === 'direct_hit' && `Incredible alignment! The 9-pounder brass shot blasted the rampart. Counter-aim correctly matched crosswinds.`}
                    {currentResult === 'miss_short' && `SHOT LANDED SHORT! Impact recorded at ${physics.impactDistance} yards (Short by ${Math.abs(physics.verticalError)} yds). Raise elevations or increase propellant load!`}
                    {currentResult === 'miss_long' && `SHOT OVER-SHOT THE WALLS! Impact recorded at ${physics.impactDistance} yards (Over-shot by ${physics.verticalError} yds). Reduce gun barrel angle!`}
                    {currentResult === 'miss_wind' && `WIND DEFLECTION DEVIATION! Shot drifted horizontally by ${Math.abs(physics.horizontalError).toFixed(0)} yards. Adjust Wind Deflection milliradians counterway!`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual Control Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Control 1: Elevation Angle */}
            <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm text-left">
              <h5 className="font-serif font-bold text-xs uppercase text-saffron flex justify-between">
                <span>1. Muzzle Elevation</span>
                <span className="font-mono text-white">{elevation}°</span>
              </h5>
              <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">Adjust the quadrant screw to raise or lower the brass barrel angle.</p>
              <input
                type="range"
                min="5"
                max="45"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="w-full mt-4 h-1.5 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-saffron"
              />
              <div className="flex justify-between text-[9px] text-stone-600 font-mono mt-1 font-bold">
                <span>5° (Flat)</span>
                <span>25°</span>
                <span>45° (Mortar)</span>
              </div>
            </div>

            {/* Control 2: Gunpowder Propellant size */}
            <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm text-left flex flex-col justify-between">
              <div>
                <h5 className="font-serif font-bold text-xs uppercase text-saffron">2. Charge Weight</h5>
                <p className="text-[10px] text-stone-500 mt-0.5">Choose the silk powder bag weight inserted behind the iron shot.</p>
              </div>

              <div className="space-y-1.5 mt-3">
                {[
                  { name: 'Reduced (2 lbs)', info: 'Shorter range, less barrel heat.' },
                  { name: 'Standard (3 lbs)', info: 'Balanced velocity profile.' },
                  { name: 'Heavy (4 lbs)', info: 'Fires high distances, increased accuracy over wind.' }
                ].map(charge => (
                  <button
                    key={charge.name}
                    onClick={() => setPowderCharge(charge.name as any)}
                    className={`w-full p-1.5 text-left border rounded-xs text-[10px] uppercase font-mono font-black cursor-pointer bg-stone-900 ${powderCharge === charge.name ? 'border-saffron text-saffron bg-saffron/5' : 'border-stone-800 text-stone-400'}`}
                  >
                    {charge.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Horizontal Counter-aim */}
            <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm text-left">
              <div className="flex justify-between items-center">
                <h5 className="font-serif font-bold text-xs uppercase text-saffron">3. Wind deflection drift</h5>
                <span className="font-mono text-[10px] text-white">
                  {windAim > 0 ? `+${windAim}` : windAim} mil
                </span>
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">Calibrate side sights to correct horizontal flight path from Yamuna winds.</p>
              
              <input
                type="range"
                min="-15"
                max="15"
                value={windAim}
                onChange={(e) => setWindAim(Number(e.target.value))}
                className="w-full mt-4 h-1.5 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-saffron"
              />
              <div className="flex justify-between text-[9px] text-stone-600 font-mono mt-1 font-bold">
                <span>-15 mil (Aim West)</span>
                <span>0</span>
                <span>+15 mil (Aim East)</span>
              </div>
            </div>

          </div>

          {/* Trigger Fire actions */}
          <div className="pt-4 border-t border-stone-850 flex gap-4">
            <button
              type="button"
              disabled={isFiring || attempts <= 0 || victoryConfirmed}
              onClick={handleFireCannon}
              className="flex-1 py-3 bg-gradient-to-r from-red-650 to-amber-700 hover:from-red-600 hover:to-orange-600 text-stone-950 font-serif font-black uppercase text-xs tracking-widest rounded-sm cursor-pointer disabled:opacity-30 shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              🔥 DECREE CANNON FIRE!
            </button>

            {(victoryConfirmed || attempts <= 0) && (
              <button
                type="button"
                onClick={handleClaimArtilleryBonus}
                className="px-6 py-3 bg-saffron hover:bg-yellow-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-sm cursor-pointer transition-colors"
              >
                {victoryConfirmed ? 'CLAIM REWARDS & EXIT' : 'ACCEPT OUTCOME & EXIT'}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
