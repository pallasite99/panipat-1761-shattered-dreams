import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

interface SwordSlashEffect {
  x: number;
  y: number;
  length: number;
  angle: number;
  progress: number; // 0 to 1
  color: string;
}

interface ArtilleryShell {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
  size: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  gravity?: number;
}

interface FloatingCombatText {
  x: number;
  y: number;
  text: string;
  alpha: number;
  color: string;
  scale: number;
  vy: number;
}

interface BulletTracer {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
  type: 'musket' | 'zamburak';
}

interface Combatant {
  id: number;
  x: number;
  y: number;
  z: number;
  hp: number;
  maxHp: number;
  vx: number;
  type: string;
  shieldActive: boolean;
  shootCooldown?: number;
  targetId?: number | null;
  isCommander?: boolean;
  commanderName?: string;
  commanderRole?: string;
  commanderMount?: string;
  commanderColor?: string;
  boboffset: number;
  slashTimer: number;
}

interface BattleCanvasProps {
  phase: 'initial' | 'clash' | 'resolution' | 'defeat';
  clashAction: 'none' | 'charge' | 'defend' | 'artillery' | 'feint' | 'flank' | 'adrenaline' | 'bomb' | 'loot' | null;
  enemyAction: 'none' | 'zamburak' | 'charge' | null;
  activeFaction: 'maratha' | 'durrani';
  onEnemyHit: (dmg: number, label: string, isAutonomous?: boolean) => void;
  onLootSuccess: () => void;
  onCommanderShout?: (speaker: string, role: string, avatar: string, text: string, faction: 'maratha' | 'durrani') => void;
  timeOfDay?: 'dawn' | 'noon' | 'dusk' | 'midnight';
  weather?: 'clear' | 'rain' | 'dust_storm' | 'fog';
  stage?: string;
  fortWallIntegrity?: number;
  spawnAllyTrigger?: number;
  spawnEnemyTrigger?: number;
  spawnAllyType?: string;
  spawnEnemyType?: string;
}

