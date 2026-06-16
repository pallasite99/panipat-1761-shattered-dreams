import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Tv, 
  Volume2, 
  VolumeX, 
  Video, 
  Sparkles, 
  Shield, 
  AlertCircle 
} from 'lucide-react';
import { CampaignStage } from '../types';

interface BattlePreludeVideoProps {
  stage: CampaignStage;
  faction: 'maratha' | 'durrani';
  onComplete: () => void;
}

interface PreludeSceneData {
  title: string;
  subtitle: string;
  narration: string[];
  vibe: string;
}

const CINEMATIC_STAGES_DATA: Record<CampaignStage, PreludeSceneData> = {
  [CampaignStage.NIZAM_CAMPAIGN]: {
    title: "The Siege of Udgir",
    subtitle: "Artillery Crescent vs. Basalt Ramparts",
    narration: [
      "January 1760. The Deccan Nizam's forces retire behind the basalt ramparts of Udgir Fort, locking the heavy gates in a desperate hold.",
      "Rather than a direct cavalry charge, the Marathas deploy Ibrahim Khan Gardi’s modern, highly-disciplined French artillery units.",
      "High on the parapets, Nizam's heavy matchlocks under general Salabat Jung continuous-fire heavy mortar balls down vertically.",
      "On the muddy plains, Gardi’s heavy brass 9-pounder vanguards fire upwards back, creating a devastating, smoking cross-bombardment."
    ],
    vibe: "Smoky, gunpowder-plagued basalt fort bombardment."
  },
  [CampaignStage.PUNE]: {
    title: "Peshwa's Grand Mobilization",
    subtitle: "Saffron March through the Deccan Gorges",
    narration: [
      "March 1760. The gates of Shaniwar Wada crash open as Sadashivrao Bhau leads the immense Maratha Southern Army North.",
      "Over 100,000 pilgrims, cavalry Sirdars, and elite Gardi matchlockmen stream into the narrow Western Ghat passes.",
      "Heavy monsoon clouds burst, soaking standards, but copper war horns blow continuously from high peaks.",
      "The massive host marches in locked harmony, marking the start of the longest, most tragic expedition in Deccan memory."
    ],
    vibe: "Thunderous, monsoon-soaked mountain pass military march."
  },
  [CampaignStage.BURHANPUR]: {
    title: "The River Crossing Barrier",
    subtitle: "Amphibious Skirmish inside the Tapti Sands",
    narration: [
      "The Tapti River banks are guarded by stubborn local alliances and light Afghan vanguard checkpoints.",
      "Maratha scouts look out from behind marshy reeds as enemy sharpshooters line the opposing wooden barricades.",
      "Rather than waiting, cavalry forces mount their chargers, launching into the deep muddy shallows of the river.",
      "Horses splash fiercely through the river rapids, wading forward under thousands of incoming matchlock arrows and bullets."
    ],
    vibe: "Water-splashing riverbed skirmish under falling arrows."
  },
  [CampaignStage.GWALIOR]: {
    title: "Cracking Gwalior's Heights",
    subtitle: "Rocky Outcrops & Cliffside Infiltrations",
    narration: [
      "Najib-ud-Daula's fierce Rohilla marksmen occupy high, sheer sandstone cliffs overlooking the Gwalior supply loops.",
      "The enemy drops immense basalt boulders and log rolls down the vertical slopes, pulverizing early ascending outriders.",
      "Under cover of deep soot-smoke screens, elite Mawala climbs begin up the blind-sides of the canyon cliffs.",
      "Gripping wet cliffs with hands and ropes, the climbers scale the towering vertical ramparts to silence the lookouts."
    ],
    vibe: "Steep clifftop action with rolling boulders and smoke shields."
  },
  [CampaignStage.DELHI_NEGOTIATIONS]: {
    title: "Storming the Taj of Lal Qila",
    subtitle: "Heavy Iron Cannonball Gate Breach",
    narration: [
      "August 1760. The hungry Maratha host surrounds the majestic red sandstone battlements of Lal Qila (Red Fort) in Delhi.",
      "The defenders lock the massive Delhi Gate, lining its wooden gates with long, sharp anti-elephant iron spikes.",
      "Gardi’s heavy siege brass batteries unleash a devastating, close-range barrage of solid iron roundshots.",
      "Every impact sends shockwaves through the historical gateways, chipping royal red masonry and snapping the iron spikes."
    ],
    vibe: "Historic red ramparts under heavy brass battering rams."
  },
  [CampaignStage.SHINDE_STAND]: {
    title: "Scindia's Badghat Stand",
    subtitle: "The Frozen Blood-Bath of the river Yamuna",
    narration: [
      "January 1761. A bitter, freezing fog hangs low over the muddy, quicksand shoals of the Yamuna River bed.",
      "Sirdar Dattaji Scindia’s outriders find themselves isolated, as the entire Afghan-Rohilla vanguard starts a massive crossing.",
      "Heavy camel-mounted swivel guns (Zamburaks) establish high fire grids, shredding the Marathas from across the water.",
      "Outnumbered, Dattaji charges directly into the freezing waters. 'If we live, we win; if we die, we are martyrs!' he roars."
    ],
    vibe: "Freezing fog and icy rivers with flashing camel swivels."
  },
  [CampaignStage.DELHI_BATTLE]: {
    title: "The Battle of Kunjpura",
    subtitle: "Open Plains Cavalry Force Collisions",
    narration: [
      "October 1760. On the open plains of Kunjpura, Maratha horsemen intercept the strategic Rohilla-Afghan supply garrison.",
      "Tens of thousands of light chargers accelerate, raising massive dust screens that choke the morning sun.",
      "Spears clash against chainmail as Maratha cavalry units run down the static matchlock ranks on the frontier.",
      "A fast, high-speed melee erupts. Sword slashes spark, horses collide, and the enemy lines are completely severed."
    ],
    vibe: "Speeding horses and sword sparks in dusty open plains."
  },
  [CampaignStage.PANIPAT]: {
    title: "The Dawn of Panipat",
    subtitle: "The Ultimate Clash of Empires",
    narration: [
      "January 14, 1761. Two colossal empires align for the battle of the century on the frosty, parched plains of Panipat.",
      "Gardi’s heavy infantry squares lock brass shields to form an iron fortress, flanked by thousands of heavy nine-pounders.",
      "The Grand Wazir Wali Khan mounts his royal charger, and Afghan forces launch wave after wave of cavalry strikes.",
      "Saffron banners clash directly into emerald crescent flags, signaling the start of the bloodiest day in Maratha history."
    ],
    vibe: "Clashing saffron and emerald standard lines with cold blasts."
  }
};

