import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gavel, 
  Handshake, 
  Scroll, 
  Users, 
  MessageSquare, 
  ShieldAlert, 
  Globe, 
  Coins, 
  Package, 
  X, 
  RefreshCw, 
  Eye, 
  ShieldCheck, 
  Search, 
  AlertCircle, 
  Sparkles, 
  CheckCircle, 
  Flame,
  Scale,
  Compass,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Screen, Faction } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';
import { FallbackImage } from '../components/FallbackImage';

import { CavalryChargeSimulator } from '../components/CavalryChargeSimulator';
import { ArtilleryCalibration } from '../components/ArtilleryCalibration';
import { CampSupplyTycoon } from '../components/CampSupplyTycoon';
import { CoalitionDiplomacyDarbar } from '../components/CoalitionDiplomacyDarbar';
import { AIDebateRoom } from '../components/AIDebateRoom';
import { MultiplayerLobbySimulator } from '../components/MultiplayerLobbySimulator';

import avatarSurajMal from '../assets/images/maharaja_suraj_mal_1780981012497.png';
import avatarShujaUdDaula from '../assets/images/nawab_shuja_ud_daula_1780981037889.png';
import avatarMarathaTreasurer from '../assets/images/maratha_treasurer_raghunathrao_1780981073863.png';
import avatarMalharraoHolkar from '../assets/images/malharrao_holkar_1780981055883.png';

const INITIAL_FACTIONS: Faction[] = [
  {
    id: '1',
    name: 'Durrani Empire',
    relation: 'Hostile',
    trust: 0,
    leader: 'Ahmad Shah Abdali',
    description: 'The primary adversary. A master of horse warfare and innovative camel-driven zamburaks.'
  },
  {
    id: '2',
    name: 'Rohilla Afghans',
    relation: 'Hostile',
    trust: 10,
    leader: 'Najib-ud-Daula',
    description: 'Local allies of the Durrani, bitter rivals of the Maratha expansion in North Hindusthan.'
  },
  {
    id: '3',
    name: 'The Jats',
    relation: 'Neutral',
    trust: 40,
    leader: 'Suraj Mal of Bharatpur',
    description: 'Powerful regional power. Their support is vital to secure the Yamuna supply lines.'
  },
  {
    id: '4',
    name: 'Awadh Province',
    relation: 'Wary',
    trust: 20,
    leader: 'Shuja-ud-Daula',
    description: 'The Nawab of Awadh, currently leaning towards the Afghan military coalition.'
  }
];

// --- 4 Detailed Campaign Scenarios ---
interface DecisionScenario {
  id: string;
  title: string;
  speaker: string;
  avatar: string;
  dilemma: string;
  resolved: boolean;
  choices: {
    label: string;
    consequence: string;
    actionResult: string;
    effects: {
      gold: number;
      provisions: number;
      trustChange: { [key: string]: number };
      morale: number;
    }
  }[];
}

const HISTORICAL_SCENARIOS: DecisionScenario[] = [
  {
    id: 'scen_1',
    title: 'Suraj Mal\'s Departure (Palace Treasures)',
    speaker: 'Maharaja Suraj Mal of Bharatpur',
    avatar: avatarSurajMal,
    dilemma: 'The Maratha host has looted Delhi\'s silver roof and royal shrines to pay the unpaid auxiliary forces. Maharaja Suraj Mal is highly insulted by this disrespect to imperial shrines, warning that he will withdraw his Jat contingents from the coalition unless absolute royal sanctity is maintained.',
    resolved: false,
    choices: [
      {
        label: 'Enforce Rigorous Holy Protection',
        consequence: 'Yield the looted silver, return the treasures to shrines, and pay soldiers from central Pune funds.',
        actionResult: 'You gain Suraj Mal\'s profound trust as a protector of covenants, but your treasury collapses.',
        effects: {
          gold: -35000,
          provisions: 80,
          trustChange: { '3': 35, '4': 10 },
          morale: 15
        }
      },
      {
        label: 'Allow Plundering for Troop War Pay',
        consequence: 'Prioritize instant cash reserves to quell mercenary mutinies, letting the Jat king depart in anger.',
        actionResult: 'Suraj Mal withdraws his armies, isolating your rear supply lines, though your treasury is reinforced.',
        effects: {
          gold: 50000,
          provisions: -120,
          trustChange: { '3': -35, '4': -10 },
          morale: -10
        }
      }
    ]
  },
  {
    id: 'scen_2',
    title: 'Nawab of Awadh\'s Shadow Treaty',
    speaker: 'Nawab Shuja-ud-Daula',
    avatar: avatarShujaUdDaula,
    dilemma: 'Enemy envoy Najib-ud-Daula is heavily whispering to Awadh\'s court to join the Durrani siege. Shuja-ud-Daula requests a binding parchment from the Peshwa, promising exclusive post-war governorship over Delhi, to keep his heavy heavy cavalry out of the Afghan hands.',
    resolved: false,
    choices: [
      {
        label: 'Suture the Secret Governorship Pact',
        consequence: 'Scribble the binding agreement, guaranteeing them sovereignty of Delhi and sending rich ivory gifts.',
        actionResult: 'Awadh rejects the Durrani alliances and stands neutral-wary, but conservative Maratha chief barons feel alienated.',
        effects: {
          gold: -20000,
          provisions: 0,
          trustChange: { '4': 40, '3': 5 },
          morale: -5
        }
      },
      {
        label: 'Issue Direct Sovereign Ultimatum',
        consequence: 'Reject any post-war governance deals. Threaten Awadh\'s border settlements with Ibrahim Gardi\'s cannons.',
        actionResult: 'Shuja is intimidated but highly hostile, shifting his support towards Abdali\'s river-crossing plans.',
        effects: {
          gold: 0,
          provisions: -50,
          trustChange: { '4': -30, '2': -10 },
          morale: 10
        }
      }
    ]
  },
  {
    id: 'scen_3',
    title: 'The Bankers\' Credit Boycott',
    speaker: 'Raghunathrao Finance Secretary',
    avatar: avatarMarathaTreasurer,
    dilemma: 'The Southern moneylenders refuse further credit to the march, unless we partition the revenue rights (Jagirs) of the fertile Northern Ganga rivers directly to them as collateral. This would heavily tax local populations.',
    resolved: false,
    choices: [
      {
        label: 'Mortgage the Northern River Lands',
        consequence: 'Cede revenue taxation rights to the bankers for immediate gold Mohurs.',
        actionResult: 'Instant gold reserves arrive, but heavy peasant tax farming leads to severe grain hoarding and starvation.',
        effects: {
          gold: 60000,
          provisions: -160,
          trustChange: { '3': -20, '4': -15 },
          morale: 5
        }
      },
      {
        label: 'Seize Coinage from Barons & Shrines',
        consequence: 'Reject the bankers. Draft emergency decrees to conscript ready coin from provincial barons by force.',
        actionResult: 'Treasury gains substantial backup coin, but local auxiliary chiefs lock their granaries, causing deep relationship strain.',
        effects: {
          gold: 30000,
          provisions: 50,
          trustChange: { '3': -25, '4': -25 },
          morale: -15
        }
      }
    ]
  },
  {
    id: 'scen_4',
    title: 'Holkar\'s Cavalry Guerrilla Split',
    speaker: 'Subedar Malharrao Holkar',
    avatar: avatarMalharraoHolkar,
    dilemma: 'Malharrao Holkar argues that the Grand Army must travel fast, abandoning heavy artillery carts to pursue the nimble "Ganimi Kava" guerrilla horse tactic. Ibrahim Khan Gardi rejects this, arguing that without modern flintlock guards and siege guns, the infantry will be sliced in flat plains.',
    resolved: false,
    choices: [
      {
        label: 'Endorse Holkar\'s Skirmish Strategy',
        consequence: 'Disperse the heavy guns, keep the army light, and rely on constant river bank raids.',
        actionResult: 'Increases light cavalry mobility and speed of reinforcements, but forfeits Gardi\'s main cannon protection.',
        effects: {
          gold: 15000,
          provisions: -20,
          trustChange: { '3': 15 },
          morale: 10
        }
      },
      {
        label: 'Authorize Gardi\'s Heavy Gun Spine',
        consequence: 'Anchor the army behind heavy brass cannon lines and European-drilled square formations.',
        actionResult: 'Your infantry gains absolute defensive dominance in flat field battles, but requires costly, sluggish supply caravans.',
        effects: {
          gold: -15000,
          provisions: 120,
          trustChange: { '4': 10 },
          morale: 15
        }
      }
    ]
  },
  {
    id: 'scen_5',
    title: 'Gopikabai’s Pune Directives (Grand Dynasty)',
    speaker: 'Gopikabai, Regent Peshwin of Shaniwar Wada',
    avatar: 'https://images.unsplash.com/photo-1543157148-f68f2d47a1f1?q=80&w=1500&auto=format&fit=crop',
    dilemma: 'Gopikabai watches the campaign from Shaniwar Wada Palace with an iron will. She sends an imperial messenger route with a severe command ledger: Pune will stop releasing emergency golden Mohur funding unless the heir Vishwasrao is formally appointed as the absolute representative for all regional peace councils. Strategic generals Malharrao Holkar and Jankoji Scindia warn that this dynastic control disrespects their veteran authority.',
    resolved: false,
    choices: [
      {
        label: 'Submit to Gopikabai’s Grand Sovereign Will',
        consequence: 'Elevate Vishwasrao’s nominal civil authority and formalize Gopikabai’s Pune administrative command.',
        actionResult: 'Gopikabai releases massive emergency gold chests (50,000 Mohurs) to pay troops, though military sirdars grow cold.',
        effects: {
          gold: 50000,
          provisions: 0,
          trustChange: { '3': -15, '4': -10 },
          morale: 10
        }
      },
      {
        label: 'Maintain De-Facto Cabinet Commands',
        consequence: 'State respectfully that battlefield decisions must remain solely with Sadashivrao Bhau and the veteran generals.',
        actionResult: 'You gain deep political trust among the battle-weary battlefield sirdars, but Gopikabai freezes capital funding channels.',
        effects: {
          gold: -25000,
          provisions: 30,
          trustChange: { '3': 25, '4': 20 },
          morale: -10
        }
      }
    ]
  },
  {
    id: 'scen_6',
    title: 'Parvatibai’s Sacred Camp Rations',
    speaker: 'Parvatibai, Camp Pillar of the Grand Horde',
    avatar: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=2070&auto=format&fit=crop',
    dilemma: 'In the freezing, snow-bitten encampments of Panipat, food and firewood are almost exhausted. Over 50,000 non-combatant pilgrims, including women and children, are starving in the cold. Queen Parvatibai arrives before the War Council. She demands that the military heavy grain reserves be released immediately to feed the families, stating that an army that starves its women loses the grace of the gods.',
    resolved: false,
    choices: [
      {
        label: 'Release Heavy Food Reserves to Pilgrims',
        consequence: 'Open the auxiliary grain storage to the camps, providing nourishing food to the non-combatant families.',
        actionResult: 'You experience a profound, miraculous surge in campaign morale, and the pilgrims pray for victory, but military rations are dangerously low.',
        effects: {
          gold: -10000,
          provisions: -160,
          trustChange: { '3': 20, '4': 10 },
          morale: 40
        }
      },
      {
        label: 'Prioritize Battle Regiments and Horses',
        consequence: 'Lock the granaries for the exclusive use of Ibrahim Gardi’s artillery footmen and the heavy line horses.',
        actionResult: 'Saves your battle stamina and preserves troop supplies, but triggers intense grief, sorrow, and desertion among camp followers.',
        effects: {
          gold: 0,
          provisions: 100,
          trustChange: { '3': -25, '4': -20 },
          morale: -25
        }
      }
    ]
  },
  {
    id: 'scen_7',
    title: 'Maharani Kishori’s Humanitarian Sanctuary',
    speaker: 'Maharani Kishori, Empress of Bharatpur',
    avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1500&auto=format&fit=crop',
    dilemma: 'The Jat kingdom holds the mighty fortresses of Bharatpur and Deeg near our rear lines. While Suraj Mal feels cautious about active battle, Maharani Kishori sends word: she has opened state granaries to feed our foraging units and offers a network of humanitarian medical sanctuaries for our sick, provided we sign a covenant of mutual defense.',
    resolved: false,
    choices: [
      {
        label: 'Accept the Queen’s Sanctuary Covenant',
        consequence: 'Sign the mutual defense pact and coordinate supply drops with Bharatpur.',
        actionResult: 'Bharatpur becomes a thriving logistical sanctuary, restoring large amounts of provisions and wounded troop counts.',
        effects: {
          gold: -15000,
          provisions: 180,
          trustChange: { '3': 40, '4': 20 },
          morale: 15
        }
      },
      {
        label: 'Maintain Independent War Footing',
        consequence: 'Decline regional military defense treaties to keep your campaign priorities entirely flexible.',
        actionResult: 'Avoid defensive regional commitments, but your supply line is limited to what you can forage under Afghan sniper fire.',
        effects: {
          gold: 10000,
          provisions: -85,
          trustChange: { '3': -15, '4': -5 },
          morale: -5
        }
      }
    ]
  }
];

