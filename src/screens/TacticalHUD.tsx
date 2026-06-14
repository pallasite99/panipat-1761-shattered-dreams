import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, Shield, Heart, Zap, Target, Users, AlertTriangle, 
  TrendingUp, Award, Coins, Sparkles, AlertCircle, Compass, 
  Volume2, ShieldCheck, Flame, BookOpen 
} from 'lucide-react';
import { Screen, Unit } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

// Interactive Faction Data for Panipat
interface HistoricalFaction {
  id: string;
  name: string;
  leader: string;
  heritage: string;
  emblem: string;
  bannerColor: string;
  glowColor: string;
  textColor: string;
  crestDesc: string;
}

const HISTORICAL_FACTIONS: HistoricalFaction[] = [
  {
    id: 'maratha',
    name: 'Maratha Empire',
    leader: 'Sadashivrao Bhau',
    heritage: 'Sovereign Hindu Confederacy fighting for control over northern Hindusthan.',
    emblem: '🏮',
    bannerColor: 'bg-gradient-to-b from-amber-500 via-orange-600 to-amber-700',
    glowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.6)] border-orange-500',
    textColor: 'text-orange-400',
    crestDesc: 'Bhagwa Dhwaj: The sacred, swallow-tailed saffron banner representing Shivaji Maharaj\'s legacy.'
  },
  {
    id: 'durrani',
    name: 'Durrani Afghan Empire',
    leader: 'Ahmad Shah Abdali',
    heritage: 'Elite Pashtun royal coalition marching from Kabul and Kandahar with heavy cavalry.',
    emblem: '🌙',
    bannerColor: 'bg-gradient-to-b from-red-700 via-rose-900 to-neutral-900',
    glowColor: 'shadow-[0_0_20px_rgba(190,24,74,0.6)] border-rose-600',
    textColor: 'text-rose-400',
    crestDesc: 'Royal Pashtun Standard: Crimson banner of the Durrani Dynasty bearing the crescent star & double blades.'
  },
  {
    id: 'mughal',
    name: 'Mughal Dynasty',
    leader: 'Shah Alam II',
    heritage: 'Imposing classical state, caught between regional lords, protecting historic Delhi lanes.',
    emblem: '🔆',
    bannerColor: 'bg-gradient-to-b from-emerald-600 via-teal-800 to-stone-900',
    glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.5)] border-emerald-500',
    textColor: 'text-emerald-400',
    crestDesc: 'Shahi Alam: Deep emerald silk emblazoned with the standard of the great Timurids & golden sunbursts.'
  },
  {
    id: 'sikh',
    name: 'Sikh Confederacy',
    leader: 'Jassa Singh Ahluwalia',
    heritage: 'Fierce warriors of the Dal Khalsa, harrying enemy supply lines and protecting Punjab towns.',
    emblem: '🛡️',
    bannerColor: 'bg-gradient-to-b from-amber-400 via-indigo-900 to-indigo-950',
    glowColor: 'shadow-[0_0_20px_rgba(99,102,241,0.5)] border-[#3b82f6]',
    textColor: 'text-[#3b82f6]',
    crestDesc: 'Nishan Sahib: Sacred saffron standard framed by deep ocean blue borders, symbolizing defensive righteousness.'
  },
  {
    id: 'rohilla',
    name: 'Rohilla Afghans',
    leader: 'Najib-ud-Daula',
    heritage: 'Subcontinental Afghan settlers of Rohilkhand, sworn allies to the invading Kabul sovereigns.',
    emblem: '🗡️',
    bannerColor: 'bg-gradient-to-b from-green-800 via-emerald-950 to-neutral-900',
    glowColor: 'shadow-[0_0_20px_rgba(4,120,87,0.5)] border-green-700',
    textColor: 'text-green-500',
    crestDesc: 'Najib Vanguard: Dark green flag with crossed mountain blades, representing northern frontier resolve.'
  },
  {
    id: 'awadh',
    name: 'Nawab of Awadh',
    leader: 'Shuja-ud-Daula',
    heritage: 'Wealthy regional power with heavy matchlocks, heavily pursued by both coalitions.',
    emblem: '🐟',
    bannerColor: 'bg-gradient-to-b from-blue-700 via-sky-900 to-stone-900',
    glowColor: 'shadow-[0_0_20px_rgba(14,165,233,0.5)] border-sky-450',
    textColor: 'text-sky-400',
    crestDesc: 'Nawab\'s Royal Fish: Celestial indigo banner with twin aquatic crests representing prosperity & heavy river defenses.'
  }
];

