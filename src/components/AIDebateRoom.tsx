import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, AlertCircle, Scroll, ShieldCheck, Coins, HelpCircle } from 'lucide-react';
import { CampaignStage } from '../types';
import { GoogleGenAI } from '@google/genai';

// Avatars imports or fallback icons/placeholder styles
import avatarSurajMal from '../assets/images/maharaja_suraj_mal_1780981012497.png';
import avatarShujaUdDaula from '../assets/images/nawab_shuja_ud_daula_1780981037889.png';
import avatarMarathaTreasurer from '../assets/images/maratha_treasurer_raghunathrao_1780981073863.png';
import avatarMalharraoHolkar from '../assets/images/malharrao_holkar_1780981055883.png';

interface DebateLine {
  general: string;
  avatarUrl: string;
  avatarKey: 'gardi' | 'holkar' | 'bhau' | 'scindia' | 'raghunathrao' | 'surajmal';
  speech: string;
  stance: string;
}

interface GeneralOption {
  generalName: string;
  avatarKey: 'gardi' | 'holkar' | 'bhau' | 'scindia' | 'raghunathrao' | 'surajmal';
  choiceLabel: string;
  effectsSummary: string;
  effects: {
    gold: number;
    morale: number;
    provisions: number;
  };
}

interface DebateSession {
  topic: string;
  dialogues: DebateLine[];
  options: GeneralOption[];
}

