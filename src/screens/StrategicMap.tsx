import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, Swords, MapPin, Gavel, Map as MapIcon, History, Shield, Volume2, Play, Compass, Info, X, Coins, Scroll, Users, Award, BookOpen, MessageSquare, Check } from 'lucide-react';
import { TopBar, SideNav } from '../components/SharedUI';
import { Screen, CampaignStage } from '../types';
import { DiplomacyDarbar, DiplomaticRewards } from '../components/DiplomacyDarbar';
import { CommanderMessenger } from '../components/CommanderMessenger';
import { RoyalBanner } from '../components/RoyalBanner';

interface PolicyCardOption {
  id: string;
  name: string;
  type: 'Military' | 'Economic';
  icon: string;
  effect: string;
  desc: string;
}

interface AllianceOption {
  id: string;
  name: string;
  leader: string;
  icon: string;
  benefit: string;
  desc: string;
}

const MILESTONE_POLICY_DATABASE = {
  maratha: {
    [CampaignStage.NIZAM_CAMPAIGN]: {
      name: "Udgir Battle Securing",
      date: "January 1760",
      lore: "A decisive artillery duel at Udgir completely subdued the Nizam of Hyderabad. Ibrahim Khan Gardi's French-trained flintlock infantry demonstrated absolute tactical dominance, forcing the Nizam to surrender critical northern fortresses and 60 Lakhs in state reparations.",
      policies: [
        {
          id: "gardi_flintlock_drill",
          name: "French Flintlock Drill",
          type: "Military" as const,
          icon: "⚔️",
          effect: "+30% Fire Mastery & Artillery Siege speed",
          desc: "Integrate European military drilling manuals pioneered by Monsieur Bussy."
        },
        {
          id: "deccan_speed_march",
          name: "Deccan Basalt Courier",
          type: "Economic" as const,
          icon: "🐎",
          effect: "+15% Army Speed & -10% Logistics waste",
          desc: "Utilize elite Maratha jasoods (runners) to keep communications swift across the rugged basalt Ghats."
        }
      ],
      alliance: {
        id: "nizam_deccan_pact",
        name: "Deccan Rear Guard Treaty",
        leader: "Salabat Jung (Nizam)",
        icon: "📜",
        benefit: "Ensures secure backing and intercepts hostile southern incursions.",
        desc: "Secure full non-aggression protocols from the Nizam prior to departing for Hindusthan."
      }
    },
    [CampaignStage.PUNE]: {
      name: "Pune Shaniwar Wada Decree",
      date: "March 1760",
      lore: "Within the massive spiked teak gates of Shaniwar Wada, Peshwa Balaji Baji Rao convened a tense financial and political cabinet. Confronted by 15 Lakh Mohurs in military debt and Gopikabai's dynastic claims, the state command structure had to be forged.",
      policies: [
        {
          id: "shaniwar_war_bonds",
          name: "Shaniwar State Bonds",
          type: "Economic" as const,
          icon: "🪙",
          effect: "Unlocks +80,000 Gold Mohurs to support paid mercenaries",
          desc: "Mortgage ancestral Peshwa jewelries to wealthy southern Sahukars for immediate coin pay."
        },
        {
          id: "sovereign_dictate",
          name: "Supreme Jari Patka Mandate",
          type: "Military" as const,
          icon: "🚩",
          effect: "+25 Starting Troop Morale & absolute cohesion",
          desc: "Declare Sadashivrao Bhau as de-facto generalissimo, bypassing regional court rivalries."
        }
      ],
      alliance: {
        id: "holkar_scindia_vow",
        name: "Holkar-Scindia Blood Oath",
        leader: "Malharrao Holkar & Jankoji Scindia",
        icon: "🤝",
        benefit: "Combines 25,000 veteran cavalry columns to form the main army body.",
        desc: "Resolve deep personal rivalries between the two grand houses to guarantee absolute battlefield support."
      }
    },
    [CampaignStage.BURHANPUR]: {
      name: "Tapti Defile Operational Supply",
      date: "May 1760",
      lore: "Burhanpur acted as the grand transit hub. Regulating a caravan of 200,000 followers, including court ladies and pilgrims, demanded unprecedented grain management and supply-depot protection.",
      policies: [
        {
          id: "tapti_grain_foraging",
          name: "Yamuna Grassland Foraging",
          type: "Economic" as const,
          icon: "🌾",
          effect: "Logistics cost -20% and +30 Food reserves per stage",
          desc: "Deploy specialized barge columns to secure grain stockpiles along parallel river deltas."
        },
        {
          id: "scout_patroll_runners",
          name: "Ganimi Kava Patrols",
          type: "Military" as const,
          icon: "🏹",
          effect: "+20% Ambush Deflection and Cavalry charge",
          desc: "Despatch light horse scouts to secure deep river gorges against Rohilla patrols."
        }
      ],
      alliance: {
        id: "malwa_baron_credit",
        name: "Malwa Zemindar Compact",
        leader: "Local Malwa Administrators",
        icon: "🖋️",
        benefit: "Grants +40,000 gold and drafts 5,005 local scouts.",
        desc: "Sway the wealthy governors of Malwa to provide fresh horses and high-quality maps of river-crossings."
      }
    },
    [CampaignStage.GWALIOR]: {
      name: "Gwalior Sandstone War Council",
      date: "July 1760",
      lore: "Under the towering battlements of Gwalior Fort, Maharaja Suraj Mal of Bharatpur delivered a severe tactical warning: shed the heavy court family caravan and fight light, or be starved in a winter blockade. The choices here split history.",
      policies: [
        {
          id: "leave_baggage_light",
          name: "Suraj Mal Light Maneuvers",
          type: "Military" as const,
          icon: "🏇",
          effect: "+25% Movement Agility & +20% Cavalry shock damage",
          desc: "Leave court ladies and heavy bags in Gwalior Fort, launching a modular light assault."
        },
        {
          id: "heavy_artillery_stance",
          name: "Gardi Iron Artillery Stance",
          type: "Military" as const,
          icon: "💣",
          effect: "+35% Cannon Firepower and Fort Sieging",
          desc: "Maintain absolute faith in Gardi's wheeled ordnance carts, dismissing light tactics."
        }
      ],
      alliance: {
        id: "bharatpur_jat_shield",
        name: "Bharatpur Jat Shield",
        leader: "Maharaja Suraj Mal",
        icon: "🏰",
        benefit: "Secures massive food silos and safe rear retreats.",
        desc: "Establish a sacred friendship with the Jat ruler, locking in supply lines across Rajasthan."
      }
    },
    [CampaignStage.DELHI_NEGOTIATIONS]: {
      name: "Awadh Imperial Court Talks",
      date: "August 1760",
      lore: "The Grand Maratha Army captured Delhi's Red Fort, finding its vaults stripped bare. Across the Yamuna, the wealthy Nawab Shuja-ud-Daula balanced the scales. Securing his neutrality is essential to block Abdali's heavy funding.",
      policies: [
        {
          id: "red_fort_melt",
          name: "Melt Palace Gold Ceiling",
          type: "Economic" as const,
          icon: "👑",
          effect: "Immediate +120,000 Mohurs war pay at cost of -15 court trust",
          desc: "Strip the solid solver and gold leaves from the Diwan-i-Khas ceiling to pay starving soldiers."
        },
        {
          id: "doab_tariffs_rents",
          name: "Doab Agrarian Tolls",
          type: "Economic" as const,
          icon: "🌊",
          effect: "+45 Logistics Capacity & +80,000 Grain bags",
          desc: "Muster local tax enforcement to seize affluent granary locks in the fertile Doab."
        }
      ],
      alliance: {
        id: "shuja_neutrality_pact",
        name: "Awadh Non-Intervention Treaty",
        leader: "Nawab Shuja-ud-Daula",
        icon: "✉️",
        benefit: "Guarantees Shuja-ud-Daula rejects Abdali's offensive covenants.",
        desc: "Offer the direct position of Grand Imperial Wazir to Shuja to protect the eastern flank."
      }
    },
    [CampaignStage.SHINDE_STAND]: {
      name: "Barari Ghat Heroic Defiance",
      date: "September 1760",
      lore: "In a freezing dense fog, Dattaji Shinde's small rear guard was caught off guard by Abdali's river swim at Barari Ghat. Refusing to flee, Dattaji uttered his legendary dying words: 'We will fight again!' before falling on the riverbank.",
      policies: [
        {
          id: "dattajis_battle_fury",
          name: "Dattaji's Ultimate Defiance",
          type: "Military" as const,
          icon: "🩸",
          effect: "+40% Counter-Attack fury when outnumbered",
          desc: "Inculcate Dattaji's supreme battle cry of 'Bachenge to aur bhi ladenge!' among all divisions."
        },
        {
          id: "river_blockade_guards",
          name: "Yamuna Ferry Blockade",
          type: "Military" as const,
          icon: "🛡️",
          effect: "Reduces enemy surprise flanking damage by 30%",
          desc: "Erect fortified wooden lookouts and watch towers along all Yamuna ferry points."
        }
      ],
      alliance: {
        id: "rajput_scout_guild",
        name: "Rajput Border scouts",
        leader: "Marwar & Mewar Rangers",
        icon: "🧭",
        benefit: "Prevents surprise ambush attacks by revealing secret paths.",
        desc: "Retain skilled Rajput camel rangers to secure operational intelligence."
      }
    },
    [CampaignStage.DELHI_BATTLE]: {
      name: "Kunjpura Fortress Storming",
      date: "October 1760",
      lore: "Bhau launched a spectacular artillery assault against the heavily fortified Afghan supply base of Kunjpura. The fortress walls were reduced to rubble by Gardi's cannons, securing deep stores and executing Dattaji's slayer, Kutub Shah.",
      policies: [
        {
          id: "kunjpura_stores_seize",
          name: "Raid the Afghan Silos",
          type: "Economic" as const,
          icon: "🎒",
          effect: "Provides 150,000 food bags and +30% combat readiness",
          desc: "Seize the massive grain storage facilities constructed by Abdali's supply captains."
        },
        {
          id: "gardi_heavy_howitzers",
          name: "Howitzer Demolition Drills",
          type: "Military" as const,
          icon: "🎆",
          effect: "+40% Siege Damage & fortress breaching efficiency",
          desc: "Deploy Ibrahim Gardi's heavy French-pattern shell howitzers to systematically flatten stoneworks."
        }
      ],
      alliance: {
        id: "sikh_misl_harassment",
        name: "Sikh Misl Rear Harassment",
        leader: "Sardar Ala Singh (Patiala)",
        icon: "⚔️",
        benefit: "Slashes Abdali's communications, causing -20% enemy cohesion.",
        desc: "Forge a tactical compact with the Sikh misl warriors of Punjab to repeatedly raid Abdali's messengers."
      }
    },
    [CampaignStage.PANIPAT]: {
      name: "Panipat Battlefield Sacred Oath",
      date: "January 1761",
      lore: "Surrounded, starved, and shivering on the winter sands, the Maratha host decided to face their destiny. Rubbing holy turmeric on their faces, forty thousand warriors prepared to launch the final, supreme charge.",
      policies: [
        {
          id: "saffron_turmeric_oath",
          name: "Turmeric Sacred Resolution",
          type: "Military" as const,
          icon: "☀️",
          effect: "+50% Final Charge Attack power & ignores fatigue",
          desc: "Perform holy rituals, vowing to fight with absolute supreme fury until death or triumph."
        },
        {
          id: "gardis_trench_ring",
          name: "Chakra Artillery Trenches",
          type: "Military" as const,
          icon: "🔱",
          effect: "+40% Defensive shield lines against shocking armor",
          desc: "Entrench all Gardi flintlock lines behind massive heavy wooden cart frames to trap charging forces."
        }
      ],
      alliance: {
        id: "shaniwar_ultimate_will",
        name: "Ascendant Shivaji Legacy",
        leader: "Chhatrapati Sovereignty",
        icon: "🏵️",
        benefit: "Triggers absolute unity of all infantry & cavalry divisions.",
        desc: "Rally the entire camp around the supreme legacy of Chhatrapati Shivaji Maharaj."
      }
    }
  },
  durrani: {
    [CampaignStage.NIZAM_CAMPAIGN]: {
      name: "Kabul Frontier Conquest",
      date: "January 1760",
      lore: "Ahmad Shah Durrani launched a swift campaign to subjugate rebellious frontier clans guarding the Kabul slopes, securing his royal palace at Kabul and enrolling thousands of fierce Pashtun hill warriors.",
      policies: [
        {
          id: "khyber_tolls_levy",
          name: "Kabul Transit Tariffs",
          type: "Economic" as const,
          icon: "🪙",
          effect: "Generates +50,000 Gold Mohurs per stage",
          desc: "Impose royal duties on transit traders passing through the Hindu Kush ranges from Kabul."
        },
        {
          id: "pashtun_tribal_draft",
          name: "Pashtun Veteran Call",
          type: "Military" as const,
          icon: "⚔️",
          effect: "+30% Starting Troop Strength & heavy armor",
          desc: "Rally veteran hill clansmen under the crimson royal banners of the Shah."
        }
      ],
      alliance: {
        id: "border_clans_compact",
        name: "Afridi Mountain Pact",
        leader: "Frontier tribal Maliks",
        icon: "📜",
        benefit: "Guarantees absolute secure supply lines of messaging to Kabul.",
        desc: "Offer autonomous border terms to mountain tribes to lock out Maratha scout interference."
      }
    },
    [CampaignStage.PUNE]: {
      name: "Kandahar Council of Emirs",
      date: "March 1760",
      lore: "At the royal citadel of Kandahar, Ahmad Shah Durrani assembled the great Durbar of emirs. Balancing tribal claims and pledging fair division of Hindusthan's plunder secured total cohesion before crossing the Indus.",
      policies: [
        {
          id: "royal_decree_shah",
          name: "Pearl of Pearls Edict",
          type: "Military" as const,
          icon: "👑",
          effect: "Generals gain experience +25% faster",
          desc: "Establish Ahmad Shah's divine command as the 'Duri-i-Durran' (Pearl of Pearls)."
        },
        {
          id: "chief_plunder_split",
          name: "Pledge Plunder Segments",
          type: "Economic" as const,
          icon: "🎒",
          effect: "Recruitment fee -15% & +20 Starting Morale",
          desc: "Formally pledge equal shares of Delhi's rich tribute to all loyal tribal generals."
        }
      ],
      alliance: {
        id: "baloch_scouts_contract",
        name: "Baloch Light Camel Contract",
        leader: "Khan of Kalat",
        icon: "🐪",
        benefit: "Grants 6,000 desert scouts, speeding up trans-Indus speeds.",
        desc: "Form a solid covenant with the mobile desert chieftains of Balochistan."
      }
    },
    [CampaignStage.BURHANPUR]: {
      name: "Lahore Siege Operational Conquest",
      date: "May 1760",
      lore: "A rapid vanguard sweep by Sabaji Maratha was decisively countered. Durrani horsemen swarmed the river delta and captured the rich administrative granaries of Lahore, securing winter wheat stores.",
      policies: [
        {
          id: "lahore_silo_seize",
          name: "Sutlej Grain Silos",
          type: "Economic" as const,
          icon: "🌾",
          effect: "+30% Logistics capacity and +50,000 food bags",
          desc: "Requisition the sprawling food silos in the Punjab plains to feed the massive camp."
        },
        {
          id: "punjab_ferry_guards",
          name: "Five Rivers Speed Patrols",
          type: "Military" as const,
          icon: "🏇",
          effect: "+20% Cavalry speed across marshy terrains",
          desc: "Secure major ferry positions along the Sutlej and Ravi to ensure fluid march routes."
        }
      ],
      alliance: {
        id: "punjabi_zemindar_deal",
        name: "Sutlej Zemindar Accord",
        leader: "Punjab Muslim Landlords",
        icon: "🖋️",
        benefit: "Provides 10,000 local infantry recruits.",
        desc: "Offer protection to local agrarian centers in exchange for horses, fodder, and scouts."
      }
    },
    [CampaignStage.GWALIOR]: {
      name: "Rohilkhand Afghan Covenant",
      date: "July 1760",
      lore: "The crucial alliance. Najib-ud-Daula, the diplomat-prince of Rohilkhand, pledged the complete dedication of his Afghan settlements, providing 20,000 fierce warriors and massive food storehouses.",
      policies: [
        {
          id: "rohilla_food_pipelines",
          name: "Terai Supply Pipelines",
          type: "Economic" as const,
          icon: "🌲",
          effect: "Eliminates all winter decay penalties & +30 Logistics",
          desc: "Create safe, hidden pathways through the Terai woods to transport grain bags."
        },
        {
          id: "najibs_intel_runners",
          name: "Najib's Secret Spy Runners",
          type: "Military" as const,
          icon: "👣",
          effect: "Reveals exact positions of Maratha heavy howitzers",
          desc: "Utilize local Rohilla spies dressed as humble peasants to track the enemy's positions."
        }
      ],
      alliance: {
        id: "rohilkhand_blood_vow",
        name: "Rohilkhand Blood vow",
        leader: "Najib-ud-Daula",
        icon: "🤝",
        benefit: "Includes 20,000 veteran Rohilla skirmishers under Najib's command.",
        desc: "Sign a sacred covenant under Najib-ud-Daula to defend the Rohilla homelands from Maratha raids."
      }
    },
    [CampaignStage.DELHI_NEGOTIATIONS]: {
      name: "Awadh Siyar Council Negotiations",
      date: "August 1760",
      lore: "The powerful Nawab Shuja-ud-Daula of Awadh held a grand court on the Yamuna banks. Najib-ud-Daula personally crossed the river carrying a holy Koran, persuading Shuja to join the Durrani Coalition to defend northern soil.",
      policies: [
        {
          id: "holy_coalition_edict",
          name: "Holy Coalition Edict",
          type: "Military" as const,
          icon: "☀️",
          effect: "+25% Infantry firepower and +20 starting Morale",
          desc: "Declare a grand coalition defensive effort, attracting thousands of volunteer Ghazis."
        },
        {
          id: "awadh_silver_bond",
          name: "Awadh Silver Subsidies",
          type: "Economic" as const,
          icon: "🪙",
          effect: "Grants +120,000 Gold Mohurs war fund",
          desc: "Secure direct silver treasury loans from the wealthy Awadh capital of Lucknow."
        }
      ],
      alliance: {
        id: "awadh_elite_army_join",
        name: "Awadh Coalition Force Join",
        leader: "Nawab Shuja-ud-Daula",
        icon: "✉️",
        benefit: "Unlocks Shuja-ud-Daula's 15,000 French-drilled heavy musketeers.",
        desc: "Sway the Nawab of Awadh to cross the river with his entire veteran army, sealing the Maratha's eastern flank."
      }
    },
    [CampaignStage.SHINDE_STAND]: {
      name: "Yamuna Midnight Daring crossing",
      date: "September 1760",
      lore: "With Maratha guards blocking all obvious ferry crossings, Ahmad Shah Durrani conducted a legendary, stealthy midnight swim across the deep river waters of Yamuna, trapping enemy scouting divisions.",
      policies: [
        {
          id: "midnight_swim_dare",
          name: "Yamuna Midnight Swim Dare",
          type: "Military" as const,
          icon: "🌊",
          effect: "+40% Tactical surprise and ambush attack success",
          desc: "Conduct a bold crossing of the flooded river, completely bypassing the enemy front lines."
        },
        {
          id: "scout_raid_runners",
          name: "Scout Blockade Raids",
          type: "Military" as const,
          icon: "🍂",
          effect: "Severely delays enemy reinforcements, slicing coordination",
          desc: "Deploy highly agile horsemen to intercept Maratha messenger runners."
        }
      ],
      alliance: {
        id: "gujar_ford_guide",
        name: "Gujar Local Fords Guild",
        leader: "Local Gujar Shepherd clans",
        icon: "🧭",
        benefit: "Sells secret coordinates of shallow river passage points.",
        desc: "Deploy local shepherds to map safe paths across the muddy riverbanks."
      }
    },
    [CampaignStage.DELHI_BATTLE]: {
      name: "Delhi Outposts Starvation Blockade",
      date: "October 1760",
      lore: "Rather than risking a bloody direct charge on Delhi's massive stone walls, the Shah ordered a total operational blockade, cutting off Maratha supply routes and starving their massive camp.",
      policies: [
        {
          id: "grain_blockade_strike",
          name: "Strict Grain Blockade",
          type: "Economic" as const,
          icon: "💣",
          effect: "-25% enemy combat readiness per week of campaign",
          desc: "Fortify all outer roadways, capturing and executing any incoming grain traders."
        },
        {
          id: "zamburak_sledge_fire",
          name: "Zamburak Sledge Fire",
          type: "Military" as const,
          icon: "🔥",
          effect: "+35% swivel gun bombardment firepower",
          desc: "Assemble camel-mounted Zamburak light tactical weapons on portable sledges to harass outposts."
        }
      ],
      alliance: {
        id: "delhi_court_informants",
        name: "Mughal Red Fort Informants",
        leader: "Imperial Palace Princesses",
        icon: "🔑",
        benefit: "Grants access to hidden underground food tunnels in the Red Fort.",
        desc: "Cultivate secret political ties with Mughal palace lines who oppose Maratha control."
      }
    },
    [CampaignStage.PANIPAT]: {
      name: "Panipat Plains Grand Deployment",
      date: "January 1761",
      lore: "On the historic field of Panipat, Ahmad Shah Durrani deployed his elite trans-Indus heavy lancers and camel-mounted swivel-cannon batteries to face the desperate, final Maratha square attack.",
      policies: [
        {
          id: "shah_guard_charge",
          name: "Shah's Personal Guard Charge",
          type: "Military" as const,
          icon: "⚔️",
          effect: "+40% Heavy cavalry horse shock break-power",
          desc: "Unleash the Shah's personal division of 10,000 armored Ghulam swordsmen."
        },
        {
          id: "zamburak_fortified_line",
          name: "Zamburak Fortified Line",
          type: "Military" as const,
          icon: "🐪",
          effect: "+30% rapid swivel-cannon volley fire damage",
          desc: "Line up hundreds of camel swivel guns in a fortified semicircle to deliver lethal crossfires."
        }
      ],
      alliance: {
        id: "pashtun_united_will",
        name: "Coalition United Steel Covenant",
        leader: "Durrani Shah & Chieftains",
        icon: "🏆",
        benefit: "Rallies absolute high cohesion (+50%) for the final clash.",
        desc: "Excite the entire Afghan coalition with the supreme promise of historic victory."
      }
    }
  }
};