// Seeded historically accurate dynamic unit list mapping
const FACTION_UNITS_DB: Record<string, Unit[]> = {
  maratha: [
    {
      id: 'mar_huzurat',
      name: 'Huzurat Heavy Cavalry',
      type: 'Cavalry',
      strength: 480,
      maxStrength: 500,
      stamina: 88,
      image: 'https://images.unsplash.com/photo-1599727497674-5fcc77ba304c?q=80&w=400&auto=format&fit=crop',
      description: 'The Peshwa\'s elite armored household cavalry, devastating in galloping shock maneuvers.'
    },
    {
      id: 'mar_gardi',
      name: 'Ibrahim Gardi Musketeers',
      type: 'Infantry',
      strength: 1000,
      maxStrength: 1000,
      ammunition: 50,
      stamina: 75,
      image: 'https://images.unsplash.com/photo-1590189182194-1df4e8e43314?q=80&w=400&auto=format&fit=crop',
      description: 'French-trained regular infantry armed with standard flintlock muskets and line bayonets.'
    },
    {
      id: 'mar_bhargir',
      name: 'Shinvand Light Guerrillas',
      type: 'Cavalry',
      strength: 350,
      maxStrength: 400,
      stamina: 96,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=300&auto=format&fit=crop',
      description: 'Irregular light cavalry expert at executing "Ganimi Kava" (guerrilla hit-and-run harassment).'
    },
    {
      id: 'mar_bronze_cannon',
      name: 'Royal Bronze Cannon',
      type: 'Artillery',
      strength: 15,
      maxStrength: 15,
      ammunition: 18,
      image: 'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?q=80&w=300&auto=format&fit=crop',
      description: 'Large-caliber bronze barrels cast in Pune foundry yards for siege bombardments.'
    }
  ],
  durrani: [
    {
      id: 'dur_kizilbash',
      name: 'Kizilbash Royal Lancers',
      type: 'Cavalry',
      strength: 450,
      maxStrength: 500,
      stamina: 85,
      image: 'https://images.unsplash.com/photo-1599727497674-5fcc77ba304c?q=80&w=400&auto=format&fit=crop',
      description: 'Abdali\'s personal red-crested heavy cavalry guards, clad in jointed chainmail armor plates.'
    },
    {
      id: 'dur_ghazi',
      name: 'Pashtun Ghazi Swordsmen',
      type: 'Infantry',
      strength: 850,
      maxStrength: 1000,
      stamina: 90,
      image: 'https://images.unsplash.com/photo-1590189182194-1df4e8e43314?q=80&w=300&auto=format&fit=crop',
      description: 'High-morale shock troopers of Afghan clans, carrying large Damascus steel claymores.'
    },
    {
      id: 'dur_zamburak',
      name: 'Camel Zamburak Battery',
      type: 'Artillery',
      strength: 40,
      maxStrength: 40,
      ammunition: 25,
      image: 'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?q=80&w=300&auto=format&fit=crop',
      description: 'Highly mobile swivel light cannons mounted directly on camels to fire over enemy lines.'
    },
    {
      id: 'dur_mulla_rifles',
      name: 'Kandahar Guard Corps',
      type: 'Infantry',
      strength: 600,
      maxStrength: 600,
      ammunition: 40,
      stamina: 80,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=300&auto=format&fit=crop',
      description: 'Elite regular garrison troops protecting the main baggage and royal commanders.'
    }
  ],
  mughal: [
    {
      id: 'mug_sentinel',
      name: 'Red Fort Musketeers',
      type: 'Infantry',
      strength: 800,
      maxStrength: 800,
      ammunition: 35,
      stamina: 70,
      image: 'https://images.unsplash.com/photo-1590189182194-1df4e8e43314?q=80&w=300&auto=format&fit=crop',
      description: 'Disciplined sentries defending standard royal sectors, carrying gold-inlaid matches.'
    },
    {
      id: 'mug_nukra',
      name: 'Imperial Ahadis Lancers',
      type: 'Cavalry',
      strength: 400,
      maxStrength: 400,
      stamina: 80,
      image: 'https://images.unsplash.com/photo-1599727497674-5fcc77ba304c?q=80&w=400&auto=format&fit=crop',
      description: 'Decorated heavy lancers with steel horse armor, maintaining the Sultan\'s heraldry.'
    }
  ],
  sikh: [
    {
      id: 'sikh_akali',
      name: 'Akali Nihang Vanguard',
      type: 'Infantry',
      strength: 500,
      maxStrength: 500,
      stamina: 98,
      image: 'https://images.unsplash.com/photo-1590189182194-1df4e8e43314?q=80&w=300&auto=format&fit=crop',
      description: 'Indomitable blue-clad holy warriors wielding steel chakkars and heavy broadswords.'
    },
    {
      id: 'sikh_horse',
      name: 'Dal Khalsa Horse Archers',
      type: 'Cavalry',
      strength: 450,
      maxStrength: 500,
      stamina: 92,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=300&auto=format&fit=crop',
      description: 'Extremely swift horsemen executing deadly composite bow firing sweeps.'
    }
  ],
  rohilla: [
    {
      id: 'roh_jezail',
      name: 'Rohilkhand Jezailmen',
      type: 'Infantry',
      strength: 750,
      maxStrength: 750,
      ammunition: 45,
      stamina: 84,
      image: 'https://images.unsplash.com/photo-1590189182194-1df4e8e43314?q=80&w=300&auto=format&fit=crop',
      description: 'Mountain sharpshooters using extremely long, curved jezail muskets with high impact.'
    },
    {
      id: 'roh_spear',
      name: 'Najib Vanguard Pikemen',
      type: 'Infantry',
      strength: 800,
      maxStrength: 800,
      stamina: 78,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=300&auto=format&fit=crop',
      description: 'Stubborn defensive wall troopers expert at locking poles against cavalry chargers.'
    }
  ],
  awadh: [
    {
      id: 'aw_gilman',
      name: 'Awadh Gilman Cavalry',
      type: 'Cavalry',
      strength: 400,
      maxStrength: 450,
      stamina: 82,
      image: 'https://images.unsplash.com/photo-1599727497674-5fcc77ba304c?q=80&w=400&auto=format&fit=crop',
      description: 'Nawab Shuja-ud-Daula\'s private heavy armor lancers, recruited from high noble families.'
    },
    {
      id: 'aw_mortar',
      name: 'Shuja Cannon Battery',
      type: 'Artillery',
      strength: 12,
      maxStrength: 12,
      ammunition: 20,
      image: 'https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?q=80&w=300&auto=format&fit=crop',
      description: 'Gilded brass mortars obtained through maritime merchants, firing explosive lead canisters.'
    }
  ]
};

// Tactical Formations data
interface Formation {
  id: string;
  name: string;
  benefits: string;
  statsEffect: string;
  desc: string;
}