export const BattlePreludeVideo: React.FC<BattlePreludeVideoProps> = ({ stage, faction, onComplete }) => {
  const data = CINEMATIC_STAGES_DATA[stage] || CINEMATIC_STAGES_DATA[CampaignStage.NIZAM_CAMPAIGN];
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  // Particle generator for custom visual FX
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);
  
  const animationRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Trigger synth sound effects utilizing Web Audio API
  const playSoundEffect = (type: 'boom' | 'clang' | 'splash' | 'crunch' | 'wind') => {
    if (!soundEnabled) return;
    
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const time = ctx.currentTime;
      
      if (type === 'boom') {
        // Cannon fire sound / Explosion
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(10, time + 0.8);
        
        // Low pass filter to make it sound muffled/heavy
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, time);
        
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(time + 0.85);
      } else if (type === 'clang') {
        // Sword slash clashing sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(880, time);
        osc1.frequency.linearRampToValueAtTime(1200, time + 0.1);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1000, time);
        osc2.frequency.linearRampToValueAtTime(100, time + 0.15);
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        
        osc1.stop(time + 0.2);
        osc2.stop(time + 0.2);
      } else if (type === 'splash') {
        // Water crossing sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.linearRampToValueAtTime(40, time + 0.3);
        
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(time + 0.3);
      } else if (type === 'crunch') {
        // Rock falling crash
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, time);
        osc.frequency.linearRampToValueAtTime(30, time + 0.4);
        
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.45);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(time + 0.45);
      } else if (type === 'wind') {
        // Howling wind theme background noise
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, time);
        osc.frequency.linearRampToValueAtTime(380, time + 1.2);
        
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 1.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(time + 1.2);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  // Generate particles based on screen vibe
  useEffect(() => {
    let pCount = 20;
    if (stage === CampaignStage.NIZAM_CAMPAIGN || stage === CampaignStage.DELHI_NEGOTIATIONS) pCount = 35; // Smoky
    if (stage === CampaignStage.PUNE) pCount = 40; // Rain
    if (stage === CampaignStage.SHINDE_STAND) pCount = 30; // Thick fog
    
    const newParticles = Array.from({ length: pCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (stage === CampaignStage.PUNE ? 1.5 : 4) + 1,
      speed: Math.random() * 1.5 + 0.4,
      opacity: Math.random() * 0.6 + 0.2
    }));
    setParticles(newParticles);
  }, [stage]);

  // Update particles loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => {
        let newY = p.y + p.speed;
        let newX = p.x;
        
        // Wind drift / snow fall
        if (stage === CampaignStage.PUNE) {
          // Downward rain
          newY = p.y + p.speed * 2.5;
          newX = p.x - p.speed * 0.5;
        } else if (stage === CampaignStage.SHINDE_STAND) {
          // Slow drifting fog
          newX = p.x + p.speed * 0.2;
          if (newX > 100) newX = 0;
        } else if (stage === CampaignStage.NIZAM_CAMPAIGN || stage === CampaignStage.DELHI_NEGOTIATIONS) {
          // Upward embers/smoke
          newY = p.y - p.speed * 1.2;
          newX = p.x + (Math.sin(p.y / 2) * 0.5);
          if (newY < 0) newY = 100;
        } else if (stage === CampaignStage.DELHI_BATTLE || stage === CampaignStage.GWALIOR) {
          // Dust storm drift
          newX = p.x - p.speed * 1.5;
          if (newX < 0) newX = 100;
        }
        
        if (newY > 100) newY = 0;
        if (newY < 0) newY = 100;
        
        return { ...p, x: newX, y: newY };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, stage]);

  // Handle continuous automatic step progressions
  useEffect(() => {
    if (!isPlaying) return;

    const tickRate = 25; // ms
    const stepDuration = 5500; // time per slide
    const progressInc = (tickRate / stepDuration) * 100;

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          // Proceed to next slide
          if (currentIndex < data.narration.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return 0;
          } else {
            // Completed all slides! Complete video
            clearInterval(timer);
            onComplete();
            return 100;
          }
        }
        return p + progressInc;
      });
    }, tickRate);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, data, onComplete]);

  // Triggers specific visual FX on dialogue index changes
  useEffect(() => {
    // Sound on slide change
    playSoundEffect('wind');

    // Custom sound and visual triggers based on script slide index
    if (stage === CampaignStage.NIZAM_CAMPAIGN && (currentIndex === 2 || currentIndex === 3)) {
      setScreenShake(true);
      setFlashActive(true);
      playSoundEffect('boom');
      setTimeout(() => {
        setScreenShake(false);
        setFlashActive(false);
      }, 500);
    } else if (stage === CampaignStage.DELHI_NEGOTIATIONS && currentIndex === 3) {
      setScreenShake(true);
      setFlashActive(true);
      playSoundEffect('boom');
      setTimeout(() => {
        setScreenShake(false);
        setFlashActive(false);
      }, 700);
    } else if (stage === CampaignStage.DELHI_BATTLE && currentIndex === 2) {
      setScreenShake(true);
      playSoundEffect('clang');
      setTimeout(() => setScreenShake(false), 400);
    } else if (stage === CampaignStage.BURHANPUR && currentIndex === 2) {
      playSoundEffect('splash');
    } else if (stage === CampaignStage.GWALIOR && currentIndex === 1) {
      setScreenShake(true);
      playSoundEffect('crunch');
      setTimeout(() => setScreenShake(false), 500);
    } else if (stage === CampaignStage.SHINDE_STAND && currentIndex === 3) {
      setScreenShake(true);
      playSoundEffect('clang');
      setTimeout(() => setScreenShake(false), 450);
    } else if (stage === CampaignStage.PANIPAT && (currentIndex === 2 || currentIndex === 3)) {
      setScreenShake(true);
      setFlashActive(true);
      playSoundEffect('boom');
      setTimeout(() => {
        setScreenShake(false);
        setFlashActive(false);
      }, 600);
    }
  }, [currentIndex, stage]);

  const handleNext = () => {
    if (currentIndex < data.narration.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  // Render stage-specific graphics
  const renderStageVisuals = () => {
    switch (stage) {
      case CampaignStage.NIZAM_CAMPAIGN:
        return (
          <div className="w-full h-full relative bg-[#070505] overflow-hidden flex items-center justify-center">
            {/* Nizam's Fort on high basalt hill */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              {/* Skyline */}
              <rect width="400" height="220" fill="url(#sky-dark)" />
              <circle cx="280" cy="50" r="1.5" fill="#fef9c3" opacity="0.3" />
              <circle cx="100" cy="70" r="1" fill="#fff" opacity="0.2" />
              
              {/* Basalt Cliff Hill */}
              <path d="M 180 220 L 250 110 Q 284 105 320 90 L 400 90 L 400 220 Z" fill="#201c18" stroke="#120f0c" strokeWidth="2" />
              {/* Bastions */}
              <rect x="290" y="55" width="40" height="35" fill="#181512" stroke="#100d0a" strokeWidth="1" />
              <rect x="350" y="50" width="35" height="40" fill="#14120f" />
              {/* Rampart spikes */}
              <polygon points="290,55 295,50 300,55 305,50 310,55 315,50 320,55 325,50 330,55" fill="#201c18" />
              
              {/* Green Flag flying on Fort */}
              <line x1="367" y1="50" x2="367" y2="25" stroke="#4a5568" strokeWidth="1.5" />
              <polygon points="367,25 367,35 348,30" fill="#10b981" />
              
              {/* Maratha Camp on ground */}
              <polygon points="20,210 45,175 70,210" fill="#eab308" opacity="0.15" />
              <polygon points="12,210 32,185 52,210" fill="#ea580c" opacity="0.2" />
              <rect x="80" y="195" width="30" height="15" fill="#583110" opacity="0.4" />
              {/* Saffron Flag */}
              <line x1="45" y1="175" x2="45" y2="150" stroke="#f97316" strokeWidth="1.5" />
              <polygon points="45,150 45,158 28,154" fill="#f97316" />

              {/* Cannons launching dynamic shells */}
              {isPlaying && currentIndex >= 2 && (
                <>
                  {/* Nizam's high cannon firing down */}
                  <motion.circle 
                    cx={300} 
                    cy={70} 
                    r="3.5" 
                    fill="#f97316"
                    animate={{ 
                      cx: [300, 150, 60], 
                      cy: [70, 130, 205],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                  {/* Explosion smoke puff on fort */}
                  <motion.circle 
                    cx="300" cy="70" r="1" fill="#fff"
                    animate={{ r: [1, 15, 0], opacity: [0.8, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />

                  {/* Gardi low cannon firing up */}
                  <motion.circle 
                    cx={90} 
                    cy={195} 
                    r="4" 
                    fill="#facc15"
                    animate={{ 
                      cx: [90, 210, 310], 
                      cy: [195, 120, 75],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.9, ease: "linear" }}
                  />
                  <motion.circle 
                    cx="310" cy="75" r="1" fill="#ef4444"
                    animate={{ r: [1, 20, 0], opacity: [0.9, 0.3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.9 + 1 }}
                  />
                </>
              )}
            </svg>
            <div className="absolute top-4 left-4 bg-black/75 px-2.5 py-1 rounded border border-orange-500/20">
              <span className="text-[10px] font-mono text-amber-500 font-extrabold uppercase tracking-widest">
                🛰️ COMBAT SIMULATION VIEWPORTS
              </span>
            </div>
          </div>
        );
      case CampaignStage.PUNE:
        return (
          <div className="w-full h-full relative bg-[#090b0d] overflow-hidden flex items-center justify-center">
            {/* Shaniwar Wada gate and marching soldiers */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              <rect width="400" height="220" fill="url(#sky-rain)" />
              
              {/* Distant Deccan hills */}
              <path d="M -10 220 Q 90 140 180 220" fill="#1b1e22" />
              <path d="M 120 220 Q 250 120 380 220" fill="#121517" />
              
              {/* Shaniwar Wada Gatehouse Silhouettes */}
              <rect x="250" y="90" width="75" height="130" fill="#1a1c1e" stroke="#101112" />
              <polygon points="250,90 287,55 325,90" fill="#131415" />
              <rect x="272" y="150" width="30" height="70" fill="#090a0a" rx="1" />
              
              {/* Moving Marching Soldiery Silhouettes */}
              {isPlaying && (
                <motion.g
                  animate={{ x: [0, 25, 50, 75, 100, 125, 150, 175, 200, 220] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="translate-y-[185px] delay-100"
                >
                  {/* General horse */}
                  <g transform="translate(10, 0) scale(0.65)">
                    <rect x="5" y="10" width="22" height="12" fill="#f97316" rx="2" />
                    <circle cx="28" cy="8" r="4.5" fill="#f97316" />
                    <line x1="9" y1="22" x2="7" y2="34" stroke="#f97316" strokeWidth="2" />
                    <line x1="23" y1="22" x2="25" y2="34" stroke="#f97316" strokeWidth="2" />
                    <line x1="3" y1="12" x2="-8" y2="10" stroke="#f97316" strokeWidth="1.5" /> {/* Saffron standard */}
                    <polygon points="-8,10 -8,18 -22,14" fill="#f97316" />
                  </g>
                  {/* Troops */}
                  <g transform="translate(45, 10)">
                    <circle cx="5" cy="0" r="3.5" fill="#f59e0b" />
                    <line x1="5" y1="3.5" x2="5" y2="18" stroke="#f59e0b" strokeWidth="1.5" />
                    <line x1="5" y1="18" x2="1" y2="28" stroke="#f59e0b" strokeWidth="1" />
                    <line x1="5" y1="18" x2="9" y2="28" stroke="#f59e0b" strokeWidth="1" />
                    <line x1="5" y1="8" x2="-1" y2="4" stroke="#f59e0b" strokeWidth="0.8" />
                  </g>
                  <g transform="translate(62, 12)">
                    <circle cx="5" cy="0" r="3.5" fill="#d97706" />
                    <line x1="5" y1="3.5" x2="5" y2="18" stroke="#d97706" strokeWidth="1.5" />
                  </g>
                </motion.g>
              )}
              
              {/* Rain line particles overlaid */}
              {particles.slice(0, 25).map(p => (
                <line 
                  key={p.id} 
                  x1={`${p.x}%`} 
                  y1={`${p.y}%`} 
                  x2={`${p.x - 2}%`} 
                  y2={`${p.y + 4}%`} 
                  stroke="#60a5fa" 
                  strokeWidth="0.7" 
                  opacity={p.opacity} 
                />
              ))}
            </svg>
          </div>
        );
      case CampaignStage.BURHANPUR:
        return (
          <div className="w-full h-full relative bg-[#1b2326] overflow-hidden flex items-center justify-center">
            {/* Tapti river splashing crossing visual */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              <rect width="400" height="220" fill="url(#sky-river)" />
              {/* River water */}
              <rect x="0" y="130" width="400" height="90" fill="#14303d" />
              {/* Water ripples */}
              <path d="M 0 140 C 80 135, 180 145, 300 135 T 400 140" stroke="#255169" fill="none" strokeWidth="2" />
              <path d="M 0 165 C 100 160, 220 170, 320 160 T 400 165" stroke="#1d4052" fill="none" strokeWidth="1" />
              <path d="M 0 190 C 70 185, 190 195, 290 190 T 400 195" stroke="#14303d" fill="none" strokeWidth="1.5" />

              {/* Wooden timber barricade of opponents */}
              <rect x="330" y="80" width="12" height="60" fill="#4a3728" stroke="#2b1f16" />
              <rect x="342" y="90" width="10" height="50" fill="#3c2c20" />
              {/* Green standard */}
              <line x1="340" y1="80" x2="340" y2="50" stroke="#10b981" strokeWidth="1.5" />
              <polygon points="340,50 340,58 358,54" fill="#065f46" />

              {/* Falling arrows from barricade (Right to Left) */}
              {isPlaying && (
                <>
                  <motion.line 
                    x1={340} y1={90} x2={260} y2={125}
                    stroke="#fff" strokeWidth="0.8" strokeDasharray="3"
                    animate={{ 
                      x1: [340, 180, 40], 
                      y1: [90, 120, 180],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                  <motion.line 
                    x1={342} y1={110} x2={200} y2={145}
                    stroke="#fbbf24" strokeWidth="0.7"
                    animate={{ 
                      x1: [342, 200, 80], 
                      y1: [110, 140, 195],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.5, ease: "linear" }}
                  />
                </>
              )}

              {/* Splashing Maratha vanguard horse (Left to Right) */}
              <g transform="translate(90, 125)">
                {/* Horse chest jumping up */}
                <motion.g
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                >
                  <circle cx="50" cy="30" r="11" fill="#e2e8f0" stroke="#cbd5e1" />
                  <rect x="25" y="27" width="25" height="11" fill="#e2e8f0" rx="1" />
                  {/* Saffron banner rider */}
                  <circle cx="35" cy="18" r="4.5" fill="#f97316" />
                  <line x1="35" y1="22" x2="35" y2="30" stroke="#f97316" strokeWidth="2" />
                  <line x1="30" y1="12" x2="30" y2="-12" stroke="#ea580c" strokeWidth="1.5" />
                  <polygon points="30,-12 30,-5 15,-8" fill="#ea580c" />
                  {/* splash water waves */}
                  <motion.ellipse 
                    cx="50" cy="39" rx="15" ry="3" fill="none" stroke="#60a5fa" 
                    animate={{ rx: [3, 20, 3], opacity: [0.9, 0, 0.9] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                  />
                </motion.g>
              </g>
            </svg>
          </div>
        );
      case CampaignStage.GWALIOR:
        return (
          <div className="w-full h-full relative bg-[#1c1713] overflow-hidden flex items-center justify-center">
            {/* Steep rocky cliffside climb */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              <rect width="400" height="220" fill="#2d221a" />
              
              {/* High cliff ridge on the right side */}
              <path d="M 220 220 L 290 0 L 400 0 L 400 220 Z" fill="#140e0b" stroke="#090605" strokeWidth="2" />
              
              {/* Rohilla marksman at the peak */}
              <rect x="295" y="10" width="12" height="24" fill="#dc2626" opacity="0.8" />
              <line x1="295" y1="18" x2="275" y2="18" stroke="#333" strokeWidth="1.5" /> {/* Musket */}

              {/* Falling boulders (downward leftwards) */}
              {isPlaying && currentIndex >= 1 && (
                <>
                  <motion.circle 
                    cx={290} cy={20} r="8" fill="#583110" stroke="#381e0a" strokeWidth="1.5"
                    animate={{ 
                      cx: [290, 260, 190, 110], 
                      cy: [20, 80, 150, 225],
                      rotate: [0, 360]
                    }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                  />
                  <motion.circle 
                    cx={300} cy={10} r="5" fill="#4d2c12"
                    animate={{ 
                      cx: [300, 280, 220, 160], 
                      cy: [10, 60, 130, 215]
                    }}
                    transition={{ repeat: Infinity, duration: 1.7, delay: 0.8, ease: "linear" }}
                  />
                </>
              )}

              {/* Small climbing silhouettes along the steep cliff slope */}
              <motion.g
                animate={{ 
                  x: [0, 8, 15, 23, 27],
                  y: [0, -12, -26, -38, -45]
                }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="translate-x-[222px] translate-y-[155px]"
              >
                {/* Climber 1 */}
                <circle cx="0" cy="0" r="3.5" fill="#f59e0b" />
                <line x1="0" y1="3.5" x2="9" y2="10" stroke="#fff" strokeWidth="0.8" opacity="0.6" /> {/* Rope */}
                
                {/* Climber 2 */}
                <circle cx="-12" cy="18" r="3" fill="#ea580c" />
              </motion.g>

              {/* Smoke clouds sweeping across from the bottom left quadrant */}
              {isPlaying && (
                <motion.g
                  animate={{ opacity: [0.3, 0.6, 0.3], x: [-10, 10, -10] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <circle cx="80" cy="190" r="45" fill="#4a3b32" opacity="0.45" />
                  <circle cx="140" cy="185" r="35" fill="#544439" opacity="0.4" />
                  <circle cx="30" cy="205" r="50" fill="#302621" opacity="0.5" />
                </motion.g>
              )}
            </svg>
          </div>
        );
      case CampaignStage.DELHI_NEGOTIATIONS:
        return (
          <div className="w-full h-full relative bg-[#1a0e0e] overflow-hidden flex items-center justify-center">
            {/* Red Fort storming */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              <rect width="400" height="220" fill="url(#sky-redfort)" />
              
              {/* Grand red sandstone rampart wall on the right half */}
              <rect x="230" y="60" width="170" height="160" fill="#7f1d1d" stroke="#450a0a" strokeWidth="2.5" />
              {/* Golden Domes */}
              <path d="M 260 60 Q 280 30 300 60" fill="#f59e0b" stroke="#d97706" />
              <path d="M 330 60 Q 345 35 360 60" fill="#f59e0b" stroke="#d97706" />
              
              {/* Fort Delhi Gatehouse */}
              <rect x="245" y="130" width="45" height="90" fill="#450a0a" stroke="#1d0404" />
              {/* Sharp iron gate spikes on wooden door */}
              <g transform="translate(248, 145)">
                <line x1="3" y1="10" x2="10" y2="10" stroke="#facc15" strokeWidth="1.5" />
                <line x1="3" y1="25" x2="10" y2="25" stroke="#facc15" strokeWidth="1.5" />
                <line x1="3" y1="40" x2="10" y2="40" stroke="#facc15" strokeWidth="1.5" />
                <line x1="3" y1="55" x2="10" y2="55" stroke="#facc15" strokeWidth="1.5" />
              </g>

              {/* Heavy Gardi cannon blasting */}
              <g transform="translate(30, 160)">
                <rect x="10" y="25" width="40" height="12" fill="#d97706" rx="2" stroke="#b45309" />
                <circle cx="20" cy="35" r="10" fill="#451a03" />
                <line x1="20" y1="35" x2="50" y2="28" stroke="#f59e0b" strokeWidth="2.5" />
              </g>

              {/* Cannonballs striking the epic Red gate */}
              {isPlaying && currentIndex >= 2 && (
                <>
                  <motion.circle 
                    cx={75} cy={165} r="5.5" fill="#374151" stroke="#1f2937" strokeWidth="1"
                    animate={{ 
                      cx: [75, 170, 246], 
                      cy: [165, 150, 175],
                      scale: [1, 1.2, 0.8]
                    }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                  />
                  {/* Explosion ring on gate */}
                  <motion.circle 
                    cx="246" cy="175" r="2" fill="#fff" stroke="#f97316" strokeWidth="1.5"
                    animate={{ r: [2, 25, 0], opacity: [0.9, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                  />
                </>
              )}
            </svg>
          </div>
        );
      case CampaignStage.SHINDE_STAND:
        return (
          <div className="w-full h-full relative bg-[#11161a] overflow-hidden flex items-center justify-center">
            {/* Freezing swamp stand of Scindia */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              <rect width="400" height="220" fill="url(#sky-foggy)" />
              
              {/* Cold blue Yamuna river sands */}
              <rect x="0" y="140" width="400" height="80" fill="#1b2a32" />
              {/* Silt patches */}
              <ellipse cx="200" cy="170" rx="90" ry="25" fill="#132026" opacity="0.8" />
              <ellipse cx="60" cy="190" rx="55" ry="15" fill="#0f191e" />

              {/* Afghan zamburak camels across sands */}
              <g transform="translate(300, 120) scale(0.85)">
                {/* Camel silhouette */}
                <ellipse cx="30" cy="40" rx="18" ry="10" fill="#2d3748" />
                <path d="M 42 40 Q 52 20 48 10" stroke="#2d3748" strokeWidth="5.5" fill="none" strokeLinecap="round" />
                <circle cx="48" cy="8" r="4" fill="#2d3748" />
                <line x1="20" y1="45" x2="15" y2="60" stroke="#2d3748" strokeWidth="2.5" />
                <line x1="40" y1="45" x2="42" y2="60" stroke="#2d3748" strokeWidth="2.5" />
                {/* Zamburak swivel gun on hump */}
                <line x1="28" y1="28" x2="5" y2="31" stroke="#ef4444" strokeWidth="2" />
              </g>

              {/* Incredibly brave isolated Maratha spear line */}
              <g transform="translate(80, 150)">
                <circle cx="20" cy="10" r="3" fill="#ea580c" />
                <line x1="20" y1="13" x2="20" y2="35" stroke="#ea580c" strokeWidth="1.5" />
                <line x1="14" y1="-5" x2="14" y2="38" stroke="#eab308" strokeWidth="1" /> {/* Long spear vertical */}
                
                <circle cx="35" cy="15" r="3" fill="#ea580c" />
                <line x1="35" y1="18" x2="35" y2="40" stroke="#ea580c" strokeWidth="1.5" />
                <line x1="41" y1="0" x2="41" y2="42" stroke="#eab308" strokeWidth="1" />
              </g>

              {/* Freezing fog particles */}
              {particles.map(p => (
                <circle 
                  key={p.id} 
                  cx={`${p.x}%`} 
                  cy={`${p.y}%`} 
                  r={p.size * 2} 
                  fill="#ffffff" 
                  opacity={p.opacity * 0.4} 
                />
              ))}

              {/* Firing flash from the Camel Zamburak */}
              {isPlaying && currentIndex >= 2 && (
                <>
                  <motion.circle 
                    cx={290} cy={142} r="1" fill="#fee2e2"
                    animate={{ r: [1, 15, 0], opacity: [0.8, 0, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                  <motion.line 
                    x1={290} y1={144} x2={160} y2={165}
                    stroke="#f87171" strokeWidth="1.5"
                    animate={{ 
                      x2: [290, 180, 115], 
                      y2: [144, 160, 172],
                      opacity: [1, 1, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                </>
              )}
            </svg>
          </div>
        );
      case CampaignStage.DELHI_BATTLE:
        return (
          <div className="w-full h-full relative bg-[#2a241c] overflow-hidden flex items-center justify-center">
            {/* Open plains cavalry charge skirmish */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              <rect width="400" height="220" fill="url(#sky-plains)" />
              {/* Ground */}
              <rect x="0" y="150" width="400" height="70" fill="#78350f" opacity="0.8" />
              
              {/* Dynamic colliding horse riders */}
              {isPlaying && (
                <>
                  {/* Left Rider (Maratha, Saffron) charging right */}
                  <motion.g
                    animate={{ x: [0, 110, 140, 145, 140, 110] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    className="translate-y-[120px]"
                  >
                    <rect x="10" y="20" width="30" height="14" fill="#f97316" rx="2" />
                    <circle cx="43" cy="18" r="5" fill="#f97316" />
                    {/* Rider standard */}
                    <line x1="22" y1="20" x2="22" y2="0" stroke="#f59e0b" strokeWidth="2.5" />
                    <polygon points="22,0 22,8 5,4" fill="#ea580c" />
                  </motion.g>

                  {/* Right Rider (Afghan, emerald) charging left */}
                  <motion.g
                    animate={{ x: [340, 230, 200, 195, 200, 230] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    className="translate-y-[124px]"
                  >
                    <rect x="10" y="20" width="30" height="14" fill="#10b981" rx="2" />
                    <circle cx="6" cy="18" r="5" fill="#10b981" />
                    {/* Rider blade */}
                    <line x1="14" y1="12" x2="3" y2="5" stroke="#cbd5e1" strokeWidth="2" />
                  </motion.g>

                  {/* Sword clashing collision sparks in the center */}
                  <motion.g
                    animate={{ 
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 3.5, delay: 1.25 }}
                    className="translate-x-[170px] translate-y-[128px]"
                  >
                    <circle cx="0" cy="0" r="10" fill="#fef08a" />
                    <polygon points="0,-12 3,2 -1,4" fill="#facc15" />
                    <polygon points="12,4 -2,1 3,-3" fill="#f59e0b" />
                  </motion.g>
                </>
              )}
              
              {/* Rising dust circles */}
              {particles.slice(0, 15).map(p => (
                <circle 
                  key={p.id} 
                  cx={`${p.x}%`} 
                  cy={`${140 + (p.y % 40)}%`} 
                  r={p.size * 3} 
                  fill="#78350f" 
                  opacity={p.opacity * 0.25} 
                />
              ))}
            </svg>
          </div>
        );
      case CampaignStage.PANIPAT:
        return (
          <div className="w-full h-full relative bg-[#130d0d] overflow-hidden flex items-center justify-center">
            {/* Ultimate grand battle Panipat */}
            <svg viewBox="0 0 400 220" className="w-full h-full">
              <rect width="400" height="220" fill="url(#sky-panipat)" />
              
              {/* Cold gray plain */}
              <rect x="0" y="160" width="400" height="60" fill="#2d3748" opacity="0.3" />

              {/* Left Side: Saffron standard poles standing giant */}
              <line x1="50" y1="180" x2="50" y2="40" stroke="#f97316" strokeWidth="4" />
              <polygon points="50,40 50,70 15,55" fill="#ea580c" />
              
              {/* Right Side: Emerald opponent standard banners */}
              <line x1="330" y1="180" x2="330" y2="55" stroke="#10b981" strokeWidth="3" />
              <polygon points="330,55 330,80 365,67" fill="#065f46" />

              {/* Gardi Iron Infantry square outlines: Blue dots on ground */}
              <rect x="70" y="145" width="45" height="30" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3" />
              <g transform="translate(73, 148)">
                <circle cx="5" cy="5" r="2" fill="#2563eb" />
                <circle cx="15" cy="5" r="2" fill="#2563eb" />
                <circle cx="25" cy="5" r="2" fill="#2563eb" />
                <circle cx="35" cy="5" r="2" fill="#2563eb" />
                <circle cx="5" cy="15" r="2" fill="#2563eb" />
                <circle cx="15" cy="15" r="2" fill="#2563eb" />
                {/* Cannon nozzle */}
                <line x1="35" y1="15" x2="48" y2="15" stroke="#94a3b8" strokeWidth="2.5" />
              </g>

              {/* Shockwave explosions repeatedly on field */}
              {isPlaying && (
                <>
                  <motion.circle 
                    cx="180" cy="130" r="1" fill="#fff" stroke="#f97316" strokeWidth="2"
                    animate={{ r: [1, 35, 0], opacity: [0.9, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
                  />
                  <motion.circle 
                    cx="250" cy="165" r="1" fill="#fff" stroke="#ea580c" strokeWidth="1.5"
                    animate={{ r: [1, 28, 0], opacity: [0.9, 0.2, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.9, ease: "easeOut" }}
                  />
                </>
              )}

              {/* Snowy freeze dust wind */}
              {particles.map(p => (
                <circle 
                  key={p.id} 
                  cx={`${p.x}%`} 
                  cy={`${p.y}%`} 
                  r={p.size * 0.9} 
                  fill="#ffffff" 
                  opacity={p.opacity * 0.7} 
                />
              ))}
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      id="prelude-video-player"
      className={`relative w-full max-w-4xl bg-stone-950 border-4 border-amber-950 rounded shadow-2xl overflow-hidden flex flex-col ${
        screenShake ? 'animate-bounce' : ''
      }`}
      style={{ minHeight: '440px' }}
    >
      {/* Decorative gradient shaders */}
      <svg className="hidden">
        <defs>
          <linearGradient id="sky-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1015" />
            <stop offset="100%" stopColor="#1a1510" />
          </linearGradient>
          <linearGradient id="sky-rain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="sky-river" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="sky-redfort" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#450a0a" />
            <stop offset="100%" stopColor="#290202" />
          </linearGradient>
          <linearGradient id="sky-foggy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="sky-plains" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="sky-panipat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0e0e" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
        </defs>
      </svg>

      {/* FLASH TRIGGER */}
      {flashActive && (
        <div className="absolute inset-0 bg-white opacity-80 z-40 pointer-events-none transition-opacity duration-100" />
      )}

      {/* VIDEO STAMP & TITLE HEADER BAR */}
      <div className="bg-stone-900 px-4 py-2 border-b border-amber-950 flex justify-between items-center z-10 text-stone-200">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-orange-500 animate-pulse" />
          <div>
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-[#f59e0b] leading-tight">
              HISTORIC PRELUDES • CAMPAIGN MAP
            </h2>
            <p className="text-[9px] text-stone-400 font-mono tracking-tight leading-none">
              {faction === 'maratha' ? 'MARATHA EXPEDITIONARY BROADCAST' : 'DURRANI EMPIRE ROYAL CHRONICLES'}
            </p>
          </div>
        </div>

        {/* Video HUD timestamp */}
        <div className="bg-black/40 px-2 py-0.5 rounded border border-white/5 font-mono text-[9px] text-[#A57850] uppercase tracking-wider">
          LIVE STREAM • STAGE {currentIndex + 1}/4
        </div>
      </div>

      {/* CINEMATIC VIEWPORT */}
      <div className="relative flex-1 bg-black min-h-[250px] md:min-h-[300px] flex items-center justify-center">
        {renderStageVisuals()}

        {/* Filter overlay vignette */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-15" />
      </div>

      {/* SUBTITLE & AUDIO CONTROLLER PANELS */}
      <div className="bg-gradient-to-t from-stone-950 to-stone-900 border-t border-amber-950 p-4 relative z-10 flex flex-col gap-3">
        
        {/* PROGRESS BAR TRACK */}
        <div className="w-full bg-stone-850 h-1 rounded-full overflow-hidden relative">
          <motion.div 
            className="bg-[#d97706] h-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-4">
          
          {/* LEFT: TEXT SUBTITLES */}
          <div className="flex-1 min-h-[70px] flex flex-col justify-center bg-black/45 p-3 rounded border border-[#8B5E3C]/10">
            <span className="text-[7.5px] font-mono text-[#ca8a04] uppercase tracking-[0.2em] font-black block mb-1">
              📜 NARRATIVE DISPATCH:
            </span>
            <p className="text-xs text-stone-200 font-serif leading-relaxed italic">
              {data.narration[currentIndex]}
            </p>
          </div>

          {/* RIGHT: LIVE INTERACTIVE CONTROLS */}
          <div className="flex flex-row md:flex-col items-center justify-center md:justify-around gap-2 px-1 border-t md:border-t-0 md:border-l border-white/5 pt-2.5 md:pt-0 md:pl-4 shrink-0">
            <div className="flex items-center gap-1.5">
              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-8 h-8 rounded-full border border-stone-700 bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-stone-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="Previous Clip"
              >
                ◀
              </button>

              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-[#f59e0b] hover:bg-yellow-600 text-stone-950 flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                title={isPlaying ? "Pause Scene" : "Play Scene"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-stone-950" /> : <Play className="w-5 h-5 translate-x-0.5 fill-stone-950" />}
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-stone-700 bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-stone-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="Next Clip"
              >
                ▶
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-8 h-8 rounded border flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer ${
                  soundEnabled ? 'border-orange-500/30 text-orange-500 bg-orange-950/10' : 'border-stone-700 text-stone-400 bg-stone-900'
                }`}
                title={soundEnabled ? "Mute Audio" : "Unmute Audio"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Skip Cinematic Button */}
              <button
                type="button"
                onClick={onComplete}
                className="px-3 py-1.5 bg-red-950/40 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded text-[10px] font-mono font-black flex items-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Skip Cinematic"
              >
                <SkipForward className="w-3 h-3" /> SKIP WEB-VIDEO
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
