import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  MapPin, 
  Compass, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Lock, 
  Scroll, 
  Swords, 
  Award, 
  ChevronRight, 
  BookOpen, 
  Skull, 
  Flame, 
  Coins,
  Shield,
  Gavel
} from 'lucide-react';
import { Screen, CampaignStage } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';
import { PeshwaDespatchBook } from '../components/PeshwaDespatchBook';
import { BattleReplayAnalyzer } from '../components/BattleReplayAnalyzer';

interface TimelineEvent {
  stage: CampaignStage;
  date: string;
  title: string;
  subtitle: string;
  location: string;
  threatLevel: 'Low' | 'Moderate' | 'High' | 'Severe' | 'Critical';
  marathaMove: string;
  afghanMove: string;
  historicalContext: string;
  strategicWeight: string;
  quote: string;
  quoteAuthor: string;
  objectives: string[];
  metrics: {
    moraleChange: number;
    logisticsChange: number;
    goldChange: number;
  };
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    stage: CampaignStage.NIZAM_CAMPAIGN,
    date: "January - February 1760",
    title: "Battle of Udgir",
    subtitle: "Flank Security & Deccan Hegemony",
    location: "Udgir Fort, Deccan Basalt Valleys",
    threatLevel: "Moderate",
    marathaMove: "Sadashivrao Bhau commands a brilliant double-envelopment of Nizam's trenches, leveraging Ibrahim Khan Gardi's European-disciplined artillery squares.",
    afghanMove: "Ahmad Shah Durrani remains east of the Yamuna, consolidating ties with Najib-ud-Daula while the Nizam remains pinned in the south.",
    historicalContext: "Before marching to Punjab, the Maratha Peshwa required security on their southern flank. The spectacular victory at Udgir forced the Nizam of Hyderabad to surrender crucial northern forts and pay a massive 60-lakh rupee tribute. This funded the infantry recruitment for the Northern Grand expedition.",
    strategicWeight: "Pivotal precursor battle. Stabilized the Peshwa's rule in the Deccan, validating the effectiveness of French-pattern artillery barracks under Ibrahim Gardi.",
    quote: "The French flintlock fire of Ibrahim Khan Gardi tore through our seasoned cavalry ranks like a monsoon storm. We must yield the forts of Udgir, Asirgarh, and Bijapur.",
    quoteAuthor: "Emissary of Nizam-ul-Mulk, 1760 A.D.",
    objectives: [
      "Mobilize Ibrahim Gardi's professional artillery battalions",
      "Exact royal tribute gold from the Hyderabad treasury",
      "Establish southern fortress blockades"
    ],
    metrics: {
      moraleChange: 20,
      logisticsChange: 15,
      goldChange: 60000
    }
  },
  {
    stage: CampaignStage.PUNE,
    date: "March 14, 1760",
    title: "Muster at Shaniwar Wada",
    subtitle: "Appointment of the Grand Regent",
    location: "Pune Palace, Deccan Capital",
    threatLevel: "Low",
    marathaMove: "Sadashivrao Bhau is appointed Commander-in-Chief. Saffron flags (Bhagwa Dhwaj) fly high as 50,000 elite horsemen muster outside the city gates.",
    afghanMove: "Pashtun high-landers cross the Salt Range into Punjab, systematically sweeping the frontier Maratha outposts of Sabaji Shinde.",
    historicalContext: "Spurred by Najib-ud-Daula’s invitations, Ahmad Shah Durrani's rapid incursion threatened Maratha sovereignty over Delhi. In response, Peshwa Balaji Baji Rao commissions his cousin, Bhau, to lead a massive Confederate host. The army departs amidst prayers, loaded with royal court entourages and heavy luxury family wagons.",
    strategicWeight: "Determined the political leadership of the expedition. The decision to march as a colossal moving fortress of soldiers and dependents proved to be a fatal logistic constraint.",
    quote: "Our northern borders cry for vengeance. Take the grand standard of Hindusthan to the Yamuna. Let no Afghan horsemen pasture on this side of the Indus.",
    quoteAuthor: "Peshwa Nanasaheb, Shaniwar Wada Palace",
    objectives: [
      "Select veteran Deccan commanders to secure the vanguard",
      "Approve heavy provisions logistics from central silos",
      "Depart Shaniwar Wada with the Saffron Banner"
    ],
    metrics: {
      moraleChange: 15,
      logisticsChange: 25,
      goldChange: -15000
    }
  },
  {
    stage: CampaignStage.BURHANPUR,
    date: "May 1760",
    title: "Crossing the Narmada",
    subtitle: "Entering Hindusthan",
    location: "Burhanpur, Central Indian Gate",
    threatLevel: "Moderate",
    marathaMove: "Heavy supply lines cross the wide Narmada River. Escalating heat slows down the luggage caravan.",
    afghanMove: "Durrani shifts his main camp to Rohilkhand, securing high wheat stores and fortifying his supply depots along Bareilly.",
    historicalContext: "Burhanpur served as the gateway to Northern India. As the summer sun parched the basalt plains, the massive Maratha column of over 100,000 camp-followers, merchants, and soldiers faced dry wells and transport cattle mortality, revealing the vulnerability of their logistical tail.",
    strategicWeight: "First major geographical obstacle, emphasizing the difference in mobility between light nomadic Afghan horsemen and the cumbersome Maratha caravan structure.",
    quote: "The dust of our march blocks the midday sun. Water grows scarce in the rock defiles of central provinces, and the river crossings test the endurance of our heavy iron guns.",
    quoteAuthor: "Sadashivrao Bhau, War Dispatch",
    objectives: [
      "Secure central supply caravans against nomadic plundering",
      "Manage water distribution amongst non-combatant pilgrims",
      "Establish fortress waypoints for rear guard messaging"
    ],
    metrics: {
      moraleChange: -5,
      logisticsChange: -10,
      goldChange: -10000
    }
  },
  {
    stage: CampaignStage.GWALIOR,
    date: "June - July 1760",
    title: "The Gwalior Split",
    subtitle: "Guerrilla vs. Heavy Artillery Doctrine",
    location: "Gwalior Fort, Sandstone Stronghold",
    threatLevel: "High",
    marathaMove: "Sadashivrao Bhau and Malharrao Holkar hold a stormy tactical council. Jat Ruler Suraj Mal of Bharatpur advises leaving families behind.",
    afghanMove: "Ahmad Shah Abdali remains in heavy prayers, while Najib-ud-Daula rallies 20,000 Rohilla heavy lancer infantry to the Afghan crossing.",
    historicalContext: "At Gwalior, the legendary Jat Maharaja Suraj Mal urged the Marathas to abandon their European artillery-line stance and engage in rapid cavalry raids, leaving families and heavy luggage under Gwalior's guard. Bhau rejected this as insulting, choosing to rely on Ibrahim Gardi's heavy guns, causing a critical diplomatic split.",
    strategicWeight: "The turning point of northern diplomatic relations. The departure of Maharaja Suraj Mal isolated the Marathas is the high north, depriving them of local grain networks.",
    quote: "Bhau, the northern heat is severe and Abdali's horsemen run light. Leave your heavy artillery carts, families, and court ladies at Gwalior. Let us fight this as mobile guerrilla cavalry!",
    quoteAuthor: "Maharaja Suraj Mal of Bharatpur",
    objectives: [
      "Select tactical stance: Mobile Deccan Cavalry or Main Gardi Line",
      "Resolve internal disputes between Holkar and Gardi commanders",
      "Verify local grain contracts with Agra traders"
    ],
    metrics: {
      moraleChange: -10,
      logisticsChange: -15,
      goldChange: 20000
    }
  },
  {
    stage: CampaignStage.DELHI_NEGOTIATIONS,
    date: "August - September 1760",
    title: "The Delhi Pivot",
    subtitle: "The Fall of the Capital & Awadh Talks",
    location: "Mughal Red Fort, Delhi",
    threatLevel: "Severe",
    marathaMove: "The Maratha host storms and captures Delhi's Mughal Red Fort, melting the silver ceilings for currency. Emissaries negotiate with Shuja of Awadh.",
    afghanMove: "Najib-ud-Daula personally crosses the river carrying a Koran to win over Shuja-ud-Daula, securing a vital financial backing for the Alliance.",
    historicalContext: "Capturing Delhi gave the Marathas political prestige, but the capital was starved of grain and gold. Across the river Yamuna, Shuja-ud-Daula, the wealthy Nawab of Awadh, held the balance of power. Through superior spiritual diplomacy, the Afghans won his alliance, leaving the Marathas bankrupted and logistically stranded.",
    strategicWeight: "Geopolitical checkmate. By securing Awadh's alliance, Ahmad Shah ensured his army remained well-fed, while the Marathas lost access to the fertile Doab region.",
    quote: "The Nawab of Awadh has crossed the river to clasp hands with the Shah of Kandahar. We are stranded in Delhi with no bread and no gold left to melt.",
    quoteAuthor: "Maratha Diwan Letters",
    objectives: [
      "Audit Imperial Mughal registers to raise treasury funds",
      "Conduct secret diplomatic embassies with Nawab Shuja-ud-Daula",
      "Establish defensive lookouts overlooking the Yamuna bridges"
    ],
    metrics: {
      moraleChange: 10,
      logisticsChange: -20,
      goldChange: -30000
    }
  },
  {
    stage: CampaignStage.SHINDE_STAND,
    date: "Historic Prelude / October 1760",
    title: "Dattaji's Sacrifice at Barari",
    subtitle: "The Flame of Resistance",
    location: "Barari Ghat, Outer Delhi",
    threatLevel: "Severe",
    marathaMove: "Dattaji Shinde leads high-spirit cavalry skirmishers to block the Afghan scouts. Cut off and surrounded, he stands defiant to the end.",
    afghanMove: "Durrani horsemen launch a massive night ambush across the Yamuna reeds, bypassing the main defenses.",
    historicalContext: "Dattaji Shinde's heroic stand at Barari Ghat remains an immortal legend of Maratha history. When the Afghan forces crossed the shallow reeds of the river and took his lines by surprise, the heavily outnumbered Shinde fought with fanatical courage. Mortally wounded on the mud, Najib's generals mocked him, asking if he would still fight. Dattaji spat and declared: 'Bachenge toh aur bhi ladenge!' before his death.",
    strategicWeight: "The emotional catalyst of the war. Dattaji's tragic death united all Deccan factions to rally for a total military show-of-force in the north.",
    quote: "Bachenge toh aur bhi ladenge! (If we survive, we will fight some more!)",
    quoteAuthor: "General Dattaji Shinde, Last Words",
    objectives: [
      "Hold the barricades at Barari Ghat against Afghan vanguard scouts",
      "Cover the retreat of the family units towards Delhi fort",
      "Deploy rapid archer screens along the river marshes"
    ],
    metrics: {
      moraleChange: 35,
      logisticsChange: -5,
      goldChange: 0
    }
  },
  {
    stage: CampaignStage.DELHI_BATTLE,
    date: "October - November 1760",
    title: "Storming of Kunjpura",
    subtitle: "Vengeance and the Fatal Trap",
    location: "Kunjpura Fortress, North Delhi",
    threatLevel: "Severe",
    marathaMove: "The Maratha army storms the Afghan stronghold of Kunjpura, massacring their garrison and seizing massive wheat silos.",
    afghanMove: "In a move of supreme military daring, Ahmad Shah Abdali crosses the cold, raging waters of the Yamuna River at Baghpat, trapping the Marathas.",
    historicalContext: "To secure food, Sadashivrao Bhau captured Kunjpura, a key Afghan supply base. He celebrated a grand victory. However, an enraged Ahmad Shah Abdali, choosing death or glory, forced his cavalry to cross the swollen Yamuna at Baghpat, south of Kunjpura. By doing so, Abdali neatly cut off the Marathas' entire line of communication, trapping them completely north of Delhi.",
    strategicWeight: "The operational climax. The Maratha army, although victorious at Kunjpura, was suddenly cut off from their home base in the Deccan, forcing them to move to Panipat.",
    quote: "Our victory at Kunjpura has turned to sand. The Shah of Kandahar has swam the river behind us and cut off our road to Delhi. We must assemble our battle-train at Panipat.",
    quoteAuthor: "General Malharrao Holkar, Military Dispatch",
    objectives: [
      "Storm the fort of Kunjpura with Gardi heavy caliber guns",
      "Replenish grain bags and capture regional horses",
      "Verify the tactical river crossing reports at Baghpat"
    ],
    metrics: {
      moraleChange: 15,
      logisticsChange: 30,
      goldChange: 40000
    }
  },
  {
    stage: CampaignStage.PANIPAT,
    date: "November 1760 - January 14, 1761",
    title: "Crucible of Panipat",
    subtitle: "The Twilight of Civilizations",
    location: "Panipat Plains, Haryana",
    threatLevel: "Critical",
    marathaMove: "Trapped under a brutal siege, Sadashivrao Bhau prepares a massive, defensive infantry circle (Chakra) with heavy artillery guards.",
    afghanMove: "Durrani establishes a massive containment ring, launching constant skirmish raids and starvation blockades around the Maratha campsite.",
    historicalContext: "For over two months, the Maratha army was besieged in Panipat with no food, heating, or reinforcements. In January, with human corpses piling up and camp-followers dying of starvation daily, the commanders pleaded with Bhau to die in battle rather than rot in trenches. On January 14, 1761, the starving warriors massed, applied turmeric to their foreheads, and charged forward in a final, apocalyptic clash.",
    strategicWeight: "The catastrophic finale. Decided the balance of power in Northern India for the next 50 years, causing immense damage to both empires and opening a pathway for Western rule.",
    quote: "A pearl necklace has been dissolved, two gold mohurs have been lost, and of the silver and copper, the total cannot be calculated.",
    quoteAuthor: "Peshwa's Secret Merchant Letter, 1761 A.D.",
    objectives: [
      "Hold the defensive rampart line against Pashtun skirmishers",
      "Protect Ibrahim Gardi's fragile artillery flank from collapsing",
      "Charge the Durrani grand center in a bid for absolute survival"
    ],
    metrics: {
      moraleChange: -30,
      logisticsChange: -50,
      goldChange: -20000
    }
  }
];