export const BattleCanvas: React.FC<BattleCanvasProps> = ({
  phase,
  clashAction,
  enemyAction,
  activeFaction,
  onEnemyHit,
  onLootSuccess,
  onCommanderShout,
  timeOfDay = 'noon',
  weather = 'clear',
  stage,
  fortWallIntegrity = 100,
  spawnAllyTrigger = 0,
  spawnEnemyTrigger = 0,
  spawnAllyType = '',
  spawnEnemyType = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // Read General selection from Local Storage
  const isShamsherSelected = localStorage.getItem('panipat_campaign_general') === 'shamsher';
  const isParvatibaiSelected = localStorage.getItem('panipat_campaign_general') === 'parvatibai';
  const isGopikabaiSelected = localStorage.getItem('panipat_campaign_general') === 'gopikabai';
  const isRaghobaSelected = localStorage.getItem('panipat_campaign_general') === 'raghoba';

  // Real-time animation states and gameplay lists
  const slashesRef = useRef<SwordSlashEffect[]>([]);
  const shellRef = useRef<ArtilleryShell[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const textsRef = useRef<FloatingCombatText[]>([]);
  const bulletTracersRef = useRef<BulletTracer[]>([]);
  const shakeRef = useRef<number>(0);
  const lastProcessedClashRef = useRef<string | null>(null);

  const [cannonRecoil, setCannonRecoil] = useState(0);
  const [swordSlashProgress, setSwordSlashProgress] = useState(0);
  const [slashAngle, setSlashAngle] = useState(0);

  // Parachute drop container
  const airdropCrateRef = useRef({
    x: 400,
    y: -120,
    targetY: 220,
    active: true,
    claimed: false,
    speed: 1.2
  });

  const targetsRef = useRef<Combatant[]>([]);
  const alliedSoldiersRef = useRef<Combatant[]>([]);
  const battleModeRef = useRef<'marching' | 'scattered'>('marching');

  // Sound and shout throttling
  const lastShoutTimeRef = useRef<number>(0);
  const registeredShoutsRef = useRef<Set<string>>(new Set());
  const deadAlliesRef = useRef<Set<number>>(new Set());
  const deadEnemiesRef = useRef<Set<number>>(new Set());

  // Package all dynamic props into deep refs to completely prevent p5 stale closure capture
  const stateRef = useRef({
    phase,
    clashAction,
    enemyAction,
    activeFaction,
    timeOfDay,
    weather,
    stage,
    fortWallIntegrity,
    spawnAllyTrigger,
    spawnEnemyTrigger,
    spawnAllyType,
    spawnEnemyType,
    isShamsherSelected,
    isParvatibaiSelected,
    isGopikabaiSelected,
    isRaghobaSelected,
    cannonRecoil,
    swordSlashProgress,
    slashAngle
  });

  const callbacksRef = useRef({
    onEnemyHit,
    onLootSuccess,
    onCommanderShout
  });

  useEffect(() => {
    stateRef.current = {
      phase,
      clashAction,
      enemyAction,
      activeFaction,
      timeOfDay,
      weather,
      stage,
      fortWallIntegrity,
      spawnAllyTrigger,
      spawnEnemyTrigger,
      spawnAllyType,
      spawnEnemyType,
      isShamsherSelected,
      isParvatibaiSelected,
      isGopikabaiSelected,
      isRaghobaSelected,
      cannonRecoil,
      swordSlashProgress,
      slashAngle
    };
  }, [
    phase,
    clashAction,
    enemyAction,
    activeFaction,
    timeOfDay,
    weather,
    stage,
    fortWallIntegrity,
    spawnAllyTrigger,
    spawnEnemyTrigger,
    spawnAllyType,
    spawnEnemyType,
    isShamsherSelected,
    isParvatibaiSelected,
    isGopikabaiSelected,
    isRaghobaSelected,
    cannonRecoil,
    swordSlashProgress,
    slashAngle
  ]);

  useEffect(() => {
    callbacksRef.current = {
      onEnemyHit,
      onLootSuccess,
      onCommanderShout
    };
  }, [onEnemyHit, onLootSuccess, onCommanderShout]);

  const triggerCommanderShout = (speaker: string, role: string, avatar: string, text: string, faction: 'maratha' | 'durrani') => {
    const now = Date.now();
    if (now - lastShoutTimeRef.current < 6000) return; // limit frequency
    if (registeredShoutsRef.current.has(text)) return;

    registeredShoutsRef.current.add(text);
    setTimeout(() => registeredShoutsRef.current.delete(text), 25000);

    lastShoutTimeRef.current = now;
    if (callbacksRef.current.onCommanderShout) {
      callbacksRef.current.onCommanderShout(speaker, role, avatar, text, faction);
    }
  };

  // Historic naming lookups
  const getAlliedCommanderInfo = () => {
    const s = stateRef.current;
    if (s.activeFaction === 'maratha') {
      if (s.stage === 'SHINDE_STAND') return { name: "Dattaji Shinde", role: "Scindia General", mount: "horse", color: "#ea580c" };
      if (s.stage === 'GWALIOR') return { name: "Mahadji Shinde", role: "Gwalior Ruler", mount: "elephant", color: "#ea580c" };
      if (s.isShamsherSelected) return { name: "Shamsher Bahadur", role: "Cavalry Commander", mount: "horse", color: "#ea580c" };
      if (s.isParvatibaiSelected) return { name: "Queen Parvatibai", role: "Camp Pillar", mount: "horse", color: "#ec4899" };
      if (s.isGopikabaiSelected) return { name: "Regent Gopikabai", role: "Regent Empress", mount: "elephant", color: "#ea580c" };
      if (s.isRaghobaSelected) return { name: "Raghunathrao (Raghoba)", role: "Frontier Conqueror", mount: "horse", color: "#f59e0b" };
      return { name: "Sadashivrao Bhau", role: "Peshwa Generalissimo", mount: "elephant", color: "#ea580c" };
    } else {
      if (s.stage === 'NIZAM_CAMPAIGN') return { name: "Nizam Salabat Jung", role: "Deccan Sovereign", mount: "elephant", color: "#0284c7" };
      if (s.stage === 'SHINDE_STAND' || s.stage === 'DELHI_NEGOTIATIONS') return { name: "Najib-ud-Daula", role: "Rohilla Chief", mount: "horse", color: "#0284c7" };
      return { name: "Ahmad Shah Abdali", role: "Durrani Sovereign", mount: "elephant", color: "#059669" };
    }
  };

  const getEnemyCommanderInfo = () => {
    const s = stateRef.current;
    if (s.activeFaction === 'maratha') {
      if (s.stage === 'NIZAM_CAMPAIGN') return { name: "Nizam Salabat Jung", role: "Deccan Sovereign", mount: "elephant", color: "#0284c7" };
      if (s.stage === 'SHINDE_STAND') return { name: "Najib-ud-Daula", role: "Rohilla Chief", mount: "horse", color: "#059669" };
      return { name: "Ahmad Shah Abdali", role: "Durrani Sovereign", mount: "elephant", color: "#059669" };
    } else {
      if (s.stage === 'SHINDE_STAND') return { name: "Dattaji Shinde", role: "Scindia General", mount: "horse", color: "#ea580c" };
      if (s.stage === 'GWALIOR') return { name: "Mahadji Shinde", role: "Gwalior Ruler", mount: "elephant", color: "#ea580c" };
      if (s.isShamsherSelected) return { name: "Shamsher Bahadur", role: "Cavalry Commander", mount: "horse", color: "#ea580c" };
      if (s.isParvatibaiSelected) return { name: "Queen Parvatibai", role: "Camp Pillar", mount: "horse", color: "#ec4899" };
      if (s.isGopikabaiSelected) return { name: "Regent Gopikabai", role: "Regent Empress", mount: "elephant", color: "#ea580c" };
      if (s.isRaghobaSelected) return { name: "Raghunathrao (Raghoba)", role: "Frontier Conqueror", mount: "horse", color: "#f59e0b" };
      return { name: "Sadashivrao Bhau", role: "Peshwa Generalissimo", mount: "elephant", color: "#ea580c" };
    }
  };

  // Helper creators for spawning particles
  const spawnParticle = (x: number, y: number, vx: number, vy: number, color: string, size: number, decay = 0.02, gravity?: number) => {
    particlesRef.current.push({ x, y, vx, vy, alpha: 1, color, size, decay, gravity });
  };

  const spawnHitSplatter = (x: number, y: number, color: string, intensity = 1) => {
    const count = Math.round((12 + Math.random() * 10) * intensity);
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 1.5 - Math.PI / 2;
      const speed = 1.5 + Math.random() * 5.5 * intensity;
      const size = 1.5 + Math.random() * 3.0 * intensity;
      const decay = 0.015 + Math.random() * 0.02;
      spawnParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        size,
        decay,
        0.18
      );
    }
  };

  const spawnMassiveExplosion = (x: number, y: number) => {
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 7;
      spawnParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 1.5,
        i % 3 === 0 ? '#ff5500' : i % 3 === 1 ? '#ffcc00' : '#4d4d4d',
        6 + Math.random() * 12,
        0.018
      );
    }
  };

  const triggerCannonball = (sx: number, sy: number, tx: number, ty: number) => {
    shellRef.current.push({
      startX: sx,
      startY: sy,
      currentX: sx,
      currentY: sy,
      targetX: tx,
      targetY: ty,
      progress: 0,
      size: 11
    });

    const isRight = sx > 400;
    const muzzleX = sx + (isRight ? -105 : 105);
    const muzzleY = sy - 48;

    for (let i = 0; i < 22; i++) {
      spawnParticle(
        muzzleX,
        muzzleY,
        (isRight ? -1 : 1) * (2 + Math.random() * 8),
        -1.5 + (Math.random() - 0.5) * 4,
        i % 2 === 0 ? '#ff8a00' : 'rgba(110,110,110,0.88)',
        5 + Math.random() * 15,
        0.03
      );
    }
  };

  // Re-Initialize or restructure formations dynamically
  const resetToFormations = (width: number, height: number) => {
    const s = stateRef.current;
    const minGroundY = height * 0.38;
    const maxGroundY = height * 0.72;

    let targetTypes: string[] = [];
    if (s.activeFaction === 'maratha') {
      targetTypes = s.stage === 'NIZAM_CAMPAIGN' 
        ? ['Nizam Infantryman', 'Nizam Deccan Cavalry', 'Nizam Swivel Gunner', 'Nizam War Elephant']
        : ['Pashtun Ghazi swordsman', 'Durrani Elite Cavalry', 'Camel Swivel Zamburak', 'Durrani War Elephant'];
    } else {
      targetTypes = s.stage === 'NIZAM_CAMPAIGN'
        ? ['Kabul Rebel Fighter', 'Khyber Rebel Scout', 'Khyber Swivel Gunner', 'Rebel Chieftain Elephant']
        : ['Maratha Mawala Swordsman', 'Gardi Infantry', 'Maratha Spear Cavalry', 'Maratha War Elephant'];
    }

    let allyTypes: string[] = s.activeFaction === 'maratha'
      ? ['Maratha Mawala Swordsman', 'Gardi Infantry', 'Maratha Spear Cavalry', 'Maratha War Elephant']
      : ['Pashtun Ghazi swordsman', 'Durrani Elite Cavalry', 'Camel Swivel Zamburak', 'Durrani War Elephant'];

    const enemyCommander = getEnemyCommanderInfo();
    const initialTargets: Combatant[] = [{
      id: 999,
      x: width - 80,
      y: minGroundY + 0.85 * (maxGroundY - minGroundY),
      z: 0.85,
      hp: 350,
      maxHp: 350,
      vx: -0.3,
      type: enemyCommander.name,
      shieldActive: true,
      isCommander: true,
      commanderName: enemyCommander.name,
      commanderRole: enemyCommander.role,
      commanderMount: enemyCommander.mount,
      commanderColor: enemyCommander.color,
      boboffset: 0,
      slashTimer: 0
    }];

    for (let i = 0; i < 7; i++) {
      // Larger spacing to cover more of the screen beautifully
      const z = 0.4 + (i % 4) * 0.12 + Math.random() * 0.05;
      const isRear = i % 2 === 1;
      initialTargets.push({
        id: i,
        // Spread ranks horizontally by 45px intervals instead of 15px clumps
        x: isRear ? (width - 80 - (i % 4) * 45) : (width - 180 - (i % 4) * 45),
        y: minGroundY + z * (maxGroundY - minGroundY),
        z,
        hp: i % 4 === 3 ? 180 : 100,
        maxHp: i % 4 === 3 ? 180 : 100,
        vx: (i % 4 === 3 ? 0.22 : 0.35 + Math.random() * 0.5) * (i % 2 === 0 ? 1 : -1),
        type: targetTypes[i % 4] || 'Hostile Combatant',
        shieldActive: i % 2 === 0,
        boboffset: Math.random() * Math.PI,
        slashTimer: 0
      });
    }
    targetsRef.current = initialTargets;

    const allyCommander = getAlliedCommanderInfo();
    const initialAllies: Combatant[] = [{
      id: 1000,
      x: 80,
      y: minGroundY + 0.9 * (maxGroundY - minGroundY),
      z: 0.9,
      hp: 350,
      maxHp: 350,
      vx: 0.3,
      type: allyCommander.name,
      shieldActive: true,
      isCommander: true,
      commanderName: allyCommander.name,
      commanderRole: allyCommander.role,
      commanderMount: allyCommander.mount,
      commanderColor: allyCommander.color,
      boboffset: 0,
      slashTimer: 0
    }];

    for (let i = 0; i < 6; i++) {
      // Smooth vertical and depth dispersion
      const z = 0.45 + (i % 4) * 0.11 + Math.random() * 0.05;
      const isRear = i % 2 === 1;
      initialAllies.push({
        id: 100 + i,
        // Spaced out ranks to fill the vast vertical grid
        x: isRear ? (80 + (i % 4) * 45) : (180 + (i % 4) * 45),
        y: minGroundY + z * (maxGroundY - minGroundY),
        z,
        hp: i % 4 === 3 ? 180 : 100,
        maxHp: i % 4 === 3 ? 180 : 100,
        vx: (i % 4 === 3 ? 0.22 : 0.42 + Math.random() * 0.4) * (i % 2 === 0 ? 1 : -1),
        type: allyTypes[i % 4] || 'Allied Soldier',
        shieldActive: false,
        boboffset: Math.random() * Math.PI,
        slashTimer: 0
      });
    }
    alliedSoldiersRef.current = initialAllies;
    battleModeRef.current = 'marching';
  };

  // Watch reinforcement triggers to execute real-time additions of veterans
  const prevSpawnAllyTrigger = useRef(0);
  const prevSpawnEnemyTrigger = useRef(0);

  useEffect(() => {
    if (phase !== 'clash') {
      prevSpawnAllyTrigger.current = spawnAllyTrigger;
      prevSpawnEnemyTrigger.current = spawnEnemyTrigger;
      return;
    }

    if (spawnAllyTrigger > prevSpawnAllyTrigger.current) {
      const qty = spawnAllyTrigger - prevSpawnAllyTrigger.current;
      prevSpawnAllyTrigger.current = spawnAllyTrigger;
      const arr = [...alliedSoldiersRef.current];
      for (let i = 0; i < qty; i++) {
        const id = 10000 + Math.floor(Math.random() * 9000);
        const z = 0.45 + Math.random() * 0.45;
        arr.push({
          id,
          x: 40 + Math.random() * 80,
          y: 200 + z * 100,
          z,
          hp: 150,
          maxHp: 150,
          vx: 0.5 + Math.random() * 0.3,
          type: spawnAllyType || 'Royal Guard Vanguard',
          shieldActive: false,
          boboffset: Math.random() * Math.PI,
          slashTimer: 0
        });
      }
      alliedSoldiersRef.current = arr;
    }

    if (spawnEnemyTrigger > prevSpawnEnemyTrigger.current) {
      const qty = spawnEnemyTrigger - prevSpawnEnemyTrigger.current;
      prevSpawnEnemyTrigger.current = spawnEnemyTrigger;
      const arr = [...targetsRef.current];
      for (let i = 0; i < qty; i++) {
        const id = 20000 + Math.floor(Math.random() * 9000);
        const z = 0.4 + Math.random() * 0.5;
        arr.push({
          id,
          x: 720 + Math.random() * 60,
          y: 200 + z * 100,
          z,
          hp: 140,
          maxHp: 140,
          vx: -(0.48 + Math.random() * 0.35),
          type: spawnEnemyType || 'Afghan Heavy Ghazi',
          shieldActive: Math.random() > 0.5,
          boboffset: Math.random() * Math.PI,
          slashTimer: 0
        });
      }
      targetsRef.current = arr;
    }
  }, [spawnAllyTrigger, spawnEnemyTrigger, spawnAllyType, spawnEnemyType, phase]);

  // Main p5.js Sketch Core
  useEffect(() => {
    const sketch = (p: p5) => {
      let canvasWidth = 800;
      let canvasHeight = 480;

      // Realtime atmospheric dust stream positions
      const windGrains: { x: number; y: number; s: number }[] = [];
      // Rain trails
      const rainDroplets: { x: number; y: number; s: number; len: number }[] = [];
      // Ground ripples array
      const groundRipples: { x: number; y: number; size: number; alpha: number }[] = [];

      p.setup = () => {
        // Clear previous canvas or elements inside container to avoid duplicates
        if (containerRef.current) {
          const canvases = containerRef.current.getElementsByTagName('canvas');
          for (let i = canvases.length - 1; i >= 0; i--) {
            canvases[i].remove();
          }
        }
        const canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent(containerRef.current!);
        p.pixelDensity(1);
        p.ellipseMode(p.CENTER);

        // Seed dust particles
        for (let i = 0; i < 45; i++) {
          windGrains.push({
            x: p.random(p.width),
            y: p.random(150, p.height),
            s: p.random(1.2, 3.5)
          });
        }
        // Seed rain particles
        for (let i = 0; i < 65; i++) {
          rainDroplets.push({
            x: p.random(p.width),
            y: p.random(-100, p.height),
            s: p.random(3.5, 7.5),
            len: p.random(8, 18)
          });
        }

        // Initialize entities
        resetToFormations(p.width, p.height);
      };

      p.draw = () => {
        try {
          const s = stateRef.current;
          const width = p.width;
          const height = p.height;
          const horizon = height * 0.36;

          // Apply screen shake
          shakeRef.current = Math.max(0, shakeRef.current * 0.88);
          p.push();
          if (shakeRef.current > 0.05) {
            const shakeX = p.random(-shakeRef.current * 0.7, shakeRef.current * 0.7);
            const shakeY = p.random(-shakeRef.current * 0.7, shakeRef.current * 0.7);
            p.translate(shakeX, shakeY);
          }

          const animTime = p.millis();

          // 1. SCENIC SKIES AND DEEP PERSPECTIVE BOUNDS (Dynamic Time Of Day Moods)
          drawBattlefieldBackground(p, width, height, horizon, animTime, s);

          // 2. GROUND SURFACE SOIL MAP
          drawEarthenSoil(p, width, height, horizon, s);

          // 3. FORTRESS DEFENSES (FOR SIEGE STAGES)
          drawFortressWalls(p, width, height, horizon, animTime, s);

          // 4. WEAVING RETROCUT HQ BANNERS FLUTTERING IN WIND
          drawHQFlags(p, width, horizon, animTime);

          // 5. UPDATE AND DRAW LIVE ENEMIES (Afghan coalition or rebels)
          updateAndDrawUnits(p, targetsRef, true, animTime, width, height, horizon, s);

          // 6. UPDATE AND DRAW ALLIED MARATHA AND GARDI SOLDIERS
          updateAndDrawUnits(p, alliedSoldiersRef, false, animTime, width, height, horizon, s);

          // 7. HANDLE COLLISION CLASH MELEE TRIGGERS
          handleEmpireMeleeClashes(p, width, height, s);

          // 8. UPDATE AND DRAW PROJECTILE SHELLS & IMPACT EMBERS
          updateAndDrawArtillery(p, width, height);

          // 9. DRAW DUST STORM/RAIN WEATHER OVERLAYS
          drawWeatherParticles(p, width, height, horizon, animTime, s);

          // 10. DRAW SWORD COGNIZANT FIRST PERSON WEAPON FENDERS
          drawPOVWeapons(p, width, height, animTime, s);

          // 11. DRAW SCI-FI RETICLE INTERFACES
          drawMedievalReticle(p, s);

          // 12. FLOATING TEXT ACTIONS
          updateFloatingTexts(p);

          // 13. DRAW ALL SPAWNED RAGDOLL particles
          updateParticles(p);

          p.pop(); // End screenshake

          // React actions polling
          handleInteractionsQueue(s);
        } catch (err: any) {
          p.background(22, 10, 10);
          p.fill(248, 113, 113);
          p.textSize(12);
          p.textAlign(p.LEFT, p.TOP);
          p.text('CRITICAL SKETCH ERROR: ' + err.message, 20, 20);
          p.text(err.stack || '', 20, 45);
          console.error('P5 Draw Error:', err);
        }
      };

      // Scene backgrounds
      function drawBattlefieldBackground(p: p5, w: number, h: number, horizon: number, time: number, s: any) {
        p.noStroke();
        // Background sky gradient depending on time of day
        const ctx = (p as any).drawingContext as CanvasRenderingContext2D;
        if (ctx && typeof ctx.createLinearGradient === 'function') {
          const grad = ctx.createLinearGradient(0, 0, 0, horizon);
          if (s.timeOfDay === 'midnight') {
            grad.addColorStop(0, '#030712');
            grad.addColorStop(1, '#111827');
          } else if (s.timeOfDay === 'dawn') {
            grad.addColorStop(0, '#1e1b4b');
            grad.addColorStop(1, '#f43f5e');
          } else if (s.timeOfDay === 'dusk') {
            grad.addColorStop(0, '#451a03');
            grad.addColorStop(1, '#ea580c');
          } else {
            grad.addColorStop(0, '#1e0b05');
            grad.addColorStop(1, '#3c1103');
          }
          p.push();
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, horizon);
          p.pop();
        } else {
          // Quick retro chunky vertical steps fallback
          const step = 15;
          for (let y = 0; y < horizon; y += step) {
            const inter = p.map(y, 0, horizon, 0, 1);
            let c;
            if (s.timeOfDay === 'midnight') {
              c = p.lerpColor(p.color('#030712'), p.color('#111827'), inter);
            } else if (s.timeOfDay === 'dawn') {
              c = p.lerpColor(p.color('#1e1b4b'), p.color('#f43f5e'), inter);
            } else if (s.timeOfDay === 'dusk') {
              c = p.lerpColor(p.color('#451a03'), p.color('#ea580c'), inter);
            } else {
              c = p.lerpColor(p.color('#1e0b05'), p.color('#3c1103'), inter);
            }
            p.fill(c);
            p.rect(0, y, w, step);
          }
        }
        p.noStroke();

        // Draw distant ridges
        p.fill('#180a06');
        p.beginShape();
        p.vertex(0, horizon);
        p.vertex(w * 0.15, horizon - 15);
        p.vertex(w * 0.32, horizon - 4);
        p.vertex(w * 0.48, horizon - 22);
        p.vertex(w * 0.65, horizon - 6);
        p.vertex(w * 0.85, horizon - 28);
        p.vertex(w, horizon);
        p.endShape(p.CLOSE);

        // Distant sky campfire smoke plumes
        p.fill(32, 24, 20, 35);
        for (let i = 0; i < 3; i++) {
          const sx = w * (0.2 + i * 0.3) + p.sin(time * 0.001 + i) * 15;
          p.ellipse(sx, horizon - 20, 45 + i * 15, 30);
        }
      }

      function drawEarthenSoil(p: p5, w: number, h: number, horizon: number, s: any) {
        // Perspective soil base
        let baseColor = p.color('#22140c');
        if (s.weather === 'rain') baseColor = p.color('#180e09'); // deeper mud
        else if (s.weather === 'dust_storm') baseColor = p.color('#2e1a0d'); // dusty dunes

        p.noStroke();
        p.fill(baseColor);
        p.rect(0, horizon, w, h - horizon);

        // Drawing converging perspective lanes
        p.stroke('rgba(245, 158, 11, 0.08)');
        p.strokeWeight(1.2);
        const centerPoint = w * 0.5;
        for (let xOffset = -w; xOffset <= w * 2; xOffset += 65) {
          p.line(centerPoint, horizon, xOffset, h);
        }

        // Draw depth rings
        for (let y = horizon; y < h; y += (y - horizon) * 0.28 + 15) {
          p.line(0, y, w, y);
        }

        // Timber Anti-Cavalry stakes on the wings
        p.fill('#2e1a0f');
        p.stroke('#150c07');
        p.strokeWeight(1);
        for (let px = w * 0.06; px < w * 0.94; px += 38) {
          const yPos = horizon + 9 + (px % 5) * 3;
          p.beginShape();
          p.vertex(px, yPos);
          p.vertex(px - 1.5, yPos - 8 - (px % 4));
          p.vertex(px + 3, yPos);
          p.endShape(p.CLOSE);
        }
      }

      function drawFortressWalls(p: p5, w: number, h: number, horizon: number, time: number, s: any) {
        const isSiegeStage = s.stage === 'NIZAM_CAMPAIGN' || s.stage === 'GWALIOR' || s.stage === 'DELHI_NEGOTIATIONS';
        if (!isSiegeStage) return;

        const wallHeight = h * 0.16;
        const wallY = horizon - wallHeight;

        p.fill('#3a3532');
        p.noStroke();
        p.rect(0, wallY, w, wallHeight);

        // Brick mortar patterns using efficient DDA
        p.stroke('#27201c');
        p.strokeWeight(1);
        for (let wx = 0; wx < w; wx += 40) {
          p.line(wx, wallY, wx, wallY + wallHeight);
          for (let ry = wallY; ry < wallY + wallHeight; ry += 11) {
            p.line(wx, ry, wx + 40, ry);
          }
        }

        // Crenellations on wall crowns
        p.fill('#27201c');
        const battlementW = 24;
        for (let bx = 0; bx < w; bx += battlementW * 2) {
          p.rect(bx, wallY - 8, battlementW, 8);
        }

        // Gatehouse arched gates
        const gateW = w * 0.22;
        const gateX = w * 0.5 - gateW * 0.5;
        const gateY = wallY + wallHeight - 40;

        p.fill('#1c1917');
        p.rect(gateX, gateY, gateW, 40, 10, 10, 0, 0);

        if (s.fortWallIntegrity > 0) {
          p.fill('#542c15'); // mahogany gates
          p.rect(gateX + 4, gateY + 2, gateW - 8, 38, 8, 8, 0, 0);

          // Wood iron frame
          p.stroke('#3f3f46');
          p.strokeWeight(2);
          p.noFill();
          p.rect(gateX + 4, gateY + 2, gateW - 8, 38, 8, 8, 0, 0);
          
          // Gate grates
          p.strokeWeight(1);
          for (let gx = gateX + 12; gx < gateX + gateW - 10; gx += 14) {
            p.line(gx, gateY + 2, gx, gateY + 40);
          }

          // Damage flares
          if (s.fortWallIntegrity < 100) {
            p.stroke('#ec4899');
            p.strokeWeight(2);
            for (let i = 0; i < Math.floor((100 - s.fortWallIntegrity) / 15); i++) {
              const cx = gateX + gateW * 0.25 + (i * 20) % (gateW * 0.55);
              p.line(cx, gateY + 5, cx + p.sin(time * 0.01 + i) * 8, gateY + 35);
            }
          }
        } else {
          // Shatteredゲート rubble pile
          p.fill('#2d2a29');
          p.noStroke();
          p.beginShape();
          p.vertex(gateX - 12, gateY + 40);
          p.vertex(gateX + gateW * 0.5, gateY + 16);
          p.vertex(gateX + gateW + 12, gateY + 40);
          p.endShape(p.CLOSE);
        }

        // Text HUD
        p.fill(s.fortWallIntegrity > 0 ? '#ea580c' : '#22c55e');
        p.noStroke();
        p.textSize(8);
        p.textStyle(p.BOLD);
        p.textAlign(p.CENTER);
        const statusText = s.fortWallIntegrity > 0 
          ? `SIEGECRAFT ENCLOSURE: ${s.fortWallIntegrity}% STRUCTURAL INTEGRITY`
          : `🔓 GATES SPLINTERED - ALL COLUMNS ENGAGE BRAVELY!`;
        p.text(statusText, w * 0.5, wallY - 14);
      }

      function drawHQFlags(p: p5, w: number, horizon: number, time: number) {
        const makeFlag = (fx: number, fy: number, flagColor: string, icon: string) => {
          p.stroke('#854d0e');
          p.strokeWeight(2);
          p.line(fx, fy, fx, fy - 24);

          p.noStroke();
          p.fill(flagColor);
          p.beginShape();
          p.vertex(fx, fy - 24);
          p.vertex(fx + 22 + p.sin(time * 0.007) * 3, fy - 20 + p.cos(time * 0.007) * 1.5);
          p.vertex(fx, fy - 14);
          p.endShape(p.CLOSE);

          p.fill('#ffffff');
          p.textSize(9);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(icon, fx + 8, fy - 19);
        };

        // Left Maratha HQ Saffron
        makeFlag(w * 0.08, horizon - 15, '#ea580c', '🚩');
        // Right Durrani HQ Green
        makeFlag(w * 0.92, horizon - 15, '#15803d', '🌙');
      }

      // Atmospheric Weather particles
      function drawWeatherParticles(p: p5, w: number, h: number, horizon: number, animTime: number, s: any) {
        if (s.weather === 'rain') {
          p.stroke('rgba(165, 230, 252, 0.45)');
          p.strokeWeight(1);
          rainDroplets.forEach(d => {
            p.line(d.x, d.y, d.x - d.s * 0.1, d.y + d.len);
            d.y += d.s * 1.5;
            d.x -= d.s * 0.15;

            // Ripple splash on horizon collision
            if (d.y > horizon && p.random(1) < 0.03) {
              groundRipples.push({
                x: d.x,
                y: p.random(horizon, h),
                size: 2,
                alpha: 150
              });
            }

            if (d.y > h) {
              d.y = p.random(-80, -10);
              d.x = p.random(w);
            }
          });

          // Draw Ground Ripples
          p.noFill();
          p.strokeWeight(1);
          for (let i = groundRipples.length - 1; i >= 0; i--) {
            const gr = groundRipples[i];
            p.stroke(147, 197, 253, gr.alpha);
            p.ellipse(gr.x, gr.y, gr.size, gr.size * 0.45);
            gr.size += 1.2;
            gr.alpha -= 5;
            if (gr.alpha <= 0) {
              groundRipples.splice(i, 1);
            }
          }
        } else if (s.weather === 'dust_storm') {
          p.noStroke();
          // Sandy mist
          p.fill('rgba(234, 88, 12, 0.1)');
          p.rect(0, horizon, w, h - horizon);

          p.fill(245, 158, 11, 85);
          windGrains.forEach(g => {
            p.ellipse(g.x, g.y, g.s, g.s * 0.5);
            g.x += g.s * 2.8;
            g.y += p.sin(animTime * 0.005 + g.s) * 0.35;

            if (g.x > w) {
              g.x = -15;
              g.y = p.random(horizon, h);
            }
          });
        } else if (s.weather === 'fog') {
          // Fog depth haze
          for (let dy = horizon; dy < h; dy += 20) {
            const hWeight = p.map(dy, horizon, h, 65, 0);
            p.fill(243, 244, 246, hWeight);
            p.noStroke();
            p.rect(0, dy, w, 24);
          }
        }
      }

      function updateAndDrawUnits(p: p5, listRef: React.MutableRefObject<Combatant[]>, isEnemy: boolean, time: number, w: number, h: number, horizon: number, s: any) {
        const arr = listRef.current;
        const width = w;

        // Sorting by depth so characters in rear are shaded behind forward combatants
        arr.sort((a, b) => a.z - b.z);

        const deadSet = isEnemy ? deadEnemiesRef.current : deadAlliesRef.current;

        arr.forEach(item => {
          if (item.hp <= 0) {
            if (!deadSet.has(item.id)) {
              deadSet.add(item.id);
            }
            // Draw fallen flat shadow corpse
            p.push();
            p.translate(item.x, item.y + 11);
            p.stroke('rgba(44, 20, 10, 0.55)');
            p.strokeWeight(1.5);
            p.line(-12, 0, 8, -2);
            p.fill('rgba(44, 20, 10, 0.45)');
            p.ellipse(-15, 0, 4, 4);
            p.pop();
            return;
          }

          // Move entities
          if (s.phase === 'clash') {
            if (battleModeRef.current === 'marching') {
              // March columns together with majestic uniform pace
              item.x += isEnemy ? -1.2 : 1.2;
            } else {
              // SCATTERED DUELS: lock target of opposite side
              const oppositionList = isEnemy ? alliedSoldiersRef.current : targetsRef.current;

              // STAGGERED RE-EVALUATION ENGINES to prevent crowding under commanders
              const shouldReevaluate = !item.targetId || (p.frameCount + (item.id % 23)) % 40 === 0;
              let target = (!shouldReevaluate && item.targetId) ? oppositionList.find(o => o.id === item.targetId && o.hp > 0) : null;

              if (shouldReevaluate || !target) {
                let nearest: Combatant | null = null;
                let minScore = Infinity;
                
                const ourAllianceList = isEnemy ? targetsRef.current : alliedSoldiersRef.current;

                for (let idx = 0; idx < oppositionList.length; idx++) {
                  const o = oppositionList[idx];
                  if (o.hp > 0) {
                    // Count how many of our side are already targeting this person
                    const targeterCount = ourAllianceList.filter(u => u.hp > 0 && u.id !== item.id && u.targetId === o.id).length;

                    const dx = o.x - item.x;
                    const dy = o.y - item.y;
                    const distSq = dx * dx + dy * dy;

                    // Add a massive penalty for already targeted units to disperse fight naturally
                    const score = distSq + targeterCount * 140000;
                    if (score < minScore) {
                      minScore = score;
                      nearest = o;
                    }
                  }
                }
                if (nearest) {
                  item.targetId = nearest.id;
                  target = nearest;
                } else {
                  item.targetId = null;
                  target = null;
                }
              }

              // Dynamic Separation Steering forces (repulsion from allies and enemies)
              let sepX = 0;
              let sepY = 0;
              const separationRadius = 65 * item.z; // wider sweep for natural spacing

              const applyRepulsion = (other: Combatant) => {
                if (other.id !== item.id && other.hp > 0) {
                  const dx = item.x - other.x;
                  const dy = item.y - other.y;
                  const dist = Math.hypot(dx, dy);
                  if (dist > 0 && dist < separationRadius) {
                    const force = (separationRadius - dist) / separationRadius;
                    // Super strong repulsion for very close collisions
                    const multiplier = dist < 22 ? 2.5 : 1.6;
                    sepX += (dx / dist) * force * multiplier;
                    sepY += (dy / dist) * force * multiplier * 0.8;
                  }
                }
              };

              alliedSoldiersRef.current.forEach(applyRepulsion);
              targetsRef.current.forEach(applyRepulsion);

              // Standard steer velocity integration
              let desiredVx = 0;
              let desiredVy = 0;

              if (target) {
                const stepX = target.x - item.x;
                const stepY = target.y - item.y;
                const len = Math.hypot(stepX, stepY);
                if (len > 35) {
                  let mountFactor = 1.0;
                  if (item.type.includes('Cavalry')) mountFactor = 1.6;
                  else if (item.type.includes('Elephant')) mountFactor = 0.65;
                  desiredVx = (stepX / len) * 1.25 * mountFactor;
                  desiredVy = (stepY / len) * 0.55 * mountFactor;
                } else {
                  // Inside melee combat range
                  desiredVx = p.random(-0.35, 0.35);
                  desiredVy = p.random(-0.15, 0.15);
                  item.slashTimer++;
                  if (item.slashTimer > 60) {
                    item.slashTimer = 0;
                    target.hp = p.max(0, target.hp - (item.isCommander ? 15 : 7));
                    spawnHitSplatter(target.x, target.y, '#b91c1c', 0.5);

                    textsRef.current.push({
                      x: target.x,
                      y: target.y - 12,
                      text: `-${item.isCommander ? 15 : 7}`,
                      alpha: 200,
                      color: isEnemy ? '#f87171' : '#fb923c',
                      scale: 0.9,
                      vy: -1.2
                    });
                  }
                }
              } else {
                // If clean target list, wander/advance
                desiredVx = item.vx * 0.3;
                if (item.x < 40 || item.x > w - 40) item.vx *= -1;
              }

              // Combine steering directions
              let finalVx = desiredVx + sepX;
              let finalVy = desiredVy + sepY;

              const maxSpeed = item.type.includes('Cavalry') ? 2.4 : 1.35;
              const speedLen = Math.hypot(finalVx, finalVy);
              if (speedLen > maxSpeed) {
                finalVx = (finalVx / speedLen) * maxSpeed;
                finalVy = (finalVy / speedLen) * maxSpeed;
              }

              item.x += finalVx;
              item.y += finalVy;

              // Strict border bound checks utilizing canvas dimensions and 3D terrain ground layer
              const minG = h * 0.38;
              const maxG = h * 0.72;
              item.x = p.constrain(item.x, 30, w - 30);
              item.y = p.constrain(item.y, minG, maxG);
            }
          }

          // DRAW VISUAL NODE
          const zScale = item.z;
          const charSize = 25 * zScale;
          const bob = p.sin(time * 0.009 + item.boboffset) * 2.8;

          p.push();
          p.translate(item.x, item.y);

          // Shadow Footing
          p.noStroke();
          p.fill(0, 0, 0, 75);
          p.ellipse(0, charSize * 0.45, charSize * 1.1, charSize * 0.4);

          let riderY = bob;
          let shieldRadius = charSize * 0.35;

          const isCavalry = item.type.includes('Cavalry') || item.type.includes('Scout') || (!!item.isCommander && item.commanderMount === 'horse');
          const isElephant = item.type.includes('Elephant') || (!!item.isCommander && item.commanderMount === 'elephant');
          const isCamel = item.type.includes('Zamburak') || item.type.includes('Gunner');

          let primaryColor = isEnemy ? p.color('#991b1b') : p.color('#ea580c'); // Saffron vs Crimson/Gardi Blues
          let crestColor = p.color('#facc15');

          if (item.isCommander) {
            primaryColor = item.commanderColor ? p.color(item.commanderColor) : primaryColor;
          } else if (item.type.includes('Gardi')) {
            primaryColor = p.color('#3b82f6'); // Royal Gardi French Blue
            crestColor = p.color('#ffffff');
          } else if (item.type.includes('Nizam')) {
            primaryColor = p.color('#047857'); // Deccan Nizam Emerald
          }

          // 1. ANIMAL STRUCTURES
          if (isCavalry) {
            riderY -= charSize * 0.4;
            p.fill(item.isCommander ? '#f5f5f4' : '#573d2b');
            p.noStroke();
            // Horse Torso
            p.ellipse(-charSize * 0.15, charSize * 0.2 + bob, charSize * 0.85, charSize * 0.38);
            // Neck
            p.push();
            if (isEnemy) {
              p.translate(-charSize * 0.3, charSize * 0.1 + bob);
              p.rotate(-p.PI * 0.22);
            } else {
              p.translate(charSize * 0.3, charSize * 0.1 + bob);
              p.rotate(p.PI * 0.22);
            }
            p.ellipse(0, -charSize * 0.2, charSize * 0.25, charSize * 0.46);
            p.pop();

            // Legs cycle
            p.stroke('#1c110b');
            p.strokeWeight(1.8);
            const cycle = p.sin(time * 0.012 + item.id) * charSize * 0.22;
            p.line(-charSize * 0.3, charSize * 0.25 + bob, -charSize * 0.3 - cycle, charSize * 0.7);
            p.line(charSize * 0.15, charSize * 0.25 + bob, charSize * 0.15 + cycle, charSize * 0.7);
          } else if (isCamel) {
            riderY -= charSize * 0.5;
            p.fill('#b58353');
            p.noStroke();
            // Camel torso and Hump
            p.ellipse(0, charSize * 0.25 + bob, charSize * 0.75, charSize * 0.4);
            p.ellipse(-charSize * 0.1, bob, charSize * 0.28, charSize * 0.22); // hump

            // Neck
            p.ellipse(isEnemy ? -charSize * 0.3 : charSize * 0.3, bob, charSize * 0.18, charSize * 0.45);

            // Legs
            p.stroke('#3c220f');
            p.strokeWeight(1.5);
            const cycle = p.cos(time * 0.01 + item.id) * charSize * 0.18;
            p.line(-charSize * 0.2, charSize * 0.3 + bob, -charSize * 0.2 - cycle, charSize * 0.72);
            p.line(charSize * 0.2, charSize * 0.3 + bob, charSize * 0.2 + cycle, charSize * 0.72);
          } else if (isElephant) {
            riderY -= charSize * 0.65;
            p.fill('#4b5563');
            p.noStroke();
            // Elephant chassis shape
            p.ellipse(0, charSize * 0.1 + bob, charSize * 1.5, charSize * 0.95);
            // Ears
            p.fill('#374151');
            p.ellipse(isEnemy ? -charSize * 0.5 : charSize * 0.5, charSize * 0.1 + bob + p.sin(time * 0.005) * 2, charSize * 0.4, charSize * 0.5);

            // Trunk curves
            p.stroke('#4b5563');
            p.strokeWeight(4);
            p.noFill();
            p.beginShape();
            const tx = isEnemy ? -charSize * 0.8 : charSize * 0.8;
            const p0x = tx;
            const p0y = charSize * 0.2 + bob;
            const pcx = tx * 1.3;
            const pcy = charSize * 0.4 + bob;
            const p1x = tx * 1.1 + p.sin(time * 0.008) * 8;
            const p1y = charSize * 0.8 + bob;
            for (let t = 0; t <= 1; t += 0.25) {
              const x = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * pcx + t * t * p1x;
              const y = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * pcy + t * t * p1y;
              p.vertex(x, y);
            }
            p.endShape();

            // Heavy legs
            p.stroke('#27272a');
            p.strokeWeight(5);
            const cycle = p.sin(time * 0.006) * 3;
            p.line(-charSize * 0.4, charSize * 0.3 + bob, -charSize * 0.4, charSize * 0.75 + cycle);
            p.line(charSize * 0.4, charSize * 0.3 + bob, charSize * 0.4, charSize * 0.75 - cycle);

            // Wooden howdah (castle turret box)
            p.fill('#854d0e');
            p.stroke('#3f2305');
            p.strokeWeight(1.5);
            p.rect(-charSize * 0.4, -charSize * 0.5 + bob, charSize * 0.8, charSize * 0.3);
            p.rect(-charSize * 0.1, -charSize * 0.9 + bob, charSize * 0.2, charSize * 0.4); // banner mast
          }

          // 2. SOLDIER UNIT BODY
          p.noStroke();
          p.fill(primaryColor);
          p.ellipse(0, riderY, charSize * 0.55, charSize * 0.7); // torso

          // Head helmet/turban
          p.fill(crestColor);
          p.ellipse(0, riderY - charSize * 0.4, charSize * 0.38, charSize * 0.38);
          p.fill(primaryColor);
          p.rect(-charSize * 0.1, riderY - charSize * 0.55, charSize * 0.2, charSize * 0.15); // crest tip

          // Armor breastplate shine
          p.fill(255, 255, 255, 45);
          p.ellipse(-charSize * 0.1, riderY - charSize * 0.05, charSize * 0.2, charSize * 0.3);

          // 3. WEAPONRY SYSTEMS
          if (item.type.includes('Swivel') || item.type.includes('Zamburak')) {
            // camel zamburak heavy swivel gun barrel
            p.fill('#1e293b');
            p.rect(isEnemy ? -charSize * 0.6 : charSize * 0.1, riderY + charSize * 0.1, charSize * 0.6, charSize * 0.15);
          } else {
            // Curved sword (Talwar tool)
            p.stroke('#e2e8f0');
            p.strokeWeight(1.8);
            const curveDirection = isEnemy ? -1 : 1;
            const targetRotation = item.slashTimer > 0 ? (item.slashTimer * 0.12) : 0;
            p.push();
            p.translate(charSize * 0.25 * curveDirection, riderY);
            p.rotate(curveDirection * (p.PI * 0.2 + targetRotation));
            p.line(0, 0, 0, -charSize * 0.55); // blade line
            p.pop();
          }

          // DHAL SHIELD FOR DEFENDERS
          if (item.shieldActive || s.clashAction === 'defend') {
            p.fill('#544338');
            p.stroke('#ca8a04');
            p.strokeWeight(1.5);
            p.ellipse(isEnemy ? charSize * 0.22 : -charSize * 0.22, riderY, shieldRadius, shieldRadius);
            // rivets
            p.fill('#ffffff');
            p.noStroke();
            p.ellipse(isEnemy ? charSize * 0.22 : -charSize * 0.22, riderY - 2, 1.5, 1.5);
          }

          // Commander banners overhead
          if (item.isCommander) {
            p.fill('rgba(234, 179, 8, 0.22)');
            p.stroke('#ea580c');
            p.strokeWeight(1);
            p.ellipse(0, riderY - charSize * 1.15, charSize * 1.5, charSize * 0.45);
            p.fill('#ffffff');
            p.noStroke();
            p.textSize(8);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(item.commanderName || 'GENERAL', 0, riderY - charSize * 1.15);
          }

          // HEALTH BAR
          const hpRatio = item.hp / item.maxHp;
          p.fill('#1f2937');
          p.rect(-charSize * 0.5, riderY - charSize * 0.84, charSize, 3);
          p.fill(hpRatio > 0.45 ? '#22c55e' : '#ef4444');
          p.rect(-charSize * 0.5, riderY - charSize * 0.84, charSize * hpRatio, 3);

          p.pop();
        });
      }

      function handleEmpireMeleeClashes(p: p5, w: number, h: number, s: any) {
        if (s.phase !== 'clash' || battleModeRef.current !== 'marching') return;

        const liveAllies = alliedSoldiersRef.current.filter(a => a.hp > 0);
        const liveHostiles = targetsRef.current.filter(t => t.hp > 0);
        if (liveAllies.length === 0 || liveHostiles.length === 0) return;

        const maxAllyX = Math.max(...liveAllies.map(a => a.x));
        const minHostileX = Math.min(...liveHostiles.map(t => t.x));

        if (minHostileX - maxAllyX < 112) {
          battleModeRef.current = 'scattered';
          const midX = (maxAllyX + minHostileX) / 2;
          const midY = h * 0.52;

          shakeRef.current = 28;

          // Impact sparks
          for (let i = 0; i < 40; i++) {
            const rx = midX + p.random(-30, 30);
            const ry = midY + p.random(-45, 45);
            spawnParticle(
              rx,
              ry,
              p.random(-6, 6),
              p.random(-5, 0) - 2,
              i % 3 === 0 ? '#ea580c' : i % 3 === 1 ? '#ef4444' : '#eab308',
              3 + p.random(3),
              0.025,
              0.1
            );
          }

          textsRef.current.push({
            x: midX,
            y: midY - 30,
            text: "⚔️ CLASH OF EMPIRES!",
            alpha: 255,
            color: '#f97316',
            scale: 1.4,
            vy: -1
          });

          triggerCommanderShout(
            "Sadashivrao Bhau",
            "Generalissimo",
            "🏇 Battlefront Engage",
            "The battalions have collided! Guard our centers, raise your standard shields! Har Har Mahadev!",
            "maratha"
          );
        }
      }

      // First-person POAs rendering
      function drawPOVWeapons(p: p5, w: number, h: number, animTime: number, s: any) {
        // A. LEFT BRASS SIEGE CANNON
        p.push();
        const recoil = s.cannonRecoil * 32;
        p.translate(w * 0.15 - recoil, h + recoil * 0.5);

        // Carriage wheels
        p.fill('#2e1a0f');
        p.stroke('#ca8a04');
        p.strokeWeight(3);
        p.ellipse(0, 0, 56, 56);

        // Cannon barrel (Angled 26° up-right)
        p.rotate(-26 * p.PI / 180);
        // Golden metallic gradient emulation
        p.fill(p.color('#b45309'));
        p.stroke('#ca8a04');
        p.strokeWeight(1.5);
        p.beginShape();
        p.vertex(0, -18);
        p.vertex(115, -12);
        p.vertex(115, 12);
        p.vertex(0, 18);
        p.endShape(p.CLOSE);

        // Gilded royal ring bands on cannon barrels
        p.fill('#451a03');
        p.rect(30, -15, 8, 30);
        p.rect(72, -13, 8, 26);
        p.fill('#1e293b'); // bore
        p.ellipse(115, 0, 4, 12);

        // Left firing flash overlay
        if (s.cannonRecoil > 0.04) {
          p.push();
          p.translate(118, 0);
          p.fill(255, 253, 230, p.map(s.cannonRecoil, 0, 1, 0, 255));
          p.ellipse(22, 0, 60, 32);
          p.fill(249, 115, 22, p.map(s.cannonRecoil, 0, 1, 0, 160));
          p.ellipse(35, 0, 95, 45);
          p.pop();
        }
        p.pop();

        // CANNONEER OPERATORS (Flank Left side)
        const cannoneerX = w * 0.08 - recoil;
        const cannoneerY = h - 45 + recoil * 0.45;
        p.push();
        p.translate(cannoneerX, cannoneerY);
        p.fill('#ea580c'); // Saffron livery
        p.ellipse(0, 0, 14, 20); // body
        p.fill('#facc15'); // turban
        p.ellipse(0, -12, 10, 10);
        p.stroke('#ab5c07');
        p.strokeWeight(1.5);
        p.line(0, -3, 14, -8 + p.sin(animTime * 0.009) * 2); // carrying ram rod staff
        p.pop();

        // B. RIGHT SWORD PLAY: Polished curved Maratha Talwar (tracks cursor and swings)
        p.push();
        const swing = s.swordSlashProgress * 0.72;
        const swordX = w * 0.82 - s.swordSlashProgress * 140;
        const swordY = h + 10 - s.swordSlashProgress * 90;

        p.translate(swordX, swordY);
        const targetAngle = p.atan2(p.mouseY - (h - 60), p.mouseX - swordX);
        p.rotate(targetAngle + p.PI / 2.2 - swing);

        // Hilt grip
        p.fill('#ca8a04');
        p.rect(-6, -20, 12, 4); // cross guard
        p.fill('#1c1917');
        p.rect(-3, -16, 6, 12); // handle grip
        p.fill('#ca8a04');
        p.ellipse(0, -2, 7, 7); // pommel disk

        // Master Saber Damascus Steel curved details
        const bladeColor = s.isShamsherSelected ? p.color('#f97316') : p.color('#94a3b8');
        p.fill(bladeColor);
        p.stroke('#f8fafc');
        p.strokeWeight(1);
        p.beginShape();
        // First curve: (-4, -20) to (-26, -135) with control (-11, -75)
        const curve1 = { p0x: -4, p0y: -20, pcx: -11, pcy: -75, p1x: -26, p1y: -135 };
        for (let t = 0; t <= 1; t += 0.2) {
          const x = (1 - t) * (1 - t) * curve1.p0x + 2 * (1 - t) * t * curve1.pcx + t * t * curve1.p1x;
          const y = (1 - t) * (1 - t) * curve1.p0y + 2 * (1 - t) * t * curve1.pcy + t * t * curve1.p1y;
          p.vertex(x, y);
        }
        // Vertex at (-21, -135)
        p.vertex(-21, -135);
        // Second curve: (-21, -135) to (4, -20) with control (-5, -75)
        const curve2 = { p0x: -21, p0y: -135, pcx: -5, pcy: -75, p1x: 4, p1y: -20 };
        for (let t = 0; t <= 1; t += 0.2) {
          const x = (1 - t) * (1 - t) * curve2.p0x + 2 * (1 - t) * t * curve2.pcx + t * t * curve2.p1x;
          const y = (1 - t) * (1 - t) * curve2.p0y + 2 * (1 - t) * t * curve2.pcy + t * t * curve2.p1y;
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);

        p.pop();
      }

      function drawMedievalReticle(p: p5, s: any) {
        // Dynamic focus locked HUD
        const lx = p.mouseX;
        const ly = p.mouseY;

        p.stroke(s.isShamsherSelected ? '#ea580c' : '#38bdf8');
        p.strokeWeight(1.5);
        p.noFill();
        p.ellipse(lx, ly, 28, 28);

        p.fill(s.isShamsherSelected ? '#ea580c' : '#38bdf8');
        p.ellipse(lx, ly, 4, 4);

        p.line(lx - 20, ly, lx - 9, ly);
        p.line(lx + 9, ly, lx + 20, ly);
        p.line(lx, ly - 20, lx, ly - 9);
        p.line(lx, ly + 9, lx, ly + 20);

        // Check locks on target list
        let focused = false;
        targetsRef.current.forEach(t => {
          if (t.hp > 0 && p.dist(t.x, t.y, lx, ly) < (28 * t.z + 18)) {
            focused = true;
          }
        });

        if (focused) {
          p.textAlign(p.LEFT, p.CENTER);
          p.textSize(8);
          p.noStroke();
          p.fill('#ef4444');
          p.text("TARGET LCK - CRITICAL", lx + 18, ly);
        }
      }

      // Drawing projectile arcs
      function updateAndDrawArtillery(p: p5, w: number, h: number) {
        const shells = shellRef.current;
        for (let i = shells.length - 1; i >= 0; i--) {
          const sh = shells[i];
          sh.progress += 0.024;

          const dx = sh.targetX - sh.startX;
          const dy = sh.targetY - sh.startY;
          sh.currentX = sh.startX + dx * sh.progress;
          // Parabolic throw trajectory
          const parabola = p.sin(sh.progress * p.PI) * 110;
          sh.currentY = sh.startY + dy * sh.progress - parabola;

          p.fill('#1e293b');
          p.stroke('#ca8a04');
          p.strokeWeight(1.2);
          p.ellipse(sh.currentX, sh.currentY, sh.size, sh.size);

          // Spark trail
          if (p.random(1) < 0.35) {
            spawnParticle(sh.currentX, sh.currentY, p.random(-1, 1), p.random(-1, 1), '#f59e0b', 3, 0.04);
          }

          if (sh.progress >= 1.0) {
            // Impact!
            spawnMassiveExplosion(sh.targetX, sh.targetY);
            shakeRef.current = 24;

            // Deal relative radius splash damage to targets on landing
            targetsRef.current.forEach(t => {
              if (t.hp > 0 && p.dist(t.x, t.y, sh.targetX, sh.targetY) < 65) {
                const splashDmg = Math.round(35 * t.z);
                t.hp = p.max(0, t.hp - splashDmg);
                spawnHitSplatter(t.x, t.y, '#ea580c', 0.8);

                textsRef.current.push({
                  x: t.x,
                  y: t.y - 15,
                  text: `CRATER SPLASH! -${splashDmg}`,
                  alpha: 220,
                  color: '#ca8a04',
                  scale: 0.95,
                  vy: -1.5
                });
              }
            });

            // Remove shell
            renderGroundImpactScorchArc(p, sh.targetX, sh.targetY);
            shells.splice(i, 1);
          }
        }
      }

      function renderGroundImpactScorchArc(p: p5, x: number, y: number) {
        // permanently paint small burn mark on soil background (simulation of a permanent scar)
        for (let i = 0; i < 15; i++) {
          spawnParticle(
            x + p.random(-15, 15),
            y + p.random(-8, 8),
            0,
            0,
            'rgba(28, 25, 23, 0.88)',
            4 + p.random(6),
            0.005
          );
        }
      }

      // Drawing Floating HUD indicators
      function updateFloatingTexts(p: p5) {
        const arr = textsRef.current;
        p.textAlign(p.CENTER, p.CENTER);
        for (let i = arr.length - 1; i >= 0; i--) {
          const item = arr[i];
          p.textSize(9 * item.scale);
          p.textStyle(p.BOLD);
          let col = p.color(item.color);
          col.setAlpha(item.alpha);
          p.fill(col);
          // subtle dark drop shadow
          p.text(item.text, item.x, item.y);

          item.y += item.vy;
          item.alpha -= 4.5;
          if (item.alpha <= 0) {
            arr.splice(i, 1);
          }
        }
      }

      // Volumetric Particle System updates
      function updateParticles(p: p5) {
        const arr = particlesRef.current;
        for (let i = arr.length - 1; i >= 0; i--) {
          const pt = arr[i];
          let col = p.color(pt.color);
          col.setAlpha(pt.alpha * 220);
          p.fill(col);
          p.noStroke();
          p.ellipse(pt.x, pt.y, pt.size, pt.size);

          pt.x += pt.vx;
          pt.y += pt.vy;
          if (pt.gravity) {
            pt.vy += pt.gravity;
          }
          pt.alpha -= pt.decay;
          if (pt.alpha <= 0) {
            arr.splice(i, 1);
          }
        }
      }

      // Interactive actions responder
      function handleInteractionsQueue(s: any) {
        if (!s.clashAction || s.clashAction === 'none') {
          lastProcessedClashRef.current = null;
          return;
        }
        if (s.clashAction === lastProcessedClashRef.current) return;
        lastProcessedClashRef.current = s.clashAction;

        if (s.clashAction === 'artillery') {
          // Trigger double-sided crossfire heavy brass salvos
          triggerCannonball(p.width * 0.1, p.height - 40, p.width * 0.38, p.height * 0.38);
          triggerCannonball(p.width * 0.1, p.height - 40, p.width * 0.28, p.height * 0.35);
          triggerCannonball(p.width * 0.9, p.height - 40, p.width * 0.62, p.height * 0.38);
          triggerCannonball(p.width * 0.9, p.height - 40, p.width * 0.72, p.height * 0.35);

          // Trigger recoil transitions
          setCannonRecoil(1);
          setTimeout(() => setCannonRecoil(0), 900);
          shakeRef.current = p.min(shakeRef.current + 22, 34);

          triggerCommanderShout(
            s.activeFaction === 'maratha' ? "Ibrahim Khan Gardi" : "Shah Wali Khan",
            s.activeFaction === 'maratha' ? "Artillery General" : "Grand Wazir",
            "🔥 Artillery Cannonball Salvo",
            s.activeFaction === 'maratha'
              ? "Level nine-pounders at their columns! Sweep their trenches clean, Har Har Mahadev!"
              : "Let loose our thunderous royal batteries! Scatter their line formations!",
            s.activeFaction
          );
        } else if (s.clashAction === 'bomb') {
          // Spawn center crater blast
          spawnMassiveExplosion(p.width * 0.5, p.height * 0.42);
          shakeRef.current = 28;
          triggerCommanderShout(
            "Ibrahim Khan Gardi",
            "French Artillery Expert",
            "💣 Cannister Mortar Bomb",
            "Level canister shot at coordinate center! Clear space for the advancing cavalry!",
            "maratha"
          );
        } else if (s.clashAction === 'flank') {
          shakeRef.current = 18;
          // Spawn big cavalry dust storm
          const horizon = p.height * 0.36;
          for (let i = 0; i < 25; i++) {
            spawnParticle(
              p.random(p.width),
              horizon + p.random(110),
              p.random(-5, 5),
              p.random(-1.5, 1.5),
              'rgba(245, 158, 11, 0.38)',
              18 + p.random(20),
              0.015
            );
          }
          triggerCommanderShout(
            "Shamsher Bahadur",
            "Left Flank Cavalry Chief",
            "🐎 Left Flank Charge",
            "Flank them from the Yamuna sandbanks! Ride like the wind and split their lines!",
            "maratha"
          );
        } else if (s.clashAction === 'defend') {
          triggerCommanderShout(
            s.activeFaction === 'maratha' ? "Vishwasrao Peshwa" : "Najib-ud-Daula",
            s.activeFaction === 'maratha' ? "Young Prince" : "Rohilla Clan Chief",
            "🛡️ Heavy Shield Block",
            s.activeFaction === 'maratha'
              ? "Hold standard lines tightly! Turn back their Pashtun Ghazi charge!"
              : "Brace under their Garmadi artillery shell impacts! Shield front divisions!",
            s.activeFaction
          );
        } else if (s.clashAction === 'adrenaline') {
          triggerCommanderShout(
            "Sadashivrao Bhau",
            "Peshwa Generalissimo",
            "🚩 Imperial Standard Saffron",
            "Rally to the gold borders of the Peshwas! Bandage your wounds, for we fight until ultimate victory!",
            "maratha"
          );
        }
      }
    };

    // Instantiate p5 inside React ref
    const myP5Instance = new p5(sketch);
    p5InstanceRef.current = myP5Instance;

    // Window resize handler mapping
    const handleResize = () => {
      if (p5InstanceRef.current && containerRef.current) {
        const w = containerRef.current.clientWidth || 800;
        const h = containerRef.current.clientHeight || 480;
        p5InstanceRef.current.resizeCanvas(w, h);
      }
    };

    window.addEventListener('resize', handleResize);
    // Execute immediate alignment
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  // Left mouse clicking in component initiates first person melee Talwar swings or chest looting
  const handleCanvasContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !p5InstanceRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const p = p5InstanceRef.current;
    const rightNow = Date.now();

    // Swipe progress triggering
    setSwordSlashProgress(1);
    const angleToMouse = p.atan2(clickY - (p.height - 40), clickX - (p.width * 0.8));
    setSlashAngle(angleToMouse);

    setTimeout(() => {
      setSwordSlashProgress(0);
    }, 150);

    // Minor sword swing swoosh sparks
    for (let i = 0; i < 18; i++) {
      spawnParticle(
        clickX,
        clickY,
        p.random(-6, 6),
        p.random(-6, 6),
        isShamsherSelected ? '#ff7e15' : '#52b5ee',
        2.5 + p.random(3.5),
        0.04
      );
    }

    // Proximity checks against airdrop crate
    const crateDist = p.dist(airdropCrateRef.current.x, airdropCrateRef.current.y, clickX, clickY);
    if (!airdropCrateRef.current.claimed && crateDist < 48) {
      airdropCrateRef.current.claimed = true;
      spawnMassiveExplosion(airdropCrateRef.current.x, airdropCrateRef.current.y);

      // Trigger loot callback
      if (callbacksRef.current.onLootSuccess) {
        callbacksRef.current.onLootSuccess();
      }

      textsRef.current.push({
        x: airdropCrateRef.current.x,
        y: airdropCrateRef.current.y - 12,
        text: '📦 CARGO CHEST OPENED!',
        alpha: 255,
        color: '#fbbf24',
        scale: 1.25,
        vy: -1.5
      });
      return;
    }

    // Melée strike checks against hostiles
    let hitAny = false;
    targetsRef.current.forEach(t => {
      if (t.hp <= 0) return;

      const relativeBound = 26 * t.z + 24;
      const dist = p.dist(t.x, t.y, clickX, clickY);

      if (dist < relativeBound) {
        hitAny = true;
        const damage = isShamsherSelected ? 38 : 25;
        t.hp = p.max(0, t.hp - damage);

        spawnHitSplatter(t.x, t.y, '#b91c1c', 1.1);
        spawnHitSplatter(t.x, t.y, '#fb923c', 0.8);
        shakeRef.current = p.min(shakeRef.current + 16, 28);

        const lbl = isShamsherSelected ? '⚔️ SHAMSHER SECURED CUT!' : '⚔️ SWORD SLASH IMPACT!';
        if (callbacksRef.current.onEnemyHit) {
          callbacksRef.current.onEnemyHit(damage, lbl);
        }

        textsRef.current.push({
          x: t.x,
          y: t.y - 15,
          text: `SWORD SLASH! -${damage}`,
          alpha: 255,
          color: isShamsherSelected ? '#ea580c' : '#38bdf8',
          scale: 1.1,
          vy: -1.8
        });
      }
    });

    if (!hitAny) {
      textsRef.current.push({
        x: clickX,
        y: clickY - 10,
        text: 'SWISH',
        alpha: 150,
        color: '#a8a29e',
        scale: 0.8,
        vy: -1
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleCanvasContainerClick}
      className="relative w-full h-full cursor-crosshair select-none bg-black overflow-hidden"
    >
      {/* Absolute positional glass overlay wrappers for movie immersion */}
      <div className="absolute inset-0 pointer-events-none border-t border-[#f97316]/20 opacity-35 z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_50%,rgba(0,0,0,0.8)_100%)] z-10" />
    </div>
  );
};
