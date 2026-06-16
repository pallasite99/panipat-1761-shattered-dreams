import React, { useEffect, useRef, useState } from 'react';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 400, y: 250 });
  const [lastClickTime, setLastClickTime] = useState(0);
  const [slashAngle, setSlashAngle] = useState(0);

  // Sound/Vocal message throttling refs
  const lastShoutTimeRef = useRef<number>(0);
  const registeredShoutsRef = useRef<Set<string>>(new Set());
  const deadAlliesRef = useRef<Set<number>>(new Set());
  const deadEnemiesRef = useRef<Set<number>>(new Set());
  const lowHpAlertedRef = useRef<Set<number>>(new Set());
  const battleModeRef = useRef<'marching' | 'scattered'>('marching');

  const triggerCommanderShout = (speaker: string, role: string, avatar: string, text: string, faction: 'maratha' | 'durrani') => {
    const now = Date.now();
    if (now - lastShoutTimeRef.current < 7500) return; // Throttle dialogues
    if (registeredShoutsRef.current.has(text)) return;
    
    registeredShoutsRef.current.add(text);
    setTimeout(() => {
      registeredShoutsRef.current.delete(text);
    }, 35000);

    lastShoutTimeRef.current = now;
    if (onCommanderShout) {
      onCommanderShout(speaker, role, avatar, text, faction);
    }
  };

  // Read if playing as Shamsher Bahadur, Parvatibai, or Gopikabai from state/local storage
  const isShamsherSelected = localStorage.getItem('panipat_campaign_general') === 'shamsher';
  const isParvatibaiSelected = localStorage.getItem('panipat_campaign_general') === 'parvatibai';
  const isGopikabaiSelected = localStorage.getItem('panipat_campaign_general') === 'gopikabai';
  const isRaghobaSelected = localStorage.getItem('panipat_campaign_general') === 'raghoba';

  // Gameplay lists tracked across animation frames
  const slashesRef = useRef<SwordSlashEffect[]>([]);
  const shellRef = useRef<ArtilleryShell[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const textsRef = useRef<FloatingCombatText[]>([]);
  const bulletTracersRef = useRef<BulletTracer[]>([]);
  const shakeRef = useRef<number>(0);
  const lastProcessedClashRef = useRef<string | null>(null);
  
  // Airdrop Parachute Box (Medieval Cargo supply tied to a historical crest)
  const airdropCrateRef = useRef({
    x: 0,
    y: -120,
    targetY: 210,
    active: true,
    claimed: false,
    speed: 0.7
  });

  // Cannon recoil animation state
  const [cannonRecoil, setCannonRecoil] = useState(0);
  // Sword slash swing animation state
  const [swordSlashProgress, setSwordSlashProgress] = useState(0);

  // Targets representing medieval historical combatants
  const targetsRef = useRef<{ 
    id: number; 
    x: number; 
    y: number; 
    z: number; 
    hp: number; 
    maxHp?: number;
    vx: number; 
    type: string;
    shieldActive: boolean;
    shootCooldown?: number;
    targetAllyId?: number | null;
    isCommander?: boolean;
    commanderName?: string;
    commanderRole?: string;
    commanderMount?: string;
    commanderColor?: string;
  }[]>([]);

  // Allied soldiers clashing with Afghan forces
  const alliedSoldiersRef = useRef<{
    id: number;
    x: number;
    y: number;
    z: number;
    hp: number;
    maxHp?: number;
    vx: number;
    type: string;
    boboffset: number;
    slashTimer: number;
    targetEnemyId: number | null;
    shootCooldown?: number;
    isCommander?: boolean;
    commanderName?: string;
    commanderRole?: string;
    commanderMount?: string;
    commanderColor?: string;
  }[]>([]);

  const getAlliedCommanderInfo = () => {
    if (activeFaction === 'maratha') {
      if (stage === 'SHINDE_STAND') {
        return { name: "Dattaji Shinde", role: "Scindia General", mount: "horse", color: "#ea580c" };
      }
      if (stage === 'GWALIOR') {
        return { name: "Mahadji Shinde", role: "Gwalior Ruler", mount: "elephant", color: "#ea580c" };
      }
      if (isShamsherSelected) {
        return { name: "Shamsher Bahadur", role: "Cavalry Commander", mount: "horse", color: "#ea580c" };
      }
      if (isParvatibaiSelected) {
        return { name: "Queen Parvatibai", role: "Camp Pillar", mount: "horse", color: "#ec4899" };
      }
      if (isGopikabaiSelected) {
        return { name: "Regent Gopikabai", role: "Regent Empress", mount: "elephant", color: "#ea580c" };
      }
      if (isRaghobaSelected) {
        return { name: "Raghunathrao (Raghoba)", role: "Frontier Conqueror", mount: "horse", color: "#f59e0b" };
      }
      return { name: "Sadashivrao Bhau", role: "Peshwa Generalissimo", mount: "elephant", color: "#ea580c" };
    } else {
      if (stage === 'NIZAM_CAMPAIGN') {
        return { name: "Nizam Salabat Jung", role: "Deccan Sovereign", mount: "elephant", color: "#0284c7" };
      }
      if (stage === 'SHINDE_STAND' || stage === 'DELHI_NEGOTIATIONS') {
        return { name: "Najib-ud-Daula", role: "Rohilla Chief", mount: "horse", color: "#0284c7" };
      }
      return { name: "Ahmad Shah Abdali", role: "Durrani Sovereign", mount: "elephant", color: "#059669" };
    }
  };

  const getEnemyCommanderInfo = () => {
    if (activeFaction === 'maratha') {
      if (stage === 'NIZAM_CAMPAIGN') {
        return { name: "Nizam Salabat Jung", role: "Deccan Sovereign", mount: "elephant", color: "#0284c7" };
      }
      if (stage === 'SHINDE_STAND') {
        return { name: "Najib-ud-Daula", role: "Rohilla Chief", mount: "horse", color: "#059669" };
      }
      return { name: "Ahmad Shah Abdali", role: "Durrani Sovereign", mount: "elephant", color: "#059669" };
    } else {
      if (stage === 'SHINDE_STAND') {
        return { name: "Dattaji Shinde", role: "Scindia General", mount: "horse", color: "#ea580c" };
      }
      if (stage === 'GWALIOR') {
        return { name: "Mahadji Shinde", role: "Gwalior Ruler", mount: "elephant", color: "#ea580c" };
      }
      if (isShamsherSelected) {
        return { name: "Shamsher Bahadur", role: "Cavalry Commander", mount: "horse", color: "#ea580c" };
      }
      if (isParvatibaiSelected) {
        return { name: "Queen Parvatibai", role: "Camp Pillar", mount: "horse", color: "#ec4899" };
      }
      if (isGopikabaiSelected) {
        return { name: "Regent Gopikabai", role: "Regent Empress", mount: "elephant", color: "#ea580c" };
      }
      if (isRaghobaSelected) {
        return { name: "Raghunathrao (Raghoba)", role: "Frontier Conqueror", mount: "horse", color: "#f59e0b" };
      }
      return { name: "Sadashivrao Bhau", role: "Peshwa Generalissimo", mount: "elephant", color: "#ea580c" };
    }
  };

  useEffect(() => {
    // Populate historic targets based on faction and stage
    let targetTypes: string[] = [];
    if (activeFaction === 'maratha') {
      if (stage === 'NIZAM_CAMPAIGN') {
        targetTypes = ['Nizam Infantryman', 'Nizam Deccan Cavalry', 'Nizam Swivel Gunner', 'Nizam War Elephant'];
      } else {
        targetTypes = ['Pashtun Ghazi swordsman', 'Durrani Elite Cavalry', 'Camel Swivel Zamburak', 'Durrani War Elephant'];
      }
    } else {
      // playing as Durrani
      if (stage === 'NIZAM_CAMPAIGN') {
        targetTypes = ['Kabul Rebel Fighter', 'Khyber Rebel Scout', 'Khyber Swivel Gunner', 'Rebel Chieftain Elephant'];
      } else {
        targetTypes = ['Maratha Mawala Swordsman', 'Gardi Infantry', 'Maratha Spear Cavalry', 'Maratha War Elephant'];
      }
    }

    let allyTypes: string[] = [];
    if (activeFaction === 'maratha') {
      allyTypes = ['Maratha Mawala Swordsman', 'Gardi Infantry', 'Maratha Spear Cavalry', 'Maratha War Elephant'];
    } else {
      allyTypes = ['Pashtun Ghazi swordsman', 'Durrani Elite Cavalry', 'Camel Swivel Zamburak', 'Durrani War Elephant'];
    }

    const initialTargets = [];
    const enemyCommander = getEnemyCommanderInfo();
    // Add enemy commander
    initialTargets.push({
      id: 999,
      x: 800 - 180,
      y: 210,
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
      commanderColor: enemyCommander.color
    });

    for (let i = 0; i < 7; i++) {
      const z = 0.4 + (i % 4) * 0.14;
      const isRear = i % 2 === 1;
      const initialW = 800;
      initialTargets.push({
        id: i,
        x: isRear ? (initialW - 60 - (i % 3) * 15) : (initialW - 150 - (i % 3) * 15),
        y: 170 + (i % 4) * 18, 
        z,
        hp: i % 4 === 3 ? 180 : 100,
        maxHp: i % 4 === 3 ? 180 : 100,
        vx: (i % 4 === 3 ? 0.22 : 0.4 + Math.random() * 0.5) * (i % 2 === 0 ? 1 : -1),
        type: targetTypes[i % 4] || 'Target',
        shieldActive: i % 2 === 0
      });
    }
    targetsRef.current = initialTargets;

    const initialAllies = [];
    const allyCommander = getAlliedCommanderInfo();
    // Add allied commander
    initialAllies.push({
      id: 1000,
      x: 180,
      y: 260,
      z: 0.9,
      hp: 350,
      maxHp: 350,
      vx: 0.3,
      type: allyCommander.name,
      boboffset: 0,
      slashTimer: 0,
      targetEnemyId: null,
      isCommander: true,
      commanderName: allyCommander.name,
      commanderRole: allyCommander.role,
      commanderMount: allyCommander.mount,
      commanderColor: allyCommander.color
    });

    for (let i = 0; i < 6; i++) {
      const z = 0.45 + (i % 4) * 0.14;
      const isRear = i % 2 === 1;
      initialAllies.push({
        id: 100 + i,
        x: isRear ? (60 + (i % 3) * 15) : (150 + (i % 3) * 15),
        y: 230 + (i % 4) * 20,
        z,
        hp: i % 4 === 3 ? 180 : 100,
        maxHp: i % 4 === 3 ? 180 : 100,
        vx: (i % 4 === 3 ? 0.22 : 0.42 + Math.random() * 0.4) * (i % 2 === 0 ? 1 : -1),
        type: allyTypes[i % 4] || 'Ally',
        boboffset: Math.random() * Math.PI,
        slashTimer: 0,
        targetEnemyId: null
      });
    }
    alliedSoldiersRef.current = initialAllies;
  }, [activeFaction, stage]);

  // Real-time spawning listener to add elite reinforcements visually into active canvas loops!
  const prevSpawnAllyTrigger = useRef(0);
  const prevSpawnEnemyTrigger = useRef(0);

  useEffect(() => {
    if (phase !== 'clash') {
      // Keep triggers in sync on reset
      prevSpawnAllyTrigger.current = spawnAllyTrigger;
      prevSpawnEnemyTrigger.current = spawnEnemyTrigger;
      return;
    }

    // Track state of ally spawning trigger increment
    if (spawnAllyTrigger > prevSpawnAllyTrigger.current) {
      const addedCount = spawnAllyTrigger - prevSpawnAllyTrigger.current;
      prevSpawnAllyTrigger.current = spawnAllyTrigger;

      // Spawn 'addedCount' of spawnAllyType
      const newAllies = [...alliedSoldiersRef.current];
      for (let i = 0; i < addedCount; i++) {
        const randomId = 200 + Math.floor(Math.random() * 10000);
        const z = 0.45 + Math.random() * 0.45;
        const normZ = Math.max(0, Math.min(1, (z - 0.45) / 0.55));
        const yCoord = 210 + normZ * 80;

        newAllies.push({
          id: randomId,
          x: 40 + Math.random() * 100, // spawn on player side (left edge)
          y: yCoord,
          z,
          hp: 140, // strong health
          vx: 0.5 + Math.random() * 0.3,
          type: spawnAllyType || 'Royal Guard Vanguard',
          boboffset: Math.random() * Math.PI,
          slashTimer: 0,
          targetEnemyId: null
        });
      }
      alliedSoldiersRef.current = newAllies;
    }

    // Track state of enemy spawning trigger increment
    if (spawnEnemyTrigger > prevSpawnEnemyTrigger.current) {
      const addedCount = spawnEnemyTrigger - prevSpawnEnemyTrigger.current;
      prevSpawnEnemyTrigger.current = spawnEnemyTrigger;

      // Spawn 'addedCount' of spawnEnemyType
      const newTargets = [...targetsRef.current];
      for (let i = 0; i < addedCount; i++) {
        const randomId = 200 + Math.floor(Math.random() * 10000);
        const z = 0.4 + Math.random() * 0.5;
        const normZ = Math.max(0, Math.min(1, (z - 0.4) / 0.55));
        const yCoord = 170 + normZ * 82;

        newTargets.push({
          id: randomId,
          x: 700 + Math.random() * 60, // spawn on enemy side (right edge)
          y: yCoord,
          z,
          hp: 130, // strong health
          vx: -(0.48 + Math.random() * 0.35),
          type: spawnEnemyType || 'Afghan Heavy Ghasi Sworder',
          shieldActive: Math.random() > 0.5,
          shootCooldown: 60,
          targetAllyId: null
        });
      }
      targetsRef.current = newTargets;
    }
  }, [spawnAllyTrigger, spawnEnemyTrigger, spawnAllyType, spawnEnemyType, phase]);

  const resetToStructuredFormations = (width: number, height: number) => {
    const horizon = height * 0.36;
    const minGroundY = horizon + 15;
    const maxGroundY = height * 0.72;

    targetsRef.current.forEach((t, i) => {
      if (t.isCommander) {
        t.hp = 350;
        t.maxHp = 350;
        t.x = width - 180;
        t.z = 0.85;
        const normZ = Math.max(0, Math.min(1, (0.85 - 0.4) / 0.55));
        t.y = minGroundY + normZ * (maxGroundY - minGroundY);
        t.vx = -0.3;
        t.targetAllyId = null;
      } else {
        t.hp = i % 4 === 3 ? 180 : 100; // Reset health
        t.maxHp = i % 4 === 3 ? 180 : 100;
        const isRear = i % 2 === 1;
        t.x = isRear ? (width - 60 - (i % 3) * 15) : (width - 150 - (i % 3) * 15);
        
        const z = 0.4 + (i % 4) * 0.14;
        t.z = z;
        const normZ = Math.max(0, Math.min(1, (z - 0.4) / 0.55));
        t.y = minGroundY + normZ * (maxGroundY - minGroundY);

        t.vx = (i % 4 === 3 ? 0.22 : 0.35 + Math.random() * 0.5) * (i % 2 === 0 ? 1 : -1);
        t.targetAllyId = null;
      }
    });

    alliedSoldiersRef.current.forEach((a, i) => {
      if (a.isCommander) {
        a.hp = 350;
        a.maxHp = 350;
        a.x = 180;
        a.z = 0.9;
        const normZ = Math.max(0, Math.min(1, (0.9 - 0.4) / 0.55));
        a.y = (minGroundY + 35) + normZ * (maxGroundY - (minGroundY + 35));
        a.vx = 0.3;
        a.targetEnemyId = null;
      } else {
        a.hp = i % 4 === 3 ? 180 : 100; // Reset health
        a.maxHp = i % 4 === 3 ? 180 : 100;
        const isRear = i % 2 === 1;
        a.x = isRear ? (60 + (i % 3) * 15) : (150 + (i % 3) * 15);
        
        const z = 0.45 + (i % 4) * 0.14;
        a.z = z;
        const normZ = Math.max(0, Math.min(1, (z - 0.4) / 0.55));
        a.y = (minGroundY + 35) + normZ * (maxGroundY - (minGroundY + 35));

        a.vx = (i % 4 === 3 ? 0.22 : 0.42 + Math.random() * 0.4) * (i % 2 === 0 ? 1 : -1);
        a.targetEnemyId = null;
      }
    });

    battleModeRef.current = 'marching';
  };

  const lastPhaseRef = useRef(phase);
  useEffect(() => {
    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      const canvas = canvasRef.current;
      if (canvas) {
        resetToStructuredFormations(canvas.width, canvas.height);
      }
    }
  }, [phase]);

  // Set up the main high-fidelity ticker loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncResolution = () => {
      const w = canvas.offsetWidth || 800;
      const h = canvas.offsetHeight || 480;
      canvas.width = w;
      canvas.height = h;
      airdropCrateRef.current.x = w * 0.6;

      // Dynamically calculate perspective ground positioning based on the actual height of the viewport
      const horizon = h * 0.36;
      const minGroundY = horizon + 15;
      const maxGroundY = h * 0.72;

      targetsRef.current.forEach(t => {
        const normZ = Math.max(0, Math.min(1, (t.z - 0.4) / 0.55));
        t.y = minGroundY + normZ * (maxGroundY - minGroundY);
        // Snap to structured horizontal ranks if not currently in live clashing combat
        if (phase !== 'clash' && phase !== 'resolution' && phase !== 'defeat') {
          if (t.isCommander) {
            t.x = w - 180;
          } else {
            const isRear = t.id % 2 === 1;
            t.x = isRear ? (w - 60 - (t.id % 3) * 15) : (w - 150 - (t.id % 3) * 15);
          }
        }
      });

      alliedSoldiersRef.current.forEach(a => {
        const normZ = Math.max(0, Math.min(1, (a.z - 0.4) / 0.55));
        a.y = (minGroundY + 35) + normZ * (maxGroundY - (minGroundY + 35));
        if (phase !== 'clash' && phase !== 'resolution' && phase !== 'defeat') {
          if (a.isCommander) {
            a.x = 180;
          } else {
            const idx = a.id - 100;
            const isRear = idx % 2 === 1;
            a.x = isRear ? (60 + (idx % 3) * 15) : (150 + (idx % 3) * 15);
          }
        }
      });
    };

    syncResolution();
    window.addEventListener('resize', syncResolution);

    let frameId: number;
    let time = 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastWidth = canvas.offsetWidth || 800;
    let lastHeight = canvas.offsetHeight || 480;

    const loop = () => {
      time += 0.016;

      const currentW = canvas.offsetWidth;
      const currentH = canvas.offsetHeight;
      if (currentW > 0 && currentH > 0 && (currentW !== lastWidth || currentH !== lastHeight)) {
        lastWidth = currentW;
        lastHeight = currentH;
        syncResolution();
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Decelerate and damp screen shake dynamically per frame
      shakeRef.current = Math.max(0, shakeRef.current * 0.88);
      const appliedShake = shakeRef.current > 0.05;
      if (appliedShake) {
        ctx.save();
        const shakeX = (Math.random() - 0.5) * shakeRef.current * 1.5;
        const shakeY = (Math.random() - 0.5) * shakeRef.current * 1.5;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Draw 3D Landscape (Haryana Plains / Udgir hill sides converging to central horizon)
      drawLandscape(ctx, canvas, time);

      // 2. Draw Airdrop Parachute Care Package
      drawMedievalSupplyBox(ctx, canvas, time);

      // Stream next wave automatic if hostiles are vanquished
      if (targetsRef.current.length > 0 && targetsRef.current.every(t => t.hp <= 0)) {
        let waveTargetTypes: string[] = [];
        if (activeFaction === 'maratha') {
          if (stage === 'NIZAM_CAMPAIGN') {
            waveTargetTypes = ['Nizam Infantryman', 'Nizam Deccan Cavalry', 'Nizam Swivel Gunner', 'Nizam War Elephant'];
          } else {
            waveTargetTypes = ['Pashtun Ghazi swordsman', 'Durrani Elite Cavalry', 'Camel Swivel Zamburak', 'Durrani War Elephant'];
          }
        } else {
          if (stage === 'NIZAM_CAMPAIGN') {
            waveTargetTypes = ['Kabul Rebel Fighter', 'Khyber Rebel Scout', 'Khyber Swivel Gunner', 'Rebel Chieftain Elephant'];
          } else {
            waveTargetTypes = ['Maratha Mawala Swordsman', 'Gardi Infantry', 'Maratha Spear Cavalry', 'Maratha War Elephant'];
          }
        }

        let waveAllyTypes: string[] = [];
        if (activeFaction === 'maratha') {
          waveAllyTypes = ['Maratha Mawala Swordsman', 'Gardi Infantry', 'Maratha Spear Cavalry', 'Maratha War Elephant'];
        } else {
          waveAllyTypes = ['Pashtun Ghazi swordsman', 'Durrani Elite Cavalry', 'Camel Swivel Zamburak', 'Durrani War Elephant'];
        }
        
        const minGroundY = canvas.height * 0.36 + 15;
        const maxGroundY = canvas.height * 0.72;
        
        const newTargets = [];
        const enemyCommander = getEnemyCommanderInfo();
        // Prepend enemy commander to new wave
        newTargets.push({
          id: Date.now() + 999,
          x: canvas.width - 180,
          y: minGroundY + Math.max(0, Math.min(1, (0.85 - 0.4) / 0.55)) * (maxGroundY - minGroundY),
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
          commanderColor: enemyCommander.color
        });

        for (let i = 0; i < 7; i++) {
          const z = 0.4 + (i % 4) * 0.14;
          const normZ = Math.max(0, Math.min(1, (z - 0.4) / 0.55));
          const y = minGroundY + normZ * (maxGroundY - minGroundY);
          const isRear = i % 2 === 1;
          
          newTargets.push({
            id: Date.now() + i,
            x: isRear ? (canvas.width - 60 - (i % 3) * 15) : (canvas.width - 150 - (i % 3) * 15),
            y,
            z,
            hp: i % 4 === 3 ? 180 : 100,
            maxHp: i % 4 === 3 ? 180 : 100,
            vx: (i % 4 === 3 ? 0.22 : 0.35 + Math.random() * 0.5) * (i % 2 === 0 ? 1 : -1),
            type: waveTargetTypes[i % 4] || 'Target',
            shieldActive: i % 2 === 0
          });
        }
        targetsRef.current = newTargets;

        const newAllies = [];
        const allyCommander = getAlliedCommanderInfo();
        // Prepend allied commander to new wave
        newAllies.push({
          id: Date.now() + 1000,
          x: 180,
          y: (minGroundY + 35) + Math.max(0, Math.min(1, (0.9 - 0.4) / 0.55)) * (maxGroundY - (minGroundY + 35)),
          z: 0.9,
          hp: 350,
          maxHp: 350,
          vx: 0.3,
          type: allyCommander.name,
          boboffset: 0,
          slashTimer: 0,
          targetEnemyId: null,
          isCommander: true,
          commanderName: allyCommander.name,
          commanderRole: allyCommander.role,
          commanderMount: allyCommander.mount,
          commanderColor: allyCommander.color
        });

        for (let i = 0; i < 6; i++) {
          const z = 0.45 + (i % 4) * 0.14;
          const normZ = Math.max(0, Math.min(1, (z - 0.4) / 0.55));
          const y = (minGroundY + 35) + normZ * (maxGroundY - (minGroundY + 35));
          const isRear = i % 2 === 1;

          newAllies.push({
            id: Date.now() + 100 + i,
            x: isRear ? (60 + (i % 3) * 15) : (150 + (i % 3) * 15),
            y,
            z,
            hp: i % 4 === 3 ? 180 : 100,
            maxHp: i % 4 === 3 ? 180 : 100,
            vx: (i % 4 === 3 ? 0.2 : 0.4 + Math.random() * 0.4) * (i % 2 === 0 ? 1 : -1),
            type: waveAllyTypes[i % 4] || 'Ally',
            boboffset: Math.random() * Math.PI,
            slashTimer: 0,
            targetEnemyId: null
          });
        }
        alliedSoldiersRef.current = newAllies;

        // Reset battleMode back to marching for the fresh battalions clashing
        battleModeRef.current = 'marching';

        // Trigger an exciting banner shout!
        const shoutCommander = activeFaction === 'maratha' ? "Sadashivrao Bhau" : "Shah Wali Khan";
        const shoutTitle = activeFaction === 'maratha' ? "Maratha Commander" : "Durrani Grand Wazir";
        const shoutText = activeFaction === 'maratha' 
          ? "Fresh Mawala columns and Gardi reserves have arrived from Gwalior! Hold the line, Har Har Mahadev!"
          : "Fresh Durrani reinforcement columns have arrived to join the fray! For the honor of Ahmad Shah Abdali, hold the center!";
        const shoutVoice = activeFaction;

        triggerCommanderShout(
          shoutCommander,
          shoutTitle,
          "📢 Fresh Reinforcements",
          shoutText,
          shoutVoice
        );
      }

      // 3. Update & Draw Medieval Hostile Targets
      updateAndDrawHostiles(ctx, canvas, time);

      // Automated Ambient Battlefield Cannon batteries in the distance (Haryana Plains War scale)
      if (phase === 'clash' && Math.random() < 0.008) {
        const targetX = canvas.width * 0.15 + Math.random() * (canvas.width * 0.7);
        const targetY = canvas.height * 0.36 + Math.random() * 90;
        const startX = Math.random() < 0.5 ? canvas.width * 0.03 : canvas.width * 0.97;
        const startY = canvas.height - 35;
        shellRef.current.push({
          startX,
          startY,
          currentX: startX,
          currentY: startY,
          targetX,
          targetY,
          progress: 0,
          size: 6 + Math.random() * 3
        });
      }

      // 3.5. Update & Draw Allied Maratha and Gardi Soldiers clashing in real melee combat
      updateAndDrawAllies(ctx, canvas, time);

      // 3.6. Update shooting timers & render dynamic tracer bullet vectors
      updateBulletShooting(time);
      updateAndDrawBulletTracers(ctx);

      // 3.7. Manage clashing formation transitions
      if (phase === 'clash' && battleModeRef.current === 'marching') {
        const liveAllies = alliedSoldiersRef.current.filter(a => a.hp > 0);
        const liveHostiles = targetsRef.current.filter(t => t.hp > 0);
        if (liveAllies.length > 0 && liveHostiles.length > 0) {
          const maxAllyX = Math.max(...liveAllies.map(a => a.x));
          const minHostileX = Math.min(...liveHostiles.map(t => t.x));
          
          if (minHostileX - maxAllyX < 110) {
            battleModeRef.current = 'scattered';
            
            // Dramatic collision coordinate
            const collisionX = (maxAllyX + minHostileX) / 2;
            const collisionY = canvas.height * 0.54;
            
            // Spawn intense battle clash impact sparks and trigger massive camera shake
            shakeRef.current = 32;
            for (let p = 0; p < 35; p++) {
              spawnParticle(
                collisionX + (Math.random() - 0.5) * 45,
                collisionY + (Math.random() - 0.5) * 70,
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 8 - 3,
                p % 3 === 0 ? '#b91c1c' : p % 3 === 1 ? '#ea580c' : '#facc15', // Crimson, saffron, and golden sparks
                3 + Math.random() * 4,
                0.03,
                0.12 // slight gravity so they fall back down!
              );
            }
            
            // Push majestic floating text on screen
            textsRef.current.push({
              x: collisionX,
              y: collisionY - 40,
              text: "⚔️ CLASH OF EMPIRES!",
              alpha: 1,
              color: '#ea580c', // Bold saffron/orange
              scale: 1.5,
              vy: -0.8
            });
            
            // Immediate Narrative Commander Shout
            triggerCommanderShout(
              "Sadashivrao Bhau",
              "Maratha Generalissimo",
              "🏇 Battlefront Engage",
              "The ranks have collided! For the honor of Pune, let loose the Mawala swordsmen and breach their front columns! Har Har Mahadev!",
              "maratha"
            );
          }
        }
      }

      // 4. Update and Draw active sword slash curves
      updateAndDrawSwordSlashes(ctx);

      // 5. Update and Draw heavy artillery traveling cannonballs
      updateAndDrawArtilleryShells(ctx, canvas);

      // 6. Draw dynamic medieval spark and smoke particle effects
      updateAndDrawParticles(ctx);

      // 7. Draw overhead damage floating indicator tags
      updateAndDrawDamageText(ctx);

      // 8. Draw first person visual fender (Brass Siege Cannon & curved Maratha Talwar blade)
      drawPOVWeapons(ctx, canvas, time);

      // 8.5. Draw Dynamic Weather & Time of Day atmospheric overlays (Midnight shadows, Rain, Dust storm, Fog)
      drawAtmosphericOverlay(ctx, canvas, time);

      // 9. Draw the combat sword & artillery crosshair
      drawMedievalReticle(ctx, canvas);

      // 10. Handle triggered background maneuvers we receive from actions
      handleActionInteractions(clashAction, enemyAction, canvas);

      if (appliedShake) {
        ctx.restore();
      }

      frameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', syncResolution);
      cancelAnimationFrame(frameId);
    };
  }, [phase, clashAction, enemyAction, activeFaction, cannonRecoil, swordSlashProgress, timeOfDay, weather]);

  // Respond dynamically to button triggers on the Dashboard
  const handleActionInteractions = (clash: typeof clashAction, enemy: typeof enemyAction, canvas: HTMLCanvasElement) => {
    if (!clash || clash === 'none') {
      lastProcessedClashRef.current = null;
      return;
    }
    if (clash === lastProcessedClashRef.current) {
      return;
    }
    lastProcessedClashRef.current = clash;

    if (clash === 'artillery') {
      // Trigger a massive cannon shell launch towards the center
      if (shellRef.current.length === 0) {
        // Left cannon fires dual batteries
        triggerCannonball(canvas.width * 0.1, canvas.height - 40, canvas.width * 0.35, canvas.height * 0.38);
        triggerCannonball(canvas.width * 0.1, canvas.height - 40, canvas.width * 0.28, canvas.height * 0.35);
        // Right cannon fires dual batteries in a gorgeous crossfire!
        triggerCannonball(canvas.width * 0.9, canvas.height - 40, canvas.width * 0.65, canvas.height * 0.38);
        triggerCannonball(canvas.width * 0.9, canvas.height - 40, canvas.width * 0.72, canvas.height * 0.36);
        setCannonRecoil(1);
        setTimeout(() => setCannonRecoil(0), 1000);
        
        // Massive recoil screenshake
        shakeRef.current = Math.min(shakeRef.current + 20, 36);

        triggerCommanderShout(
          activeFaction === 'maratha' ? "Ibrahim Khan Gardi" : "Shah Wali Khan",
          activeFaction === 'maratha' ? "Artillery Chief" : "Grand Wazir",
          "🔥 Grand Salvo",
          activeFaction === 'maratha' 
            ? "Fire our French heavy nine-pounders! Tear open their flanks and scatter their Rohilla infantry lines!"
            : "Let loose our roaring royal batteries! Shake their very souls and disperse their ranks!",
          activeFaction
        );
      }
    } else if (clash === 'bomb') {
      // Spawn a massive explosion near the center guaranteed and shake!
      spawnMassiveExplosion(canvas.width * 0.5, canvas.height * 0.4);
      shakeRef.current = Math.min(shakeRef.current + 28, 48);
      spawnHitSplatter(canvas.width * 0.5, canvas.height * 0.4, '#eab308', 2.0); // massive golden bursts
      spawnHitSplatter(canvas.width * 0.5, canvas.height * 0.4, '#7c2d12', 1.8); // dark ejecta clay/soil
      
      triggerCommanderShout(
        "Ibrahim Khan Gardi",
        "Artillery Chief",
        "💣 Mortar Cannons",
        "Garmadi canister shot, level the center quadrant! Let hot iron sweep the battlefield and decimate their advance!",
        "maratha"
      );
    } else if (clash === 'flank') {
      // Spawn dust clouds representing cavalry herd passing
      shakeRef.current = Math.min(shakeRef.current + 12, 22);
      for (let i = 0; i < 20; i++) {
        spawnParticle(
          Math.random() * canvas.width, 
          canvas.height * 0.36 + Math.random() * 120, 
          (Math.random() - 0.5) * 10, 
          (Math.random() - 0.5) * 3, 
          'rgba(245, 158, 11, 0.4)', 
          15 + Math.random() * 25,
          0.015
        );
      }
      triggerCommanderShout(
        "Shamsher Bahadur",
        "Cavalry Commander",
        "🐎 Cavalry Strike",
        "Saddle your steeds, sons of Baji Rao! Charge Najib's flank before they recover! For Shahu Maharaj and mastani's pride!",
        "maratha"
      );
    } else if (clash === 'defend') {
      triggerCommanderShout(
        "Vishwasrao Peshwa",
        "Young Peshwa Heir",
        "🛡️ Core Line",
        "Coalition shield barrier at the ready! Steady your footings! We must absorb their brutal Pashtun charge!",
        "maratha"
      );
    } else if (clash === 'adrenaline') {
      triggerCommanderShout(
        "Sadashivrao Bhau",
        "Generalissimo",
        "🚩 Imperial Standard",
        "Rally to the saffron flags! Mend your armor plates and nurse your wounds, warriors of Deccani soil. We fight until victory!",
        "maratha"
      );
    }
  };

  // Triggers visual cannonball movement
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

    const isRight = sx > 400; // Determine if launch origin is the left or right flanking battery
    const muzzleX = sx + (isRight ? -105 : 105);
    const muzzleY = sy - 48; // Align flush with rotated muzzle profiles

    // Muzzle smoke and fire flash particles
    for (let i = 0; i < 22; i++) {
      spawnParticle(
        muzzleX,
        muzzleY,
        (isRight ? -1 : 1) * (2 + Math.random() * 8), // Propel smoke towards center
        -1.5 + (Math.random() - 0.5) * 4,
        i % 2 === 0 ? '#ff8a00' : 'rgba(110,110,110,0.88)',
        5 + Math.random() * 15,
        0.03
      );
    }
  };

  const spawnParticle = (x: number, y: number, vx: number, vy: number, color: string, size: number, decay = 0.02, gravity?: number) => {
    particlesRef.current.push({ x, y, vx, vy, alpha: 1, color, size, decay, gravity });
  };

  const spawnHitSplatter = (x: number, y: number, color: string, intensity = 1) => {
    const count = Math.round((12 + Math.random() * 10) * intensity);
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 1.5 - Math.PI / 2; // general upward-facing spray arc
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
        0.18 // gravitational down acceleration
      );
    }
  };

  const spawnMassiveExplosion = (x: number, y: number) => {
    // Generate fire smoke ring
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

  // Left-clicking in the canvas performs a lightning sword strike (or targets can be sliced)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Source coordinates of player sword
    const sourceX = canvas.width * 0.8;
    const sourceY = canvas.height - 40;

    const rightNow = Date.now();
    if (rightNow - lastClickTime < 240) return; // melee swing cooldown
    setLastClickTime(rightNow);

    // Minor camera shake on swish swing
    shakeRef.current = Math.min(shakeRef.current + 4, 12);

    // Swap physical sword swing state to trigger animated swoosh
    setSwordSlashProgress(1);
    const cleanup = setTimeout(() => setSwordSlashProgress(0), 180);

    // Calculate click deflection angle for crescent shockwave
    const angleToTarget = Math.atan2(clickY - sourceY, clickX - sourceX);
    setSlashAngle(angleToTarget);

    // Push new slashing arc path directly matching the click
    slashesRef.current.push({
      x: clickX,
      y: clickY,
      length: isShamsherSelected ? 90 : 60,
      angle: angleToTarget + Math.PI / 2,
      progress: 0,
      color: isShamsherSelected ? 'rgba(251, 146, 60, 0.95)' : 'rgba(224, 242, 254, 0.9)'
    });

    // Spawn sparks where the blade swooshes
    for (let i = 0; i < 15; i++) {
      spawnParticle(
        clickX,
        clickY,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        isShamsherSelected ? '#ff7c1b' : '#38bdf8',
        2 + Math.random() * 4,
        0.04
      );
    }

    // Check hit intersections with live medieval hostiles
    let hitAny = false;
    targetsRef.current.forEach(t => {
      if (t.hp <= 0) return;

      const targetBound = 26 * t.z;
      const distance = Math.hypot(t.x - clickX, t.y - clickY);

      if (distance < targetBound + 25) {
        hitAny = true;
        
        // Critical sword strike calculation
        const baseDamage = isShamsherSelected ? 38 : 25;
        const totalDamage = Math.round(baseDamage * (isShamsherSelected ? 1.45 : 1));
        
        t.hp = Math.max(0, t.hp - totalDamage);

        // Dynamic physical particle and screenshake combat indicators
        const isElephantTarget = t.type.includes('Elephant');
        spawnHitSplatter(t.x, t.y, '#b91c1c', isElephantTarget ? 1.8 : 1.1); 
        spawnHitSplatter(t.x, t.y, '#eab308', isElephantTarget ? 1.5 : 0.85); 
        shakeRef.current = Math.min(shakeRef.current + (isShamsherSelected ? 18 : 12), 32);

        const headingLabel = isShamsherSelected 
          ? '⚔️ SHAMSHER SECURED CUT!' 
          : '⚔️ SWORD SLASH IMPACT!';

        onEnemyHit(totalDamage, headingLabel);

        textsRef.current.push({
          x: t.x,
          y: t.y - 20,
          text: `${headingLabel} -${totalDamage}%`,
          alpha: 1,
          color: isShamsherSelected ? '#f97316' : '#38bdf8',
          scale: isShamsherSelected ? 1.35 : 1.0,
          vy: -2
        });
      }
    });

    // Slicing the historic airdrop crate
    const distToCrate = Math.hypot(airdropCrateRef.current.x - clickX, airdropCrateRef.current.y - clickY);
    if (!airdropCrateRef.current.claimed && distToCrate < 45) {
      airdropCrateRef.current.claimed = true;
      spawnMassiveExplosion(airdropCrateRef.current.x, airdropCrateRef.current.y);
      onLootSuccess();
      
      textsRef.current.push({
        x: airdropCrateRef.current.x,
        y: airdropCrateRef.current.y - 15,
        text: '📦 CARGO CHEST OPENED!',
        alpha: 1,
        color: '#fbbf24',
        scale: 1.25,
        vy: -1.8
      });
    }

    if (!hitAny) {
      // Dust swish
      textsRef.current.push({
        x: clickX,
        y: clickY - 12,
        text: 'SWISH',
        alpha: 0.7,
        color: '#78716c',
        scale: 0.75,
        vy: -1
      });
    }
  };

  // Draw 3D Landscape (Haryana plains vanishing scale with dense warfare overview)
  const drawLandscape = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const width = canvas.width;
    const height = canvas.height;
    const horizon = height * 0.36;

    // Dark crimson sunset twilight sky (War mood representation)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#0a0403');
    skyGrad.addColorStop(0.4, '#240d08');
    skyGrad.addColorStop(0.85, '#45160c');
    skyGrad.addColorStop(1, '#5c1d0f');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizon);

    // Drifting battlefield smoke plumes across the horizon
    ctx.fillStyle = 'rgba(74, 60, 55, 0.2)';
    for (let i = 0; i < 4; i++) {
      const puffX = width * (0.15 + i * 0.25) + Math.sin(time * 0.5 + i) * 20;
      const puffY = horizon - 25 + Math.cos(time * 0.3 + i) * 6;
      ctx.beginPath();
      ctx.arc(puffX, puffY, 30 + i * 15, 0, Math.PI * 2);
      ctx.arc(puffX - 20, puffY, 20, 0, Math.PI * 2);
      ctx.arc(puffX + 20, puffY, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1b. If Siege / Fort Stage, draw the fortification walls on the horizon!
    const isSiegeStage = stage === 'NIZAM_CAMPAIGN' || stage === 'GWALIOR' || stage === 'DELHI_NEGOTIATIONS';
    if (isSiegeStage) {
      const wallHeight = height * 0.18;
      const wallY = horizon - wallHeight;

      // Draw solid basalt stone masonry wall
      ctx.fillStyle = '#44403c'; // heavy stone gray
      ctx.fillRect(0, wallY, width, wallHeight);

      // Draw mortar stone outline texture
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 1;
      for (let wx = 0; wx < width; wx += 40) {
        ctx.beginPath();
        ctx.moveTo(wx, wallY);
        ctx.lineTo(wx, wallY + wallHeight);
        ctx.stroke();
        // horizontal rows
        for (let ry = wallY; ry < wallY + wallHeight; ry += 12) {
          ctx.beginPath();
          ctx.moveTo(wx, ry);
          ctx.lineTo(wx + 40, ry);
          ctx.stroke();
        }
      }

      // Draw battlements/crenellations on top
      ctx.fillStyle = '#292524';
      const battlementWidth = 24;
      for (let bx = 0; bx < width; bx += battlementWidth * 2) {
        ctx.fillRect(bx, wallY - 10, battlementWidth, 10);
      }

      // Center Gatehouse
      const gateW = width * 0.25;
      const gateX = width * 0.5 - gateW * 0.5;
      const gateY = wallY + wallHeight - 40;

      // Arched gateway hollow background
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.roundRect(gateX, gateY, gateW, 40, [15, 15, 0, 0]);
      ctx.fill();

      // If gates are still intact, draw reinforce wooden gates!
      if (fortWallIntegrity !== undefined && fortWallIntegrity > 0) {
        ctx.fillStyle = '#78350f'; // mahogany dark wood
        ctx.beginPath();
        ctx.roundRect(gateX + 4, gateY + 2, gateW - 8, 38, [10, 10, 0, 0]);
        ctx.fill();

        // Iron bars and hinges
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.strokeRect(gateX + 4, gateY + 2, gateW - 8, 38);
        
        // Vertical grid lines
        ctx.beginPath();
        for (let gx = gateX + 15; gx < gateX + gateW - 10; gx += 15) {
          ctx.moveTo(gx, gateY + 2);
          ctx.lineTo(gx, gateY + 40);
        }
        ctx.stroke();

        // Draw cracks based on current integrity
        if (fortWallIntegrity < 100) {
          ctx.strokeStyle = '#f59e0b'; // orange fire crack glowing
          ctx.lineWidth = 2;
          ctx.beginPath();
          const crackAmount = Math.floor((100 - fortWallIntegrity) / 15);
          for (let c = 0; c < crackAmount; c++) {
            const cx = gateX + gateW * 0.15 + (c * 20) % (gateW * 0.7);
            ctx.moveTo(cx, gateY + 4);
            ctx.lineTo(cx + (Math.sin(time * 5 + c) * 10), gateY + 36);
          }
          ctx.stroke();

          // Spurt small embers/smoke puffs from cracking gate
          ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.beginPath();
          ctx.arc(gateX + gateW * 0.5 + Math.sin(time * 6) * 15, gateY + 15, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Gates are shattered/collapsed! Draw rubble and fire embers
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(gateX, gateY, gateW, 40);

        // Pile of debris rubble
        ctx.fillStyle = '#3f3f46';
        ctx.beginPath();
        ctx.moveTo(gateX - 10, gateY + 40);
        ctx.lineTo(gateX + gateW * 0.5, gateY + 15);
        ctx.lineTo(gateX + gateW + 10, gateY + 40);
        ctx.closePath();
        ctx.fill();

        // Fiery debris sparks
        ctx.fillStyle = '#f97316';
        for (let j = 0; j < 5; j++) {
          const ex = gateX + (Math.sin(time * 3 + j) * 0.4 + 0.5) * gateW;
          const ey = gateY + 15 + (j * 4) % 25;
          ctx.beginPath();
          ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Fortress Title bar with high visual hierarchy
      ctx.fillStyle = 'rgba(12, 10, 9, 0.85)';
      ctx.fillRect(width * 0.5 - 100, wallY - 32, 200, 16);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.5 - 100, wallY - 32, 200, 16);

      ctx.fillStyle = fortWallIntegrity !== undefined && fortWallIntegrity > 0 ? '#f59e0b' : '#34d399';
      ctx.font = '900 8.5px monospace';
      ctx.textAlign = 'center';
      const statusText = fortWallIntegrity !== undefined && fortWallIntegrity > 0 
        ? `FORTRESS RAMARTS: ${fortWallIntegrity}% INTEGRITY`
        : `🔓 GATEWAY BREACHED - STORM!`;
      ctx.fillText(statusText, width * 0.5, wallY - 21);
    } else {
      // Distant jagged mountain ranges & outpost ridges for non-fort plains maps
      ctx.fillStyle = '#150604';
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(width * 0.15, horizon - 16);
      ctx.lineTo(width * 0.28, horizon - 5);
      ctx.lineTo(width * 0.42, horizon - 24);
      ctx.lineTo(width * 0.55, horizon - 8);
      ctx.lineTo(width * 0.72, horizon - 28);
      ctx.lineTo(width * 0.88, horizon - 14);
      ctx.lineTo(width, horizon);
      ctx.closePath();
      ctx.fill();
    }

    // Drifting background campfire smoke and distant flashes
    ctx.fillStyle = 'rgba(239, 68, 68, 0.04)'; // war flashes
    if (Math.sin(time * 15) > 0.8) {
      ctx.fillRect(width * 0.2, horizon - 40, width * 0.6, 40);
    }

    ctx.fillStyle = 'rgba(92, 80, 75, 0.14)';
    for (let i = 0; i < 3; i++) {
      const sx = width * (0.2 + i * 0.3) + Math.sin(time + i) * 10;
      ctx.beginPath();
      ctx.arc(sx, horizon - 30, 15 + i * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground landscape base
    const groundGrad = ctx.createLinearGradient(0, horizon, 0, height);
    groundGrad.addColorStop(0, '#2e1c12');
    groundGrad.addColorStop(0.3, '#1c110b');
    groundGrad.addColorStop(0.7, '#130c08');
    groundGrad.addColorStop(1, '#0c0705');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizon, width, height - horizon);

    // PERSPECTIVE HIGH-ACCURACY WARFARE REGUMENTS (Thousands of distant tiny soldiers fighting)
    ctx.save();
    ctx.globalAlpha = 0.45; // Haze of war effect
    const bgSoldierCount = 60;
    for (let i = 0; i < bgSoldierCount; i++) {
      // Line them up along the boundary horizon coordinates
      const bx = (width * 0.12) + (i * ((width * 0.76) / bgSoldierCount)) + Math.sin(time * 2.5 + i) * 4;
      const by = horizon - 1.5 - (i % 3) * 2;
      const isMaratha = i % 2 === 0;
      ctx.fillStyle = isMaratha ? '#ff9933' : '#b91c1c'; // Saffron vs Crimson

      // Draw mini soldier hull block
      ctx.fillRect(bx, by - 5, 2, 5);
      
      // Draw tiny weapons spear/flag point
      ctx.beginPath();
      ctx.strokeStyle = isMaratha ? '#f59e0b' : '#3e2716';
      ctx.lineWidth = 0.6;
      ctx.moveTo(bx + 1, by - 5);
      ctx.lineTo(bx + 1 + (isMaratha ? 1.5 : -1.5) * Math.sin(time * 4 + i), by - 11);
      ctx.stroke();

      // Small ambient battle smoke around clashing squads
      if (i % 6 === 0) {
        ctx.fillStyle = 'rgba(140, 130, 120, 0.24)';
        ctx.beginPath();
        ctx.arc(bx + Math.cos(time * i) * 3, by - 3, 3 + Math.abs(Math.sin(time + i)) * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // TACTICAL EARTHEN TRENCHES & DEFENSIVE TIMBER STAKES (Defensive fortifications of Najib & Bhau)
    ctx.strokeStyle = '#1d120a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Horizontal trench slots running along depth
    ctx.moveTo(width * 0.05, horizon + 8);
    ctx.lineTo(width * 0.95, horizon + 8);
    ctx.moveTo(width * 0.1, horizon + 22);
    ctx.lineTo(width * 0.9, horizon + 22);
    ctx.stroke();

    // Wooden palisade stakes (Anti-cavalry sharp barricades)
    ctx.fillStyle = '#221811';
    ctx.strokeStyle = '#120a06';
    ctx.lineWidth = 0.8;
    for (let px = width * 0.08; px < width * 0.92; px += 38) {
      const pDepthY = horizon + 9 + (px % 4) * 4;
      const hSize = 7 + (px % 3);
      ctx.beginPath();
      ctx.moveTo(px, pDepthY);
      ctx.lineTo(px - Math.sin(px) * 2, pDepthY - hSize);
      ctx.lineTo(px + 3.5, pDepthY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // High command general headquarters flags fluttering
    const drawHQFlag = (fx: number, fy: number, flagColor: string, emblem: string) => {
      ctx.save();
      // Flagpole
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx, fy - 24);
      ctx.stroke();
      // Fabric waving loop
      ctx.fillStyle = flagColor;
      ctx.beginPath();
      ctx.moveTo(fx, fy - 24);
      ctx.lineTo(fx + 20 + Math.sin(time * 5.5) * 2.5, fy - 20 + Math.cos(time * 5.5) * 1.5);
      ctx.lineTo(fx, fy - 15);
      ctx.closePath();
      ctx.fill();
      // Emblem label
      ctx.fillStyle = '#ffffff';
      ctx.font = '8.5px Arial';
      ctx.fillText(emblem, fx + 3.2, fy - 18.5);
      ctx.restore();
    };

    // Maratha headquarters (Saffron saffron banner)
    drawHQFlag(width * 0.07, horizon - 15, '#ff9933', '🚩');
    // Durrani Afghan headquarters (Emerald Moon)
    drawHQFlag(width * 0.93, horizon - 15, '#166534', '🌙');

    // Draw converging tracks to represent perspective lines
    ctx.strokeStyle = '#f59e0b0b';
    ctx.lineWidth = 1;
    const centerPoint = width * 0.5;

    for (let xOffset = -width; xOffset <= width * 2; xOffset += 70) {
      ctx.beginPath();
      ctx.moveTo(centerPoint, horizon);
      ctx.lineTo(xOffset, height);
      ctx.stroke();
    }

    // Depth contour gridlines
    for (let y = horizon; y < height; y += (y - horizon) * 0.28 + 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Collapsing Allied Combat Ring indicators
    ctx.fillStyle = 'rgba(217, 119, 6, 0.07)'; // Glowing battlefield core
    const rightMargin = width * 0.82 + Math.sin(time * 1.5) * 10;
    const leftMargin = width * 0.18 + Math.cos(time * 1.5) * 10;
    
    ctx.fillRect(leftMargin, horizon, rightMargin - leftMargin, height - horizon);

    // Glowing border boundaries
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(leftMargin, horizon);
    ctx.lineTo(leftMargin, height);
    ctx.moveTo(rightMargin, horizon);
    ctx.lineTo(rightMargin, height);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Draw classic medieval care box
  const drawMedievalSupplyBox = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const box = airdropCrateRef.current;
    if (!box.active || box.claimed) return;

    if (box.y < box.targetY) {
      box.y += box.speed;
    }

    ctx.save();
    ctx.translate(box.x, box.y);

    // Mild breeze rotation sway
    const angleRotation = Math.sin(time * 2.5) * 5;
    ctx.rotate(angleRotation * Math.PI / 180);

    // Parachute cords and dome (historic canvas pattern)
    ctx.beginPath();
    ctx.arc(0, -50, 32, Math.PI, 0);
    ctx.fillStyle = '#ca8a04'; // Waxed gold canvas
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#451a03';
    ctx.stroke();

    // Ropes
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-28, -50);
    ctx.lineTo(-8, -10);
    ctx.moveTo(28, -50);
    ctx.lineTo(8, -10);
    ctx.moveTo(0, -50);
    ctx.lineTo(0, -10);
    ctx.stroke();

    // Royal brass lock-box
    ctx.fillStyle = '#451a03'; // Wooden ironwood box
    ctx.fillRect(-12, -10, 24, 24);
    ctx.strokeStyle = '#d97706'; // Gold lining
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -10, 24, 24);

    // Saffron smoke signals rising from drop
    ctx.fillStyle = 'rgba(249, 115, 22, 0.6)';
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(time * 5 + i) * 6;
      ctx.beginPath();
      ctx.arc(offset, -15 - i * 10, 8 - i * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("WAR SUPPLY", 0, 24);

    ctx.restore();
  };

  // Draw medieval hostile characters
  const updateAndDrawHostiles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const list = targetsRef.current;
    const width = canvas.width;

    list.forEach(item => {
      if (item.hp <= 0) {
        if (!deadEnemiesRef.current.has(item.id)) {
          deadEnemiesRef.current.add(item.id);
          if (activeFaction === 'maratha') {
            if (item.type === 'Durrani Elite Cavalry') {
              triggerCommanderShout(
                "Shah Wali Khan",
                "Durrani Grand Vizier",
                "🕌 Royal Cavalry",
                "Our elite horsemen met a gruesome spear charge! Bring up our cavalry reserves to secure the Durand gap!",
                "durrani"
              );
            } else if (item.type === 'Camel Swivel Zamburak') {
              triggerCommanderShout(
                "Ahmad Shah Durrani",
                "Afghan Sovereign",
                "🐫 Swivel Cannon",
                "They targeted a camel swivel group! Redouble your musketry, riddle their front ranks with lead!",
                "durrani"
              );
            } else if (item.type === 'Durrani War Elephant') {
              triggerCommanderShout(
                "Ahmad Shah Durrani",
                "Afghan Sovereign",
                "🐘 Elephant Sunder",
                "Our grand war elephant has collapsed under the heavy nine-pounder salvos! Mobilize the archers!",
                "durrani"
              );
            } else {
              triggerCommanderShout(
                "Najib-ud-Daula",
                "Rohilla Chief Overlay",
                "🛡️ Earthen Trench",
                "Our brave Ghazi swordsmen fell under their cannon blasts! Keep the Rohilla lines fortified, do not break!",
                "durrani"
              );
            }
          } else {
            // Playing as Durrani: targets are Rebels or Marathas
            if (stage === 'NIZAM_CAMPAIGN') {
              if (item.type.includes('Elephant')) {
                triggerCommanderShout(
                  "Rebel Chieftain",
                  "Yusufzai Clan Leader",
                  "🏔️ Tribal Elephant",
                  "Our war elephant collapsed! Pull back into the high stone outposts!",
                  "maratha"
                );
              } else if (item.type.includes('Swivel')) {
                triggerCommanderShout(
                  "Khyber Scout",
                  "Frontier Commander",
                  "⚔️ Khyber Gunner",
                  "The Durrani zamburaks are too accurate! Our swivel outposts are shattered!",
                  "maratha"
                );
              } else {
                triggerCommanderShout(
                  "Hill Fighter Chieftain",
                  "Kabul Rebel Flank",
                  "🏔️ Hindu Kush Foothills",
                  "Our scouts have collapsed under the royal Afghan charge! Defend the mountain passes!",
                  "maratha"
                );
              }
            } else {
              if (item.type === 'Maratha Spear Cavalry') {
                triggerCommanderShout(
                  "Sadashivrao Bhau",
                  "Maratha Commander",
                  "🚩 Saffron Vanguard",
                  "Our flanking cavalry division has been dismantled by the Afghan lancers! Counter-defend!",
                  "maratha"
                );
              } else if (item.type === 'Gardi Infantry') {
                triggerCommanderShout(
                  "Ibrahim Khan Gardi",
                  "Gardi Artillery Chief",
                  "⚜️ French Squares",
                  "Our infantry line has fractured! Bring up the heavy bronze batteries to cover the gap!",
                  "maratha"
                );
              } else if (item.type === 'Maratha War Elephant') {
                triggerCommanderShout(
                  "Sadashivrao Bhau",
                  "Maratha Commander",
                  "🐘 Royal Saffron Elephant",
                  "Our grand war elephant has fallen! Stand firm, keep the saffron banner soaring!",
                  "maratha"
                );
              } else {
                triggerCommanderShout(
                  "Malhar Rao Holkar",
                  "Maratha Holkar Chief",
                  "🐎 Tapti Scouts",
                  "Our Mawala lines have split under their direct charge! Tighten the defensive posture!",
                  "maratha"
                );
              }
            }
          }
        }
        // Draw dead remains as fallen skeleton or stick lines on ground
        ctx.save();
        ctx.translate(item.x, item.y + 10);
        ctx.strokeStyle = 'rgba(80, 70, 65, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Fallen stick spine
        ctx.moveTo(-10, 0);
        ctx.lineTo(8, -2);
        // Fallen head
        ctx.arc(-13, 0, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }

      let isClashing = false;

      // 3D Cinematic battlefield clashing & scattering mechanics
      if (phase === 'clash') {
        if (battleModeRef.current === 'marching') {
          // Slowly stride forward as a majestic unified defensive column
          item.x -= 1.45;
        } else {
          // SCATTERED ACTIVE ENGAGEMENT: lock on closest live allied fighter and charge!
          const allies = alliedSoldiersRef.current;
          let targetAlly = item.targetAllyId ? allies.find(a => a.id === item.targetAllyId && a.hp > 0) : null;
          if (!targetAlly) {
            const liveAllies = allies.filter(a => a.hp > 0);
            if (liveAllies.length > 0) {
              liveAllies.sort((a, b) => Math.hypot(a.x - item.x, a.y - item.y) - Math.hypot(b.x - item.x, b.y - item.y));
              item.targetAllyId = liveAllies[0].id;
              targetAlly = liveAllies[0];
            } else {
              item.targetAllyId = null;
            }
          }

          if (targetAlly) {
            const dist = Math.hypot(targetAlly.x - item.x, targetAlly.y - item.y);
            if (dist > 42) {
              const dx = targetAlly.x - item.x;
              const dy = targetAlly.y - item.y;
              const length = Math.hypot(dx, dy);
              let speedFactor = 1.0;
              if (item.type === 'Durrani Elite Cavalry') speedFactor = 1.55;
              else if (item.type === 'Durrani War Elephant') speedFactor = 0.72;
              item.x += (dx / length) * 1.5 * speedFactor;
              item.y += (dy / length) * 0.75 * speedFactor;
            } else {
              isClashing = true;
              // Fluidly combat shuffle in close-quarters duel
              item.x += (Math.random() - 0.5) * 0.35;
            }
          } else {
            // No targets left: walk side-to-side proud victory patrol
            item.x += item.vx * 0.4;
            if (item.x < 50 || item.x > width - 50) {
              item.vx *= -1;
            }
          }
        }
      } else {
        // Not clashing yet (initial stand ready or post-battle cleanup), snap or stand ready
        const isRear = item.id % 2 === 1;
        const targetX = isRear ? (width - 60 - (item.id % 3) * 15) : (width - 150 - (item.id % 3) * 15);
        // Smoothly ease to initial spot
        item.x += (targetX - item.x) * 0.12;
      }

      const size = 25 * item.z;
      const x = item.x;
      const y = item.y;

      ctx.save();
      ctx.translate(x, y);

      const bobbing = Math.sin(time * 10 + item.id) * 3;

      // 1. Draw Steed or Mount if Cavalry or Camel or Elephant
      let riderYOffset = bobbing;
      let turbanColor = '#991b1b'; // red turban standard default

      const isCavalry = item.type.includes('Cavalry') || item.type.includes('Scout') || (!!item.isCommander && item.commanderMount === 'horse');
      const isElephant = item.type.includes('Elephant') || (!!item.isCommander && item.commanderMount === 'elephant');
      const isCamel = item.type.includes('Zamburak') || item.type.includes('Gunner');

      if (item.isCommander) {
        turbanColor = item.commanderColor || '#991b1b';
      } else if (item.type.includes('Pashtun') || item.type.includes('Ghazi')) {
        turbanColor = '#b91c1c'; // Crimson
      } else if (item.type.includes('Durrani Elite') || item.type.includes('Afghan')) {
        turbanColor = '#065f46'; // Royal Emerald Green
      } else if (item.type.includes('Rebel') || item.type.includes('Kabul') || item.type.includes('Khyber')) {
        turbanColor = '#6b7280'; // Dusty grey / brown
      } else if (item.type.includes('Nizam')) {
        turbanColor = '#047857'; // Hyderabad green
      } else if (item.type.includes('Gardi')) {
        turbanColor = '#3b82f6'; // European Gardi Navy
      } else if (item.type.includes('Maratha') || item.type.includes('Mawala')) {
        turbanColor = '#ea580c'; // Pure saffron orange
      }

      if (isCavalry) {
        riderYOffset -= size * 0.45;

        // Horse shadow body
        if (item.isCommander) {
          // Pure white royal stallion with polished golden armor!
          ctx.fillStyle = '#fafaf9'; // beautiful off-white horse
          ctx.beginPath();
          ctx.ellipse(-size * 0.2, size * 0.3 + bobbing, size * 0.85, size * 0.36, 0, 0, Math.PI * 2);
          ctx.fill();

          // Golden royal caparison (saddle cloth) draping down
          ctx.fillStyle = turbanColor;
          ctx.fillRect(-size * 0.55, size * 0.22 + bobbing, size * 1.1, size * 0.26);
          ctx.strokeStyle = '#eab308'; // gold embroidered trim
          ctx.lineWidth = 1.8;
          ctx.strokeRect(-size * 0.55, size * 0.22 + bobbing, size * 1.1, size * 0.26);
          
          // Gilded chamfron (horse face shield helm)
          ctx.fillStyle = '#f59e0b'; // golden brass armor face plate
          ctx.beginPath();
          ctx.moveTo(size * 0.4, size * bobbing * 0.1);
          ctx.lineTo(size * 0.6, -size * 0.32);
          ctx.lineTo(size * 0.2, size * bobbing * 0.1);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = item.type.includes('Maratha') || item.type.includes('Nizam') ? '#543d2b' : '#1f2937';
          ctx.beginPath();
          ctx.ellipse(-size * 0.2, size * 0.3 + bobbing, size * 0.8, size * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();

          // Horse neck & head
          ctx.beginPath();
          ctx.moveTo(size * 0.4, size * bobbing * 0.1);
          ctx.lineTo(size * 0.55, -size * 0.25);
          ctx.lineTo(size * 0.2, size * bobbing * 0.1);
          ctx.closePath();
          ctx.fill();
        }

        // Horse legs (stick style)
        ctx.strokeStyle = '#221108';
        ctx.lineWidth = 2;
        const horseLegCycle = Math.sin(time * 14 + item.id) * size * 0.22;
        // Front leg
        ctx.beginPath();
        ctx.moveTo(size * 0.3, size * 0.3);
        ctx.lineTo(size * 0.3 + horseLegCycle, size * 0.7);
        ctx.stroke();
        // Back leg
        ctx.beginPath();
        ctx.moveTo(-size * 0.5, size * 0.3);
        ctx.lineTo(-size * 0.5 - horseLegCycle, size * 0.7);
        ctx.stroke();

      } else if (isCamel) {
        riderYOffset -= size * 0.55;

        // Camel body
        ctx.fillStyle = '#bf8040'; // Desert tan camel coat
        ctx.beginPath();
        ctx.ellipse(0, size * 0.2 + bobbing, size * 0.7, size * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hump dome
        ctx.beginPath();
        ctx.arc(0, size * bobbing * 0.1, size * 0.25, Math.PI, 0);
        ctx.fill();

        // Little swivel gun on the camel
        ctx.fillStyle = '#374151';
        ctx.fillRect(-size * 0.1, -size * 0.05 + bobbing, size * 0.55, size * 0.12);

        // Camel leg sticks
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.8;
        const camelLegCycle = Math.cos(time * 10 + item.id) * size * 0.2;
        ctx.beginPath();
        ctx.moveTo(size * 0.28, size * 0.2);
        ctx.lineTo(size * 0.28 + camelLegCycle, size * 0.75);
        ctx.moveTo(-size * 0.35, size * 0.2);
        ctx.lineTo(-size * 0.35 - camelLegCycle, size * 0.75);
        ctx.stroke();
      } else if (isElephant) {
        riderYOffset -= size * 1.35; // Much higher passenger seat!

        // Elephant Body - Huge dark slate gray shape
        if (item.isCommander) {
          // Giant royal commander elephant with steel plate scales and armor
          ctx.fillStyle = '#1e293b'; // Slate armor black grey
          ctx.beginPath();
          ctx.ellipse(0, size * 0.22 + bobbing, size * 1.5, size * 1.0, 0, 0, Math.PI * 2);
          ctx.fill();

          // Scale armor overlays
          ctx.fillStyle = '#475569';
          ctx.fillRect(-size * 0.5, size * 0.1 + bobbing, size * 1.0, size * 0.25);
          ctx.strokeStyle = '#b45309'; // brass border
          ctx.strokeRect(-size * 0.5, size * 0.1 + bobbing, size * 1.0, size * 0.25);
        } else {
          ctx.fillStyle = item.type.includes('Maratha') || item.type.includes('Nizam') ? '#4b5563' : '#64748b';
          ctx.beginPath();
          ctx.ellipse(0, size * 0.22 + bobbing, size * 1.3, size * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Thick Elephant Legs
        ctx.fillStyle = '#334155';
        const legCycleTotal = Math.sin(time * 8 + item.id) * size * 0.15;
        // Front left leg
        ctx.fillRect(size * 0.45 - size * 0.15, size * 0.4 + bobbing, size * 0.3, size * 0.6 + legCycleTotal);
        // Back right leg
        ctx.fillRect(-size * 0.6 - size * 0.15, size * 0.4 + bobbing, size * 0.3, size * 0.6 - legCycleTotal);
        // Inner front right leg (slightly darker shadow)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(size * 0.15 - size * 0.12, size * 0.4 + bobbing, size * 0.24, size * 0.6 - legCycleTotal);
        // Inner back left leg
        ctx.fillRect(-0.2 * size - size * 0.12, size * 0.4 + bobbing, size * 0.24, size * 0.6 + legCycleTotal);

        // Head
        ctx.fillStyle = item.isCommander ? '#1e293b' : (item.type.includes('Maratha') || item.type.includes('Nizam') ? '#4b5563' : '#64748b');
        ctx.beginPath();
        ctx.ellipse(size * 1.15, -0.05 * size + bobbing, size * 0.56, size * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ear
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(size * 0.88, -size * 0.08 + bobbing, size * 0.33, size * 0.44, Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();

        // Trunk
        ctx.strokeStyle = item.isCommander ? '#1e293b' : (item.type.includes('Maratha') || item.type.includes('Nizam') ? '#4b5563' : '#64748b');
        ctx.lineWidth = size * 0.18;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(size * 1.5, -size * 0.1 + bobbing);
        ctx.quadraticCurveTo(size * 1.95, size * 0.3 + bobbing, size * 1.75, size * 0.65 + bobbing);
        ctx.stroke();

        // Ivory Tusk
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = size * 0.08;
        ctx.beginPath();
        ctx.moveTo(size * 1.35, size * 0.05 + bobbing);
        ctx.quadraticCurveTo(size * 1.8, size * 0.2 + bobbing, size * 1.9, 0 + bobbing);
        ctx.stroke();

        // Traditional Royal Howdah (Wooden ornate box on back)
        if (item.isCommander) {
          // Grand gilded two-story Royal Howdah
          ctx.fillStyle = '#78350f'; // rich bronze/mahogany wood
          ctx.fillRect(-size * 0.65, -size * 1.1 + bobbing, size * 1.3, size * 0.75);
          ctx.strokeStyle = '#b45309'; // shimmering brass copper border
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-size * 0.65, -size * 1.1 + bobbing, size * 1.3, size * 0.75);

          // Golden imperial shields on howdah sides
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(-size * 0.35, -size * 0.72 + bobbing, size * 0.15, 0, Math.PI * 2);
          ctx.arc(size * 0.35, -size * 0.72 + bobbing, size * 0.15, 0, Math.PI * 2);
          ctx.fill();

          // Massive twin royal banners flowing behind
          ctx.fillStyle = turbanColor;
          ctx.beginPath();
          ctx.moveTo(-size * 0.6, -size * 0.95 + bobbing);
          ctx.lineTo(-size * 1.75, -size * 1.1 + bobbing + Math.sin(time * 8) * 8);
          ctx.lineTo(-size * 1.2, -size * 0.86 + bobbing);
          ctx.lineTo(-size * 1.75, -size * 0.65 + bobbing + Math.sin(time * 8) * 8);
          ctx.lineTo(-size * 0.5, -size * 0.75 + bobbing);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = '#78350f'; // Rich reddish mahogany wood
          ctx.fillRect(-size * 0.55, -size * 0.95 + bobbing, size * 1.1, size * 0.6);
          ctx.strokeStyle = '#d97706'; // Gold golden trims
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-size * 0.55, -size * 0.95 + bobbing, size * 1.1, size * 0.6);
        }

        // Howdah seat details inside the box
        ctx.fillStyle = turbanColor;
        ctx.fillRect(-size * 0.5, (item.isCommander ? -size * 1.15 : -size * 0.95) + bobbing, size * 1.0, size * 0.12);

        // Royal Banner flowing from back of Howdah (only regular)
        if (!item.isCommander) {
          ctx.fillStyle = turbanColor;
          ctx.beginPath();
          ctx.moveTo(-size * 0.5, -size * 0.8 + bobbing);
          ctx.lineTo(-size * 1.25, -size * 0.85 + bobbing + Math.sin(time * 6) * 6);
          ctx.lineTo(-size * 0.5, -size * 0.66 + bobbing);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 2. Draw Afghan Stick Figure Soldier and High-Fidelity Uniforms
      const sx = 0;
      const sy = riderYOffset;
      const shoulderY = sy - size * 0.32;
      const shieldLX = sx - size * 0.32;
      const shieldLY = sy - size * 0.08;

      // 1. Uniform / Tunic drawing
      if (item.type.includes('Swivel') || item.type.includes('Zamburak')) {
        // Camel swivel wearers: Loose sand-coloured loose desert robes
        ctx.fillStyle = '#e4e4e7'; // light sand/grey desert wrap
        ctx.fillRect(sx - size * 0.12, sy - size * 0.42, size * 0.24, size * 0.52);
        ctx.fillStyle = '#b45309'; // brown leather bandolier crossing shoulder
        ctx.beginPath();
        ctx.moveTo(sx - size * 0.12, sy - size * 0.4);
        ctx.lineTo(sx + size * 0.12, sy - size * 0.15);
        ctx.lineTo(sx + size * 0.12, sy - size * 0.08);
        ctx.lineTo(sx - size * 0.12, sy - size * 0.32);
        ctx.closePath();
        ctx.fill();
      } else if (item.type.includes('Cavalry') || item.type.includes('Deccan') || item.type.includes('Scout')) {
        // Heavy steel chainmail plates
        ctx.fillStyle = '#4b5563'; // Chainmail base grey
        ctx.fillRect(sx - size * 0.12, sy - size * 0.4, size * 0.24, size * 0.48);
        ctx.fillStyle = '#94a3b8'; // Silver breastplate shiny overlay
        ctx.fillRect(sx - size * 0.07, sy - size * 0.34, size * 0.14, size * 0.18);
        ctx.fillStyle = '#991b1b'; // Red belt sash
        ctx.fillRect(sx - size * 0.14, sy - size * 0.05, size * 0.28, size * 0.07);
      } else if (item.type.includes('Ghazi') || item.type.includes('Rebel Fighter') || item.type.includes('Infantryman')) {
        // Ghazi heavy stone-grey tunic (loose salwar clothing)
        ctx.fillStyle = '#292524'; // loose dark grey charcoal
        ctx.fillRect(sx - size * 0.13, sy - size * 0.42, size * 0.26, size * 0.54);
        // Red belt sash
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(sx - size * 0.15, sy - size * 0.05, size * 0.3, size * 0.08);
      } else {
        // Default Hostile infantry: limestone off-white with dark vest
        ctx.fillStyle = '#fafaf9'; // cotton salwar
        ctx.fillRect(sx - size * 0.11, sy - size * 0.42, size * 0.22, size * 0.5);
        ctx.fillStyle = '#065f46'; // dark emerald sash/vest
        ctx.fillRect(sx - size * 0.11, sy - size * 0.42, size * 0.22, size * 0.22);
      }

      // Torso / Spine line back skeleton
      ctx.beginPath();
      ctx.moveTo(sx, sy - size * 0.4);
      ctx.lineTo(sx, sy + size * 0.12);
      ctx.strokeStyle = '#1e293b'; 
      ctx.lineWidth = 1.8 * item.z;
      ctx.stroke();

      // Stick Legs (only for non-elephants)
      if (item.type !== 'Durrani War Elephant' && item.type !== 'Rebel Chieftain Elephant') {
        const walkCycle = time * 12 + item.id;
        const legL_X = Math.sin(walkCycle) * size * 0.22;
        const legR_X = -Math.sin(walkCycle) * size * 0.22;
        const groundY = sy + size * 0.5;

        // Left leg (moving)
        ctx.beginPath();
        ctx.moveTo(sx, sy + size * 0.12);
        ctx.lineTo(sx + legL_X, groundY);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.8 * item.z;
        ctx.stroke();

        // Right leg (moving)
        ctx.beginPath();
        ctx.moveTo(sx, sy + size * 0.12);
        ctx.lineTo(sx + legR_X, groundY);
        ctx.stroke();
      }

      // Head
      ctx.beginPath();
      ctx.arc(sx, sy - size * 0.6, size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = item.type.includes('Pashtun') || item.type.includes('Ghazi') || item.type.includes('Durrani') ? '#fed7aa' : '#fcd34d'; // skin
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.3 * item.z;
      ctx.stroke();

      // Afghan Turbans / Helmets
      if (item.type.includes('Cavalry') || item.type.includes('Elite')) {
        // Heavy iron spiked helmet with green plume feathers
        ctx.fillStyle = '#475569'; // steel color
        ctx.beginPath();
        ctx.moveTo(sx - size * 0.18, sy - size * 0.66);
        ctx.quadraticCurveTo(sx, sy - size * 0.98, sx + size * 0.18, sy - size * 0.66);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Central pointed steel helm spike
        ctx.strokeStyle = '#eab308'; // Golden spike
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy - size * 0.82);
        ctx.lineTo(sx, sy - size * 0.96);
        ctx.stroke();

        // Green helmet feather plume!
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(sx - size * 0.08, sy - size * 0.92, size * 0.05, size * 0.14, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Traditional gorgeous Afghan heavy draped turban
        ctx.fillStyle = turbanColor;
        ctx.beginPath();
        ctx.arc(sx, sy - size * 0.68, size * 0.24, Math.PI, 0);
        ctx.fill();
        // flowing sash fabric hanging behind neck
        ctx.fillRect(size * 0.12, sy - size * 0.65, size * 0.06, size * 0.28);
      }

      // 2. Arms & Weapons
      // Left arm holding shield or Musket barrel
      ctx.beginPath();
      ctx.moveTo(sx, shoulderY);
      ctx.lineTo(shieldLX, shieldLY);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.6 * item.z;
      ctx.stroke();

      if (item.type === 'Pashtun Ghazi swordsman' || item.type.includes('Infantryman') || item.type.includes('Fighter')) {
        // Thick circular studded leather hide shield (Pesh-kabz shield)
        ctx.fillStyle = '#451a03'; // deep leather hide brown
        ctx.beginPath();
        ctx.arc(shieldLX, shieldLY, size * 0.27, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706'; // bronze metal rim
        ctx.lineWidth = 1.4 * item.z;
        ctx.stroke();
        
        // 4 brass studs characteristics
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(shieldLX - size * 0.08, shieldLY - size * 0.08, size * 0.04, 0, Math.PI * 2);
        ctx.arc(shieldLX + size * 0.08, shieldLY - size * 0.08, size * 0.04, 0, Math.PI * 2);
        ctx.arc(shieldLX - size * 0.08, shieldLY + size * 0.08, size * 0.04, 0, Math.PI * 2);
        ctx.arc(shieldLX + size * 0.08, shieldLY + size * 0.08, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type.includes('Swivel') || item.type.includes('Zamburak') || item.type.includes('Gunner')) {
        // Zamburak/swivel riders: holding a long swivel blunderbuss barrel forward
        ctx.strokeStyle = '#451a03'; // rich wood grain
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(sx - size * 0.25, sy);
        ctx.lineTo(sx - size * 0.65, sy - size * 0.22);
        ctx.stroke();

        ctx.strokeStyle = '#64748b'; // heavy silver barrel
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx - size * 0.1, sy - size * 0.05);
        ctx.lineTo(sx - size * 0.72, sy - size * 0.24);
        ctx.stroke();
      }

      // Right arm weapon execution
      if (item.type.includes('Cavalry') || item.type.includes('Elite') || item.type.includes('Scout')) {
        // Spiked steel Cavalry lances
        const forwardThrust = isClashing ? (Math.sin(time * 24 + item.id) * size * 0.3) : 0;
        
        ctx.strokeStyle = '#1e293b'; 
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, shoulderY);
        ctx.lineTo(sx - size * 0.32 - forwardThrust, shoulderY + size * 0.1);
        ctx.stroke();

        // lance shaft
        ctx.strokeStyle = '#78350f'; // spear shaft
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(sx + size * 0.3, shoulderY + size * 0.35 + forwardThrust * 0.3);
        ctx.lineTo(sx - size * 1.3 - forwardThrust, shoulderY - size * 0.18 - forwardThrust * 0.1);
        ctx.stroke();

        // Spiked steel tip point
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(sx - size * 1.3 - forwardThrust, shoulderY - size * 0.18 - forwardThrust * 0.1);
        ctx.lineTo(sx - size * 1.15 - forwardThrust, shoulderY - size * 0.26 - forwardThrust * 0.1);
        ctx.lineTo(sx - size * 1.48 - forwardThrust, shoulderY - size * 0.22 - forwardThrust * 0.1);
        ctx.lineTo(sx - size * 1.15 - forwardThrust, shoulderY - size * 0.1 - forwardThrust * 0.1);
        ctx.closePath();
        ctx.fill();

        // Banner pennant
        ctx.fillStyle = turbanColor;
        ctx.beginPath();
        ctx.moveTo(sx - size * 1.05 - forwardThrust, shoulderY - size * 0.1);
        ctx.lineTo(sx - size * 0.7 - forwardThrust, shoulderY - size * 0.05 + Math.sin(time * 10) * 4);
        ctx.lineTo(sx - size * 0.98 - forwardThrust, shoulderY + Math.sin(time * 10) * 2);
        ctx.closePath();
        ctx.fill();
        
      } else if (item.type === 'Pashtun Ghazi swordsman' || item.type.includes('Fighter') || item.type.includes('Elephant') || item.type.includes('Infantryman')) {
        // Heavy, single-edged, triangular Khyber Broadsword
        const combatSwing = isClashing ? (Math.sin(time * 18 + item.id) * 0.5) : 0.3;
        const elbowX = sx - size * 0.22 - Math.cos(combatSwing) * size * 0.12;
        const elbowY = shoulderY + size * 0.12 + Math.sin(combatSwing) * size * 0.12;
        const handX = elbowX - size * 0.15;
        const handY = elbowY + Math.sin(combatSwing) * size * 0.12;

        ctx.beginPath();
        ctx.moveTo(sx, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(handX, handY);
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();

        ctx.save();
        ctx.translate(handX, handY);
        ctx.rotate((-45 + Math.sin(time * 15 + item.id) * 30) * Math.PI / 180);
        ctx.fillStyle = '#e2e8f0'; // wide metal
        ctx.strokeStyle = '#475569'; // steel back
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size * 0.65, -size * 0.3); // sharp tip
        ctx.lineTo(-size * 0.5, size * 0.1);  // broad base
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Golden disk guard
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // UI Indicators above head
      // Health meters
      const isHostileElephant = item.type.includes('Elephant') || (!!item.isCommander && item.commanderMount === 'elephant');
      let hostMaxHp = item.maxHp || 100;
      let meterW = size * (isHostileElephant ? 1.8 : 1.3);
      let hostHpY = isHostileElephant ? -size * 2.3 + bobbing : -size * 1.5 + bobbing;
      let hostLabelY = isHostileElephant ? -size * 2.5 + bobbing : -size * 1.7 + bobbing;

      if (item.isCommander) {
        hostMaxHp = 350;
        meterW = size * 2.5; // wider health bar
        hostHpY = isHostileElephant ? -size * 2.5 + bobbing : -size * 1.3 + bobbing;
        hostLabelY = isHostileElephant ? -size * 2.7 + bobbing : -size * 1.5 + bobbing;
      }

      ctx.fillStyle = '#00000090';
      ctx.fillRect(-meterW / 2, hostHpY, meterW, item.isCommander ? 4 : 2.5);
      ctx.fillStyle = item.isCommander ? '#ef4444' : '#38bdf8'; // hostile threat crimson vs standard teal
      ctx.fillRect(-meterW / 2, hostHpY, meterW * Math.min(1, item.hp / hostMaxHp), item.isCommander ? 4 : 2.5);

      // Text label
      if (item.isCommander) {
        // Draw elegant hostile commander plate
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; // threat crimson
        ctx.font = `bold ${Math.max(8, 11 * item.z)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`👑 ${item.commanderName?.toUpperCase()}`, 0, hostLabelY);
        
        ctx.fillStyle = '#cbd5e1'; // light slate subtitle
        ctx.font = `${Math.max(6, 8 * item.z)}px sans-serif`;
        ctx.fillText(item.commanderRole || "Commander", 0, hostLabelY + 8 * item.z);
      } else {
        ctx.fillStyle = '#fb923c';
        ctx.font = `bold ${Math.max(6, (isHostileElephant ? 9 : 8.5) * item.z)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(item.type.toUpperCase(), 0, hostLabelY);
      }

      ctx.restore();
    });
  };

  // Update and render Allied Maratha & Gardi soldiers clashing on physical lines
  const updateAndDrawAllies = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const allies = alliedSoldiersRef.current;
    const hostiles = targetsRef.current;
    
    allies.forEach(ally => {
      if (ally.hp <= 0) {
        // Draw dead remains of fallen allied fighter as simple stick lines
        ctx.save();
        ctx.translate(ally.x, ally.y + 12);
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        // Fallen spine
        ctx.moveTo(-8, 0);
        ctx.lineTo(6, 1);
        // Fallen head
        ctx.arc(-11, 0, 2.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }
      
      // Find valid live target
      if (ally.targetEnemyId === null || !hostiles.find(h => h.id === ally.targetEnemyId && h.hp > 0)) {
        // Find closest live enemy
        const liveEnemies = hostiles.filter(h => h.hp > 0);
        if (liveEnemies.length > 0) {
          // Sort by distance
          liveEnemies.sort((a, b) => Math.hypot(a.x - ally.x, a.y - ally.y) - Math.hypot(b.x - ally.x, b.y - ally.y));
          ally.targetEnemyId = liveEnemies[0].id;
        } else {
          ally.targetEnemyId = null;
        }
      }
      
      // Structured charge and scatter movement logic
      let isClashing = false;
      const currentTarget = ally.targetEnemyId !== null ? hostiles.find(h => h.id === ally.targetEnemyId && h.hp > 0) : null;

      if (phase === 'clash') {
        if (battleModeRef.current === 'marching') {
          // Steadily march forward in neat Rank-And-File defensive lines
          ally.x += 1.45;
        } else {
          // SCATTERED INDIVIDUAL ENGAGEMENT: Lock on targets and charge!
          if (currentTarget) {
            const dist = Math.hypot(currentTarget.x - ally.x, currentTarget.y - ally.y);
            if (dist > 42) {
              const dx = currentTarget.x - ally.x;
              const dy = currentTarget.y - ally.y;
              const length = Math.hypot(dx, dy);
              let speedFactor = 1.0;
              if (ally.type === 'Maratha Spear Cavalry') speedFactor = 1.55;
              else if (ally.type === 'Maratha War Elephant') speedFactor = 0.72;
              ally.x += (dx / length) * 1.5 * speedFactor;
              ally.y += (dy / length) * 0.75 * speedFactor;
            } else {
              isClashing = true;
              // Fluidly combat shuffle in close-quarters duel
              ally.x += (Math.random() - 0.5) * 0.35;
            }
          } else {
            // Victory stand-by behavior
            ally.x += ally.vx * 0.4;
            if (ally.x < 100 || ally.x > canvas.width - 100) {
              ally.vx *= -1;
            }
          }
        }
      } else {
        // Snap back or breathe smoothly in starting formation
        const idx = ally.id - 100;
        const isRear = idx % 2 === 1;
        const targetX = isRear ? (60 + (idx % 3) * 15) : (150 + (idx % 3) * 15);
        // Smoothly ease to initial spot
        ally.x += (targetX - ally.x) * 0.12;
      }
      
      const size = 22 * ally.z;
      const x = ally.x;
      const y = ally.y;
      
      ctx.save();
      ctx.translate(x, y);
      
      const bobbing = Math.sin(time * 12 + ally.id + ally.boboffset) * 2.5;
      
      // Draw weapon swing & hit interactions
      if (isClashing && currentTarget) {
        ally.slashTimer += 0.024;
        if (ally.slashTimer >= 1.0) {
          ally.slashTimer = 0;
          
          // Deal damage to hostiles!
          const difficultyKey = localStorage.getItem('panipat_battle_difficulty') || 'veteran';
          const canvasDiffMult = difficultyKey === 'recruit' ? 0.75 : difficultyKey === 'peshwa' ? 1.9 : 1.25;
          const allyDmgDiv = difficultyKey === 'peshwa' ? 1.45 : difficultyKey === 'recruit' ? 0.8 : 1;

          const dmgDealt = Math.round((5 + Math.random() * 8) / allyDmgDiv);
          currentTarget.hp = Math.max(0, currentTarget.hp - dmgDealt);
          
          // Minor screen tremor on background clash hits
          shakeRef.current = Math.min(shakeRef.current + 1.2, 10);

          // Rich gravity-based crimson splatters and sparks on hits!
          const isTargetElephant = currentTarget.type.includes('Elephant');
          spawnHitSplatter(currentTarget.x, currentTarget.y, '#b91c1c', isTargetElephant ? 1.4 : 0.75);
          spawnHitSplatter(currentTarget.x, currentTarget.y, '#f59e0b', isTargetElephant ? 1.0 : 0.5);
          
          // Float damage tag
          textsRef.current.push({
            x: currentTarget.x,
            y: currentTarget.y - 15,
            text: `-${dmgDealt}`,
            alpha: 1,
            color: '#eab308',
            scale: 0.8,
            vy: -1.2
          });
          
          // Hostile strikes back!
          const dmgTaken = Math.round((4 + Math.random() * 6) * canvasDiffMult);
          ally.hp = Math.max(0, ally.hp - dmgTaken);

          // Visually reflect opponent's counter blow landing
          const isAllyElephant = ally.type.includes('Elephant');
          spawnHitSplatter(ally.x, ally.y, '#b91c1c', isAllyElephant ? 1.3 : 0.7);
          spawnHitSplatter(ally.x, ally.y, '#3b82f6', 0.4); // dusty blue/navy spark highlights

          // Trigger narrative commander audio shouts when critical health thresholds are breached
          if (ally.hp <= 0 && !deadAlliesRef.current.has(ally.id)) {
            deadAlliesRef.current.add(ally.id);
            if (ally.type === 'Gardi Infantry') {
              triggerCommanderShout(
                "Ibrahim Khan Gardi",
                "Artillery Chief",
                "💔 Gardi Deficit",
                "Our front artillery footmen are falling under sniper fire! Send in the bayonets to protect the ammunition!",
                "maratha"
              );
            } else if (ally.type === 'Maratha Spear Cavalry') {
              triggerCommanderShout(
                "Shamsher Bahadur",
                "Cavalry Commander",
                "💀 Rider Falls",
                "A brave horse subahdar is down! Keep the cavalry regrouped, don't let their ghazis break our formation!",
                "maratha"
              );
            } else if (ally.type === 'Maratha War Elephant') {
              triggerCommanderShout(
                "Sadashivrao Bhau",
                "Generalissimo",
                "🐘 Elephant Down",
                "Our majestic vanguard elephant has collapsed in the sand! Forward the central banner! Stand firm!",
                "maratha"
              );
            } else {
              if (isParvatibaiSelected) {
                triggerCommanderShout(
                  "Queen Parvatibai",
                  "Camp Pillar",
                  "🛡️ Spiritual Shield",
                  "A noble Deccani son has fallen! Send the medical helpers instantly to treat our wounded, let no soul be left behind!",
                  "maratha"
                );
              } else if (isGopikabaiSelected) {
                triggerCommanderShout(
                  "Regent Gopikabai",
                  "Regent Empress",
                  "🚩 Imperial Record",
                  "A brave soldier has fallen in service of the Peshwas! Every sacrifice is recorded in Pune's golden scrolls. Maintain the front!",
                  "maratha"
                );
              } else if (isRaghobaSelected) {
                triggerCommanderShout(
                  "Raghunathrao (Raghoba)",
                  "Frontier Conqueror",
                  "🐎 Cavalier Surge",
                  "A brave horseman has fallen! Mount up, step forward, and drive the Afghan guard back to the river! Charge!",
                  "maratha"
                );
              } else {
                triggerCommanderShout(
                  "Sadashivrao Bhau",
                  "Generalissimo",
                  "⚔️ Mawala Fallen",
                  "A noble Deccani Mawala has fell! Fill the gap in our lines instantly, keep our central crest absolute!",
                  "maratha"
                );
              }
            }
          } else if (ally.hp < 35 && ally.hp > 0 && !lowHpAlertedRef.current.has(ally.id)) {
            lowHpAlertedRef.current.add(ally.id);
            if (ally.type === 'Gardi Infantry') {
              triggerCommanderShout(
                "Ibrahim Khan Gardi",
                "Artillery Chief",
                "⚠️ Cannoneer Danger",
                "Our primary cannon loader crew is heavily wounded under fire! Protect our primary gun lines!",
                "maratha"
              );
            } else {
              if (isParvatibaiSelected) {
                triggerCommanderShout(
                  "Queen Parvatibai",
                  "Camp Pillar",
                  "⚠️ Shelter Defense",
                  "Our defenses are taking heavy pressure on the ridge! Stand firm, children of the Deccan, shelter the camps with your spirit!",
                  "maratha"
                );
              } else if (isGopikabaiSelected) {
                triggerCommanderShout(
                  "Regent Gopikabai",
                  "Regent Empress",
                  "💸 Sovereign Call",
                  "Our lines are bleeding under critical fire! Stand firm, and the royal treasury shall double your battlefield stipends!",
                  "maratha"
                );
              } else if (isRaghobaSelected) {
                triggerCommanderShout(
                  "Raghunathrao (Raghoba)",
                  "Frontier Conqueror",
                  "⚔️ Northern Spirit",
                  "Our line is wavering on the coordinates! Remember the conquest of Peshawar! Do not let these invaders breach your shields!",
                  "maratha"
                );
              } else {
                triggerCommanderShout(
                  "Sadashivrao Bhau",
                  "Generalissimo",
                  "⚠️ Line Bleeding",
                  "Our battle-lines are bleeding on the central ridge! Grit your teeth, soldiers of Maharashtra, hold the sand!",
                  "maratha"
                );
              }
            }
          }
          
          // Float damage on ally
          textsRef.current.push({
            x: ally.x,
            y: ally.y - 12,
            text: `-${dmgTaken}`,
            alpha: 1,
            color: '#ef4444',
            scale: 0.75,
            vy: -1.2
          });
        }
      }
      
      // 2. Draw Allied stick figures (Maratha Mawala, Gardi Infantry, Durrani Elite, etc.)
      let riderYOffset = bobbing;
      let headgearColor = '#f97316'; // standard saffron

      const isCavalry = ally.type.includes('Cavalry') || ally.type.includes('Scout') || (!!ally.isCommander && ally.commanderMount === 'horse');
      const isElephant = ally.type.includes('Elephant') || (!!ally.isCommander && ally.commanderMount === 'elephant');
      const isCamel = ally.type.includes('Zamburak') || ally.type.includes('Gunner');
      const isCannon = ally.type.includes('Cannon') || ally.type.includes('Artillery');

      if (ally.isCommander) {
        headgearColor = ally.commanderColor || '#f97316';
      } else if (ally.type.includes('Pashtun') || ally.type.includes('Ghazi')) {
        headgearColor = '#b91c1c'; // Afghan/Ghilzai Crimson Red
      } else if (ally.type.includes('Durrani Elite') || ally.type.includes('Afghan')) {
        headgearColor = '#065f46'; // Royal Emerald Green
      } else if (ally.type.includes('Rebel') || ally.type.includes('Kabul') || ally.type.includes('Khyber')) {
        headgearColor = '#78716c'; // Sandy grey
      } else if (ally.type.includes('Nizam')) {
        headgearColor = '#047857'; // Hyderabad teal
      } else if (ally.type === 'Gardi Infantry' || ally.type.includes('Gardi')) {
        headgearColor = '#3b82f6'; // European Gardi Navy Blue
      } else if (ally.type.includes('Maratha')) {
        headgearColor = '#ea580c'; // Pure saffron orange
      }

      if (isCannon) {
        // Draw French Gardi Field Cannon Carriage
        // Carriage body (Wooden beam)
        ctx.strokeStyle = '#5c2d12'; // timber
        ctx.lineWidth = size * 0.22;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-size * 0.5, size * 0.35 + bobbing);
        ctx.lineTo(size * 0.2, size * 0.15 + bobbing);
        ctx.stroke();

        // Large rustic wooden carriage wheel
        ctx.fillStyle = '#78350f'; // reddish wood
        ctx.beginPath();
        ctx.arc(-size * 0.12, size * 0.3 + bobbing, size * 0.44, 0, Math.PI * 2);
        ctx.fill();

        // Wheel rim lining
        ctx.strokeStyle = '#292524'; // iron tread
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-size * 0.12, size * 0.3 + bobbing, size * 0.44, 0, Math.PI * 2);
        ctx.stroke();

        // Hub cap
        ctx.fillStyle = '#b45309'; // brass nut
        ctx.beginPath();
        ctx.arc(-size * 0.12, size * 0.3 + bobbing, size * 0.09, 0, Math.PI * 2);
        ctx.fill();

        // Spokes
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 1.5;
        for (let k = 0; k < 6; k++) {
          const angle = (k * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(-size * 0.12, size * 0.3 + bobbing);
          ctx.lineTo(
            -size * 0.12 + Math.cos(angle) * size * 0.44,
            size * 0.3 + bobbing + Math.sin(angle) * size * 0.44
          );
          ctx.stroke();
        }

        // Heavy Brass Cannon Barrel
        ctx.save();
        // Slightly elevate muzzle on bobbing
        ctx.translate(-size * 0.12, size * 0.15 + bobbing);
        ctx.rotate(-Math.PI / 15 + Math.sin(time * 5) * 0.01); // point slightly upward

        // Cannon barrel cone-cylinder
        const grd = ctx.createLinearGradient(-size * 0.45, 0, size * 0.55, 0);
        grd.addColorStop(0, '#541c0e'); // shadow copper
        grd.addColorStop(0.3, '#d97706'); // polished bronze
        grd.addColorStop(0.8, '#f59e0b'); // sparkling highlight
        grd.addColorStop(1, '#b45309'); // rim copper

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(-size * 0.45, -size * 0.14);
        ctx.lineTo(size * 0.55, -size * 0.08); // tapered tip muzzle
        ctx.lineTo(size * 0.55, size * 0.08);
        ctx.lineTo(-size * 0.45, size * 0.16);
        ctx.closePath();
        ctx.fill();

        // Muzzle band ring
        ctx.fillStyle = '#92400e';
        ctx.fillRect(size * 0.48, -size * 0.095, size * 0.07, size * 0.19);

        // Breech ball pin (Cascable)
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(-size * 0.49, size * 0.01, size * 0.07, 0, Math.PI * 2);
        ctx.fill();

        // Glowing burning fuse on breech
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-size * 0.35, -size * 0.13);
        ctx.quadraticCurveTo(-size * 0.38, -size * 0.25, -size * 0.32, -size * 0.32);
        ctx.stroke();

        if (Math.random() > 0.3) {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(-size * 0.32, -size * 0.32, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Also, let's draw a tiny stick figure Gardi cannoneer operator standing beside the gun preparing ammunition!
        ctx.fillStyle = '#1e3a8a'; // Gardi Blue uniform
        ctx.fillRect(size * 0.42, size * 0.15 + bobbing, size * 0.18, size * 0.38);
        ctx.fillStyle = '#fdf2e9'; // Skin
        ctx.beginPath();
        ctx.arc(size * 0.51, size * 0.07 + bobbing, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444'; // Red turban
        ctx.beginPath();
        ctx.ellipse(size * 0.51, size * 0.03 + bobbing, size * 0.09, size * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();

        // Holding a hand ramrod (stick)
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(size * 0.2, size * 0.2 + bobbing);
        ctx.lineTo(size * 0.52, size * 0.25 + bobbing);
        ctx.stroke();

        ctx.restore();
        return;
      }

      if (isCavalry) {
        riderYOffset -= size * 0.45;

        // Draw cavalry horse mount
        if (ally.isCommander) {
          // Pure white royal stallion with polished golden armor!
          ctx.fillStyle = '#fafaf9'; // beautiful off-white horse
          ctx.beginPath();
          ctx.ellipse(-size * 0.25, size * 0.3 + bobbing, size * 0.85, size * 0.36, 0, 0, Math.PI * 2);
          ctx.fill();

          // Golden royal caparison (saddle cloth) draping down
          ctx.fillStyle = headgearColor;
          ctx.fillRect(-size * 0.6, size * 0.22 + bobbing, size * 1.1, size * 0.26);
          ctx.strokeStyle = '#eab308'; // gold embroidered trim
          ctx.lineWidth = 1.8;
          ctx.strokeRect(-size * 0.6, size * 0.22 + bobbing, size * 1.1, size * 0.26);
          
          // Gilded chamfron (horse face shield helm)
          ctx.fillStyle = '#f59e0b'; // golden brass armor face plate
          ctx.beginPath();
          ctx.moveTo(size * 0.35, size * bobbing * 0.1);
          ctx.lineTo(size * 0.55, -size * 0.32);
          ctx.lineTo(size * 0.15, size * bobbing * 0.1);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = ally.type.includes('Maratha') || ally.type.includes('Nizam') ? '#543d2b' : '#331a0e'; // dark brown vs black charger
          ctx.beginPath();
          ctx.ellipse(-size * 0.25, size * 0.3 + bobbing, size * 0.75, size * 0.32, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.moveTo(size * 0.35, size * bobbing * 0.1);
          ctx.lineTo(size * 0.5, -size * 0.25);
          ctx.lineTo(size * 0.15, size * bobbing * 0.1);
          ctx.closePath();
          ctx.fill();
        }

        // Horse legs
        ctx.strokeStyle = '#27170c';
        ctx.lineWidth = 1.8;
        const horseLegCycle = Math.sin(time * 12 + ally.id) * size * 0.2;
        ctx.beginPath();
        ctx.moveTo(size * 0.25, size * 0.3);
        ctx.lineTo(size * 0.25 + horseLegCycle, size * 0.65);
        ctx.moveTo(-size * 0.4, size * 0.3);
        ctx.lineTo(-size * 0.4 - horseLegCycle, size * 0.65);
        ctx.stroke();

        // High cavalry long Spear rod
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 1.1 + bobbing);
        ctx.lineTo(size * 0.82, -size * 0.12 + bobbing);
        ctx.stroke();
        
        // Faction colored pennant triangular flag flowing on spear
        ctx.fillStyle = headgearColor;
        ctx.beginPath();
        ctx.moveTo(size * 0.45, -size * 0.5 + bobbing);
        ctx.lineTo(size * 0.8, -size * 0.22 + bobbing);
        ctx.lineTo(size * 0.4, -size * 0.18 + bobbing);
        ctx.closePath();
        ctx.fill();
      } else if (isCamel) {
        riderYOffset -= size * 0.55;

        // Draw camel mount
        ctx.fillStyle = '#bf8040'; // Desert tan camel coat
        ctx.beginPath();
        ctx.ellipse(-size * 0.2, size * 0.25 + bobbing, size * 0.8, size * 0.36, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Hump
        ctx.beginPath();
        ctx.arc(-size * 0.2, size * bobbing * 0.08, size * 0.28, Math.PI, 0);
        ctx.fill();

        // Neck
        ctx.lineWidth = size * 0.16;
        ctx.strokeStyle = '#bf8040';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(size * 0.4, size * 0.15 + bobbing);
        ctx.quadraticCurveTo(size * 0.6, -size * 0.25 + bobbing, size * 0.45, -size * 0.45 + bobbing);
        ctx.stroke();

        // Camel legs
        ctx.strokeStyle = '#8c5926';
        ctx.lineWidth = 1.8;
        const camelLegCycle = Math.sin(time * 10 + ally.id) * size * 0.22;
        ctx.beginPath();
        ctx.moveTo(size * 0.2, size * 0.3);
        ctx.lineTo(size * 0.22 + camelLegCycle, size * 0.72);
        ctx.moveTo(-size * 0.35, size * 0.3);
        ctx.lineTo(-size * 0.35 - camelLegCycle, size * 0.72);
        ctx.stroke();

        // Mounted Brass Zamburak Swivel Cannon on Hump
        ctx.fillStyle = '#b59410'; // brass
        ctx.fillRect(-size * 0.35, -size * 0.35 + bobbing, size * 0.6, size * 0.12);
        ctx.fillStyle = '#374151'; // iron pivot stand
        ctx.fillRect(-size * 0.12, -size * 0.24 + bobbing, size * 0.08, size * 0.24);
      } else if (isElephant) {
        riderYOffset -= size * 1.35; // Much higher passenger seat!

        // Elephant Body - Huge dark slate/gray shape
        if (ally.isCommander) {
          // Giant royal commander elephant with silver chainmail overlay
          ctx.fillStyle = '#374151'; // dark iron steel plate gray
          ctx.beginPath();
          ctx.ellipse(0, size * 0.22 + bobbing, size * 1.5, size * 1.0, 0, 0, Math.PI * 2);
          ctx.fill();

          // Gilded iron plate scales covering head
          ctx.fillStyle = '#708090'; // slate armor
          ctx.fillRect(-size * 0.5, size * 0.1 + bobbing, size * 1.0, size * 0.25);
          ctx.strokeStyle = '#d97706'; // brass borders
          ctx.strokeRect(-size * 0.5, size * 0.1 + bobbing, size * 1.0, size * 0.25);
        } else {
          ctx.fillStyle = ally.type.includes('Maratha') || ally.type.includes('Nizam') ? '#4b5563' : '#64748b'; // Slightly darker basalt gray vs royal grey
          ctx.beginPath();
          ctx.ellipse(0, size * 0.22 + bobbing, size * 1.3, size * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Thick Elephant Legs
        ctx.fillStyle = '#374151';
        const legCycleTotal = Math.sin(time * 8 + ally.id) * size * 0.15;
        // Front right leg
        ctx.fillRect(size * 0.45 - size * 0.15, size * 0.4 + bobbing, size * 0.3, size * 0.6 + legCycleTotal);
        // Back left leg
        ctx.fillRect(-size * 0.6 - size * 0.15, size * 0.4 + bobbing, size * 0.3, size * 0.6 - legCycleTotal);
        // Inner front left leg (darker shadow index)
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(size * 0.15 - size * 0.12, size * 0.4 + bobbing, size * 0.24, size * 0.6 - legCycleTotal);
        // Inner back right leg
        ctx.fillRect(-0.2 * size - size * 0.12, size * 0.4 + bobbing, size * 0.24, size * 0.6 + legCycleTotal);

        // Head
        ctx.fillStyle = ally.isCommander ? '#374151' : (ally.type.includes('Maratha') || ally.type.includes('Nizam') ? '#4b5563' : '#64748b');
        ctx.beginPath();
        ctx.ellipse(size * 1.15, -0.05 * size + bobbing, size * 0.56, size * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ear
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.ellipse(size * 0.88, -size * 0.08 + bobbing, size * 0.33, size * 0.44, Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();

        // Trunk
        ctx.strokeStyle = ally.isCommander ? '#374151' : (ally.type.includes('Maratha') || ally.type.includes('Nizam') ? '#4b5563' : '#64748b');
        ctx.lineWidth = size * 0.18;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(size * 1.5, -size * 0.1 + bobbing);
        ctx.quadraticCurveTo(size * 1.95, size * 0.3 + bobbing, size * 1.75, size * 0.65 + bobbing);
        ctx.stroke();

        // Ivory Tusk
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = size * 0.08;
        ctx.beginPath();
        ctx.moveTo(size * 1.35, size * 0.05 + bobbing);
        ctx.quadraticCurveTo(size * 1.8, size * 0.2 + bobbing, size * 1.9, 0 + bobbing);
        ctx.stroke();

        // jhool cloth on its back (traditional ornamental drapes)
        ctx.fillStyle = headgearColor; // Saffron vs Royal Green
        ctx.beginPath();
        ctx.ellipse(0, size * 0.25 + bobbing, size * 0.95, size * 0.52, 0, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#facc15'; // Gold lining
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Traditional Royal Howdah (Wooden ornate box on back)
        if (ally.isCommander) {
          // Grand gilded two-story Royal Howdah
          ctx.fillStyle = '#92400e'; // rich bronze/mahogany wood
          ctx.fillRect(-size * 0.65, -size * 1.1 + bobbing, size * 1.3, size * 0.75);
          ctx.strokeStyle = '#facc15'; // shimmering direct gold border
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-size * 0.65, -size * 1.1 + bobbing, size * 1.3, size * 0.75);

          // Golden imperial shields on howdah sides
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(-size * 0.35, -size * 0.72 + bobbing, size * 0.15, 0, Math.PI * 2);
          ctx.arc(size * 0.35, -size * 0.72 + bobbing, size * 0.15, 0, Math.PI * 2);
          ctx.fill();

          // Massive twin royal banners flowing behind
          ctx.fillStyle = headgearColor;
          ctx.beginPath();
          ctx.moveTo(-size * 0.6, -size * 0.95 + bobbing);
          ctx.lineTo(-size * 1.75, -size * 1.1 + bobbing + Math.sin(time * 8) * 8);
          ctx.lineTo(-size * 1.2, -size * 0.86 + bobbing);
          ctx.lineTo(-size * 1.75, -size * 0.65 + bobbing + Math.sin(time * 8) * 8);
          ctx.lineTo(-size * 0.5, -size * 0.75 + bobbing);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = '#7c2d12'; // Rich timber wood
          ctx.fillRect(-size * 0.55, -size * 0.95 + bobbing, size * 1.1, size * 0.6);
          ctx.strokeStyle = '#eab308'; // Gold royal trim
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-size * 0.55, -size * 0.95 + bobbing, size * 1.1, size * 0.6);
        }

        // Howdah seat inside
        ctx.fillStyle = headgearColor;
        ctx.fillRect(-size * 0.5, (ally.isCommander ? -size * 1.15 : -size * 0.95) + bobbing, size * 1.0, size * 0.12);

        // Flag flowing from back of Howdah (only regular)
        if (!ally.isCommander) {
          ctx.fillStyle = headgearColor;
          ctx.beginPath();
          ctx.moveTo(-size * 0.5, -size * 0.8 + bobbing);
          ctx.lineTo(-size * 1.35, -size * 0.9 + bobbing + Math.sin(time * 6) * 6);
          ctx.lineTo(-size * 0.9, -size * 0.76 + bobbing);
          ctx.lineTo(-size * 1.35, -size * 0.62 + bobbing + Math.sin(time * 6) * 6);
          ctx.lineTo(-size * 0.5, -size * 0.66 + bobbing);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Draw Allied Stick components and High-Fidelity Uniforms
      const ax = 0;
      const ay = riderYOffset;
      const shoulderY = ay - size * 0.32;
      const shieldX = ax - size * 0.32;
      const shieldY_pos = ay - size * 0.08;

      // 1. Uniform / Coat drawing
      if (ally.type === 'Gardi Infantry') {
        // Draw blue French uniform coat over the body
        ctx.fillStyle = '#1e3a8a'; // custom dark navy royal blue
        ctx.fillRect(ax - size * 0.12, ay - size * 0.42, size * 0.24, size * 0.52);
        // Golden brass buttons
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(ax, ay - size * 0.3, size * 0.03, 0, Math.PI * 2);
        ctx.arc(ax, ay - size * 0.2, size * 0.03, 0, Math.PI * 2);
        ctx.arc(ax, ay - size * 0.1, size * 0.03, 0, Math.PI * 2);
        ctx.fill();
        // Red sash belt
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(ax - size * 0.14, ay - size * 0.05, size * 0.28, size * 0.08);
      } else if (ally.type.includes('Cavalry') || ally.type.includes('Scout')) {
        // Cavalry leather vest and shoulder guards
        ctx.fillStyle = '#451a03'; // deep leather brown
        ctx.fillRect(ax - size * 0.12, ay - size * 0.4, size * 0.24, size * 0.48);
        ctx.fillStyle = '#f97316'; // Saffron sash belt
        ctx.fillRect(ax - size * 0.14, ay - size * 0.08, size * 0.28, size * 0.06);
      } else if (ally.type.includes('Ghazi') || ally.type.includes('Pashtun')) {
        // Loose white/grey tunic with dark waistcoat
        ctx.fillStyle = '#f5f5f4'; // limestone white
        ctx.fillRect(ax - size * 0.13, ay - size * 0.42, size * 0.26, size * 0.54);
        ctx.fillStyle = '#292524'; // almost black stone waistcoat
        ctx.fillRect(ax - size * 0.12, ay - size * 0.42, size * 0.24, size * 0.28);
        // Dark crimson sash belt
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(ax - size * 0.15, ay - size * 0.05, size * 0.3, size * 0.07);
      } else {
        // Default Maratha infantry: Saffron sash/vest over white cotton
        ctx.fillStyle = '#fafaf9'; // pure cotton off-white
        ctx.fillRect(ax - size * 0.11, ay - size * 0.42, size * 0.22, size * 0.5);
        ctx.fillStyle = '#ea580c'; // Saffron chest wrap
        ctx.beginPath();
        ctx.moveTo(ax - size * 0.11, ay - size * 0.4);
        ctx.lineTo(ax + size * 0.11, ay - size * 0.25);
        ctx.lineTo(ax + size * 0.11, ay - size * 0.15);
        ctx.lineTo(ax - size * 0.11, ay - size * 0.3);
        ctx.closePath();
        ctx.fill();
        // Saffron waist sash
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(ax - size * 0.13, ay - size * 0.06, size * 0.26, size * 0.08);
      }

      // Torso / Spine line back skeleton
      ctx.beginPath();
      ctx.moveTo(ax, ay - size * 0.4);
      ctx.lineTo(ax, ay + size * 0.12);
      ctx.strokeStyle = '#1e293b'; 
      ctx.lineWidth = 1.8 * ally.z;
      ctx.stroke();

      // Bending knee stick legs walking (only for non-elephants)
      if (ally.type !== 'Maratha War Elephant') {
        const allyWalk = time * 12 + ally.id;
        const legLX = Math.sin(allyWalk) * size * 0.22;
        const legRX = -Math.sin(allyWalk) * size * 0.22;
        const groundY = ay + size * 0.5;

        ctx.beginPath();
        ctx.moveTo(ax, ay + size * 0.12);
        ctx.lineTo(ax + legLX, groundY);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.8 * ally.z;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ax, ay + size * 0.12);
        ctx.lineTo(ax + legRX, groundY);
        ctx.stroke();
      }

      // Head
      ctx.beginPath();
      ctx.arc(ax, ay - size * 0.6, size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = ally.type.includes('Pashtun') || ally.type.includes('Ghazi') || ally.type.includes('Durrani') ? '#fcd34d' : '#fed7aa'; // ethnic skin tones
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.3 * ally.z;
      ctx.stroke();

      // Allied Headgear / Helmets / Turbans
      if (ally.type === 'Gardi Infantry') {
        // Blue bonnet cap with golden plume!
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(ax - size * 0.16, ay - size * 0.65);
        ctx.lineTo(ax + size * 0.16, ay - size * 0.65);
        ctx.lineTo(ax + size * 0.12, ay - size * 0.95);
        ctx.lineTo(ax - size * 0.12, ay - size * 0.95);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.stroke();
        
        // Red bonnet tassel feather
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(ax, ay - size * 0.97, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
      } else if (ally.type.includes('Cavalry') || ally.type.includes('Durrani Elite')) {
        // Pointed steel heavy Cavalry Helmet with royal feathers (Topes / Zirh Shahi)
        ctx.fillStyle = '#94a3b8'; // steel helmet
        ctx.beginPath();
        ctx.moveTo(ax - size * 0.18, ay - size * 0.66);
        ctx.quadraticCurveTo(ax, ay - size * 0.98, ax + size * 0.18, ay - size * 0.66);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Central pointed steel helm spike
        ctx.strokeStyle = '#d97706'; // Golden spike
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ax, ay - size * 0.82);
        ctx.lineTo(ax, ay - size * 0.96);
        ctx.stroke();

        // Helmet feather plume! (Green for Durrani, Orange/Red for Maratha)
        ctx.fillStyle = headgearColor;
        ctx.beginPath();
        ctx.ellipse(ax - size * 0.08, ay - size * 0.92, size * 0.05, size * 0.14, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Chainmail neck protector aventail hanging down!
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax - size * 0.16, ay - size * 0.66);
        ctx.lineTo(ax - size * 0.16, ay - size * 0.48);
        ctx.lineTo(ax + size * 0.16, ay - size * 0.48);
        ctx.lineTo(ax + size * 0.16, ay - size * 0.66);
        ctx.stroke();
      } else {
        // Traditional gorgeous draped saffron/crimson turban dome
        ctx.fillStyle = headgearColor;
        ctx.beginPath();
        ctx.arc(ax, ay - size * 0.68, size * 0.25, Math.PI, 0);
        ctx.fill();
        // Flowing sash tail hanging behind neck
        ctx.fillRect(size * 0.12, ay - size * 0.65, size * 0.06, size * 0.28);
      }

      // 2. Arms & Weapons
      // Arms: Left holds shield or Musket barrel
      ctx.beginPath();
      ctx.moveTo(ax, shoulderY);
      ctx.lineTo(shieldX, shieldY_pos);
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      if (ally.type === 'Maratha Mawala Swordsman') {
        // Round steel shield (Dhal) with beautiful golden sunburst insignia
        ctx.fillStyle = '#2d2d30'; // steel gray shadow
        ctx.beginPath();
        ctx.arc(shieldX, shieldY_pos, size * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24'; // shiny gold rim
        ctx.lineWidth = 1.5 * ally.z;
        ctx.stroke();
        
        // 4 golden knobs which are highly characteristic of Indian Dhals
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(shieldX - size * 0.1, shieldY_pos - size * 0.1, size * 0.04, 0, Math.PI * 2);
        ctx.arc(shieldX + size * 0.1, shieldY_pos - size * 0.1, size * 0.04, 0, Math.PI * 2);
        ctx.arc(shieldX - size * 0.08, shieldY_pos + size * 0.1, size * 0.04, 0, Math.PI * 2);
        ctx.arc(shieldX + size * 0.08, shieldY_pos + size * 0.1, size * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // Sunburst star in center of the shield
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(shieldX, shieldY_pos, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
      } else if (ally.type === 'Gardi Infantry') {
        const isShootingSession = !isClashing && (ally.shootCooldown && ally.shootCooldown < 30);
        if (isShootingSession) {
          // Draw musket in shooting pose
          const aimX = ax + size * 0.42;
          const aimY = shoulderY - size * 0.12;

          ctx.strokeStyle = '#451a03'; // wooden lock stock
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(ax - size * 0.2, shoulderY + 5);
          ctx.lineTo(aimX + size * 0.4, aimY - size * 0.1);
          ctx.stroke();

          ctx.strokeStyle = '#94a3b8'; // iron muzzle
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(ax, shoulderY);
          ctx.lineTo(aimX + size * 0.45, aimY - size * 0.12);
          ctx.stroke();
        } else {
          // Standard musket stance: Musket in left arm with a silver bayonet blade
          ctx.strokeStyle = '#451a03'; // wood stock
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(shieldX, shieldY_pos + 6);
          ctx.lineTo(ax + size * 0.35, ay - size * 0.18);
          ctx.stroke();

          ctx.strokeStyle = '#94a3b8'; // iron barrel
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(shieldX, shieldY_pos + 4);
          ctx.lineTo(ax + size * 0.38, ay - size * 0.2);
          ctx.stroke();

          // Silver bayonet tip
          ctx.strokeStyle = '#e2e8f0'; // bright blade
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ax + size * 0.35, ay - size * 0.19);
          ctx.lineTo(ax + size * 0.58, ay - size * 0.36);
          ctx.stroke();
        }
      }

      // Right arm weapon execution
      if (ally.type.includes('Cavalry') || ally.type.includes('Elite')) {
        // High lance spear and thrusting mechanics
        const forwardThrust = isClashing ? (Math.sin(time * 24 + ally.id) * size * 0.3) : 0;
        
        ctx.strokeStyle = '#1e293b'; 
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ax, shoulderY);
        ctx.lineTo(ax + size * 0.32 + forwardThrust, shoulderY + size * 0.1);
        ctx.stroke();

        // spear rod
        ctx.strokeStyle = '#78350f'; // spear shaft
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ax - size * 0.3, shoulderY + size * 0.35 - forwardThrust * 0.3);
        ctx.lineTo(ax + size * 1.3 + forwardThrust, shoulderY - size * 0.18 + forwardThrust * 0.1);
        ctx.stroke();

        // Shiny steel spear tip
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(ax + size * 1.3 + forwardThrust, shoulderY - size * 0.18 + forwardThrust * 0.1);
        ctx.lineTo(ax + size * 1.15 + forwardThrust, shoulderY - size * 0.26 + forwardThrust * 0.1);
        ctx.lineTo(ax + size * 1.48 + forwardThrust, shoulderY - size * 0.22 + forwardThrust * 0.1);
        ctx.lineTo(ax + size * 1.15 + forwardThrust, shoulderY - size * 0.1 + forwardThrust * 0.1);
        ctx.closePath();
        ctx.fill();

        // Small decorative crest flag dancing under tip
        ctx.fillStyle = headgearColor;
        ctx.beginPath();
        ctx.moveTo(ax + size * 1.05 + forwardThrust, shoulderY - size * 0.1);
        ctx.lineTo(ax + size * 0.7 + forwardThrust, shoulderY - size * 0.05 + Math.sin(time * 10) * 4);
        ctx.lineTo(ax + size * 0.98 + forwardThrust, shoulderY + Math.sin(time * 10) * 2);
        ctx.closePath();
        ctx.fill();
        
      } else if (ally.type === 'Maratha Mawala Swordsman') {
        const isDandpatta = (ally.id % 2 === 0);
        if (isDandpatta) {
          // Long Indian gauntlet-sword (Dandpatta) which swings or thrusts in straight line
          const swing = isClashing ? (Math.sin(time * 24 + ally.id) * 0.6) : 0.2;
          const handX = ax + size * 0.28;
          const handY = shoulderY + size * 0.2;

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ax, shoulderY);
          ctx.lineTo(handX, handY);
          ctx.stroke();

          // Golden wrist gauntlet tube covering forearm
          ctx.fillStyle = '#fbbf24'; 
          ctx.save();
          ctx.translate(ax + size * 0.12, shoulderY + size * 0.1);
          ctx.rotate(swing * 0.25);
          ctx.fillRect(-size * 0.1, -size * 0.08, size * 0.24, size * 0.16);
          ctx.restore();

          // Gleaming straight heavy 4-foot steel blade
          ctx.save();
          ctx.translate(handX, handY);
          ctx.rotate((swing * 25 + 10) * Math.PI / 180);
          ctx.strokeStyle = '#f8fafc'; // silver metal
          ctx.lineWidth = 2.6 * ally.z;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(size * 1.05, -size * 0.25);
          ctx.stroke();

          if (isClashing) {
            // Golden swipe residue sparks
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)'; // gold glowing swipe overlay
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(size * 0.5, -size * 0.4, size * 1.05, -size * 0.25);
            ctx.stroke();
          }
          ctx.restore();
        } else {
          // Curved Maratha Talwar scimitar with disk-pommel guard
          const combatSwing = isClashing ? (Math.sin(time * 20 + ally.id) * 0.5) : 0.3;
          const elbowX = ax + size * 0.22 + Math.cos(combatSwing) * size * 0.12;
          const elbowY = shoulderY + size * 0.12 + Math.sin(combatSwing) * size * 0.12;
          const handX = elbowX + size * 0.15;
          const handY = elbowY + Math.sin(combatSwing) * size * 0.12;

          ctx.beginPath();
          ctx.moveTo(ax, shoulderY);
          ctx.lineTo(elbowX, elbowY);
          ctx.lineTo(handX, handY);
          ctx.strokeStyle = '#1e293b';
          ctx.stroke();

          // Talwar blade
          ctx.save();
          ctx.translate(handX, handY);
          ctx.rotate((35 + Math.sin(time * 16 + ally.id) * 35) * Math.PI / 180);
          ctx.strokeStyle = '#cbd5e1'; // steel
          ctx.lineWidth = 2.3 * ally.z;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.54, Math.PI * 1.5, Math.PI * 1.9, false);
          ctx.stroke();
          
          // Draw disk shield pommel guard
          ctx.fillStyle = '#fbbf24'; // brass gold pommel
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Allied soldier health indicators
      const isAllyElephant = ally.type.includes('Elephant') || (!!ally.isCommander && ally.commanderMount === 'elephant');
      let maxHp = ally.maxHp || 100;
      let barW = size * (isAllyElephant ? 1.8 : 1.1);
      let allyHpY = isAllyElephant ? -size * 2.3 + bobbing : -size * 1.1 + bobbing;
      let allyLabelY = isAllyElephant ? -size * 2.5 + bobbing : -size * 1.30 + bobbing;

      if (ally.isCommander) {
        maxHp = 350;
        barW = size * 2.5; // wider health bar
        allyHpY = isAllyElephant ? -size * 2.5 + bobbing : -size * 1.3 + bobbing;
        allyLabelY = isAllyElephant ? -size * 2.7 + bobbing : -size * 1.5 + bobbing;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(-barW / 2, allyHpY, barW, ally.isCommander ? 4 : 2.5);
      // Health meter
      ctx.fillStyle = ally.isCommander ? '#eab308' : '#22c55e'; // Golden plate for commander!
      ctx.fillRect(-barW / 2, allyHpY, barW * Math.min(1, ally.hp / maxHp), ally.isCommander ? 4 : 2.5);

      // Labeling for Commanders and Elephants
      if (ally.isCommander) {
        // Draw elegant framed commander title!
        ctx.fillStyle = 'rgba(251, 191, 36, 0.9)'; // majestic gold
        ctx.font = `bold ${Math.max(8, 11 * ally.z)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`👑 ${ally.commanderName?.toUpperCase()}`, 0, allyLabelY);
        
        ctx.fillStyle = '#cbd5e1'; // light slate subtitle
        ctx.font = `${Math.max(6, 8 * ally.z)}px sans-serif`;
        ctx.fillText(ally.commanderRole || "Commander", 0, allyLabelY + 8 * ally.z);
      } else if (isAllyElephant) {
        ctx.fillStyle = '#f97316';
        ctx.font = `bold ${Math.max(6, 9 * ally.z)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(ally.type.toUpperCase(), 0, allyLabelY);
      }
      
      ctx.restore();
      
      ctx.restore();
    });
  };

  // Draw curving sword slashes
  const updateAndDrawSwordSlashes = (ctx: CanvasRenderingContext2D) => {
    const list = slashesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      s.progress += 0.08;

      if (s.progress >= 1.0) {
        list.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // Create a majestic fading arc representing the talwar slash
      ctx.beginPath();
      ctx.arc(0, 0, s.length, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = isShamsherSelected ? 7 * (1 - s.progress) : 4 * (1 - s.progress);
      ctx.shadowBlur = isShamsherSelected ? 20 : 10;
      ctx.shadowColor = s.color;
      ctx.stroke();

      // Atmospheric air pressure expansion distortion (shockwave ring)
      ctx.strokeStyle = `rgba(224, 242, 254, ${0.35 * (1 - s.progress)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, s.length * (0.7 + 1.4 * s.progress), -Math.PI * 0.42, Math.PI * 0.42);
      ctx.stroke();

      ctx.restore();
      ctx.shadowBlur = 0; // reset
    }
  };

  // Update and render cannonballs
  const updateAndDrawArtilleryShells = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const list = shellRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      s.progress += 0.05;

      s.currentX = s.startX + (s.targetX - s.startX) * s.progress;
      // Parabolic artillery arc calculation
      const peakY = Math.min(s.startY, s.targetY) - 130;
      const t = s.progress;
      s.currentY = (1 - t) * (1 - t) * s.startY + 2 * (1 - t) * t * peakY + t * t * s.targetY;

      if (s.progress >= 1.0) {
        // Impact!
        spawnMassiveExplosion(s.targetX, s.targetY);
        // Intense explosion screenshake and gravity-based soil/spark plumes
        shakeRef.current = Math.min(shakeRef.current + 24, 45);
        spawnHitSplatter(s.targetX, s.targetY, '#78350f', 2.2); 
        spawnHitSplatter(s.targetX, s.targetY, '#f97316', 1.4);
        // Damage deal to vicinity
        let hitMultiplier = 0;
        targetsRef.current.forEach(tar => {
          if (tar.hp > 0 && Math.hypot(tar.x - s.targetX, tar.y - s.targetY) < 70) {
            tar.hp = Math.max(0, tar.hp - 35);
            hitMultiplier += 1;
          }
        });

        if (hitMultiplier > 0) {
          onEnemyHit(28, "🔥 SIEGE ARTILLERY IMPACT", true);
          textsRef.current.push({
            x: s.targetX,
            y: s.targetY - 30,
            text: `🔥 CANNON BLAST! x${hitMultiplier}`,
            alpha: 1,
            color: '#ef4444',
            scale: 1.3,
            vy: -1.7
          });
        }

        list.splice(i, 1);
        continue;
      }

      // Draw heavy iron sphere
      ctx.fillStyle = '#292524';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.currentX, s.currentY, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tail smoke coordinates for cannonballs
      for (let k = 0; k < 3; k++) {
        spawnParticle(
          s.currentX - (s.targetX - s.startX) * 0.02 * k,
          s.currentY + 2 * k,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          'rgba(244, 63, 94, 0.35)',
          4 + Math.random() * 5,
          0.06
        );
      }
    }
  };

  const updateBulletShooting = (time: number) => {
    if (phase !== 'clash') return;

    const allies = alliedSoldiersRef.current;
    const hostiles = targetsRef.current;

    // 1. Process allies ranged shooters
    allies.forEach(ally => {
      if (ally.hp <= 0) return;

      // Check if ranged unit type
      const isRanged = ally.type === 'Gardi Infantry' || ally.type.includes('Swivel') || ally.type.includes('Gunner') || ally.type.includes('Cannon') || ally.type.includes('Artillery');
      if (!isRanged) return;

      // Tick down shootCooldown
      if (ally.shootCooldown === undefined) {
        ally.shootCooldown = 40 + Math.random() * 120;
      } else {
        ally.shootCooldown -= 1;
      }

      const isCannon = ally.type.includes('Cannon') || ally.type.includes('Artillery');

      if (ally.shootCooldown <= 0) {
        // Find a target to shoot at
        const target = ally.targetEnemyId !== null ? hostiles.find(h => h.id === ally.targetEnemyId && h.hp > 0) : null;
        if (target) {
          const dist = Math.hypot(target.x - ally.x, target.y - ally.y);
          // Only shoot if far (not in close melee clashing)
          if (dist > 90) {
            if (isCannon) {
              ally.shootCooldown = 280 + Math.random() * 150; // Cannon reload takes 5-7.5 seconds
              
              // Spawn a cannonball!
              bulletTracersRef.current.push({
                id: Math.random(),
                startX: ally.x + 20,
                startY: ally.y - 4, // near muzzle
                currentX: ally.x + 20,
                currentY: ally.y - 4,
                targetX: target.x,
                targetY: target.y - 10 * target.z,
                progress: 0,
                speed: 0.045 + Math.random() * 0.015,
                color: '#facc15',
                type: 'cannonball'
              });

              // Initial massive powder smoke burst at muzzle!
              spawnHitSplatter(ally.x + 24, ally.y, '#f5fafb', 1.5);
              spawnHitSplatter(ally.x + 24, ally.y, '#f97316', 1.0);
              shakeRef.current = Math.min(shakeRef.current + 8, 25);
            } else {
              ally.shootCooldown = 150 + Math.random() * 120; // Cooldown 2-4 seconds

              // Spawn a bullet tracer!
              bulletTracersRef.current.push({
                id: Math.random(),
                startX: ally.x + 10,
                startY: ally.y - 12 * ally.z,
                currentX: ally.x + 10,
                currentY: ally.y - 12 * ally.z,
                targetX: target.x,
                targetY: target.y - 10 * target.z,
                progress: 0,
                speed: 0.08 + Math.random() * 0.04, // Travels in ~8-12 frames
                color: ally.type.includes('Swivel') ? '#f59e0b' : '#fef08a',
                type: ally.type.includes('Swivel') ? 'zamburak' : 'musket'
              });

              // Spawn initial powder smoke puff at muzzle
              spawnHitSplatter(ally.x + 12, ally.y - 12 * ally.z, '#e2e8f0', 0.5);
            }
          } else {
            // Under intensive face-to-face melee, speed up reload or force close-melee
            ally.shootCooldown = 20;
          }
        }
      }
    });

    // 2. Process hostiles ranged shooters
    hostiles.forEach(hostile => {
      if (hostile.hp <= 0) return;

      const isRanged = hostile.type === 'Gardi Infantry' || hostile.type.includes('Swivel') || hostile.type.includes('Gunner');
      if (!isRanged) return;

      if (hostile.shootCooldown === undefined) {
        hostile.shootCooldown = 40 + Math.random() * 120;
      } else {
        hostile.shootCooldown -= 1;
      }

      if (hostile.shootCooldown <= 0) {
        // Find an ally to shoot
        const target = hostile.targetAllyId ? allies.find(a => a.id === hostile.targetAllyId && a.hp > 0) : null;
        
        let finalTarget = target;
        if (!finalTarget) {
          const liveAllies = allies.filter(a => a.hp > 0);
          if (liveAllies.length > 0) {
            liveAllies.sort((a, b) => Math.hypot(a.x - hostile.x, a.y - hostile.y) - Math.hypot(b.x - hostile.x, b.y - hostile.y));
            hostile.targetAllyId = liveAllies[0].id;
            finalTarget = liveAllies[0];
          }
        }

        if (finalTarget) {
          const dist = Math.hypot(finalTarget.x - hostile.x, finalTarget.y - hostile.y);
          if (dist > 90) {
            hostile.shootCooldown = 150 + Math.random() * 120;

            // Spawn tracer
            bulletTracersRef.current.push({
              id: Math.random(),
              startX: hostile.x - 10,
              startY: hostile.y - 12 * hostile.z,
              currentX: hostile.x - 10,
              currentY: hostile.y - 12 * hostile.z,
              targetX: finalTarget.x,
              targetY: finalTarget.y - 10 * finalTarget.z,
              progress: 0,
              speed: 0.08 + Math.random() * 0.04,
              color: hostile.type.includes('Swivel') ? '#f97316' : '#fef08a',
              type: hostile.type.includes('Swivel') ? 'zamburak' : 'musket'
            });

            spawnHitSplatter(hostile.x - 12, hostile.y - 12 * hostile.z, '#e2e8f0', 0.5);
          } else {
            hostile.shootCooldown = 20;
          }
        }
      }
    });
  };

  const updateAndDrawBulletTracers = (ctx: CanvasRenderingContext2D) => {
    const list = bulletTracersRef.current;
    const allies = alliedSoldiersRef.current;
    const hostiles = targetsRef.current;

    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.progress += b.speed;

      b.currentX = b.startX + (b.targetX - b.startX) * b.progress;
      b.currentY = b.startY + (b.targetY - b.startY) * b.progress;

      ctx.save();
      if (b.type === 'cannonball') {
        const rotationAngle = (Date.now() / 50) % (Math.PI * 2); // spinning artillery projectile
        ctx.translate(b.currentX, b.currentY);
        ctx.rotate(rotationAngle);

        // Draw fiery cannon shell core
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
        grad.addColorStop(0, '#fef08a'); // inner white-hot core
        grad.addColorStop(0.3, '#f97316'); // fire orange
        grad.addColorStop(0.8, '#ea580c'); // dark crimson shell
        grad.addColorStop(1, '#1e293b'); // iron cast casing
        ctx.fillStyle = grad;
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#ea580c';
        ctx.fill();

        // High velocity sparking fuse tail sparks emited behind shell
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-8, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(-11, 2, 2.0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        const travelDx = b.targetX - b.startX;
        const travelDy = b.targetY - b.startY;
        const travelLen = Math.hypot(travelDx, travelDy);
        const traceLength = 25;
        const backX = b.currentX - (travelDx / (travelLen || 1)) * traceLength;
        const backY = b.currentY - (travelDy / (travelLen || 1)) * traceLength;

        ctx.moveTo(backX, backY);
        ctx.lineTo(b.currentX, b.currentY);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.type === 'zamburak' ? 2.5 : 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = b.color;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.restore();

      if (b.progress >= 1.0) {
        list.splice(i, 1);

        // Check hostile hit
        const hitHostiles = b.type === 'cannonball'
          ? hostiles.filter(h => h.hp > 0 && Math.abs(h.x - b.targetX) < 75 && Math.abs(h.y - b.targetY) < 75)
          : hostiles.filter(h => h.hp > 0 && Math.abs(h.x - b.targetX) < 35 && Math.abs(h.y - b.targetY) < 35).slice(0, 1);

        if (hitHostiles.length > 0) {
          const difficultyKey = localStorage.getItem('panipat_battle_difficulty') || 'veteran';
          
          hitHostiles.forEach(hitHostile => {
            const isElephant = hitHostile.type.includes('Elephant');
            const standardDmg = b.type === 'cannonball'
              ? 90 + Math.random() * 45 // massive explosive damage
              : b.type === 'zamburak' ? 16 + Math.random() * 10 : 8 + Math.random() * 6;
              
            const finalDmg = Math.round(standardDmg * (difficultyKey === 'recruit' ? 1.35 : difficultyKey === 'peshwa' ? 0.65 : 1.0));

            hitHostile.hp = Math.max(0, hitHostile.hp - finalDmg);
            spawnHitSplatter(hitHostile.x, hitHostile.y, '#b91c1c', isElephant ? 1.4 : 0.8);
            spawnHitSplatter(hitHostile.x, hitHostile.y, '#f59e0b', isElephant ? 1.0 : 0.6);
            
            if (b.type === 'cannonball') {
              spawnHitSplatter(hitHostile.x, hitHostile.y, '#ef4444', 1.25);
              spawnHitSplatter(hitHostile.x + 10, hitHostile.y - 10, '#f97316', 0.9);
            }

            textsRef.current.push({
              x: hitHostile.x,
              y: hitHostile.y - 15 - (Math.random() * 10),
              text: `-${finalDmg} ${b.type === 'cannonball' ? '💥 CANNON BLAST!' : b.type === 'zamburak' ? '💥 Zamburak' : '🎯 Musket'}`,
              alpha: 1,
              color: b.type === 'cannonball' ? '#f97316' : b.type === 'zamburak' ? '#fb923c' : '#facc15',
              scale: b.type === 'cannonball' ? 1.25 : 0.8,
              vy: -1.2
            });

            onEnemyHit(finalDmg, b.type === 'cannonball' ? '🔥 HEAVY ARTILLERY' : b.type === 'zamburak' ? '🐫 SWIVEL FIRE' : '🎯 GARDI MUSKETRY', true);
          });

          if (b.type === 'cannonball') {
            shakeRef.current = Math.min(shakeRef.current + 15, 30);
          } else if (b.type === 'zamburak') {
            shakeRef.current = Math.min(shakeRef.current + 3, 10);
          }
          continue;
        }

        // Check ally hit
        const hitAlly = allies.find(a => a.hp > 0 && Math.abs(a.x - b.targetX) < 35 && Math.abs(a.y - b.targetY) < 35);
        if (hitAlly) {
          const difficultyKey = localStorage.getItem('panipat_battle_difficulty') || 'veteran';
          const isElephant = hitAlly.type.includes('Elephant');
          const standardDmg = b.type === 'zamburak' ? 14 + Math.random() * 8 : 7 + Math.random() * 5;
          const finalDmg = Math.round(standardDmg * (difficultyKey === 'peshwa' ? 1.45 : difficultyKey === 'recruit' ? 0.7 : 1.1));

          hitAlly.hp = Math.max(0, hitAlly.hp - finalDmg);
          spawnHitSplatter(hitAlly.x, hitAlly.y, '#b91c1c', isElephant ? 1.3 : 0.7);
          spawnHitSplatter(hitAlly.x, hitAlly.y, '#eab308', 0.35);

          if (b.type === 'zamburak') {
            shakeRef.current = Math.min(shakeRef.current + 2.5, 8);
          }

          textsRef.current.push({
            x: hitAlly.x,
            y: hitAlly.y - 12,
            text: `-${finalDmg} ${b.type === 'zamburak' ? '💥 Zamburak' : '🎯 Musket'}`,
            alpha: 1,
            color: '#ef4444',
            scale: 0.75,
            vy: -1.0
          });
        }
      }
    }
  };

  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    const list = particlesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity !== undefined) {
        p.vy += p.gravity;
      }
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        list.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  };

  const updateAndDrawDamageText = (ctx: CanvasRenderingContext2D) => {
    const list = textsRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const t = list[i];
      t.y += t.vy;
      t.alpha -= 0.016;

      if (t.alpha <= 0) {
        list.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      ctx.fillStyle = t.color;
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 6;
      ctx.font = '900 11.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, 0, 0);

      ctx.restore();
      ctx.shadowBlur = 0;
    }
  };

  // Draw dynamic weather and time-of-day overlays over characters and background elements
  const drawAtmosphericOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, atmTime: number) => {
    const width = canvas.width;
    const height = canvas.height;
    const horizon = height * 0.36;

    // 1. Time-of-day ambient filtration
    if (timeOfDay === 'dawn') {
      const dawnGrad = ctx.createLinearGradient(0, 0, 0, height);
      dawnGrad.addColorStop(0, 'rgba(235, 115, 23, 0.16)');
      dawnGrad.addColorStop(0.5, 'rgba(219, 39, 119, 0.08)');
      dawnGrad.addColorStop(1, 'rgba(120, 0, 100, 0.03)');
      ctx.fillStyle = dawnGrad;
      ctx.fillRect(0, 0, width, height);
    } else if (timeOfDay === 'dusk') {
      const duskGrad = ctx.createLinearGradient(0, 0, 0, height);
      duskGrad.addColorStop(0, 'rgba(107, 33, 168, 0.16)');
      duskGrad.addColorStop(0.5, 'rgba(225, 29, 72, 0.08)');
      duskGrad.addColorStop(1, 'rgba(15, 23, 42, 0.05)');
      ctx.fillStyle = duskGrad;
      ctx.fillRect(0, 0, width, height);
    } else if (timeOfDay === 'midnight') {
      // Midnight shade covering the whole scene
      ctx.fillStyle = 'rgba(6, 8, 30, 0.52)';
      ctx.fillRect(0, 0, width, height);

      // Radial spotlight flashlight centered on reticle overlay!
      ctx.save();
      const grad = ctx.createRadialGradient(mousePos.x, mousePos.y, 35, mousePos.x, mousePos.y, 140);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.15)'); // faint yellow spotlight center
      grad.addColorStop(0.4, 'rgba(6, 8, 30, 0.02)');
      grad.addColorStop(1, 'rgba(6, 8, 30, 0.45)'); // fading back into darkness
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 2. Weather atmospheric layer
    if (weather === 'rain') {
      // Falling raindrops
      ctx.save();
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.36)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      for (let i = 0; i < 45; i++) {
        const rx = (i * 31 + atmTime * 220) % width;
        const ry = (i * 17 + atmTime * 480) % height;
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 3, ry + 12);
      }
      ctx.stroke();

      // Splashes on land ground
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.22)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 15; i++) {
        const sx = (i * 61 + atmTime * 70) % width;
        const sy = horizon + ((i * 37 + atmTime * 15) % (height - horizon - 10));
        ctx.beginPath();
        ctx.ellipse(sx, sy, 3 + Math.sin(atmTime * 6 + i) * 1.5, 1 + Math.sin(atmTime * 6 + i) * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    } else if (weather === 'dust_storm') {
      // Swirling sandy dust sepia filter
      ctx.fillStyle = 'rgba(217, 119, 6, 0.16)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      for (let i = 0; i < 20; i++) {
        const dx = (i * 53 + atmTime * 420) % (width + 100) - 50;
        const dy = (i * 23) % height + Math.sin(atmTime * 2.5 + i) * 12;
        ctx.fillRect(dx, dy, 60 + (i % 3) * 45, 1.5 + (i % 2));
      }
    } else if (weather === 'fog') {
      // Soft winter mist white overlay
      ctx.fillStyle = 'rgba(228, 228, 231, 0.18)';
      ctx.fillRect(0, 0, width, height);

      // Freezing drift clouds
      ctx.fillStyle = 'rgba(244, 244, 245, 0.14)';
      for (let i = 0; i < 5; i++) {
        const fx = (i * 220 + atmTime * 25) % (width + 300) - 150;
        const fy = horizon - 20 + i * 38;
        ctx.beginPath();
        ctx.arc(fx, fy, 45 + i * 15, 0, Math.PI * 2);
        ctx.arc(fx - 30, fy + 4, 30, 0, Math.PI * 2);
        ctx.arc(fx + 30, fy - 4, 35, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Draw 1st Person Armaments (The heavy brass cannon & the curved Talwar sword blade)
  const drawPOVWeapons = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: number) => {
    const width = canvas.width;
    const height = canvas.height;

    // A helper to draw highly stylized and historically accurate cannoneer crew operating the guns
    const drawCannoneer = (
      cctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      faction: 'maratha' | 'durrani', 
      role: 'igniter' | 'rammer' | 'flagman' | 'carrier', 
      facingLeft: boolean,
      firing: boolean,
      animTime: number
    ) => {
      cctx.save();
      cctx.translate(x, y);
      if (facingLeft) {
        cctx.scale(-1, 1);
      }
      
      // Smooth breathing/bobbing lifecycle
      const breathe = Math.sin(animTime * 0.005 + (role === 'rammer' ? 1.5 : role === 'flagman' ? 0.7 : 0)) * 2.5;
      
      // Choose historical military color palettes based on active faction and combat roles
      const isGardi = role === 'rammer' || role === 'igniter'; // Gardi are French-trained artillery specialists
      const primaryColor = faction === 'maratha' 
        ? (isGardi ? '#1d4ed8' : '#f97316') // French royal blue vs traditional saffron orange
        : '#15803d'; // Durrani Emerald Green
      const accentColor = faction === 'maratha' 
        ? (isGardi ? '#ea580c' : '#b45309') // Saffron accent vs dark gold
        : '#1e3a8a'; // Durrani royal cobalt blue
      const tunicColor = faction === 'maratha' 
        ? (isGardi ? '#f1f5f9' : '#fef3c7') // Gardi light grey silver coat vs traditional Maratha cotton cream
        : '#e2e8f0'; // Afghan light wool vestment
      const skinColor = '#d9a073'; // Warm Indian/Afghan skintone
      const pantsColor = '#1f2937'; // Coarse dark slate trousers
      const metalColor = '#475569'; // Damascus iron

      // 1. Draw Legs and Boots
      cctx.fillStyle = '#111827'; // Dark polished boots
      cctx.strokeStyle = '#27272a';
      cctx.lineWidth = 1.8;
      
      // Rear supporting leg
      cctx.beginPath();
      cctx.moveTo(-10, 40);
      cctx.lineTo(-14, 62);
      cctx.lineTo(-22, 62); // Boot tip
      cctx.lineTo(-10, 40);
      cctx.fill();
      cctx.stroke();

      // Forward bent leg (braced stance for recoil and barrel loading weight)
      cctx.beginPath();
      cctx.moveTo(10, 40);
      cctx.lineTo(18, 59);
      cctx.lineTo(26, 60); // Forward boot tip
      cctx.lineTo(10, 40);
      cctx.fill();
      cctx.stroke();

      // 2. Main Torso and Folded Tunic
      cctx.fillStyle = tunicColor;
      cctx.strokeStyle = '#3f220f';
      cctx.lineWidth = 2;
      cctx.beginPath();
      cctx.moveTo(-16, 10 + breathe);
      cctx.lineTo(16, 10 + breathe);
      cctx.lineTo(13, 40);
      cctx.lineTo(-13, 40);
      cctx.closePath();
      cctx.fill();
      cctx.stroke();

      // Fabric waist sash / military cummerbund
      cctx.fillStyle = primaryColor;
      cctx.fillRect(-14, 30 + breathe, 28, 7);

      // Symmetrick cross belts for carrying ammunition pouches / tools
      cctx.strokeStyle = '#451a03';
      cctx.lineWidth = 2;
      cctx.beginPath();
      cctx.moveTo(-11, 10 + breathe);
      cctx.lineTo(11, 30 + breathe);
      cctx.stroke();

      // 3. Head & Majestic Facial Beard
      cctx.fillStyle = skinColor;
      cctx.beginPath();
      cctx.arc(0, -2 + breathe, 9, 0, Math.PI * 2);
      cctx.fill();
      cctx.stroke();

      // Traditional beard profile
      cctx.fillStyle = '#1e1b18';
      cctx.beginPath();
      cctx.arc(4, 2 + breathe, 5, 0, Math.PI * 0.85);
      cctx.fill();

      // 4. Elegant Turban or French-style Faction Headgear
      if (faction === 'maratha') {
        if (isGardi) {
          // French-trained Gardi Infantry helmet cap (Shako type top-hat)
          cctx.fillStyle = '#1e293b';
          cctx.fillRect(-8, -14 + breathe, 16, 9);
          cctx.fillStyle = '#dc2626'; // Red band
          cctx.fillRect(-8, -9 + breathe, 16, 3);
          
          cctx.strokeStyle = '#eab308'; // Gilded details
          cctx.strokeRect(-8, -14 + breathe, 16, 9);
          
          // Feather plume
          cctx.fillStyle = '#eab308';
          cctx.beginPath();
          cctx.moveTo(-4, -14 + breathe);
          cctx.lineTo(-6, -24 + breathe);
          cctx.lineTo(-2, -14 + breathe);
          cctx.fill();
        } else {
          // Traditional Peshwai Pheta (Saffron flared turban)
          cctx.fillStyle = '#f97316';
          cctx.beginPath();
          cctx.ellipse(0, -9 + breathe, 13, 6, -0.15, 0, Math.PI * 2);
          cctx.fill();
          cctx.stroke();
          
          cctx.fillStyle = '#ea580c'; // Flowing crown crest
          cctx.beginPath();
          cctx.moveTo(-3, -12 + breathe);
          cctx.quadraticCurveTo(-11, -23 + breathe, -7, -25 + breathe);
          cctx.quadraticCurveTo(-1, -19 + breathe, -1, -12 + breathe);
          cctx.fill();
        }
      } else {
        // Durrani Afghan Turban with central protective Kulah cone cap
        cctx.fillStyle = '#f8fafc'; // White cotton wrap
        cctx.beginPath();
        cctx.ellipse(0, -9 + breathe, 14, 7, 0, 0, Math.PI * 2);
        cctx.fill();
        cctx.stroke();
        
        cctx.fillStyle = '#eab308'; // Golden Kulah peak
        cctx.beginPath();
        cctx.moveTo(-4, -13 + breathe);
        cctx.lineTo(0, -23 + breathe);
        cctx.lineTo(4, -13 + breathe);
        cctx.closePath();
        cctx.fill();
        cctx.stroke();
      }

      // 5. Dynamic Arms and Interactive Operational Equipment based on roles!
      cctx.strokeStyle = skinColor;
      cctx.lineWidth = 3.5;
      
      if (role === 'igniter') {
        if (firing) {
          // Firing phase reaction: Leaning back defensively, hiding face from heat
          cctx.beginPath();
          cctx.moveTo(-5, 12 + breathe);
          cctx.lineTo(-20, -5);
          cctx.lineTo(-14, -22); // Arm raised over brow
          cctx.stroke();

          cctx.beginPath();
          cctx.moveTo(5, 14 + breathe);
          cctx.lineTo(24, 22); // Trigger hand pulled back
          cctx.stroke();

          // Jerked linstock stick
          cctx.lineWidth = 3;
          cctx.strokeStyle = '#78350f';
          cctx.beginPath();
          cctx.moveTo(15, 32);
          cctx.lineTo(38, 4);
          cctx.stroke();
        } else {
          // Ready/Aiming stance: Holding the glowing metal linstock towards touchhole
          cctx.beginPath();
          cctx.moveTo(5, 14 + breathe);
          cctx.lineTo(28, 8 + breathe); // Arm extended
          cctx.stroke();

          // Linstock igniter staff
          cctx.lineWidth = 3;
          cctx.strokeStyle = '#78350f';
          cctx.beginPath();
          cctx.moveTo(18, 24 + breathe);
          cctx.lineTo(44, -10 + breathe); // Angled directly at cannon touchhole breech
          cctx.stroke();

          // Dynamic glowing matches
          cctx.fillStyle = '#ef4444';
          cctx.beginPath();
          cctx.arc(44, -10 + breathe, 3.5, 0, Math.PI * 2);
          cctx.fill();

          cctx.fillStyle = '#fb923c';
          cctx.beginPath();
          cctx.arc(44, -10 + breathe, 2, 0, Math.PI * 2);
          cctx.fill();
        }
      } else if (role === 'rammer') {
        if (firing) {
          // Recovering/covering ears from the heavy blast sound waves
          cctx.beginPath();
          cctx.moveTo(-5, 14 + breathe);
          cctx.lineTo(-24, -2 + breathe);
          cctx.lineTo(-18, -16 + breathe);
          cctx.moveTo(5, 14 + breathe);
          cctx.lineTo(24, -2 + breathe);
          cctx.lineTo(18, -16 + breathe);
          cctx.stroke();
        } else {
          // Reloading cycle: pushing raw powder and shells in muzzle
          const ramOffset = Math.sin(animTime * 0.007) * 14;
          cctx.beginPath();
          cctx.moveTo(-5, 14 + breathe);
          cctx.lineTo(14 + ramOffset * 0.5, 4 + breathe);
          cctx.moveTo(5, 14 + breathe);
          cctx.lineTo(22 + ramOffset * 0.5, 10 + breathe);
          cctx.stroke();

          // Sponge rammer rod
          cctx.lineWidth = 3.2;
          cctx.strokeStyle = '#78350f';
          cctx.beginPath();
          cctx.moveTo(-18 + ramOffset, 18 + breathe);
          cctx.lineTo(58 + ramOffset, -14 + breathe); // Staff slide
          cctx.stroke();

          // Cylinder brush tips
          cctx.fillStyle = '#374151';
          cctx.beginPath();
          cctx.ellipse(58 + ramOffset, -14 + breathe, 4.5, 7.5, -0.45, 0, Math.PI * 2);
          cctx.fill();
        }
      } else if (role === 'flagman') {
        if (firing) {
          // Flag swung down rapidly: "FIRE!"
          cctx.beginPath();
          cctx.moveTo(5, 14 + breathe);
          cctx.lineTo(26, 28 + breathe);
          cctx.stroke();

          cctx.lineWidth = 3;
          cctx.strokeStyle = '#78350f';
          cctx.beginPath();
          cctx.moveTo(16, 14 + breathe);
          cctx.lineTo(38, 40 + breathe); // Staff down
          cctx.stroke();

          // Command flag
          cctx.fillStyle = primaryColor;
          cctx.beginPath();
          cctx.moveTo(24, 24 + breathe);
          cctx.lineTo(44, 44 + breathe);
          cctx.lineTo(34, 52 + breathe);
          cctx.lineTo(18, 30 + breathe);
          cctx.closePath();
          cctx.fill();
          cctx.stroke();
        } else {
          // Holding battery command flag high to guide aiming vectors
          cctx.beginPath();
          cctx.moveTo(5, 14 + breathe);
          cctx.lineTo(24, -8 + breathe); // Raising arm
          cctx.stroke();

          cctx.lineWidth = 3;
          cctx.strokeStyle = '#78350f';
          cctx.beginPath();
          cctx.moveTo(14, 4 + breathe);
          cctx.lineTo(32, -42 + breathe);
          cctx.stroke();

          // Flowing triangular pennon flag waving
          cctx.fillStyle = primaryColor;
          cctx.beginPath();
          cctx.moveTo(22, -22 + breathe);
          cctx.quadraticCurveTo(42 + Math.sin(animTime * 0.008) * 5, -28 + breathe, 46, -38 + breathe);
          cctx.lineTo(32, -42 + breathe);
          cctx.closePath();
          cctx.fill();
          cctx.stroke();
        }
      } else if (role === 'carrier') {
        if (firing) {
          // Shield eyes from the extreme flash burst brightness
          cctx.beginPath();
          cctx.moveTo(-5, 14 + breathe);
          cctx.lineTo(-14, -4);
          cctx.lineTo(2, -10);
          cctx.stroke();
        } else {
          // Carrying heavy iron shell to muzzle
          cctx.beginPath();
          cctx.moveTo(-5, 14 + breathe);
          cctx.lineTo(12, 10 + breathe);
          cctx.moveTo(5, 14 + breathe);
          cctx.lineTo(12, 18 + breathe);
          cctx.stroke();

          // The black heavy sphere shell
          cctx.fillStyle = '#1e293b';
          cctx.beginPath();
          cctx.arc(15, 14 + breathe, 5.5, 0, Math.PI * 2);
          cctx.fill();
          cctx.stroke();
        }
      }

      cctx.restore();
    };

    // Draw defensive sandbag palisades at very bottom
    ctx.fillStyle = '#29170e';
    ctx.strokeStyle = '#452615';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(80, height);
    ctx.lineTo(130, height - 32);
    ctx.lineTo(width - 130, height - 32);
    ctx.lineTo(width - 80, height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let x = 110; x < width - 110; x += 45) {
      ctx.fillStyle = '#301c11';
      ctx.fillRect(x, height - 30, 40, 16);
      ctx.strokeRect(x, height - 30, 40, 16);
    }

    // A. LEFT WEAPON: Heavy Gilded Brass Siege Gun (Artillery)
    ctx.save();
    // Use recoil offset to spring back
    const recoilOffset = cannonRecoil * 35;
    ctx.translate(width * 0.15 - recoilOffset, height + recoilOffset * 0.5);

    // Draw wooden carriage wheels
    ctx.fillStyle = '#311005';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#eab308';
    ctx.stroke();

    // Draw heavy cannon barrel pointed towards center field
    ctx.rotate(-26 * Math.PI / 180);
    const grad = ctx.createLinearGradient(0, -18, 120, -18);
    grad.addColorStop(0, '#7c2d12');
    grad.addColorStop(0.5, '#b45309');
    grad.addColorStop(1, '#eab308');
    ctx.fillStyle = grad;
    
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(120, -14);
    ctx.lineTo(120, 14);
    ctx.lineTo(0, 18);
    ctx.closePath();
    ctx.fill();

    // Imperial engravings bands on cannon barrel
    ctx.fillStyle = '#451a03';
    ctx.fillRect(35, -16, 8, 32);
    ctx.fillRect(80, -15, 8, 30);

    // Cannon bore ring
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(120, 0, 4, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sizzling muzzle blast flash overlay when recoil is active
    if (cannonRecoil > 0.05) {
      ctx.save();
      ctx.translate(122, 0);
      const flashGrad = ctx.createRadialGradient(0, 0, 6, 30, 0, 65);
      flashGrad.addColorStop(0, '#ffffff');
      flashGrad.addColorStop(0.2, '#fecdd3'); // Rosy white hot core
      flashGrad.addColorStop(0.5, '#facc15'); // Brilliant golden orange
      flashGrad.addColorStop(0.85, '#ea580c'); // Deep furnace red
      flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.ellipse(32, 0, 65 * cannonRecoil, 32 * cannonRecoil, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    // DRAW LEFT CANNON SOLDIER OPERATORS (Flanking left side)
    const leftIgniterX = width * 0.09 - recoilOffset;
    const leftIgniterY = height - 50 + recoilOffset * 0.4;
    drawCannoneer(ctx, leftIgniterX, leftIgniterY, activeFaction, 'igniter', false, cannonRecoil > 0.15, time);

    const leftRammerX = width * 0.23 - recoilOffset;
    const leftRammerY = height - 52 + recoilOffset * 0.4;
    drawCannoneer(ctx, leftRammerX, leftRammerY, activeFaction, 'rammer', false, cannonRecoil > 0.15, time);


    // C. RIGHT FLANK WEAPON: Authentic Symmetrical Heavy Brass Siege Gun
    ctx.save();
    // Gun recoils symmetrically
    const rightRecoilOffset = cannonRecoil * 35;
    ctx.translate(width * 0.85 + rightRecoilOffset, height + rightRecoilOffset * 0.5);

    // Draw wooden carriage wheels
    ctx.fillStyle = '#311005';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#eab308';
    ctx.stroke();

    // Draw heavy cannon barrel pointed towards center field (angled up and left)
    ctx.rotate(-154 * Math.PI / 180); // Mirror of 26°
    const rightGrad = ctx.createLinearGradient(0, -18, 120, -18);
    rightGrad.addColorStop(0, '#475569'); // Gilded steel
    rightGrad.addColorStop(0.5, '#334155');
    rightGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = rightGrad;
    
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(120, -14);
    ctx.lineTo(120, 14);
    ctx.lineTo(0, 18);
    ctx.closePath();
    ctx.fill();

    // Royal engravings
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(35, -16, 8, 32);
    ctx.fillRect(80, -15, 8, 30);

    // Cannon bore ring
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(120, 0, 4, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Symmetrical muzzle blast fire overlay
    if (cannonRecoil > 0.05) {
      ctx.save();
      ctx.translate(122, 0);
      const flashGradRight = ctx.createRadialGradient(0, 0, 6, 30, 0, 65);
      flashGradRight.addColorStop(0, '#ffffff');
      flashGradRight.addColorStop(0.2, '#fecdd3');
      flashGradRight.addColorStop(0.5, '#facc15');
      flashGradRight.addColorStop(0.85, '#ea580c');
      flashGradRight.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.fillStyle = flashGradRight;
      ctx.beginPath();
      ctx.ellipse(32, 0, 65 * cannonRecoil, 32 * cannonRecoil, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    // DRAW RIGHT CANNON SOLDIER OPERATORS (Flanking right side)
    const rightFlagmanX = width * 0.91 + rightRecoilOffset;
    const rightFlagmanY = height - 52 + rightRecoilOffset * 0.4;
    drawCannoneer(ctx, rightFlagmanX, rightFlagmanY, activeFaction, 'flagman', true, cannonRecoil > 0.15, time);

    const rightCarrierX = width * 0.77 + rightRecoilOffset;
    const rightCarrierY = height - 50 + rightRecoilOffset * 0.4;
    drawCannoneer(ctx, rightCarrierX, rightCarrierY, activeFaction, 'carrier', true, cannonRecoil > 0.15, time);


    // B. RIGHT CONTROLLABLE WEAPON: Polished Maratha Talwar (Sword / Melee weapon)
    ctx.save();
    
    // Calculate sword dynamic swing transitions
    const swingTransition = swordSlashProgress * 0.7; // rapid rotation sweep
    const swordX = width * 0.82 - swordSlashProgress * 150;
    const swordY = height + 10 - swordSlashProgress * 100;
    
    ctx.translate(swordX, swordY);

    // Point blade weapon towards cursor with secondary offsets
    const normalAngle = Math.atan2(mousePos.y - (height - 60), mousePos.x - swordX);
    ctx.rotate(normalAngle + Math.PI / 2.2 - swingTransition);

    // Draw hand grip and disk pommel (Indo-Aryan design typical of a Talwar)
    ctx.fillStyle = '#ab5c07'; // Gilded gold
    ctx.beginPath();
    ctx.arc(0, -3, 8, 0, Math.PI * 2); // gold handguard disk
    ctx.fill();

    ctx.fillStyle = '#1e1b18'; // wrapped hilt handle
    ctx.fillRect(-4, -18, 8, 15);

    ctx.fillStyle = '#ab5c07'; 
    ctx.fillRect(-8, -25, 16, 5); // guard cross

    // Draw elegantly curved saber blade of Damascus Steel!
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#64748b'; // Back edge

    // Highlight blade gradient
    const bladeGrad = ctx.createLinearGradient(-5, -150, 5, -25);
    bladeGrad.addColorStop(0, isShamsherSelected ? '#ff9d00' : '#ffffff');
    bladeGrad.addColorStop(0.5, isShamsherSelected ? '#ff5100' : '#94a3b8');
    bladeGrad.addColorStop(1, '#475569');
    ctx.fillStyle = bladeGrad;

    ctx.beginPath();
    // Swimmers curve geometry representing high quality steel blade
    ctx.moveTo(-5, -25);
    ctx.quadraticCurveTo(-12, -85, -28, -145); // curve outwards leftward
    ctx.lineTo(-24, -148);
    ctx.quadraticCurveTo(-7, -85, 5, -25); // inner curve
    ctx.closePath();
    ctx.fill();

    // Shining metallic edge stroke lines
    ctx.strokeStyle = isShamsherSelected ? '#ff8512' : '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-5, -25);
    ctx.quadraticCurveTo(-12, -85, -28, -145);
    ctx.stroke();

    ctx.restore();
  };

  // Draw medieval target cursor reticle
  const drawMedievalReticle = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const x = mousePos.x;
    const y = mousePos.y;

    // Cross shaped reticle themed like medieval focal points
    ctx.strokeStyle = isShamsherSelected ? '#ea580c' : '#0ea5e9';
    ctx.lineWidth = 2;

    // Reticle brackets
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = isShamsherSelected ? '#ea580c' : '#0ea5e9';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal spikes
    ctx.beginPath();
    ctx.moveTo(x - 25, y); ctx.lineTo(x - 10, y);
    ctx.moveTo(x + 10, y); ctx.lineTo(x + 25, y);
    // Vertical spikes
    ctx.moveTo(x, y - 25); ctx.lineTo(x, y - 10);
    ctx.moveTo(x, y + 10); ctx.lineTo(x, y + 25);
    ctx.stroke();

    // If locked onto target
    let activeLock = false;
    targetsRef.current.forEach(t => {
      if (t.hp > 0 && Math.hypot(t.x - x, t.y - y) < (28 * t.z + 18)) {
        activeLock = true;
      }
    });

    if (activeLock) {
      ctx.fillStyle = '#ff3333';
      ctx.font = '900 8.5px monospace';
      ctx.fillText("READY TO STRIKE", x + 24, y - 4);
      
      // Draw alert corners
      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 18, y - 10); ctx.lineTo(x - 18, y - 18); ctx.lineTo(x - 10, y - 18);
      ctx.moveTo(x + 10, y - 18); ctx.lineTo(x + 18, y - 18); ctx.lineTo(x + 18, y - 10);
      ctx.stroke();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="relative w-full h-full cursor-crosshair select-none">
      <canvas 
        ref={canvasRef} 
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className="w-full h-full block bg-black" 
      />
      {/* Heavy thermal field borders */}
      <div className="absolute inset-0 pointer-events-none border-t border-[#f97316]/20 opacity-30 z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_50%,rgba(0,0,0,0.85)_100%)] z-10" />
    </div>
  );
};
