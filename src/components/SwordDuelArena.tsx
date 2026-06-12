import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Swords, AlertTriangle, Zap, LogOut, Award, RefreshCw } from 'lucide-react';
import { panipatAudioEngine } from '../utils/audioSystem';

interface SwordDuelArenaProps {
  opponentName?: string;
  opponentTitle?: string;
  difficulty?: 'recruit' | 'veteran' | 'peshwa';
  onClose: (resolvedHealth: number, outcome: 'victory' | 'defeat' | 'retreat') => void;
}

type StrikeDirection = 'left' | 'right' | 'overhead';
type CombatAction = StrikeDirection | 'parry';

interface DuelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface DuelFloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export const SwordDuelArena: React.FC<SwordDuelArenaProps> = ({
  opponentName = "Jahan Khan",
  opponentTitle = "Grand General of Durrani Vanguard",
  difficulty = "veteran",
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [combatState, setCombatState] = useState<'intro' | 'fighting' | 'victory' | 'defeat'>('intro');

  // Combat status variables
  const [playerHp, setPlayerHp] = useState(100);
  const [playerPosture, setPlayerPosture] = useState(100); // Guard posture: 0 = broken guard
  const [enemyHp, setEnemyHp] = useState(() => {
    if (difficulty === 'recruit') return 80;
    if (difficulty === 'peshwa') return 150;
    return 110;
  });
  const [enemyPosture, setEnemyPosture] = useState(100);

  // Active indicators
  const [enemyTelegraph, setEnemyTelegraph] = useState<{
    direction: StrikeDirection;
    timeLeft: number;
    maxTime: number;
  } | null>(null);

  const [combatLogs, setCombatLogs] = useState<string[]>([
    "⚔️ You draw your pristine Gilded Talwar from its scabbard.",
    `⚔️ Sardar ${opponentName} raises his heavy Afghan steel blade in defiance!`
  ]);

  // Sword anim variables for Canvas drawing
  const playerSwordAngleRef = useRef(-Math.PI / 4);
  const playerSwordXRef = useRef(150);
  const playerSwordYRef = useRef(350);

  const enemySwordAngleRef = useRef(Math.PI / 4 + Math.PI);
  const enemySwordXRef = useRef(450);
  const enemySwordYRef = useRef(150);

  const particlesRef = useRef<DuelParticle[]>([]);
  const floatingTextsRef = useRef<DuelFloatingText[]>([]);
  const screenShakeRef = useRef(0);

  // Keyboard hotkey listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (combatState !== 'fighting') return;
      
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        executeDuelMove('left');
      } else if (key === 'd' || key === 'arrowright') {
        executeDuelMove('right');
      } else if (key === 'w' || key === 'arrowup') {
        executeDuelMove('overhead');
      } else if (key === 's' || key === 'arrowdown' || key === ' ') {
        executeDuelMove('pararry' as any); // fallback mapping
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combatState, playerHp, enemyHp, enemyTelegraph, playerPosture, enemyPosture]);

  // Particle and floating text update loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Clear background & draw stylized arena background
      ctx.fillStyle = '#0f0c0b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Deep sunset radial lighting behind fighters
      const radialGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, 350
      );
      radialGrad.addColorStop(0, 'rgba(100, 32, 12, 0.45)');
      radialGrad.addColorStop(1, 'rgba(15, 12, 11, 0.95)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw elegant boundary lines & dust clouds
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Draw grid perspective lines
      for (let i = 0; i < canvas.width; i += 60) {
        ctx.moveTo(i, 0);
        ctx.lineTo(canvas.width / 2 + (i - canvas.width / 2) * 1.5, canvas.height);
      }
      ctx.stroke();
      
      // Draw flashing telegraph arrow overlays directly on the canvas
      if (enemyTelegraph && combatState === 'fighting') {
        ctx.save();
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(Date.now() * 0.015) * 0.35})`;
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        if (enemyTelegraph.direction === 'left') {
          // Pointing left-to-right down
          ctx.moveTo(80, 160);
          ctx.lineTo(210, 240);
          ctx.moveTo(210, 240);
          ctx.lineTo(175, 240);
          ctx.moveTo(210, 240);
          ctx.lineTo(200, 205);
        } else if (enemyTelegraph.direction === 'right') {
          // Pointing right-to-left down
          ctx.moveTo(500, 160);
          ctx.lineTo(370, 240);
          ctx.moveTo(370, 240);
          ctx.lineTo(405, 240);
          ctx.moveTo(370, 240);
          ctx.lineTo(380, 205);
        } else {
          // Overhead pointing straight down
          ctx.moveTo(290, 75);
          ctx.lineTo(290, 185);
          ctx.moveTo(290, 185);
          ctx.lineTo(275, 160);
          ctx.moveTo(290, 185);
          ctx.lineTo(305, 160);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Screen shake offset calculation
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.save();
        ctx.translate(shakeX, shakeY);
        screenShakeRef.current *= 0.88;
        if (screenShakeRef.current < 0.2) screenShakeRef.current = 0;
      }

      // 2. Draw Fighters silhouettes / clashing sword graphics
      // Player base hand-held coordinates
      ctx.save();
      // Draw Player Shield Icon indicator on the left side
      ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.beginPath();
      ctx.arc(100, 250, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Smooth interpolation for sword physics
      // Draw Player Talwar (curved gilded blade)
      ctx.save();
      ctx.translate(playerSwordXRef.current, playerSwordYRef.current);
      ctx.rotate(playerSwordAngleRef.current);
      
      // Brass Hilt / Cup Guard
      ctx.fillStyle = '#d97706'; // Gold/Brass
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI, true);
      ctx.fill();
      ctx.fillStyle = '#451a03'; // grip
      ctx.fillRect(-4, 0, 8, 22);
      ctx.fillStyle = '#d97706'; // pommel knob
      ctx.beginPath();
      ctx.arc(0, 24, 6, 0, Math.PI * 2);
      ctx.fill();

      // Gilded blade itself
      const bladeGrad = ctx.createLinearGradient(0, -6, 0, -145);
      bladeGrad.addColorStop(0, '#e2e8f0');
      bladeGrad.addColorStop(0.3, '#f1f5f9');
      bladeGrad.addColorStop(0.7, '#cbd5e1');
      bladeGrad.addColorStop(1, '#ffedd5'); // Gilded reflection
      ctx.strokeStyle = bladeGrad;
      ctx.lineWidth = 4.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Beautiful regional curved talwar arc
      ctx.bezierCurveTo(-15, -45, -35, -95, -75, -135);
      ctx.stroke();

      // Sharp blade highlights
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-12, -45, -30, -95, -68, -130);
      ctx.stroke();
      ctx.restore();

      // Draw Enemy Pulwar/Khanda (heavy thick steel blade)
      ctx.save();
      ctx.translate(enemySwordXRef.current, enemySwordYRef.current);
      ctx.rotate(enemySwordAngleRef.current);

      // Steel Pommel & crossguard
      ctx.fillStyle = '#1e293b'; // dark steel grip
      ctx.fillRect(-5, 0, 10, 24);
      ctx.fillStyle = '#475569'; // steel pommel knob
      ctx.beginPath();
      ctx.arc(0, 26, 7, 0, Math.PI * 2);
      ctx.fill();
      // Spike Crossguard
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-22, -3, 44, 6);

      // Dark Steel Blade
      const enemyBladeGrad = ctx.createLinearGradient(0, -6, 0, -155);
      enemyBladeGrad.addColorStop(0, '#334155');
      enemyBladeGrad.addColorStop(0.6, '#475569');
      enemyBladeGrad.addColorStop(1, '#ef4444'); // blood or fire reflection
      ctx.strokeStyle = enemyBladeGrad;
      ctx.lineWidth = 6.2;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(25, -140); // Straight rigid heavy blade
      ctx.stroke();

      // Thick Fuller grove highlight
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(21, -120);
      ctx.stroke();
      ctx.restore();

      // 3. Update & Draw Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // mild gravity
        p.alpha -= p.life;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      // 4. Update & Draw Floating texts
      const fTexts = floatingTextsRef.current;
      for (let i = fTexts.length - 1; i >= 0; i--) {
        const ft = fTexts[i];
        ft.y -= 1.1; // Float upwards
        ft.life -= 0.02;

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 15px monospace';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();

        if (ft.life <= 0) {
          fTexts.splice(i, 1);
        }
      }

      // Restoring shake translations if any
      if (screenShakeRef.current > 0) {
        ctx.restore();
      }

      // Smooth idle sword hover/sway animation frames
      if (combatState === 'fighting') {
        const time = Date.now() * 0.003;
        // Sway player sword gently
        playerSwordAngleRef.current = -Math.PI / 4 + Math.sin(time) * 0.06;
        playerSwordXRef.current = 130 + Math.cos(time * 0.7) * 4;
        playerSwordYRef.current = 280 + Math.sin(time) * 5;

        // Sway enemy sword aggressively
        enemySwordAngleRef.current = Math.PI / 4 + Math.PI + Math.cos(time * 1.3) * 0.08;
        enemySwordXRef.current = 470 + Math.sin(time) * 6;
        enemySwordYRef.current = 150 + Math.cos(time * 0.5) * 4;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [combatState]);

  // Handle enemy's automated telegraph timer
  useEffect(() => {
    if (combatState !== 'fighting') return;

    let timer: any;
    let tickTimer: any;

    const setupNewTelegraph = () => {
      const directions: StrikeDirection[] = ['left', 'right', 'overhead'];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      
      // Difficulty defines reaction window time - tightened for reflex play
      let windowMs = 2000;
      if (difficulty === 'recruit') windowMs = 3000;
      if (difficulty === 'peshwa') windowMs = 950;

      // Play warning snare ruffles to alert the player's reflexes
      panipatAudioEngine.playSnare();

      setEnemyTelegraph({
        direction: randomDirection,
        timeLeft: windowMs,
        maxTime: windowMs
      });

      // Periodic check tick to reduce remaining duration
      tickTimer = setInterval(() => {
        setEnemyTelegraph(prev => {
          if (!prev) return null;
          if (prev.timeLeft <= 100) {
            // TIME OUT! Enemy executes strike because player failed to dodge/parry in time.
            triggerEnemyStrike(prev.direction);
            return null;
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 100
          };
        });
      }, 100);
    };

    // Begin loop
    timer = setTimeout(setupNewTelegraph, 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(tickTimer);
    };
  }, [combatState, enemyTelegraph === null]);

  // Create sparks on the canvas area
  const spawnDuelSparks = (x: number, y: number, color: string = '#f59e0b') => {
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 10;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        life: 0.02 + Math.random() * 0.03
      });
    }
  };

  const addCombatLog = (msg: string) => {
    setCombatLogs(prev => [msg, ...prev.slice(0, 15)]);
  };

  // Enemy timer runs out, executing the predicted strike direction!
  const triggerEnemyStrike = (direction: StrikeDirection) => {
    // Check if player active stance is parrying or blocking.
    // If not, player takes high damage.
    // Let's sweep the enemy's sword downward on canvas to represent a brutal strike
    enemySwordAngleRef.current = Math.PI / 2; // Sweep strike
    enemySwordXRef.current = 260;
    enemySwordYRef.current = 250;

    screenShakeRef.current = 15;

    // Direct damage calculation
    let damage = 25;
    if (difficulty === 'peshwa') damage = 35;
    if (difficulty === 'recruit') damage = 15;

    setPlayerHp(prev => {
      const remaining = Math.max(0, prev - damage);
      if (remaining <= 0) {
        setCombatState('defeat');
        addCombatLog(`💀 You were struck fatally from the ${direction}! Ahmad Shah's guards overwhelm you!`);
      }
      return remaining;
    });

    // Play heavy Nagada thump for taking damage
    panipatAudioEngine.playNagada();

    spawnDuelSparks(240, 240, '#f87171'); // red blood sparks
    floatingTextsRef.current.push({
      x: 180,
      y: 200,
      text: `-${damage} HP!`,
      color: '#ef4444',
      life: 1.0
    });

    addCombatLog(`⚠️ Sardar ${opponentName} struck you with a heavy ${direction} swipe! (-${damage} HP)`);
  };

  // Players chooses a strike direction or special parry
  const executeDuelMove = (action: CombatAction) => {
    if (combatState !== 'fighting') return;

    // Move player blade forward on canvas to show strike
    playerSwordAngleRef.current = Math.PI / 4; 
    playerSwordXRef.current = 320;
    playerSwordYRef.current = 180;

    // Reset blade positions quickly after strike swing
    setTimeout(() => {
      playerSwordAngleRef.current = -Math.PI / 4;
      playerSwordXRef.current = 150;
      playerSwordYRef.current = 350;
    }, 280);

    const matchTelegraph = enemyTelegraph;

    // CASE 1: PLAYER CHOOSES STRATEGIC DIRECT STRIKE
    if (action !== 'parry') {
      // If opponent was preparing to attack from a direction, and we hit them on another side, we bypass guard!
      const isOpponentCharging = matchTelegraph !== null;
      
      if (isOpponentCharging) {
        // Disrupted! If player strikes a side that isn't the telegraph guard side, we deal high damage!
        const didBypass = action !== matchTelegraph.direction;

        if (didBypass) {
          const dmg = Math.round(18 + Math.random() * 12);
          setEnemyHp(prev => {
            const rem = Math.max(0, prev - dmg);
            if (rem <= 0) {
              setCombatState('victory');
              addCombatLog(`⭐ VICTORY! You bypass the commander's guard and disarm him with an epic strike!`);
            }
            return rem;
          });

          // Posture damage
          setEnemyPosture(prev => Math.max(0, prev - 25));

          screenShakeRef.current = 10;
          spawnDuelSparks(360, 180, '#f59e0b'); // gold sparks
          floatingTextsRef.current.push({
            x: 380,
            y: 180,
            text: `HIT! -${dmg} HP`,
            color: '#fbbf24',
            life: 1.0
          });

          addCombatLog(`⚔️ Cleave Bypass! Your ${action} strike cleanly penetrated the commander's stance! (-${dmg} HP)`);
          
          // Clear current threat since enemy was disrupted!
          setEnemyTelegraph(null);
        } else {
          // Clashed! Opponent blocked your sword because they were protected on that sector!
          spawnDuelSparks(300, 210, '#cbd5e1'); // steel block sparks
          setPlayerPosture(p => Math.max(0, p - 15));
          
          floatingTextsRef.current.push({
            x: 280,
            y: 200,
            text: `BLOCKED!`,
            color: '#94a3b8',
            life: 1.0
          });

          addCombatLog(`🛡️ Sardar ${opponentName} successfully locked shields against your ${action} charge!`);
        }
      } else {
        // Opponent is idle/defending - Standard hit
        const standardDmg = Math.round(10 + Math.random() * 6);
        setEnemyHp(prev => {
          const rem = Math.max(0, prev - standardDmg);
          if (rem <= 0) {
            setCombatState('victory');
          }
          return rem;
        });

        spawnDuelSparks(360, 180, '#fb923c');
        floatingTextsRef.current.push({
          x: 380,
          y: 180,
          text: `-${standardDmg}`,
          color: '#f97316',
          life: 1.0
        });

        addCombatLog(`⚔️ Your standard ${action} slash scored a minor cut. (-${standardDmg} HP)`);
      }
    } 
    // CASE 2: PLAYER EXECUTES AN ACTIVE INSTANT PARRY
    else {
      if (matchTelegraph) {
        // Perfect parry block check!
        const reactionFraction = matchTelegraph.timeLeft / matchTelegraph.maxTime;
        
        let perfectParry = false;
        // If timed perfectly in the final fraction of reaction window, it is a glorious riposte!
        if (reactionFraction < 0.45 && reactionFraction > 0.05) {
          perfectParry = true;
        }

        if (perfectParry) {
          // Play clash + extra dramatic high-pitched effects on critical riposte
          panipatAudioEngine.playClash();
          panipatAudioEngine.playSnare();
          
          // Glorious counter shockwave! Posture break the enemy instantly & restore player posture!
          setEnemyPosture(prev => Math.max(0, prev - 45));
          setPlayerPosture(prev => Math.min(100, prev + 25));
          
          // Cause severe collateral damage to enemy
          setEnemyHp(p => Math.max(0, p - 20));

          screenShakeRef.current = 14;
          spawnDuelSparks(300, 220, '#38bdf8'); // blue parry sparks
          
          floatingTextsRef.current.push({
            x: 320,
            y: 200,
            text: `⭐ CRITICAL RIPOSTE!`,
            color: '#38bdf8',
            life: 1.2
          });

          addCombatLog(`⚡ PERFECT PARRY! You deflect the commander's heavy iron blade and riposte! (-20 HP, Posture Broken!)`);
        } else {
          // Play steel block clash sound
          panipatAudioEngine.playClash();
          
          // Standard block deflect
          setPlayerPosture(p => Math.min(100, p + 10));
          setEnemyPosture(p => Math.max(0, p - 15));
          spawnDuelSparks(300, 220, '#a7f3d0'); // green deflect sparks
          
          floatingTextsRef.current.push({
            x: 300,
            y: 200,
            text: `PARRIED`,
            color: '#34d399',
            life: 1.0
          });

          addCombatLog(`🛡️ Guard deflection successful. You safely absorb the enemy's aggressive blade trajectory.`);
        }

        // Neutralize threat!
        setEnemyTelegraph(null);
      } else {
        // Punish wild blind parrying
        panipatAudioEngine.playSnare();
        setPlayerPosture(p => Math.max(0, p - 10));
        addCombatLog(`⚠️ You swung into a defensive parry stance blindly, losing critical guard focus!`);
      }
    }
  };

  const handleRetreat = () => {
    onClose(playerHp, 'retreat');
  };

  const handleConcludeDuel = () => {
    if (combatState === 'victory') {
      localStorage.setItem('achieve_duel', 'true');
    }
    onClose(playerHp, combatState === 'victory' ? 'victory' : 'defeat');
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#070505]/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      
      {/* HEADER BAR */}
      <div className="w-full max-w-[620px] bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border-t-2 border-b-2 border-saffron py-2.5 px-4 flex justify-between items-center mb-3 shadow-xl">
        <div className="flex items-center gap-3">
          <Swords size={20} className="text-saffron animate-pulse" />
          <div className="text-left">
            <h4 className="text-[14px] font-serif font-black text-white leading-none uppercase tracking-wide">
              Close-Combat Talwar Duel Arena
            </h4>
            <span className="text-[8.5px] font-mono text-saffron uppercase tracking-widest leading-none">
              Ahmad Shah's Elite Vanguard Confrontation
            </span>
          </div>
        </div>
        
        {combatState === 'fighting' && (
          <button
            type="button"
            onClick={handleRetreat}
            className="px-2.5 py-1 bg-stone-950 hover:bg-red-950 border border-stone-800 text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400 hover:text-red-300 flex items-center gap-1.5 rounded-xs transition-colors cursor-pointer"
          >
            <LogOut size={11} />
            Tactical Retreat
          </button>
        )}
      </div>

      <div className="w-full max-w-[620px] grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        
        {/* ACTION / VISUAL CANVAS AREA */}
        <div className="md:col-span-8 flex flex-col bg-stone-950 border border-stone-850 p-2 relative rounded-xs shadow-2xl">
          
          {/* STATS BARS HUD OVERLAYS */}
          <div className="absolute top-4 left-4 right-4 flex justify-between gap-5 z-25 pointer-events-none select-none">
            
            {/* Player Side Bar */}
            <div className="flex-1 max-w-[170px] text-left">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[9.5px] font-sans font-black text-white uppercase tracking-tight">Your Talwar Guard</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">{playerHp} HP</span>
              </div>
              <div className="w-full h-2 bg-stone-900 border border-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-150" 
                  style={{ width: `${playerHp}%` }}
                />
              </div>
              {/* Posture Bar */}
              <div className="w-full h-1 bg-stone-900 rounded-full overflow-hidden mt-1 opacity-80">
                <div 
                  className="h-full bg-sky-500 transition-all duration-150" 
                  style={{ width: `${playerPosture}%` }}
                />
              </div>
            </div>

            {/* VS Icon Middle */}
            <div className="w-7 h-7 rounded-full bg-saffron/10 border border-saffron/30 flex items-center justify-center font-serif text-[10px] font-black text-saffron self-center">
              VS
            </div>

            {/* Enemy Side Bar */}
            <div className="flex-1 max-w-[170px] text-right">
              <div className="flex justify-between items-end mb-1 flex-row-reverse">
                <span className="text-[9.5px] font-sans font-black text-white uppercase tracking-tight">{opponentName}</span>
                <span className="text-[10px] font-mono font-bold text-red-400">{enemyHp} HP</span>
              </div>
              <div className="w-full h-2 bg-stone-900 border border-stone-800 rounded-full overflow-hidden flex justify-end">
                <div 
                  className="h-full bg-gradient-to-l from-red-600 to-red-400 transition-all duration-150" 
                  style={{ width: `${(enemyHp / (difficulty === 'peshwa' ? 150 : difficulty === 'recruit' ? 80 : 110)) * 100}%` }}
                />
              </div>
              {/* Posture Bar */}
              <div className="w-full h-1 bg-stone-900 rounded-full overflow-hidden mt-1 opacity-80 flex justify-end">
                <div 
                  className="h-full bg-amber-500 transition-all duration-150" 
                  style={{ width: `${enemyPosture}%` }}
                />
              </div>
            </div>

          </div>

          {/* TELEGRAPH ALERT WARNING */}
          <AnimatePresence>
            {enemyTelegraph && combatState === 'fighting' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-72 pointer-events-none text-center"
              >
                <div className="bg-red-950/90 border-2 border-red-500 rounded-sm px-3 py-1.5 flex flex-col items-center shadow-lg gap-0.5">
                  <div className="flex items-center gap-1.5 text-red-400">
                    <AlertTriangle size={13} className="animate-bounce" />
                    <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest">
                      INCOMING STRIDER!
                    </span>
                  </div>
                  <span className="text-[11px] text-white font-serif font-black uppercase tracking-tight">
                    {enemyTelegraph.direction.toUpperCase()} STRIKE DETECTED!
                  </span>
                  
                  {/* Reaction Clock Slider */}
                  <div className="w-full h-1.5 bg-red-950 border border-red-900 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className="h-full bg-[#f87171] transition-width duration-100 ease-linear"
                      style={{ width: `${(enemyTelegraph.timeLeft / enemyTelegraph.maxTime) * 100}%` }}
                    />
                  </div>

                  <span className="text-[8px] text-stone-400 font-mono tracking-wide uppercase mt-1">
                    [Press opposite strike or tap Defensive Parry button!]
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INTERACTIVE DOCKABLE GRAPHIC CANVAS */}
          <canvas
            ref={canvasRef}
            width={580}
            height={360}
            className="w-full aspect-[58/36] bg-[#0c0807] rounded-xs border border-stone-850"
          />

          {/* COMBAT STATES LAYERS */}
          {combatState === 'intro' && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-saffron font-mono text-[9px] uppercase tracking-[0.3em] mb-2 font-black animate-pulse">
                ★ 18th Century Tactical Combat Arena ★
              </span>
              <h3 className="text-white font-serif text-2xl font-black uppercase tracking-tight mb-2 leading-none">
                CHALLENGED BY SARDAR {opponentName}
              </h3>
              <p className="text-stone-300 font-serif text-xs leading-relaxed max-w-sm italic mb-6">
                "The battlefield dissolves into a circle of dust and swords. Only the fastest blade and perfect defensive parries shall survive this duel."
              </p>

              <button
                type="button"
                onClick={() => setCombatState('fighting')}
                className="px-6 py-2.5 bg-gradient-to-r from-saffron to-[#a15c07] hover:from-[#f59e0b] hover:to-[#b45308] text-stone-950 font-mono text-xs font-black uppercase tracking-widest border border-yellow-250 hover:scale-[1.04] transition-all cursor-pointer flex items-center gap-2 rounded-xs shadow-lg shadow-orange-950/20"
              >
                <Swords size={15} />
                Unsheathe Gilded Talwar
              </button>
            </div>
          )}

          {/* VICTORY OVERLAY screen */}
          {combatState === 'victory' && (
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/95 via-stone-900/95 to-[#0b130a]/95 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                <Award size={28} className="animate-spin" />
              </div>
              <h3 className="text-emerald-400 font-serif text-2xl font-black uppercase tracking-tight mb-1">
                GLORIOUS DUEL VICTORY
              </h3>
              <span className="text-stone-400 text-[8.5px] font-mono uppercase tracking-widest mb-4">
                You vanquished {opponentName}
              </span>
              <p className="text-stone-200 text-xs font-serif leading-relaxed italic max-w-md mb-6">
                With a final, masterful riposte, you redirect his heavy steel pommel and slice his guard. The Afghan vanguard breaks formation in shear panic!
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-xs w-full mb-6 py-3 border-t border-b border-stone-800">
                <div className="text-center font-mono">
                  <span className="text-[10px] text-stone-500 uppercase block">Morale Restored</span>
                  <span className="text-emerald-400 text-sm font-bold block">+35 MORALE</span>
                </div>
                <div className="text-center font-mono">
                  <span className="text-[10px] text-stone-500 uppercase block">Treasury Booty</span>
                  <span className="text-saffron text-sm font-bold block">+10,000 GOLD</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConcludeDuel}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-505 text-white font-mono text-[11px] font-black uppercase tracking-widest border border-emerald-400 hover:scale-[1.03] transition-all cursor-pointer rounded-xs shadow-lg"
              >
                Conclude Duel & Rejoin Horde
              </button>
            </div>
          )}

          {/* DEFEAT OVERLAY screen */}
          {combatState === 'defeat' && (
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/95 via-stone-900/95 to-[#1a0808]/95 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-red-400 mb-3 shadow-lg">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-red-500 font-serif text-2xl font-black uppercase tracking-tight mb-1">
                SHIELD BROKEN IN DUEL
              </h3>
              <span className="text-stone-400 text-[8.5px] font-mono uppercase tracking-widest mb-4">
                Sardar {opponentName} Overwhelmed Your Guard
              </span>
              <p className="text-[#fca5a5] text-xs font-serif leading-relaxed italic max-w-md mb-6">
                You were disarmed under the sheer kinetic power of the cavalry commander's heavy iron sweeps. Medics drag your bloodied body back inside the trenches.
              </p>

              <div className="text-center font-mono mb-6 py-3 border-t border-b border-stone-800 max-w-xs w-full">
                <span className="text-[10px] text-stone-500 uppercase block">Defeat Attrition</span>
                <span className="text-red-400 text-[11.5px] font-bold block">-15 Morale & Camp Follower Disarray</span>
              </div>

              <button
                type="button"
                onClick={handleConcludeDuel}
                className="px-6 py-2 bg-red-900 hover:bg-red-800 text-white font-mono text-[11px] font-black uppercase tracking-widest border border-red-500 hover:scale-[1.03] transition-all cursor-pointer rounded-xs shadow-lg"
              >
                Retreat Inside Earthen Defenses
              </button>
            </div>
          )}

        </div>

        {/* LOGS AND CONTROL PANEL PANEL */}
        <div className="md:col-span-4 flex flex-col justify-between gap-3">
          
          {/* INTERACTIVE MOVE STANCES */}
          <div className="bg-stone-900 border border-stone-850 p-3.5 text-left rounded-xs flex-1 flex flex-col justify-between">
            <div>
              <h5 className="text-[11px] font-mono text-saffron uppercase tracking-widest mb-2 font-extrabold flex items-center gap-1.5">
                <Zap size={12} className="text-amber-500 animate-pulse" />
                Talwar Cleave Sectors
              </h5>
              <p className="text-[10px] text-stone-400 mb-4 leading-tight">
                Strike from opposite sectors to bypass the commander's guard, or time your <b>Defensive Parry</b> as a perfect block!
              </p>

              <div className="grid grid-cols-1 gap-2">
                
                {/* STRIKE LEFT */}
                <button
                  type="button"
                  disabled={combatState !== 'fighting'}
                  onClick={() => executeDuelMove('left')}
                  className="w-full flex items-center justify-between p-2 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-saffron text-left group transition-all text-white disabled:opacity-40 cursor-pointer rounded-xs"
                >
                  <span className="text-[11px] font-mono font-bold uppercase tracking-tight flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 font-bold group-hover:text-saffron">[A]</span>
                    <span>Strike Left Sector</span>
                  </span>
                  <Swords size={12} className="text-stone-500 group-hover:text-saffron transition-colors" />
                </button>

                {/* STRIKE RIGHT */}
                <button
                  type="button"
                  disabled={combatState !== 'fighting'}
                  onClick={() => executeDuelMove('right')}
                  className="w-full flex items-center justify-between p-2 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-saffron text-left group transition-all text-white disabled:opacity-40 cursor-pointer rounded-xs"
                >
                  <span className="text-[11px] font-mono font-bold uppercase tracking-tight flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 font-bold group-hover:text-saffron">[D]</span>
                    <span>Strike Right Sector</span>
                  </span>
                  <Swords size={12} className="text-stone-500 group-hover:text-saffron transition-colors" />
                </button>

                {/* OVERHEAD THRUST */}
                <button
                  type="button"
                  disabled={combatState !== 'fighting'}
                  onClick={() => executeDuelMove('overhead')}
                  className="w-full flex items-center justify-between p-2 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-saffron text-left group transition-all text-white disabled:opacity-40 cursor-pointer rounded-xs"
                >
                  <span className="text-[11px] font-mono font-bold uppercase tracking-tight flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 font-bold group-hover:text-saffron">[W]</span>
                    <span>Overhead Thrust</span>
                  </span>
                  <Swords size={12} className="text-stone-500 group-hover:text-saffron transition-colors" />
                </button>

                {/* DEFENSIVE PARRY */}
                <button
                  type="button"
                  disabled={combatState !== 'fighting'}
                  onClick={() => executeDuelMove('parry')}
                  className="w-full flex items-center justify-between p-2.5 bg-[#122216] hover:bg-[#1a3822] border border-emerald-800 text-left group transition-all text-emerald-400 disabled:opacity-40 cursor-pointer rounded-xs"
                >
                  <span className="text-[11px] font-mono font-black uppercase tracking-tight flex items-center gap-2">
                    <span className="text-[10px] text-emerald-600 font-bold group-hover:text-emerald-400">[SPACE]</span>
                    <span>Defensive Parry</span>
                  </span>
                  <Shield size={13} className="text-emerald-500 animate-pulse" />
                </button>

              </div>
            </div>

            {/* Hotkeys reminder footer */}
            <div className="text-[8px] font-mono text-stone-500 border-t border-stone-800/60 pt-2 float-left tracking-wide mt-2">
              TIP: Supported keyboard controls: [W] [A] [S] [D] or Arrow keys!
            </div>
          </div>

          {/* COMBAT HISTORIC FEED LOG */}
          <div className="bg-stone-950 border border-stone-850 p-3 h-[125px] overflow-hidden flex flex-col rounded-xs">
            <h6 className="text-[9px] font-mono text-stone-500 uppercase tracking-widest mb-1.5 font-bold text-left border-b border-stone-900 pb-1 flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin text-stone-600" />
              Tactical Feuds feeds:
            </h6>
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 select-none text-left">
              {combatLogs.map((logStr, i) => (
                <div 
                  key={i} 
                  className={`text-[9.5px] font-mono leading-relaxed truncate ${
                    i === 0 ? 'text-stone-100 font-semibold border-s-2 border-saffron pl-1' : 'text-stone-500'
                  }`}
                >
                  {logStr}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