export const Timeline: React.FC<{ 
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
  campaignStage: CampaignStage;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose, onHelp, onSettings, campaignStage }) => {
  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'chronicles' | 'despatches' | 'analyzer'>('chronicles');
  
  // Calculate player index on chronological timeline
  const activeStageIndex = TIMELINE_EVENTS.findIndex(e => e.stage === campaignStage);
  const currentEvent = TIMELINE_EVENTS[selectedEventId] || TIMELINE_EVENTS[0];

  const getStageStatus = (index: number) => {
    if (index < activeStageIndex) return 'secured';
    if (index === activeStageIndex) return 'active';
    return 'looming';
  };

  return (
    <div className="relative h-screen w-screen bg-stone-950 overflow-hidden font-sans">
      <TopBar 
        screen={Screen.TIMELINE} 
        onNavigate={onNavigate} 
        onToggleMenu={onToggleMenu} 
        onHelp={onHelp} 
        onSettings={onSettings} 
      />
      <SideNav screen={Screen.TIMELINE} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />

      <main className="lg:pl-64 h-[calc(100vh-4rem)] pt-16 flex flex-col bg-[#1D1714] text-stone-200 overflow-hidden">
        
        {/* Scribe navigation tab-bar */}
        <div className="bg-[#18110b] border-b border-stone-850/80 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'chronicles', label: '📖 Chronicles of 1761' },
              { id: 'despatches', label: "📜 Peshwa's Despatch Book" },
              { id: 'analyzer', label: '🧭 Sandbox Replay Analyzer' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 md:px-4 py-1.5 font-mono text-[9.5px] font-black uppercase tracking-wider rounded border transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'bg-saffron text-stone-950 border-saffron font-black shadow' : 'bg-transparent text-stone-400 border-stone-800 hover:text-stone-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-stone-500 uppercase">
            <span>Imperial Archives</span>
            <span>•</span>
            <span className="text-saffron font-black">Historical Analysis Active</span>
          </div>
        </div>

        {/* Dynamic content rendering with custom-scrollbar */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'chronicles' && (
            <div className="h-full flex flex-col lg:flex-row overflow-hidden">
              
              {/* Left Interactive Timeline Scroll */}
              <div className="w-full lg:w-[450px] border-r border-[#3a281e]/40 bg-stone-950/60 p-4 md:p-6 flex flex-col h-1/2 lg:h-full z-10 overflow-y-auto custom-scrollbar">
          
          <div className="mb-6">
            <span className="text-[10px] text-saffron uppercase tracking-[0.3em] font-mono font-black block mb-1">
              ★ Campaign Chronicles
            </span>
            <h2 className="text-xl md:text-2xl font-serif text-white font-black uppercase tracking-widest flex items-center gap-2">
              <History className="text-saffron" size={24} />
              Chronicle of 1761
            </h2>
            <p className="text-[10px] text-stone-400 font-sans mt-1">
              Trace the operational map milestones from the basalt plains of Udgir to the cold doom of Panipat. Highlighted stages track your current strategic stance.
            </p>
          </div>

          {/* Timeline Stack */}
          <div className="relative pl-6 mt-4 space-y-4">
            
            {/* Direct vertical line linking nodes */}
            <div className="absolute left-3 top-2 bottom-8 w-1 bg-[#3a281e]" />

            {TIMELINE_EVENTS.map((event, idx) => {
              const status = getStageStatus(idx);
              const isSelected = selectedEventId === idx;
              
              return (
                <div key={event.stage} className="relative">
                  
                  {/* Stepper Node Icon Indicator */}
                  <div className="absolute -left-5.5 top-1.5 z-20 flex items-center justify-center">
                    {status === 'secured' && (
                      <div className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-stone-950 flex items-center justify-center shadow-md shadow-emerald-950/50">
                        <CheckCircle2 size={10} className="text-white font-black" />
                      </div>
                    )}
                    {status === 'active' && (
                      <div className="w-5 h-5 rounded-full bg-saffron border-2 border-stone-950 flex items-center justify-center animate-pulse shadow-lg shadow-saffron/40">
                        <div className="w-2 h-2 rounded-full bg-stone-950" />
                      </div>
                    )}
                    {status === 'looming' && (
                      <div className="w-4 h-4 rounded-full bg-stone-800 border-2 border-stone-900 flex items-center justify-center shadow-md">
                        <Lock size={10} className="text-stone-500" />
                      </div>
                    )}
                  </div>

                  {/* Main Timeline Card Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEventId(idx);
                    }}
                    className={`w-full text-left p-4 rounded-sm border transition-all relative group cursor-pointer ${
                      isSelected 
                        ? 'bg-[#8B5E3C]/10 border-saffron shadow-lg shadow-black/40' 
                        : 'bg-stone-900/40 border-stone-800 hover:border-[#8B5E3C]/40'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-[9px] font-mono text-saffron tracking-wider font-bold">
                        {event.date}
                      </span>
                      {status === 'active' && (
                        <span className="text-[8px] bg-saffron text-stone-950 font-mono font-bold tracking-widest px-1.5 py-0.5 uppercase">
                          ACTIVE STAGE
                        </span>
                      )}
                      {status === 'secured' && (
                        <span className="text-[8px] border border-emerald-500/30 text-emerald-400 font-mono font-bold tracking-widest px-1.5 py-0.5 uppercase">
                          COMPLETED
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif text-sm uppercase tracking-wider font-black text-white group-hover:text-saffron transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-[10px] text-stone-400 font-sans leading-relaxed truncate">
                      {event.subtitle}
                    </p>

                    {/* Compact Objective Tag */}
                    <div className="mt-2 flex items-center justify-between border-t border-stone-800/40 pt-2 text-[8px] uppercase tracking-widest font-mono text-stone-500">
                      <span>{event.location}</span>
                      <ChevronRight size={12} className="text-stone-600 group-hover:text-saffron transition-all" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Context Summary Stance */}
          <div className="mt-6 p-4 bg-stone-950 border border-[#3a281e]/30 rounded-sm">
            <span className="font-mono text-[9px] text-[#8B5E3C] uppercase tracking-widest font-black block mb-1">
              ★ Campaign Status
            </span>
            <div className="space-y-1">
              <p className="text-xs text-stone-300 leading-normal">
                You are currently navigating the <span className="text-saffron font-bold text-serif uppercase">{campaignStage.replace('_', ' ')}</span> stage of the historic campaign.
              </p>
              <div className="pt-2 border-t border-stone-900 flex justify-between text-[10px] font-mono text-stone-400">
                <span>Completed: {activeStageIndex} / 8</span>
                <span>Threat: {TIMELINE_EVENTS[activeStageIndex]?.threatLevel || 'Low'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Parchment Intel Dossier */}
        <div className="flex-1 overflow-y-auto parchment custom-scrollbar relative h-1/2 lg:h-full">
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEvent.stage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 md:p-12 lg:p-16 max-w-5xl mx-auto relative z-10"
            >
              
              {/* Dossier Header */}
              <div className="flex flex-col gap-6">
                
                <div className="flex items-center gap-4">
                  <Scroll className="text-[#8B5E3C] animate-spin-slow" size={20} />
                  <span className="text-[10px] text-[#2D241E] uppercase tracking-[0.5em] font-black opacity-60">
                    Confidential Strategic Archives • Panipat 1761
                  </span>
                </div>

                <div className="border-b-4 border-[#2D241E]/10 pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-orange-950 bg-orange-200/50 px-2 py-0.5 rounded-sm">
                      {currentEvent.date}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#2D241E] uppercase opacity-70">Tactical Threat:</span>
                      <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-xs ${
                        currentEvent.threatLevel === 'Critical' || currentEvent.threatLevel === 'Severe' 
                          ? 'bg-red-850 text-white' 
                          : 'bg-[#8B5E3C] text-stone-100'
                      }`}>
                        {currentEvent.threatLevel}
                      </span>
                    </div>
                  </div>

                  <h1 className="font-serif text-3xl md:text-5xl text-stone-950 uppercase tracking-tighter leading-none mb-1 font-black">
                    {currentEvent.title}
                  </h1>
                  <p className="text-xs md:text-sm text-[#8B5E3C] uppercase tracking-widest font-black font-sans">
                    {currentEvent.subtitle}
                  </p>
                </div>

                {/* Main Chronicle Narrative */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Context Scroll */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-[10px] text-[#2D241E] uppercase font-black tracking-widest mb-3 border-b border-[#2D241E]/10 pb-2">
                        Historical Narrative
                      </h4>
                      <p className="text-sm text-[#2D241E] leading-relaxed font-semibold italic">
                        {currentEvent.historicalContext}
                      </p>
                    </div>

                    <div className="bg-[#2D241E]/5 p-4 border border-[#2D241E]/10 rounded-sm">
                      <h4 className="text-[10px] text-[#2D241E] uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                        <Compass size={14} />
                        Strategic Significance
                      </h4>
                      <p className="text-xs text-[#2D241E] leading-relaxed opacity-85 font-medium">
                        {currentEvent.strategicWeight}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Objectives Box */}
                  <div className="parchment border-2 border-[#8B5E3C] p-4 shadow-xl bronze-bevel flex flex-col justify-between">
                    <div>
                      <h4 className="text-[9px] text-[#2D241E] uppercase font-black tracking-widest mb-3 border-b border-[#2D241E]/20 pb-2 flex items-center gap-1.5">
                        <Award size={14} className="text-orange-850 animate-bounce" />
                        Campaign Focus Goals
                      </h4>
                      <ul className="space-y-2">
                        {currentEvent.objectives.map((obj, oIdx) => (
                          <li key={oIdx} className="flex gap-2 text-[10px] text-stone-950 font-bold uppercase leading-tight">
                            <span className="text-[#8B5E3C]">▪</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Impact Stats Estimate */}
                    <div className="mt-4 pt-3 border-t border-[#8B5E3C]/20 text-[10px] font-mono text-[#2D241E]">
                      <div className="flex justify-between py-0.5">
                        <span className="opacity-70">Est. Morale impact:</span>
                        <span className={currentEvent.metrics.moraleChange >= 0 ? "text-emerald-850 font-bold" : "text-red-950 font-bold"}>
                          {currentEvent.metrics.moraleChange >= 0 ? `+${currentEvent.metrics.moraleChange}%` : `${currentEvent.metrics.moraleChange}%`}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="opacity-70">Supply Reserves:</span>
                        <span className={currentEvent.metrics.logisticsChange >= 0 ? "text-emerald-850 font-bold" : "text-red-950 font-bold"}>
                          {currentEvent.metrics.logisticsChange >= 0 ? `+${currentEvent.metrics.logisticsChange}%` : `${currentEvent.metrics.logisticsChange}%`}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="opacity-70">Imperial Treasury:</span>
                        <span className={currentEvent.metrics.goldChange >= 0 ? "text-emerald-850 font-bold" : "text-red-950 font-bold"}>
                          {currentEvent.metrics.goldChange >= 0 ? `+${currentEvent.metrics.goldChange.toLocaleString()} Mohurs` : `${currentEvent.metrics.goldChange.toLocaleString()} Mohurs`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Military Strides: Side-by-Side Perspectives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="p-4 bg-orange-950/5 border border-orange-900/10 rounded-sm">
                    <span className="text-[9px] font-mono font-black text-orange-900 uppercase tracking-widest block mb-2 font-black">
                      ★ Saffron Vanguard (Marathas)
                    </span>
                    <p className="text-xs text-[#2D241E] leading-relaxed font-bold opacity-80">
                      {currentEvent.marathaMove}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-950/5 border border-red-900/10 rounded-sm">
                    <span className="text-[9px] font-mono font-black text-red-900 uppercase tracking-widest block mb-2 font-black">
                      ★ Iron Crescent (Durrani Coalition)
                    </span>
                    <p className="text-xs text-[#2D241E] leading-relaxed font-bold opacity-80">
                      {currentEvent.afghanMove}
                    </p>
                  </div>
                </div>

                {/* Historical Correspondence / Testimonials */}
                <div className="relative border-l-4 border-orange-800 bg-[#2D241E]/5 p-6 italic text-[#2D241E] mt-4 shadow-sm">
                  <p className="text-sm md:text-base font-serif font-black leading-relaxed">
                    "{currentEvent.quote}"
                  </p>
                  <p className="text-[10px] uppercase tracking-widest font-mono text-stone-600 font-bold mt-2 text-right">
                    — {currentEvent.quoteAuthor}
                  </p>
                </div>

                {/* Quick Info Bar */}
                <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono mt-4 pt-4 border-t border-[#2D241E]/10">
                  <MapPin size={12} className="text-[#8B5E3C]" />
                  <span>Geographic Theatre: <strong className="text-stone-850">{currentEvent.location}</strong></span>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        </div>
        )}

        {activeTab === 'despatches' && (
          <div className="p-4 md:p-8 bg-[#1D1714]">
            <PeshwaDespatchBook />
          </div>
        )}

        {activeTab === 'analyzer' && (
          <div className="p-4 md:p-8 bg-[#1D1714]">
            <BattleReplayAnalyzer />
          </div>
        )}
        </div>
      </main>
    </div>
  );
};