export const StrategicMap: React.FC<{ 
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
  campaignStage: CampaignStage;
  onAdvance: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose, campaignStage, onAdvance, onHelp, onSettings }) => {

  const [showBriefing, setShowBriefing] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // The immutable core faction selected by the player in the Main Menu
  const playingFaction = React.useMemo<'maratha' | 'durrani'>(() => {
    return (localStorage.getItem('panipat_campaign_faction') as 'maratha' | 'durrani') || 'maratha';
  }, []);

  const [activeFaction, setActiveFaction] = useState<'maratha' | 'durrani'>(() => {
    return playingFaction;
  });

  // Civilization Strategy Resources States
  const [treasuryMohurs, setTreasuryMohurs] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_treasury');
    return saved ? Number(saved) : 145000;
  });
  const [provisions, setProvisions] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_provisions');
    return saved ? Number(saved) : 380;
  });
  const [morale, setMorale] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_morale');
    return saved ? Number(saved) : 75;
  });

  // Active Decree overlay notifications
  const [activeDecreeNotification, setActiveDecreeNotification] = useState<{
    id: string;
    commander: string;
    title: string;
    text: string;
    effects?: string;
  } | null>(null);

  // Civilization Barbarian Raiders data
  const [barbarians, setBarbarians] = useState<{
    [zoneId: string]: {
      active: boolean;
      tribe: string;
      strength: number;
      threat: 'Low' | 'Medium' | 'Severe';
    };
  }>({
    'punjab': { active: true, tribe: 'Ghilzai Horse Raiders', strength: 65, threat: 'Severe' },
    'sutlej': { active: true, tribe: 'Sutlej River Rebels', strength: 35, threat: 'Medium' },
    'doab': { active: true, tribe: 'Sikh Khalsa Skirmishers', strength: 40, threat: 'Medium' },
    'thar': { active: false, tribe: 'Rajput Renegades', strength: 20, threat: 'Low' },
    'bundelkhand': { active: true, tribe: 'Pindari Bandits', strength: 45, threat: 'Medium' },
    'bengal': { active: false, tribe: 'Arakanese Pirates', strength: 15, threat: 'Low' },
    'highlands': { active: true, tribe: 'Afridi Hill Tribesmen', strength: 80, threat: 'Severe' },
    'rajputana': { active: false, tribe: 'Mewar Outlaws', strength: 30, threat: 'Low' },
    'rohilla': { active: false, tribe: 'Rohilla Insurgents', strength: 35, threat: 'Low' },
    'kandahar_foothill': { active: true, tribe: 'Durrani Border Rebels', strength: 55, threat: 'Medium' },
    'peshawar': { active: true, tribe: 'Afridi Gorge Clans', strength: 75, threat: 'Severe' },
    'upper_indus': { active: false, tribe: 'Kush Marauders', strength: 25, threat: 'Low' },
    'multan': { active: false, tribe: 'Cholistan Bandits', strength: 30, threat: 'Low' },
    'kashmir': { active: false, tribe: 'Pir Panjal Outlaws', strength: 20, threat: 'Low' },
    'ajmer': { active: false, tribe: 'Aravalli Bandits', strength: 30, threat: 'Low' },
    'konkan': { active: false, tribe: 'Coastal Outlaws', strength: 35, threat: 'Low' },
    'gwalior_front': { active: true, tribe: 'Chambal Ravine Dacoits', strength: 50, threat: 'Medium' },
    'narmada': { active: true, tribe: 'Satpura Jungle Bandits', strength: 55, threat: 'Medium' },
    'vidarbha': { active: false, tribe: 'Vidarbha Pillagers', strength: 30, threat: 'Low' },
    'himachal': { active: false, tribe: 'Garhwal Outlaws', strength: 25, threat: 'Low' },
    'kurukshetra': { active: true, tribe: 'Panipat Skirmishers', strength: 45, threat: 'Medium' },
    'himalaya': { active: true, tribe: 'Terai Swamp Outlaws', strength: 50, threat: 'Medium' },
    'mathura': { active: false, tribe: 'Yamuna Raiders', strength: 20, threat: 'Low' },
    'lucknow': { active: false, tribe: 'Awadh Rioters', strength: 25, threat: 'Low' },
    'bihar': { active: false, tribe: 'Mid-Ganges Dacoits', strength: 30, threat: 'Low' },
    'nagpur': { active: true, tribe: 'Nagpur Sal Outlaws', strength: 40, threat: 'Medium' },
    'malabar': { active: false, tribe: 'Malabar Pirates', strength: 35, threat: 'Low' }
  });

  const [isFighting, setIsFighting] = useState<boolean>(false);
  const [combatOutcome, setCombatOutcome] = useState<string | null>(null);

  const [isOpponentScouted, setIsOpponentScouted] = useState<boolean>(false);
  const [scoutingState, setScoutingState] = useState<'idle' | 'searching' | 'success' | 'failed'>('idle');
  const [scoutMessage, setScoutMessage] = useState<string>('');
  const [showDiplomacy, setShowDiplomacy] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const handleApplyDiplomaticRewards = (rewards: DiplomaticRewards) => {
    // 1. Update gold
    const savedGold = localStorage.getItem('panipat_campaign_treasury');
    const goldVal = savedGold ? Number(savedGold) : 145000;
    const newGold = goldVal + rewards.gold;
    localStorage.setItem('panipat_campaign_treasury', newGold.toString());
    setTreasuryMohurs(newGold);

    // 2. Update provisions
    const savedProv = localStorage.getItem('panipat_campaign_provisions');
    const provVal = savedProv ? Number(savedProv) : 380;
    const newProv = provVal + rewards.provisions;
    localStorage.setItem('panipat_campaign_provisions', newProv.toString());
    setProvisions(newProv);

    // 3. Update morale
    const savedMorale = localStorage.getItem('panipat_campaign_morale');
    const moraleVal = savedMorale ? Number(savedMorale) : 75;
    const newMorale = Math.min(100, moraleVal + rewards.morale);
    localStorage.setItem('panipat_campaign_morale', newMorale.toString());
    setMorale(newMorale);

    // Also trigger feedback notice
    setActiveNotification(`DIPLOMATIC PACT SECURED! +${rewards.gold.toLocaleString()} Gold, +${rewards.provisions} Provisions, +${rewards.morale}% Morale. ${rewards.text}`);
    
    // Auto clear notification after 6 seconds
    setTimeout(() => {
      setActiveNotification(null);
    }, 6500);
  };

  const handleDeployScouts = () => {
    setScoutingState('searching');
    setScoutMessage('Deploying stealthy Harkara riders into the uncharted riverbanks...');
    
    setTimeout(() => {
      // Fuzzy roll - opponent has highly alert guards, so 55% chance to succeed.
      const isSuccessfulScout = Math.random() < 0.55;
      
      if (isSuccessfulScout) {
        setScoutingState('success');
        setScoutMessage('SUCCESS! Our scouts successfully mapped the rival army’s routes and locations.');
        setTimeout(() => {
          setIsOpponentScouted(true);
        }, 1500);
      } else {
        setScoutingState('failed');
        setScoutMessage('CAPTURE DETECTED! Najib-ud-Daula’s scouting cavalry intercepted our runners at the riverside. Try again later!');
      }
    }, 1500);
  };

  const handleCombatAction = (optionType: 'regular' | 'ambush' | 'scorch') => {
    if (!selectedZone) return;
    const threat = barbarians[selectedZone.id];
    if (!threat || !threat.active) return;

    let costGold = 0;
    let costProvisions = 0;
    let costMorale = 0;
    let successChance = 0.5;

    if (optionType === 'regular') {
      costGold = 12000;
      successChance = 0.85;
    } else if (optionType === 'ambush') {
      costProvisions = 45;
      successChance = 0.65;
    } else if (optionType === 'scorch') {
      costMorale = 15;
      successChance = 1.0;
    }

    // Check resources
    if (treasuryMohurs < costGold) {
      alert("Lack of sufficient war gold in treasury chests!");
      return;
    }
    if (provisions < costProvisions) {
      alert("Lack of sufficient food provisions for the ambush campaign!");
      return;
    }
    if (morale < costMorale) {
      alert("Army morale is too low to enact scorched-earth orders!");
      return;
    }

    // Deduct
    const newGold = treasuryMohurs - costGold;
    const newProv = provisions - costProvisions;
    const newMorale = Math.max(5, morale - costMorale);

    localStorage.setItem('panipat_campaign_treasury', newGold.toString());
    localStorage.setItem('panipat_campaign_provisions', newProv.toString());
    localStorage.setItem('panipat_campaign_morale', newMorale.toString());

    setTreasuryMohurs(newGold);
    setProvisions(newProv);
    setMorale(newMorale);

    setIsFighting(true);
    setCombatOutcome(null);

    // Roll result after animation
    setTimeout(() => {
      const roll = Math.random();
      const isWin = roll < successChance;

      setIsFighting(false);

      if (isWin) {
        // Clear threat
        setBarbarians(prev => ({
          ...prev,
          [selectedZone.id]: { ...prev[selectedZone.id], active: false }
        }));

        // Reward gold or rations
        const rewardGold = optionType === 'ambush' ? 25000 : 8000;
        const rewardProv = optionType === 'regular' ? 40 : 0;
        const rewardMorale = 10;

        const updatedGold = newGold + rewardGold;
        const updatedProv = newProv + rewardProv;
        const updatedMorale = Math.min(100, newMorale + rewardMorale);

        localStorage.setItem('panipat_campaign_treasury', updatedGold.toString());
        localStorage.setItem('panipat_campaign_provisions', updatedProv.toString());
        localStorage.setItem('panipat_campaign_morale', updatedMorale.toString());

        setTreasuryMohurs(updatedGold);
        setProvisions(updatedProv);
        setMorale(updatedMorale);

        // Notify
        const cmd = playingFaction === 'maratha' ? 'Sadashivrao Bhau' : 'Ahmad Shah Durrani';
        
        setActiveDecreeNotification({
          id: String(Date.now()),
          commander: cmd,
          title: `VICTORY OVER ${threat.tribe.toUpperCase()}`,
          text: `Our dynamic defense operations successfully repelled the local raider host in the ${selectedZone.name}! Plunder confiscated and logistics restored.`,
          effects: `+${rewardGold.toLocaleString()} Gold • +${rewardProv} provisions • +10% Army Morale Cohesion`
        });
      } else {
        // Lost
        const penaltyMorale = 15;
        const lostMorale = Math.max(5, newMorale - penaltyMorale);
        localStorage.setItem('panipat_campaign_morale', lostMorale.toString());
        setMorale(lostMorale);

        const cmd = playingFaction === 'maratha' ? 'Sadashivrao Bhau' : 'Ahmad Shah Durrani';
        setActiveDecreeNotification({
          id: String(Date.now()),
          commander: cmd,
          title: "DEFENSIVE REVERSAL",
          text: `Our intercepting patrols were outmaneuvered in the rugged hills of ${selectedZone.name}! The pillager bandits escaped with local herd cattle.`,
          effects: `-15% Army Morale penalty`
        });
      }
    }, 1200);
  };

  const handleIssueDecree = (decreeType: 'rations' | 'taxes' | 'conscript') => {
    if (!selectedZone) return;

    const cmd = playingFaction === 'maratha' ? 'Sadashivrao Bhau' : 'Ahmad Shah Durrani';
    let addedGold = 0;
    let addedProv = 0;
    let addedMorale = 0;

    let subGold = 0;
    let subProv = 0;
    let subMorale = 0;

    let decreeTitle = "";
    let decreeText = "";
    let effectsStr = "";

    if (decreeType === 'rations') {
      addedProv = 80;
      subMorale = 12;
      decreeTitle = "Grain Conscription Decree";
      decreeText = `Requisitioned emergency grain crops and livestock herds from the local peasants of ${selectedZone.name} to fill our army's marching baggage wagons!`;
      effectsStr = `+80 Tons Provisions • -12% Army Morale (due to local distress complaints)`;
    } else if (decreeType === 'taxes') {
      addedGold = 35000;
      subMorale = 10;
      decreeTitle = "Imperial War Levy";
      decreeText = `Enforced a swift war tax and gold collection in ${selectedZone.name} to clear the heavy pending payroll arrears of our veteran infantry squadrons!`;
      effectsStr = `+35,000 War Gold Mohurs • -10% Army Cohesion Morale (civilian distress)`;
    } else if (decreeType === 'conscript') {
      addedMorale = 15;
      subGold = 20050;
      decreeTitle = "Vanguard Conscription Decree";
      decreeText = `Enacted mandatory youth military integration and scouts conscription in ${selectedZone.name}, dispersing bonus silver coins to the new recruits.`;
      effectsStr = `+15% Army Cohesion Morale • -20,050 Gold Chest mohurs`;
    }

    if (treasuryMohurs < subGold) {
      alert("Lack of sufficient war gold coins in the military chests to deploy bonuses!");
      return;
    }

    const nextGold = treasuryMohurs + addedGold - subGold;
    const nextProv = provisions + addedProv - subProv;
    const nextMorale = Math.min(100, Math.max(5, morale + addedMorale - subMorale));

    localStorage.setItem('panipat_campaign_treasury', nextGold.toString());
    localStorage.setItem('panipat_campaign_provisions', nextProv.toString());
    localStorage.setItem('panipat_campaign_morale', nextMorale.toString());

    setTreasuryMohurs(nextGold);
    setProvisions(nextProv);
    setMorale(nextMorale);

    setActiveDecreeNotification({
      id: String(Date.now()),
      commander: cmd,
      title: decreeTitle.toUpperCase(),
      text: decreeText,
      effects: effectsStr
    });
  };

  const initAudio = () => {
    if (!audioInitialized) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      setAudioInitialized(true);
      // Play ambient drum beat sound synthetic
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(40, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
      osc.start();
      osc.stop(audioCtx.currentTime + 2);
    }
    setShowBriefing(false);
  };
  
  const [showPunePolitics, setShowPunePolitics] = useState(false);
  const [puneStep, setPuneStep] = useState(0);
  const [puneChoices, setPuneChoices] = useState<{ [key: string]: string }>({});

  const [showGwaliorChambers, setShowGwaliorChambers] = useState(false);
  const [gwaliorChoices, setGwaliorChoices] = useState<{ [key: string]: string }>({});

  const [showDelhiAlliances, setShowDelhiAlliances] = useState(false);
  const [delhiChoices, setDelhiChoices] = useState<{ [key: string]: string }>({});

  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [showCabinet, setShowCabinet] = useState(false);
  const [mapMode, setMapMode] = useState<'campaign' | 'all'>('campaign');

  const [selectedPolicyForMessenger, setSelectedPolicyForMessenger] = useState<string | null>(null);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);

  const [stagePolicies, setStagePolicies] = useState<{ [stage: string]: string }>(() => {
    try {
      return JSON.parse(localStorage.getItem('panipat_stage_policies') || '{}');
    } catch {
      return {};
    }
  });

  const [stageAlliances, setStageAlliances] = useState<{ [stage: string]: string }>(() => {
    try {
      return JSON.parse(localStorage.getItem('panipat_stage_alliances') || '{}');
    } catch {
      return {};
    }
  });

  const [alliedTerritories, setAlliedTerritories] = useState<{ [zoneId: string]: boolean }>(() => {
    try {
      return JSON.parse(localStorage.getItem('panipat_allied_territories') || '{}');
    } catch {
      return {};
    }
  });

  // Hexagon grid parameters for Civilization VI inspired board
  const gridColWidth = 144;
  const gridRowHeight = 168;
  const gridRowStagger = 84;
  const gridLeftOffset = 20;
  const gridTopOffset = 800;

  const getTilePosition = (col: number, row: number) => {
    const left = col * gridColWidth + gridLeftOffset;
    const top = row * gridRowHeight + (col % 2 !== 0 ? gridRowStagger : 0) + gridTopOffset;
    return { top: `${top}px`, left: `${left}px` };
  };

  // 18th Century Regional Territory Survey representing full hexagonal map of Hindusthan
  const regionalZonesRaw = [
    {
      id: 'highlands',
      name: "Afghan Highlands",
      sub: "Kabul & Kandahar Ranges",
      col: 1,
      row: 9,
      topo: "Snowy summits of the Hindu Kush, rugged wind-swept ravines, and high dry gravel roads.",
      culture: "Homeland of veteran Pashtun Abdali clans, Yusufzai border tribes, and Baloch scouts.",
      tactical: "Severe altitude limits rapid baggage caravans. Natural hill barriers provide total protection.",
      history: "Ahmad Shah Durrani's royal sovereign base of recruitment, fielding over 40,000 elite horse swordsmen.",
      icon: "🏔️",
      alliance: "Durrani Core"
    },
    {
      id: 'kandahar_foothill',
      name: "Kandahar Foothills",
      sub: "Desert Gravel Ridges",
      col: 2,
      row: 8,
      topo: "Jagged foothills of boulder scree, dusty ravines, and ancient mud lookout outposts.",
      culture: "Loyal Ghilzai clansmen, camel herders, and royal escorts.",
      tactical: "Dry rocky desert ground limits swift infantry maneuvers. Moderate ambush defense.",
      history: "Guarded the critical southern approaches to Ahmad Shah Durrani's primary recruitment citadel.",
      icon: "⛰️",
      alliance: "Durrani Buffer"
    },
    {
      id: 'peshawar',
      name: "Khyber Pass Outer",
      sub: "Gorge Frontier Defiles",
      col: 1,
      row: 8,
      topo: "Steep rocky mountain passes and treacherous high altitude limestone ridges.",
      culture: "Armed Afridi clansmen and veteran trans-Indus Pashtun frontier defenders.",
      tactical: "Cavalry speed is severely penalized. Defending units gain strong archery force multiplier.",
      history: "The legendary gateway of Hindusthan. Over 30 grand historical invasions have traversed this narrow defile.",
      icon: "🏔️",
      alliance: "Durrani Ally"
    },
    {
      id: 'upper_indus',
      name: "Upper Indus Valley",
      sub: "Gilgit River Channels",
      col: 3,
      row: 3,
      topo: "Rushing glacial river channels, steep granite sheer cliffs, and ancient suspended rope bridges.",
      culture: "Dardic hill tribesmen, trans-Himalayan muleteers, and local scouts.",
      tactical: "Extreme torrent water hazard. Traversing forces suffer -15% speed in monsoon cycles.",
      history: "Represented the extreme northern trading corridor connecting Tibet with Punjab and Kashmir.",
      icon: "🌊",
      alliance: "Neutral Buffer"
    },
    {
      id: 'punjab',
      name: "Punjab: Five Rivers",
      sub: "Sutlej, Ravi, & Jhelum",
      col: 3,
      row: 4,
      topo: "Vast fertile alluvial soils, expansive sugarcane fields, and green river corridors.",
      culture: "Inhabited by proud independent Sikh misls, Gakhars, and local Punjabi agrarian communities.",
      tactical: "Mighty river channels form critical strategic locks. Crossing blockades stop winter skirmishes.",
      history: "The rich breadbasket of northwest Hindusthan, hotly contested by Adina Beg and various local lords.",
      icon: "🌊",
      alliance: "Disputed"
    },
    {
      id: 'sutlej',
      name: "Sutlej River Plains",
      sub: "Sikh Frontier Outpost",
      col: 3,
      row: 5,
      topo: "Low-lying seasonal river wetlands, towering grass reedbeds, and rich silt channels.",
      culture: "Khalsa horsemen and local Akali defenders specialized in rapid river-ambushing maneuvers.",
      tactical: "Waterlogged fields cause heavy Gardi artillery carriages to risk swamp stagnation.",
      history: "Divided the Delhi Mughal sphere of influence from the northern Punjab kingdoms.",
      icon: "🌊",
      alliance: "Disputed Frontier"
    },
    {
      id: 'thar',
      name: "The Thar Desert",
      sub: "Great Marwar Sands",
      col: 2,
      row: 7,
      topo: "Blistering dry sand dunes, scorching daylight sun, and sparse acacia scrub forests.",
      culture: "Resolute Rajput clans of Marwar and Mewar, alongside Jat warriors of Bharatpur mudforts.",
      tactical: "Extreme heat exhaustion and camel logistics. Highly mobile light cavalry receives speed buffs.",
      history: "Sits on the western flank of the main interstate march. Requires active diplomacy to keep secure.",
      icon: "🐪",
      alliance: "Neutral/Rajputana"
    },
    {
      id: 'multan',
      name: "Multan Dry Basin",
      sub: "Indus Valley Confluence",
      col: 2,
      row: 6,
      topo: "Sun-cracked saline grounds, thick mud-brick hamlets, and thorny desert scrub.",
      culture: "Multani horse archers, camel mail-couriers, and Sufi shrine guardians.",
      tactical: "Open flat arid terrain gives supreme vision coverage. Cavalry scouts gain +20% tracking.",
      history: "Represented an ancient trading oasis and critical junction linking South Punjab with Baluchistan.",
      icon: "🐫",
      alliance: "Neutral Sanctuary"
    },
    {
      id: 'kashmir',
      name: "Kashmir Gateway",
      sub: "Pir Panjal Snow Passes",
      col: 4,
      row: 3,
      topo: "Breathtaking snowy valleys, towering pine slopes, and frozen river-melt lakes.",
      culture: "Hardy Kashmiri mountain sheepherders and royal valley watchmen.",
      tactical: "Frequent winter snow blizzards reduce combat visibility to adjacent hexes only.",
      history: "The storied summer retreat of Mughal princes, guarded by impassable rocky gate heights.",
      icon: "❄️",
      alliance: "Neutral Highlands"
    },
    {
      id: 'rajputana',
      name: "Rajputana Hills",
      sub: "Aravalli Range Heights",
      col: 4,
      row: 6,
      topo: "Ancient rocky quartzite slopes, seasonal salt lakes, and majestic dry scrub forests.",
      culture: "Proud Rajput warrior clans of Jaipur, Jodhpur, and Udaipur ruling from grand hill fortresses.",
      tactical: "Impenetrable defensive heights. Ambush corridors grant massive defensive bonuses to light archery units.",
      history: "A historically independent cluster of states whose active neutral stance has locked out both armies from securing a swift flank sweep.",
      icon: "🛡️",
      alliance: "Neutral / Rajputana"
    },
    {
      id: 'ajmer',
      name: "Ajmer Shrines",
      sub: "Aravallian Pass Roads",
      col: 3,
      row: 10,
      topo: "Deep dry rocky valleys, ancient high temple towers, and dry desert plains.",
      culture: "Sufi pilgrims, local Rajput Rathore defenders, and temple guards.",
      tactical: "Crucial strategic passes connect the Great Thar Desert with the fertile Malwa Plateaus.",
      history: "The spiritual heart of Rajasthan, highly revered and protected throughout history by both dynasties.",
      icon: "🕌",
      alliance: "Neutral Sanctuary"
    },
    {
      id: 'deccan',
      name: "The Deccan Plateau",
      sub: "Western Ghat Bases",
      col: 4,
      row: 11,
      topo: "Solid black-compact basalt ridges, rolling valleys, and impenetrable mountain fortresses.",
      culture: "Birthplace of the Maratha Empire, rooted in the heritage of Chhatrapati Shivaji Maharaj.",
      tactical: "Exceptional fortress cover density. Master country for Ganimi Kava hit-and-run guerrilla skirmishing.",
      history: "The imperial capital base. Peshwa Nanasaheb ordered Sadashivrao Bhau's vast march from Shaniwar Wada.",
      icon: "🏰",
      alliance: "Maratha Core"
    },
    {
      id: 'konkan',
      name: "Konkan Guard Strip",
      sub: "Maratha Naval Ports",
      col: 3,
      row: 13,
      topo: "Golden sand coastline, dense palm lagoons, and deep oceanic shipping paths.",
      culture: "Maratha Angre navy commandos, local fishermen, and European trade ship guides.",
      tactical: "Inherent coastal sea lanes bypass land-based artillery siege networks.",
      history: "The naval shield of the Peshwas, renowned for repel actions against European warships.",
      icon: "⛵",
      alliance: "Maratha Core"
    },
    {
      id: 'gwalior_front',
      name: "Chambal Ravines",
      sub: "Gwalior Outer Ranges",
      col: 5,
      row: 5,
      topo: "Extensively eroded clay ravines, jagged badlands, and dry acacia thorn scrub.",
      culture: "Fearsome local archers, Scindia vanguard cavalry, and regional scouts.",
      tactical: "Unpredictable ravines cancel coordinate movement lines. Severely high risk of ambush.",
      history: "The northern defense line of the Gwalior Maharaj, requiring immense tactical patience.",
      icon: "🪨",
      alliance: "Maratha Ally"
    },
    {
      id: 'narmada',
      name: "Malwa Hills / Narmada",
      sub: "Satpura Valley Slopes",
      col: 5,
      row: 9,
      topo: "Dense forest canyons, volcanic mesa tables, and deep running basalt river rivers.",
      culture: "Pindari irregular scouts, Gond archers, and Maratha central garrison troops.",
      tactical: "Extreme jungle mountain cover. Cavalry units receive -15% speed penalty.",
      history: "The physical gateway separating northern Hindusthan from southern Deccan homelands.",
      icon: "🐯",
      alliance: "Maratha Suzerain"
    },
    {
      id: 'vidarbha',
      name: "Vidarbha Cotton Basin",
      sub: "Gadavari Marshlands",
      col: 5,
      row: 12,
      topo: "Rolling rich deep-black cotton soils, seasonal marshes, and broad grass valleys.",
      culture: "Local cotton farmers, Maratha silladar horsemen, and border patrols.",
      tactical: "Broad open landscapes optimize perfect heavy war-cavalry maneuver lines.",
      history: "Sourced thousands of draft bullocks and heavy baggage horses into the Peshwa's war machine.",
      icon: "🌾",
      alliance: "Maratha Core"
    },
    {
      id: 'himachal',
      name: "Himachal Pine Forests",
      sub: "Garhwal Sentry Hills",
      col: 5,
      row: 3,
      topo: "Sacred glacier rivers, giant Himalayan pine ridges, and deep-cut granite paths.",
      culture: "Hardy Pahari tribesmen, Gorkha pathfinder scouts, and forest rangers.",
      tactical: "Tense altitude gradients and forest cover block wheeled artillery lines.",
      history: "Provided a powerful northern defensive rampart guarding the flanks of Rohilkhand.",
      icon: "🌲",
      alliance: "Neutral Highlands"
    },
    {
      id: 'kurukshetra',
      name: "Kurukshetra Plains",
      sub: "Gateway to Hindusthan",
      col: 6,
      row: 3,
      topo: "Vast mustard fields, ancient holy stepwells, and dusty chariot routes.",
      culture: "Yamuna agrarian clansmen and local border garrison militias.",
      tactical: "Wide-open hard soils offer perfect flat infantry square formation bonuses.",
      history: "The legendary, sacred battlefield of the Mahabharata and several deciding empires.",
      icon: "⚔️",
      alliance: "Disputed Plains"
    },
    {
      id: 'himalaya',
      name: "Terai Foothills",
      sub: "Outer Himalayan Shrub",
      col: 6,
      row: 1,
      topo: "Untamed elephant grass, damp waterlogged marshes, and steep forest spurs.",
      culture: "Local dacoits, hunters, and Gurung mountain archers.",
      tactical: "Sump marshes cause heavy baggage carts to sink. Light infantry skirmishers thrive.",
      history: "Lashed by Himalayan rainfall, serving as a haven for northern guerrilla forces.",
      icon: "🌲",
      alliance: "Durrani Buffer"
    },
    {
      id: 'bundelkhand',
      name: "Bundelkhand Ravines",
      sub: "Broken Volcanic Badlands",
      col: 6,
      row: 6,
      topo: "Heavily broken basalt ravines, dry acacia thickets, and deep winding river valleys.",
      culture: "Bundela clans and skilled irregular huntsmen specialized in night maneuvers.",
      tactical: "The rugged basalt topography restricts smooth deployment of Gardi wheeled artillery carts.",
      history: "Acted as the southern corridor of reinforcement for Maratha heavy caravans moving from Malwa to Gwalior.",
      icon: "🪨",
      alliance: "Maratha Affiliate"
    },
    {
      id: 'rohilla',
      name: "Rohilkhand Borderlands",
      sub: "Afghan Terai Enclaves",
      col: 7,
      row: 1,
      topo: "Dense green foothill forests of the Himalayas, swampy tall grass marshes, and fast mountain creeks.",
      culture: "Rohilla Afghan settlers, led by the sharp diplomat Najib-ud-Daula.",
      tactical: "Swamps cause severe mud-clogging. Sledge-wagons or heavy cavalry are vulnerable to light skirmishers.",
      history: "A fundamental starting enclave for the Afghan coalition, providing massive safe rear storehouses.",
      icon: "🌲",
      alliance: "Durrani Ally"
    },
    {
      id: 'doab',
      name: "Ganga-Yamuna Doab",
      sub: "Imperial Delhi Basin",
      col: 7,
      row: 2,
      topo: "Gently rolling, endlessly level lush planes between the parallel holy waterways of Ganges and Yamuna.",
      culture: "Seat of Mughal lineage, Rohillakhand Afghan lords, and the affluent Court of Awadh (Oudh).",
      tactical: "Zero height cover on flat plains. Perfect terrain for European-trained French muskets and heavy guns.",
      history: "The central geopolitical vacuum of Hindusthan, where grand empires historical destinies are decided.",
      icon: "🌾",
      alliance: "Imperial Seat / Delhi"
    },
    {
      id: 'mathura',
      name: "Mathura Meadows",
      sub: "Yamuna Sacred Banks",
      col: 7,
      row: 3,
      topo: "Lush riverside pastures, ancient brick temple docks, and quiet dairy villages.",
      culture: "Jats of Bharatpur, herdsmen, and Suraj Mal's veteran matchlock militias.",
      tactical: "Abundant milk, water, and cattle forage yields. Provisions regeneration is increased +25%.",
      history: "The holy birth land of Krishna, heavily fortified with monumental Jat brick ramparts.",
      icon: "🐄",
      alliance: "Jat Alliance"
    },
    {
      id: 'lucknow',
      name: "Awadh Heartlands",
      sub: "Ganga Plains Interfluve",
      col: 8,
      row: 3,
      topo: "Dense groves of mango orchards, gentle muddy river bends, and vast flat grain fields.",
      culture: "The elegant royal court of Awadh under Shuja-ud-Daula, utilizing European mercenaries.",
      tactical: "Endless flat soil. Optimizes artillery bombardment ranges by +30%.",
      history: "Famed for arts, poetry, and tremendous wealth, coveted by both northern coalitions.",
      icon: "🕌",
      alliance: "Neutral Awadh"
    },
    {
      id: 'bihar',
      name: "Patna Valley Defiles",
      sub: "Mid-Ganges Basin",
      col: 8,
      row: 4,
      topo: "Broad clay mudflats, dense bamboo thickets, and limestone outcroppings.",
      culture: "Bihari infantry, river boatmen, and regional zamindar levies.",
      tactical: "Wide river crossings limit rapid surprise flanks. Strong defense bonus.",
      history: "Overlooked key bottlenecks guarding the eastern routes between Delhi and Bengal.",
      icon: "🐅",
      alliance: "Neutral Corridor"
    },
    {
      id: 'nagpur',
      name: "Chhota Nagpur Hills",
      sub: "Tribal Sal Woodlands",
      col: 8,
      row: 7,
      topo: "Ancient rocky plateaus, dense sal forests, and deep wild rivers.",
      culture: "Santhal and Gond tribal defenders, skilled in tracking and poison bows.",
      tactical: "High density vegetation blocks long-range gunpowder visibility.",
      history: "Composed a wild, untamed fortress barrier shielding the western flank of Bengal.",
      icon: "🌳",
      alliance: "Neutral Tribes"
    },
    {
      id: 'bengal',
      name: "Bengal Delta",
      sub: "Rich Sunderbans & Ports",
      col: 9,
      row: 4,
      topo: "Slow muddy river deltas, dense mangrove marsh forests, and emerald rice paddies.",
      culture: "Rich merchant nawabs, boatmen, and early European East India trading posts.",
      tactical: "Immense humidity and constant river water crossings slow down quick heavy cavalry charges.",
      history: "Famed as the wealthiest province of Hindusthan, sending tax revenues that both sides covet.",
      icon: "🐅",
      alliance: "Neutral / East India"
    },
    {
      id: 'malabar',
      name: "Malabar Outer Coast",
      sub: "Spice Portals",
      col: 5,
      row: 14,
      topo: "Swaying coconut shores, sandy saltwater lagoons, and heavy green rainforest slopes.",
      culture: "Nair warriors, Mappila spice sailors, and Dutch trade negotiators.",
      tactical: "Heavy rainfall. Artillery fires suffer -20% damp gunpowder failure risk.",
      history: "A legendary spice coast connecting India with Arabia and global trade centers.",
      icon: "🌴",
      alliance: "Neutral Maritime"
    }
  ];

  // Dynamic mapping of regionalZones with computed positions
  const regionalZones = regionalZonesRaw.map(z => ({
    ...z,
    pos: getTilePosition(z.col, z.row)
  }));

  const [selectedZone, setSelectedZone] = useState<typeof regionalZones[0] | null>(null);

  const stages = Object.values(CampaignStage);
  const currentStageIndex = stages.indexOf(campaignStage);

  const handleInitiate = () => {
    const currentStage = stages[currentStageIndex];
    if (currentStage === CampaignStage.PUNE) {
      setShowPunePolitics(true);
    } else if (currentStage === CampaignStage.GWALIOR) {
      setShowGwaliorChambers(true);
    } else if (currentStage === CampaignStage.DELHI_NEGOTIATIONS) {
      setShowDelhiAlliances(true);
    } else {
      onNavigate(Screen.BATTLE);
    }
  };

  // Dynamic milestones depending on active campaign faction (starts from their side of Hindusthan!)
  const milestones = activeFaction === 'maratha' ? [
    { stage: CampaignStage.NIZAM_CAMPAIGN, name: "Udgir Battle", pos: { top: '3000px', left: '1000px' }, desc: "Decisively defeat the Nizam of Hyderabad at Udgir to seize critical state treasury funds and fortresses." },
    { stage: CampaignStage.PUNE, name: "Pune Chambers", pos: { top: '2800px', left: '800px' }, desc: "With the Nizam subdued, return to Shaniwar Wada to settle state politics and muster the grand army columns." },
    { stage: CampaignStage.BURHANPUR, name: "Tapti Defile", pos: { top: '2200px', left: '880px' }, desc: "Muster forces at Burhanpur and clear local hostile garrisons guarding the Tapti River banks." },
    { stage: CampaignStage.GWALIOR, name: "Gwalior Fort", pos: { top: '1500px', left: '980px' }, desc: "Lobby the great Scindia court and secure agreements with Maharaja Suraj Mal of Bharatpur." },
    { stage: CampaignStage.DELHI_NEGOTIATIONS, name: "Awadh Talks", pos: { top: '1200px', left: '1020px' }, desc: "Imperial court diplomacy. Persuade the neutral Nawab Shuja-ud-Daula to reject Abdali's invitation." },
    { stage: CampaignStage.SHINDE_STAND, name: "Barari Stand", pos: { top: '1000px', left: '1050px' }, desc: "Support Dattaji Shinde's heroic defensive stand on the bloody river mud at Barari Ghat." },
    { stage: CampaignStage.DELHI_BATTLE, name: "Kunjpura Sack", pos: { top: '700px', left: '1080px' }, desc: "Sack the fortified Afghan base at Kunjpura with heavy Gardi artillery to sever Abdali's links." },
    { stage: CampaignStage.PANIPAT, name: "Panipat Plains", pos: { top: '400px', left: '1050px' }, desc: "The ultimate symmetrical showdown. Extrapolate standard infantry squares under Ibrahim Gardi's barrels." }
  ] : [
    { stage: CampaignStage.NIZAM_CAMPAIGN, name: "Kabul Outposts", pos: { top: '2600px', left: '100px' }, desc: "Mobilize the Durrani royal guard from Kabul and subdue rebellious border clans to secure the gateway of the Khyber Pass." },
    { stage: CampaignStage.PUNE, name: "Kandahar", pos: { top: '2500px', left: '300px' }, desc: "Convene the great Council of Emirs to receive tribal oaths of allegiance before heading east." },
    { stage: CampaignStage.BURHANPUR, name: "Lahore Siege", pos: { top: '1900px', left: '450px' }, desc: "Execute a rapid cavalry vanguard offensive to capture the strategic city of Lahore." },
    { stage: CampaignStage.GWALIOR, name: "Rohila Pact", pos: { top: '1500px', left: '725px' }, desc: "Secure the vital alliance of Najib-ud-Daula, the Rohilla Afghan leader." },
    { stage: CampaignStage.DELHI_NEGOTIATIONS, name: "Awadh Siyar", pos: { top: '1200px', left: '850px' }, desc: "Sway Nawab Shuja-ud-Daula of Awadh to join the Durrani side before the Marathas bribe him." },
    { stage: CampaignStage.SHINDE_STAND, name: "River Crossing", pos: { top: '900px', left: '980px' }, desc: "Conduct a stealthy midnight river crossing over the Yamuna to trap the scouts." },
    { stage: CampaignStage.DELHI_BATTLE, name: "Delhi Outposts", pos: { top: '650px', left: '1000px' }, desc: "Slam the defensive garrisons of Delhi, encircling the Maratha host's line of retreat." },
    { stage: CampaignStage.PANIPAT, name: "Panipat Plains", pos: { top: '400px', left: '1050px' }, desc: "The grand showdown. Unleash spearhead cavalry and camel lines." }
  ];

  const isViewingOpponent = activeFaction !== playingFaction;
  const showSecretOpponentView = isViewingOpponent && !isOpponentScouted;

  return (
    <div className="relative h-screen w-screen bg-stone-950 overflow-hidden font-sans">
      <TopBar screen={Screen.STRATEGIC_MAP} onNavigate={onNavigate} onToggleMenu={onToggleMenu} onHelp={onHelp} onSettings={onSettings} />
      <SideNav screen={Screen.STRATEGIC_MAP} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />

      {/* Royal Decrees and Military Order Bulletins */}
      <AnimatePresence>
        {activeDecreeNotification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            id={`decree-bulletin-${activeDecreeNotification.id}`}
            className="absolute top-24 left-1/2 -translate-x-1/2 w-[420px] max-w-[90%] bg-[#120c09] border-4 border-[#8B5E3C] p-5 shadow-2xl z-50 rounded-sm text-center font-sans"
          >
            {/* Elegant Vintage Double Border Accent */}
            <div className="absolute inset-1 border border-[#8B5E3C]/30 rounded-xs pointer-events-none" />

            <div className="relative z-10 text-center">
              <span className="text-4xl text-saffron select-none animate-bounce block mx-auto">📜</span>
              <span className="text-[9px] font-black text-saffron uppercase font-mono tracking-widest block mt-2">
                IMPERIAL MILITARY DECREE
              </span>
              <h3 className="font-serif text-sm font-black text-stone-100 uppercase mt-1 tracking-wide border-b border-[#8B5E3C]/30 pb-2">
                {activeDecreeNotification.title}
              </h3>
              
              <div className="my-4 text-xs text-stone-300 italic font-medium leading-relaxed px-2">
                "By order of Generalissimo <span className="text-white font-bold not-italic">{activeDecreeNotification.commander}</span>: {activeDecreeNotification.text}"
              </div>

              {activeDecreeNotification.effects && (
                <div className="my-3 py-1.5 px-3 bg-stone-900 border border-[#8B5E3C]/30 text-[10px] font-mono text-emerald-400 uppercase tracking-wider rounded-xs inline-block">
                  ⚖️ {activeDecreeNotification.effects}
                </div>
              )}

              <div className="mt-5">
                <button
                  type="button"
                  id="close-decree-bulletin"
                  onClick={() => setActiveDecreeNotification(null)}
                  className="px-6 py-1.5 bg-saffron hover:bg-[#e08b1b] text-stone-950 text-[10px] font-black uppercase tracking-wider rounded-xs cursor-pointer shadow-md transition-colors"
                >
                  Duly Heard & Enacted
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Map Background */}
      <main className={`relative w-full h-full pt-16 pb-20 md:pb-24 overflow-hidden lg:pl-64 transition-all duration-500 ${
        activeFaction === 'durrani' ? 'bg-[#122e1b]' : 'bg-[#2D241E]'
      }`}>
        <div className="absolute inset-0 z-0 parchment opacity-90 animate-fade-in" />
        {activeFaction === 'durrani' && (
          <div className="absolute inset-0 z-0 bg-emerald-950/20 mix-blend-color-burn pointer-events-none" style={{ backgroundColor: 'rgba(16, 185, 129, 0.14)' }} />
        )}
        <div className="absolute inset-0 z-0 bg-black/10 mix-blend-multiply" />
        
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />

        {/* Civilization Stats HUD - Elegant Floating Dashboard */}
        <div id="civ-stats-hud" className="absolute top-20 left-6 lg:left-[18rem] z-40 flex items-center gap-1 p-1 bg-stone-950/95 border border-[#8B5E3C] rounded-sm shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 px-3 border-r border-[#8B5E3C]/35 h-6">
            <Coins size={13} className="text-saffron animate-pulse" />
            <span className="text-[9px] font-black text-stone-400 font-mono">GOLD:</span>
            <span className="text-[11px] font-serif font-black text-amber-200">{treasuryMohurs.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 border-r border-[#8B5E3C]/35 h-6">
            <Scroll size={13} className="text-emerald-500" />
            <span className="text-[9px] font-black text-stone-400 font-mono">FOOD:</span>
            <span className="text-[11px] font-serif font-black text-emerald-400">{provisions}T</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 h-6">
            <Flag size={13} className="text-red-500 animate-pulse" />
            <span className="text-[9px] font-black text-stone-400 font-mono">COHESION:</span>
            <span className="text-[11px] font-serif font-black text-red-500">{morale}%</span>
          </div>
        </div>

        {/* Faction Side Switcher - bronze header look */}
        <div className="absolute top-20 right-6 z-40 flex flex-col gap-2 items-end">
          <div className="flex items-center gap-1 p-1 bg-stone-950/95 border border-[#8B5E3C] rounded-sm shadow-2xl backdrop-blur-md">
            <button 
              type="button"
              onClick={() => {
                setActiveFaction('maratha');
              }}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm
                ${activeFaction === 'maratha' ? 'bg-saffron text-stone-950 font-extrabold shadow-md' : 'text-stone-400 hover:text-stone-200'}
              `}
            >
               Maratha Side
            </button>
            <button 
              type="button"
              onClick={() => {
                setActiveFaction('durrani');
              }}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-sm
                ${activeFaction === 'durrani' ? 'bg-emerald-650 text-white font-extrabold shadow-md' : 'text-stone-400 hover:text-stone-200'}
              `}
            >
               Durrani Side
            </button>
          </div>

          {/* Map Layer Density Control to minimize map crowding */}
          <div className="flex items-center gap-1 p-1 bg-stone-950/95 border border-[#8B5E3C]/25 rounded-sm shadow-2xl backdrop-blur-md">
            <span className="text-[8px] font-mono text-stone-500 uppercase px-2 font-black tracking-wider border-r border-[#8B5E3C]/25 select-none text-right">Map Density:</span>
            <button 
              type="button"
              id="map-mode-campaign-btn"
              onClick={() => setMapMode('campaign')}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all rounded-sm cursor-pointer
                ${mapMode === 'campaign' ? 'bg-saffron text-stone-950 font-extrabold shadow-sm' : 'text-stone-400 hover:text-stone-200'}
              `}
            >
               ⚔️ Paths Only (Clean)
            </button>
            <button 
              type="button"
              id="map-mode-all-btn"
              onClick={() => setMapMode('all')}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider transition-all rounded-sm cursor-pointer
                ${mapMode === 'all' ? 'bg-amber-805 text-stone-100 bg-[#5c3e21] font-extrabold shadow-sm' : 'text-stone-400 hover:text-stone-200'}
              `}
            >
               🗺️ Full Details
            </button>
          </div>
        </div>

        {/* Fog of War Enemy Column Blindspot warning overlay */}
        {showSecretOpponentView && (
          <div className="absolute top-24 left-6 right-6 lg:left-72 lg:right-6 z-45 bg-[#3a0f12]/95 border-2 border-red-900 p-4 shadow-2xl backdrop-blur-md rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <Compass size={24} className={`text-red-500 ${scoutingState === 'searching' ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <h4 className="text-stone-205 font-serif text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  Enemy Column Blindspot
                  {scoutingState === 'success' && <span className="text-[10px] text-green-500 uppercase font-mono">[Intel Decrypted]</span>}
                  {scoutingState === 'failed' && <span className="text-[10px] text-red-500 uppercase font-mono bg-red-950/40 px-1.5 py-0.5 border border-red-900">[Scouts Captured]</span>}
                </h4>
                <p className="text-[11px] text-stone-400 font-sans leading-relaxed mt-1">
                  {scoutMessage || "Opposing scouting riders and light cavalry patrols have blanketed this sector. Send Harkara spies into hostile territory to map theater movements."}
                </p>
              </div>
            </div>
            
            {scoutingState !== 'success' && (
              <button
                disabled={scoutingState === 'searching'}
                onClick={handleDeployScouts}
                className="py-1.5 px-4 bg-red-650 hover:bg-red-750 disabled:bg-stone-850 disabled:text-stone-650 text-white font-serif font-black uppercase text-[10px] tracking-widest transition-colors rounded-sm cursor-pointer whitespace-nowrap self-end md:self-auto shadow-md"
              >
                {scoutingState === 'searching' ? 'Mapping Reeds...' : 'Deploy Harkara Scouts'}
              </button>
            )}
          </div>
        )}

        {/* Draggable Map Container */}
        <motion.div 
          drag
          dragConstraints={{ left: -2500, right: 0, top: -2500, bottom: 0 }}
          style={{ width: '4000px', height: '4000px' }}
          className="absolute cursor-grab active:cursor-grabbing origin-top-left scale-50"
        >
          {/* Detailed Map Lines - Ink Style & Diverse Indian Terrain SVG features */}
          <svg className="absolute inset-0 z-5 pointer-events-none w-full h-full overflow-visible">
            <defs>
              <filter id="ink-bleed">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
              </filter>
              
              {/* Soft, blended saffron glow representing the Maratha dominance across Hindusthan / central and south India */}
              <radialGradient id="saffron-hegemony" cx="30%" cy="65%" r="45%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                <stop offset="35%" stopColor="#ea580c" stopOpacity="0.30" />
                <stop offset="70%" stopColor="#d97706" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.0" />
              </radialGradient>
              
              {/* Soft, blended emerald green glow representing the Afghan/Durrani threat lurking from Kabul, Khyber Pass & North India */}
              <radialGradient id="emerald-durrani-threat" cx="15%" cy="20%" r="35%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.55" />
                <stop offset="30%" stopColor="#047857" stopOpacity="0.35" />
                <stop offset="65%" stopColor="#064e3b" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Saffron Dominance in Central & Southern India (Pune/Gwalior) */}
            <circle cx="1000" cy="2400" r="1300" fill="url(#saffron-hegemony)" />
            <circle cx="1200" cy="1700" r="1000" fill="url(#saffron-hegemony)" />
            <circle cx="800" cy="2900" r="1400" fill="url(#saffron-hegemony)" />
            
            {/* Looming Green Threat from Central Asia / Punjab / Kabul in the North-West */}
            <circle cx="200" cy="1800" r="1200" fill="url(#emerald-durrani-threat)" />
            <circle cx="450" cy="1100" r="1100" fill="url(#emerald-durrani-threat)" />
            <circle cx="800" cy="500" r="1000" fill="url(#emerald-durrani-threat)" />

            {/* Visual borders of influence text markers */}
            <text x="1400" y="2200" fill="#ea580c" fontSize="30" fontFamily="serif" fontWeight="bold" letterSpacing="0.3em" opacity="0.18" className="select-none font-extrabold">MARATHA SAFFRON SUZERAIN</text>
            <text x="300" y="800" fill="#10b981" fontSize="30" fontFamily="serif" fontWeight="bold" letterSpacing="0.3em" opacity="0.18" className="select-none font-extrabold">LOOMING DURRANI THREAT CORRIDOR</text>
            
            {/* Mountain Range Suggestion 1: Hindu Kush mountains far NW */}
            <path d="M 100 2300 L 150 2200 L 200 2260 L 240 2180 L 290 2240 L 330 2160 L 380 2220" stroke="#4a3f35" strokeWidth="3" fill="transparent" className="opacity-30" />
            <path d="M 120 2310 L 170 2210 L 220 2270 L 260 2190 L 310 2250 L 350 2170 L 400 2230" stroke="#4a3f35" strokeWidth="2" fill="transparent" className="opacity-25" />

            {/* Mountain Range Suggestion 2: Western Ghats and Deccan Ranges far SW */}
            <path d="M 640 2860 L 680 2780 L 720 2820 L 750 2740 L 790 2790" stroke="#4a3f35" strokeWidth="3" fill="transparent" className="opacity-30" />
            <path d="M 660 2870 L 700 2790 L 740 2830 L 770 2750 L 810 2800" stroke="#4a3f35" strokeWidth="2" fill="transparent" className="opacity-25" />

            {/* River Suggestion 1: River Yamuna and Delhi corridor */}
            <path d="M 1050 350 Q 1060 600, 1030 900 T 1120 1400 T 1200 1800" stroke="#4a6fa5" strokeWidth="3" fill="transparent" className="opacity-40" />
            <path d="M 1055 350 Q 1065 600, 1035 900 T 1125 1400 T 1205 1800" stroke="#ffffff" strokeWidth="1" fill="transparent" className="opacity-20" />

            {/* River Suggestion 2: River Indus & Punjab Rivers */}
            <path d="M 350 2000 Q 450 1800, 520 1550 T 650 1200" stroke="#3b82f6" strokeWidth="2" fill="transparent" className="opacity-35" />
            <path d="M 450 1780 Q 550 1620, 680 1450" stroke="#3b82f6" strokeWidth="2" fill="transparent" className="opacity-30" />
            <path d="M 500 1680 Q 580 1520, 710 1350" stroke="#3b82f6" strokeWidth="1.5" fill="transparent" className="opacity-25" />

            {/* Desert Shading: Thar Desert of Rajasthan */}
            <polygon points="320,2100 480,1850 560,2120 400,2300" fill="#d97706" fillOpacity="0.05" stroke="#d97706" strokeWidth="1" strokeDasharray="6 6" className="opacity-30" />

            {/* Ambient Calligraphic Historical Region Labels */}
            <text x="140" y="2100" fill="#57534e" fontSize="24" fontFamily="serif" fontWeight="bold" letterSpacing="0.25em" opacity="0.3" className="select-none">HINDU KUSH HIGHLANDS</text>
            <text x="350" y="2000" fill="#d97706" fontSize="24" fontFamily="serif" fontWeight="bold" letterSpacing="0.3em" opacity="0.35" className="select-none">GREAT THAR DESERT</text>
            <text x="480" y="1450" fill="#3b82f6" fontSize="22" fontFamily="serif" fontStyle="italic" opacity="0.4" className="select-none">Punjab Region (Five Waters)</text>
            <text x="1110" y="700" fill="#3b82f6" fontSize="22" fontFamily="serif" fontStyle="italic" opacity="0.4" className="select-none">River Yamuna</text>
            <text x="700" y="2700" fill="#57534e" fontSize="24" fontFamily="serif" fontWeight="bold" letterSpacing="0.25em" opacity="0.3" className="select-none">DECCAN BASALT RANGE</text>
            <text x="1130" y="1150" fill="#1e293b" fontSize="24" fontFamily="serif" fontWeight="bold" letterSpacing="0.2em" opacity="0.25" className="select-none">FERTILE GANGETIC CORRIDOR</text>

            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeInOut" }}
              d={activeFaction === 'maratha' ? "M 800 2800 C 900 2400, 850 2000, 1000 1500 S 1100 800, 1050 400" : "M 200 2500 C 350 2100, 480 1700, 580 1500 S 850 1000, 1050 400"}
              stroke="#2D241E"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray="15 15"
              className="opacity-40"
              filter="url(#ink-bleed)"
            />

            {/* Completed Path - Confederacy's Blue March vs Durrani's Red March */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: currentStageIndex / (stages.length - 1) }}
              transition={{ duration: 1.5, ease: "linear" }}
              d={activeFaction === 'maratha' ? "M 800 2800 C 900 2400, 850 2000, 1000 1500 S 1100 800, 1050 400" : "M 200 2500 C 350 2100, 480 1700, 580 1500 S 850 1000, 1050 400"}
              stroke={showSecretOpponentView ? "#78716c" : (activeFaction === 'maratha' ? "#2563eb" : "#dc2626")}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={showSecretOpponentView ? "10 10" : "none"}
              className={`opacity-70 ${showSecretOpponentView ? 'shadow-none' : (activeFaction === 'maratha' ? 'shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'shadow-[0_0_15px_rgba(220,38,38,0.5)]')}`}
              filter="url(#ink-bleed)"
            />
          </svg>

          {/* Interactive Geographic Landmarks representing Hindusthan diversity */}
          <div className="absolute inset-0 z-10">
            {regionalZones.map((z) => {
              const isThreatened = barbarians[z.id]?.active;
              const threatData = barbarians[z.id];
              const isSelected = selectedZone?.id === z.id;

              // If campaign mode is set, only render large badges for threatened or selected lands.
              // For all stable lands, render a highly elegant miniature circle node to completely declutter the view!
              if (mapMode === 'campaign' && !isThreatened && !isSelected) {
                return (
                  <div 
                    key={z.id}
                    id={`hex-container-${z.id}`}
                    style={z.pos}
                    className="absolute flex items-center justify-center p-2 group/hex pointer-events-auto"
                  >
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedZone(z)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedZone(z);
                        }
                      }}
                      className="relative w-12 h-12 rounded-full border-2 border-stone-850/45 bg-stone-900/60 hover:bg-stone-950/90 flex items-center justify-center text-xl hover:border-saffron cursor-pointer transition-all duration-300 hover:scale-110 shadow-md select-none opacity-45 hover:opacity-100"
                    >
                      <span className="text-sm select-none filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{z.icon}</span>
                      
                      {/* Quiet dot badge to denote core region */}
                      {z.alliance.includes("Core") && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-saffron border border-stone-950 animate-ping" />
                      )}
                    </div>

                    {/* Simplified Hover Tooltip */}
                    <div 
                      id={`hex-tooltip-${z.id}`}
                      className="absolute opacity-0 pointer-events-none group-hover/hex:opacity-100 transition-all duration-300 bottom-full mb-4 z-50 w-64 p-4 parchment border-2 border-[#8B5E3C] rounded-sm text-left shadow-2xl backdrop-blur-md translate-y-2 group-hover/hex:translate-y-0 text-stone-950"
                    >
                      <div className="text-[9px] uppercase font-mono tracking-widest text-[#8b5e3c] font-black">Imperial Field Survey (Pact Zone)</div>
                      <div className="text-sm font-serif font-black text-stone-950 mt-1 flex items-center gap-2">
                        <span>{z.icon}</span>
                        <span>{z.name}</span>
                      </div>
                      <p className="text-[10px] text-stone-700 italic mt-1.5 leading-relaxed font-sans">{z.topo}</p>
                      <div className="mt-2.5 pt-2 border-t border-[#8B5E3C]/20 text-[9px] font-mono text-stone-650 flex justify-between">
                        <span>ALLIANCE: {z.alliance}</span>
                        <span className="text-emerald-700">✓ SECURED</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Full epic layout when full grid is switched or a cell demands active military intervention
              return (
                <div 
                  key={z.id}
                  id={`hex-container-${z.id}`}
                  style={z.pos}
                  className="absolute flex items-center justify-center p-2 group/hex pointer-events-auto"
                >
                  {/* Subtle red pulse glow if threatened by barbarian hordes */}
                  {isThreatened && (
                    <div className="absolute w-[200px] h-[220px] rounded-full bg-red-650/15 blur-2xl animate-pulse pointer-events-none" />
                  )}

                  {/* SVG Hexagon container structure */}
                  <div 
                    id={`hex-button-${z.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedZone(z)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedZone(z);
                      }
                    }}
                    className="relative w-48 h-56 cursor-pointer flex flex-col items-center justify-center transition-all duration-350 hover:scale-105 active:scale-95"
                  >
                    {/* The crisp SVG Hexagon Shape */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]" viewBox="0 0 100 115" preserveAspectRatio="none">
                      <polygon 
                        points="50,2 98,28 98,87 50,113 2,87 2,28" 
                        className={`transition-all duration-300 stroke-[3px] 
                          ${selectedZone?.id === z.id 
                            ? 'fill-amber-950/20 stroke-saffron' 
                            : isThreatened
                              ? 'fill-stone-950/95 stroke-red-650 animate-pulse'
                              : 'fill-stone-900/90 stroke-amber-800/40 hover:stroke-amber-600'
                          }
                        `} 
                      />
                    </svg>

                    {/* Centered Graphic and Labels inside the Hex */}
                    <div className="relative z-10 flex flex-col items-center gap-1.5 p-4 text-center select-none">
                      <span className="text-4xl filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] animate-bounce">{z.icon}</span>
                      
                      <span className="text-[10px] font-black font-serif text-amber-100 tracking-wider bg-stone-950/90 border border-[#8B5E3C]/35 px-2 py-0.5 rounded-sm uppercase break-words max-w-[130px] shadow-sm">
                        {z.name}
                      </span>

                      {/* Tactical alert badge */}
                      {isThreatened ? (
                        <span className="text-[8px] font-black text-red-400 font-mono tracking-widest bg-red-950/90 border border-red-900/50 px-1.5 py-0.5 rounded-xs animate-pulse mt-1 shadow-md">
                          ⚠️ RAIDED
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold text-stone-400 font-mono tracking-wider uppercase mt-1">
                          {z.alliance.includes("Core") ? "✓ CORE SEAT" : "STABLE"}
                        </span>
                      )}
                    </div>

                    {/* Royal Cartography Hover Tooltip Box */}
                    <div 
                      id={`hex-tooltip-${z.id}`}
                      className="absolute opacity-0 pointer-events-none group-hover/hex:opacity-100 transition-all duration-300 bottom-full mb-4 z-50 w-64 p-4 parchment border-2 border-[#8B5E3C] rounded-sm text-left shadow-2xl backdrop-blur-md translate-y-2 group-hover/hex:translate-y-0 text-stone-950"
                    >
                      <div className="text-[9px] uppercase font-mono tracking-widest text-[#8b5e3c] font-black">Imperial Field Survey</div>
                      <div className="text-sm font-serif font-black text-stone-950 mt-1 flex items-center gap-2">
                        <span>{z.icon}</span>
                        <span>{z.name}</span>
                      </div>
                      <div className="text-[9px] text-stone-600 font-mono italic mt-0.5">{z.sub}</div>
                      
                      <div className="mt-3 pt-2.5 border-t border-[#8B5E3C]/30 flex flex-col gap-1.5 text-[11px] leading-relaxed">
                        <p className="italic text-stone-700">{z.topo}</p>
                        <p className="text-[10px] text-stone-800"><span className="font-bold text-stone-900">Forces:</span> {z.culture}</p>
                        
                        <div className="mt-2 pt-1.5 border-t border-stone-300 flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-stone-550 uppercase">Territory Status:</span>
                            <span className={isThreatened ? "text-red-700 font-black" : "text-emerald-700 font-black"}>
                              {isThreatened ? "⚠️ SKIRMISH ACTIVE" : "✓ SECURED"}
                            </span>
                          </div>

                          {isThreatened ? (
                            <div className="mt-1.5 p-2 bg-red-950/10 border border-red-900/30 text-[10px] text-red-900 rounded-sm font-sans font-medium">
                              <span className="font-bold text-red-950">{threatData.tribe}</span> are burning farms! Inspect region below to ordain counter-strike.
                            </div>
                          ) : (
                            <div className="mt-1.5 p-2 bg-emerald-950/10 border border-emerald-900/30 text-[10px] text-emerald-900 rounded-sm font-sans">
                              No hostiles detected in this coordinate cell. Logistics flow securely.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Milestones - Historical Counters Style */}
          <div className="absolute inset-0 z-20">
            {milestones.map((m, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isLocked = idx > currentStageIndex;

              return (
                <div 
                  key={m.stage}
                  style={m.pos} 
                  className={`absolute flex flex-col items-center group transition-all ${isLocked && !showSecretOpponentView ? 'opacity-40 grayscale' : 'opacity-100'}`}
                >
                  <motion.button
                    whileHover={!isLocked && !showSecretOpponentView ? { scale: 1.1, y: -5 } : {}}
                    onClick={() => isCurrent && !showSecretOpponentView && handleInitiate()}
                    disabled={isLocked || showSecretOpponentView}
                    className={`relative w-16 h-16 md:w-20 md:h-20 shadow-2xl transition-all duration-500 flex items-center justify-center
                      ${isCurrent ? 'z-30' : 'z-10'}
                    `}
                  >
                    {/* Wax Seal / Counter Visual */}
                    <div className={`absolute inset-0 rounded-full border-4 shadow-inner transform rotate-12 transition-transform group-hover:rotate-0
                      ${showSecretOpponentView ? 'bg-red-950/25 border-red-900/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                        isCompleted ? 'bg-green-900/20 border-green-900/40' : 
                        isCurrent ? (activeFaction === 'maratha' ? 'bg-saffron/30 border-saffron shadow-[0_0_20px_rgba(255,153,51,0.5)]' : 'bg-emerald-600/30 border-emerald-550 shadow-[0_0_20px_rgba(16,185,129,0.5)]') : 
                        'bg-stone-800/10 border-stone-800/20'}
                    `} />
                    
                    <div className={`relative z-10 w-full h-full p-2 overflow-hidden rounded-full opacity-60 mix-blend-multiply
                      ${isCurrent ? 'opacity-100 mix-blend-normal brightness-110' : ''}
                      ${showSecretOpponentView ? 'blur-md opacity-20' : ''}
                    `}>
                       <div className="w-full h-full rounded-full border border-black/10 flex items-center justify-center bg-stone-100/50">
                          {showSecretOpponentView ? <Compass className="text-red-905" /> : isCompleted ? <Shield className="text-green-900" /> : isCurrent ? <Swords className={activeFaction === 'maratha' ? 'text-saffron' : 'text-emerald-500'} /> : <MapIcon className="text-stone-500 opacity-30" />}
                       </div>
                    </div>

                    {isCurrent && !showSecretOpponentView && (
                      <motion.div 
                        layoutId="active-marker"
                        className={`absolute -inset-4 border-2 rounded-full animate-[ping_2s_infinite] pointer-events-none
                          ${activeFaction === 'maratha' ? 'border-saffron' : 'border-emerald-500'}
                        `} 
                      />
                    )}
                  </motion.button>

                  <div className="mt-4 text-center">
                    <span className={`px-5 py-2 text-sm font-serif uppercase font-black tracking-widest bg-stone-950/20 backdrop-blur-sm rounded-sm
                      ${showSecretOpponentView ? 'text-red-400 border border-red-900/50 bg-red-950/80 font-mono tracking-wider' : 
                        isCurrent ? 'text-stone-900 border-2 bg-saffron/10 inline-block font-bold ' + (activeFaction === 'maratha' ? 'border-saffron text-stone-900' : 'border-emerald-500 text-stone-100') : 'text-stone-700'}
                    `}>
                      {showSecretOpponentView ? "● REDACTED ●" : m.name}
                    </span>
                    {isCurrent && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 w-64 text-stone-950 p-4 parchment border-2 border-[#8B5E3C] shadow-2xl pointer-events-auto"
                      >
                         {showSecretOpponentView ? (
                           <div className="text-left space-y-2">
                             <h4 className="text-[9px] font-black uppercase tracking-widest mb-1 text-red-800 font-mono">● FOG OF WAR ACTIVE ●</h4>
                             <p className="text-[10px] font-body italic leading-relaxed text-stone-800">
                               "Our scouting outposts yield zero line-of-sight on this coordinate. We must authorize Harkara Spies to trace the enemy column."
                             </p>
                             <button
                               type="button"
                               onClick={() => setIsOpponentScouted(true)}
                               className="w-full py-1.5 bg-red-900 hover:bg-red-950 text-white text-[9px] font-black tracking-[0.2em] uppercase transition-colors rounded-sm flex items-center justify-center gap-1 cursor-pointer"
                             >
                               <Compass size={11} /> DEPLOY HARKARA SCOUTS
                             </button>
                           </div>
                         ) : (
                           <>
                             <h4 className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Strategic Directive</h4>
                             <p className="text-[10px] font-body italic font-bold leading-relaxed mb-3">
                               "{m.desc} Deploy the main army columns to advance the defense."
                             </p>
                             <button 
                               type="button"
                               onClick={handleInitiate} 
                               className={`w-full py-2 text-white text-[9px] font-black tracking-[0.2em] uppercase hover:bg-black transition-colors ${activeFaction === 'maratha' ? 'bg-[#2D241E]' : 'bg-emerald-700'}`}
                             >
                                INITIATE ACTION
                             </button>
                           </>
                         )}
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Global Progress Rails - 18th Century Instrument Look */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl px-20 z-40 flex items-center gap-8">
           <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                 <span className="text-[8px] text-[#2D241E] font-black tracking-widest uppercase opacity-60">Strategic Depth</span>
                 <span className="text-[8px] text-[#2D241E] font-black tracking-widest uppercase">{Math.round(currentStageIndex / (stages.length - 1) * 100)}%</span>
              </div>
              <div className="h-0.5 bg-stone-950/10 w-full relative">
                 <div className="absolute inset-0 origin-left" style={{ transform: `scaleX(${currentStageIndex / (stages.length - 1)})`, backgroundColor: activeFaction === 'maratha' ? '#dfa135' : '#dc2626' }} />
                 {stages.map((_, i) => (
                   <div key={i} className="absolute top-0 w-px h-2 bg-stone-950/20" style={{ left: `${(i / (stages.length - 1)) * 100}%` }} />
                 ))}
              </div>
           </div>
        </div>

        {/* Dynamic Atlas Territory details card (Hindusthan Diversity display) */}
        <AnimatePresence>
          {selectedZone ? (
            <motion.div 
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              id="selected-province-card"
              className="absolute bottom-24 left-10 lg:left-72 w-[340px] max-h-[500px] overflow-y-auto parchment border-2 border-[#8B5E3C] p-5 shadow-2xl z-30 font-sans text-stone-900 scrollbar-thin scrollbar-thumb-amber-800"
            >
              <div className="flex items-start justify-between border-b border-stone-850/20 pb-2 mb-3">
                <div>
                  <h3 className="font-serif text-md text-stone-950 font-extrabold flex items-center gap-1.5 leading-tight">
                    <span className="text-2xl select-none">{selectedZone.icon}</span>
                    <span>{selectedZone.name}</span>
                  </h3>
                  <p className="text-[10px] text-stone-605 font-mono italic">{selectedZone.sub}</p>
                </div>
                <button 
                  type="button"
                  id="close-province-card"
                  onClick={() => setSelectedZone(null)}
                  className="p-1 hover:bg-stone-300 rounded-full transition-colors text-stone-800 pointer-events-auto cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Combat Clash Loading overlay */}
              {isFighting && (
                <div id="combat-fight-overlay" className="py-8 text-center flex flex-col items-center justify-center bg-stone-900/10 border border-red-900/20 rounded-md p-4 animate-pulse">
                  <span className="text-3xl animate-spin">⚔️</span>
                  <p className="text-xs font-serif font-black uppercase text-red-900 mt-2 tracking-widest">Resolving Incursion Clash...</p>
                  <p className="text-[9px] text-stone-600 font-mono mt-1">Simulating tactical maneuvers & border flanks</p>
                </div>
              )}

              {!isFighting && (
                <div className="space-y-3 text-stone-900 leading-normal text-xs">
                  <div>
                    <h4 className="text-[9px] font-black uppercase text-stone-550 tracking-wider">Topography & Terrain:</h4>
                    <p className="text-[10.5px] font-medium mt-0.5 italic">{selectedZone.topo}</p>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase text-stone-550 tracking-wider">Culture & Garrison:</h4>
                    <p className="text-[10.5px] font-medium mt-0.5">{selectedZone.culture}</p>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase text-stone-550 tracking-wider">Strategic Combat Modifier:</h4>
                    <p className="text-[10.5px] font-medium mt-0.5 text-[#8b0000] font-mono font-bold flex items-center gap-1">
                      <Compass size={11} /> {selectedZone.tactical}
                    </p>
                  </div>
                  
                  {/* Barbarian Skirmish / Raid Combat module */}
                  <div id="barbarian-skirmish-module" className="p-3 bg-stone-950/5 border border-[#8B5E3C]/20 rounded-sm">
                    <h4 className="text-[9px] font-black uppercase text-[#8b5e3c] tracking-widest mb-1.5 flex items-center gap-1 font-mono">
                      <span>🛡️</span>
                      <span>LOCAL BARBARIAN THREAT</span>
                    </h4>

                    {barbarians[selectedZone.id]?.active ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-red-900/10 p-1.5 rounded-xs border border-red-900/20">
                          <div>
                            <span className="text-[10px] font-black text-red-900 uppercase block font-serif">{barbarians[selectedZone.id].tribe}</span>
                            <span className="text-[8px] text-stone-500 font-mono">Threat: {barbarians[selectedZone.id].threat}</span>
                          </div>
                          <span className="text-[9px] font-black bg-red-900 text-stone-100 px-1 py-0.5 rounded-xs font-mono">STR {barbarians[selectedZone.id].strength}</span>
                        </div>
                        <p className="text-[9px] text-stone-600 leading-snug">
                          Raider horsemen are pillaging supply lines. Enact defensive measures to secure this cell of Hindusthan!
                        </p>
                        <div className="grid grid-cols-1 gap-1.5 pt-1">
                          <button
                            type="button"
                            id="btn-defend-regular"
                            onClick={() => handleCombatAction('regular')}
                            className="w-full py-1 px-2 bg-stone-950 text-white hover:bg-stone-850 rounded-xs text-[9px] font-serif uppercase tracking-wider flex justify-between items-center cursor-pointer"
                          >
                            <span>Deploy Infantry (-12k Gold)</span>
                            <span className="text-emerald-450 font-mono">85% Win</span>
                          </button>
                          <button
                            type="button"
                            id="btn-defend-ambush"
                            onClick={() => handleCombatAction('ambush')}
                            className="w-full py-1 px-2 bg-stone-950 text-white hover:bg-stone-850 rounded-xs text-[9px] font-serif uppercase tracking-wider flex justify-between items-center cursor-pointer"
                          >
                            <span>Set Swamp Ambush (-45 Food)</span>
                            <span className="text-amber-500 font-mono">65% Win</span>
                          </button>
                          <button
                            type="button"
                            id="btn-defend-scorch"
                            onClick={() => handleCombatAction('scorch')}
                            className="w-full py-1 px-2 bg-red-900 text-stone-100 hover:bg-red-800 rounded-xs text-[9px] font-serif uppercase tracking-wider flex justify-between items-center cursor-pointer"
                          >
                            <span>Scorch Earth (-15 Morale)</span>
                            <span className="text-stone-300 font-mono font-bold">100% Win</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-1 bg-emerald-900/5 rounded-xs border border-emerald-900/15">
                        <span className="text-[9.5px] font-bold text-emerald-800 uppercase font-serif">✓ Cell Pacified & Stable</span>
                        <p className="text-[8px] text-stone-500 mt-0.5">Local borders secured by vanguard forces.</p>
                      </div>
                    )}
                  </div>

                  {/* Commander's Decree Conclave Module */}
                  <div id="commander-decree-module" className="p-3 bg-stone-950/5 border border-[#8B5E3C]/20 rounded-sm">
                    <h4 className="text-[9px] font-black uppercase text-[#8b5e3c] tracking-widest mb-1.5 flex items-center gap-1 font-mono">
                      <span>📜</span>
                      <span>COMMANDER'S ROYAL DECREE</span>
                    </h4>
                    <p className="text-[8.5px] text-stone-605 leading-snug mb-2">
                      Issue an authoritative military order to force requisitioning or enlist local youth.
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      <button
                        type="button"
                        id="btn-decree-grain"
                        onClick={() => handleIssueDecree('rations')}
                        className="w-full py-1 px-2 text-left bg-stone-900/95 hover:bg-stone-850 text-stone-200 hover:text-white rounded-xs text-[9px] font-serif uppercase flex justify-between items-center cursor-pointer border border-[#8B5E3C]/25"
                      >
                        <span>🌾 Crop Conscription</span>
                        <span className="text-emerald-450 font-mono">+80 Food • -12 Morale</span>
                      </button>
                      <button
                        type="button"
                        id="btn-decree-levy"
                        onClick={() => handleIssueDecree('taxes')}
                        className="w-full py-1 px-2 text-left bg-stone-900/95 hover:bg-stone-850 text-stone-200 hover:text-white rounded-xs text-[9px] font-serif uppercase flex justify-between items-center cursor-pointer border border-[#8B5E3C]/25"
                      >
                        <span>💰 Enforce War Tax</span>
                        <span className="text-emerald-450 font-mono">+35k Gold • -10 Morale</span>
                      </button>
                      <button
                        type="button"
                        id="btn-decree-conscript"
                        onClick={() => handleIssueDecree('conscript')}
                        className="w-full py-1 px-2 text-left bg-stone-900/95 hover:bg-stone-850 text-stone-200 hover:text-white rounded-xs text-[9px] font-serif uppercase flex justify-between items-center cursor-pointer border border-[#8B5E3C]/25"
                      >
                        <span>💂 Vanguard Recruit</span>
                        <span className="text-amber-500 font-mono">+15 Morale • -20k Gold</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-950/10 text-[9.5px] italic opacity-95">
                    <span className="font-bold text-stone-800">Historical Footnote:</span> {selectedZone.history}
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-stone-500 uppercase font-mono font-bold pt-1.5 border-t border-stone-950/5">
                    <span>Alignment:</span>
                    <span className={selectedZone.alliance.includes('Core') ? "text-green-800 font-bold" : "text-amber-800"}>{selectedZone.alliance}</span>
                  </div>

                  <div className="pt-2 border-t border-stone-950/10 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center font-sans">
                      <span className="text-[9px] text-stone-500 font-mono uppercase font-black">Trade Depot / Pact:</span>
                      <span className={`text-[10px] font-bold uppercase font-mono ${alliedTerritories[selectedZone.id] ? 'text-emerald-800' : 'text-stone-500'}`}>
                        {alliedTerritories[selectedZone.id] ? 'ESTABLISHED ✓' : 'UNSECURED'}
                      </span>
                    </div>
                    <button
                      type="button"
                      id="btn-tactical-alliance-pact"
                      onClick={() => {
                        const updated = { ...alliedTerritories, [selectedZone.id]: !alliedTerritories[selectedZone.id] };
                        setAlliedTerritories(updated);
                        localStorage.setItem('panipat_allied_territories', JSON.stringify(updated));
                      }}
                      className={`w-full py-1.5 text-[9px] font-black tracking-widest uppercase transition-colors rounded-sm cursor-pointer
                        ${alliedTerritories[selectedZone.id] 
                          ? 'bg-stone-800 text-[#ffb86c] border border-[#ffb86c]/20 hover:bg-stone-750' 
                          : (activeFaction === 'maratha' ? 'bg-saffron text-stone-950 hover:bg-[#e08b1b]' : 'bg-emerald-600 text-white hover:bg-emerald-550')
                        }
                      `}
                    >
                      {alliedTerritories[selectedZone.id] ? 'Dissolve Pact' : 'Establish Imperial Pact (-10k Gold)'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              className="absolute bottom-24 left-10 lg:left-72 w-80 bg-stone-950/85 border border-stone-800 p-4 shadow-xl z-30 font-sans text-xs flex gap-2.5 items-center backdrop-blur-sm"
            >
              <Info className="text-saffron shrink-0" size={18} />
              <div className="text-stone-300 leading-relaxed font-sans">
                <span className="text-stone-100 font-bold block uppercase text-[10px] tracking-wider mb-0.5">Tactical Map Controls</span>
                 The board is filtered in <span className="text-saffron font-bold">Paths Only</span> mode to eliminate clutter. Stable sectors are condensed into quiet circle pins. Swap density to <span className="text-white font-bold">Full Details</span> above anytime to show the entire hexagonal grid.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campaign Info - Parchment Scroll */}
        <AnimatePresence>
          {!showBriefing && (
            <motion.div 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              className="absolute bottom-24 right-10 w-80 parchment border-2 border-[#8B5E3C] p-8 shadow-2xl z-30 transform -rotate-1 font-sans text-stone-900"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-stone-950/10 pb-3">
                  <h3 className="font-serif text-lg text-stone-900 font-black uppercase tracking-tighter italic">Map Ledger</h3>
                  <History size={20} className="text-[#8B5E3C]" />
                </div>
                
                <div className="space-y-4">
                  <p className="text-[11px] text-[#2D241E] leading-relaxed font-body font-bold italic opacity-80">
                    Hostilities are imminent at <span className="text-[#8B0000] underline">{milestones[currentStageIndex].name}</span>. 
                    {activeFaction === 'maratha' ? 
                      "The Afghan cavalry forces patrol the northern banks. Time is against us. Push forward to Delhi." :
                      "The Maratha defensive heavy division digs fortifications ahead. Order the vanguard cavalry to mount scouts."
                    }
                  </p>
                  
                  <div className="pt-4 border-t border-stone-950/5">
                    <div className="flex justify-between mb-2">
                      <span className="text-[9px] text-[#2D241E] font-black uppercase opacity-60 tracking-widest">
                        {activeFaction === 'maratha' ? "Confederacy Cohesion" : "Coalition Alliance Trust"}
                      </span>
                      <span className="text-[9px] font-black text-[#8B5E3C]">STABLE</span>
                    </div>
                    <div className="h-4 w-full bg-stone-950/5 flex p-0.5 gap-0.5">
                       {[...Array(10)].map((_, i) => (
                         <div key={i} className={`h-full flex-1 ${i < 7 ? (activeFaction === 'maratha' ? 'bg-saffron' : 'bg-emerald-600') : 'bg-transparent'}`} />
                       ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative ink stains */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-black/5 rounded-full blur-xl" />
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-saffron/5 rounded-full blur-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio/Briefing Overlay */}
        <AnimatePresence>
          {showBriefing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
            >
              <div className="max-w-2xl w-full p-12 bg-stone-900 border-4 border-saffron shadow-2xl text-center bronze-bevel">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-saffron flex items-center justify-center animate-pulse animate-pulse">
                    <History size={48} className="text-saffron" />
                  </div>
                </div>
                <h1 className="font-serif text-4xl text-white uppercase tracking-[0.2em] mb-4 font-bold">Campaign Briefing</h1>
                <p className="text-stone-400 font-sans text-sm md:text-md mb-12 uppercase leading-loose tracking-widest px-8">
                  {activeFaction === 'maratha' ? 
                    "The year is 1760. From the Peshwa's seat in Pune, the Maratha Empire marches northward to defend Hindusthan. Across the river Yamuna, Ahmad Shah Abdali gathers a vast coalition. Establish your supply lines and consolidate the confederacy before the final clash." :
                    "The year is 1760. From the Royal capital of Kandahar, Ahmad Shah Durrani rallies veteran Afghan clans to invade Hindusthan and oust Maratha dominance. Mobilize trans-Indus cavalry scouts and defeat their vanguard before the final battle."
                  }
                </p>
                <div className="flex flex-col items-center gap-4">
                  <button 
                    type="button"
                    onClick={initAudio}
                    className="group relative px-12 py-4 bg-saffron text-stone-950 font-serif text-xl uppercase tracking-[0.3em] font-black transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      INITIATE MARCH <Play fill="currentColor" size={20} />
                    </span>
                    <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </button>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest flex items-center gap-2">
                    <Volume2 size={12} /> Audio will be initialized upon interaction
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Visual Novel Court Politics Chambers Overlay */}
         <AnimatePresence>
           {showPunePolitics && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 overflow-y-auto"
             >
               <div className="max-w-3xl w-full p-6 md:p-8 bg-stone-900 border-4 border-saffron shadow-3xl bronze-bevel relative my-auto">
                 
                 {/* Header */}
                 <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-6">
                   <div className="flex items-center gap-3">
                     <Gavel className="text-saffron" size={24} />
                     <h2 className="font-serif text-xl md:text-2xl text-white uppercase tracking-widest font-black">
                       {activeFaction === 'maratha' ? "Pune Court Chambers" : "Kabul Durbar Chambers"}
                     </h2>
                   </div>
                   <span className="text-[10px] text-stone-500 font-mono">
                     {activeFaction === 'maratha' ? "1760 A.D. • Shaniwar Wada" : "1760 A.D. • Bala Hissar Citadel"}
                   </span>
                 </div>

                 {puneStep === 0 && (
                   <div className="space-y-6">
                     <p className="text-stone-300 font-serif italic text-sm md:text-base leading-relaxed">
                       {activeFaction === 'maratha' ? 
                         "Sadashivrao Bhau, as state financier and de-facto generalissimo, you stand before the Peshwa's court. Debts from recent campaigns reach 15 Lakh Mohurs, yet the threat of Ahmad Shah Abdali's northern league looms near. You must negotiate your command, your tactical path, and your financial war reserves before the grand army departs Pune." :
                         "Ahmad Shah Durrani, sovereign monarch of Afghanistan, you assemble the grand durbar of Pashtun, Rohilla, and Baloch emirs. While previous Delhi raids yielded immense silver treasury, Maratha expansion threatens your eastern borders. Command loyalty, secure reserves, and map your path now."
                       }
                     </p>
                     
                     <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm">
                       <p className="text-xs font-mono text-stone-400">
                         {activeFaction === 'maratha' ? (
                           <>
                             <span className="text-saffron font-bold">Peshwa Nanasaheb:</span> "Bhau, my heart is heavy with recent family loss. The treasury is almost empty, yet the honour of the Maratha flag demands we secure Delhi. Settle our court disputes and organize the march."
                           </>
                         ) : (
                           <>
                             <span className="text-red-500 font-bold">Grand Vizier Shah Wali Khan:</span> "O Pearl of Pearls, our clans are eager but they watch closely how royal command and plunder will be allocated. Consolidating raw tribal trust is paramount before crossing the Indus."
                           </>
                         )}
                       </p>
                     </div>

                     <button 
                       type="button"
                       onClick={() => setPuneStep(1)}
                       className="w-full py-4 bg-saffron hover:bg-yellow-600 font-serif text-stone-950 font-black uppercase text-xs tracking-widest transition-all"
                     >
                       Enter Court Debate
                     </button>
                   </div>
                 )}

                 {puneStep === 1 && (
                   <div className="space-y-6">
                     <div className="flex items-center gap-2 text-saffron text-xs font-bold uppercase tracking-widest">
                       <span>Debate Round 1: Command Structure</span>
                     </div>
                     <p className="text-stone-300 font-sans text-sm leading-relaxed">
                       {activeFaction === 'maratha' ? 
                         "The Peshwa's influential wife, Gopikabai, steps forward with her young son, Vishwasrao:" :
                         "Your trusted vizier Shah Wali Khan steps forward with candidate Prince Timur Shah:"
                       }
                     </p>
                     <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm italic text-xs text-stone-400 leading-relaxed">
                       {activeFaction === 'maratha' ? 
                         "\"Bhau, you shall lead the troops, but my young son Vishwasrao must march alongside you as the nominal Supreme Commander to represent the Peshwa's direct sovereign authority. Offer him the master seat, or have the Shinde and Holkar factions question your loyalty.\"" :
                         "\"Your Majesty, for seamless ethnic solidarity among the Abdali clans, we must appoint Prince Timur Shah as the nominal commander of the Punjab vanguard under your supreme sovereign gaze. This ensures unwavering commitment from the trans-Indus warriors.\""
                       }
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <button 
                         type="button"
                         onClick={() => {
                           setPuneChoices(prev => ({ ...prev, command: 'vishwasrao' }));
                           setPuneStep(2);
                         }}
                         className="p-4 bg-stone-800 border border-stone-700 hover:border-saffron text-left hover:bg-stone-820 transition-all group pointer-events-auto"
                       >
                         <h4 className="text-saffron text-xs uppercase font-serif font-black mb-1">
                           {activeFaction === 'maratha' ? "Accept Vishwasrao (Nominal Seat)" : "Consimilate Timur Shah (Nominal Command)"}
                         </h4>
                         <p className="text-[10px] text-stone-400 leading-normal">
                           {activeFaction === 'maratha' ? 
                             "Honours Gopikabai. Unifies court trust under Peshwa's banner. +20 Starting Army Morale" :
                             "Honours tribal chiefs. Guarantees absolute trans-Indus cavalry loyalty. +20 Starting Army Morale"
                           }
                         </p>
                       </button>
                       <button 
                         type="button"
                         onClick={() => {
                           setPuneChoices(prev => ({ ...prev, command: 'bhau' }));
                           setPuneStep(2);
                         }}
                         className="p-4 bg-stone-800 border border-stone-700 hover:border-saffron text-left hover:bg-stone-820 transition-all group pointer-events-auto"
                       >
                         <h4 className="text-saffron text-xs uppercase font-serif font-black mb-1">
                           {activeFaction === 'maratha' ? "Request Direct Sovereign Dictate" : "Declare Imperial Single General Command"}
                         </h4>
                         <p className="text-[10px] text-stone-400 leading-normal">
                           {activeFaction === 'maratha' ? 
                             "Demands full decision sovereignty. Gopikabai is wary, but control is total. +20% Starting Tactical Advantage" :
                             "Establishes supreme iron command. Some chieftains grumble, but strategy is streamlined. +20% Starting Tactical Advantage"
                           }
                         </p>
                       </button>
                     </div>
                   </div>
                 )}

                 {puneStep === 2 && (
                   <div className="space-y-6">
                     <div className="flex items-center gap-2 text-saffron text-xs font-bold uppercase tracking-widest">
                       <span>Debate Round 2: Military Strategy</span>
                     </div>
                     <p className="text-stone-300 font-sans text-sm leading-relaxed">
                       {activeFaction === 'maratha' ? 
                         "Veteran chief Malharrao Holkar and artillery officer Ibrahim Khan Gardi lock eyes in disagreement:" :
                         "Tribal light horse general Jahan Khan and Rohilla musketeer Najib-ud-Daula locked in debate:"
                       }
                     </p>
                     <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm text-xs text-stone-400 flex flex-col gap-3">
                       {activeFaction === 'maratha' ? (
                         <>
                           <p className="italic">
                             <span className="text-orange-400 font-bold">Holkar:</span> "Bhau! The Afghan coalition is rapid and relies on heavy shock horsemen. We must burn the country, travel light with nimble cavalry, and use Ganimi Kava guerrilla tactics instead of heavy artillery carts!"
                           </p>
                           <p className="italic border-t border-stone-900 pt-3">
                             <span className="text-blue-400 font-bold">Ibrahim Gardi:</span> "Sovereign General, their cavalry will slice your light skirmishers on the flat plains. My European-drilled French flintlock infantry and bronze gun batteries must form our iron spine. Do not abandon the artillery!"
                           </p>
                         </>
                       ) : (
                         <>
                           <p className="italic">
                             <span className="text-orange-400 font-bold">Jahan Khan:</span> "Your Majesty! True Afghan force exists in swift cavalry maneuvers. Let us travel with nimble saddle bags, bypassing Maratha fortifications to shock their flanks!"
                           </p>
                           <p className="italic border-t border-stone-900 pt-3">
                             <span className="text-blue-400 font-bold">Najib-ud-Daula:</span> "O Shah, Maratha heavy Gardi guns will decimate our standard unarmored horsemen on flat flats. We must secure my heavy camel-mounted Zamburak swivel-cannon reserves to break their squares."
                           </p>
                         </>
                       )}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <button 
                         type="button"
                         onClick={() => {
                           setPuneChoices(prev => ({ ...prev, strategy: 'gardi' }));
                           setPuneStep(3);
                         }}
                         className="p-4 bg-stone-800 border border-stone-700 hover:border-saffron text-left hover:bg-stone-820 transition-all group pointer-events-auto"
                       >
                         <h4 className="text-saffron text-xs uppercase font-serif font-black mb-1">
                           {activeFaction === 'maratha' ? "Authorize Gardi's Guns Spine" : "Deploy Camel-Mounted Zamburaks"}
                         </h4>
                         <p className="text-[10px] text-stone-400 leading-normal">
                           {activeFaction === 'maratha' ? 
                             "Adopt defensive artillery lines. +35% Artillery & Siege Damage in battles" :
                             "Incorporate highly mobile heavy swivel artillery. +35% Swivel Artillery Damage"
                           }
                         </p>
                       </button>
                       <button 
                         type="button"
                         onClick={() => {
                           setPuneChoices(prev => ({ ...prev, strategy: 'holkar' }));
                           setPuneStep(3);
                         }}
                         className="p-4 bg-stone-800 border border-stone-700 hover:border-saffron text-left hover:bg-stone-820 transition-all group pointer-events-auto"
                       >
                         <h4 className="text-saffron text-xs uppercase font-serif font-black mb-1">
                           {activeFaction === 'maratha' ? "Endorse Holkar's Horse Raids" : "Endorse Jahan Khan's Shock Cavalry"}
                         </h4>
                         <p className="text-[10px] text-stone-400 leading-normal">
                           {activeFaction === 'maratha' ? 
                             "Maneuver-based light cavalry tactics. +20% Cavalry shock value & river speed" :
                             "Saddle light and sweep through riverbanks. +20% Cavalry charge & ambush speed"
                           }
                         </p>
                       </button>
                     </div>
                   </div>
                 )}

                 {puneStep === 3 && (
                   <div className="space-y-6">
                     <div className="flex items-center gap-2 text-saffron text-xs font-bold uppercase tracking-widest">
                       <span>Debate Round 3: Campaign Treasury</span>
                     </div>
                     <p className="text-stone-300 font-sans text-sm leading-relaxed">
                       {activeFaction === 'maratha' ? 
                         "Financial secretary Raghunathrao details the crushing state debts:" :
                         "Grand Vizier Shah Wali Khan reviews the state coffers:"
                       }
                     </p>
                     <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm italic text-xs text-stone-400 leading-relaxed">
                       {activeFaction === 'maratha' ? 
                         "\"Our military debt exceeds 15 Lakh Mohurs. The southern bankers refuse extra loans without collateral. How will you support the supply caravans and paid Gardi mercenaries on this 1,000-mile march?\"" :
                         "\"The campaigns in Central Asia have cost us dearly, and our mercenaries expect consistent silver coins. How shall we secure the required funds for the thousands of horses traversing the Indus rivers?\""
                       }
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <button 
                         type="button"
                         onClick={() => {
                           setPuneChoices(prev => ({ ...prev, treasury: 'tax' }));
                           setPuneStep(4);
                         }}
                         className="p-4 bg-stone-800 border border-stone-700 hover:border-saffron text-left hover:bg-stone-820 transition-all group pointer-events-auto"
                       >
                         <h4 className="text-saffron text-xs uppercase font-serif font-black mb-1">
                           {activeFaction === 'maratha' ? "Levy Temple revenues in North" : "Levy Tributary Taxes on Punjab Cities"}
                         </h4>
                         <p className="text-[10px] text-stone-400 leading-normal">
                           {activeFaction === 'maratha' ? 
                             "Secure gold from northern shrines. +120,000 Mohurs war budget" :
                             "Seize granary tolls on Multan and Lahore. +120,000 Mohurs war budget"
                           }
                         </p>
                       </button>
                       <button 
                         type="button"
                         onClick={() => {
                           setPuneChoices(prev => ({ ...prev, treasury: 'barons' }));
                           setPuneStep(4);
                         }}
                         className="p-4 bg-stone-800 border border-stone-700 hover:border-saffron text-left hover:bg-stone-820 transition-all group pointer-events-auto"
                       >
                         <h4 className="text-saffron text-xs uppercase font-serif font-black mb-1">
                           {activeFaction === 'maratha' ? "Mortgage Jagirs & Royal Jewelry" : "Pledge Plunder Shares to Chieftains"}
                         </h4>
                         <p className="text-[10px] text-stone-400 leading-normal">
                           {activeFaction === 'maratha' ? 
                             "Defend regional trust. +40 regional trust in northern embassies" :
                             "Gain absolute chief devotion. +40 trust in northern diplomatic embassies"
                           }
                         </p>
                       </button>
                     </div>
                   </div>
                 )}

                 {puneStep === 4 && (
                   <div className="space-y-6 font-sans">
                     <div className="flex justify-center mb-4">
                       <div className="w-16 h-16 rounded-full border border-saffron bg-saffron/10 flex items-center justify-center text-saffron text-xl font-serif">
                         ✓
                       </div>
                     </div>
                     <h3 className="font-serif text-lg text-white text-center uppercase tracking-widest">Policy of the March Sealed</h3>
                     <div className="bg-stone-950 p-4 border border-stone-800 text-xs text-stone-400 space-y-2 font-mono">
                       <p className="text-center text-stone-500 mb-2">--- FINALIZED STRATEGIC PATH ---</p>
                       <p>• Command authority: <span className="text-saffron">{puneChoices.command === 'vishwasrao' ? (activeFaction === 'maratha' ? 'Peshwa Sovereign Banner (Vishwasrao)' : 'Dynastic Legacy (Timur Shah nominal)') : (activeFaction === 'maratha' ? 'Direct Dictate (Sadashivrao Bhau)' : 'Supreme Royal Will (Ahmad Shah Durrani)')}</span></p>
                       <p>• Tactical stance: <span className="text-saffron">{puneChoices.strategy === 'gardi' ? (activeFaction === 'maratha' ? 'Gardi Artillery Lines' : 'Heavy Camel Zamburaks') : (activeFaction === 'maratha' ? 'Holkar Cavalry Guerrilla' : 'Jahan Khan Shock Cavalry')}</span></p>
                       <p>• Strategic funding: <span className="text-saffron">{puneChoices.treasury === 'tax' ? (activeFaction === 'maratha' ? 'Northern Temples & tributary taxes' : 'Punjab granary tolls') : (activeFaction === 'maratha' ? 'Baron land Mortgages' : 'Pledged spoils divided')}</span></p>
                     </div>
                     
                     <div className="bg-saffron/10 border border-saffron/20 p-4 text-[11px] text-saffron font-serif italic text-center rounded-sm">
                       {activeFaction === 'maratha' ? 
                         "\"The treaties are filed in the durbars, and the saffron war banner has been unfurled at Shaneewar Wada. The Maratha grand host marches from Pune!\"" :
                         "\"The royal decrees are stamped with the seal of Ahmad Shah. The war drums beat at Bala Hissar. The Afghan coalition crosses the majestic Indus!\""
                       }
                     </div>

                     <button 
                       type="button"
                       onClick={() => {
                         setShowPunePolitics(false);
                         onAdvance();
                       }}
                       className="w-full py-4 bg-saffron hover:bg-yellow-600 font-serif text-stone-950 font-black uppercase text-xs tracking-widest transition-all pointer-events-auto"
                     >
                       Close Court Records & Begin Campaign
                     </button>
                   </div>
                 )}

               </div>
             </motion.div>
           )}
         </AnimatePresence>

        {/* Negotiation Overlay */}
         <AnimatePresence>
           {false && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in"
             >
               <div className="max-w-2xl w-full p-12 bg-stone-900 border-4 border-[#8B5E3C] shadow-2xl bronze-bevel">
                 <h2 className="font-serif text-3xl text-white uppercase tracking-[0.2em] mb-8 font-bold">Courtly Negotiations</h2>
                 <p className="text-stone-400 font-sans text-sm mb-12">
                   Strategic map politics at {milestones[currentStageIndex].name}. Negotiate with local rulers to gain support before the inevitable confrontation.
                 </p>
                 <div className="grid grid-cols-2 gap-4">
                   <button type="button" onClick={() => { onAdvance(); }} className="px-6 py-4 bg-emerald-950 hover:bg-emerald-850 border border-emerald-500/20 text-white font-bold uppercase tracking-widest transition-all">Secure Alliance</button>
                   <button type="button" onClick={() => { onAdvance(); }} className="px-6 py-4 bg-stone-800 hover:bg-stone-700 border border-stone-600/25 text-white font-bold uppercase tracking-widest transition-all font-sans">Bribe Ruler</button>
                   <button type="button" onClick={() => { onAdvance(); }} className="px-6 py-4 bg-stone-800 hover:bg-stone-700 border border-stone-600/25 text-white font-bold uppercase tracking-widest transition-all">Dismiss Local Demands</button>
                   <button type="button" onClick={() => { }} className="px-6 py-4 bg-red-950 hover:bg-red-900 border border-red-500/20 text-white font-bold uppercase tracking-widest transition-all">Abort Negotiation</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

                    {/* Gwalior Council / Rohilkhand Compact Chambers Overlay */}
                    <AnimatePresence>
                      {showGwaliorChambers && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 overflow-y-auto font-sans"
                        >
                          <div className="max-w-3xl w-full p-6 md:p-8 bg-stone-900 border-4 border-saffron shadow-3xl bronze-bevel relative my-auto">
                            
                            <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-6 font-sans">
                              <div className="flex items-center gap-3">
                                <Gavel className="text-saffron" size={24} />
                                <h2 className="font-serif text-xl md:text-2xl text-white uppercase tracking-widest font-black">
                                  {activeFaction === 'maratha' ? "Gwalior Fort Alliances" : "Rohilkhand Afghan Compact"}
                                </h2>
                              </div>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {activeFaction === 'maratha' ? "1760 A.D. • Scindia Royal Outpost" : "1760 A.D. • Bareilly Rohilla Fort"}
                              </span>
                            </div>

                            <div className="space-y-6">
                              <p className="text-stone-300 font-serif italic text-sm md:text-base leading-relaxed font-sans text-left font-serif">
                                {activeFaction === 'maratha' ? 
                                  "You stand within the imposing sandstone battlements of Gwalior Fort. The legendary Jat ruler, Maharaja Suraj Mal of Bharatpur, and experienced chieftain Malharrao Holkar have arrived to audit your northern strategy. There is a deep tactical split regarding baggage family lines." :
                                  "Ahmad Shah, you hold council with Najib-ud-Daula, the passionate Rohilla chieftain. The Rohillas form the largest Afghan settlement in India, but Najib faces internal queries regarding your commitment to protect their homeland."
                                }
                              </p>
                              
                              <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm">
                                <p className="text-xs font-mono text-stone-400 leading-relaxed font-sans text-left">
                                  {activeFaction === 'maratha' ? (
                                    <>
                                      <span className="text-yellow-600 font-bold">Maharaja Suraj Mal:</span> "Bhau, the northern heat is severe and Abdali's horsemen run light. Leave your heavy artillery carts, families, and court ladies at Gwalior. Let us fight this as mobile guerrilla cavalry, or we risk being starved in siege trenches!"
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-red-500 font-bold">Chieftain Najib-ud-Daula:</span> "O Pearl of Pearls, my Rohilla warriors will serve as your vanguard, but you must vow to establish an Islamic consensus at Delhi, protect our shrines from Maratha raids, and grant us tax immunities."
                                    </>
                                  )}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setGwaliorChoices({ stance: 'hybrid' });
                                    setShowGwaliorChambers(false);
                                    onAdvance();
                                  }}
                                  className="p-4 bg-stone-800 border border-stone-700 hover:border-saffron text-left transition-all group pointer-events-auto cursor-pointer"
                                >
                                  <h4 className="text-saffron text-xs uppercase font-serif font-black mb-1">
                                    {activeFaction === 'maratha' ? "Accept Suraj Mal's light tactics" : "Swear the Sacred Bareilly Covenant"}
                                  </h4>
                                  <p className="text-[10px] text-stone-400 leading-normal font-sans">
                                    {activeFaction === 'maratha' ? 
                                      "Sheds the heavy luggage. Yields higher tactical speed. +20% starting Cavalry combat shock." :
                                      "Secures passionate Rohilla enlistment. Najib rallies 20,000 veterans. +30% starting defense posture."
                                    }
                                  </p>
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setGwaliorChoices({ stance: 'gardi' });
                                    setShowGwaliorChambers(false);
                                    onAdvance();
                                  }}
                                  className="p-4 bg-stone-800 border border-stone-700 hover:border-saffron text-left transition-all group pointer-events-auto cursor-pointer"
                                >
                                  <h4 className="text-saffron text-xs uppercase font-serif font-black mb-1">
                                    {activeFaction === 'maratha' ? "Rely on Heavy Gardi Guns Stance" : "Offer Royal Revenue Percentages"}
                                  </h4>
                                  <p className="text-[10px] text-stone-400 leading-normal font-sans">
                                    {activeFaction === 'maratha' ? 
                                      "Reject Suraj Mal's advice. Maintain full baggage court train. Suraj Mal departs, but Ibrahim Gardi's guns hold firm. +35% Artillery bonus." :
                                      "Satisfies Rohilla demands with future Delhi revenue share. Promotes high stability. Unlocks +120,000 war gold reserves."
                                    }
                                  </p>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

          {/* Floating Cabinet controller */}
          {!showBriefing && (
            <div className="absolute top-20 left-6 z-40 flex flex-col gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setShowCabinet(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-stone-950/95 border border-[#8B5E3C] hover:border-saffron text-saffron hover:text-white rounded-sm font-serif text-[10px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md transition-all hover:scale-105"
              >
                <Scroll size={13} className="text-saffron" />
                <span>Imperial Cabinet</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDiplomacy(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-stone-950/95 border border-[#8B5E3C] hover:border-emerald-500 text-emerald-400 hover:text-white rounded-sm font-serif text-[10px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md transition-all hover:scale-105"
              >
                <MessageSquare size={13} className="text-emerald-500 animate-pulse" />
                <span>Diplomatic Darbar</span>
              </button>
            </div>
          )}

          {/* MILSTONE DIALOGUE - Historical Timeline & Civ-Style Policy Selector */}
          <AnimatePresence>
            {selectedMilestone && (() => {
              const stageData = MILESTONE_POLICY_DATABASE[activeFaction]?.[selectedMilestone.stage as CampaignStage];
              const isCompleted = milestones.findIndex(m => m.stage === selectedMilestone.stage) < currentStageIndex;
              const isCurrent = selectedMilestone.stage === milestones[currentStageIndex]?.stage;
              const isLocked = milestones.findIndex(m => m.stage === selectedMilestone.stage) > currentStageIndex;

              return (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto"
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 30 }}
                    className="max-w-4xl w-full p-6 md:p-8 bg-[#1c1613] border-4 border-[#8B5E3C] shadow-3xl bronze-bevel relative my-auto text-stone-100 font-sans text-left"
                  >
                    {/* Close button */}
                    <button
                      type="button"
                      onClick={() => setSelectedMilestone(null)}
                      className="absolute top-4 right-4 p-2 bg-stone-900 border border-stone-850 hover:bg-stone-850 hover:border-saffron text-stone-400 hover:text-saffron transition-all rounded-sm"
                    >
                      <X size={18} />
                    </button>

                    {/* Timeline Stage Badge Header */}
                    <div className="flex flex-wrap items-center justify-between border-b border-[#8B5E3C]/30 pb-4 mb-5 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-saffron uppercase tracking-[0.15em] bg-saffron/10 px-2 py-0.5 rounded-sm border border-saffron/20 font-bold">
                            {stageData?.date || "1760 A.D."}
                          </span>
                          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold
                            ${isCompleted ? 'bg-green-950/40 text-emerald-400 border border-emerald-900/30' : 
                              isCurrent ? 'bg-amber-950/40 text-saffron border border-saffron/20 animate-pulse' : 
                              'bg-stone-900 text-stone-500 border border-stone-800'}
                          `}>
                            {isCompleted ? "COMPLETED STAGE" : isCurrent ? "ACTIVE CAMPAIGN TARGET" : "FUTURE TERRAIN"}
                          </span>
                        </div>
                        <h2 className="font-serif text-2xl md:text-3xl text-white uppercase tracking-wider font-black">
                          {selectedMilestone.name}
                        </h2>
                      </div>
                      
                      <div className="text-right pr-12">
                        <span className="text-[9px] font-mono text-stone-500 block uppercase">Operational Area</span>
                        <span className="text-[11px] font-serif uppercase tracking-widest text-[#ffb86c] font-black">
                          {activeFaction === 'maratha' ? "Deccan to Delhi" : "Kandahar to Doab"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Interactive Lore & Detailed Storytelling Timeline Context */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="bg-[#2a1f1b]/60 p-5 border border-[#8B5E3C]/20 rounded-sm">
                          <h3 className="text-stone-400 text-[10px] font-mono uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                            <BookOpen size={12} className="text-[#ffb86c]" /> 
                            <span>Historical Chronicle & Lore</span>
                          </h3>
                          <p className="text-stone-200 text-xs font-serif italic leading-relaxed text-slate-100">
                            {stageData?.lore || selectedMilestone.desc}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[9px] font-mono uppercase text-stone-400 font-black tracking-wider mb-2">Campaign Directive:</h4>
                          <p className="text-xs text-stone-300 leading-relaxed font-body">
                            {selectedMilestone.desc}
                          </p>
                        </div>

                        {/* Interactive regional zone click helper */}
                        <div className="bg-stone-950/40 p-3 rounded-sm border border-stone-850 flex items-center gap-2.5">
                          <Info size={16} className="text-[#ffb86c] shrink-0" />
                          <p className="text-[10px] text-stone-400 leading-normal">
                            Establishing pacts with physical landmark badges (🏔️, 🌊) from the map rewards your faction with resource stockpiles.
                          </p>
                        </div>
                      </div>

                      {/* Right: Civilization-Style Policy Card Selection & Alliance Slotting */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="border border-[#8B5E3C]/30 p-4 bg-stone-950/60 rounded-sm">
                          <h3 className="text-saffron text-[10px] font-serif font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Award size={13} />
                            <span>Slotted Stage Policy Card</span>
                          </h3>
                          
                          {stageData ? (
                            <div className="space-y-3">
                              <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
                                Select one of the authentic Civilization-inspired policies to activate its state-wide bonuses.
                              </p>
                              
                              <div className="grid grid-cols-1 gap-2.5">
                                {stageData.policies.map((pol: PolicyCardOption) => {
                                  const isSlotted = stagePolicies[selectedMilestone.stage] === pol.id;
                                  return (
                                    <button
                                      key={pol.id}
                                      type="button"
                                      disabled={isLocked}
                                      onClick={() => {
                                        const updated = { ...stagePolicies, [selectedMilestone.stage]: pol.id };
                                        setStagePolicies(updated);
                                        localStorage.setItem('panipat_stage_policies', JSON.stringify(updated));
                                        setSelectedPolicyForMessenger(pol.id);
                                        setIsMessengerOpen(true);
                                      }}
                                      className={`p-3 text-left transition-all duration-200 border rounded-sm flex items-start gap-2.5 relative cursor-pointer
                                        ${isSlotted 
                                          ? 'bg-stone-900 border-saffron shadow-[0_0_12px_rgba(255,153,51,0.2)]' 
                                          : 'bg-stone-900/40 border-stone-800 hover:border-stone-700'
                                        }
                                        ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                                      `}
                                    >
                                      <span className="text-lg bg-stone-950 p-1.5 rounded-sm line-height-[1] shrink-0">{pol.icon}</span>
                                      <div className="space-y-0.5 flex-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-stone-200 text-xs font-bold font-serif">{pol.name}</span>
                                          <span className={`text-[8px] font-bold uppercase rounded-full px-1.5 border
                                            ${pol.type === 'Military' ? 'text-red-400 border-red-950 bg-red-950/30' : 'text-amber-400 border-amber-950 bg-amber-950/30'}
                                          `}>
                                            {pol.type}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-stone-400 line-clamp-1">{pol.desc}</p>
                                        <p className="text-[10px] font-bold text-[#ffb86c] font-mono select-none mt-1">{pol.effect}</p>
                                      </div>
                                      {isSlotted && (
                                        <span className="absolute bottom-1 right-2 text-[8px] text-saffron uppercase font-mono font-black tracking-widest">
                                          ✓ Active Slot
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <p className="text-stone-500 text-xs font-mono italic">No policies registered for this stage.</p>
                          )}
                        </div>

                        {/* Alliance treaty card box */}
                        <div className="border border-[#8B5E3C]/30 p-4 bg-stone-950/60 rounded-sm">
                          <h3 className="text-saffron text-[10px] font-serif font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Users size={13} />
                            <span>Sovereign Alliance Covenant</span>
                          </h3>

                          {stageData?.alliance ? (() => {
                            const isSigned = stageAlliances[selectedMilestone.stage] === stageData.alliance.id;
                            return (
                              <div className="space-y-2">
                                <div className={`p-3 border rounded-sm transition-all duration-200 bg-stone-900/60 flex items-start gap-3 relative
                                  ${isSigned ? 'border-emerald-600/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]' : 'border-stone-850'}
                                `}>
                                  <span className="text-lg bg-stone-950 p-1.5 rounded-sm line-height-[1] shrink-0">
                                    {stageData.alliance.icon}
                                  </span>
                                  <div className="space-y-0.5">
                                    <h4 className="text-stone-200 text-xs font-bold font-serif">{stageData.alliance.name}</h4>
                                    <p className="text-[9px] text-[#ffb86c] font-mono">Leader: {stageData.alliance.leader}</p>
                                    <p className="text-[10px] text-stone-400 leading-normal">{stageData.alliance.benefit}</p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={isLocked}
                                  onClick={() => {
                                    const nextSigned = isSigned ? "" : stageData.alliance.id;
                                    const updated = { ...stageAlliances, [selectedMilestone.stage]: nextSigned };
                                    setStageAlliances(updated);
                                    localStorage.setItem('panipat_stage_alliances', JSON.stringify(updated));
                                  }}
                                  className={`w-full py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1 cursor-pointer
                                    ${isSigned 
                                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/70 hover:bg-emerald-950/60' 
                                      : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-800'
                                    }
                                    ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}
                                  `}
                                >
                                  {isSigned ? "✓ Alliance Treaty Established" : "Sign State Covenant Treaty (-15k Gold)"}
                                </button>
                              </div>
                            );
                          })() : (
                            <p className="text-stone-500 text-xs font-mono italic">No regional alliances active here.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions: Clicking current milestones allows initiating action! */}
                    <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#8B5E3C]/30">
                      <button
                        type="button"
                        onClick={() => setSelectedMilestone(null)}
                        className="px-6 py-2 border border-stone-700 text-stone-400 hover:text-white uppercase font-black text-[10px] tracking-widest rounded-sm transition-all bg-transparent cursor-pointer"
                      >
                        Return to Map
                      </button>

                      {isCurrent ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMilestone(null);
                            handleInitiate();
                          }}
                          className={`px-8 py-2.5 text-white font-serif font-black text-sm uppercase tracking-[0.2em] shadow-lg animate-pulse hover:scale-105 active:scale-95 transition-transform duration-100 cursor-pointer
                            ${activeFaction === 'maratha' ? 'bg-[#9a3412] hover:bg-[#c2410c] border border-saffron' : 'bg-[#991b1b] hover:bg-[#b91c1c] border border-red-500'}
                          `}
                        >
                          COMMENCE OPERATION
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">
                          {isCompleted ? "✓ Historical Records Closed" : "🔒 Objective Territory Locked"}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* IMPERIAL CABINET MODAL OVERLAY */}
          <AnimatePresence>
            {showCabinet && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto"
              >
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="max-w-5xl w-full p-6 md:p-8 bg-[#14100d] border-4 border-[#8B5E3C] shadow-3xl bronze-bevel relative my-auto text-stone-100 font-sans"
                >
                  <button
                    type="button"
                    onClick={() => setShowCabinet(false)}
                    className="absolute top-4 right-4 p-2 bg-stone-900 border border-stone-800 hover:bg-stone-850 hover:border-saffron text-stone-400 hover:text-saffron transition-all rounded-sm"
                  >
                    <X size={18} />
                  </button>

                  {/* Header */}
                  <div className="border-b border-[#8B5E3C]/30 pb-4 mb-6 text-left">
                    <h2 className="font-serif text-2xl md:text-3xl text-saffron uppercase font-black tracking-widest flex items-center gap-3.5">
                      <Scroll className="text-saffron" size={28} />
                      <span>The Emperor's Imperial Cabinet</span>
                    </h2>
                    <p className="text-stone-400 text-xs mt-1">
                      Assess the total political alignment, state covenants, and policy card deck structured during your campaigns in Hindusthan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                    
                    {/* Left Panel: Cumulative Civilization State Statistics */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="border border-[#8B5E3C]/35 bg-[#1f1814] p-5 rounded-sm">
                        <h3 className="font-serif text-saffron uppercase tracking-widest text-xs font-black mb-4 flex items-center gap-1.5 border-b border-[#8B5E3C]/20 pb-2">
                          <Coins size={14} />
                          <span>Empire Logistics & Gold</span>
                        </h3>

                        <div className="space-y-3.5">
                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-mono block">Slotted Policies Count:</span>
                            <span className="text-xl font-serif font-bold text-white">
                              {Object.keys(stagePolicies).length} Card(s) active
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-mono block">Covenant Treaties Pledges:</span>
                            <span className="text-xl font-serif font-bold text-emerald-400">
                              {Object.values(stageAlliances).filter(v => !!v).length} Active Alliances
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-mono block">Territorial Landmark Treaties:</span>
                            <span className="text-xl font-serif font-bold text-saffron">
                              {Object.values(alliedTerritories).filter(v => !!v).length} Secures
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cumulative combat advantage parameters */}
                      <div className="border border-[#8B5E3C]/35 bg-[#1f1814] p-5 rounded-sm text-left">
                        <h3 className="font-serif text-saffron uppercase tracking-widest text-xs font-black mb-3 flex items-center gap-1.5">
                          <Shield size={14} />
                          <span>Calculated Campaign Buffs</span>
                        </h3>
                        
                        <div className="space-y-2.5 text-xs">
                          {Object.keys(stagePolicies).length === 0 ? (
                            <p className="text-stone-500 italic text-[11px]">No active bonuses unlocked yet. Slot some policy cards inside milestones.</p>
                          ) : (
                            <div className="space-y-2 text-[11px] font-mono">
                              {Object.entries(stagePolicies).map(([stage, polId]) => {
                                const matched = MILESTONE_POLICY_DATABASE[activeFaction]?.[stage as CampaignStage]?.policies.find((p: any) => p.id === polId);
                                if (!matched) return null;
                                return (
                                  <div key={polId} className="flex justify-between items-center text-slate-300 border-b border-stone-850 pb-1.5">
                                    <span className="truncate max-w-[150px]">{matched.name}</span>
                                    <span className="text-emerald-400 font-bold">{matched.effect}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Horizontal or Grid presentation of your complete campaign storyline timeline */}
                    <div className="lg:col-span-8 border border-[#8B5E3C]/30 bg-stone-950/60 p-5 rounded-sm overflow-y-auto max-h-[380px] space-y-4">
                      <h3 className="font-serif text-white uppercase tracking-widest text-sm font-black mb-2 flex items-center gap-2">
                        <History size={16} className="text-saffron" />
                        <span>Civilization-style Policy & Alliances Timeline</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                        {milestones.map((m, index) => {
                          const stageData = MILESTONE_POLICY_DATABASE[activeFaction]?.[m.stage as CampaignStage];
                          const activePolId = stagePolicies[m.stage];
                          const activeAllianceId = stageAlliances[m.stage];
                          const chosenPolicy = stageData?.policies.find((p: any) => p.id === activePolId);

                          return (
                            <div 
                              key={m.stage}
                              onClick={() => {
                                setShowCabinet(false);
                                setSelectedMilestone(m);
                              }}
                              className={`p-3 border transition-all duration-150 rounded-sm cursor-pointer hover:scale-[1.01] text-left
                                ${index <= currentStageIndex 
                                  ? 'bg-[#1e1714] border-[#8B5E3C]/40 hover:border-saffron' 
                                  : 'bg-stone-900/30 border-stone-850 opacity-40 hover:opacity-75'
                                }
                              `}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] text-stone-500 font-mono font-bold leading-none">{stageData?.date || "1760 A.D."}</span>
                                <span className={`text-[8px] font-bold font-mono uppercase px-1.5 rounded-sm line-height-[1]
                                  ${index < currentStageIndex ? 'bg-green-950/30 text-emerald-400' : index === currentStageIndex ? 'bg-amber-950/30 text-saffron border border-saffron/20' : 'bg-stone-800 text-stone-500'}
                                `}>
                                  {index < currentStageIndex ? "SAVED ✓" : index === currentStageIndex ? "CURRENT" : "LOCKED"}
                                </span>
                              </div>

                              <h4 className="text-stone-100 text-xs font-serif font-black uppercase mb-1">{m.name}</h4>
                              
                              <div className="mt-2 text-[10px] space-y-1">
                                <div className="flex items-center justify-between text-stone-400">
                                  <span>Policy:</span>
                                  <span className={chosenPolicy ? "text-saffron font-bold font-serif" : "text-stone-600"}>
                                    {chosenPolicy ? `${chosenPolicy.icon} ${chosenPolicy.name}` : "Not Slotted"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-stone-400">
                                  <span>Alliance:</span>
                                  <span className={activeAllianceId ? "text-emerald-400 font-bold" : "text-stone-600"}>
                                    {activeAllianceId ? "Signed Treaty" : "No Treaty"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCabinet(false)}
                      className="px-8 py-2 bg-saffron text-stone-950 font-serif font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                      Return to Command
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DIPLOMATIC NOTIFICATION BANNER */}
          <AnimatePresence>
            {activeNotification && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-55 max-w-xl w-[90%] bg-stone-950/95 border-2 border-emerald-500 p-4 shadow-3xl rounded-sm backdrop-blur-md flex items-start gap-3 text-left"
              >
                <div className="p-1.5 bg-emerald-900/30 rounded-sm border border-emerald-500/30 shrink-0">
                  <Check className="text-emerald-405" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#8b5e3c] block">Scribe Despatch Recipient</span>
                  <p className="text-[11px] font-serif font-black uppercase text-stone-100 tracking-wide mt-0.5 leading-normal">
                    {activeNotification}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveNotification(null)}
                  className="p-1 hover:bg-stone-900 border border-transparent hover:border-stone-850 rounded-xs text-stone-500 hover:text-stone-300 cursor-pointer self-start"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ROYAL DIPLOMATIC DARBAR COMPONENT */}
          <AnimatePresence>
            {showDiplomacy && (
              <DiplomacyDarbar 
                isOpen={showDiplomacy} 
                onClose={() => setShowDiplomacy(false)} 
                activeFaction={playingFaction} 
                onApplyRewards={handleApplyDiplomaticRewards} 
              />
            )}
          </AnimatePresence>

          {/* HISTORICAL ROYAL BANNER INFO WIDGET */}
          <RoyalBanner />

          {/* DYNAMIC DISPATCH MESSENGER DISPATCH */}
          <CommanderMessenger 
            isOpen={isMessengerOpen} 
            onClose={() => setIsMessengerOpen(false)} 
            policyId={selectedPolicyForMessenger} 
            faction={playingFaction} 
          />

        </main>

      </div>
    );
  };