// --- Counter Intelligence: Spy suspect structures ---
interface SpySuspect {
  name: string;
  role: string;
  statement: string;
  belongings: string[];
  weakness: string;
  isSpy: boolean;
}

interface SpyCase {
  title: string;
  incident: string;
  reward: string;
  suspects: SpySuspect[];
}

const SPY_CASES_DATABASE: SpyCase[] = [
  {
    title: 'Sabotage of the Rice Sacks',
    incident: 'A shadow sentinel spotted a hooded custom hand mixing a white phosphorus compound within the rear ration storages of our primary infantry divisions.',
    reward: '+120 Grain Provisions, avoiding morale rot.',
    suspects: [
      {
        name: 'Gulam Ali',
        role: 'Camp Assistant Cook',
        statement: '"I was only sweeping up charcoal behind the flour bags, master. I am a native of Gwalior, loyal to the Peshwa\'s salt. Why would I poison my own kitchen?"',
        belongings: ['Saffron coloring bulb', 'Gwalior salt jar', 'Peshwa military pass slip'],
        weakness: 'Claims to have never traveled north, but carrying a recent Lucknow marketplace merchant token inside his waistcoat.',
        isSpy: false
      },
      {
        name: 'Vishwanath Deshpande',
        role: 'Auxiliary Guard recruit',
        statement: '"The cook was near the rear door with a heavy goat-hide pouch, and when I shouted my guard call, he dropped this strange white powder. I intercepted him right away!"',
        belongings: ['Polished Deccan dagger', '30 Rohilla Afghan silver dinars', 'Hidden poison recipe in Persian'],
        weakness: 'He attempts to frame the cook, but holds a leather pouch containing silver coins freshly minted by Najib-ud-Daula\'s mint in Najibabad.',
        isSpy: true
      },
      {
        name: 'Jagtap Singh',
        role: 'Camel caravan driver',
        statement: '"I was resting near my camel saddle-bags when the shouting started. I saw old Gulam sweeping, nothing suspicious before the alarm."',
        belongings: ['Betel leaf chewing box', 'Deccan copper paisas', 'Saddle whip'],
        weakness: 'An old, simple driver with regular camp items and zero foreign currency.',
        isSpy: false
      }
    ]
  },
  {
    title: 'The Imperial Cipher Leak',
    incident: 'A leather envelope containing secret troop division layouts and plans to cross the Yamuna river was found dropped inside the commander\'s personal planning circle.',
    reward: '+30,000 Gold Mohurs, blocking leak vectors.',
    suspects: [
      {
        name: 'Haripet Phadke',
        role: 'Junior Scribe',
        statement: '"I was working on the ledger records of the vanguard cavalry all night. The ink lines on my hands prove my constant writing!"',
        belongings: ['Organic red inkpot', 'Stylus pens', 'Peshwa seal wax'],
        weakness: 'Genuine scribe with verifiable Pune ledger records. Only holds official administrative items.',
        isSpy: false
      },
      {
        name: 'Salim Rohilla',
        role: 'Hired Scout Courier',
        statement: '"I just came back from scouting the Bundelkhand routes. The saddle pouch fell when my horse slipped on mud, I had no look inside!"',
        belongings: ['Afghan leather map of rivers', 'Pashto tactical message slips', 'Scented gold-plated vial'],
        weakness: 'Carrying a detailed Durrani river-crossing layout, and his scent matches the rare Shirazi musk discovered near the commander’s strategy table.',
        isSpy: true
      },
      {
        name: 'Sadashiv Bhatt',
        role: 'Campaign Archivist',
        statement: '"Salim arrived late. He was breathing heavily, and I saw him lingering near the planning chest while Haripet was fetching more ink."',
        belongings: ['Reading spectacles', 'Old paper rolls', 'Prayer beads'],
        weakness: 'Observant archivist who witnessed Salim\'s infiltration but was too afraid to lock him up.',
        isSpy: false
      }
    ]
  }
];

import { CampaignStage } from '../types';