const TACTICAL_FORMATIONS: Formation[] = [
  {
    id: 'gardi_square',
    name: 'Gardi French Square',
    benefits: '🛡️ Shield Protection +35% • HP Attrition -15%',
    statsEffect: 'Reduces passive battlefield damage, ideal under heavy mortar fire.',
    desc: 'Disciplined hollow locks where infantry blocks face outward to stall shock cavalry.'
  },
  {
    id: 'ganimi_kava',
    name: 'Ganimi Kava (Guerrilla Crescent)',
    benefits: '⚡ Critical Striking Fate +30% • Speed +20%',
    statsEffect: 'Bypasses frontal defenses, unlocking rapid high-noon side slashes.',
    desc: 'The historic Maratha crescent flanking tactic, striking enemy baggage camps from the rear.'
  },
  {
    id: 'royal_spear',
    name: 'Royal Spearhead Column',
    benefits: '⚔️ Charge Impact Power +40% • Cohesion +10%',
    statsEffect: 'Fierce initial damage boost, shattering defensive pike grids.',
    desc: 'Concentrating heavy lancer elites on a single point to pierce the enemy Sovereign\'s center.'
  },
  {
    id: 'zamburak_redoubt',
    name: 'Zamburak Swivel Battery',
    benefits: '💥 Cannon Precision +30% • Reload Focus Speed +15%',
    statsEffect: 'Provides constant suppressive mortar explosions to drop enemy morale.',
    desc: 'Inter-locking camel gun carriage rows to form a moveable, rapid-fire defense barricade.'
  }
];

// Procedural Audio Synthesizer inside the browser using AudioContext
const playFactionSound = (factionId: string) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, now);
    masterGain.connect(ctx.destination);

    if (factionId === 'maratha') {
      // Tutari Horn Call (ascending sweep) + heavy dhol
      const osc = ctx.createOscillator();
      const hornGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(293.66, now); // D4
      osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.22); // A4
      osc.frequency.exponentialRampToValueAtTime(392.00, now + 0.45); // G4
      osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.85); // Back to D4
      
      hornGain.gain.setValueAtTime(0.001, now);
      hornGain.gain.linearRampToValueAtTime(0.14, now + 0.1);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(6, now);

      osc.connect(filter);
      filter.connect(hornGain);
      hornGain.connect(masterGain);

      // Deep Dhol drum hit
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(105, now);
      drumOsc.frequency.exponentialRampToValueAtTime(28, now + 0.45);
      
      drumGain.gain.setValueAtTime(0.3, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      drumOsc.connect(drumGain);
      drumGain.connect(masterGain);

      osc.start(now);
      drumOsc.start(now);
      osc.stop(now + 1.3);
      drumOsc.stop(now + 0.5);
    } else if (factionId === 'durrani') {
      // Afghan Sringa warhorn + solid kettle drum
      const osc = ctx.createOscillator();
      const hornGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220.00, now); // A3
      osc.frequency.exponentialRampToValueAtTime(130.81, now + 0.35); // C3
      osc.frequency.exponentialRampToValueAtTime(220.00, now + 0.95); // A3

      hornGain.gain.setValueAtTime(0.001, now);
      hornGain.gain.linearRampToValueAtTime(0.15, now + 0.15);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(5, now);

      osc.connect(filter);
      filter.connect(hornGain);
      hornGain.connect(masterGain);

      // Kettle drum
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(75, now);
      drumOsc.frequency.exponentialRampToValueAtTime(20, now + 0.35);

      drumGain.gain.setValueAtTime(0.35, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      drumOsc.connect(drumGain);
      drumGain.connect(masterGain);

      osc.start(now);
      drumOsc.start(now);
      osc.stop(now + 1.4);
      drumOsc.stop(now + 0.5);
    } else if (factionId === 'mughal') {
      // High-class plucked sound + court string vibe
      const pluck = ctx.createOscillator();
      const pluckGain = ctx.createGain();
      pluck.type = 'triangle';
      pluck.frequency.setValueAtTime(329.63, now); // E4
      pluck.frequency.linearRampToValueAtTime(493.88, now + 0.1); // B4
      pluck.frequency.linearRampToValueAtTime(659.25, now + 0.22); // E5

      pluckGain.gain.setValueAtTime(0.2, now);
      pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      pluck.connect(pluckGain);
      pluckGain.connect(masterGain);

      pluck.start(now);
      pluck.stop(now + 0.75);
    } else if (factionId === 'sikh') {
      // Nagada war drum roll + blade chime
      const drum1 = ctx.createOscillator();
      const drum2 = ctx.createOscillator();
      const dGain = ctx.createGain();

      drum1.type = 'sine';
      drum2.type = 'sine';

      drum1.frequency.setValueAtTime(140, now);
      drum1.frequency.exponentialRampToValueAtTime(60, now + 0.15);
      drum2.frequency.setValueAtTime(150, now + 0.1);
      drum2.frequency.exponentialRampToValueAtTime(70, now + 0.25);

      dGain.gain.setValueAtTime(0.25, now);
      dGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      drum1.connect(dGain);
      drum2.connect(dGain);
      dGain.connect(masterGain);

      drum1.start(now);
      drum2.start(now + 0.1);
      drum1.stop(now + 0.3);
      drum2.stop(now + 0.4);

      // Sword slash
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sawtooth';
      chime.frequency.setValueAtTime(2000, now);
      chime.frequency.exponentialRampToValueAtTime(3500, now + 0.12);

      chimeGain.gain.setValueAtTime(0.02, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      chime.connect(chimeGain);
      chimeGain.connect(masterGain);

      chime.start(now);
      chime.stop(now + 0.5);
    } else if (factionId === 'rohilla') {
      // Long Jezail flintlock snap and boom
      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snap.type = 'sawtooth';
      snap.frequency.setValueAtTime(350, now);
      snap.frequency.linearRampToValueAtTime(50, now + 0.08);

      snapGain.gain.setValueAtTime(0.28, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      snap.connect(snapGain);
      snapGain.connect(masterGain);

      snap.start(now);
      snap.stop(now + 0.15);

      // Echo bass
      const bass = ctx.createOscillator();
      const bGain = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(90, now + 0.02);
      bass.frequency.exponentialRampToValueAtTime(15, now + 0.4);

      bGain.gain.setValueAtTime(0.3, now + 0.02);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      bass.connect(bGain);
      bGain.connect(masterGain);

      bass.start(now + 0.02);
      bass.stop(now + 0.5);
    } else if (factionId === 'awadh') {
      // Celestial cobalt majestic harp chord
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const o3 = ctx.createOscillator();
      const gain = ctx.createGain();

      o1.type = 'triangle';
      o2.type = 'triangle';
      o3.type = 'triangle';

      o1.frequency.setValueAtTime(261.63, now); // C4
      o2.frequency.setValueAtTime(329.63, now + 0.08); // E4
      o3.frequency.setValueAtTime(392.00, now + 0.16); // G4

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      o1.connect(gain);
      o2.connect(gain);
      o3.connect(gain);
      gain.connect(masterGain);

      o1.start(now);
      o2.start(now + 0.08);
      o3.start(now + 0.16);

      o1.stop(now + 1.0);
      o2.stop(now + 1.0);
      o3.stop(now + 1.0);
    }
  } catch (e) {
    console.warn("Dynamic Audio context play failed: ", e);
  }
};

