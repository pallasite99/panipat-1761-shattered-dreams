import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BattleCanvas } from '../components/BattleCanvas';
import { SwordDuelArena } from '../components/SwordDuelArena';
import { 
  Swords, 
  ShieldAlert, 
  Zap, 
  Scroll, 
  Crosshair, 
  Compass, 
  Heart, 
  Award, 
  Shield, 
  RotateCcw, 
  Bomb, 
  Package,
  Activity,
  User,
  AlertCircle,
  CloudRain,
  Sun,
  Moon,
  Music,
  Volume2
} from 'lucide-react';

import { Screen, CampaignStage, BattleProps } from '../types';
import { TopBar } from '../components/SharedUI';
import { RoyalBanner } from '../components/RoyalBanner';

const TERRAIN_CONFIGS: { [key: string]: {
  name: string;
  desc: string;
  cavalryBonus: number;
  artilleryBonus: number;
  defenseModifier: number;
  tacticalTip: string;
} } = {
  [CampaignStage.NIZAM_CAMPAIGN]: {
    name: "Plain of Udgir Hills",
    desc: "A basalt plain backed by the steep fortifications of Udgir Fort.",
    cavalryBonus: 1.2,
    artilleryBonus: 1.0,
    defenseModifier: 1.0,
    tacticalTip: "Basalt Plains - Open soil with solid footing. Perfect for heavy cavalry charges and infantry squares."
  },
  [CampaignStage.PUNE]: {
    name: "Shaneewar Wada Valleys",
    desc: "Rugged valleys and rolling hills of western Maharashtra.",
    cavalryBonus: 0.9,
    artilleryBonus: 0.7,
    defenseModifier: 1.2,
    tacticalTip: "Hilly Valleys - Infantry shields enjoy +20% cover. Artillery line of sight is penalized."
  },
  [CampaignStage.BURHANPUR]: {
    name: "Tapti River sandbanks",
    desc: "Muddy banks and deceptive swampy river basins.",
    cavalryBonus: 0.5,
    artilleryBonus: 0.8,
    defenseModifier: 1.3,
    tacticalTip: "Wetlands - Cavalry speed is halved. Heavy infantry holds defensive formation with huge bonuses."
  },
  [CampaignStage.GWALIOR]: {
    name: "Gwalior Rocky slopes",
    desc: "Rocky outcrops and steep sandstone fortification angles.",
    cavalryBonus: 0.7,
    artilleryBonus: 1.5,
    defenseModifier: 1.0,
    tacticalTip: "High Valleys - Elevation gives Gardi cannons supreme sight: +50% explosive artillery impact."
  },
  [CampaignStage.DELHI_NEGOTIATIONS]: {
    name: "Delhi Imperial Redoubt",
    desc: "Urban streets and outer battlements.",
    cavalryBonus: 0.8,
    artilleryBonus: 1.0,
    defenseModifier: 1.2,
    tacticalTip: "Urban Defenses - Balanced tactical play, ideal for feints."
  },
  [CampaignStage.SHINDE_STAND]: {
    name: "Yamuna Swamp floodplains",
    desc: "Dattaji Shinde's heroic stand in muddy banks of Yamuna.",
    cavalryBonus: 0.6,
    artilleryBonus: 0.9,
    defenseModifier: 1.1,
    tacticalTip: "Silt - Deceptive river banks limit charges. Focus on flanking maneuver defenses."
  },
  [CampaignStage.DELHI_BATTLE]: {
    name: "Gates of Delhi Marshes",
    desc: "Mud paths, and wet flood basins.",
    cavalryBonus: 0.7,
    artilleryBonus: 1.1,
    defenseModifier: 1.2,
    tacticalTip: "Marshes - Balanced infantry support is ideal."
  },
  [CampaignStage.PANIPAT]: {
    name: "The Dust Plains of Panipat",
    desc: "Vast, dry, open landscape of Haryana.",
    cavalryBonus: 1.8,
    artilleryBonus: 1.2,
    defenseModifier: 0.7,
    tacticalTip: "Flat Open Plains - Zero cover! Cavalry charge damage is boosted by +80%."
  }
};

class FactionAudioSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private currentStep = 0;
  private faction: 'maratha' | 'durrani' = 'maratha';
  private volume: number = 0.35;
  private gainNode: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;

  constructor() {}

  setFaction(f: 'maratha' | 'durrani') {
    this.faction = f;
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(vol, this.ctx ? this.ctx.currentTime : 0);
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  start(faction: 'maratha' | 'durrani', vol: number) {
    if (this.isPlaying) this.stop();
    this.faction = faction;
    this.volume = vol;
    this.currentStep = 0;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      this.startDrone();
      this.playTutari(); // Blow majestic war horn immediately on battlefield entry!

      this.isPlaying = true;

      // Fast, galloping step duration to simulate theatrical Peshwa tempo!
      const stepDuration = 240; 
      this.intervalId = setInterval(() => {
        this.playStep();
      }, stepDuration);
    } catch (e) {
      console.warn("Failed to initialize Web Audio Synth:", e);
    }
  }

  private startDrone() {
    if (!this.ctx || !this.gainNode) return;
    try {
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = this.faction === 'maratha' ? 'sawtooth' : 'sine';
      const baseFreq = this.faction === 'maratha' ? 98.00 : 73.42; // Low G2 or D2 dramatic drone
      this.droneOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      // Low pass filter to make the drone warm and cinema-rich
      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

      this.droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.gainNode);
      this.droneOsc.start();
    } catch (e) {
      console.warn(e);
    }
  }

  // Blow majestic "Tutari" (Maratha Horn) / "Sringa" (Afghan Battle Sringa)
  playTutari() {
    if (!this.ctx || !this.gainNode) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const hornGain = this.ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc3.type = 'triangle';

      // Authentic glorious pitch intervals (Bajirao style Tutari calls)
      const baseF = this.faction === 'maratha' ? 329.63 : 220.00; // E4 or A3 major scale calls

      osc1.frequency.setValueAtTime(baseF, now);
      osc2.frequency.setValueAtTime(baseF * 1.5, now); // Perfect Fifth helper
      osc3.frequency.setValueAtTime(baseF * 2.01, now); // Octave + detune

      // Dramatic sweeping rise/fall frequency (Tutari pitch slide)
      osc1.frequency.exponentialRampToValueAtTime(baseF * 1.25, now + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(baseF * 1.1, now + 0.4);
      osc1.frequency.exponentialRampToValueAtTime(baseF, now + 0.85);

      osc2.frequency.exponentialRampToValueAtTime(baseF * 1.5 * 1.3, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(baseF * 1.5, now + 0.85);

      hornGain.gain.setValueAtTime(0.001, now);
      hornGain.gain.linearRampToValueAtTime(0.20, now + 0.08);
      hornGain.gain.setValueAtTime(0.20, now + 0.5);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      // Low pass resonant filter for cinematic warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(7, now);
      filter.frequency.exponentialRampToValueAtTime(4000, now + 0.18);
      filter.frequency.exponentialRampToValueAtTime(1500, now + 0.7);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(hornGain);
      hornGain.connect(this.gainNode);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + 1.4);
      osc2.stop(now + 1.4);
      osc3.stop(now + 1.4);
    } catch (e) {
      console.warn("Failed to synthesize Tutari horn:", e);
    }
  }

  // Play a powerful, deep cinematic Dhol drum beat with low-frequency rumble
  playDholImpact() {
    if (!this.ctx || !this.gainNode) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const drumGain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(105, now); // Dhol punch frequency
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.4); // deep rumble down

      drumGain.gain.setValueAtTime(0.38, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      // Add high pass stick attack transient
      const oscTrans = this.ctx.createOscillator();
      const transGain = this.ctx.createGain();
      oscTrans.type = 'triangle';
      oscTrans.frequency.setValueAtTime(450, now);
      oscTrans.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      transGain.gain.setValueAtTime(0.18, now);
      transGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(drumGain);
      oscTrans.connect(transGain);

      drumGain.connect(this.gainNode);
      transGain.connect(this.gainNode);

      osc.start(now);
      oscTrans.start(now);

      osc.stop(now + 0.5);
      oscTrans.stop(now + 0.08);
    } catch (e) {}
  }

  // Simulate heavy Peshwa vocal war-chants ("HAH!" of Mawala soldiers)
  playCinematicVocalChant() {
    if (!this.ctx || !this.gainNode) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const chantGain = this.ctx.createGain();
      
      // Gated bandpass tri wave creates a stunning crowd grunt effect
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, now); // deep baritone chant
      osc.frequency.linearRampToValueAtTime(95, now + 0.15);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now); // Formant-like range for "HAH" grunts
      filter.Q.setValueAtTime(5, now);

      chantGain.gain.setValueAtTime(0.15, now);
      chantGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(chantGain);
      chantGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  private playStep() {
    if (!this.ctx || !this.gainNode) return;
    
    // Epic 16-step melodies driving Peshwa & Afghan battle theaters
    const marathaMelody = [
      220.00, 220.00, 261.63, 293.66, 293.66, 261.63, 329.63, 293.66, 
      261.63, 220.00, 220.00, 196.00, 220.00, 220.00, 329.63, 220.00
    ];
    
    const durraniMelody = [
      164.81, 164.81, 174.61, 207.65, 220.00, 246.94, 220.00, 207.65, 
      174.61, 164.81, 164.81, 246.94, 207.65, 174.61, 220.00, 164.81
    ];

    const melody = this.faction === 'maratha' ? marathaMelody : durraniMelody;
    const noteFreq = melody[this.currentStep % melody.length];
    
    const beat = this.currentStep % 16;

    // Melody Note Trigger
    if (noteFreq > 0) {
      try {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = this.faction === 'maratha' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);
        noteGain.gain.setValueAtTime(0.11, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        osc.connect(noteGain);
        noteGain.connect(this.gainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.40);
      } catch (e) {}
    }

    // Heavy Cinematic Dhol Beats (Steps 0, 4, 8, 12)
    if (beat === 0 || beat === 4 || beat === 8 || beat === 12) {
      this.playDholImpact();
    }

    // High energy syncopated Peshwa Tasha rolls
    // Malhari/Bajirao style galloping: triggers rapid triangular snare ticks
    const tashaRollSteps = [1, 3, 5, 6, 9, 11, 13, 14, 15];
    if (tashaRollSteps.includes(beat)) {
      try {
        const osc = this.ctx.createOscillator();
        const tashaGain = this.ctx.createGain();
        osc.type = 'triangle';
        // Accent variance
        const accentFreq = (beat === 5 || beat === 13) ? 950 : 880;
        osc.frequency.setValueAtTime(accentFreq, this.ctx.currentTime);

        const volumeScale = (beat === 5 || beat === 13) ? 0.08 : 0.055;
        tashaGain.gain.setValueAtTime(volumeScale, this.ctx.currentTime);
        tashaGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

        osc.connect(tashaGain);
        tashaGain.connect(this.gainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      } catch(e) {}
    }

    // Dramatic Crowd Chanting synchronized with combat movements at Step 6, 14
    if (beat === 6 || beat === 14) {
      this.playCinematicVocalChant();
    }

    // Random majestic horn fanfare blow during standard battle flow! (approx 5% chance)
    if (beat === 0 && Math.random() < 0.12) {
      this.playTutari();
    }

    this.currentStep++;
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.droneOsc) {
      try { this.droneOsc.stop(); } catch(e) {}
      this.droneOsc = null;
    }
    if (this.ctx) {
      try { this.ctx.close(); } catch(e) {}
      this.ctx = null;
    }
  }
}

const TIME_OF_DAY_CONFIGS = {
  dawn: { name: "Golden Dawn", visibility: 90, accuracy: 95, color: "text-[#ff9933]" },
  noon: { name: "Clear High Noon", visibility: 100, accuracy: 100, color: "text-[#fbbf24]" },
  dusk: { name: "Crimson Dusk", visibility: 75, accuracy: 85, color: "text-[#c084fc]" },
  midnight: { name: "Indigo Midnight", visibility: 40, accuracy: 60, color: "text-[#6366f1]" },
};

const WEATHER_CONFIGS = {
  clear: { name: "Serene Clear Skies", visibilityMod: 0, accuracyMod: 0, desc: "Standard visibility; optimum trajectory.", color: "text-[#34d399]" },
  rain: { name: "Yamuna Monsoon Rain", visibilityMod: -25, accuracyMod: -20, desc: "Wet sand banks & rain; slows physical sweeps (-20% acc).", color: "text-[#38bdf8]" },
  dust_storm: { name: "Kunjpura Dust Storm", visibilityMod: -50, accuracyMod: -35, desc: "Searing wind winds & sepia sands drift scope sights (-35% acc).", color: "text-[#f97316]" },
  fog: { name: "Winter Cold Fog", visibilityMod: -60, accuracyMod: -25, desc: "Thick frosted haze shields troop lines (-25% acc).", color: "text-[#cbd5e1]" },
};

type BattlePrahar = {
  key: string;
  name: string;
  subtitle: string;
  timeOfDay: 'dawn' | 'noon' | 'dusk' | 'midnight';
  weather: 'clear' | 'rain' | 'dust_storm' | 'fog';
  visibilityHint: string;
  combatHint: string;
};

const BATTLE_PRAHARS: BattlePrahar[] = [
  {
    key: 'arunodaya',
    name: 'Arunodaya Prahar',
    subtitle: 'First light seeps through the smoke.',
    timeOfDay: 'dawn',
    weather: 'fog',
    visibilityHint: 'Low-contrast silhouettes; ambushes are easier to hide.',
    combatHint: 'Skirmishers and scouts gain the initiative in the haze.'
  },
  {
    key: 'pratah',
    name: 'Pratah Prahar',
    subtitle: 'Brightening morning with clear sight-lines.',
    timeOfDay: 'dawn',
    weather: 'clear',
    visibilityHint: 'Long sight-lines return and volleys become cleaner.',
    combatHint: 'Ideal window for cavalry probes and coordinated charges.'
  },
  {
    key: 'sangava',
    name: 'Sangava Prahar',
    subtitle: 'The sun rises hard over the field.',
    timeOfDay: 'noon',
    weather: 'clear',
    visibilityHint: 'Open terrain is fully readable from edge to edge.',
    combatHint: 'Frontline swordfights become direct and punishing.'
  },
  {
    key: 'madhyahna',
    name: 'Madhyahna Prahar',
    subtitle: 'Heat shimmers across the field and dust lifts.',
    timeOfDay: 'noon',
    weather: 'dust_storm',
    visibilityHint: 'Glare and sand shorten effective engagement range.',
    combatHint: 'Charge timing matters more than raw numbers.'
  },
  {
    key: 'aparahna',
    name: 'Aparahna Prahar',
    subtitle: 'Late-day pressure builds before the light turns.',
    timeOfDay: 'noon',
    weather: 'clear',
    visibilityHint: 'Strong visibility with tired formations exposed.',
    combatHint: 'This is the best moment for a decisive breach.'
  },
  {
    key: 'sayam',
    name: 'Sayam Prahar',
    subtitle: 'Evening rain slicks the ground.',
    timeOfDay: 'dusk',
    weather: 'rain',
    visibilityHint: 'Wet ground slows footwork and weapon recovery.',
    combatHint: 'Sword parries and short bursts become safer than long pushes.'
  },
  {
    key: 'pradosh',
    name: 'Pradosh Prahar',
    subtitle: 'Twilight folds the battlefield into shadow.',
    timeOfDay: 'dusk',
    weather: 'fog',
    visibilityHint: 'Enemy movement vanishes in the lowering light.',
    combatHint: 'Close-quarters duels become the main way to read the field.'
  },
  {
    key: 'nisitha',
    name: 'Nisitha Prahar',
    subtitle: 'Night command and candlelit steel.',
    timeOfDay: 'midnight',
    weather: 'fog',
    visibilityHint: 'Only the nearest enemies stay visible at all.',
    combatHint: 'Ambushes, torchlight, and last-second counters dominate.'
  },
];

const PRAHAR_CYCLE_SECONDS = 6;

const getPraharForBattle = (stageIndex: number, battleTimeLeft: number, phase: 'choosing_drop' | 'dropping' | 'clash' | 'resolution' | 'defeat') => {
  const baseIndex = Math.max(0, stageIndex - 1) % BATTLE_PRAHARS.length;
  if (phase !== 'clash') {
    return { ...BATTLE_PRAHARS[baseIndex], index: baseIndex };
  }

  const elapsedSeconds = Math.max(0, 45 - battleTimeLeft);
  const cycleOffset = Math.floor(elapsedSeconds / PRAHAR_CYCLE_SECONDS);
  const index = (baseIndex + cycleOffset) % BATTLE_PRAHARS.length;
  return { ...BATTLE_PRAHARS[index], index };
};

export interface HistoricalBrief {
  title: string;
  location: string;
  year: string;
  scenario: string;
  objectives: string[];
  fortressMode: boolean;
  strategyTip: string;
}