const FALLBACK_DEBATES: Record<CampaignStage, DebateSession> = {
  [CampaignStage.NIZAM_CAMPAIGN]: {
    topic: 'Campaign Strategy Against Nizam (South Deccan)',
    dialogues: [
      {
        general: 'Sadashivrao Bhau',
        avatarUrl: '',
        avatarKey: 'bhau',
        stance: 'Defensive Fortification',
        speech: "We must construct heavy earthworks around Udgir. Let the Nizam exhaust his cavalry against our entrenched line of fire before we counter-strike."
      },
      {
        general: 'Malharrao Holkar',
        avatarUrl: avatarMalharraoHolkar,
        avatarKey: 'holkar',
        stance: 'Guerrilla Light Skirmish',
        speech: "Entrenchment slows us down! Deccani horses thrive on speed. We should sever their supply trains in the hills and force a capitulation by thirst."
      },
      {
        general: 'Ibrahim Khan Gardi',
        avatarUrl: '',
        avatarKey: 'gardi',
        stance: 'French Artillery Siege barrage',
        speech: "Our European-drilled French flintlock infantry and brass cannons will tear their ranks. Give me the command to establish an artillery circle to force immediate surrender."
      }
    ],
    options: [
      {
        generalName: 'Ibrahim Khan Gardi',
        avatarKey: 'gardi',
        choiceLabel: 'Deploy French Artillery Barrage',
        effectsSummary: '+25% Artillery Precision, -15,000 Gold Mohurs',
        effects: { gold: -15000, morale: 15, provisions: -20 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Endorse Guerrilla Light Skirmishes',
        effectsSummary: '+15% Cavalry Charge Speed, +10 Morale',
        effects: { gold: -5000, morale: 20, provisions: -10 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Build Udgir Entrenchment Lines',
        effectsSummary: '-10% Damage Taken, +80 Provisions',
        effects: { gold: -8000, morale: 5, provisions: 80 }
      }
    ]
  },
  [CampaignStage.PUNE]: {
    topic: 'Dynastic Funding Allocation at Shaniwar Wada',
    dialogues: [
      {
        general: 'Raghunathrao',
        avatarUrl: avatarMarathaTreasurer,
        avatarKey: 'raghunathrao',
        stance: 'Dynastic Sovereign Expansion',
        speech: "Our coffers in Pune are strained. We must levy taxes on northern provinces now, otherwise our mercenaries will mutiny before we cross the Chambal."
      },
      {
        general: 'Malharrao Holkar',
        avatarUrl: avatarMalharraoHolkar,
        avatarKey: 'holkar',
        stance: 'Lobbying Vassal States',
        speech: "Direct taxes will alienate the Rajput kings! We need their goodwill and grain storage. Request soft loans instead of high levies."
      },
      {
        general: 'Sadashivrao Bhau',
        avatarUrl: '',
        avatarKey: 'bhau',
        stance: 'Centralized Administrative Funding',
        speech: "A disciplined treasury is the backbone of empire. Conscript the dynastic jewelry assets of Shaniwar Wada to sustain the vanguard."
      }
    ],
    options: [
      {
        generalName: 'Raghunathrao',
        avatarKey: 'raghunathrao',
        choiceLabel: 'Levy Northern Revenue Taxes',
        effectsSummary: '+50,000 Gold Mohurs, -20 Faction Trust',
        effects: { gold: 50000, morale: -5, provisions: -30 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Negotiate Soft Loans with Rajputs',
        effectsSummary: '+15 Faction Trust, +20,000 Gold Mohurs',
        effects: { gold: 20000, morale: 10, provisions: 20 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Conscript Dynastic Jewel Chests',
        effectsSummary: '+35,000 Gold Mohurs, +15 Morale',
        effects: { gold: 35000, morale: 15, provisions: 0 }
      }
    ]
  },
  [CampaignStage.BURHANPUR]: {
    topic: 'Logistics Pivot at the Tapti River Crossing',
    dialogues: [
      {
        general: 'Sadashivrao Bhau',
        avatarUrl: '',
        avatarKey: 'bhau',
        stance: 'Parchment Ferry Construction',
        speech: "We must halt for three days and construct heavy timber ferries to transport our heavy ammunition carriages safely across the Tapti."
      },
      {
        general: 'Malharrao Holkar',
        avatarUrl: avatarMalharraoHolkar,
        avatarKey: 'holkar',
        stance: 'Shallow Ford Fording',
        speech: "A three-day delay is three days for Abdali's spies to warn the Rohillas! Force the troops and light horses to ford the shallow rapids tonight."
      },
      {
        general: 'Ibrahim Khan Gardi',
        avatarUrl: '',
        avatarKey: 'gardi',
        stance: 'Gunpowder Waterproofing Priority',
        speech: "Water is our artillery's doom. If the gunpowder chests get damp in the ford, our cannons are mere iron tubes. Delay to waterproof the carriage seals!"
      }
    ],
    options: [
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Construct Solid Timber Ferries',
        effectsSummary: '-12,000 Gold Mohurs, +60 Provisions Saved',
        effects: { gold: -12000, morale: 10, provisions: 60 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Ford Shallow Rapids Immediately',
        effectsSummary: '+10% Speed, -15 Provisions (lost in water)',
        effects: { gold: 0, morale: 15, provisions: -15 }
      },
      {
        generalName: 'Ibrahim Khan Gardi',
        avatarKey: 'gardi',
        choiceLabel: 'Waterproof Powder Carriage Seals',
        effectsSummary: '+15% Artillery Shell Damage, -5,000 Gold',
        effects: { gold: -5000, morale: 5, provisions: 10 }
      }
    ]
  },
  [CampaignStage.GWALIOR]: {
    topic: 'Vanguard Recruitment at Gwalior Fort',
    dialogues: [
      {
        general: 'Raghunathrao',
        avatarUrl: avatarMarathaTreasurer,
        avatarKey: 'raghunathrao',
        stance: 'Hire Bundela Infantry Mercenaries',
        speech: "We lack defensive musketeers. We must hire local Bundela mercenaries. They demand immediate gold advances but know the Yamuna swamps."
      },
      {
        general: 'Sadashivrao Bhau',
        avatarUrl: '',
        avatarKey: 'bhau',
        stance: 'Raise Regular Deccan Levies',
        speech: "Mercenaries turn their banners at the sight of defeat. We must wait for the Deccan reinforcements. They are loyal to the Peshwa to the end."
      },
      {
        general: 'Malharrao Holkar',
        avatarUrl: avatarMalharraoHolkar,
        avatarKey: 'holkar',
        stance: 'Equip Local Foraging Guards',
        speech: "We don't need more fighters; we need watchers. Conscript local village watchmen to shield our baggage lines from Rohilla raiders."
      }
    ],
    options: [
      {
        generalName: 'Raghunathrao',
        avatarKey: 'raghunathrao',
        choiceLabel: 'Hire Bundela Musketeers',
        effectsSummary: '+15% Infantry Combat Power, -20,000 Gold',
        effects: { gold: -20000, morale: 10, provisions: -10 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Wait for Peshwa Deccan Levies',
        effectsSummary: '+20 Morale, -15 Provisions (consumed while waiting)',
        effects: { gold: -5000, morale: 20, provisions: -15 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Conscript Local Baggage Guards',
        effectsSummary: 'Reduces Logistical Losses, -8,000 Gold',
        effects: { gold: -8000, morale: 5, provisions: 40 }
      }
    ]
  },
  [CampaignStage.DELHI_NEGOTIATIONS]: {
    topic: 'Negotiations with Shuja-ud-Daula of Awadh',
    dialogues: [
      {
        general: 'Raghunathrao',
        avatarUrl: avatarMarathaTreasurer,
        avatarKey: 'raghunathrao',
        stance: 'Territorial Concession',
        speech: "We must guarantee Shuja-ud-Daula the sole governorship of Delhi. The Awadh heavy cavalry will secure our right flank. No price is too high."
      },
      {
        general: 'Malharrao Holkar',
        avatarUrl: avatarMalharraoHolkar,
        avatarKey: 'holkar',
        stance: 'Dynastic Marriage Alliance',
        speech: "Do not promise cities we have not yet fully secured. Propose a marriage alliance and mutual trade waivers across the Ganges instead."
      },
      {
        general: 'Sadashivrao Bhau',
        avatarUrl: '',
        avatarKey: 'bhau',
        stance: 'Sovereign Threat Strategy',
        speech: "We represent the Mughal protectorate! If Shuja joins Abdali, let him know Gardi's guns will target Lucknow before the year ends."
      }
    ],
    options: [
      {
        generalName: 'Raghunathrao',
        avatarKey: 'raghunathrao',
        choiceLabel: 'Promise Delhi Governorship to Awadh',
        effectsSummary: '+35 Faction Trust, -15 Morale (Sirdars displeased)',
        effects: { gold: -10000, morale: -15, provisions: 10 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Propose Marriage & Trade Treaties',
        effectsSummary: '+20 Faction Trust, +15,000 Gold Mohurs',
        effects: { gold: 15000, morale: 10, provisions: 20 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Issue Military Ultimatum to Lucknow',
        effectsSummary: '-40 Faction Trust, +25 Morale (Fearless stance)',
        effects: { gold: 0, morale: 25, provisions: -10 }
      }
    ]
  },
  [CampaignStage.SHINDE_STAND]: {
    topic: 'Jankoji Scindia’s Defensive Stand at Kunjpura',
    dialogues: [
      {
        general: 'Sadashivrao Bhau',
        avatarUrl: '',
        avatarKey: 'bhau',
        stance: 'Reinforce the Fortification',
        speech: "We must dispatch 10,000 infantrymen immediately to reinforce Scindia at Kunjpura. If the fort falls, Abdali controls the river ford."
      },
      {
        general: 'Malharrao Holkar',
        avatarUrl: avatarMalharraoHolkar,
        avatarKey: 'holkar',
        stance: 'Tactical Lure Strategy',
        speech: "Do not divide our host! Scindia must conduct a fighting retreat to draw Abdali's vanguard into the open plains where our light cavalry can surround them."
      },
      {
        general: 'Ibrahim Khan Gardi',
        avatarUrl: '',
        avatarKey: 'gardi',
        stance: 'Artillery Redoubt Setups',
        speech: "Scindia must hold behind Kunjpura's mud walls. Let us construct artillery redoubts along the banks to fire upon any crossing boats."
      }
    ],
    options: [
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Reinforce Kunjpura Immediately',
        effectsSummary: '+20% Fort Defenses, -12,000 Gold Mohurs',
        effects: { gold: -12000, morale: 15, provisions: -20 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Authorize Scindia Fighting Retreat',
        effectsSummary: '+15% Cavalry Charge Damage, +10 Morale',
        effects: { gold: 0, morale: 10, provisions: 15 }
      },
      {
        generalName: 'Ibrahim Khan Gardi',
        avatarKey: 'gardi',
        choiceLabel: 'Deploy Artillery Riverbank Redoubts',
        effectsSummary: '+25% Crossfire Damage, -8,000 Gold Mohurs',
        effects: { gold: -8000, morale: 5, provisions: 10 }
      }
    ]
  },
  [CampaignStage.DELHI_BATTLE]: {
    topic: 'Consolidating Conquest of Delhi’s Red Fort',
    dialogues: [
      {
        general: 'Raghunathrao',
        avatarUrl: avatarMarathaTreasurer,
        avatarKey: 'raghunathrao',
        stance: 'Melt the Imperial Silver Roof',
        speech: "The royal treasury is empty, and the merchants refuse credit. We must melt the silver ceiling of the Red Fort to pay our mutinous troops."
      },
      {
        general: 'Sadashivrao Bhau',
        avatarUrl: '',
        avatarKey: 'bhau',
        stance: 'Maintain Sovereign Sanctity',
        speech: "Melting the imperial silver will turn every Mughal loyalist and regional king into our bitter enemy. We must borrow from local bankers instead."
      },
      {
        general: 'Malharrao Holkar',
        avatarUrl: avatarMalharraoHolkar,
        avatarKey: 'holkar',
        stance: 'Confiscate Rebel Estates',
        speech: "Borrowing is too slow, melting silver is too shameful. We should confiscate the estates of the Rohilla rebel barons inside Delhi's gates."
      }
    ],
    options: [
      {
        generalName: 'Raghunathrao',
        avatarKey: 'raghunathrao',
        choiceLabel: 'Melt the Red Fort Silver Roof',
        effectsSummary: '+60,000 Gold Mohurs, -25 Faction Trust (sacrilege)',
        effects: { gold: 60000, morale: 15, provisions: -30 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Protect Royal Assets, Seek Bank Loans',
        effectsSummary: '+15 Faction Trust, +20,000 Gold Mohurs',
        effects: { gold: 20000, morale: 5, provisions: 20 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Confiscate Rebel Rohilla Estates',
        effectsSummary: '+45,000 Gold Mohurs, +10 Morale (Victory spoils)',
        effects: { gold: 45000, morale: 10, provisions: -10 }
      }
    ]
  },
  [CampaignStage.PANIPAT]: {
    topic: 'Breaking the Entrenchment at Panipat Encampment',
    dialogues: [
      {
        general: 'Sadashivrao Bhau',
        avatarUrl: '',
        avatarKey: 'bhau',
        stance: 'Entrenched Defensive Grid',
        speech: "We are cut off from the south. We must dig defensive trenches around the entire camp and wait. The Peshwa must eventually march from Pune."
      },
      {
        general: 'Malharrao Holkar',
        avatarUrl: avatarMalharraoHolkar,
        avatarKey: 'holkar',
        stance: 'Guerrilla Night Breakout',
        speech: "Waiting is starvation! The snow is freezing our pilgrims. We must launch a coordinated night strike on their thin cordon and break out."
      },
      {
        general: 'Ibrahim Khan Gardi',
        avatarUrl: '',
        avatarKey: 'gardi',
        stance: 'Artillery-backed Frontline Push',
        speech: "We cannot sneak 50,000 pilgrims past camel snipers. We must deploy in a hollow square with my heavy guns forming the iron shield."
      }
    ],
    options: [
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Maintain Entrenched Defense Grid',
        effectsSummary: '+10% Fortification, -25 Provisions (starvation)',
        effects: { gold: 0, morale: -10, provisions: -25 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Launch Guerrilla Night Breakout',
        effectsSummary: '+20% Cavalry Speed, +15 Morale, -15k Gold',
        effects: { gold: -15000, morale: 15, provisions: 10 }
      },
      {
        generalName: 'Ibrahim Khan Gardi',
        avatarKey: 'gardi',
        choiceLabel: 'Deploy Artillery Hollow Square Shield',
        effectsSummary: '+35% Cannon Precision, -10,000 Gold Mohurs',
        effects: { gold: -10000, morale: 20, provisions: -10 }
      }
    ]
  }
};

const CHARACTER_DETAILS = {
  gardi: { name: 'Ibrahim Khan Gardi', title: 'Commander of Gardi Artillery', color: 'text-emerald-400', border: 'border-emerald-600' },
  holkar: { name: 'Malharrao Holkar', title: 'Subedar of Indore / Cavalry Veteran', color: 'text-saffron', border: 'border-amber-600' },
  bhau: { name: 'Sadashivrao Bhau', title: 'Grand Commander of Maratha Host', color: 'text-amber-500', border: 'border-yellow-600' },
  scindia: { name: 'Jankoji Scindia', title: 'Sirdar of Gwalior / Vanguard Chief', color: 'text-sky-400', border: 'border-sky-600' },
  raghunathrao: { name: 'Raghunathrao', title: 'Finance Secretary / Peshwa Baron', color: 'text-purple-400', border: 'border-purple-600' },
  surajmal: { name: 'Maharaja Suraj Mal', title: 'Jat King of Bharatpur', color: 'text-orange-400', border: 'border-orange-600' }
};

export const AIDebateRoom: React.FC<{
  campaignStage: CampaignStage;
  treasuryMohurs: number;
  setTreasuryMohurs: React.Dispatch<React.SetStateAction<number>>;
  morale: number;
  setMorale: React.Dispatch<React.SetStateAction<number>>;
  provisions: number;
  setProvisions: React.Dispatch<React.SetStateAction<number>>;
}> = ({ campaignStage, treasuryMohurs, setTreasuryMohurs, morale, setMorale, provisions, setProvisions }) => {
  const [debate, setDebate] = useState<DebateSession>(FALLBACK_DEBATES[campaignStage] || FALLBACK_DEBATES[CampaignStage.NIZAM_CAMPAIGN]);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [activeDialogueIndex, setActiveDialogueIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [choiceMade, setChoiceMade] = useState<boolean>(false);
  const [selectedGeneral, setSelectedGeneral] = useState<string | null>(null);

  // Text writer effect
  useEffect(() => {
    setDisplayedText('');
    let idx = 0;
    const speechText = debate.dialogues[activeDialogueIndex]?.speech || '';
    if (!speechText) return;

    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + speechText.charAt(idx));
      idx++;
      if (idx >= speechText.length) {
        clearInterval(timer);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [activeDialogueIndex, debate]);

  // Load debate on campaignStage change
  useEffect(() => {
    setDebate(FALLBACK_DEBATES[campaignStage] || FALLBACK_DEBATES[CampaignStage.NIZAM_CAMPAIGN]);
    setActiveDialogueIndex(0);
    setChoiceMade(false);
    setSelectedGeneral(null);
    setApiStatus('idle');
  }, [campaignStage]);

  // Handle calling real Gemini AI Studio
  const handleQueryGemini = async () => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      alert("No valid GEMINI_API_KEY found in environment secrets. Using local high-fidelity historical debate configuration.");
      setApiStatus('failed');
      return;
    }

    setLoading(true);
    setApiStatus('idle');

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a historical adviser for the game 'Panipat: 1761'.
The campaign is currently in stage: "${campaignStage}".
Current player stats: Treasury Gold: ${treasuryMohurs} Mohurs, Army Morale: ${morale}%, Food Provisions: ${provisions}.

Generate a JSON object representing a tactical debate between three Maratha commanders (Sadashivrao Bhau, Malharrao Holkar, and Ibrahim Khan Gardi) discussing the strategy for this stage.
The output MUST be valid JSON matching this schema:
{
  "topic": "Title of the strategic topic of debate",
  "dialogues": [
    {
      "general": "Sadashivrao Bhau",
      "avatarKey": "bhau",
      "stance": "His proposal stance (e.g. entrenched fortify)",
      "speech": "One paragraph of detailed dialogue about this stage in an 18th-century epic historical tone."
    },
    {
      "general": "Malharrao Holkar",
      "avatarKey": "holkar",
      "stance": "His proposal stance (e.g. mobile cavalry raid)",
      "speech": "One paragraph of dialogue."
    },
    {
      "general": "Ibrahim Khan Gardi",
      "avatarKey": "gardi",
      "stance": "His proposal stance (e.g. European line guns)",
      "speech": "One paragraph of dialogue."
    }
  ],
  "options": [
    {
      "generalName": "Sadashivrao Bhau",
      "avatarKey": "bhau",
      "choiceLabel": "Short choice description",
      "effectsSummary": "Summary of effects (e.g. +20 morale, -12,000 Gold)",
      "effects": {
        "gold": -12000,
        "morale": 20,
        "provisions": 40
      }
    },
    {
      "generalName": "Malharrao Holkar",
      "avatarKey": "holkar",
      "choiceLabel": "Short choice description",
      "effectsSummary": "Summary of effects",
      "effects": {
        "gold": -5000,
        "morale": 10,
        "provisions": -10
      }
    },
    {
      "generalName": "Ibrahim Khan Gardi",
      "avatarKey": "gardi",
      "choiceLabel": "Short choice description",
      "effectsSummary": "Summary of effects",
      "effects": {
        "gold": -15000,
        "morale": 25,
        "provisions": -20
      }
    }
  ]
}
DO NOT add markdown formatting. Just output raw JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      // Clean possible markdown wrapper if any
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.topic && parsed.dialogues && parsed.options) {
        setDebate(parsed);
        setActiveDialogueIndex(0);
        setChoiceMade(false);
        setSelectedGeneral(null);
        setApiStatus('success');
      } else {
        throw new Error("Invalid response format received from Gemini");
      }

    } catch (err) {
      console.error("Gemini debate generation error: ", err);
      setApiStatus('failed');
      alert("Error generating debate from Gemini. Falling back to local high-fidelity historical debate layout.");
    } finally {
      setLoading(false);
    }
  };

  const currentLine = debate.dialogues[activeDialogueIndex];
  const charMeta = currentLine ? CHARACTER_DETAILS[currentLine.avatarKey] : null;

  const handleSelectOption = (opt: GeneralOption) => {
    if (choiceMade) return;
    setChoiceMade(true);
    setSelectedGeneral(opt.generalName);

    // Apply effects
    setTreasuryMohurs((prev) => Math.max(0, prev + opt.effects.gold));
    setMorale((prev) => Math.min(100, Math.max(0, prev + opt.effects.morale)));
    setProvisions((prev) => Math.max(0, prev + opt.effects.provisions));
  };

  return (
    <div className="bg-stone-900 border border-stone-850 p-6 rounded-sm text-left shadow-2xl relative">
      <div className="flex justify-between items-center border-b border-stone-800 pb-3 mb-4">
        <div>
          <h3 className="font-serif text-base text-saffron uppercase tracking-widest font-black flex items-center gap-2">
            <Sparkles size={18} className="text-saffron animate-pulse" /> War Council Debate Room
          </h3>
          <p className="text-[10px] text-stone-500 font-mono mt-0.5">VISUAL NOVEL DECISION ARENA</p>
        </div>
        <button
          onClick={handleQueryGemini}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-mono text-[9px] font-black uppercase tracking-wider rounded-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles size={12} /> {loading ? 'Consulting Gemini...' : 'Query Gemini AI'}
        </button>
      </div>

      {/* Campaign context info banner */}
      <div className="bg-stone-950/60 p-3 border border-stone-850 mb-6 rounded-sm text-xs leading-relaxed text-stone-400 font-sans flex justify-between items-center gap-4">
        <div>
          <span className="text-saffron font-bold uppercase tracking-wider font-mono mr-1">Current Stage:</span>
          <span className="text-stone-300 font-serif font-black">{campaignStage.replace(/_/g, ' ')}</span>
          <p className="text-[10px] text-stone-500 mt-0.5">The debate will center on resolving this phase of the military expedition.</p>
        </div>
        <div className="flex gap-4 shrink-0 text-[10px] font-mono border-l border-stone-800 pl-4">
          <div className="text-center">
            <div className="text-saffron font-bold">{treasuryMohurs.toLocaleString()}</div>
            <div className="text-stone-600 uppercase">GOLD</div>
          </div>
          <div className="text-center">
            <div className="text-orange-500 font-bold">{morale}%</div>
            <div className="text-stone-600 uppercase">MORALE</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">{provisions}</div>
            <div className="text-stone-600 uppercase">PROV.</div>
          </div>
        </div>
      </div>

      {/* Parchment Visual Novel Dialogue Screen */}
      <div className="bg-[#e9dcc4] text-stone-900 border-2 border-[#b09e7c] rounded-md p-6 min-h-[300px] flex flex-col justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.15)] relative overflow-hidden font-serif">
        
        {/* Topic Title */}
        <div className="text-center text-[11px] font-mono uppercase tracking-[0.2em] text-[#5c4a24] font-black border-b border-[#d4c8ab] pb-2 mb-4">
          DEBATE TOPIC: {debate.topic}
        </div>

        {/* Character Portrait & Text */}
        <div className="flex flex-col md:flex-row gap-6 items-center flex-1 my-2">
          
          {/* Portrait Sigil Box */}
          <div className="w-24 h-24 rounded-full border-4 border-[#b4a076] bg-[#fdfaf2] flex items-center justify-center shrink-0 shadow-lg overflow-hidden relative">
            {currentLine?.avatarUrl ? (
              <img src={currentLine.avatarUrl} alt={currentLine.general} className="w-full h-full object-cover" />
            ) : (
              <div className="text-2xl text-[#b4a076] font-serif font-black uppercase">
                {currentLine?.general.substring(0, 2)}
              </div>
            )}
            <div className="absolute bottom-0 w-full bg-black/60 text-[7px] text-white py-0.5 uppercase tracking-widest text-center font-mono font-bold">
              {currentLine?.avatarKey}
            </div>
          </div>

          {/* Dialog bubble */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`font-serif text-sm font-black tracking-wide uppercase ${charMeta?.color || 'text-stone-900'}`}>
                {currentLine?.general}
              </span>
              <span className="text-[9px] font-mono bg-[#ded0b1] text-[#6d5b35] px-1.5 py-0.5 border border-[#c5b898] rounded-sm font-bold uppercase">
                {currentLine?.stance}
              </span>
            </div>
            <p className="text-sm text-stone-850 font-serif leading-relaxed italic pr-2 min-h-[70px]">
              "{displayedText}"
            </p>
          </div>
        </div>

        {/* Visual Novel Progression Controls */}
        <div className="flex justify-between items-center border-t border-[#d4c8ab] pt-3 mt-4 text-[10px] font-mono text-[#5c4a24]">
          <div>
            GENERATION STAT: {apiStatus === 'success' ? (
              <span className="text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={12}/> Gemini Gen</span>
            ) : apiStatus === 'failed' ? (
              <span className="text-rose-700 font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> Fallback config</span>
            ) : (
              <span className="text-stone-500 font-bold uppercase tracking-wider">Default</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDialogueIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeDialogueIndex === 0}
              className="px-2 py-1 bg-[#ded0b1] hover:bg-[#c5b898] disabled:opacity-40 text-stone-900 border border-[#b8a987] font-bold uppercase rounded-sm cursor-pointer transition-all"
            >
              PREV
            </button>
            <span className="py-1 px-1 font-black">
              {activeDialogueIndex + 1} / {debate.dialogues.length}
            </span>
            <button
              onClick={() => setActiveDialogueIndex((prev) => Math.min(debate.dialogues.length - 1, prev + 1))}
              disabled={activeDialogueIndex === debate.dialogues.length - 1}
              className="px-2 py-1 bg-[#ded0b1] hover:bg-[#c5b898] disabled:opacity-40 text-stone-900 border border-[#b8a987] font-bold uppercase rounded-sm cursor-pointer transition-all"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* Decision options panel */}
      <div className="mt-6">
        <h4 className="font-serif text-xs text-stone-300 uppercase tracking-wider mb-3 font-bold flex items-center gap-1">
          <HelpCircle size={14} className="text-saffron" /> Align Command Stance:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {debate.options.map((opt, idx) => {
            const isSelected = selectedGeneral === opt.generalName;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                disabled={choiceMade}
                className={`text-left p-4 rounded-sm border transition-all flex flex-col justify-between min-h-[110px] ${choiceMade ? (isSelected ? 'border-saffron bg-saffron/10 text-white' : 'border-stone-850 bg-stone-950/40 opacity-40 text-stone-500') : 'border-stone-800 bg-stone-950/80 hover:border-saffron hover:bg-stone-900 cursor-pointer hover:shadow-lg active:scale-95'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-saffron uppercase font-black">{opt.generalName}</span>
                    {isSelected && <span className="text-[8px] font-mono bg-saffron text-black px-1.5 py-0.5 rounded-sm font-bold">SIDED WITH</span>}
                  </div>
                  <div className="font-serif text-xs font-bold text-stone-200 group-hover:text-white leading-normal">
                    {opt.choiceLabel}
                  </div>
                </div>
                <div className="border-t border-stone-850 mt-2.5 pt-2 flex justify-between items-center text-[9px] font-mono">
                  <span className="text-stone-500">EFFECTS:</span>
                  <span className="text-stone-300 font-bold">{opt.effectsSummary}</span>
                </div>
              </button>
            );
          })}
        </div>

        {choiceMade && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 border border-saffron/30 bg-saffron/5 text-stone-300 rounded-sm text-xs text-center font-sans leading-relaxed"
          >
            ⚔️ <strong>Resolving Debate Stance:</strong> Your choice has been ratified in the durbar registry ledger. Treasury Mohurs, troop morale, and food provisions adjusted accordingly.
          </motion.div>
        )}
      </div>

    </div>
  );
};