export const TacticalHUD: React.FC<{ 
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose }) => {
  // Read treasury and faction parameters from localStorage to maintain immersive continuity
  const [treasuryMohurs, setTreasuryMohurs] = useState<number>(() => {
    return Number(localStorage.getItem('panipat_campaign_treasury') || '145000');
  });

  const [activeFactionId, setActiveFactionId] = useState<string>(() => {
    return localStorage.getItem('panipat_campaign_faction') || 'maratha';
  });

  const [selectedFormationId, setSelectedFormationId] = useState<string>(() => {
    return localStorage.getItem('panipat_campaign_formation') || 'gardi_square';
  });

  // Load dynamically updated units for selected faction from State (which allows realtime upgrades!)
  const [unitsRegistry, setUnitsRegistry] = useState<Record<string, Unit[]>>(() => {
    // Try to load edited units registry from state/localStorage to persist upgrades, or use default DB
    const stored = localStorage.getItem('panipat_tactical_units_registry_v1');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        return { ...FACTION_UNITS_DB };
      }
    }
    return { ...FACTION_UNITS_DB };
  });

  // Track extra status traits (like equipped heavy armor or level ranks)
  const [unitArmorUpgrades, setUnitArmorUpgrades] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem('panipat_tactical_armor_upgrades');
    return stored ? JSON.parse(stored) : {};
  });

  const [unitRankUpgrades, setUnitRankUpgrades] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem('panipat_tactical_rank_upgrades');
    return stored ? JSON.parse(stored) : {};
  });

  // Active Intel Log Feed
  const [intelLogs, setIntelLogs] = useState<string[]>([
    "📍 SCOUTS REPORT: Heavy dust wind building up on the outskirts of Kunjpura. Prepare terrain counter-tactics.",
    "⚠️ ROAD ACCESS BANNED: Najib-ud-Daula\'s regional light horsemen have blockaded major river pathways.",
    "👑 WEALTH ADVISORY: Gilded gold can be spent inside this Darbar table to buy armory plates or train platoons."
  ]);

  // Audio mute helper
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync state back to localStorage
  useEffect(() => {
    localStorage.setItem('panipat_campaign_treasury', String(treasuryMohurs));
  }, [treasuryMohurs]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_faction', activeFactionId);
  }, [activeFactionId]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_formation', selectedFormationId);
  }, [selectedFormationId]);

  useEffect(() => {
    localStorage.setItem('panipat_tactical_units_registry_v1', JSON.stringify(unitsRegistry));
  }, [unitsRegistry]);

  useEffect(() => {
    localStorage.setItem('panipat_tactical_armor_upgrades', JSON.stringify(unitArmorUpgrades));
  }, [unitArmorUpgrades]);

  useEffect(() => {
    localStorage.setItem('panipat_tactical_rank_upgrades', JSON.stringify(unitRankUpgrades));
  }, [unitRankUpgrades]);

  // Handle faction selector click
  const selectFaction = (factionId: string) => {
    setActiveFactionId(factionId);
    if (soundEnabled) {
      playFactionSound(factionId);
    }
    setIntelLogs(prev => [
      `🚩 COMMANDER REPORT: Sworn allegiance changed to the ${HISTORICAL_FACTIONS.find(f => f.id === factionId)?.name}! Frontline regiments re-oriented.`,
      ...prev.slice(0, 3)
    ]);
  };

  // Sound triggering chime effect on action purchases
  const playUpgradeChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  };

  // Action: Reinforce Troops
  const handleReinforceTroops = (unitId: string) => {
    const factionUnits = unitsRegistry[activeFactionId] || [];
    const unitIndex = factionUnits.findIndex(u => u.id === unitId);
    if (unitIndex === -1) return;

    const unit = factionUnits[unitIndex];
    if (unit.strength >= unit.maxStrength) {
      alert("This regiment is already at maximum combat strength!");
      return;
    }

    const healthDeficit = unit.maxStrength - unit.strength;
    const goldCost = healthDeficit * 15; // 15 Gold Mohur per soldier body recovered

    if (treasuryMohurs < goldCost) {
      alert(`Insufficient treasury funds! Need ${goldCost.toLocaleString()} Gold Mohurs to recover the entire legion.`);
      return;
    }

    // Process upgrade
    setTreasuryMohurs(prev => prev - goldCost);
    playUpgradeChime();

    // Update units registry state
    const updatedUnits = [...factionUnits];
    updatedUnits[unitIndex] = {
      ...unit,
      strength: unit.maxStrength
    };

    setUnitsRegistry(prev => ({
      ...prev,
      [activeFactionId]: updatedUnits
    }));

    setIntelLogs(prev => [
      `💖 AMMUNITION SUPPLY: Replenished ${healthDeficit} wounded soldiers to ${unit.name} (+${goldCost} Gold spent).`,
      ...prev.slice(0, 3)
    ]);
  };

  // Action: Level Up Training Rank
  const handleTrainRank = (unitId: string) => {
    const currentRank = unitRankUpgrades[unitId] || 'Recruit';
    let nextRank = '';
    let powerBoost = 0;

    if (currentRank === 'Recruit') {
      nextRank = 'Veteran';
      powerBoost = 20;
    } else if (currentRank === 'Veteran') {
      nextRank = 'Elite';
      powerBoost = 15;
    } else if (currentRank === 'Elite') {
      nextRank = 'Shahi Royal Guard';
      powerBoost = 25;
    } else {
      alert("This veteran platoon has already locked in the maximum possible Rank of Shahi Royal Guard!");
      return;
    }

    const goldCost = 15000; // 15K Gold flat fee for grand drills
    if (treasuryMohurs < goldCost) {
      alert(`Insufficient gold! Imperial grand drill reviews cost ${goldCost.toLocaleString()} Gold Mohurs.`);
      return;
    }

    setTreasuryMohurs(prev => prev - goldCost);
    playUpgradeChime();

    setUnitRankUpgrades(prev => ({
      ...prev,
      [unitId]: nextRank
    }));

    // Symmetrically boost unit max strength and stats!
    const factionUnits = unitsRegistry[activeFactionId] || [];
    const unitIndex = factionUnits.findIndex(u => u.id === unitId);
    if (unitIndex !== -1) {
      const unit = factionUnits[unitIndex];
      const updatedUnits = [...factionUnits];
      updatedUnits[unitIndex] = {
        ...unit,
        maxStrength: unit.maxStrength + powerBoost,
        strength: unit.strength + powerBoost, // immediate gain
        stamina: Math.min(100, (unit.stamina || 70) + 5)
      };
      setUnitsRegistry(prev => ({
        ...prev,
        [activeFactionId]: updatedUnits
      }));
    }

    setIntelLogs(prev => [
      `🏅 MILITARY ACHIEVEMENT: Promoted ${factionUnits[unitIndex]?.name} to rank "${nextRank.toUpperCase()}"!`,
      ...prev.slice(0, 3)
    ]);
  };

  // Action: Masterwork Armaments Smithing
  const handleArmorUpgrade = (unitId: string) => {
    if (unitArmorUpgrades[unitId]) {
      alert("This legion already stands armored with double-layered masterwork chainmail coats!");
      return;
    }

    const goldCost = 10000; // 10K Gold
    if (treasuryMohurs < goldCost) {
      alert(`Insufficient funds! Masterwork blacksmithing requires ${goldCost.toLocaleString()} gold.`);
      return;
    }

    setTreasuryMohurs(prev => prev - goldCost);
    playUpgradeChime();

    setUnitArmorUpgrades(prev => ({
      ...prev,
      [unitId]: true
    }));

    setIntelLogs(prev => [
      `🛡️ ARMORY REINFORCEMENT: Equipped masterwork steel breastplates onto frontline regiments for heavy tactical protection.`,
      ...prev.slice(0, 3)
    ]);
  };

  const activeFaction = HISTORICAL_FACTIONS.find(f => f.id === activeFactionId) || HISTORICAL_FACTIONS[0];
  const activeUnits = unitsRegistry[activeFactionId] || FACTION_UNITS_DB[activeFactionId] || [];
  const selectedFormation = TACTICAL_FORMATIONS.find(f => f.id === selectedFormationId) || TACTICAL_FORMATIONS[0];

  return (
    <div className={`relative h-screen w-screen bg-[#070404] text-stone-200 overflow-hidden font-sans border-t-4 select-none duration-500 transition-colors ${
      activeFactionId === 'maratha' ? 'border-orange-600' :
      activeFactionId === 'durrani' ? 'border-red-700' :
      activeFactionId === 'mughal' ? 'border-emerald-600' :
      activeFactionId === 'sikh' ? 'border-blue-600' :
      activeFactionId === 'rohilla' ? 'border-green-800' :
      'border-sky-500'
    }`}>
      <TopBar screen={Screen.TACTICAL_HUD} onNavigate={onNavigate} onToggleMenu={onToggleMenu} />
      <SideNav screen={Screen.TACTICAL_HUD} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />
      
      <main className="lg:pl-64 pt-16 h-[calc(100vh-4rem)] overflow-y-auto bg-stone-950/80 custom-scrollbar">
        
        {/* TOP SKEUOMORPHIC FACTION CHOOSER BANNER-ROD CONTAINER */}
        <div className="w-full bg-[#18110b] border-b border-[#3e2714]/60 py-6 px-4 md:px-8 relative shadow-xl overflow-hidden">
          {/* Subtle wooden texture layer overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')" }} />
          
          <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
            
            {/* Header with Title & Live Treasury gold count */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#3e2714]/40 pb-4 gap-4">
              <div>
                <h2 className="font-serif text-lg md:text-2xl text-saffron uppercase tracking-widest flex items-center gap-3">
                  <Compass className="text-saffron animate-spin-slow w-6 h-6" /> 
                  Sovereign Headquarters & Faction Banners
                </h2>
                <p className="text-[11px] md:text-xs text-stone-400 font-mono italic mt-1 font-bold">
                  "Sway alliances, outride scouts, and customize 18th-century regiments for the upcoming Panipat campaign."
                </p>
              </div>

              {/* Gold treasury display */}
              <div className="flex items-center gap-3 bg-stone-950/90 border-2 border-amber-500/80 px-4 py-2 shadow-inner rounded-sm relative">
                <div className="absolute -inset-0.5 bg-yellow-500/10 rounded-sm animate-pulse" />
                <Coins className="text-yellow-500 shrink-0 animate-bounce" size={20} />
                <div className="flex flex-col">
                  <span className="text-[8px] text-stone-500 uppercase tracking-widest font-black leading-none">WAR TREASURY</span>
                  <span className="text-md font-mono text-[#fbbf24] font-black tracking-wide mt-1">
                    {treasuryMohurs.toLocaleString()} <span className="text-[10px] text-yellow-500">MOHURS</span>
                  </span>
                </div>
              </div>
            </div>

            {/* SKEUOMORPHIC HANGING FACTION BANNERS ROW */}
            <div className="relative">
              {/* Wooden rod representation */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-amber-950 rounded-full border-t border-b border-amber-900 shadow-lg relative z-20 flex items-center justify-between px-2">
                {/* Gold fasteners left/right */}
                <div className="w-4 h-4 bg-yellow-600 border border-yellow-700 rounded-full shadow-sm" />
                <div className="w-1/3 h-0.5 bg-yellow-500/35 opacity-40" />
                <div className="w-4 h-4 bg-yellow-600 border border-yellow-700 rounded-full shadow-sm" />
              </div>

              {/* Faction Banner cards grid */}
              <div id="faction-banners-bar" className="grid grid-cols-3 md:grid-cols-6 gap-3 pt-6 relative z-10">
                {HISTORICAL_FACTIONS.map((fac) => {
                  const isActive = fac.id === activeFactionId;
                  return (
                    <motion.button
                      key={fac.id}
                      id={`banner-${fac.id}`}
                      onClick={() => selectFaction(fac.id)}
                      whileHover={{ y: 6, scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 150 }}
                      className={`relative pt-3 pb-5 px-2 flex flex-col items-center justify-between text-center outline-none select-none transition-all duration-300 ${fac.bannerColor} ${
                        isActive ? `${fac.glowColor} ring-2 ring-yellow-500 shadow-2xl` : 'opacity-65 filter grayscale-[25%] hover:opacity-100 hover:grayscale-0 shadow-lg'
                      } border-t-4 border-[#ca8a04] hover:shadow-xl rounded-b-sm h-36 md:h-44 cursor-pointer`}
                      title={`Select ${fac.name}`}
                    >
                      {/* Left/right gold borders for fabric */}
                      <div className="absolute inset-y-0 left-0 w-[1.5px] bg-[#dfa839]/40" />
                      <div className="absolute inset-y-0 right-0 w-[1.5px] bg-[#dfa839]/40" />

                      {/* Small hanging cord loop for suspension effect */}
                      <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-4 h-5 border-t border-x border-[#ca8a04]/40 rounded-t-full pointer-events-none" />

                      {/* Active crown tag */}
                      {isActive && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-500 text-stone-950 text-[7px] font-black uppercase tracking-wider px-1.5 rounded-sm shadow border border-yellow-600 select-none flex items-center gap-0.5">
                          <Flame size={7} /> SOVEREIGN
                        </div>
                      )}

                      {/* Emblem */}
                      <span className="text-2xl md:text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
                        {fac.emblem}
                      </span>

                      {/* Title */}
                      <div className="mt-1 flex flex-col items-center">
                        <span className="text-[9px] md:text-[10px] font-serif font-black tracking-wide text-white uppercase drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)] leading-tight line-clamp-1">
                          {fac.name}
                        </span>
                        <span className="text-[7.5px] font-mono text-stone-300 font-bold uppercase drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.85)] mt-0.5">
                          {fac.leader.split(' ').pop()}
                        </span>
                      </div>

                      {/* Tassel gold diamond fringe at bottom */}
                      <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                        <div className="w-2.5 h-2.5 bg-yellow-500 rotate-45 border border-yellow-650" />
                        <div className="w-0.5 h-2.5 bg-yellow-600/75" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* SELECTED FACTION SPECIFICATIONS TABLET */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFactionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-stone-950/90 border border-stone-800 p-4 md:p-5 shadow-inner"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-8">
                    <span className={`text-[9px] font-black uppercase tracking-widest block font-mono ${activeFaction.textColor}`}>
                      ⚜️ Faction Heraldry & Strategic Goal
                    </span>
                    <h3 className="text-lg md:text-xl text-white font-serif font-bold uppercase tracking-wide mt-0.5 select-none text-left">
                      {activeFaction.name} • commanded by <span className="text-saffron">{activeFaction.leader}</span>
                    </h3>
                    <p className="text-stone-300 text-xs mt-1.5 leading-relaxed text-left">
                      {activeFaction.heritage}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[10.5px] font-mono text-stone-400">
                      <BookOpen size={13} className="text-amber-500 shrink-0" />
                      <span className="italic leading-relaxed text-left font-medium text-stone-300">
                        {activeFaction.crestDesc}
                      </span>
                    </div>
                  </div>
                  
                  {/* Dynamic sound cue tool */}
                  <div className="md:col-span-4 flex flex-col justify-center items-end bg-[#201510] border border-amber-900/40 p-3 rounded-xs text-right">
                    <span className="text-[8px] text-stone-500 uppercase tracking-widest font-black font-mono leading-none">FACTION SOUND SEED</span>
                    <button
                      onClick={() => playFactionSound(activeFactionId)}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-saffron hover:bg-white text-stone-950 text-[9px] font-black uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
                    >
                      <Volume2 size={12} /> Play War-Horn
                    </button>
                    <span className="text-[7.5px] text-stone-405 italic mt-1.5 font-mono select-none">
                      Generates procedural horn, brass sweeps, & drum resonance.
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

        {/* COMBAT REGISTRY & FORMATIONS CONSOLE GRID */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 min-h-full">
          
          {/* LEFT PANEL: Dynamic Units Grid (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="font-serif text-lg text-white uppercase tracking-wider flex items-center gap-2 select-none">
                <Swords size={18} className="text-saffron animate-pulse" />
                Active Frontline Regiments ({activeUnits.length})
              </h3>
              <div className="flex gap-2">
                <span className="text-[9px] font-mono text-stone-500 font-black uppercase tracking-wide bg-stone-900 px-2 py-1 border border-stone-800">
                  Faction: {activeFactionId.toUpperCase()}
                </span>
                <span className="text-[9px] font-mono text-saffron font-black uppercase tracking-wide bg-stone-900 px-2 py-1 border border-stone-800 animate-pulse">
                  Upgrades Active
                </span>
              </div>
            </div>

            {/* Units list cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {activeUnits.map((unit, idx) => {
                const isArmored = unitArmorUpgrades[unit.id] || false;
                const activeRank = unitRankUpgrades[unit.id] || 'Recruit';
                
                return (
                  <motion.div
                    key={unit.id}
                    id={`unit-card-${unit.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.08 }}
                    className="relative bg-[#110e0c]/90 border border-stone-800 rounded-sm overflow-hidden flex flex-col justify-between shadow-lg hover:border-amber-900/50 transition-all duration-300 pointer-events-auto"
                  >
                    {/* Inner map coordinates overlay watermark */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/old-map.png')" }} />
                    
                    {/* Upper Unit Frame banner */}
                    <div className="p-4 flex gap-4 relative z-10 border-b border-stone-900/60">
                      
                      {/* Visual skeletal portrait card with customized status icons */}
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-[#ebd3b4] border border-stone-700 overflow-hidden relative shrink-0 flex items-center justify-center shadow">
                        <img 
                          src={unit.image} 
                          alt={unit.name} 
                          className="w-full h-full object-cover filter brightness-90 sepia-[25%] transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* Armor upgraded marker */}
                        {isArmored && (
                          <div className="absolute top-1 right-1 bg-yellow-500/90 text-stone-950 p-0.5 rounded-full shadow border border-yellow-600 animate-pulse">
                            <ShieldCheck size={11} />
                          </div>
                        )}
                        <div className="absolute top-1 left-1 bg-stone-950/85 p-1 rounded-sm">
                          {unit.type === 'Infantry' && <Users className="text-stone-300" size={10} />}
                          {unit.type === 'Cavalry' && <Target className="text-stone-300" size={10} />}
                          {unit.type === 'Artillery' && <Zap className="text-stone-300" size={10} />}
                        </div>
                        <div className="absolute bottom-1 right-1 bg-stone-950/85 px-1 py-0.5 rounded-sm">
                          <span className="text-[7.5px] font-mono text-saffron font-bold uppercase tracking-tighter leading-none">
                            {activeRank.slice(0, 4)}
                          </span>
                        </div>
                      </div>

                      {/* Unit name parameters */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-serif text-md text-white uppercase tracking-wider truncate leading-tight select-none text-left">
                          {unit.name}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 text-[8.5px] text-saffron uppercase font-bold tracking-widest mt-1">
                          <span className="px-1.5 py-0.5 bg-stone-950/85 text-saffron rounded-sm">
                            {unit.type}
                          </span>
                          <span className="text-stone-500 font-black">•</span>
                          <span className="text-stone-350">
                            Rank: {activeRank}
                          </span>
                        </div>

                        <p className="text-[10px] text-stone-400 leading-normal mt-1.5 line-clamp-2 text-left select-none">
                          {unit.description}
                        </p>
                      </div>
                    </div>

                    {/* Unit live combat stats bar */}
                    <div className="bg-stone-950/60 p-3 px-4 grid grid-cols-2 gap-4 border-b border-stone-900/60">
                      <div>
                        <div className="flex justify-between text-[8.5px] uppercase font-bold text-stone-500 mb-1 leading-none select-none">
                          <span>REGIMENT STRENGTH (HP)</span>
                          <span className="text-white font-mono">{unit.strength} / {unit.maxStrength}</span>
                        </div>
                        <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500/80 transition-all duration-500" 
                            style={{ width: `${(unit.strength / unit.maxStrength) * 100}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-[8.5px] uppercase font-bold text-stone-500 mb-1 leading-none select-none">
                          <span>SHIELD PROTECTION STATUS</span>
                          <span className={`font-mono font-bold uppercase text-xs leading-none ${isArmored ? 'text-yellow-500' : 'text-stone-450'}`}>
                            {isArmored ? 'STEEL +35%' : 'LEATHER +0%'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isArmored ? 'bg-yellow-500' : 'bg-stone-600'}`} 
                            style={{ width: isArmored ? '100%' : '35%' }} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE OUTFITTING AND UPGRADE DECK ACCENTS */}
                    <div className="p-3 bg-[#130d0a] grid grid-cols-3 gap-2 border-t border-stone-900/40">
                      
                      {/* Action 1: Heal / Reinforce */}
                      <button
                        onClick={() => handleReinforceTroops(unit.id)}
                        disabled={unit.strength >= unit.maxStrength}
                        className="flex flex-col items-center justify-center py-2 px-1 bg-stone-950 hover:bg-neutral-900 hover:border-green-600 disabled:opacity-40 border border-stone-800 rounded-xs select-none cursor-pointer transition-all"
                        title="Spend gold Mohurs to heal wounded legions"
                      >
                        <Heart size={12} className={unit.strength < unit.maxStrength ? "text-red-500 animate-pulse mb-1" : "text-stone-500 mb-1"} />
                        <span className="text-[7px] text-stone-400 uppercase font-black tracking-widest leading-none">REINFORCE</span>
                        <span className="text-[8px] font-mono font-bold text-green-400 mt-1">
                          {unit.strength >= unit.maxStrength ? 'SECURED' : `${((unit.maxStrength - unit.strength) * 15).toLocaleString()} Gold`}
                        </span>
                      </button>

                      {/* Action 2: Drills Upgrading */}
                      <button
                        onClick={() => handleTrainRank(unit.id)}
                        disabled={activeRank === 'Shahi Royal Guard'}
                        className="flex flex-col items-center justify-center py-2 px-1 bg-stone-950 hover:bg-neutral-900 hover:border-yellow-600 disabled:opacity-40 border border-stone-800 rounded-xs select-none cursor-pointer transition-all"
                        title="Execute military maneuvers to level up Training Rank"
                      >
                        <Award size={12} className={activeRank !== 'Shahi Royal Guard' ? "text-yellow-500 mb-1 animate-pulse" : "text-stone-500 mb-1"} />
                        <span className="text-[7px] text-stone-400 uppercase font-black tracking-widest leading-none">DRILL DRILL</span>
                        <span className="text-[8px] font-mono font-bold text-[#ca8a04] mt-1">
                          {activeRank === 'Shahi Royal Guard' ? 'MAX RANK' : '15,000 Gold'}
                        </span>
                      </button>

                      {/* Action 3: Blacksmith chains */}
                      <button
                        onClick={() => handleArmorUpgrade(unit.id)}
                        disabled={isArmored}
                        className="flex flex-col items-center justify-center py-2 px-1 bg-stone-950 hover:bg-neutral-900 hover:border-sky-500 disabled:opacity-40 border border-stone-800 rounded-xs select-none cursor-pointer transition-all"
                        title="Armor up with plated masterwork chainmail coats"
                      >
                        <ShieldCheck size={12} className={!isArmored ? "text-sky-400 mb-1" : "text-stone-500 mb-1"} />
                        <span className="text-[7px] text-stone-400 uppercase font-black tracking-widest leading-none">ARMORY MAILS</span>
                        <span className="text-[8px] font-mono font-bold text-sky-400 mt-1">
                          {isArmored ? 'EQUIPPED' : '10,000 Gold'}
                        </span>
                      </button>

                    </div>
                  </motion.div>
                );
              })}
            </div>
            
          </div>

          {/* RIGHT PANEL: Strategic Formations List & Campaign Intel (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 1. Tactical Formations Console Card */}
            <div className="bg-[#1e1510] border-2 border-amber-900/40 p-4 md:p-5 flex flex-col shadow-xl rounded-sm">
              <h3 className="font-serif text-white uppercase tracking-widest mb-4 border-b border-[#3e2714]/40 pb-2 flex items-center gap-2 text-xs md:text-sm select-none">
                <Compass size={16} className="text-saffron animate-spin-slow" /> 
                Tactical Formations Selector
              </h3>
              
              <p className="text-[10.5px] text-stone-400 italic mb-4 leading-relaxed text-left select-none">
                "Select the primary formation coordinates to drills before deploying. Your active configuration directly buffs the battle canvas mechanics."
              </p>

              <div className="space-y-3">
                {TACTICAL_FORMATIONS.map(form => {
                  const isActive = form.id === selectedFormationId;
                  return (
                    <button
                      key={form.id}
                      id={`formation-${form.id}`}
                      onClick={() => setSelectedFormationId(form.id)}
                      className={`text-left p-3 border rounded-xs transition-all flex flex-col select-none cursor-pointer focus:outline-none w-full ${
                        isActive 
                          ? 'bg-stone-950 border-saffron shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                          : 'bg-stone-950/60 border-stone-800 hover:border-amber-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className={`text-[10.5px] font-serif font-black uppercase tracking-wide ${isActive ? 'text-saffron' : 'text-white'}`}>
                          {form.name}
                        </span>
                        {isActive && (
                          <span className="text-[8px] font-mono font-black uppercase bg-saffron text-stone-950 px-1 py-0.5 rounded-sm">
                            SELECTED
                          </span>
                        )}
                      </div>
                      
                      <span className="text-[8.5px] text-stone-400 font-mono font-bold tracking-tight uppercase leading-none mt-1">
                        {form.benefits}
                      </span>
                      
                      <p className="text-[10px] text-stone-300 mt-2 leading-relaxed text-left">
                        {form.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Campaign Intel Bulletin */}
            <div className="bg-stone-900 border border-stone-800 p-4 md:p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-white uppercase tracking-widest mb-4 border-b border-stone-800 pb-2 flex items-center gap-2 text-xs md:text-sm select-none">
                  <AlertTriangle size={15} className="text-afghan-red animate-pulse" /> 
                  Hindusthan Intelligence Feed
                </h3>
                
                <div className="space-y-3.5">
                  {intelLogs.map((log, i) => (
                    <div key={i} className="bg-stone-950/70 p-3 border-l-4 border-saffron rounded-r-xs">
                      <p className="text-[10.5px] leading-relaxed text-stone-200 text-left font-sans italic">
                        {log}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Big Button */}
              <div className="mt-8">
                <button 
                  id="tactical-hud-engage-btn"
                  onClick={() => onNavigate(Screen.BATTLE)}
                  className="w-full bg-gradient-to-r from-red-800 to-red-950 hover:from-orange-600 hover:to-orange-800 text-white font-serif uppercase tracking-widest py-3 border border-red-500 shadow-[0_0_20px_rgba(139,0,0,0.55)] transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xs select-none cursor-pointer flex items-center justify-center gap-2 text-sm font-black"
                >
                  <Swords size={16} /> Engage Enemy Sector
                </button>
                <p className="text-center text-[8.5px] text-stone-500 uppercase tracking-widest mt-2 font-mono select-none">
                  DEPLOYS CORE MORALE: {selectedFormation.name.toUpperCase()} BUFFS ACTIVE
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};