export const DURRANI_HISTORICAL_BRIEFS: Record<string, HistoricalBrief> = {
  [CampaignStage.NIZAM_CAMPAIGN]: {
    title: "The Subjugation of Kabul Frontier",
    location: "Kabul Outposts, Hindu Kush Foothills",
    year: "1759 AD",
    scenario: "As Ahmad Shah Durrani prepares the imperial regiments to march southeast, regional rebellious frontier clans have fortified the rugged Kabul mountain outposts, threatening the army's rear lines of supply. You must shatter their stone-reinforced barricades using Durrani brass batteries.",
    objectives: [
      "Target the rebel gate with heavy Durrani Artillery (or Frag Bombs) to reduce Rampart Integrity to 0%",
      "Survive the stubborn musket fire of the hill fighters",
      "Launch a fierce Pashtun Ghazi charge once the outposts crumble"
    ],
    fortressMode: true,
    strategyTip: "Use the 'Artillery Battery' or 'Frag Bomb' buttons in the actions panel to bombard the rebel gate. Traditional blades cannot bypass thick outpost timber!"
  },
  [CampaignStage.PUNE]: {
    title: "The Grand Council of Kandahar",
    location: "Kandahar, Durrani Imperial Capital",
    year: "1759 AD",
    scenario: "The sovereign Ahmad Shah Durrani convenes the Council of Emirs. Before crossing the Indus, you must put your elite Durrani Royal Guard through rigorous combat drill reviews to ensure cavalry cohesion and standard defensive posture.",
    objectives: [
      "Demonstrate defensive shield posturing against simulated cavalry charges",
      "Rally and train veteran camel swivel gunners and elite riders"
    ],
    fortressMode: false,
    strategyTip: "Use 'Shield Defend' when simulated skirmishers charge to hone focus points and minimize training injuries."
  },
  [CampaignStage.BURHANPUR]: {
    title: "The Siege of Lahore",
    location: "Lahore Outskirts, Punjab Province",
    year: "1759 AD",
    scenario: "The Maratha governor Sabaji Shinde and his Sikh Khalsa allies have garrisoned Lahore's outer defense lines, blocking the Durrani vanguard. Your Afghan heavy cavalry must execute a rapid tactical sweep to shatter the garrison, reclaiming Lahore for the Empire.",
    objectives: [
      "Flank the defensive spear barricades of the Maratha-Sikh alliance",
      "Preserve the morale of your veteran Afghan riders"
    ],
    fortressMode: false,
    strategyTip: "Deploy 'Flanking Attack' to bypass the heavy spear walls of the defenders."
  },
  [CampaignStage.GWALIOR]: {
    title: "The Rohilla Pact Fortification",
    location: "Rohilkhand Foothills, Northern India",
    year: "1760 AD",
    scenario: "Support Najib-ud-Daula, your primary Rohilla Afghan ally of the subcontinent! Local Hindu sectarian rebels and rival clans have fortified a key supply post guarding Najib's rear. We must pulverize their defensive gates to relieve the siege.",
    objectives: [
      "Crumble the hostile gate (Fort Integrity: 0%) using the royal brass cannons",
      "Deploy cover smoke to hide your advancing Ghazi sword regiments"
    ],
    fortressMode: true,
    strategyTip: "Call in 'Artillery Battery' to breach the defensive gate. Deploy smoke to cover the infantry climbing the slope."
  },
  [CampaignStage.DELHI_NEGOTIATIONS]: {
    title: "Awadh Siyar: Swaying Shuja-ud-Daula",
    location: "Nawab Court Perimeter, Awadh Region",
    year: "1760 AD",
    scenario: "To swing the majestic Nawab Shuja-ud-Daula to the Durrani Coalition, we must dismantle the camp of hostile Maratha-bribed mercenary saboteurs who have placed blockades along the Awadh-Delhi highway. Direct mortar shells onto their wooden palisades.",
    objectives: [
      "Shatter the mercenary camp palisade gate (Palisade Integrity: 0%) under shell fire",
      "Avenge the intercepted diplomatic letters"
    ],
    fortressMode: true,
    strategyTip: "Pound the palisade gate instantly! Keep our focus high, or request a 'Supply Air Cargo' for immediate energy."
  },
  [CampaignStage.SHINDE_STAND]: {
    title: "Yamuna Crossing: Trapping the Scouts",
    location: "Dadi Ghat, Northern Yamuna",
    year: "1760 AD",
    scenario: "With Dattaji's scouts patrolling the Yamuna banks, Ahmad Shah Durrani orders a daring crossing. Conduct a lethal cavalry vanguard attack across the Yamuna banks to surprise and trap Maratha patrol scouts under Dattaji Shinde.",
    objectives: [
      "Disperse the scoundrel scout divisions",
      "Defend your riders on the muddy riverbed from fierce Maratha counter-assaults"
    ],
    fortressMode: false,
    strategyTip: "Unleash 'Adrenaline Rage' when your unit health or cohesion wavers to shred the Maratha swordsmen."
  },
  [CampaignStage.DELHI_BATTLE]: {
    title: "Breaching the Delhi Outposts",
    location: "Kunjpura-Delhi Frontier Plains",
    year: "1760 AD",
    scenario: "Before the final showdown, we must intercept the Maratha columns advancing from Kunjpura. The Maratha commanders have arranged their defensive lines across the plains. Execute a coordinated cavalry spearhead to sever their pathways.",
    objectives: [
      "Annihilate Scindia's scouting spear brigades with well-timed cavalry charges",
      "Muzzle their annoying frontline matchlock squads"
    ],
    fortressMode: false,
    strategyTip: "Time your mouse clicks precisely on emerging sword icons to secure devastating critical blows."
  },
  [CampaignStage.PANIPAT]: {
    title: "The Battle of Panipat Plains",
    location: "Frosty Plains of Panipat",
    year: "January 14, 1761 AD",
    scenario: "The ultimate clash of empires. Ahmad Shah Durrani versus Sadashivrao Bhau. Lead the grand royal Durrani coalition, unleash camel swivel batteries (Zamburaks) and royal Afghan cavalry charges to decisively crush the Maratha Empire forever.",
    objectives: [
      "Break Ibrahim Khan Gardi's fortified French-trained infantry squares",
      "Protect your grand camel zamburak and artillery batteries from Maratha suicide charges",
      "Slay the Maratha commanders Sadashivrao Bhau and Vishwasrao to achieve historic victory"
    ],
    fortressMode: false,
    strategyTip: "Use 'Artillery Battery' to silence Gardi's guns. Deploy your 'Flanking Attack' with elite Durrani cavalry to encircle their center!"
  }
};

export const getBattleCombatantNames = (faction: 'maratha' | 'durrani', stage: CampaignStage) => {
  if (faction === 'maratha') {
    switch (stage) {
      case CampaignStage.NIZAM_CAMPAIGN:
        return { ally: "MARATHA MAWALA COHORT", enemy: "NIZAM DECCAN REGIMENT" };
      case CampaignStage.BURHANPUR:
        return { ally: "MARATHA TAPTI FLANK", enemy: "REBEL RAIDER PATROLS" };
      case CampaignStage.GWALIOR:
        return { ally: "MARATHA SIEGE COLUMN", enemy: "ROHILLA GARRISON" };
      case CampaignStage.DELHI_NEGOTIATIONS:
        return { ally: "MARATHA DELIGATES", enemy: "MERCENARY OUTRIDERS" };
      case CampaignStage.SHINDE_STAND:
        return { ally: "SHINDE REAR DIVISION", enemy: "DURRANI VANGUARD" };
      case CampaignStage.DELHI_BATTLE:
        return { ally: "GARDI ARTILLERY SQUAD", enemy: "KUNJPURA GARRISON" };
      case CampaignStage.PANIPAT:
      default:
        return { ally: "MARATHA IMPERIAL ARMY", enemy: "DURRANI GRAND ARMY" };
    }
  } else {
    // durrani
    switch (stage) {
      case CampaignStage.NIZAM_CAMPAIGN:
        return { ally: "AFGHAN ADVANCE FORCE", enemy: "KABUL REBEL HILL CLANS" };
      case CampaignStage.BURHANPUR:
        return { ally: "DURRANI CAVALRY FORCE", enemy: "LAHORE SIKH GARRISON" };
      case CampaignStage.GWALIOR:
        return { ally: "ROHILLA DEPUTY REGIMENT", enemy: "LOCAL TRIBAL REBELS" };
      case CampaignStage.DELHI_NEGOTIATIONS:
        return { ally: "DURRANI DEPUTY PATROL", enemy: "MERCENARY SABOTEURS" };
      case CampaignStage.SHINDE_STAND:
        return { ally: "AFGHAN RIVER DIVISION", enemy: "SHINDE MARATHA CAVALRY" };
      case CampaignStage.DELHI_BATTLE:
        return { ally: "DURRANI ASSAULT COLUMN", enemy: "DELHI OUTPOST GARRISON" };
      case CampaignStage.PANIPAT:
      default:
        return { ally: "AFGHAN ROYAL COALITION", enemy: "MARATHA GRAND ARMY" };
    }
  }
};

export const HISTORICAL_BRIEFS: Record<string, HistoricalBrief> = {
  [CampaignStage.NIZAM_CAMPAIGN]: {
    title: "The Siege of Udgir Fortress",
    location: "Udgir Fort, Deccan Plateau",
    year: "1760 AD",
    scenario: "You are attacking Salabat Jung's massive Deccan fort built of heavy stone. The Nizam's elite forces are hoarded deep inside the ramparts. Directly assaulting with hand swords is futile, as the stone walls shield the defenders from basic sword damage.",
    objectives: [
      "Target the gates with heavy Gardi Artillery (or Frag Bombs) to reduce Rampart Integrity to 0%",
      "Survive the defending musket and camel zamburak gunfire",
      "Launch an infantry sword charge once the gates crumble to breach the keep"
    ],
    fortressMode: true,
    strategyTip: "Use the 'Gardi Artillery' or 'Frag Bomb' buttons in the actions panel to bombard the fortress gate. While gates are standing, enemy morale cannot fall below 35%!"
  },
  [CampaignStage.PUNE]: {
    title: "The Shaniwar Wada Parade Drills",
    location: "Pune, Maratha Empire Capital",
    year: "1760 AD",
    scenario: "Sadashivrao Bhau and Nana Saheb Peshwa review the grand Mawala army before going north. You must test your defensive stamina, coordinate cavalry formations, and practice battlefield positioning to prepare for the long march to Hindustan.",
    objectives: [
      "Demonstrate defensive maneuvers to shield against simulated cavalry charges",
      "Gain tactical experience and recruit skilled cannoneers"
    ],
    fortressMode: false,
    strategyTip: "Use 'Shield Defend' when simulated enemies charge to gain stamina focus and minimize morale attrition."
  },
  [CampaignStage.BURHANPUR]: {
    title: "The Yamuna Outpost Skirmish",
    location: "Burhanpur Boundary, Central India",
    year: "1760 AD",
    scenario: "Ahmad Shah Durrani's advance scouts have set up a supply depot blockading the river passage. Maratha cavalry must conduct a rapid tactical sweep to reclaim the crossing point and secure safe passage for our pilgrimage camps.",
    objectives: [
      "Flank the scouting camel swivel guns (Zamburaks)",
      "Maintain high army morale to demonstrate Maratha superiority"
    ],
    fortressMode: false,
    strategyTip: "Deploy 'Flanking Attack' to bypass the heavy frontal armor of the camel swivel units."
  },
  [CampaignStage.GWALIOR]: {
    title: "Assault on Gwalior Rock Fortress",
    location: "Gwalior Fort Range, Madhya Bharat",
    year: "1760 AD",
    scenario: "An outpost of Najib-ud-Daula's Rohillas has fortified the steep rocky cliffs of Gwalior. Clashing on the vertical slope means physical arrows will rain down on us continuously. The main fortress archway must be cracked using artillery.",
    objectives: [
      "Dull the fortress defenses by dropping fort integrity to 0% using 9-pounder artillery",
      "Deploy protective smoke screens to shield your troops on the rocky rise"
    ],
    fortressMode: true,
    strategyTip: "Unleash 'Gardi Artillery' to shatter the hillside gateway. Use 'Smoke Screen' to blind the archers on high ledges."
  },
  [CampaignStage.DELHI_NEGOTIATIONS]: {
    title: "Storming of the Red Fort (Delhi Gate)",
    location: "Lal Qila (Red Fort), Imperial Delhi",
    year: "1760 AD",
    scenario: "Negotiations with Yakub Ali Khan have broken down! To feed the starving army, Sadashivrao Bhau has ordered a direct bombardment of Delhi's thick medieval brick walls. We must breach the gates using French artillery to gain the city's food and wealth.",
    objectives: [
      "Pulverize Lal Qila's gates (Fort Integrity: 0%) under heavy Gardi fire",
      "Storm the palace keep with Mawala swordsmen to capture vital supply cargo"
    ],
    fortressMode: true,
    strategyTip: "Focus fire on the gates! Do not hesitate to call a Supply Airdrop if focus or adrenaline runs low."
  },
  [CampaignStage.SHINDE_STAND]: {
    title: "Shinde's Defense of the Riverbed",
    location: "Badghat Banks, Northern Plains",
    year: "1760 AD",
    scenario: "Dattaji Shinde must hold back the entire Durrani vanguard from crossing the swelling Yamuna bank. This is a desperate plains standoff to shield the retreat of our holy pilgrims. Fight fiercely with sword and shield to survive the cavalry barrage.",
    objectives: [
      "Rally the Maratha cavalry reserves",
      "Stand your ground on the river banks against Durrani horsemen"
    ],
    fortressMode: false,
    strategyTip: "Activate 'Adrenaline Rage' to boost your close-combat sword cutting speed when morale drops."
  },
  [CampaignStage.DELHI_BATTLE]: {
    title: "The Battle of Delhi Gates",
    location: "Kunjpura Outskirts, plains of Delhi",
    year: "1760 AD",
    scenario: "The grand battle before Panipat! Abdali's main allies, Najib's Rohillas, have lined up across the swampy plains. We must execute a coordinate grand tactical offensive to crush their spirit before their sovereign arrives with the royal Pashtun host.",
    objectives: [
      "Neutralize the Rohilla chiefs using well-timed cavalry charges",
      "Prevent enemy zamburaks from shredding your infantry lines"
    ],
    fortressMode: false,
    strategyTip: "Time your counter-clicks perfectly when the sword indicators pop up to execute fatal slashing maneuvers!"
  },
  [CampaignStage.PANIPAT]: {
    title: "The Third Battle of Panipat",
    location: "Sukhpat Plains, Panipat",
    year: "January 14, 1761 AD",
    scenario: "The final, historic apocalypse of the 18th century. Two massive empires face each other on the cold, frosty plains of Panipat. There are no walls, no retreats—only bloody sword-to-sword clashing, heavy artillery shellfire, and royal cavalry spears.",
    objectives: [
      "Break the Durrani Grand Vizier's military line",
      "Defend Ibrahim Khan Gardi's French-style guns from saboteur raids",
      "Survive the onslaught to alter the course of Indian history"
    ],
    fortressMode: false,
    strategyTip: "Conserve your focus. Combine Shield Defends, tactical Flanks, and massive Gardi Artillery fire to break the Pashtun center line!"
  }
};