export const WarCouncil: React.FC<{ 
  campaignStage: CampaignStage;
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ campaignStage, onNavigate, isMenuOpen, onToggleMenu, onMenuClose, onHelp, onSettings }) => {
  // --- Game Global states --
  const [factions, setFactions] = useState<Faction[]>(() => {
    const saved = localStorage.getItem('panipat_campaign_factions');
    return saved ? JSON.parse(saved) : INITIAL_FACTIONS;
  });
  const [activeFactionsLog, setActiveFactionsLog] = useState<{ [key: string]: string[] }>(() => {
    const saved = localStorage.getItem('panipat_campaign_factions_log');
    return saved ? JSON.parse(saved) : {
      '1': ["Ahmad Shah Durrani: 'No Maratha standards shall fly on the banks of Indus while my host breathes.'"],
      '2': ["Najib-ud-Daula: 'The Marathas overreached. The Rohillas will avenge their lost pride.'"],
      '3': ["Suraj Mal: 'The Jats seek peace, but we recognize the shadow over Hindusthan. What represents our alliance?'"],
      '4': ["Shuja-ud-Daula: 'My loyalty belongs to the throne. Prove that you can defeat the Abdali, and we may discuss contracts.'"]
    };
  });

  const [treasuryMohurs, setTreasuryMohurs] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_treasury');
    if (saved) return Number(saved);
    const activeGeneral = localStorage.getItem('panipat_campaign_general');
    return activeGeneral === 'gopikabai' ? 185000 : 145000;
  });
  const [provisions, setProvisions] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_provisions');
    if (saved) return Number(saved);
    const activeGeneral = localStorage.getItem('panipat_campaign_general');
    return activeGeneral === 'parvatibai' ? 500 : 380;
  });
  const [morale, setMorale] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_morale');
    return saved ? Number(saved) : 75;
  });
  const [rationsStance, setRationsStance] = useState<'Standard' | 'Abundant' | 'Rationed'>(() => {
    return (localStorage.getItem('panipat_campaign_rations_stance') as 'Standard' | 'Abundant' | 'Rationed') || 'Standard';
  });

  useEffect(() => {
    localStorage.setItem('panipat_campaign_factions', JSON.stringify(factions));
  }, [factions]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_factions_log', JSON.stringify(activeFactionsLog));
  }, [activeFactionsLog]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_treasury', treasuryMohurs.toString());
  }, [treasuryMohurs]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_provisions', provisions.toString());
  }, [provisions]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_morale', morale.toString());
  }, [morale]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_rations_stance', rationsStance);
  }, [rationsStance]);

  // --- Layout Active Tab ---
  // 'diplomacy' | 'scenarios' | 'provisions' | 'espionage' | 'simulations' | 'debates' | 'multiplayer'
  const [activeTab, setActiveTab] = useState<'diplomacy' | 'scenarios' | 'provisions' | 'espionage' | 'simulations' | 'debates' | 'multiplayer'>('diplomacy');

  // --- Active Simulation Modals ---
  const [activeSimulation, setActiveSimulation] = useState<'cavalry' | 'artillery' | 'tycoon' | 'assembly' | null>(null);

  // --- Diplomacy Tab States ---
  const [selectedFactionId, setSelectedFactionId] = useState<string | null>(null);

  // --- Scenarios Tab States ---
  const [scenarios, setScenarios] = useState<DecisionScenario[]>(() => {
    const saved = localStorage.getItem('panipat_campaign_scenarios');
    return saved ? JSON.parse(saved) : HISTORICAL_SCENARIOS;
  });
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scen_1');
  const [scenarioConsequences, setScenarioConsequences] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('panipat_campaign_scen_consequences');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('panipat_campaign_scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_scen_consequences', JSON.stringify(scenarioConsequences));
  }, [scenarioConsequences]);

  // --- Espionage Mini-game States ---
  const [currentSpyCaseIdx, setCurrentSpyCaseIdx] = useState<number>(0);
  const [revealedBelongings, setRevealedBelongings] = useState<{ [key: string]: boolean }>({});
  const [revealedWeakness, setRevealedWeakness] = useState<{ [key: string]: boolean }>({});
  const [interrogationMessage, setInterrogationMessage] = useState<string>('');
  const [spyResult, setSpyResult] = useState<'won' | 'lost' | 'idle'>('idle');

  const currentFaction = factions.find(f => f.id === selectedFactionId);
  const currentScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const activeCase = SPY_CASES_DATABASE[currentSpyCaseIdx];

  // --- Dynamic turn/consumption effect alerts ---
  const getFoodUsage = () => {
    if (rationsStance === 'Abundant') return 45;
    if (rationsStance === 'Rationed') return 12;
    return 25;
  };

  const getMoraleTendency = () => {
    if (rationsStance === 'Abundant') return '+10% Morale booster';
    if (rationsStance === 'Rationed') return '-15% Attrition penalty';
    return 'Stable and balanced';
  };

  // --- Executive Handlers ---
  const handleRationsChange = (stance: 'Standard' | 'Abundant' | 'Rationed') => {
    setRationsStance(stance);
    if (stance === 'Abundant') {
      setMorale(prev => Math.min(100, prev + 10));
      setProvisions(prev => Math.max(0, prev - 15));
    } else if (stance === 'Rationed') {
      setMorale(prev => Math.max(20, prev - 15));
    }
  };

  const executeForaging = () => {
    if (provisions > 1200) return;
    setProvisions(prev => prev + 120);
    // Severe trust rot as foraging amounts to looting local kingdoms
    setFactions(prev => prev.map(f => {
      if (f.id !== '1' && f.id !== '2') {
        return { ...f, trust: Math.max(0, f.trust - 15) };
      }
      return f;
    }));
    setMorale(prev => Math.min(100, prev + 5));
    alert("Emergency Foraging order dispatched. Crops harvested from surrounding fields. Regional trust -15!");
  };

  const purchaseFoodCaravan = () => {
    if (treasuryMohurs < 30000) {
      alert("Insufficient Treasury coin to pay the Deccan grain merchant syndicates.");
      return;
    }
    setTreasuryMohurs(prev => prev - 30000);
    setProvisions(prev => prev + 250);
    alert("Grain Caravans purchased from Pune banking houses! +250 Tons provisions added safely.");
  };

  // Standard diplomatic actions
  const executeDiplomaticAction = (actionType: 'tribute' | 'alliance' | 'supplies' | 'ultimatum') => {
    if (!selectedFactionId || !currentFaction) return;

    let costMohurs = 0;
    let costTrust = 0;
    let trustGain = 0;
    let provisionsGain = 0;
    let newRelation = currentFaction.relation;
    let responseText = "";

    const factionName = currentFaction.name;
    const leader = currentFaction.leader;

    switch (actionType) {
      case 'tribute':
        costMohurs = 35000;
        if (treasuryMohurs < costMohurs) {
          alert("Insufficient Gold Mohurs to fund this imperial embassy.");
          return;
        }
        trustGain = 25;
        setTreasuryMohurs(prev => prev - costMohurs);
        if (currentFaction.trust + trustGain >= 50 && currentFaction.relation === 'Wary') {
          newRelation = 'Neutral';
        } else if (currentFaction.trust + trustGain >= 75 && currentFaction.relation === 'Neutral') {
          newRelation = 'Allied';
        }
        responseText = `${leader}: "Your tribute of gold and silks is bountiful, Peshwa. The court of ${factionName} recognizes your grand honor."`;
        break;

      case 'alliance':
        if (currentFaction.trust < 55) {
          responseText = `${leader}: "Amities alone cannot validate ink treaties. You must raise our trust (55+) beforehand."`;
        } else {
          newRelation = 'Allied';
          trustGain = 15;
          responseText = `${leader}: "Let our steel forge alliance! The northwestern threat shall crumble before our matching spears!"`;
        }
        break;

      case 'supplies':
        if (currentFaction.relation !== 'Allied' && currentFaction.trust < 40) {
          responseText = `${leader}: "Why should we feed foreign Deccani armies while my own clansmen starve? Fortify our alliance first."`;
        } else {
          costTrust = 20;
          provisionsGain = 150;
          setProvisions(prev => prev + provisionsGain);
          responseText = `${leader}: "Our heavy grain carts are marching towards your vanguard storehouse. Eat well, dynamic warriors!"`;
        }
        break;

      case 'ultimatum':
        newRelation = 'Hostile';
        trustGain = -currentFaction.trust;
        responseText = `${leader}: "You dare deliver an imperial mandate under sword? Consider our kingdoms at war henceforth!"`;
        break;
    }

    setFactions(prev => prev.map(f => {
      if (f.id === selectedFactionId) {
        let finalTrust = Math.max(0, Math.min(100, f.trust + trustGain - costTrust));
        return {
          ...f,
          relation: newRelation,
          trust: finalTrust
        };
      }
      return f;
    }));

    setActiveFactionsLog(prev => ({
      ...prev,
      [selectedFactionId]: [responseText, ...prev[selectedFactionId]]
    }));
  };

  // Scenario decision resolver
  const selectScenarioChoice = (scenarioIndex: number, choiceIndex: number) => {
    const scen = scenarios[scenarioIndex];
    if (scen.resolved) return;

    const choice = scen.choices[choiceIndex];

    // Apply effects
    setTreasuryMohurs(prev => Math.max(0, prev + choice.effects.gold));
    setProvisions(prev => Math.max(0, prev + choice.effects.provisions));
    setMorale(prev => Math.max(10, Math.min(100, prev + choice.effects.morale)));

    // Apply Trust alterations
    setFactions(prev => prev.map(f => {
      const trustMod = choice.effects.trustChange[f.id];
      if (trustMod) {
        return { ...f, trust: Math.max(0, Math.min(100, f.trust + trustMod)) };
      }
      return f;
    }));

    // Mark as resolved
    setScenarios(prev => prev.map((s, idx) => {
      if (idx === scenarioIndex) {
        return { ...s, resolved: true };
      }
      return s;
    }));

    setScenarioConsequences(prev => ({
      ...prev,
      [scen.id]: `${choice.actionResult} (Gold: ${choice.effects.gold > 0 ? '+' : ''}${choice.effects.gold.toLocaleString()} • Provisions: ${choice.effects.provisions > 0 ? '+' : ''}${choice.effects.provisions} Tons • Morale: ${choice.effects.morale > 0 ? '+' : ''}${choice.effects.morale}%)`
    }));
  };

  // Interrogation minigame actions
  const toggleBelongings = (susName: string) => {
    setRevealedBelongings(prev => ({ ...prev, [susName]: !prev[susName] }));
  };

  const interrogateSuspect = (sus: SpySuspect) => {
    setInterrogationMessage(`Pressuring and analyzing the responses of ${sus.name}...`);
    setTimeout(() => {
      // Fuzzy logic: spies are highly resilient (45% chance to crack), innocent people crack easily (75% chance).
      const successChance = sus.isSpy ? 0.45 : 0.75;
      const roll = Math.random();
      
      if (roll <= successChance) {
        let msg = `[CRACKED - TESTIMONY EXTRACTED] ${sus.name} breaks under persistent questioning: "${sus.statement}"`;
        setInterrogationMessage(msg);
        setRevealedWeakness(prev => ({ ...prev, [sus.name]: true }));
      } else {
        const resistantQuotes = sus.isSpy ? [
          `"My loyalty is absolute. No amount of harsh intimidation will make me fabricate stories!"`,
          `"I have ridden through the most deadly sands of Kabul, commander. Your dungeons do not frighten me."`,
          `"You squander precious campaign hours interrogating an innocent man while the actual mole runs free!"`
        ] : [
          `"I swear on the sacred waters of Ganga, I know absolutely nothing about hidden scrolls, master!"`,
          `"Please, my knees tremble! I am just a humble camp cook... I have already told you all I know."`,
          `"Your guards have ransacked my satchel three separate times! I have nothing to hide, please release me!"`
        ];
        const randomQuote = resistantQuotes[Math.floor(Math.random() * resistantQuotes.length)];
        let msg = `[RESISTED] ${sus.name} remains defiant under pressure: ${randomQuote}`;
        setInterrogationMessage(msg);
      }
    }, 800);
  };

  const accuseSuspect = (sus: SpySuspect) => {
    if (spyResult !== 'idle') return;

    if (sus.isSpy) {
      setSpyResult('won');
      if (currentSpyCaseIdx === 0) {
        setProvisions(prev => prev + 120);
        setMorale(prev => Math.min(100, prev + 10));
      } else {
        setTreasuryMohurs(prev => prev + 30000);
      }
    } else {
      setSpyResult('lost');
      setMorale(prev => Math.max(10, prev - 20));
      setFactions(prev => prev.map(f => {
        if (f.id !== '1' && f.id !== '2') {
          return { ...f, trust: Math.max(0, f.trust - 10) };
        }
        return f;
      }));
    }
  };

  const cycleSpyCase = () => {
    setCurrentSpyCaseIdx((currentSpyCaseIdx + 1) % SPY_CASES_DATABASE.length);
    setSpyResult('idle');
    setRevealedWeakness({});
    setRevealedBelongings({});
    setInterrogationMessage('');
  };

  const handleApplySimulatorSuccess = (rewards: { gold: number; provisions?: number; morale: number; text: string }) => {
    if (rewards.gold) setTreasuryMohurs(prev => Math.max(0, prev + rewards.gold));
    if (rewards.provisions) setProvisions(prev => Math.max(0, prev + rewards.provisions));
    if (rewards.morale) setMorale(prev => Math.max(10, Math.min(100, prev + rewards.morale)));
    alert(`📜 OUTCOME REPORT:\n${rewards.text}`);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-stone-950 overflow-hidden font-sans">
      <TopBar screen={Screen.WAR_COUNCIL} onNavigate={onNavigate} onToggleMenu={onToggleMenu} onHelp={onHelp} onSettings={onSettings} />
      <SideNav screen={Screen.WAR_COUNCIL} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />
      
      <main className="lg:pl-64 pt-16 flex-1 overflow-y-auto bg-stone-950 relative">
        <div 
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-fixed"
          style={{ backgroundImage: "url('/afghan_map.png')" }}
        />
        <div className="relative z-10 p-4 md:p-8 bg-stone-950/60 backdrop-blur-xs min-h-full flex flex-col font-sans">
          
          {/* Top Resource Status Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-stone-900/90 p-4 border border-stone-800 rounded-sm">
            <div className="flex items-center gap-3">
              <Coins className="text-saffron shadow-sm" size={24} />
              <div className="text-left font-sans">
                <p className="text-[9px] text-stone-500 uppercase tracking-widest font-black">Treasury Mohurs</p>
                <p className="text-white text-md font-serif font-bold">{treasuryMohurs.toLocaleString()} M</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="text-orange-500" size={24} />
              <div className="text-left font-sans">
                <p className="text-[9px] text-stone-500 uppercase tracking-widest font-black">Food Provisions</p>
                <p className="text-white text-md font-serif font-bold">{provisions} Tons</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-red-500 animate-pulse" size={24} />
              <div className="text-left font-sans">
                <p className="text-[9px] text-stone-500 uppercase tracking-widest font-black">Troop Morale</p>
                <p className="text-white text-md font-serif font-bold">{morale}% Combat Ready</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gavel className="text-saffron" size={24} />
              <div className="text-left font-sans">
                <p className="text-[9px] text-stone-500 uppercase tracking-widest font-black">Rations Policy</p>
                <p className="text-stone-300 text-xs uppercase font-mono font-black">{rationsStance}</p>
              </div>
            </div>
          </div>

          {/* Screen Title */}
          <div className="mb-6 text-left">
            <h2 className="font-serif text-2xl md:text-3xl text-saffron uppercase tracking-widest font-black flex items-center gap-3">
              <Gavel className="text-saffron shrink-0" size={24} />
              <span>War Council & Imperial Diplomacy</span>
            </h2>
            <p className="text-stone-400 font-sans italic text-xs max-w-3xl leading-relaxed mt-1">
              "An empire is built not only by flintlocks, but by secure supply carts, diplomatic treaties in regional courts, and iron containment of espionage inside native camps."
            </p>
          </div>

          {/* Module Selector Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-850 pb-3">
            <button
              onClick={() => setActiveTab('diplomacy')}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-serif font-black transition-all flex items-center gap-2 border-b-2 rounded-sm cursor-pointer ${activeTab === 'diplomacy' ? 'border-saffron text-saffron bg-saffron/10' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              <Handshake size={14} /> Factions & Alliances
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-serif font-black transition-all flex items-center gap-2 border-b-2 rounded-sm cursor-pointer ${activeTab === 'scenarios' ? 'border-saffron text-saffron bg-saffron/10' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              <Scroll size={14} /> Campaign Dilemmas
            </button>
            <button
              onClick={() => setActiveTab('provisions')}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-serif font-black transition-all flex items-center gap-2 border-b-2 rounded-sm cursor-pointer ${activeTab === 'provisions' ? 'border-saffron text-saffron bg-saffron/10' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              <Scale size={14} /> Logistics Office
            </button>
            <button
              onClick={() => setActiveTab('espionage')}
              className={`px-3 py-2 text-[10px] uppercase tracking-widest font-serif font-black transition-all flex items-center gap-2 border-b-2 rounded-sm cursor-pointer ${activeTab === 'espionage' ? 'border-saffron text-saffron bg-saffron/10 animate-pulse' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              <ShieldAlert size={14} /> Counter-Intelligence
            </button>
            <button
              onClick={() => setActiveTab('simulations')}
              className={`px-3 py-2 text-[10px] uppercase tracking-widest font-serif font-black transition-all flex items-center gap-2 border-b-2 rounded-sm cursor-pointer ${activeTab === 'simulations' ? 'border-saffron text-saffron bg-saffron/10' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              <Flame size={14} className="text-orange-500 animate-pulse" /> Tactical Simulations & Drills
            </button>
            <button
              onClick={() => setActiveTab('debates')}
              className={`px-3 py-2 text-[10px] uppercase tracking-widest font-serif font-black transition-all flex items-center gap-2 border-b-2 rounded-sm cursor-pointer ${activeTab === 'debates' ? 'border-saffron text-saffron bg-saffron/10' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              <Sparkles size={14} className="text-amber-400 animate-pulse" /> AI War Council
            </button>
            <button
              onClick={() => setActiveTab('multiplayer')}
              className={`px-3 py-2 text-[10px] uppercase tracking-widest font-serif font-black transition-all flex items-center gap-2 border-b-2 rounded-sm cursor-pointer ${activeTab === 'multiplayer' ? 'border-saffron text-saffron bg-saffron/10' : 'border-transparent text-stone-400 hover:text-stone-200'}`}
            >
              <Users size={14} /> Multiplayer Arena
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* LEFT SIDE AREA DEPENDING ON TABS */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* TACTICAL DIPLOMACY INDEX */}
              {activeTab === 'diplomacy' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                    <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest font-bold">Auxiliary Sovereign States</h3>
                    <span className="text-[10px] text-stone-500 font-mono">Envoys Ready</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {factions.map((faction) => (
                      <div
                        key={faction.id}
                        onClick={() => setSelectedFactionId(faction.id)}
                        className={`bg-stone-900/50 border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all cursor-pointer rounded-sm hover:border-stone-700 ${selectedFactionId === faction.id ? 'border-saffron/80 bg-stone-900 shadow-[0_0_15px_rgba(255,153,51,0.15)]' : 'border-stone-850'}`}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-12 h-12 rounded-sm flex items-center justify-center border-2 shrink-0 ${faction.relation === 'Hostile' ? 'border-red-600 bg-red-950/20' : faction.relation === 'Allied' ? 'border-green-600 bg-green-950/20' : faction.relation === 'Wary' ? 'border-orange-500 bg-orange-950/20' : 'border-stone-600 bg-stone-950'}`}>
                            <Globe size={24} className={faction.relation === 'Hostile' ? 'text-red-500' : faction.relation === 'Allied' ? 'text-green-500' : 'text-stone-400'} />
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-serif text-white font-bold">{faction.name}</h4>
                              <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full uppercase font-black ${faction.relation === 'Hostile' ? 'bg-red-950 text-red-500 border border-red-900' : faction.relation === 'Neutral' ? 'bg-stone-800 text-stone-400 border border-stone-700' : faction.relation === 'Wary' ? 'bg-orange-950 text-orange-400 border border-orange-900' : 'bg-green-950 text-green-400 border border-green-900'}`}>{faction.relation}</span>
                            </div>
                            <p className="text-[9px] text-stone-500 uppercase tracking-widest mt-1">Court Leader: <span className="text-stone-300 font-bold">{faction.leader}</span></p>
                            <p className="text-xs text-stone-400 italic mt-1 leading-relaxed">{faction.description}</p>
                            
                            {/* Trust meter slider */}
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-[9px] text-stone-500 uppercase font-black tracking-wider font-mono">Faction Trust:</span>
                              <div className="w-40 h-2 bg-stone-950 border border-stone-800 rounded-sm overflow-hidden">
                                <div className="h-full bg-saffron" style={{ width: `${faction.trust}%` }} />
                              </div>
                              <span className="text-[10px] text-stone-300 font-mono">{faction.trust}/100</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedFactionId(faction.id); }}
                          className="px-4 py-2 border-2 border-saffron/40 hover:border-saffron hover:bg-saffron hover:text-black font-semibold text-[10px] text-saffron uppercase font-mono tracking-widest rounded-sm transition-all shadow-sm cursor-pointer whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center"
                        >
                          Send Envoy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HIGH STAKES HISTORICAL SCENARIOS DILEMMAS */}
              {activeTab === 'scenarios' && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                    <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest font-bold">Active Council Dilemmas</h3>
                    <span className="text-[10px] text-stone-500">Unresolved Decisions</span>
                  </div>

                  {/* Dilemma Selector Panel Items */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {scenarios.map((scen) => (
                      <button
                        key={scen.id}
                        onClick={() => setActiveScenarioId(scen.id)}
                        className={`p-3 text-[10px] uppercase font-serif tracking-widest text-center border-2 transition-all cursor-pointer rounded-sm hover:border-saffron ${scen.resolved ? 'opacity-50 border-stone-850 bg-stone-950/20 text-stone-500' : activeScenarioId === scen.id ? 'border-saffron bg-saffron/5 text-saffron font-bold' : 'border-stone-800 bg-stone-900 text-stone-300'}`}
                      >
                        <div className="truncate">{scen.title.split(' ')[0]}</div>
                        <div className="text-[8px] font-mono mt-1 font-bold">{scen.resolved ? 'RESOLVED ✓' : 'PENDING'}</div>
                      </button>
                    ))}
                  </div>

                  {/* Active Scenario Card view */}
                  <div className="p-5 md:p-6 bg-stone-900/60 border border-stone-800 rounded-sm">
                    <div className="flex items-center gap-4 border-b border-stone-850 pb-4 mb-4">
                      <div className="w-12 h-12 rounded-full border border-saffron overflow-hidden bg-stone-800">
                        <FallbackImage
                          src={currentScenario.avatar}
                          fallbackSrc="/avatar-placeholder.svg"
                          alt="Speaker"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-stone-500 uppercase tracking-widest font-black font-mono">Presenting Dilemma:</span>
                        <h4 className="text-white text-md font-serif uppercase tracking-wider">{currentScenario.title}</h4>
                        <p className="text-[10px] text-saffron font-bold mt-0.5 font-mono">Advisee: {currentScenario.speaker}</p>
                      </div>
                    </div>

                    <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm italic text-xs leading-relaxed text-stone-300 relative mb-6">
                      <AlertCircle className="absolute -top-2.5 -right-2 text-saffron" size={20} />
                      "{currentScenario.dilemma}"
                    </div>

                    {currentScenario.resolved ? (
                      <div className="bg-green-950/30 border border-green-900 p-4 text-[11px] text-green-400 font-serif italic text-center rounded-sm">
                        <CheckCircle className="inline-block mr-2 text-green-500" size={16} />
                        <span>This decree is sealed. Outcome: {scenarioConsequences[currentScenario.id]}</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest font-black font-mono">Select Command Option & Review Outcomes:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentScenario.choices.map((choice, cIdx) => (
                            <div 
                              key={cIdx} 
                              className="p-4 bg-stone-950 border border-stone-800 hover:border-saffron transition-all rounded-sm flex flex-col justify-between"
                            >
                              <div>
                                <h5 className="font-serif text-sm text-saffron uppercase font-bold">{choice.label}</h5>
                                <p className="text-stone-400 text-xs mt-1 leading-relaxed">{choice.consequence}</p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-stone-900">
                                <span className="text-[9px] text-stone-500 uppercase font-black tracking-widest font-mono block">Simulated Consequence Trade-offs:</span>
                                <div className="flex flex-wrap gap-2.5 mt-1.5 text-[9px] font-mono uppercase bg-black/40 p-2 border border-stone-900 rounded-sm">
                                  {choice.effects.gold !== 0 && (
                                    <span className={choice.effects.gold > 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                                      Gold: {choice.effects.gold > 0 ? '+' : ''}{choice.effects.gold.toLocaleString()}
                                    </span>
                                  )}
                                  {choice.effects.provisions !== 0 && (
                                    <span className={choice.effects.provisions > 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                                      Food: {choice.effects.provisions > 0 ? '+' : ''}{choice.effects.provisions}T
                                    </span>
                                  )}
                                  {choice.effects.morale !== 0 && (
                                    <span className={choice.effects.morale > 0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                                      Morale: {choice.effects.morale > 0 ? '+' : ''}{choice.effects.morale}%
                                    </span>
                                  )}
                                  {Object.keys(choice.effects.trustChange).some(f => (choice.effects.trustChange[f] as number) !== 0) && (
                                    <span className="text-orange-400 font-medium font-sans">
                                      Trust: {Object.values(choice.effects.trustChange).map(v => ((v as number) > 0 ? '+' : '') + v).join(', ')}
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => selectScenarioChoice(scenarios.indexOf(currentScenario), cIdx)}
                                  className="w-full mt-3.5 py-1.5 bg-saffron hover:bg-yellow-600 border border-yellow-700 text-stone-950 font-black uppercase text-[10px] tracking-widest rounded-sm transition-all cursor-pointer"
                                >
                                  Seal Royal Directive
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LOGISTICS & PROVISIONS MANAGEMENT CENTER */}
              {activeTab === 'provisions' && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                    <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest font-bold">Imperial Supplies Control</h3>
                    <span className="text-[10px] text-stone-500">Grain & Rations Stance</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Ration choices */}
                    <div className="p-4 bg-stone-900/40 border border-stone-800 rounded-sm text-center flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-xs text-stone-400 uppercase tracking-widest font-bold">Ration Policy Stance</h4>
                        <div className="flex flex-col gap-1.5 mt-3">
                          <button 
                            onClick={() => handleRationsChange('Abundant')}
                            className={`py-2 text-[10px] uppercase font-mono font-bold border rounded-sm tracking-wider cursor-pointer ${rationsStance === 'Abundant' ? 'bg-saffron text-stone-950 border-saffron' : 'bg-stone-950 text-stone-400 border-stone-850 hover:bg-stone-900'}`}
                          >
                            Abundant (45T / Turn)
                          </button>
                          <button 
                            onClick={() => handleRationsChange('Standard')}
                            className={`py-2 text-[10px] uppercase font-mono font-bold border rounded-sm tracking-wider cursor-pointer ${rationsStance === 'Standard' ? 'bg-saffron text-stone-950 border-saffron' : 'bg-stone-950 text-stone-400 border-stone-850 hover:bg-stone-900'}`}
                          >
                            Standard (25T / Turn)
                          </button>
                          <button 
                            onClick={() => handleRationsChange('Rationed')}
                            className={`py-2 text-[10px] uppercase font-mono font-bold border rounded-sm tracking-wider cursor-pointer ${rationsStance === 'Rationed' ? 'bg-saffron text-stone-950 border-saffron animate-pulse' : 'bg-stone-950 text-stone-400 border-stone-850 hover:bg-stone-900'}`}
                          >
                            Rationed (12T / Turn)
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-orange-400 font-mono mt-3 leading-dashed">Ration stance changes morale and grain burn rates.</p>
                    </div>

                    {/* Interactive provisions actions */}
                    <div className="p-4 bg-stone-900/40 border border-stone-800 rounded-sm text-center flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-xs text-stone-400 uppercase tracking-widest font-bold">Secure Local Forage</h4>
                        <p className="text-[10px] text-stone-500 mt-2 font-mono">Harvest surrounding fields of Doab and Bharatpur by royal decree.</p>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="bg-black/30 p-2.5 border border-stone-950 text-[10px] text-left font-mono">
                          <span className="text-green-500 font-bold block">+120 Tons Grain store</span>
                          <span className="text-red-500 font-bold block">-15 Diplomatic Trust (All neutral kingdoms)</span>
                        </div>
                        <button 
                          onClick={executeForaging}
                          className="w-full py-2 bg-stone-950 hover:bg-red-900 hover:text-white border border-stone-800 hover:border-red-700 text-stone-300 font-black uppercase text-[10px] tracking-widest rounded-sm transition-all cursor-pointer"
                        >
                          Disperse Foragers
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-900/40 border border-stone-800 rounded-sm text-center flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-xs text-stone-400 uppercase tracking-widest font-bold">Secure Bank Grain Caravan</h4>
                        <p className="text-[10px] text-stone-500 mt-2 font-mono">Direct gold purchase order from deccani merchant houses.</p>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="bg-black/30 p-2.5 border border-stone-950 text-[10px] text-left font-mono">
                          <span className="text-green-500 font-bold block">+250 Tons Grain store</span>
                          <span className="text-red-500 font-bold block">-30,000 Treasury Mohurs cost</span>
                        </div>
                        <button 
                          onClick={purchaseFoodCaravan}
                          disabled={treasuryMohurs < 30000}
                          className="w-full py-2 bg-saffron hover:bg-yellow-600 disabled:opacity-45 hover:text-black border border-yellow-700 text-stone-950 font-black uppercase text-[10px] tracking-widest rounded-sm transition-all cursor-pointer"
                        >
                          Purchase Grain Caravan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Operational Supply Forecast Display */}
                  <div className="bg-stone-900/80 p-5 border border-stone-800 text-left rounded-sm font-sans flex flex-col gap-3">
                    <h4 className="font-serif text-xs text-white uppercase tracking-wider flex items-center gap-2">
                      <Compass className="text-saffron" size={14} /> SUPPLY LINES EFFICIENCY REPORT
                    </h4>
                    <p className="text-stone-400 text-xs">
                      The Maratha cavalry relies on massive grain routes back to Bharatpur and Gwalior. If available stores reach zero tons, starvation will induce severe military desertion (-8% army morale per turn) and decrease battle advantage directly.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-stone-950/70 p-3 border border-stone-900 text-[10px] font-mono">
                      <div>
                        <span className="text-stone-500 uppercase block">Burn rate:</span>
                        <span className="text-white font-bold">{getFoodUsage()} Tons per turn</span>
                      </div>
                      <div>
                        <span className="text-stone-500 uppercase block">Ration status:</span>
                        <span className="text-saffron font-bold uppercase">{rationsStance}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 uppercase block">Morale drift:</span>
                        <span className="text-stone-300 font-bold">{getMoraleTendency()}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 uppercase block">Security profile:</span>
                        <span className="text-green-500 font-bold uppercase">SUPPLY SAFE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPY INTERROGATION MINIGAME */}
              {activeTab === 'espionage' && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                    <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest font-bold">Counter-espionage Court</h3>
                    <span className="text-[10px] font-mono text-saffron font-black uppercase tracking-wide">Espionage threat: high</span>
                  </div>

                  <div className="p-5 md:p-6 bg-stone-900/70 border border-stone-800 rounded-sm">
                    {/* Header Info */}
                    <div className="flex justify-between items-center bg-stone-950 p-3 border border-stone-850 rounded-sm mb-4">
                      <div className="flex items-center gap-2.5">
                        <ShieldAlert className="text-red-500" size={18} />
                        <span className="text-white font-serif uppercase tracking-wider text-xs">{activeCase.title}</span>
                      </div>
                      <span className="text-[9px] font-mono text-stone-400 bg-stone-800 px-2 py-0.5 rounded-sm uppercase font-bold">Reward: {activeCase.reward}</span>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed italic mb-4">
                      "{activeCase.incident}"
                    </p>

                    {/* Result Screens */}
                    {spyResult === 'won' ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-6 text-center flex flex-col items-center justify-center space-y-3 bg-green-950/20 border border-green-900 rounded-sm"
                      >
                        <UserCheck className="text-green-500 animate-bounce" size={40} />
                        <h4 className="font-serif text-white uppercase text-base tracking-widest">ESPIONAGE CONTAINED!</h4>
                        <p className="text-xs text-stone-300 max-w-md px-6">
                          Excellent oversight, General-Regent! The Rohilla spy was successfully detained with incriminating Pashto battle plans. The campsite is clean and your supplies remain safe.
                        </p>
                        <button 
                          onClick={cycleSpyCase}
                          className="px-6 py-2 bg-saffron text-black font-black uppercase text-[10px] tracking-widest rounded-sm transition-all cursor-pointer hover:bg-yellow-600"
                        >
                          Next Espionage Report Case
                        </button>
                      </motion.div>
                    ) : spyResult === 'lost' ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-6 text-center flex flex-col items-center justify-center space-y-3 bg-red-950/20 border border-red-900 rounded-sm"
                      >
                        <AlertTriangle className="text-red-500 animate-pulse" size={40} />
                        <h4 className="font-serif text-white uppercase text-base tracking-widest">SABOTAGE SUCCESS / INNOCENT DETAINED</h4>
                        <p className="text-xs text-stone-300 max-w-md px-6">
                          Alas, you accused an innocent auxiliary Maratha hand! This sparked camp desertion and a deep breakdown of trust with other local kingdoms (-20 Morale attrition / -10 trust with neutral factions).
                        </p>
                        <button 
                          onClick={cycleSpyCase}
                          className="px-6 py-2 bg-saffron text-black font-black uppercase text-[10px] tracking-widest rounded-sm transition-all cursor-pointer hover:bg-yellow-600"
                        >
                          Regroup & Read Case 2
                        </button>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-[10px] text-stone-500 uppercase tracking-widest font-black font-mono">Detained Suspects Profiles (3):</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {activeCase.suspects.map((sus, idx) => (
                            <div key={idx} className="p-4 bg-stone-950 border border-stone-850 rounded-sm flex flex-col justify-between hover:border-saffron/40 transition-all">
                              <div>
                                <span className="text-[8px] text-stone-600 uppercase font-bold tracking-widest font-mono">Suspect #{idx+1}</span>
                                <h5 className="font-serif text-sm text-white font-bold uppercase mt-1">{sus.name}</h5>
                                <span className="text-[9px] text-saffron uppercase font-mono font-bold block">{sus.role}</span>
                                
                                <div className="mt-2 text-[10px] font-mono flex justify-between items-center bg-stone-900/60 p-1 px-2 border border-stone-850/65 rounded-xs">
                                  <span className="text-stone-500 text-[8px] uppercase">Composure:</span>
                                  {revealedWeakness[sus.name] ? (
                                    <span className="text-red-500 font-extrabold uppercase text-[9px] tracking-wider animate-pulse">[Cracked]</span>
                                  ) : (
                                    <span className={sus.isSpy ? "text-green-500 font-bold uppercase text-[9px]" : "text-yellow-500 font-bold uppercase text-[9px]"}>
                                      {sus.isSpy ? "Firm (45% Crack Rate)" : "Nervous (75% Crack Rate)"}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-3.5 space-y-2">
                                  <button
                                    onClick={() => interrogateSuspect(sus)}
                                    className="w-full py-1 bg-stone-900 hover:bg-stone-800 text-[9px] uppercase tracking-wider font-mono text-stone-300 border border-stone-800 transition-all rounded-sm cursor-pointer"
                                  >
                                    Interrogate
                                  </button>
                                  <button
                                    onClick={() => toggleBelongings(sus.name)}
                                    className="w-full py-1 bg-stone-900 hover:bg-stone-800 text-[9px] uppercase tracking-wider font-mono text-stone-300 border border-stone-800 transition-all rounded-sm cursor-pointer"
                                  >
                                    {revealedBelongings[sus.name] ? 'Hide Belongings' : 'Search Belongings'}
                                  </button>
                                </div>

                                {/* Statements view */}
                                {revealedWeakness[sus.name] && (
                                  <div className="mt-3 p-2 bg-stone-900 border border-stone-800 text-[10px] text-stone-300 italic rounded-sm leading-normal">
                                    "{sus.statement}"
                                  </div>
                                )}

                                {/* Belongings check */}
                                {revealedBelongings[sus.name] && (
                                  <div className="mt-3 p-2 bg-stone-900 border border-stone-800 text-[9px] font-mono text-stone-400 space-y-1 rounded-sm">
                                    <span className="text-[8px] text-stone-500 uppercase font-black font-sans block">Seized Belongings:</span>
                                    {sus.belongings.map((it, itemIdx) => (
                                      <div key={itemIdx} className="flex items-center gap-1.5">• {it}</div>
                                    ))}
                                    <p className="text-[8.5px] text-orange-400 italic mt-2 border-t border-stone-800/40 pt-1 border-dashed font-sans">
                                      <span className="bold block font-bold">Weakness Clue:</span>
                                      {sus.weakness}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => accuseSuspect(sus)}
                                className="w-full mt-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-500 hover:text-white border border-red-900 font-black uppercase text-[10px] tracking-widest rounded-sm transition-all cursor-pointer"
                              >
                                Accuse & Execute
                              </button>
                            </div>
                          ))}
                        </div>

                        {interrogationMessage && (
                          <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm text-center">
                            <p className="text-xs text-saffron font-bold uppercase tracking-widest font-mono mb-1">INTERROGATION VOICE RECORDING</p>
                            <p className="text-sm font-serif italic text-stone-200">
                              {interrogationMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TACTICAL SIMULATIONS DASHBOARD */}
              {activeTab === 'simulations' && (
                <div className="space-y-6 text-left bg-stone-900/40 p-5 border border-stone-850/60 rounded-sm">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                    <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest font-bold">Frontier Combat Simulations</h3>
                    <span className="text-[10px] text-stone-500 font-mono font-bold">Special Operations Arena</span>
                  </div>

                  <p className="text-xs text-stone-400 font-sans leading-relaxed">
                    Test your tactical execution across four distinctive interactive mini-games, simulating cavalry rushes, heavy artillery arcs, winter logistics survival, and multilateral darbar coalitions.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Simulator 1 card */}
                    <div className="bg-stone-950 p-5 border border-stone-850 hover:border-saffron transition-all rounded-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-2xl">🐎</span>
                          <span className="text-[8px] font-mono border border-amber-500/30 text-amber-500 bg-amber-950/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Tactical timing</span>
                        </div>
                        <h4 className="font-serif text-sm text-white uppercase font-bold tracking-wide">Cavalry Charge Simulator</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-relaxed font-sans">
                          Lead heavy Deccani lancers across dragging sands to break Durrani infantry squares. Synchronize stirrups and maintain momentum for impact.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSimulation('cavalry')}
                        className="w-full mt-4 py-2 bg-saffron hover:bg-yellow-500 text-stone-950 font-mono text-[9px] font-black uppercase tracking-widest rounded-sm cursor-pointer shadow-md transition-all active:scale-[0.98]"
                      >
                        ⚔️ Launch Charge Drill
                      </button>
                    </div>

                    {/* Simulator 2 card */}
                    <div className="bg-stone-950 p-5 border border-stone-850 hover:border-saffron transition-all rounded-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-2xl">🔥</span>
                          <span className="text-[8px] font-mono border border-emerald-500/30 text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Physics drift</span>
                        </div>
                        <h4 className="font-serif text-sm text-white uppercase font-bold tracking-wide">Artillery Battery Calibration</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-relaxed font-sans">
                          Command Ibrahim Khan Gardi’s heavy 9-pounder brass cannons. Adjust elevation dials and compensate crosswinds to score direct fortification hits.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSimulation('artillery')}
                        className="w-full mt-4 py-2 bg-saffron hover:bg-yellow-500 text-stone-950 font-mono text-[9px] font-black uppercase tracking-widest rounded-sm cursor-pointer shadow-md transition-all active:scale-[0.98]"
                      >
                        🎯 Launch Calibration Drill
                      </button>
                    </div>

                    {/* Simulator 3 card */}
                    <div className="bg-stone-950 p-5 border border-stone-850 hover:border-saffron transition-all rounded-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-2xl">🌨️</span>
                          <span className="text-[8px] font-mono border border-blue-500/30 text-blue-400 bg-blue-950/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Tycoon survival</span>
                        </div>
                        <h4 className="font-serif text-sm text-white uppercase font-bold tracking-wide">Camp Supply Tycoon</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-relaxed font-sans">
                          Sustain Queen Parvatibai’s ration depot inside frozen encampments. Budget grain allocation, logs distribution, and treasury funds over 5 days.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSimulation('tycoon')}
                        className="w-full mt-4 py-2 bg-saffron hover:bg-yellow-500 text-stone-950 font-mono text-[9px] font-black uppercase tracking-widest rounded-sm cursor-pointer shadow-md transition-all active:scale-[0.98]"
                      >
                        💰 Launch Winter Tycoon
                      </button>
                    </div>

                    {/* Simulator 4 card */}
                    <div className="bg-stone-950 p-5 border border-stone-850 hover:border-saffron transition-all rounded-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-2xl">🏛️</span>
                          <span className="text-[8px] font-mono border border-orange-500/30 text-orange-400 bg-stone-900 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">Multi-pact diplomacy</span>
                        </div>
                        <h4 className="font-serif text-sm text-white uppercase font-bold tracking-wide">Coalition Diplomacy Darbar</h4>
                        <p className="text-[11px] text-stone-400 mt-1 leading-relaxed font-sans">
                          Convene deep assemblies with Shuja-ud-Daula of Awadh, Maharaja Suraj Mal, or regional vassal sirdars to seal binding pacts for military assets.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSimulation('assembly')}
                        className="w-full mt-4 py-2 bg-saffron hover:bg-yellow-500 text-stone-950 font-mono text-[9px] font-black uppercase tracking-widest rounded-sm cursor-pointer shadow-md transition-all active:scale-[0.98]"
                      >
                        📜 Launch Grand Assembly
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* AI DEBATE ROOM (VISUAL NOVEL MODE) */}
              {activeTab === 'debates' && (
                <AIDebateRoom 
                  campaignStage={campaignStage}
                  treasuryMohurs={treasuryMohurs}
                  setTreasuryMohurs={setTreasuryMohurs}
                  morale={morale}
                  setMorale={setMorale}
                  provisions={provisions}
                  setProvisions={setProvisions}
                />
              )}

              {/* MULTIPLAYER LOBBY SIMULATOR */}
              {activeTab === 'multiplayer' && (
                <MultiplayerLobbySimulator 
                  onApplyRewards={handleApplySimulatorSuccess}
                />
              )}

            </div>

            {/* RIGHT SIDEBAR PANEL: EMBASSY TRANSCRIPTS */}
            <div className="lg:col-span-4 flex flex-col gap-6 font-sans">
              
              <AnimatePresence mode="wait">
                {currentFaction ? (
                  <motion.div 
                    key={currentFaction.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-stone-900 border-2 border-saffron/40 p-4 flex flex-col relative text-left rounded-sm"
                  >
                    <button 
                      onClick={() => setSelectedFactionId(null)}
                      className="absolute top-3 right-3 text-stone-500 hover:text-white cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                    
                    <div className="flex items-center gap-3 border-b border-stone-850 pb-3 mb-4 font-serif">
                      <Handshake className="text-saffron shrink-0" size={20} />
                      <div>
                        <h4 className="text-base text-white uppercase font-black">{currentFaction.name}</h4>
                        <p className="text-[9px] uppercase tracking-widest text-stone-500 font-mono">Sovereign Embassy Transcripts</p>
                      </div>
                    </div>

                    {/* Faction transcript logger */}
                    <div className="bg-stone-950 p-4 border border-stone-850 flex flex-col gap-2 min-h-[160px] max-h-[220px] overflow-y-auto mb-4 scrollbar-thin rounded-sm">
                      <p className="text-[9px] uppercase font-bold text-saffron tracking-widest border-b border-stone-900 pb-1 flex items-center gap-2">
                        <MessageSquare size={10} /> COURT DISPATCH TRANSMISSIONS
                      </p>
                      {activeFactionsLog[currentFaction.id]?.map((logItem, idx) => (
                        <p key={idx} className="text-xs font-serif text-stone-300 italic border-l border-saffron/30 pl-2 py-0.5 leading-normal">
                          {logItem}
                        </p>
                      ))}
                    </div>

                    {/* Embassy Action items */}
                    <div className="space-y-2 mt-auto">
                      <p className="text-[9px] text-stone-500 uppercase tracking-widest font-black font-sans">Embassy Treaties Orders</p>
                      
                      <button 
                        onClick={() => executeDiplomaticAction('tribute')}
                        disabled={currentFaction.relation === 'Hostile'}
                        className="w-full py-2 px-3 bg-stone-950 hover:bg-saffron hover:text-stone-950 transition-all border border-stone-800 hover:border-yellow-600 font-mono text-[9px] font-bold text-white uppercase tracking-wider flex justify-between items-center rounded-sm disabled:opacity-40 cursor-pointer"
                      >
                        <span>Send Gold Tribute</span>
                        <span className="text-[8px] opacity-70">-35k Mohurs / +25 Trust</span>
                      </button>

                      <button 
                        onClick={() => executeDiplomaticAction('alliance')}
                        disabled={currentFaction.relation === 'Allied' || currentFaction.relation === 'Hostile'}
                        className="w-full py-2 px-3 bg-stone-950 hover:bg-saffron hover:text-stone-950 transition-all border border-stone-800 hover:border-yellow-600 font-mono text-[9px] font-bold text-white uppercase tracking-wider flex justify-between items-center rounded-sm disabled:opacity-40 cursor-pointer"
                      >
                        <span>Propose Alliance</span>
                        <span className="text-[8px] opacity-70">Needs 55+ Faction Trust</span>
                      </button>

                      <button 
                        onClick={() => executeDiplomaticAction('supplies')}
                        disabled={currentFaction.relation === 'Hostile'}
                        className="w-full py-2 px-3 bg-stone-950 hover:bg-saffron hover:text-stone-950 transition-all border border-stone-800 hover:border-yellow-600 font-mono text-[9px] font-bold text-white uppercase tracking-wider flex justify-between items-center rounded-sm disabled:opacity-40 cursor-pointer"
                      >
                        <span>Demand Food Support</span>
                        <span className="text-[8px] opacity-70">-20 Trust / +150 Food</span>
                      </button>

                      <button 
                        onClick={() => executeDiplomaticAction('ultimatum')}
                        disabled={currentFaction.relation === 'Hostile'}
                        className="w-full py-2 px-3 bg-stone-950 hover:bg-red-900 border border-stone-805 hover:border-red-700 text-stone-500 hover:text-white font-mono text-[9px] font-bold uppercase tracking-wider flex justify-between items-center rounded-sm disabled:opacity-40 cursor-pointer"
                      >
                        <span>Issue Royal Mandate</span>
                        <span className="text-[8px] opacity-70 text-red-500">Deconstruct Relations</span>
                      </button>
                    </div>

                  </motion.div>
                ) : (
                  <div
                    className="bg-stone-900 border border-stone-800 p-5 flex flex-col justify-center items-center text-center py-10 rounded-sm hover:border-stone-700 font-sans"
                  >
                    <Handshake size={32} className="text-stone-600 mb-3 animate-pulse" />
                    <h4 className="font-serif text-white uppercase text-xs mb-1 font-bold">Grand Durbar Embassy Office</h4>
                    <p className="text-[10px] text-stone-500 max-w-xs leading-relaxed">
                      Please designate one of the regional powers in the list index to dispatch an imperial delegation with special state gifts and decrees.
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {/* Active Decrees Panel */}
              <div className="bg-stone-900 border border-stone-800 p-5 shadow-2xl relative overflow-hidden rounded-sm text-left">
                <h3 className="font-serif text-sm text-saffron uppercase tracking-widest mb-3 flex items-center gap-2 font-bold">
                  <Scroll size={16} /> Active Imperial Decrees
                </h3>
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="border-b border-stone-850 pb-2 flex justify-between items-start">
                    <div>
                      <p className="text-[8px] text-stone-500 uppercase font-bold tracking-widest font-mono">ACTIVE DECREE</p>
                      <p className="text-white font-serif uppercase tracking-wider font-bold">War Bond Mobilization</p>
                      <p className="text-stone-500 text-[10px] italic">+20% Revenue, -5 Stability</p>
                    </div>
                    <span className="text-[9px] font-mono text-green-500 bg-green-950/20 px-2 py-0.5 border border-green-900 rounded-sm">LAW ENACTED</span>
                  </div>
                  <div className="flex justify-between items-start pt-1">
                    <div>
                      <p className="text-[8px] text-stone-500 uppercase font-black tracking-widest font-mono">AVAILABLE LAW</p>
                      <p className="text-stone-300 font-serif uppercase tracking-wider font-bold">Forage Restriction Exemption</p>
                      <p className="text-stone-500 text-[10px] italic">Reduces trust rot from foragers by 35%</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert("Exemption enacted! Foraging trust penalty decreased by 35% for consecutive turns.")}
                    className="w-full mt-2 py-1 bg-stone-950 hover:bg-saffron border border-stone-850 hover:border-yellow-600 hover:text-black hover:font-bold text-[9px] text-saffron uppercase font-mono tracking-widest rounded-sm transition-all text-center cursor-pointer"
                  >
                    Enact Exemption Rule
                  </button>
                </div>
              </div>

              {/* Council Chat transcripts */}
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-sm text-left">
                <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest mb-3 flex items-center gap-2 font-bold">
                  <MessageSquare size={16} /> Durbar Strategists Advisory
                </h3>
                <div className="h-28 overflow-y-auto mb-3 border border-stone-850 bg-stone-950/40 p-2 flex flex-col gap-1.5 custom-scrollbar rounded-sm text-[11px]">
                  <p className="text-stone-400 font-sans border-l border-stone-700 pl-2 leading-relaxed">
                    <span className="text-saffron font-bold uppercase font-mono">[08:24] HOLKAR:</span> "Keep an eye on Suraj Mal! If the Jats block the carriage trails, available provisions will perish."
                  </p>
                  <p className="text-stone-400 font-sans border-l border-stone-700 pl-2 leading-relaxed">
                    <span className="text-orange-500 font-bold uppercase font-mono">[09:12] GARDI:</span> "My flintlocks squad can guard the grain storehouses. Let\'s watch out for Rohilla scouts!"
                  </p>
                  <p className="text-stone-400 font-sans border-l border-stone-700 pl-2 leading-relaxed">
                    <span className="text-saffron font-bold uppercase font-mono">[11:05] BHAU:</span> "Seize any letter carriers matching foreign accents. I suspect leaks inside Delhi."
                  </p>
                </div>
                <div className="text-[10px] text-stone-500 font-mono italic">Transcripts of the Command High Committee.</div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Simulation Overlay Modals */}
      {activeSimulation === 'cavalry' && (
        <CavalryChargeSimulator
          onClose={() => setActiveSimulation(null)}
          onApplyRewards={handleApplySimulatorSuccess}
        />
      )}
      {activeSimulation === 'artillery' && (
        <ArtilleryCalibration
          onClose={() => setActiveSimulation(null)}
          onApplyRewards={handleApplySimulatorSuccess}
        />
      )}
      {activeSimulation === 'tycoon' && (
        <CampSupplyTycoon
          onClose={() => setActiveSimulation(null)}
          onApplyRewards={handleApplySimulatorSuccess}
        />
      )}
      {activeSimulation === 'assembly' && (
        <CoalitionDiplomacyDarbar
          onClose={() => setActiveSimulation(null)}
          onApplyRewards={handleApplySimulatorSuccess}
        />
      )}
    </div>
  );
};
