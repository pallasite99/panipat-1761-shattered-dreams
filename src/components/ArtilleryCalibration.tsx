import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Shield, Compass, Wind, RotateCcw, Award, AlertTriangle } from 'lucide-react';
import { panipatAudioEngine } from '../utils/audioSystem';

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

  // Canvas References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

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

  // Draw static state of canvas
  useEffect(() => {
    if (isFiring) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#0c0a09'); // stone-950
    skyGrad.addColorStop(1, '#1c1917'); // stone-900
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mountains in background
    ctx.fillStyle = '#292524'; // stone-800
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.lineTo(150, 130);
    ctx.lineTo(300, 220);
    ctx.lineTo(450, 110);
    ctx.lineTo(650, 220);
    ctx.lineTo(800, 140);
    ctx.lineTo(800, 220);
    ctx.lineTo(0, 220);
    ctx.fill();

    // Draw ground
    ctx.fillStyle = '#44403c'; // stone-700
    ctx.fillRect(0, 195, canvas.width, canvas.height - 195);
    ctx.fillStyle = '#78716c'; // stone-500
    ctx.fillRect(0, 195, canvas.width, 3); // top grass-line border

    // Draw Target Fort at target position
    const targetX = 400 + ((targetDistance - 800) / 700) * 320;
    
    // Draw Fort
    ctx.fillStyle = '#8b5e3c'; // outline brown
    ctx.fillRect(targetX - 25, 125, 50, 70); // Main tower
    ctx.fillStyle = '#a37c5d'; // lighter brown fill
    ctx.fillRect(targetX - 22, 128, 44, 67);
    
    // Battlement steps
    ctx.fillStyle = '#8b5e3c';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(targetX - 25 + i * 15, 115, 8, 10);
    }
    // Dome/Minaret
    ctx.beginPath();
    ctx.arc(targetX, 115, 15, Math.PI, 0);
    ctx.fillStyle = '#d4af37'; // gold dome
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#8b5e3c';
    ctx.stroke();

    // Banner pole and red banner
    ctx.strokeStyle = '#8b5e3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(targetX, 100);
    ctx.lineTo(targetX, 80);
    ctx.stroke();
    
    ctx.fillStyle = '#dc2626'; // Red flag
    ctx.beginPath();
    ctx.moveTo(targetX, 80);
    ctx.lineTo(targetX - 15, 87);
    ctx.lineTo(targetX, 95);
    ctx.fill();

    // Draw Cannon on the left (x=60, y=190)
    ctx.save();
    ctx.translate(60, 190);
    
    // Draw wheels
    ctx.fillStyle = '#451a03'; // brown wood
    ctx.beginPath();
    ctx.arc(0, 5, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8b5e3c';
    ctx.stroke();

    // Draw barrel at elevation angle
    ctx.rotate(-(elevation * Math.PI) / 180);
    ctx.fillStyle = '#78716c'; // brass/iron metal
    ctx.fillRect(-10, -5, 30, 8); // barrel body
    ctx.fillStyle = '#d4af37'; // gold muzzle ring
    ctx.fillRect(18, -6, 4, 10);
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.arc(-10, -1, 4, 0, Math.PI * 2); // breech knob
    ctx.fill();

    ctx.restore();

    // Draw Wind flag at top right (x=730, y=40)
    ctx.save();
    ctx.translate(730, 40);
    ctx.strokeStyle = '#a38d7c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 50);
    ctx.stroke();

    // Wave flag based on wind
    ctx.fillStyle = windSpeed > 0 ? '#60a5fa' : '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, 5);
    const flagLength = windSpeed * 2.2;
    ctx.lineTo(flagLength, 15);
    ctx.lineTo(0, 25);
    ctx.fill();
    ctx.restore();
  }, [elevation, targetDistance, windSpeed, isFiring]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleFireCannon = () => {
    if (attempts <= 0 || isFiring || victoryConfirmed) return;

    setIsFiring(true);
    panipatAudioEngine.playExplosion();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ballistics setup
    let speed = 9;
    if (powderCharge === 'Heavy (4 lbs)') speed = 11.5;
    if (powderCharge === 'Reduced (2 lbs)') speed = 6.8;

    const angleRad = (elevation * Math.PI) / 180;
    
    let px = 60 + Math.cos(angleRad) * 20;
    let py = 190 - Math.sin(angleRad) * 20;
    let pvx = speed * Math.cos(angleRad);
    let pvy = -speed * Math.sin(angleRad);
    
    // Wind drift aim offset
    pvx += windAim * 0.05;

    const targetX = 400 + ((targetDistance - 800) / 700) * 320;
    const trail: Array<{ x: number; y: number; size: number }> = [];
    const simulation = calculateTargetPhysics();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0c0a09');
      skyGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw mountains
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(0, 220);
      ctx.lineTo(150, 130);
      ctx.lineTo(300, 220);
      ctx.lineTo(450, 110);
      ctx.lineTo(650, 220);
      ctx.lineTo(800, 140);
      ctx.lineTo(800, 220);
      ctx.lineTo(0, 220);
      ctx.fill();

      // Draw ground
      ctx.fillStyle = '#44403c';
      ctx.fillRect(0, 195, canvas.width, canvas.height - 195);
      ctx.fillStyle = '#78716c';
      ctx.fillRect(0, 195, canvas.width, 3);

      // Draw Fort
      ctx.fillStyle = '#8b5e3c';
      ctx.fillRect(targetX - 25, 125, 50, 70);
      ctx.fillStyle = '#a37c5d';
      ctx.fillRect(targetX - 22, 128, 44, 67);
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(targetX - 25 + i * 15, 115, 8, 10);
      }
      ctx.beginPath();
      ctx.arc(targetX, 115, 15, Math.PI, 0);
      ctx.fillStyle = '#d4af37';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#8b5e3c';
      ctx.stroke();
      ctx.strokeStyle = '#8b5e3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(targetX, 100);
      ctx.lineTo(targetX, 80);
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(targetX, 80);
      ctx.lineTo(targetX - 15, 87);
      ctx.lineTo(targetX, 95);
      ctx.fill();

      // Draw Cannon
      ctx.save();
      ctx.translate(60, 190);
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(0, 5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.rotate(-angleRad);
      ctx.fillStyle = '#78716c';
      ctx.fillRect(-10, -5, 30, 8);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(18, -6, 4, 10);
      ctx.fillStyle = '#3f3f46';
      ctx.beginPath();
      ctx.arc(-10, -1, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Wind Flag
      ctx.save();
      ctx.translate(730, 40);
      ctx.strokeStyle = '#a38d7c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 50);
      ctx.stroke();
      ctx.fillStyle = windSpeed > 0 ? '#60a5fa' : '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(windSpeed * 2.2, 15);
      ctx.lineTo(0, 25);
      ctx.fill();
      ctx.restore();

      // Physics progression
      pvy += 0.14; // gravity
      pvx += windSpeed * 0.003; // horizontal wind forces
      px += pvx;
      py += pvy;

      // Add trail particles
      trail.push({ x: px, y: py, size: 2.5 + Math.random() * 2 });
      if (trail.length > 25) trail.shift();

      // Draw trail
      trail.forEach((t, i) => {
        ctx.fillStyle = `rgba(251, 153, 51, ${i / trail.length * 0.7})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * (i / trail.length), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw cannonball
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff9933';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Hit boundary check
      if (py >= 195) {
        panipatAudioEngine.playExplosion();
        triggerExplosionAnimation(px, py, targetX, simulation);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const triggerExplosionAnimation = (impactX: number, impactY: number, tX: number, sim: any) => {
      let frame = 0;
      const particles = Array.from({ length: 25 }).map(() => {
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * 5 + 1.5;
        return {
          x: impactX,
          y: impactY,
          vx: Math.cos(a) * sp,
          vy: -Math.abs(Math.sin(a) * sp) - 0.8,
          color: Math.random() > 0.4 ? '#ff9933' : '#dc2626',
          size: Math.random() * 3.5 + 1.5,
          alpha: 1
        };
      });

      const playExplosion = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw static bg, mountains, ground
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, '#0c0a09');
        skyGrad.addColorStop(1, '#1c1917');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.moveTo(0, 220);
        ctx.lineTo(150, 130);
        ctx.lineTo(300, 220);
        ctx.lineTo(450, 110);
        ctx.lineTo(650, 220);
        ctx.lineTo(800, 140);
        ctx.lineTo(800, 220);
        ctx.lineTo(0, 220);
        ctx.fill();

        ctx.fillStyle = '#44403c';
        ctx.fillRect(0, 195, canvas.width, canvas.height - 195);
        ctx.fillStyle = '#78716c';
        ctx.fillRect(0, 195, canvas.width, 3);

        // Draw Fort with camera shake if direct hit
        const fortShake = sim.isHit ? (Math.random() * 6 - 3) * Math.max(0, (1 - frame/20)) : 0;
        ctx.fillStyle = '#8b5e3c';
        ctx.fillRect(tX - 25 + fortShake, 125, 50, 70);
        ctx.fillStyle = '#a37c5d';
        ctx.fillRect(tX - 22 + fortShake, 128, 44, 67);
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(tX - 25 + i * 15 + fortShake, 115, 8, 10);
        }
        ctx.beginPath();
        ctx.arc(tX + fortShake, 115, 15, Math.PI, 0);
        ctx.fillStyle = '#d4af37';
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tX + fortShake, 100);
        ctx.lineTo(tX + fortShake, 80);
        ctx.stroke();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(tX + fortShake, 80);
        ctx.lineTo(tX - 15 + fortShake, 87);
        ctx.lineTo(tX + fortShake, 95);
        ctx.fill();

        // Draw Cannon
        ctx.save();
        ctx.translate(60, 190);
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, 5, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.rotate(-angleRad);
        ctx.fillStyle = '#78716c';
        ctx.fillRect(-10, -5, 30, 8);
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(18, -6, 4, 10);
        ctx.fillStyle = '#3f3f46';
        ctx.beginPath();
        ctx.arc(-10, -1, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Wind Flag
        ctx.save();
        ctx.translate(730, 40);
        ctx.strokeStyle = '#a38d7c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 50);
        ctx.stroke();
        ctx.fillStyle = windSpeed > 0 ? '#60a5fa' : '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(windSpeed * 2.2, 15);
        ctx.lineTo(0, 25);
        ctx.fill();
        ctx.restore();

        // Update and draw explosion particles
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.alpha -= 0.04;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // Draw expanding dust ring
        ctx.strokeStyle = `rgba(251, 191, 36, ${Math.max(0, 1 - frame/20)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(impactX, impactY, frame * 3.0, 0, Math.PI * 2);
        ctx.stroke();

        frame++;
        if (frame < 20) {
          animationRef.current = requestAnimationFrame(playExplosion);
        } else {
          resolveShot(sim);
        }
      };

      playExplosion();
    };

    animationRef.current = requestAnimationFrame(animate);
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
      localStorage.setItem('achieve_artillery', 'true');
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
          <div className="relative border border-stone-850 rounded-sm overflow-hidden bg-stone-950 h-[220px]">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={220} 
              className="w-full h-full block"
            />
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