export const BattleScene: React.FC<BattleProps> = ({ onNavigate, onAdvance, stage, onHelp, onSettings }) => {
  // PUBG drop phases: 'choosing_drop' | 'dropping' | 'clash' | 'resolution' | 'defeat'
  const [battlePhase, setBattlePhase] = useState<'choosing_drop' | 'dropping' | 'clash' | 'resolution' | 'defeat'>('choosing_drop');
  const [selectedDropHotspot, setSelectedDropHotspot] = useState<string | null>(null);
  const [dropCountdown, setDropCountdown] = useState(3);

  // For historically accurate Fort Siege mechanics
  const [fortWallIntegrity, setFortWallIntegrity] = useState(100);
  const [showBriefing, setShowBriefing] = useState(true);

  // Auto-reset fort values and show briefing on campaign level transitions
  useEffect(() => {
    setFortWallIntegrity(100);
    setShowBriefing(true);
  }, [stage]);

  const [clashAction, setClashAction] = useState<'none' | 'charge' | 'defend' | 'artillery' | 'feint' | 'flank' | 'adrenaline' | 'bomb' | 'loot' | null>(null);
  const [enemyAction, setEnemyAction] = useState<'none' | 'zamburak' | 'charge' | null>(null);
  
  const [activeFaction, setActiveFaction] = useState<'maratha' | 'durrani'>(() => {
    return (localStorage.getItem('panipat_campaign_faction') as 'maratha' | 'durrani') || 'maratha';
  });

  const getHistoricalBrief = (stg: CampaignStage, faction: 'maratha' | 'durrani') => {
    if (faction === 'durrani') {
      return DURRANI_HISTORICAL_BRIEFS[stg] || HISTORICAL_BRIEFS[stg];
    }
    return HISTORICAL_BRIEFS[stg];
  };

  const activeBrief = stage ? getHistoricalBrief(stage, activeFaction) : null;
  
  // Tactical weapon and gear variables (PUBG style with Swords + Heavy Artillery)
  const [ammoCount, setAmmoCount] = useState(5); // Stamina Focus ticks
  const [maxAmmo] = useState(5);
  const [isReloading, setIsReloading] = useState(false); // is regaining focus
  const [armorTier, setArmorTier] = useState(2); // Tier 2 Shield & Mail
  const [equippedScope, setEquippedScope] = useState<'Rajput Balanced' | 'Peshwa Gilded Hilt' | 'Royal Damascus Pommel'>('Rajput Balanced');
  const [smokeActive, setSmokeActive] = useState(false);
  const [adrenalineSyringes, setAdrenalineSyringes] = useState(2);
  const [fragBombs, setFragBombs] = useState(1);
  const [airdropCargoAvailable, setAirdropCargoAvailable] = useState(true);

  // Weather and Music synthesizers variables
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'noon' | 'dusk' | 'midnight'>('noon');
  const [weather, setWeather] = useState<'clear' | 'rain' | 'dust_storm' | 'fog'>('clear');
  const lastPraharRef = useRef<string>('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.35);
  const audioSynthRef = useRef<FactionAudioSynth | null>(null);

  // 3-Stage Battle Series State variables
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(1);
  const [stageOutcomes, setStageOutcomes] = useState<('player' | 'enemy' | null)[]>([null, null, null]);
  const [showStageResultModal, setShowStageResultModal] = useState<boolean>(false);
  const [showBreachDialogueModal, setShowBreachDialogueModal] = useState<boolean>(false);
  const [gardiDebateStep, setGardiDebateStep] = useState<number>(0);

  // Timed battles & Spawning state variables
  const [battleTimeLeft, setBattleTimeLeft] = useState(45);
  const [spawnAllyTrigger, setSpawnAllyTrigger] = useState(0);
  const [spawnEnemyTrigger, setSpawnEnemyTrigger] = useState(0);
  const [spawnAllyType, setSpawnAllyType] = useState<string>('');
  const [spawnEnemyType, setSpawnEnemyType] = useState<string>('');

  // Detailed Battle statistics tracking across the current stage
  const [stagePlayerCasualties, setStagePlayerCasualties] = useState(0);
  const [stageEnemyCasualties, setStageEnemyCasualties] = useState(0);
  const [stageSwordStrikes, setStageSwordStrikes] = useState(0);
  const [stageSpecialsUsed, setStageSpecialsUsed] = useState(0);
  const [stageDuelsAttempted, setStageDuelsAttempted] = useState(0);
  const [alliesSummonedCount, setAlliesSummonedCount] = useState(0);
  const [enemiesSummonedCount, setEnemiesSummonedCount] = useState(0);

  // Helper to transition to the next stage of the battle
  const handleNextStage = () => {
    const nextStageIndex = currentStageIndex + 1;
    const nextPrahar = getPraharForBattle(nextStageIndex, 45, 'choosing_drop');

    setCurrentStageIndex(prev => prev + 1);
    setMarathaMorale(100);
    setDurraniMorale(100 * stageDifficulty * difficultyMult);
    setBattlePhase('choosing_drop');
    setShowStageResultModal(false);

    setBattleTimeLeft(45);
    setStagePlayerCasualties(0);
    setStageEnemyCasualties(0);
    setStageSwordStrikes(0);
    setStageSpecialsUsed(0);
    setStageDuelsAttempted(0);
    setAlliesSummonedCount(0);
    setEnemiesSummonedCount(0);

    setLog(prev => [
      `🔄 [NEXT STAGE PREPPED] Initiating Stage ${nextStageIndex} of 3! The battlefield enters ${nextPrahar.name.toUpperCase()} with ${nextPrahar.weather.toUpperCase()} skies.`,
      "Choose a new dropsite coordinates to deploy units and resume the fight!",
      ...prev.slice(0, 3)
    ]);
  };

  useEffect(() => {
    // Instantiate background military march synthesizer
    audioSynthRef.current = new FactionAudioSynth();
    return () => {
      if (audioSynthRef.current) {
        audioSynthRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (audioSynthRef.current && isMusicPlaying) {
      audioSynthRef.current.setFaction(activeFaction);
    }
  }, [activeFaction, isMusicPlaying]);

  useEffect(() => {
    if (audioSynthRef.current) {
      audioSynthRef.current.setVolume(musicVolume);
    }
  }, [musicVolume]);

  const toggleBattleMusic = () => {
    if (audioSynthRef.current) {
      if (isMusicPlaying) {
        audioSynthRef.current.stop();
        setIsMusicPlaying(false);
      } else {
        audioSynthRef.current.start(activeFaction, musicVolume);
        setIsMusicPlaying(true);
      }
    }
  };

  const currentVisibility = Math.max(10, TIME_OF_DAY_CONFIGS[timeOfDay].visibility + WEATHER_CONFIGS[weather].visibilityMod);
  const currentAccuracy = Math.max(15, TIME_OF_DAY_CONFIGS[timeOfDay].accuracy + WEATHER_CONFIGS[weather].accuracyMod);
  const currentPrahar = getPraharForBattle(currentStageIndex, battleTimeLeft, battlePhase);

  useEffect(() => {
    setTimeOfDay(currentPrahar.timeOfDay);
    setWeather(currentPrahar.weather);

    if (currentPrahar.key !== lastPraharRef.current) {
      if (lastPraharRef.current && battlePhase === 'clash') {
        setLog(prev => [
          `🕯️ PRAHAR SHIFT: ${currentPrahar.name} now governs the battlefield. ${currentPrahar.combatHint}`,
          ...prev.slice(0, 4)
        ]);
      }
      lastPraharRef.current = currentPrahar.key;
    }
  }, [currentPrahar.key, currentPrahar.timeOfDay, currentPrahar.weather, currentPrahar.name, currentPrahar.combatHint, battlePhase]);

  // Difficulty multiplier
  const stageDifficulty = {
    [CampaignStage.NIZAM_CAMPAIGN]: 0.8,
    [CampaignStage.PUNE]: 1,
    [CampaignStage.BURHANPUR]: 1.2,
    [CampaignStage.GWALIOR]: 1.5,
    [CampaignStage.DELHI_NEGOTIATIONS]: 1.8,
    [CampaignStage.SHINDE_STAND]: 2.2,
    [CampaignStage.DELHI_BATTLE]: 2.4,
    [CampaignStage.PANIPAT]: 3
  }[stage] || 1;

  const [battleDifficulty, setBattleDifficulty] = useState<'recruit' | 'veteran' | 'peshwa'>(() => {
    return (localStorage.getItem('panipat_battle_difficulty') as any) || 'veteran';
  });

  const difficultyMult = {
    recruit: 0.7,
    veteran: 1.15,
    peshwa: 1.85,
  }[battleDifficulty];

  const [marathaMorale, setMarathaMorale] = useState(100);
  const [durraniMorale, setDurraniMorale] = useState(100 * stageDifficulty * difficultyMult);
  const [battleProgress, setBattleProgress] = useState(0);
  
  const [log, setLog] = useState<string[]>(() => {
    const isShamsher = localStorage.getItem('panipat_campaign_general') === 'shamsher';
    const isParvatibai = localStorage.getItem('panipat_campaign_general') === 'parvatibai';
    const isGopikabai = localStorage.getItem('panipat_campaign_general') === 'gopikabai';
    if (isShamsher) {
      return [
        "⚔️ SHAMSHER BAHADUR is on the battlefield! Cavalry guards are fully energized!",
        "💬 'Forward for the Peshwas! Secure the Yamuna trenches with steel!'",
        "Awaiting coordinates... Select landing zone!"
      ];
    }
    if (isParvatibai) {
      return [
        "🌸 QUEEN PARVATIBAI is accompanying the vanguard! Divine resilience and sacred camp shields are active!",
        "💬 'Stand tall, defenders of Hindusthan! Our spirits will never freeze in this snow!'",
        "Awaiting coordinates... Select landing zone!"
      ];
    }
    if (isGopikabai) {
      return [
        "👑 REGENT GOPIKABAI'S SOVEREIGN TRUST is active! Pune Shaniwar Wada gold guards your rear lines!",
        "💬 'Our royal treasury is sworn to your steel. Command with iron absolute authority!'",
        "Awaiting coordinates... Select landing zone!"
      ];
    }
    return activeFaction === 'maratha' 
      ? ["Awaiting tactical drop coordinates... Select dropping zone!"] 
      : ["Select drop zone for vanguard flanking forces..."];
  });
  
  const [showShake, setShowShake] = useState(false);

  const [activeDuelOpponent, setActiveDuelOpponent] = useState<{
    name: string;
    title: string;
    difficulty: 'recruit' | 'veteran' | 'peshwa';
    viewMode?: 'duel' | 'skirmish';
  } | null>(null);

  const handleCloseDuelArena = (resolvedHealth: number, outcome: 'victory' | 'defeat' | 'retreat') => {
    setActiveDuelOpponent(null);
    
    if (outcome === 'victory') {
      setMarathaMorale(prev => Math.min(100, prev + 35));
      const currentGold = Number(localStorage.getItem('panipat_campaign_treasury') || '145000');
      const updatedGold = currentGold + 10000;
      localStorage.setItem('panipat_campaign_treasury', String(updatedGold));

      setLog(prev => [
        `⭐ DUEL GLORIOUS VICTORY! Vanquished the high Sardar under high-noon glare! Recieved +10,000 Grand gold Mohurs and rallied frontline forces!`,
        ...prev.slice(0, 4)
      ]);
      setBattleProgress(p => Math.min(100, p + 25));
    } else if (outcome === 'defeat') {
      setMarathaMorale(prev => Math.max(0, prev - 15));
      setLog(prev => [
        `💀 COMBAT OUTCOME: Defeated in close-combat duel! Retreating with minor injuries!`,
        ...prev.slice(0, 4)
      ]);
    } else {
      setLog(prev => [
        `🛡️ Tactical retreat from the dueling platform completed safely.`,
        ...prev.slice(0, 4)
      ]);
    }
  };

  // RTS dialogue box from historical commanders
  interface CommanderShout {
    speaker: string;
    role: string;
    alertType: string;
    text: string;
    faction: 'maratha' | 'durrani';
  }
  const [activeShout, setActiveShout] = useState<CommanderShout | null>(null);
  const [shoutVisible, setShoutVisible] = useState(false);

  const handleCommanderShout = (speaker: string, role: string, alertType: string, text: string, faction: 'maratha' | 'durrani') => {
    setActiveShout({ speaker, role, alertType, text, faction });
    setShoutVisible(true);
  };

  useEffect(() => {
    if (!shoutVisible || !activeShout) return;
    const timer = setTimeout(() => {
      setShoutVisible(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeShout, shoutVisible]);

  // Active Terrain configuration
  const activeTerrain = TERRAIN_CONFIGS[stage] || TERRAIN_CONFIGS[CampaignStage.PUNE];

  // Simulated passive enemy firing loop (Active only when clash is hot)
  useEffect(() => {
    if (battlePhase !== 'clash' || showStageResultModal || showBreachDialogueModal) return;

    const interval = setInterval(() => {
      // 1. Decrement Battle Timer Limit (Timed Battles feature)
      setBattleTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired! Resolve battle round immediately based on current relative morale
          const winner: 'player' | 'enemy' = marathaMorale >= durraniMorale ? 'player' : 'enemy';
          const updated = [...stageOutcomes];
          updated[currentStageIndex - 1] = winner;
          setStageOutcomes(updated);
          setShowStageResultModal(true);

          setLog(prevLog => [
            `⏳ [BATTLE TIME EXPIRED] Raw battlefield exhaustion! ${winner === 'player' ? 'Our forces' : 'Enemy forces'} claimed sector dominance due to superior morale!`,
            ...prevLog.slice(0, 3)
          ]);
          return 0;
        }
        return prev - 1;
      });

      // If smoke screen is active, fully block or heavily reduce damage!
      const damageBlocked = smokeActive ? 0.05 : 1.0;

      // Random attrition based on difficulty and level 3 armor protection
      const isPanipat = stage === CampaignStage.PANIPAT;
      const armorReduction = armorTier === 3 ? 0.6 : armorTier === 2 ? 0.85 : 1.0;
      
      // Speed up initial battles (non-Panipat stages) by applying a speed factor so matches are highly dynamic
      const speedFactor = isPanipat ? 1.0 : 3.2;
      
      const marathaLoss = (Math.random() * (0.9 * stageDifficulty * (isPanipat ? 1.8 : 1) * (1 / activeTerrain.defenseModifier))) * armorReduction * damageBlocked * difficultyMult * speedFactor;
      // Balance Durrani passive attrition symmetrically based on active difficulty scaling
      const durraniLoss = ((Math.random() * (isPanipat ? 1.05 : 0.8) * (1.1 / difficultyMult)) * stageDifficulty) * speedFactor;

      setMarathaMorale(prev => Math.max(0, prev - marathaLoss));
      setDurraniMorale(prev => Math.max(0, prev - durraniLoss));

      // 2. Accumulate simulated casualties realistically per tick (Detailed casualties feature)
      const pCas = Math.floor(marathaLoss * 46 + Math.random() * 15);
      const eCas = Math.floor(durraniLoss * 49 + Math.random() * 18);
      setStagePlayerCasualties(prev => prev + pCas);
      setStageEnemyCasualties(prev => prev + eCas);

      // 3. Automated reinforcements counter-spawning (Both sides spawn elements feature)
      // If enemy morale is dropping, they have a chance to call reserves code in
      if (Math.random() < 0.22 && durraniMorale < 80) {
        setSpawnEnemyTrigger(t => t + 2);
        setEnemiesSummonedCount(prev => prev + 2);
        setLog(prevLog => [
          "🚨 [ENEMY REINFORCEMENTS] Afghan Durrani command has summoned 2 heavy tribal Ghazi skirmishers to hold the sector!",
          ...prevLog.slice(0, 3)
        ]);
      }

      // Gradual decay of Fort siege walls so it NEVER is never-ending!
      const isSiege = stage === CampaignStage.NIZAM_CAMPAIGN || stage === CampaignStage.GWALIOR || stage === CampaignStage.DELHI_NEGOTIATIONS;
      if (isSiege && fortWallIntegrity > 0) {
        setFortWallIntegrity(prev => {
          if (prev <= 0) return 0;
          // Every tick automatically degrades wall reflecting constant Gardi bombardment
          const decay = 3 + Math.floor(Math.random() * 4); // 3% to 6% decay per tick
          const next = Math.max(0, prev - decay);
          if (next === 0) {
            setLog(prevLog => [
              "🔓 FORTRESS WALL CRUMBLED! Relentless nine-pounder salvos pulverized the gates!",
              "🔥 Ibrahim Khan Gardi has breached the defenses!",
              ...prevLog.slice(0, 3)
            ]);
            setShowBreachDialogueModal(true);
          }
          return next;
        });
      }
      
      const eventChance = Math.random();
      if (eventChance > 0.9) {
        const events = activeFaction === 'maratha' ? [
          "🚨 Hostile snipers opening heavy fire from the tree-lines!",
          "⚠️ Red Zone Mortar incoming! Move to local cover structures!",
          "💨 Saffron air smoke signal highlighted at quadrant E-40!",
          "⚔️ Afghan vanguard troopers carrying long steel scimitars flanking!",
          "🛡️ Blue Zone Safe Circle is collapsing! Combat readiness under threat!"
        ] : [
          "🚨 Maratha Gardi musketeers taking sniper aim with French Carbines!",
          "⚠️ Shaniwar mortar battery shelling our flank trenches!",
          "💨 Blue smoke indicates a cargo drop landed at sector W-12!",
          "⚔️ Maratha heavy infantry charging forward behind iron shield-lines!",
          "🛡️ Red Zone artillery barrage launched over our central command ridges!"
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        setLog(prev => [randomEvent, ...prev.slice(0, 4)]);
        setShowShake(true);
        setTimeout(() => setShowShake(false), 200);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [battlePhase, stageDifficulty, stage, fortWallIntegrity, activeTerrain, activeFaction, armorTier, smokeActive, difficultyMult, showStageResultModal, showBreachDialogueModal, marathaMorale, durraniMorale, currentStageIndex, stageOutcomes]);

  // Sync Progress & Victory criteria for the 3 stages series
  useEffect(() => {
    const initialMaratha = 100;
    const initialDurrani = 100 * stageDifficulty;
    const totalRemaining = marathaMorale + durraniMorale;
    const initialTotal = initialMaratha + initialDurrani;
    
    setBattleProgress(Math.max(0, Math.min(100, 100 - (totalRemaining / initialTotal * 100))));

    if (battlePhase !== 'clash' || showStageResultModal) return;

    const isSiege = stage === CampaignStage.NIZAM_CAMPAIGN || stage === CampaignStage.GWALIOR || stage === CampaignStage.DELHI_NEGOTIATIONS;

    let stageWinner: 'player' | 'enemy' | null = null;
    if (activeFaction === 'maratha') {
      if (durraniMorale <= 0) {
        if (isSiege && fortWallIntegrity > 0) {
          // The battle is never-ending even if strength is 0, until walls break!
          stageWinner = null;
        } else {
          stageWinner = 'player';
        }
      } else if (marathaMorale <= 0) {
        stageWinner = 'enemy';
      }
    } else {
      if (marathaMorale <= 0) {
        if (isSiege && fortWallIntegrity > 0) {
          // The battle is never-ending even if strength is 0, until walls break!
          stageWinner = null;
        } else {
          stageWinner = 'player';
        }
      } else if (durraniMorale <= 0) {
        stageWinner = 'enemy';
      }
    }

    if (stageWinner) {
      const updated = [...stageOutcomes];
      updated[currentStageIndex - 1] = stageWinner;
      setStageOutcomes(updated);
      setShowStageResultModal(true);

      const logMsg = stageWinner === 'player'
        ? `🏆 [STAGE ${currentStageIndex} VICTORY] You shattered the enemy's vanguard lines in this round!`
        : `💀 [STAGE ${currentStageIndex} DEFEAT] Your frontline division sustained critical damage and withdrew.`;
      
      setLog(prev => [logMsg, ...prev.slice(0, 4)]);
    }
  }, [marathaMorale, durraniMorale, battlePhase, stageDifficulty, stage, fortWallIntegrity, activeFaction, currentStageIndex, stageOutcomes, showStageResultModal]);

  // Handle active drop action
  const triggerDropLaunch = (hotspot: string) => {
    setSelectedDropHotspot(hotspot);
    setBattlePhase('dropping');
    setLog(prev => [
      `SQUAD DEPLOYED! Parachuting down to ${hotspot.toUpperCase()}... Hold tight!`,
      ...prev
    ]);

    let timer = 3;
    const interval = setInterval(() => {
      timer -= 1;
      setDropCountdown(timer);
      if (timer <= 0) {
        clearInterval(interval);
        setBattlePhase('clash');
        setLog(prev => [
          "🎉 LANDED! Match started! Click directly on the Canvas targets or trigger actions inside active combat safe limits!",
          ...prev
        ]);
      }
    }, 1000);
  };

  // Recover active weapon stamina / focus
  const triggerWeaponReload = () => {
    if (isReloading || ammoCount === maxAmmo) return;
    setIsReloading(true);
    setLog(prev => ["🔄 REGAINING FOCUS... Muster physical stamina to unleash swift saber strikes...", ...prev.slice(0, 4)]);
    setTimeout(() => {
      setAmmoCount(maxAmmo);
      setIsReloading(false);
      setLog(prev => ["✅ RECOVERY COMPLETE: 5 / 5 strike stamina restored!", ...prev.slice(0, 4)]);
    }, 1400);
  };

  // Canvas-based click enemy hit registration callback
  const handleEnemyHitInCanvas = (dmg: number, label: string) => {
    const isShamsher = localStorage.getItem('panipat_campaign_general') === 'shamsher';
    if (ammoCount <= 0) {
      setLog(prev => ["⚠️ STAMINA DEPLETED! Click 'MUSTER FOCUS' to refresh your strike energy!", ...prev.slice(0, 4)]);
      return;
    }

    setAmmoCount(prev => Math.max(0, prev - 1));
    setStageSwordStrikes(prev => prev + 1);

    // Weather impact / accuracy check
    const hitRoll = Math.random() * 105; // slightly over 100 to account for absolute edge misses
    if (hitRoll > currentAccuracy) {
      const missReasons = {
        clear: "missed the target due to rapid recoil!",
        rain: "slipped in the sludge and missed! Wet rain blinded your sight.",
        dust_storm: "got blinded by swirling sepia storm sands and missed!",
        fog: "could not target correctly through the freezing mist fog and missed!"
      };
      const reason = missReasons[weather];
      
      setLog(prev => [
        `💨 [WEATHER MISSED] ${label.toUpperCase()} ${reason} (${currentAccuracy}% Accuracy)`,
        ...prev.slice(0, 4)
      ]);
      return;
    }

    // Calculate sword mastery modifiers
    const isSiege = stage === CampaignStage.NIZAM_CAMPAIGN || stage === CampaignStage.GWALIOR || stage === CampaignStage.DELHI_NEGOTIATIONS;
    const scopeMod = equippedScope === 'Royal Damascus Pommel' ? 1.55 : equippedScope === 'Peshwa Gilded Hilt' ? 1.25 : 1.0;
    const shamsherMod = isShamsher ? 1.45 : 1.0;
    
    // Balance active sword damage so the enemy regiments don't disintegrate instantly
    let finalDmg = (dmg * scopeMod * shamsherMod * (stage === CampaignStage.PANIPAT ? 0.85 : 1)) / 2.3;
    
    // In fortress siege mode, defenders are heavily sheltered!
    if (isSiege && fortWallIntegrity > 0) {
      finalDmg *= 0.33; // 1/3 sword damage
      setFortWallIntegrity(prev => {
        if (prev <= 0) return 0;
        const next = Math.max(0, prev - 4);
        if (next === 0) {
          setLog(prevLog => [
            "🔓 FORTRESS GATES CRUMBLED under your coordinated melee assault!",
            "🔥 Ibrahim Khan Gardi has breached the defense perimeter alongside the Maratha vanguard!",
            ...prevLog.slice(0, 3)
          ]);
          setShowBreachDialogueModal(true);
        }
        return next;
      });
    }

    if (activeFaction === 'maratha') {
      setDurraniMorale(prev => {
        const next = prev - finalDmg;
        return (isSiege && fortWallIntegrity > 0) ? Math.max(35, next) : Math.max(0, next);
      });
    } else {
      setMarathaMorale(prev => {
        const next = prev - finalDmg;
        return (isSiege && fortWallIntegrity > 0) ? Math.max(35, next) : Math.max(0, next);
      });
    }

    const logPrefix = isShamsher ? "👑 [SHAMSHER'S VALOUR]" : "⚔️ [STEEL CLASH]";
    
    if (isSiege && fortWallIntegrity > 0) {
      setLog(prev => [
        `🛡️ [FORTRESS SHELTERED] Solid basalt walls protected defenders! Sword cuts dealt ${Math.round(finalDmg)}% damage. Gate chipped down!`,
        ...prev.slice(0, 4)
      ]);
    } else {
      setLog(prev => [
        `${logPrefix} ${label.toUpperCase()}! Dealt ${Math.round(finalDmg)}% heavy damage to opponents!`,
        ...prev.slice(0, 4)
      ]);
    }
  };

  // Weather-specific combat tactics countermeasures
  const triggerWeatherTacticCountermeasure = () => {
    if (battlePhase !== 'clash' || showStageResultModal) return;

    if (weather === 'fog') {
      setSmokeActive(true);
      setMarathaMorale(prev => Math.min(100, prev + 25));
      setLog(prev => [
        "💨 [WEATHER COUNTERMEASURE] Lit Wet Straw Smokescreen!",
        "🛡️ Blinded Durrani snipers (Boosted self Cohesion by +25, protected against gun projectiles).",
        ...prev.slice(0, 3)
      ]);
      alert("💨 [TACTICAL COUNTERMEASURE] Lit Wet Straw Smokescreen! High-density white smoke blindfolds Afghan sniping regiments. Royal Cohesion boosted by +25%!");
    } else if (weather === 'rain') {
      setMarathaMorale(prev => Math.min(100, prev + 15));
      setLog(prev => [
        "🗡️ [WEATHER COUNTERMEASURE] Coated heavy Maratha swords with toxic monkshood root extract!",
        "⚡ Broadswords deal corrosive damage regardless of slippery rain factor. Gained +15 Cohesion.",
        ...prev.slice(0, 3)
      ]);
      alert("🗡️ [TACTICAL COUNTERMEASURE] Coated broadswords with toxic monkshood extracts! Gained slippery rain sword-play bypass. Self Cohesion +15%.");
    } else if (weather === 'dust_storm') {
      setMarathaMorale(prev => Math.min(100, prev + 30));
      setLog(prev => [
        "🥁 [WEATHER COUNTERMEASURE] Sounded deep traditional Dhrupad drums on brass nakaras!",
        "🔊 Led separated cavalry divisions back into unified combat columns. Cohesion +30.",
        ...prev.slice(0, 3)
      ]);
      alert("🥁 [TACTICAL COUNTERMEASURE] Sounded deep traditional Dhrupad drums! Guided separated horse divisions through the dark dusty storm back to solid rows.");
    } else if (timeOfDay === 'midnight') {
      // Balance midnight rocket salvo damage (from 25% to 10% to preserve military tension)
      setDurraniMorale(prev => Math.max(0, prev - 10));
      setLog(prev => [
        "🎆 [TIME-OF-DAY COUNTERMEASURE] Launched Garmadi military firecracker rocket salvos!",
        "💥 Plunged Durrani camel-mounted division into utter panic under dark skies. Durrani Morale -10%.",
        ...prev.slice(0, 3)
      ]);
      alert("🎆 [TACTICAL COUNTERMEASURE] Fired Garmadi rocket shells under pitch black midnight! The flashes and noise terrorized foreign camel divisions, cutting their morale by -10%!");
    } else {
      setLog(prev => [
        "☀️ [TACTICAL STANDING] Atmosphere is dry and clear. Save countermeasures for storms, fog, or dark midnight scenes.",
        ...prev.slice(0, 4)
      ]);
      alert("☀️ [CLEAR ATMOSPHERE] Current weather is clear. Save your tactics for heavy storms, freezing fog, or pitch black midnight conditions!");
    }
  };

  // Canvas - Pickup Saffron supply chest
  const handleAirdropLootClaimed = () => {
    setAirdropCargoAvailable(false);
    
    // Choose random premium reward to buff the player
    const rewards = [
      { name: "Tier-3 Steel Chainmail Armor", action: () => setArmorTier(3) },
      { name: "Sovereign Royal Damascus Pommel", action: () => setEquippedScope("Royal Damascus Pommel") },
      { name: "Focus Adrenaline Elixir", action: () => setAdrenalineSyringes(prev => prev + 1) },
      { name: "Gardi Grapeshot Artillery Bomb", action: () => setFragBombs(prev => prev + 1) }
    ];

    const chosen = rewards[Math.floor(Math.random() * rewards.length)];
    chosen.action();

    setLog(prev => [
      `🎁 WAR SUPPLY RECIEVED: Acquired [${chosen.name.toUpperCase()}] from the sky drop!`,
      ...prev.slice(0, 4)
    ]);
  };

  // Active shooter combat operations beyond standard 3 buttons
  const executeCombatOperation = (op: 'smoke' | 'artillery' | 'adrenaline' | 'bomb' | 'flank') => {
    if (battlePhase !== 'clash' || clashAction !== null) return;

    setClashAction(op as any);
    const difficultyMod = stage === CampaignStage.PANIPAT ? 0.75 : 1;

    if (op === 'smoke') {
      setSmokeActive(true);
      setLog(prev => [
        "💨 SMOKE SCREEN DEPLOYED! Thick defense cloud cloaking our lines; incoming hostiles cannot touch our readiness for 4 seconds!",
        ...prev.slice(0, 4)
      ]);
      setTimeout(() => {
        setSmokeActive(false);
        setClashAction(null);
        setLog(prev => ["💨 Smoke screen has dissipated! Front trenches exposed once again.", ...prev.slice(0, 4)]);
      }, 4000);

    } else if (op === 'artillery') {
      // Balance artillery battery strike impact to preserve battle length
      const artDmg = (35 * difficultyMod * activeTerrain.artilleryBonus) / 2.1;
      if (activeFaction === 'maratha') {
        setDurraniMorale(prev => Math.max(0, prev - artDmg));
      } else {
        setMarathaMorale(prev => Math.max(0, prev - artDmg));
      }

      // Check fortress impact
      const isSiege = stage === CampaignStage.NIZAM_CAMPAIGN || stage === CampaignStage.GWALIOR || stage === CampaignStage.DELHI_NEGOTIATIONS;
      if (isSiege && fortWallIntegrity > 0) {
        const nextIntegrity = Math.max(0, fortWallIntegrity - 25);
        setFortWallIntegrity(nextIntegrity);
        if (nextIntegrity === 0) {
          setLog(prev => [
            "🔓 FORTRESS GATES BREACHED! Heavy nine-pounder French Gardi salvos shattered the basalt portals!",
            "🔥 Sadashivrao Bhau bellows: 'ALL UNITS, DRAW YOUR SWORDS! STORM THE BREACH NOW!'",
            `💥 Gannon fire dealt ${Math.round(artDmg)}% morale damage!`,
            ...prev.slice(0, 2)
          ]);
          setShowBreachDialogueModal(true);
        } else {
          setLog(prev => [
            `💥 DIRECT WALL COLLISION! Gardi cannonballs struck the basalt ramparts! Fort Integrity: ${nextIntegrity}%`,
            `💥 Gannon fire dealt ${Math.round(artDmg)}% morale damage!`,
            ...prev.slice(0, 3)
          ]);
        }
      } else {
        setLog(prev => [
          `💥 MORTAR AIR-STRIKE: Heavy Gardi battery shells pounded the horizon coordinates for ${Math.round(artDmg)}% morale damage!`,
          ...prev.slice(0, 4)
        ]);
      }

      setShowShake(true);
      setTimeout(() => {
        setShowShake(false);
        setClashAction(null);
      }, 1500);

    } else if (op === 'adrenaline') {
      if (adrenalineSyringes <= 0) {
        setLog(prev => ["❌ NO SYRINGES LEFT! Secure the Saffron Air-Drops to restock supply gear!", ...prev.slice(0, 4)]);
        setClashAction(null);
        return;
      }
      setAdrenalineSyringes(prev => prev - 1);
      
      if (activeFaction === 'maratha') {
        setMarathaMorale(prev => Math.min(100, prev + 25));
      } else {
        setDurraniMorale(prev => Math.min(100 * stageDifficulty, prev + 25));
      }

      setLog(prev => ["🧪 ADRENALINE INJECTED! Restored +25% Combat Readiness & mended tier armor plates!", ...prev.slice(0, 4)]);
      setTimeout(() => setClashAction(null), 1000);

    } else if (op === 'bomb') {
      if (fragBombs <= 0) {
        setLog(prev => ["❌ OUT OF FRAG BOMBS! Search the drop chests!", ...prev.slice(0, 4)]);
        setClashAction(null);
        return;
      }
      setFragBombs(prev => prev - 1);
      
      // Balance fragment bomb shrapnel impact to preserve battle length
      const bDmg = (45 * difficultyMod) / 2.2;
      if (activeFaction === 'maratha') {
        setDurraniMorale(prev => Math.max(0, prev - bDmg));
      } else {
        setMarathaMorale(prev => Math.max(0, prev - bDmg));
      }

      // Check fortress impact
      const isSiege = stage === CampaignStage.NIZAM_CAMPAIGN || stage === CampaignStage.GWALIOR || stage === CampaignStage.DELHI_NEGOTIATIONS;
      if (isSiege && fortWallIntegrity > 0) {
        const nextIntegrity = Math.max(0, fortWallIntegrity - 20);
        setFortWallIntegrity(nextIntegrity);
        if (nextIntegrity === 0) {
          setLog(prev => [
            "🔓 FORTRESS GATES BREACHED! Hand-thrown powder bombs decimated the entrance gates!",
            "🔥 Sadashivrao Bhau bellows: 'ALL UNITS, DRAW YOUR SWORDS! CHARGE THE RAMARTS!'",
            `💣 Frag bomb dealt ${Math.round(bDmg)}% heavy shrapnel damage!`,
            ...prev.slice(0, 2)
          ]);
          setShowBreachDialogueModal(true);
        } else {
          setLog(prev => [
            `💣 WALL BOMBARDMENT! High-explosive frag damaged the fort ramparts! Fort Integrity: ${nextIntegrity}%`,
            `💣 Frag bomb dealt ${Math.round(bDmg)}% heavy shrapnel damage!`,
            ...prev.slice(0, 3)
          ]);
        }
      } else {
        setLog(prev => [
          `💣 FRAG BOMB COMPLETED: Direct horizontal grenade burst deals ${Math.round(bDmg)}% heavy shrapnel impact!`,
          ...prev.slice(0, 4)
        ]);
      }

      setShowShake(true);
      setTimeout(() => {
        setShowShake(false);
        setClashAction(null);
      }, 1500);

    } else if (op === 'flank') {
      // Flanking gamble action
      const success = Math.random() > 0.45;
      if (success) {
        // Balance flank cavalry raid impact to preserve battle length
        const flankDmg = (50 * difficultyMod * activeTerrain.cavalryBonus) / 2.1;
        if (activeFaction === 'maratha') {
          setDurraniMorale(prev => Math.max(0, prev - flankDmg));
        } else {
          setMarathaMorale(prev => Math.max(0, prev - flankDmg));
        }
        setLog(prev => [
          `🐎 LEGENDARY FLANK RAID! Cavalry snuck behind and shot down senior command staff: massive ${Math.round(flankDmg)}% damage!`,
          ...prev.slice(0, 4)
        ]);
      } else {
        if (activeFaction === 'maratha') {
          setMarathaMorale(prev => Math.max(0, prev - 20));
        } else {
          setDurraniMorale(prev => Math.max(0, prev - 20));
        }
        setLog(prev => ["❌ FLANKING SQUAD INFILTRATION DETECTED! We suffered heavy counter-fires!", ...prev.slice(0, 4)]);
        setShowShake(true);
        setTimeout(() => setShowShake(false), 850);
      }
      setTimeout(() => setClashAction(null), 2000);
    }
  };

  return (
    <div id="battle-scene-wrapper" className={`relative h-screen w-screen bg-[#070404] text-stone-200 overflow-hidden font-sans ${showShake ? 'battle-shake' : ''}`}>
      <TopBar screen={Screen.BATTLE} onNavigate={onNavigate} onHelp={onHelp} onSettings={onSettings} />

      {/* HISTORICAL PRE-BATTLE parchment BRIEFING MODAL */}
      <AnimatePresence>
        {showBriefing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-[#0c0806]/95 flex items-center justify-center p-4 md:p-8"
          >
            {/* Scroll Container */}
            <div className="max-w-xl w-full bg-[#f4ebe1] border-8 border-double border-[#8B5E3C] p-6 md:p-8 text-[#2c1d11] shadow-2xl rounded-sm relative overflow-y-auto max-h-[90vh]">
              {/* Inner border */}
              <div className="absolute inset-1 border border-[#8B5E3C]/30 rounded-xs pointer-events-none" />
              
              {/* Royal Seal Wax Decoration */}
              <div className="absolute top-4 right-4 text-3xl opacity-85 select-none pointer-events-none">
                🏮
              </div>

              {/* Title Section */}
              <div className="text-center pb-4 mb-4 border-b border-[#2c1d11]/20">
                <p className="text-[10px] uppercase tracking-widest font-mono text-[#8B5E3C] font-bold">
                  MILITARY COUNCIL BRIEFING
                </p>
                <h1 className="text-2xl md:text-3xl font-serif font-black uppercase text-[#4c1d12] mt-1 tracking-tight">
                  {stage && activeBrief?.title || "BATTLEPLAN ORDER"}
                </h1>
                <div className="flex justify-center items-center gap-4 text-xs font-mono text-[#5c3e21] mt-2 font-bold uppercase w-full">
                  <span>📍 {stage && activeBrief?.location || "Frontier Plain"}</span>
                  <span>•</span>
                  <span>📅 {stage && activeBrief?.year || "1760 AD"}</span>
                </div>
              </div>

              {/* Scenario Narrative */}
              <div className="mb-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#8B5E3C] mb-1 font-mono">
                  I. Strategic Scenario
                </h3>
                <p className="text-sm leading-relaxed text-[#453221] font-serif italic bg-white/40 p-3 rounded border border-[#8B5E3C]/10 shadow-xs">
                  "{stage && activeBrief?.scenario || "A cold frost settles as scouts report enemy divisions organizing along the tree barrier."}"
                </p>
              </div>

              {/* Tactical Objectives */}
              <div className="mb-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#8B5E3C] mb-2 font-mono flex items-center gap-1.5">
                  🎯 II. Tactical Objectives
                </h3>
                <ul className="space-y-2 text-sm text-[#382613]">
                  {stage && (activeBrief?.objectives || [
                    "Achieve victory in the central sector clash",
                    "Maintain high soldier morale and discipline"
                  ]).map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-[#8B5E3C] font-black text-xs font-mono bg-[#8B5E3C]/10 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <span className="leading-tight font-medium">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* General Staff Recommendation / Tip */}
              <div className="mb-8 p-3 rounded bg-amber-100/65 border border-amber-300/40">
                <h4 className="text-xs uppercase font-bold text-[#b45309] font-mono tracking-wide flex items-center gap-1">
                  💡 Grand Strategy
                </h4>
                <p className="text-xs text-[#78350f] leading-normal font-sans mt-0.5">
                  {stage && activeBrief?.strategyTip || "Observe enemy lines carefully and strike when focus indicators reach their peak!"}
                </p>
              </div>

              {/* Command Action Buttons */}
              <div className="text-center">
                <button
                  id="accept-briefing-btn"
                  onClick={() => {
                    setShowBriefing(false);
                  }}
                  className="w-full md:w-auto px-6 py-3.5 bg-[#4c1d12] hover:bg-[#3b120c] text-[#f4ebe1] hover:text-white font-serif font-bold uppercase tracking-widest text-xs rounded shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] border border-[#ffedd5]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  ⚔️ ACCEPT COMMAND & SURVEY LANDING BOUNDS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER PHASE 1: CHOOSE AIR DROP COORDS (Like PUBG Drop Plan) */}
      <AnimatePresence>
        {!showBriefing && battlePhase === 'choosing_drop' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#120a06]/98 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="absolute inset-0 parchment opacity-20 pointer-events-none" />
            <div className="max-w-4xl bg-[#1e140f] border-4 border-[#8B5E3C] p-8 shadow-2xl rounded-sm relative">
              <div className="absolute inset-1 border border-[#8B5E3C]/40 rounded-xs pointer-events-none" />
              
              <div className="flex justify-center mb-2">
                <span className="px-3 py-1 bg-saffron text-stone-950 font-black text-[10px] tracking-widest uppercase rounded-xs">
                  SQUAD SHUTTLE MAP OVERVIEW
                </span>
              </div>
              
              <h2 className="text-4xl text-white font-serif font-black uppercase tracking-wide">
                LANDING BOUNDS SECTOR SELECT
              </h2>
              <p className="text-stone-300 text-xs italic mt-2 max-w-xl mx-auto">
                "By military order, select your landing zone on the 18th-century Hindusthan frontier lines. Choose wisely; different sectors yield distinct strategic cover bonuses and loot quantities."
              </p>

              {/* Grid map for drops */}
              <div id="drop-hotspot-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {[
                  {
                    id: 'trenches',
                    name: "Yamuna Canal Trenches",
                    risk: "LOW RISK",
                    loot: "TIER 1 LOOT x1.1",
                    color: "text-emerald-400 border-emerald-900/45",
                    desc: "Rich soil bank protection. Safer descent with enhanced cover but restricted weapon loot drops.",
                    bonus: "🛡️ Defense: +35%"
                  },
                  {
                    id: 'encampment',
                    name: "Panipat Royal Barracks",
                    risk: "EXTREME RISK",
                    loot: "TIER 3 LOOT x2.0",
                    color: "text-red-500 border-red-900/60 animate-pulse",
                    desc: "Highly populated. Hot dropping into main armor depots. High early engagement guarantees epic weapons.",
                    bonus: "🎯 Sniper Gear Guaranteed"
                  },
                  {
                    id: 'temple',
                    name: "Sutlej Defile Ruins",
                    risk: "MEDIUM RISK",
                    loot: "TIER 2 LOOT x1.5",
                    color: "text-amber-400 border-amber-900/50",
                    desc: "High altitude stone pillars providing incredible vertical shooting profiles over the valley.",
                    bonus: "⚡ Flanking Buffs"
                  }
                ].map(spot => (
                  <button
                    key={spot.id}
                    id={`hotspot-${spot.id}`}
                    onClick={() => triggerDropLaunch(spot.name)}
                    className="flex flex-col text-left p-4 bg-stone-950/80 border-2 hover:border-saffron rounded-xs transition-all transform hover:-translate-y-1 cursor-pointer focus:outline-none"
                  >
                    <span className={`text-[10px] font-black tracking-widest uppercase ${spot.color}`}>
                      {spot.risk} • {spot.loot}
                    </span>
                    <h4 className="text-white text-md font-serif font-bold mt-1 uppercase">
                      {spot.name}
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
                      {spot.desc}
                    </p>
                    <div className="mt-4 pt-2 border-t border-stone-900 text-[10px] font-mono text-saffron uppercase">
                      {spot.bonus}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 text-[10px] text-stone-500 font-mono uppercase tracking-widest text-center">
                Awaiting squad coordination... Choose zone to fly!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER PHASE 2: ANIMATED PARACHUTE DESCENT */}
      <AnimatePresence>
        {battlePhase === 'dropping' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#090503] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,black_100%)] z-10" />
            
            {/* Pulsing parachute visual indicator */}
            <div className="relative z-20 space-y-6">
              <motion.div 
                animate={{ y: [0, -25, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-8xl text-saffron select-none"
              >
                🪂
              </motion.div>
              
              <span className="text-[11px] font-black text-saffron font-mono uppercase tracking-[0.5em] block">
                BLUE ZONE SAFE CIRCLE DETECTED
              </span>
              <h2 className="text-4xl text-white font-serif font-black uppercase tracking-widest">
                DESCENDING INTO {selectedDropHotspot?.toUpperCase()}
              </h2>
              
              <div className="text-5xl font-mono text-emerald-400 font-black animate-scale">
                {dropCountdown}s
              </div>
              
              <p className="text-stone-400 text-xs italic max-w-sm mx-auto">
                Opening parachute valves... Arming French flintlock sights... Keep crosshair steady!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRITICAL PLAYER HUD: PUBG STYLE TOP BAR COMPASS */}
      <div id="pubg-compass-hud" className="absolute top-16 left-0 right-0 h-10 bg-stone-950/90 border-b border-[#8B5E3C]/35 z-40 flex items-center justify-center overflow-hidden font-mono text-xs text-stone-400">
        <div className="flex items-center gap-6 select-none uppercase text-[10px]">
          <span>W • 285</span>
          <span>•</span>
          <span>300</span>
          <span>•</span>
          <span className="text-saffron font-bold text-xs flex items-center gap-1">
            <Compass size={13} className="animate-spin-slow" /> NW • 315
          </span>
          <span>•</span>
          <span>330</span>
          <span>•</span>
          <span>N • 345</span>
        </div>
      </div>

      {/* CLASH SANDBOX MAIN RENDER VIEW */}
      <main className="relative z-20 h-full pt-26 flex flex-col xl:flex-row">
        
        {/* LEFT COLUMN: ACTIVE BATTLE CANVASTAGE (MOUSE AIMING) */}
        <div className="flex-1 relative flex flex-col min-h-[380px] border-r border-[#8B5E3C]/10 bg-stone-950">
          
          {/* Top Info Badging */}
          <div className="absolute top-4 left-4 z-40 bg-stone-950/90 border border-stone-800 p-2 uppercase font-mono text-[9px] text-stone-400 rounded-sm">
            <span>DROPZONE: </span>
            <span className="text-white font-serif font-bold">{selectedDropHotspot || "UNSPECIFIED"}</span>
          </div>

          <div className="absolute top-4 right-4 z-40 bg-stone-950/90 border border-stone-800 px-3 py-1 uppercase font-mono text-[9px] text-stone-400 rounded-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>ALIVE ENEMY CHIPS: 8</span>
          </div>

          {/* Mouse shooter trigger instructions */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 bg-stone-900/90 border border-saffron px-4 py-1.5 text-center text-[10px] text-stone-200 uppercase font-mono rounded-xs pointer-events-none">
            ⚔️ <span className="text-saffron font-bold">Battlemode: Swords & Artillery</span>: Left-click coordinates on the 3D battlefield below to execute sword cuts or shell enemies!
          </div>

          <div className="flex-1 w-full bg-black relative">
            {battlePhase === 'clash' && (
              <div id="battle-timer-hud" className="absolute top-4 left-1/2 -translate-x-1/2 z-[45] bg-stone-950/95 border border-[#8B5E3C]/60 px-5 py-2 font-mono text-center rounded-xs shadow-2xl flex items-center justify-center gap-2.5 min-w-[160px]">
                <span className="animate-pulse text-amber-500 text-xs">⌛</span>
                <div className="text-left leading-none">
                  <span className="text-[7.5px] text-stone-500 block font-bold uppercase tracking-widest leading-none">ROUND TIMER</span>
                  <span className={`text-[13px] font-black tracking-wider leading-none block mt-0.5 ${battleTimeLeft <= 10 ? 'text-red-500 animate-pulse font-extrabold' : 'text-amber-400'}`}>
                    {battleTimeLeft} SECONDS
                  </span>
                </div>
              </div>
            )}

              <BattleCanvas 
              phase={battlePhase === 'choosing_drop' || battlePhase === 'dropping' ? 'initial' : 'clash'} 
              clashAction={clashAction} 
              enemyAction={enemyAction} 
              activeFaction={activeFaction}
              onEnemyHit={handleEnemyHitInCanvas}
              onLootSuccess={handleAirdropLootClaimed}
              onCommanderShout={handleCommanderShout}
              timeOfDay={timeOfDay}
              weather={weather}
              battlePrahar={currentPrahar.name}
              stage={stage}
              fortWallIntegrity={fortWallIntegrity}
              spawnAllyTrigger={spawnAllyTrigger}
              spawnEnemyTrigger={spawnEnemyTrigger}
              spawnAllyType={spawnAllyType}
              spawnEnemyType={spawnEnemyType}
            />

            {/* RTS STYLE HISTORICAL COMMANDER SHOUT DIALOGUE WIDGET */}
            <AnimatePresence>
              {shoutVisible && activeShout && (
                <motion.div
                  id="commander-shout-dialogue"
                  initial={{ opacity: 0, y: 35, scale: 0.93, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                  exit={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
                  transition={{ type: 'spring', damping: 18, stiffness: 140 }}
                  className="absolute bottom-6 left-1/2 z-50 w-[94%] max-w-[460px] pointer-events-auto"
                >
                  <div className={`p-4 rounded-xs border-2 shadow-2xl flex gap-4 text-left ${
                    activeShout.faction === 'maratha'
                      ? 'bg-gradient-to-r from-amber-950/95 to-stone-900/95 border-saffron shadow-orange-950/45'
                      : 'bg-gradient-to-r from-stone-950/95 to-red-950/95 border-red-500 shadow-red-950/45'
                  }`}>
                    {/* Character Crest Display Avatar */}
                    <div className={`w-14 h-14 rounded-xs border-2 font-serif font-black flex items-center justify-center text-xl shrink-0 select-none shadow-md ${
                      activeShout.faction === 'maratha'
                        ? 'border-saffron bg-[#451205] text-saffron'
                        : 'border-red-500 bg-[#350202] text-red-405'
                    }`}>
                      {activeShout.speaker.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Alert type header bar */}
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded-xs font-bold leading-none ${
                          activeShout.faction === 'maratha'
                            ? 'bg-amber-900/40 text-saffron'
                            : 'bg-red-950 text-red-400'
                        }`}>
                          {activeShout.alertType}
                        </span>
                        <span className="text-[7.5px] font-mono text-stone-500 uppercase tracking-tighter">
                          18th Century Tactical Feed
                        </span>
                      </div>

                      {/* Commander Speaker Info */}
                      <h5 className="text-[12px] font-serif font-black text-white hover:text-saffron transition-colors tracking-wide leading-tight">
                        {activeShout.speaker.toUpperCase()}
                      </h5>
                      <span className="text-[8px] font-mono text-stone-400 uppercase tracking-wider block leading-none mb-2">
                        {activeShout.role}
                      </span>

                      {/* Shout Quote Text with parchment styling */}
                      <p className="text-[11px] leading-snug text-stone-200 italic font-sans border-t border-stone-800/80 pt-1.5 font-medium">
                        "{activeShout.text}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* HIGH INTENSITY SWORD FIGHT DUEL ARENA OVERLAY */}
            <AnimatePresence>
              {activeDuelOpponent && (
                <SwordDuelArena
                  opponentName={activeDuelOpponent.name}
                  opponentTitle={activeDuelOpponent.title}
                  difficulty={activeDuelOpponent.difficulty}
                  viewMode={activeDuelOpponent.viewMode}
                  onClose={handleCloseDuelArena}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION DASHBOARD & INVENTORY COORDS */}
        <div id="pubg-dashboard-panel" className="w-full xl:w-[480px] bg-stone-950 border-t xl:border-t-0 xl:border-l border-[#8B5E3C]/35 p-6 flex flex-col justify-between overflow-y-auto">
          
          {/* Shamsher Bahadur Portrait Hero Card if Active */}
          {localStorage.getItem('panipat_campaign_general') === 'shamsher' && (
            <div className="mb-4 p-4 bg-gradient-to-r from-amber-950/70 to-stone-900/80 border-2 border-saffron/45 rounded-xs text-left shadow-lg">
              <div className="flex gap-3.5 items-center">
                <div className="w-12 h-12 rounded-sm border border-saffron bg-orange-950 flex items-center justify-center font-serif text-white font-black text-xl shadow-inner select-none shrink-0">
                  SB
                </div>
                <div>
                  <h4 className="text-saffron font-serif font-black text-sm uppercase tracking-wider flex items-center gap-1.5 leading-none">
                    👑 SHAMSHER BAHADUR
                  </h4>
                  <span className="text-[9px] text-[#FF9933] font-mono tracking-widest uppercase font-bold block mt-1">
                    Playable Hero • Sword & Cavalry Master
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-300 mt-2.5 leading-relaxed border-t border-stone-800/80 pt-2.5">
                The brave son of Baji Rao & Mastani leads the charge! Wielding peerless Damascus alloy, your sword strikes deal <span className="text-saffron font-bold">+45% melee damage</span> & trail custom holy crescent energy.
              </p>
            </div>
          )}

          {/* STAGE MATCH SERIES BEST-OF-THREE HUD */}
          <div id="battle-series-scoreboard" className="mb-4 p-4 bg-stone-900/90 border border-stone-800 rounded-xs space-y-3.5 text-left shadow-lg">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <span className="text-[9px] font-mono font-black text-saffron uppercase tracking-widest flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron"></span>
                </span>
                BEST OF 3 SERIES CLASH
              </span>
              <span className="text-[8px] font-mono font-bold bg-stone-950 px-1.5 py-0.5 rounded-xs text-saffron border border-saffron/15">
                STAGE {currentStageIndex} / 3
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Stage 1 outcome */}
              <div className="bg-stone-950/85 p-2.5 border border-stone-850 rounded-xs flex flex-col justify-between">
                <span className="text-[7.5px] font-mono text-stone-500 uppercase block tracking-wider">Stage 1</span>
                <div className="mt-1.5 h-4 flex items-center justify-center font-mono text-[9px] font-black">
                  {stageOutcomes[0] === 'player' ? (
                    <span className="text-emerald-400">🏆 OWNED</span>
                  ) : stageOutcomes[0] === 'enemy' ? (
                    <span className="text-red-500">💀 LOST</span>
                  ) : (
                    <span className="text-stone-600 animate-pulse">PENDING</span>
                  )}
                </div>
              </div>

              {/* Stage 2 outcome */}
              <div className="bg-stone-950/85 p-2.5 border border-stone-850 rounded-xs flex flex-col justify-between">
                <span className="text-[7.5px] font-mono text-stone-500 uppercase block tracking-wider">Stage 2</span>
                <div className="mt-1.5 h-4 flex items-center justify-center font-mono text-[9px] font-black">
                  {stageOutcomes[1] === 'player' ? (
                    <span className="text-emerald-400">🏆 OWNED</span>
                  ) : stageOutcomes[1] === 'enemy' ? (
                    <span className="text-red-500">💀 LOST</span>
                  ) : (
                    <span className="text-stone-600">
                      {currentStageIndex < 2 ? "LOCKED" : "PENDING"}
                    </span>
                  )}
                </div>
              </div>

              {/* Stage 3 outcome */}
              <div className="bg-stone-950/85 p-2.5 border border-stone-850 rounded-xs flex flex-col justify-between">
                <span className="text-[7.5px] font-mono text-stone-500 uppercase block tracking-wider">Stage 3</span>
                <div className="mt-1.5 h-4 flex items-center justify-center font-mono text-[9px] font-black">
                  {stageOutcomes[2] === 'player' ? (
                    <span className="text-emerald-400">🏆 OWNED</span>
                  ) : stageOutcomes[2] === 'enemy' ? (
                    <span className="text-red-500">💀 LOST</span>
                  ) : (
                    <span className="text-stone-600">
                      {currentStageIndex < 3 ? "LOCKED" : "PENDING"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-850/80 flex items-center justify-between text-[8px] font-mono text-stone-400 uppercase tracking-wider">
              <span>Required to proceed:</span>
              <span className="text-white font-black">Majority (2 wins)</span>
            </div>
          </div>

          {/* TACTICAL SKIRMISH DIFFICULTY SELECTOR */}
          <div id="battle-difficulty-card" className="mb-4 p-4 bg-stone-950 border border-[#8B5E3C]/20 rounded-xs text-left">
            <span className="text-[8px] font-black text-stone-500 font-mono tracking-widest uppercase block mb-2">
              TACTICAL BATTLE DIFFICULTY GAUGE
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'recruit', label: 'Recruit', style: 'border-emerald-950 text-stone-500 hover:bg-emerald-950/20 hover:text-emerald-400', activeStyle: 'bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold' },
                { id: 'veteran', label: 'Veteran', style: 'border-stone-800 text-stone-500 hover:bg-stone-900 hover:text-saffron', activeStyle: 'bg-stone-900 border-saffron text-saffron font-bold' },
                { id: 'peshwa', label: 'Peshwa', style: 'border-red-950 text-stone-500 hover:bg-red-950/20 hover:text-red-450', activeStyle: 'bg-red-950/40 border-red-500 text-red-400 font-bold' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setBattleDifficulty(opt.id as any);
                    localStorage.setItem('panipat_battle_difficulty', opt.id);
                  }}
                  className={`py-1.5 px-1 text-center text-[9px] uppercase font-mono tracking-tighter border transition-all cursor-pointer rounded-xs ${
                    battleDifficulty === opt.id ? opt.activeStyle : opt.style
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 mt-2 font-sans italic leading-tight">
              {battleDifficulty === 'recruit' && "🟢 Allies deal more damage; enemy passive attrition is minimized."}
              {battleDifficulty === 'veteran' && "🟡 Balanced 18th-century combat dynamics. Fast responses required."}
              {battleDifficulty === 'peshwa' && "🛡️ PESHWA FORCE: Hostiles deal massive melee damage. Core lines are fragile!"}
            </p>
          </div>

          {/* TEAM RETICLE STATUS CARDS */}
          <div className="space-y-4">
            
            {/* Morale Level Bars */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-stone-900">
              
              <div id="ally-status-hud" className="bg-[#120805] border border-[#8B5E3C]/20 p-3 rounded-xs text-left">
                <span className="text-[8px] font-black text-stone-500 font-mono tracking-widest uppercase block">
                  ALLIED COMBAT STATUS
                </span>
                <span className="text-md font-serif font-black text-saffron mt-0.5 block">
                  {getBattleCombatantNames(activeFaction, stage).ally}
                </span>
                
                {/* Micro Readiness percentage bar */}
                <div className="h-1.5 bg-stone-900 rounded-sm mt-2 overflow-hidden">
                  <div className="h-full bg-saffron" style={{ width: `${marathaMorale}%` }} />
                </div>
                <div className="flex justify-between items-center mt-1 text-[8px] font-mono text-stone-400">
                  <span>COHESION: {Math.round(marathaMorale)}%</span>
                  <span className="text-emerald-400">ACTIVE</span>
                </div>
              </div>

              <div id="enemy-status-hud" className="bg-[#1c0808] border border-red-950/20 p-3 rounded-xs text-left">
                <span className="text-[8px] font-black text-stone-500 font-mono tracking-widest uppercase block">
                  OPPONENT SQUAD LIMIT
                </span>
                <span className="text-md font-serif font-black text-red-500 mt-0.5 block">
                  {getBattleCombatantNames(activeFaction, stage).enemy}
                </span>

                <div className="h-1.5 bg-stone-900 rounded-sm mt-2 overflow-hidden">
                  <div className="h-full bg-red-650" style={{ width: `${Math.min(100, durraniMorale / stageDifficulty)}%` }} />
                </div>
                <div className="flex justify-between items-center mt-1 text-[8px] font-mono text-stone-400">
                  <span>CHIPS: {Math.round(durraniMorale)}%</span>
                  <span className="text-red-500 animate-pulse font-bold">WAVERING</span>
                </div>
              </div>

            </div>

            <div id="prahar-status-card" className="mb-4 bg-[#121315] border border-stone-800 p-3.5 rounded-sm text-left shadow-lg space-y-3">
              <div className="flex justify-between items-center border-b border-stone-900 pb-2">
                <h4 className="text-[9.5px] font-mono font-black text-saffron uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="h-3 w-3 animate-spin text-saffron" style={{ animationDuration: '6s' }} />
                  BATTLE PRAHAR CHRONICLE
                </h4>
                <span className="text-[8px] font-mono font-bold bg-stone-900 px-1.5 py-0.5 rounded-xs text-stone-400">
                  AUTO-CYCLING
                </span>
              </div>

              <div className="bg-stone-950 border border-[#8B5E3C]/25 rounded-xs p-3 space-y-2.5">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="text-[8px] font-mono font-black text-stone-500 uppercase tracking-widest block">
                      CURRENT PRAHAR
                    </div>
                    <div className="text-sm font-serif font-black text-white mt-1 leading-none">
                      {currentPrahar.name}
                    </div>
                    <div className="text-[10px] text-stone-400 italic mt-1.5 leading-snug">
                      {currentPrahar.subtitle}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex px-1.5 py-0.5 text-[8px] font-mono font-black uppercase tracking-wider rounded-xs bg-saffron/10 text-saffron border border-saffron/20">
                      {currentPrahar.index + 1}/8
                    </span>
                    <div className={`text-[10px] font-mono font-bold mt-2 ${TIME_OF_DAY_CONFIGS[timeOfDay].color}`}>
                      {TIME_OF_DAY_CONFIGS[timeOfDay].name}
                    </div>
                    <div className={`text-[10px] font-mono font-bold mt-0.5 ${WEATHER_CONFIGS[weather].color}`}>
                      {WEATHER_CONFIGS[weather].name}
                    </div>
                  </div>
                </div>

                <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-saffron via-amber-400 to-orange-600"
                    style={{ width: `${((currentPrahar.index + 1) / BATTLE_PRAHARS.length) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  <div className="bg-stone-900/80 border border-stone-800 rounded-xs p-2">
                    <span className="text-stone-500 uppercase tracking-widest block">Visibility</span>
                    <span className="text-white font-black block mt-0.5">{currentVisibility}%</span>
                  </div>
                  <div className="bg-stone-900/80 border border-stone-800 rounded-xs p-2">
                    <span className="text-stone-500 uppercase tracking-widest block">Accuracy</span>
                    <span className="text-[#ea580c] font-black block mt-0.5">{currentAccuracy}%</span>
                  </div>
                </div>

                <p className="text-[9.5px] text-stone-300 leading-tight font-sans italic bg-stone-900/60 p-2 border border-stone-900 rounded-xs">
                  <span className="text-saffron font-bold">Field cue:</span> {currentPrahar.visibilityHint}
                </p>

                <button
                  type="button"
                  onClick={triggerWeatherTacticCountermeasure}
                  className="w-full py-2 bg-[#ea580c] hover:bg-orange-500 text-stone-950 font-mono text-[9px] font-black uppercase tracking-widest rounded-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
                >
                  ⚔️ EXECUTE COUNTERMEASURE
                </button>
              </div>
            </div>

            {/* AMBIENCE, WEATHER & MILITARY SYNTH CONTROLS */}
            <div id="weather-and-music-council" className="hidden bg-[#121315] border border-stone-800 p-3.5 rounded-sm text-left shadow-lg space-y-3.5 my-4">
              <div className="flex justify-between items-center border-b border-stone-900 pb-2">
                <h4 className="text-[9.5px] font-mono font-black text-saffron uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="h-3 w-3 animate-spin text-saffron" style={{ animationDuration: '6s' }} />
                  BATTLEWEATHER & ATMOSPHERE COUNCIL
                </h4>
                <span className="text-[8px] font-mono font-bold bg-stone-900 px-1.5 py-0.5 rounded-xs text-stone-400">
                  TACTICAL ACCURACY
                </span>
              </div>

              {/* Time of Day Slider Controls */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest block">
                  1. Battle Hour (Time of Day): <span className="text-white font-bold">{TIME_OF_DAY_CONFIGS[timeOfDay].name}</span>
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['dawn', 'noon', 'dusk', 'midnight'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeOfDay(t)}
                      className={`py-1 rounded-xs font-mono text-[9px] font-black uppercase tracking-wider text-center border cursor-pointer transition-all ${
                        timeOfDay === t
                          ? 'bg-saffron text-stone-950 border-saffron shadow-xs scale-[1.03]'
                          : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200 hover:bg-stone-850'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Weather Selector Grid */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest block">
                  2. Dynamic Weather Hazards: <span className="text-white font-bold">{WEATHER_CONFIGS[weather].name}</span>
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['clear', 'rain', 'dust_storm', 'fog'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeather(w)}
                      className={`py-1 rounded-xs font-mono text-[9px] font-black uppercase tracking-wider text-center border cursor-pointer transition-all ${
                        weather === w
                          ? 'bg-[#ea580c] text-stone-100 border-[#ea580c] shadow-xs scale-[1.03]'
                          : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200 hover:bg-stone-850'
                      }`}
                    >
                      {w === 'dust_storm' ? 'dust' : w}
                    </button>
                  ))}
                </div>
                {/* Weather modifier prompt status */}
                <p className="text-[9.5px] text-stone-400 leading-tight font-sans italic bg-stone-900/50 p-1.5 border border-stone-900 rounded-xs mt-1.5">
                  <span className="text-saffron font-bold">Effect:</span> {WEATHER_CONFIGS[weather].desc} Visibility at <span className="text-white font-bold">{currentVisibility}%</span>, Combat Accuracy is <span className="text-[#ea580c] font-black">{currentAccuracy}%</span>.
                </p>
              </div>

              {/* Specialized Weather & Hour Countermeasure Action Trigger */}
              <div className="bg-stone-950 p-3.5 border border-[#ea580c]/25 rounded-xs space-y-2 text-left">
                <span className="text-[8px] font-mono font-black text-[#ea580c] uppercase tracking-widest block">
                  🛡️ ADVANCED ATMOSPHERIC COUNTERMEASURE
                </span>
                
                <p className="text-[10px] text-stone-300 font-sans leading-tight">
                  {weather === 'fog' ? (
                    "💨 ENABLED: Wet Straw Smokescreen (Neutralize foggy snipers & regain +25 Cohesion!)"
                  ) : weather === 'rain' ? (
                    "🗡️ ENABLED: Monkshood Talwar Poison (Coat swords with extracts to bypass rain slips!)"
                  ) : weather === 'dust_storm' ? (
                    "🥁 ENABLED: Dhrupad War Drums (Guidance beats pierce dust storms, restore +30 Cohesion!)"
                  ) : timeOfDay === 'midnight' ? (
                    "🎆 ENABLED: Garmadi Midnight Firecrackers (Panic camel divisions, cut Afghan morale by -25%!)"
                  ) : (
                    "☀️ TACTICAL ASSESSMENT: Skies are currently clear. No active storm countermeasures necessary."
                  )}
                </p>

                <button
                  type="button"
                  onClick={triggerWeatherTacticCountermeasure}
                  className="w-full py-2 bg-[#ea580c] hover:bg-orange-500 text-stone-950 font-mono text-[9px] font-black uppercase tracking-widest rounded-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
                >
                  ⚔️ EXECUTE SPECIAL COUNTERMEASURE
                </button>
              </div>

              {/* Background Music Synthesizer Widget */}
              <div className="border-t border-stone-900 pt-3 flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest block">
                    3. Generative Faction Anthem
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase">100% WebAudio Generated</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleBattleMusic}
                    className={`flex-1 py-1.5 font-mono text-[9px] font-black uppercase tracking-wider rounded-xs border cursor-pointer flex items-center justify-center gap-1.5 transition-all outline-hidden ${
                      isMusicPlaying
                        ? 'bg-emerald-900 hover:bg-emerald-800 text-white border-emerald-500 animate-pulse'
                        : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border-stone-805'
                    }`}
                  >
                    <Music className={`h-3 w-3 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
                    {isMusicPlaying ? 'STOP FACTION HYMN' : 'PLAY GEN-ANTHEM'}
                  </button>

                  {/* Volume Control bar */}
                  <div className="bg-stone-900 border border-stone-800 p-1 rounded-xs flex items-center gap-1 w-20">
                    <Volume2 className="h-3 w-3 text-stone-500" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                      className="w-full accent-saffron h-1 cursor-pointer bg-stone-850"
                    />
                  </div>
                </div>

                <div className="text-[9px] text-stone-400 leading-tight font-sans">
                  🎵 Now playing: <span className="text-saffron font-bold uppercase">{activeFaction === 'maratha' ? "Maratha High-Tension Percussive Tasha" : "Durrani High-Tension Tribal Drone"} Anthem</span>.
                </div>
              </div>
            </div>

            {/* UPGRADE AREA: THE 6 PUBG ACTION GRID */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                  TACTICAL COMBAT MATRIX
                </span>
                {smokeActive && (
                  <span className="text-[9px] px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 font-mono rounded-xs animate-pulse">
                    💨 SMOKE SCREEN DEPLOYED
                  </span>
                )}
              </div>

              {/* DUEL CHALLENGE CARD OVERLAY */}
              <div id="duel-challenge-teaser" className="p-3.5 rounded-xs border-2 border-saffron bg-[#261304] text-left shadow-lg mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[8.5px] font-mono font-black text-saffron uppercase tracking-widest flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-saffron"></span>
                      </span>
                      WAR COUNCIL SPECIAL ASSAULT
                    </h4>
                    <h5 className="text-[13px] font-serif font-black text-white leading-tight uppercase mt-1">
                      CHALLENGE DURRANI SARDAR TO FEUD
                    </h5>
                    <p className="text-[10.5px] text-stone-300 mt-1 leading-snug font-sans">
                      Enter the close-quarters dust rings! Active real-time directional sword dueling with parrying, ripostes, and +10,000 Gold Treasury rewards.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={battlePhase !== 'clash' || showStageResultModal}
                  onClick={() => {
                    setStageDuelsAttempted(prev => prev + 1);
                    setActiveDuelOpponent({
                      name: "Jahan Khan",
                      title: "Grand General of Durrani Vanguard",
                      difficulty: battleDifficulty,
                      viewMode: 'skirmish'
                    });
                  }}
                  className="w-full mt-3 py-2 bg-gradient-to-r from-saffron to-[#9a3412] hover:from-[#f59e0b] hover:to-[#b45308] disabled:opacity-40 text-stone-950 font-mono text-[9px] font-black uppercase tracking-wider border border-[#fed7aa] rounded-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                >
                  ⚔️ ENTER FIRST-PERSON SKIRMISH
                </button>
                <p className="mt-2 text-[9px] text-stone-400 font-sans leading-snug">
                  Fight from the blade-line view: closer camera, tighter reaction windows, and a skirmish HUD instead of the standard duel card.
                </p>
              </div>

              <div id="tactics-bulletin-actions" className="grid grid-cols-2 gap-2">
                
                {/* 1. Rifle Fire Action */}
                <button
                  id="action-rifle-fire"
                  disabled={isReloading || ammoCount <= 0 || battlePhase !== 'clash' || showStageResultModal}
                  onClick={() => handleEnemyHitInCanvas(22, "SWORD LUNGE")}
                  className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-stone-900 to-stone-950 border border-saffron hover:bg-stone-900 rounded-xs transition-colors cursor-pointer group text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-xs bg-[#452814] flex items-center justify-center text-saffron font-bold group-hover:scale-105 transition-transform">
                    ⚔️
                  </div>
                  <div className="flex-1 font-mono text-left">
                    <span className="text-white text-[10px] font-black block uppercase">1. SWORD LUNGE</span>
                    <span className="text-[9px] text-stone-400">High-speed sweep cut</span>
                  </div>
                </button>

                {/* 2. Deploy thick shield defense */}
                <button
                  id="action-smoke-grenade"
                  disabled={smokeActive || battlePhase !== 'clash' || showStageResultModal}
                  onClick={() => executeCombatOperation('smoke')}
                  className="flex items-center gap-3 p-2.5 bg-stone-950 border border-stone-800 hover:border-emerald-500 hover:bg-stone-900 rounded-xs transition-colors cursor-pointer group text-left"
                >
                  <div className="w-8 h-8 rounded-xs bg-stone-900 border border-stone-800 flex items-center justify-center text-emerald-400 font-bold">
                    🛡️
                  </div>
                  <div className="flex-1 font-mono text-left">
                    <span className="text-white text-[10px] font-black block uppercase">2. SHIELD COALITION</span>
                    <span className="text-[9px] text-stone-400">Block coming raids</span>
                  </div>
                </button>

                {/* 3. Brass Siege Artillery */}
                <button
                  id="action-carpet-mortar"
                  disabled={battlePhase !== 'clash' || showStageResultModal}
                  onClick={() => executeCombatOperation('artillery')}
                  className="flex items-center gap-3 p-2.5 bg-stone-950 border border-stone-800 hover:border-[#b45308] hover:bg-stone-900 rounded-xs transition-colors cursor-pointer group text-left"
                >
                  <div className="w-8 h-8 rounded-xs bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-500 font-bold">
                    💣
                  </div>
                  <div className="flex-1 font-mono text-left">
                    <span className="text-white text-[10px] font-black block uppercase">3. BRASS ARTILLERY</span>
                    <span className="text-[9px] text-stone-400">Siege cannon barrage</span>
                  </div>
                </button>

                {/* 4. Medkit heal */}
                <button
                  id="action-medkit"
                  disabled={adrenalineSyringes <= 0 || battlePhase !== 'clash' || showStageResultModal}
                  onClick={() => executeCombatOperation('adrenaline')}
                  className="flex items-center gap-3 p-2.5 bg-stone-950 border border-stone-800 hover:border-blue-500 hover:bg-stone-900 rounded-xs transition-colors cursor-pointer group text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-xs bg-stone-900 border border-stone-800 flex items-center justify-center text-blue-400 font-bold">
                    🍯
                  </div>
                  <div className="flex-1 font-mono text-left font-sans">
                    <span className="text-white text-[10px] font-black block uppercase">4. ELIXIR DRAUGHT ({adrenalineSyringes})</span>
                    <span className="text-[9px] text-stone-400">Heal & restore health</span>
                  </div>
                </button>

                {/* 5. Garmadi explosives */}
                <button
                  id="action-frag-bomb"
                  disabled={fragBombs <= 0 || battlePhase !== 'clash' || showStageResultModal}
                  onClick={() => executeCombatOperation('bomb')}
                  className="flex items-center gap-3 p-2.5 bg-stone-950 border border-stone-800 hover:border-red-500 hover:bg-stone-900 rounded-xs transition-colors cursor-pointer group text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-xs bg-stone-900 border border-stone-800 flex items-center justify-center text-red-500 font-bold">
                    💥
                  </div>
                  <div className="flex-1 font-mono text-left">
                    <span className="text-white text-[10px] font-black block uppercase">5. POWDER GRENADO ({fragBombs})</span>
                    <span className="text-[9px] text-stone-400">Heavy shrapnel burst</span>
                  </div>
                </button>

                {/* 6. Infiltration flank raid */}
                <button
                  id="action-flank-raid"
                  disabled={battlePhase !== 'clash' || showStageResultModal}
                  onClick={() => executeCombatOperation('flank')}
                  className="flex items-center gap-3 p-2.5 bg-stone-950 border border-stone-800 hover:border-amber-400 hover:bg-stone-900 rounded-xs transition-colors cursor-pointer group text-left"
                >
                  <div className="w-8 h-8 rounded-xs bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-500 font-bold">
                    🐎
                  </div>
                  <div className="flex-1 font-mono text-left">
                    <span className="text-white text-[10px] font-black block uppercase">6. CAVALRY CHARGE</span>
                    <span className="text-[9px] text-stone-400">High speed flank attack</span>
                  </div>
                </button>

              </div>
            </div>

            {/* ARMY REINFORCEMENTS & MOBILIZATION MODULE */}
            <div id="army-reinforcements-hud-panel" className="p-4 bg-[#1a120b] border-2 border-[#8B5E3C]/40 rounded-xs space-y-3.5 text-left mb-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#8B5E3C]/20">
                <span className="text-[10px] text-amber-500 font-mono font-black uppercase tracking-widest flex items-center gap-1.5">
                  🛡️ ARMY REINFORCEMENTS
                </span>
                <span className="text-[8px] px-2 py-0.5 bg-yellow-950 text-amber-400 font-mono rounded-xs font-black uppercase">
                  ACTIVE BONUS
                </span>
              </div>
              
              {(() => {
                const campaignGen = localStorage.getItem('panipat_campaign_general') || 'sadashiv';
                const generalDetails = {
                  sadashiv: { bonusName: "Imperial Peshwa Command", unit: "Peshwa Guard Cav", desc: "Balanced stats + heavy iron shields", count: 3 },
                  shamsher: { bonusName: "Shamsher's Cavalry Mobilization", unit: "Heavy Spear Rider", desc: "Elite speed + high critical slashing", count: 4 },
                  parvatibai: { bonusName: "Queen's Sacred Devotion", unit: "Shielded Mawala Guard", desc: "Huge HP + absorb 50% passive *sacred* damage", count: 4 },
                  gopikabai: { bonusName: "Pune Shaniwar Wada Treasury", unit: "Gardi Mercenary", desc: "Fires flintlock carbines at distance", count: 4 },
                }[campaignGen as 'sadashiv'|'shamsher'|'parvatibai'|'gopikabai'] || { bonusName: "Imperial Peshwa Command", unit: "Peshwa Guard Cav", desc: "Balanced stats + heavy iron shields", count: 3 };

                const handleSpawnGeneralCohort = () => {
                  if (battlePhase !== 'clash' || showStageResultModal) return;
                  const currentGold = Number(localStorage.getItem('panipat_campaign_treasury') || '145000');
                  if (currentGold < 3500) {
                    alert("⚠️ TREASURY DEPLETED! Shaniwar Wada has insufficient Gold Mohurs to fund other elite divisions!");
                    return;
                  }
                  
                  // Deduct gold
                  const nextGold = currentGold - 3500;
                  localStorage.setItem('panipat_campaign_treasury', String(nextGold));
                  
                  // Trigger Canvas units injection
                  setSpawnAllyType(generalDetails.unit);
                  setSpawnAllyTrigger(prev => prev + generalDetails.count);
                  setAlliesSummonedCount(prev => prev + generalDetails.count);
                  
                  setLog(prev => [
                    `🛡️ [MOBILIZED COHORT] Expended 3,500 Gold Mohurs. Deployed ${generalDetails.count}x elite ${generalDetails.unit.toUpperCase()} into sector coordinates!`,
                    ...prev.slice(0, 4)
                  ]);
                };

                const handleRecruitRegionalInfantry = () => {
                  if (battlePhase !== 'clash' || showStageResultModal) return;
                  
                  setSpawnAllyType("Mawala Auxiliary Swordsman");
                  setSpawnAllyTrigger(prev => prev + 3);
                  setAlliesSummonedCount(prev => prev + 3);
                  
                  setLog(prev => [
                    `🚩 [MILITIA ARRIVED] Mobilized 3x regional Mawala Auxiliary Swordsmen for the combat line.`,
                    ...prev.slice(0, 4)
                  ]);
                };

                return (
                  <>
                    <div className="space-y-1 text-stone-300">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-white font-serif font-black uppercase text-[10.5px]">{generalDetails.bonusName}</span>
                        <span className="text-emerald-400 font-bold">+{generalDetails.count} Cohorts</span>
                      </div>
                      <p className="text-[10px] text-stone-400 italic font-sans leading-tight">
                        "{generalDetails.desc} deployed instantly under your commander signet."
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Option 1: Militia */}
                      <button
                        type="button"
                        id="btn-recruit-militia"
                        disabled={battlePhase !== 'clash' || showStageResultModal}
                        onClick={handleRecruitRegionalInfantry}
                        className="py-2.5 bg-stone-900 border border-stone-800 hover:border-emerald-500 rounded-xs transition-colors cursor-pointer text-center font-mono disabled:opacity-45"
                      >
                        <span className="text-[9px] text-stone-200 uppercase font-black block">1. REGIONAL MILITIA</span>
                        <span className="text-[8px] text-emerald-400 block uppercase font-bold">FREE REINFORCE</span>
                      </button>

                      {/* Option 2: Core elite */}
                      <button
                        type="button"
                        id="btn-mobilize-elite-mercs"
                        disabled={battlePhase !== 'clash' || showStageResultModal}
                        onClick={handleSpawnGeneralCohort}
                        className="py-2.5 bg-gradient-to-r from-amber-950 to-stone-900 border border-saffron hover:border-amber-400 rounded-xs transition-all cursor-pointer text-center font-mono disabled:opacity-45"
                      >
                        <span className="text-[9px] text-saffron uppercase font-black block">2. PESHWA COHORT</span>
                        <span className="text-[8px] text-stone-300 block">3,500 GOLD MOHURS</span>
                      </button>
                    </div>

                    <div className="flex justify-between text-[8px] font-mono text-stone-500 uppercase border-t border-stone-900 pt-2">
                      <span>Own Recruits: <strong className="text-emerald-400">{alliesSummonedCount}</strong></span>
                      <span>Enemy Recruits: <strong className="text-red-400">{enemiesSummonedCount}</strong></span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* RELOAD AND EQUIPMENT MODULE */}
            <div className="p-4 bg-stone-900/60 border border-stone-850 rounded-xs space-y-4">
              
              {/* Ammunition Reload control */}
              <div className="flex items-center justify-between">
                <div className="text-left font-mono">
                  <span className="text-[8px] text-stone-500 uppercase block">Active stamina focus</span>
                  <span className="text-white font-extrabold text-lg tracking-wide">{ammoCount} / {maxAmmo}</span>
                </div>
                
                <button
                  id="btn-reload-armory"
                  disabled={isReloading || ammoCount === maxAmmo || showStageResultModal}
                  onClick={triggerWeaponReload}
                  className="px-4 py-2 bg-saffron hover:bg-amber-600 disabled:bg-stone-800 text-stone-950 text-[10px] font-black uppercase tracking-widest rounded-xs cursor-pointer transition-colors"
                >
                  {isReloading ? "Gathering..." : "Muster focus"}
                </button>
              </div>

              {/* Survival Tier Gear display */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-left font-sans text-[10px]">
                <div className="flex items-center gap-2">
                  <Shield size={12} className="text-emerald-400" />
                  <div className="font-mono">
                    <span className="text-stone-500 block text-[8px] uppercase">CHAINMAIL TIER</span>
                    <span className="text-white font-serif font-black uppercase">GRADE {armorTier} STEEL</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User size={12} className="text-saffron" />
                  <div className="font-mono">
                    <span className="text-stone-500 block text-[8px] uppercase">SWORD MASTERY</span>
                    <span className="text-white font-serif font-black uppercase">{equippedScope}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* AIR DROP CHEST ALERT CARD */}
            {airdropCargoAvailable && (
              <div id="airdrop-loot-alert-hud" className="flex items-center gap-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xs text-left">
                <span className="text-2xl bounce-slow">🎁</span>
                <div className="flex-1 font-sans text-xs">
                  <h4 className="font-bold text-amber-300 uppercase">🚨 Air cargo drop coordinates spotted!</h4>
                  <p className="text-[10px] text-stone-400 italic">Click the drift parachute drifting in the sky on the canvas, or open package below:</p>
                </div>
                <button
                  id="claim-loot-btn"
                  onClick={handleAirdropLootClaimed}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-[9px] uppercase tracking-wide rounded-xs shrink-0 cursor-pointer"
                >
                  Claim Cache
                </button>
              </div>
            )}

          </div>

          {/* ACTIVE SYSTEM LOG CONSOLE */}
          <div className="mt-6 border-t border-stone-900 pt-4 text-left">
            <h3 className="text-[9px] text-stone-600 font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              <Scroll size={10} className="text-stone-500" /> Battle Log feed
            </h3>
            <div id="battle-maneuver-history" className="space-y-1.5 max-h-36 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {log.map((entry, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1 - idx * 0.18, x: 0 }}
                    key={entry + idx}
                    className="text-[10px] font-mono text-stone-400 flex items-start gap-2 border-l border-stone-850 pl-3 py-0.5"
                  >
                    <span className="text-[8px] text-stone-600 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit' })}]</span>
                    <span className="leading-relaxed">{entry}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>

      {/* WINNER WINNER SAFFRON DINNER SUCCESS MODAL / UDGIR GARDI DEBATE */}
      <AnimatePresence>
        {battlePhase === 'resolution' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] bg-stone-950 flex flex-col items-center justify-center p-4 md:p-10 overflow-y-auto font-sans text-stone-300"
          >
            <div className="absolute inset-0 parchment opacity-15 pointer-events-none" />
            
            {stage === CampaignStage.NIZAM_CAMPAIGN && activeFaction === 'maratha' ? (
              // INTERACTIVE HISTORICAL DEBATE OVER IBRAHIM KHAN GARDI SURRENDER
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 max-w-4xl w-full bg-[#1c120c] border-4 border-[#8B5E3C] p-6 md:p-8 rounded-sm shadow-2xl text-left"
              >
                <div className="absolute inset-1 border border-[#8B5E3C]/30 pointer-events-none" />
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#8B5E3C]/40 pb-4 mb-5">
                  <div>
                    <span className="text-[9px] text-[#eab308] font-mono tracking-[0.25em] uppercase block font-black">
                      HISTORICAL CHRONICLE • OUTCOME OF UDGIR (JANUARY 1760 AD)
                    </span>
                    <h2 className="text-xl md:text-3xl font-serif text-white font-black uppercase mt-1">
                      THE SURRENDER OF IBRAHIM KHAN GARDI
                    </h2>
                  </div>
                  <div className="mt-2 md:mt-0 px-2.5 py-0.5 bg-[#eab308]/15 border border-[#eab308]/30 text-[#eab308] font-mono text-[9px] uppercase tracking-wider rounded-xs self-start">
                    COALITION COUNCIL DEBATE
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-2 mb-5">
                  {[0, 1, 2, 3].map((stepIdx) => (
                    <div 
                      key={stepIdx} 
                      className={`h-1 flex-1 rounded-sm transition-colors duration-300 ${
                        stepIdx <= gardiDebateStep ? 'bg-[#eab308]' : 'bg-stone-800'
                      }`} 
                    />
                  ))}
                </div>

                {/* Main Speakers Arena */}
                <div className="space-y-5">
                  <div className={`p-5 rounded-xs border transition-all duration-300 min-h-[170px] flex flex-col justify-between ${
                    gardiDebateStep === 0 ? 'bg-[#141210] border-stone-850' :
                    gardiDebateStep === 1 ? 'bg-[#0f1d2a] border-sky-950/40' :
                    gardiDebateStep === 2 ? 'bg-[#291313] border-red-950/40' :
                    'bg-[#211610] border-amber-950/40'
                  }`}>
                    <div>
                      {/* Identity Row */}
                      <div className="flex items-center gap-3.5 mb-3.5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner border ${
                          gardiDebateStep === 0 ? 'bg-stone-900 border-stone-800' :
                          gardiDebateStep === 1 ? 'bg-sky-950 border-sky-850 text-sky-400' :
                          gardiDebateStep === 2 ? 'bg-red-950 border-red-850 text-red-500' :
                          'bg-amber-950 border-orange-900 text-saffron'
                        }`}>
                          {gardiDebateStep === 0 ? "📜" :
                           gardiDebateStep === 1 ? "💂‍♂️" :
                           gardiDebateStep === 2 ? "🐎" : "🚩"}
                        </div>

                        <div>
                          <span className={`text-[12px] font-mono uppercase tracking-[0.15em] block font-black ${
                            gardiDebateStep === 0 ? 'text-stone-400' :
                            gardiDebateStep === 1 ? 'text-sky-400' :
                            gardiDebateStep === 2 ? 'text-red-400' : 'text-saffron'
                          }`}>
                            {gardiDebateStep === 0 ? "COUNCIL CHRONICLE" :
                             gardiDebateStep === 1 ? "IBRAHIM KHAN GARDI" :
                             gardiDebateStep === 2 ? "SUBEHDAR MALHAR RAO HOLKAR" : "SADASHIVRAO BHAU"}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono block">
                            {gardiDebateStep === 0 ? "Scene Setup: Camp-site outside Udgir Citadel" :
                             gardiDebateStep === 1 ? "Artillery Commander (Formerly in Nizam's pay)" :
                             gardiDebateStep === 2 ? "Veteran Cavalry Chief of the Holkar Clan" : "Generalissimo of the Southern Maratha Expediton"}
                          </span>
                        </div>
                      </div>

                      {/* Speaking dialogue */}
                      <p className="text-stone-200 text-xs md:text-[13px] leading-relaxed italic font-serif">
                        {gardiDebateStep === 0 && (
                          "Under the smoking, gunpowder-scarred basalt ramparts of Udgir Fort, the forces of the Deccan Nizam lie decisively broken. Cut off from ammunition reserves and deserted by his generals, Ibrahim Khan Gardi — the legendary artillery commander trained in modern Western infantry lines by French general Marquis de Bussy — refuses to retreat. Armed with a parchment of truce, he strides proudly into Sadashivrao Bhau's commander pavilion, kneeling to offer his French officer's rapier in surrender..."
                        )}
                        {gardiDebateStep === 1 && (
                          "« Sadashivrao Bhau, my French-disciplined Gardi artillerymen and bayonet squads stood firm until Salabat Jung hoisted the surrender banner. I yield my sword but not my pride. If the Peshwas choose to pay my men regularly and grant us safe, exclusive corridors of fire on the battlefield — without interference from your speed cavalry horsemen — our heavy brass nine-pounder guns will pulverize the path of Delhi of all Afghan rebels. My cannons do not distinguish by religion, only by the absolute rules of military discipline. »"
                        )}
                        {gardiDebateStep === 2 && (
                          "« Do not swallow this treasonous poison, Bhau! It is light, lightning cavalry strikes — our trusted 'Ganimi Kava' — that conquered Hindusthan from Pune to the Indus! These foreign foot-soldiers march slowly, require thousands of ammunition carts, and will trap us in rigid dirt trenches like ducks. If the swift Afghan riders surround our camp, these sluggish blocks will block our retreat. Why drain Pune's gold on high mercenary pay, when our own horsemen bleed for crumbs? Disarm them! »"
                        )}
                        {gardiDebateStep === 3 && (
                          "« Malharrao, the times of simple horse skirmishes are drawing to a close! Ahmad Shah Durrani brings heavy camel-mounted swivel guns and disciplined Rohilla musketeers who will pierce your horse lines before you even raise a spear. To defeat a modern Afghan coalition, we must command modern European artillery! Ibrahim Khan's heavy-caliber nine-pounder shells are the deadliest weapon in Hindusthan. General, I accept your sword and allegiance. I commission you as our Grand Chief of Artillery! Your disciplined vanguard squares shall lead us North! »"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Historical Significance Box */}
                  <div className="bg-[#100b08] border border-[#8B5E3C]/15 p-4 rounded-xs">
                    <span className="text-[8px] font-mono text-[#A57850] block uppercase tracking-[0.2em] mb-1">
                      Historical Accuracy Insight
                    </span>
                    <p className="text-stone-400 text-[10.5px] leading-relaxed font-sans">
                      {gardiDebateStep === 0 && (
                        "Following the Battle of Udgir in early 1760, Ibrahim Khan Gardi surrendered his elite units to the Maratha Empire. His decision to join the Peshwa's forces drastically altered the tactical doctrine of the Maratha vanguard."
                      )}
                      {gardiDebateStep === 1 && (
                        "Historically, Gardi demanded immense financial autonomy and independent battlefield control. He insisted on fighting in cohesive 'French infantry squares' flanked by his personal heavy brass cannons."
                      )}
                      {gardiDebateStep === 2 && (
                        "Malhar Rao Holkar's warning was heavily prophetic. At Panipat, the Marathas were eventually cornered and trapped in a static, defense-starved perimeter — exactly how Holkar feared they would be under slow infantry reliance."
                      )}
                      {gardiDebateStep === 3 && (
                        "Sadashivrao Bhau's choice to modernize won him early victories and breached Delhi's gates, but his high-tier funding of Gardi's mercenaries caused severe division and jealousy among the traditional Deccani cavalry generals."
                      )}
                    </p>
                  </div>
                </div>

                {/* Dialogue Controls */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-6 pt-4 border-t border-[#8B5E3C]/35">
                  <div className="text-[9px] text-[#A57850] font-mono uppercase tracking-[0.15em] mb-3 sm:mb-0">
                    DIFFERENTIATED TACTICS DELEGATE • {gardiDebateStep + 1} OF 4
                  </div>

                  <div className="flex gap-2 text-stone-900 font-bold">
                    {gardiDebateStep > 0 && (
                      <button
                        onClick={() => setGardiDebateStep(prev => prev - 1)}
                        className="px-3.5 py-1.5 bg-stone-900 border border-stone-800 text-stone-300 font-mono text-xs uppercase rounded-xs cursor-pointer hover:bg-stone-850"
                      >
                        ↩ BACK
                      </button>
                    )}

                    {gardiDebateStep < 3 ? (
                      <button
                        onClick={() => setGardiDebateStep(prev => prev + 1)}
                        className="px-5 py-1.5 bg-gradient-to-r from-saffron to-amber-650 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black font-mono text-[10.5px] uppercase tracking-wider border border-orange-400 rounded-xs cursor-pointer shadow-md"
                      >
                        CONTINUE DEBATE ⏩
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onAdvance();
                          onNavigate(Screen.STRATEGIC_MAP);
                        }}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-black font-mono text-[10.5px] uppercase tracking-[0.08em] border border-emerald-400 rounded-xs cursor-pointer shadow-lg transition-all active:scale-[0.98]"
                      >
                        📜 CONTRACT RATIFIED: COMMENCE PUNE MUSTER
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              // DEFAULT WINNER WINNER SAFFRON DINNER SUCCESS MODAL
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="relative z-10 text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-saffron flex items-center justify-center mx-auto animate-bounce border-4 border-white shadow-2xl">
                  <Award size={48} className="text-stone-950" />
                </div>
                
                <h4 className="text-saffron text-sm font-mono uppercase tracking-[0.8em] font-black pb-2">
                  CIVILIZATION MATCH COMPLETE
                </h4>
                
                <h1 className="text-4xl md:text-7xl font-serif text-white font-black leading-none drop-shadow-2xl">
                  🏆 WINNER WINNER <br />
                  <span className="text-saffron">SAFFRON DINNER !</span>
                </h1>
                
                <p className="text-stone-300 text-sm max-w-xl mx-auto leading-relaxed">
                  "By supreme tactical valor, the battleground was dominated. Our elite squads secured total control of the regional outposts. The campaign advances with absolute glory!"
                </p>

                <div className="h-px w-64 bg-gradient-to-r from-transparent via-saffron to-transparent mx-auto" />
                
                <div className="text-[10px] text-stone-500 font-mono uppercase tracking-widest animate-pulse">
                  Rerouting strategy desk boards in a few seconds...
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-STAGE TRANSITIONAL INDIVIDUAL ROUND MODAL */}
      <AnimatePresence>
        {showStageResultModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1050] bg-stone-950/98 flex flex-col items-center justify-center p-6 text-center font-sans"
          >
            <div className="absolute inset-0 parchment opacity-20 pointer-events-none" />
            <div className="max-w-xl w-full bg-[#1e140f] border-4 border-[#8B5E3C] p-8 shadow-2xl rounded-sm relative animate-zoomIn">
              <div className="absolute inset-1 border border-[#8B5E3C]/40 rounded-xs pointer-events-none" />
              
              <div className="flex justify-center mb-4">
                <span className={`px-3 py-1 text-stone-950 font-black text-[10px] tracking-widest uppercase rounded-xs ${
                  stageOutcomes[currentStageIndex - 1] === 'player' ? 'bg-emerald-400' : 'bg-red-550'
                }`}>
                  STAGE {currentStageIndex} CONCLUDED
                </span>
              </div>

              <h2 className="text-3xl text-white font-serif font-black uppercase tracking-wide">
                {stageOutcomes[currentStageIndex - 1] === 'player' ? "⭐ STAGE VICTORY ⭐" : "💀 STAGE RETREAT 💀"}
              </h2>

              <p className="text-stone-300 text-[11px] italic mt-3 leading-relaxed max-w-sm mx-auto">
                {stageOutcomes[currentStageIndex - 1] === 'player' ? (
                  "\"Our platoons successfully secured the sector, routing the enemy's vanguard divisions with swift and lethal flank strikes!\""
                ) : (
                  "\"Intense enemy fire has overborne our defensive sand dunes. Our vanguard division was compelled to pull back to preserve core strength.\""
                )}
              </p>

              {/* DETAILED POST-BATTLE CHRONICLE (CASUALTIES, HEROICS, REALM IMPACT) */}
              <div className="my-5 space-y-4 text-left">
                
                {/* 1. Casualty Side-by-Side and Timing */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-stone-950/60 border-l-2 border-red-500 rounded-r-sm">
                    <span className="text-[7.5px] text-stone-500 block font-mono font-bold uppercase tracking-widest leading-none">YOUR CASUALTIES</span>
                    <span className="text-xl font-mono text-red-400 font-extrabold mt-1 block">
                      {stagePlayerCasualties.toLocaleString()} Troops
                    </span>
                    <span className="text-[8.5px] text-stone-400 font-sans italic mt-0.5 block">
                      Deceased/Injured
                    </span>
                  </div>

                  <div className="p-3 bg-stone-950/60 border-l-2 border-emerald-500 rounded-r-sm">
                    <span className="text-[7.5px] text-stone-500 block font-mono font-bold uppercase tracking-widest leading-none">AFGHAN CASUALTIES</span>
                    <span className="text-xl font-mono text-emerald-400 font-extrabold mt-1 block">
                      {stageEnemyCasualties.toLocaleString()} Troops
                    </span>
                    <span className="text-[8.5px] text-stone-400 font-sans italic mt-0.5 block">
                      Routed/Neutralized
                    </span>
                  </div>
                </div>

                {/* 2. Heroics & Military Milestones Card */}
                <div className="p-3.5 bg-stone-950/80 border border-[#8B5E3C]/20 rounded-xs">
                  <h4 className="text-[9px] text-[#A57850] font-mono uppercase tracking-widest mb-3 border-b border-stone-900 pb-1.5 font-bold flex items-center gap-1.5">
                    🏅 HEROICS & FIELD MILESTONES ACCOMPLISHED
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-stone-300 font-mono">
                    <div className="flex justify-between border-b border-stone-900 pb-1">
                      <span>⚡ Talwar Hits:</span>
                      <strong className="text-white">{stageSwordStrikes}</strong>
                    </div>
                    <div className="flex justify-between border-b border-stone-900 pb-1">
                      <span>🔥 Specials Cast:</span>
                      <strong className="text-saffron">{stageSpecialsUsed}</strong>
                    </div>
                    <div className="flex justify-between border-b border-stone-900 pb-1">
                      <span>🚩 Allied Spawns:</span>
                      <strong className="text-emerald-400">+{alliesSummonedCount}</strong>
                    </div>
                    <div className="flex justify-between border-b border-stone-900 pb-1">
                      <span>⚔️ Duels Fought:</span>
                      <strong className="text-sky-400">{stageDuelsAttempted}</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Strategic & Realm Consequential Impact card */}
                <div className="p-3.5 bg-[#201004] border border-orange-950 rounded-xs">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[9px] text-saffron uppercase font-mono font-black tracking-widest block">
                      🛡️ CONSEQUENT REALM IMPACT
                    </span>
                  </div>
                  <p className="text-[10.5px] text-stone-200 leading-relaxed font-sans">
                    {(() => {
                      const isMaratha = activeFaction === 'maratha';
                      const winner: 'player' | 'enemy' = stageOutcomes[currentStageIndex - 1] === 'player' ? 'player' : 'enemy';
                      
                      if (winner === 'player') {
                        switch(stage) {
                          case CampaignStage.NIZAM_CAMPAIGN:
                            return isMaratha 
                              ? "SUCCESS! Nizam-ul-Mulk's surrender at Udgir is absolute. Ibrahim Khan Gardi’s elite French-disciplined artillery units have pledged loyalty and immediately joined the Maratha grand army for the Northern defense."
                              : "SUCCESS! You successfully defended Nizam's core Deccan strongholds, securing key trade routes.";
                          case CampaignStage.PUNE:
                            return "SUCCESS! Saved Pune from early tribal looting. Shaniwar Wada estate treasury reserves successfully restocked (+25,000 tribute Gold Mohurs).";
                          case CampaignStage.BURHANPUR:
                            return "SUCCESS! Historical Burhanpur fortress secured! Safeguarded key Tapti river crossing lines, guaranteeing stable supply wagons for the main corps.";
                          case CampaignStage.GWALIOR:
                            return "SUCCESS! Captured strategic Gwalior battlements. Immediate access granted to heavy metal foundry works for upgraded cannon grenado loads (+2 Powder Grenados).";
                          case CampaignStage.DELHI_NEGOTIATIONS:
                            return "SUCCESS! Masterfully split Shuja-ud-Daulah's forces, forcing local Nawab divisions into complete neutrality and isolating Rohilla vanguard bands.";
                          case CampaignStage.SHINDE_STAND:
                            return "SUCCESS! Secured the Yamuna ford coordinates, safely preserving non-combatant supply trains from Ahmad Shah's light horse riders.";
                          case CampaignStage.DELHI_BATTLE:
                            return "SUCCESS! Stormed the Delhi Red Fort defenses. Najib-ud-Daulah’s primary tribal regiments have completely disintegrated.";
                          case CampaignStage.PANIPAT:
                          default:
                            return "EPIC CONVICTION! You rewrote 18th-century Indian history! The Maratha Empire preserves its sovereign crown in Delhi, forever pushing back Ahmad Shah's expansionist campaign!";
                        }
                      } else {
                        switch(stage) {
                          case CampaignStage.NIZAM_CAMPAIGN:
                            return "CRITICAL RECOIL: Nizam's army successfully fortified the Deccan foothills. Ibrahim Khan Gardi’s vanguard corps suffered material setbacks, delaying artillery integration.";
                          case CampaignStage.PUNE:
                            return "TACTICAL RECOIL: Citizens exposed to quick riders. Local campaign funds reduced due to civic rebuilding efforts (-10,000 Gold Mohurs).";
                          case CampaignStage.BURHANPUR:
                            return "SUPPLY CUT: Logistics carts sustained scouting damage along the Tapti river banks. Attrition rates slightly increased.";
                          case CampaignStage.GWALIOR:
                            return "SIEGE FAILED: Rebounds on the metallurgical foundry, delaying upgrades to artillery ammunition.";
                          case CampaignStage.DELHI_NEGOTIATIONS:
                            return "DIPLOMATIC FAILED: Shuja-ud-Daulah joined Najib's coalition, adding fresh Durrani troop volumes for upcoming campaigns.";
                          case CampaignStage.SHINDE_STAND:
                            return "CONVOY EXPOSED: Royal campaign convoy compromised. Attrition rates have spiked.";
                          case CampaignStage.DELHI_BATTLE:
                            return "ROHILLA BREACH: Enemy forces established a choke network over the Yamuna waterways, reinforcing central defenses.";
                          case CampaignStage.PANIPAT:
                          default:
                            return "HISTORICAL FAILURE: The Maratha lines broke on the freezing plateau of Panipat. Ahmad Shah Durrani establishes supreme imperial dominance over Northern India.";
                        }
                      }
                    })()}
                  </p>
                </div>

                {/* 4. Best of 3 current summary score */}
                <div className="p-3 bg-stone-950/80 border border-stone-900 rounded-xs">
                  <h4 className="text-[8px] text-stone-400 uppercase font-mono tracking-widest mb-2.5 text-center font-black">
                    ROUND PROGRESS SCOREBOARD
                  </h4>

                  <div className="grid grid-cols-3 gap-2 text-center my-2">
                    <div className="bg-stone-900/60 p-1.5 border border-stone-850 rounded-xs">
                      <span className="text-[7px] text-stone-500 uppercase block font-mono">Stage 1</span>
                      <span className="text-[10px] font-mono font-black mt-0.5 block">
                        {stageOutcomes[0] === 'player' ? (
                          <span className="text-emerald-400">WIN</span>
                        ) : stageOutcomes[0] === 'enemy' ? (
                          <span className="text-red-400">LOST</span>
                        ) : (
                          <span className="text-stone-600">PEND</span>
                        )}
                      </span>
                    </div>

                    <div className="bg-stone-900/60 p-1.5 border border-stone-850 rounded-xs">
                      <span className="text-[7px] text-stone-500 uppercase block font-mono">Stage 2</span>
                      <span className="text-[10px] font-mono font-black mt-0.5 block">
                        {stageOutcomes[1] === 'player' ? (
                          <span className="text-emerald-400">WIN</span>
                        ) : stageOutcomes[1] === 'enemy' ? (
                          <span className="text-red-400">LOST</span>
                        ) : (
                          <span className="text-stone-600">PEND</span>
                        )}
                      </span>
                    </div>

                    <div className="bg-stone-900/60 p-1.5 border border-stone-850 rounded-xs">
                      <span className="text-[7px] text-stone-500 uppercase block font-mono">Stage 3</span>
                      <span className="text-[10px] font-mono font-black mt-0.5 block">
                        {stageOutcomes[2] === 'player' ? (
                          <span className="text-emerald-400">WIN</span>
                        ) : stageOutcomes[2] === 'enemy' ? (
                          <span className="text-red-400">LOST</span>
                        ) : (
                          <span className="text-stone-600">PEND</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[8.5px] font-mono text-stone-400 pt-1 uppercase">
                    <span>Your Stage Dominance:</span>
                    <span className="text-emerald-400 font-extrabold">{stageOutcomes.filter(s => s === 'player').length} / 2 WINS REQUIRED</span>
                  </div>
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-stone-400 uppercase">
                    <span>Afghan Stage Dominance:</span>
                    <span className="text-red-500 font-extrabold">{stageOutcomes.filter(s => s === 'enemy').length} / 2 WINS REQUIRED</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {stageOutcomes.filter(s => s === 'player').length >= 2 ? (
                  // Player wins Best-Of-Three series
                  <button
                    onClick={() => {
                      setBattlePhase('resolution');
                      setShowStageResultModal(false);
                      setGardiDebateStep(0);
                      if (stage === CampaignStage.NIZAM_CAMPAIGN && activeFaction === 'maratha') {
                        // Gardi Surrender Interactive Debate is triggered.
                        // We do not call onAdvance() yet, as the debate expects NIZAM_CAMPAIGN stage.
                        // We will call onAdvance() when they click the Ratification button at the end of the debate!
                      } else {
                        onAdvance();
                        setTimeout(() => onNavigate(Screen.STRATEGIC_MAP), 7000);
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-mono font-black text-xs uppercase tracking-[0.2em] border border-emerald-300 rounded-xs cursor-pointer shadow-lg transition-transform active:scale-[0.98]"
                  >
                    ⚔️ CLAIM ULTIMATE CAMPAIGN VICTORY
                  </button>
                ) : stageOutcomes.filter(s => s === 'enemy').length >= 2 ? (
                  // Enemy wins Best-Of-Three series
                  <button
                    onClick={() => {
                      setBattlePhase('defeat');
                      setShowStageResultModal(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-red-800 to-stone-900 border border-red-500 text-white font-mono font-black text-xs uppercase tracking-[0.2em] rounded-xs cursor-pointer shadow-lg hover:bg-stone-900 transition-transform active:scale-[0.98]"
                  >
                    💀 WITHDRAW AND REGROUP
                  </button>
                ) : (
                  // Game continues to next stage
                  <button
                    onClick={handleNextStage}
                    className="w-full py-3 bg-gradient-to-r from-saffron to-amber-650 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-mono font-black text-xs uppercase tracking-[0.15em] border border-orange-300 rounded-xs cursor-pointer shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                  >
                    🏁 COMMENCE NEXT BATTLEROUND (STAGE {currentStageIndex + 1})
                  </button>
                )}
                
                <p className="text-[9px] text-[#A57850] font-mono uppercase tracking-widest pt-3 leading-none">
                  Panipat Campaign Sandbox
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SQUAD ELIMINATED DEFEAT MODAL */}
      <AnimatePresence>
        {battlePhase === 'defeat' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] bg-[#1a0808] flex flex-col items-center justify-center text-center p-10 overflow-hidden font-sans"
          >
            <div className="absolute inset-0 bg-[#3a0000]/10 mix-blend-multiply" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-red-900 border border-red-500 rounded-full flex items-center justify-center mx-auto text-white">
                <AlertCircle size={36} />
              </div>

              <h4 className="text-red-500 text-xs font-mono uppercase tracking-widest font-black">
                SQUAD WIPED OUT • ATTRITION EXCEEDED
              </h4>
              
              <h1 className="text-6xl md:text-8xl text-stone-550 font-serif uppercase tracking-tighter font-black leading-none opacity-45">
                DEFEAT
              </h1>

              <p className="text-stone-300 text-xs italic max-w-sm mx-auto">
                "Our defensive lines collapsed in the safe zone. The ammunition depot was overrun by the Afghan heavy division. We must withdraw and regroup at Shaniwar Wada."
              </p>

              <button 
                id="btn-regroup-forces"
                onClick={() => onNavigate(Screen.STRATEGIC_MAP)}
                className="px-10 py-3.5 bg-stone-900 border border-stone-800 text-white font-black uppercase tracking-[0.3em] text-xs hover:border-red-500 transition-all rounded-xs shadow-2xl cursor-pointer"
              >
                Regroup Forces
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORTRESS BREACH & GARDY CAPTURED DIALOGUE MODAL */}
      <AnimatePresence>
        {showBreachDialogueModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-[#0d0706]/98 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto"
          >
            <div className="absolute inset-0 parchment opacity-15 pointer-events-none" />
            
            <div className="max-w-2xl w-full bg-[#f4ebe1] border-8 border-double border-[#8B5E3C] p-6 text-[#2c1d11] shadow-2xl rounded-sm relative max-h-[92vh] overflow-y-auto flex flex-col justify-between">
              <div className="absolute inset-1 border border-[#8B5E3C]/30 rounded-xs pointer-events-none" />
              
              {/* Seals */}
              <div className="absolute top-3 right-4 text-2xl opacity-75 select-none pointer-events-none">
                💮
              </div>
              <div className="absolute top-3 left-4 text-2xl opacity-75 select-none pointer-events-none">
                💮
              </div>

              {activeFaction === 'durrani' ? (
                <>
                  {/* Title Header */}
                  <div className="text-center pb-3 mb-4 border-b-2 border-dashed border-[#8B5E3C]/40">
                    <p className="text-[10px] uppercase tracking-widest font-mono text-[#8B5E3C] font-black">
                      HISTORICAL TRIUMPH INTERLUDE
                    </p>
                    <h1 className="text-xl md:text-2xl font-serif font-black uppercase text-[#4c1d12] tracking-tight mt-1">
                      🔓 The Subjugation of Kabul Frontier
                    </h1>
                    <p className="text-xs font-mono text-[#5c3e21] mt-1 font-bold">
                      📍 Kabul Outposts, Hindu Kush Foothills • Jan 1759 AD
                    </p>
                  </div>

                  {/* Battlefield Context Narrative Banner */}
                  <div className="mb-4 bg-[#e8dac7]/75 p-3 rounded border border-[#8B5E3C]/20 shadow-xs italic text-xs leading-relaxed text-[#453221] font-serif">
                    "The mountain dust is thick with gunpowder smoke as the stout stone gates of the rebellious hill fort crumble under heavy Durrani artillery bombardment. Defeated and disarmed, the chieftain of the mountain clans is brought in chains before the Pavilion of Ahmad Shah Durrani, the King of Afghanistan, to answer for his defiance..."
                  </div>

                  {/* Dialogue Transcript List */}
                  <div className="space-y-3.5 mb-5 select-none max-h-[38vh] overflow-y-auto pr-1">
                    {/* 1. REBEL KHAN */}
                    <div className="bg-sky-50/90 p-2.5 rounded border border-sky-300/50 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1 animate-pulse">
                        <span className="text-[10px] font-mono uppercase bg-sky-800 text-white px-2 py-0.5 rounded-full font-black">
                          ⛰️ Rebel Pashtun Khan
                        </span>
                        <span className="text-[9px] text-sky-850 font-bold font-mono">Vanquished Frontier Chieftain</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#1e293b] font-serif font-semibold pl-1">
                        "Ahmad Shah, your royal archers and heavy musketeers have laid waste to our watchtowers... My tribesmen fought from the cliffs, but we could not withstand your camel-mounted swivel guns. If you execute me, our clans will nurse a blood feud for centuries!"
                      </p>
                    </div>

                    {/* 2. AHMAD SHAH DURRANI */}
                    <div className="bg-amber-50/90 p-2.5 rounded border border-amber-350/50 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono uppercase bg-orange-700 text-white px-2 py-0.5 rounded-full font-black">
                          👑 Ahmad Shah Durrani
                        </span>
                        <span className="text-[9px] text-orange-850 font-bold font-mono">The King of Afghanistan</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#2c1d11] font-serif font-semibold pl-1">
                        "Chieftain, I did not cross the Hindu Kush to slaughter my own blood. I march east to rescue the state of Delhi and secure our borders. I do not seek a blood feud; I seek your blades. Kneel, swear the sacred oath upon the Qur'an, and ride with me to the plains of Hindustan!"
                      </p>
                    </div>

                    {/* 3. SHAH WALI KHAN */}
                    <div className="bg-red-50/95 p-2.5 rounded border border-red-300/60 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono uppercase bg-red-700 text-white px-2 py-0.5 rounded-full font-black">
                          ⚔️ Wazir Shah Wali Khan
                        </span>
                        <span className="text-[9px] text-red-900 font-bold font-mono">Grand Vizier of Kabul</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#451a03] font-serif italic pl-1 font-semibold">
                        "My King, these wild clansmen have pillaged royal merchant caravans for years! They are unpredictable and undisciplined. To give them weapons and gold is a heavy gamble—they may flee when the Peshwa's French artillery line opens fire!"
                      </p>
                    </div>

                    {/* 4. REBEL KHAN OATH */}
                    <div className="bg-teal-50/90 p-2.5 rounded border border-teal-300/50 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono uppercase bg-teal-800 text-white px-2 py-0.5 rounded-full font-black">
                          ⛰️ Rebel Pashtun Khan
                        </span>
                        <span className="text-[9px] text-teal-850 font-bold font-mono">Oath of Tribal Fealty</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#115e59] font-serif font-medium pl-1 italic">
                        "Wazir Shah Wali, watch your tongue! When the Durrani King shows mercy, a Pashtun never breaks his pledged word. Ahmad Shah, you have spared our homes and recognized our courage. My 5,000 frontier horsemen are yours! We shall ride with you through the Khyber Pass and bleed the Maratha lines to the dust!"
                      </p>
                    </div>
                  </div>

                  {/* Footnote */}
                  <div className="text-[10px] text-[#8B5E3C] font-mono leading-tight mb-5 border-t border-[#8B5E3C]/20 pt-2 flex items-center justify-between font-bold">
                    <span>🛡️ TRIBAL FEALTY RECORDED: 5,000 Pashtun Hill Riders integrated into Durrani Army!</span>
                    <span>⚡ AMMO RESTOCK: Mountain Archers and Camel Gunners active (+100% Morale Damage)</span>
                  </div>

                  {/* Action Button */}
                  <button
                    id="conclude-breach-dialogue-btn"
                    onClick={() => {
                      setShowBreachDialogueModal(false);
                      setFortWallIntegrity(0);
                      setAmmoCount(maxAmmo);
                      setLog(prev => [
                        "⚡ PASHTUN HILL RIDERS RECRUITED! 5,000 frontier horsemen integrated into your host!",
                        "🔥 Ahmad Shah Durrani accepts the tribal oath: 'Welcome into the sovereign vanguard!'",
                        ...prev.slice(0, 3)
                      ]);
                    }}
                    className="w-full py-3.5 bg-[#4c1d12] hover:bg-[#32120a] text-[#f4ebe1] hover:text-white font-serif font-bold uppercase tracking-widest text-xs rounded shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] border border-orange-200/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    ⚔️ RECRUIT FRONTIER CAVALRY & SECURE KABUL
                  </button>
                </>
              ) : (
                <>
                  {/* Title Header */}
                  <div className="text-center pb-3 mb-4 border-b-2 border-dashed border-[#8B5E3C]/40">
                    <p className="text-[10px] uppercase tracking-widest font-mono text-[#8B5E3C] font-black">
                      HISTORICAL TRIUMPH INTERLUDE
                    </p>
                    <h1 className="text-xl md:text-2xl font-serif font-black uppercase text-[#4c1d12] tracking-tight mt-1">
                      🔓 The Breach of Udgir Fortress
                    </h1>
                    <p className="text-xs font-mono text-[#5c3e21] mt-1 font-bold">
                      📍 Deccan Plateau Campaign Range • Jan 1760 AD
                    </p>
                  </div>

                  {/* Battlefield Context Narrative Banner */}
                  <div className="mb-4 bg-[#e8dac7]/75 p-3 rounded border border-[#8B5E3C]/20 shadow-xs italic text-xs leading-relaxed text-[#453221] font-serif">
                    "The air is thick with black powder smoke as the basalt fortress walls of Udgir crumble. Ibrahim Khan Gardi’s French-trained artillery battalions have fought to the last shell but have been overrun by the Maratha wave. Handed over as a prisoner, the proud artillery master is brought before the Maratha high command, where his genius ignites a fierce debate between the generals..."
                  </div>

                  {/* Dialogue Transcript List */}
                  <div className="space-y-3.5 mb-5 select-none max-h-[38vh] overflow-y-auto pr-1">
                    {/* 1. IBRAHIM GARDI */}
                    <div className="bg-sky-50/90 p-2.5 rounded border border-sky-300/50 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1 animate-pulse">
                        <span className="text-[10px] font-mono uppercase bg-sky-800 text-white px-2 py-0.5 rounded-full font-black">
                          💂 General Ibrahim Khan Gardi
                        </span>
                        <span className="text-[9px] text-sky-850 font-bold font-mono">Vanquished Nizam Artillery General</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#1e293b] font-serif font-semibold pl-1">
                        "My nine-pounders are silent, and my ammunition chests empty... General Bhau, your Mawalas fought like lions to storm the breach. I yield my sword to you. Shoot me if you must, but do not insult the discipline of my Gardi gunners!"
                      </p>
                    </div>

                    {/* 2. SADASHIVRAO BHAU */}
                    <div className="bg-amber-50/90 p-2.5 rounded border border-amber-350/50 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono uppercase bg-orange-700 text-white px-2 py-0.5 rounded-full font-black">
                          👑 Sadashivrao Bhau
                        </span>
                        <span className="text-[9px] text-orange-850 font-bold font-mono">Commander-in-Chief</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#2c1d11] font-serif font-semibold pl-1">
                        "Shoot you? Never! Your French-style maneuvers and disciplined salvos have shattered these basalt walls. Ibrahim, the Maratha Empire does not execute geniuses. I invite you to join my grand campaign—enter our service and command the entire Peshwa Artillery branch!"
                      </p>
                    </div>

                    {/* 3. RAGHUNATHRAO */}
                    <div className="bg-red-50/95 p-2.5 rounded border border-red-300/60 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono uppercase bg-red-700 text-white px-2 py-0.5 rounded-full font-black">
                          ⚔️ Raghunathrao Peshwa
                        </span>
                        <span className="text-[9px] text-red-900 font-bold font-mono">Maratha Traditionalist Voice</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#451a03] font-serif italic pl-1 font-semibold">
                        "Are you mad, Bhau?! You trust this foreign mercenary and his slow, heavy muskets? Our speed is our strength! The traditional Maratha light cavalry has won us empires from Pune to Attock. Enlisting him will dilute our pride, weaken our mobility, and invite betrayal!"
                      </p>
                    </div>

                    {/* 4. IBRAHIM GARDI ACCEPTANCE */}
                    <div className="bg-teal-50/90 p-2.5 rounded border border-teal-300/50 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono uppercase bg-teal-800 text-white px-2 py-0.5 rounded-full font-black">
                          💂 General Ibrahim Khan Gardi
                        </span>
                        <span className="text-[9px] text-teal-800 font-bold font-mono">Oath of Loyalty</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#115e59] font-serif font-medium pl-1 italic">
                        "Hear me, Raghunathrao! I will prove my code of honor. General Bhau, for recognizing my squad's worth, I offer my life. My guns will blaze for Pune! We shall fight for you to the last drop of our blood, even if we are surrounded by a sea of enemies on the plains of Panipat!"
                      </p>
                    </div>
                  </div>

                  {/* Footnote */}
                  <div className="text-[10px] text-[#8B5E3C] font-mono leading-tight mb-5 border-t border-[#8B5E3C]/20 pt-2 flex items-center justify-between font-bold">
                    <span>🛡️ RECRUITMENT CONFIRMED: Gardi Artillery integrated into Maratha Army!</span>
                    <span>⚡ AMMO RESTOCK: French Artillery active (+100% Morale Damage)</span>
                  </div>

                  {/* Action Button */}
                  <button
                    id="conclude-breach-dialogue-btn"
                    onClick={() => {
                      setShowBreachDialogueModal(false);
                      setFortWallIntegrity(0);
                      setAmmoCount(maxAmmo);
                      setLog(prev => [
                        "⚡ IBRAHIM KHAN GARDI RECRUITED! French artillery integrated into your armies!",
                        "🔥 Sadashivrao Bhau overrides opposition and orders: 'Gardi gunners, take position!'",
                        ...prev.slice(0, 3)
                      ]);
                    }}
                    className="w-full py-3.5 bg-[#4c1d12] hover:bg-[#32120a] text-[#f4ebe1] hover:text-white font-serif font-bold uppercase tracking-widest text-xs rounded shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] border border-orange-200/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    ⚔️ RECRUIT GARDY GUNNERS & SECURE THE DECCAN
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROYAL COMMANDER BANNER CODEX WIDGET */}
      <RoyalBanner />

      {/* DECORATIVE OVERLAYS */}
      <div className="absolute inset-0 pointer-events-none border-[1rem] border-stone-950/20 z-50 mix-blend-overlay animate-pulse" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.85)] z-40" />
    </div>
  );
};
