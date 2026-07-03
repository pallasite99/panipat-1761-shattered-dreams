import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Lock, 
  Scroll, 
  Shield, 
  Coins, 
  Package, 
  Users, 
  Swords, 
  MapPin, 
  Flame, 
  Compass, 
  Star, 
  X, 
  Check, 
  Trophy, 
  Crown,
  Sparkles,
  Info
} from 'lucide-react';
import { Screen, CampaignStage } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

export interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  requirement: string;
  description: string;
  historicalContext: string;
  quote: string;
  quoteAuthor: string;
  sealColor: 'crimson' | 'saffron' | 'gold' | 'emerald';
  insignia: React.ComponentType<any>;
  category: 'Campaign' | 'State' | 'Tactics' | 'Commander';
  unlockCheck: (stats: any) => boolean;
}

const STAGE_ORDER = [
  'NIZAM_CAMPAIGN',
  'PUNE',
  'BURHANPUR',
  'GWALIOR',
  'DELHI_NEGOTIATIONS',
  'SHINDE_STAND',
  'DELHI_BATTLE',
  'PANIPAT'
];

const HISTORICAL_MILESTONES: Milestone[] = [
  {
    id: 'udgir_victory',
    title: 'The Nizam Subjugated',
    subtitle: 'Battle of Udgir Decisive Triumph',
    requirement: 'Advance campaign past the Nizam Campaign (Stage Pune or higher)',
    description: 'Crushed the Nizam of Hyderabad at Udgir, securing Deccan flank safety and exacting a grand tribute of 60 lakhs to fund the heavy artillery regiments.',
    historicalContext: 'Before Sadashivrao Bhau could march North, he had to secure the southern frontier. Using Ibrahim Khan Gardi’s French-drilled artillery, the Marathas encircled the Nizam, forcing him to surrender crucial forts. This battle validated modern European fire disciplines on Indian soils.',
    quote: 'The European-disciplined artillery fire of Ibrahim Gardi tore through our ranks like a monsoon gale. We had no choice but to sign the treaty and surrender the Deccan forts.',
    quoteAuthor: 'Emissary of the Hyderabad Nizamate, 1760 A.D.',
    sealColor: 'emerald',
    insignia: Shield,
    category: 'Campaign',
    unlockCheck: (stats) => STAGE_ORDER.indexOf(stats.stage) >= STAGE_ORDER.indexOf('PUNE')
  },
  {
    id: 'saffron_departure',
    title: 'The Sovereign March',
    subtitle: 'Departure from Shaniwar Wada',
    requirement: 'Begin the northern expedition (Stage Burhanpur or higher)',
    description: 'Departed Pune with the Peshwa\'s grand banner flying, leading a massive moving city of 50,000 soldiers, entourages, and camp followers to cross the Narmada.',
    historicalContext: 'Under the command of Sadashivrao Bhau and the Peshwa\'s crown prince Vishwasrao, the grand standard departed Pune amidst public prayers. The spectacular display of force boosted confederacy morale but loaded the army with severe logistic burdens in dependents.',
    quote: 'The saffron banners of the Peshwa covered the Deccan roads like endless fire. The earth trembled under the march of fifty thousand hooves.',
    quoteAuthor: 'Pune Chronicle Scroll, March 1760',
    sealColor: 'saffron',
    insignia: Flame,
    category: 'Campaign',
    unlockCheck: (stats) => STAGE_ORDER.indexOf(stats.stage) >= STAGE_ORDER.indexOf('BURHANPUR')
  },
  {
    id: 'gwalior_fortified',
    title: 'Outposts of the North',
    subtitle: 'Gwalior Fortress Alignment',
    requirement: 'Establish northern staging lines (Stage Gwalior or higher)',
    description: 'Crossed central plains to align with Gwalior fortress and Dattaji Shinde\'s northern veterans, establishing crucial storage points for the final Yamuna crossing.',
    historicalContext: 'Reaching Gwalior was a critical stage in securing northern allies. It allowed the Deccan force to link up with the Scindia (Shinde) light horsemen who had been campaigning in Punjab, unifying the southern and northern arms of the Maratha military.',
    quote: 'We have met the southern host near Gwalior. The Bhau is resolute, but the northern dust storm is harsh, and supplies in Hindusthan are heavily depleted.',
    quoteAuthor: 'Dispatch from Jankoji Shinde, June 1760',
    sealColor: 'crimson',
    insignia: MapPin,
    category: 'Campaign',
    unlockCheck: (stats) => STAGE_ORDER.indexOf(stats.stage) >= STAGE_ORDER.indexOf('GWALIOR')
  },
  {
    id: 'shinde_sacrifice',
    title: 'Shinde\'s Blood Sacrifice',
    subtitle: 'Vanguard Stand at Badki',
    requirement: 'Withstand the frontier skirmishes (Stage Delhi Negotiations or higher)',
    description: 'Faced the supreme shock of Ahmad Shah Durrani\'s trans-Indus crossing, honoring the heroic vanguard stand of Dattaji Shinde at Badghat.',
    historicalContext: 'Dattaji Shinde held the northern front alone against the rapid Afghan advance. At the Battle of Barari Ghat, surrounded and mortally wounded, Dattaji was asked by Durrani\'s allies if he would still fight. His legendary reply—"Bachenge toh aur bhi ladenge" (If I survive, I will fight again)—became a rallying cry for the empire.',
    quote: 'If I survive, I will fight again. The saffron soil does not yield to foreign crowns.',
    quoteAuthor: 'General Dattaji Shinde, Barari Ghat, 1760 A.D.',
    sealColor: 'crimson',
    insignia: Swords,
    category: 'Tactics',
    unlockCheck: (stats) => STAGE_ORDER.indexOf(stats.stage) >= STAGE_ORDER.indexOf('DELHI_NEGOTIATIONS')
  },
  {
    id: 'delhi_gates',
    title: 'Fall of the Mughal Capital',
    subtitle: 'Breaching Delhi Gates',
    requirement: 'Breach and seize the Delhi redoubt (Stage Delhi Battle or higher)',
    description: 'Stormed the Mughal capital Delhi, occupying the Red Fort and stripping the silver ceiling of Diwan-i-Khas to pay long-overdue soldiers.',
    historicalContext: 'With winter approaching and negotiations breaking down, Sadashivrao Bhau captured Delhi to secure food and leverage. However, the empty imperial granaries offered little relief, forcing Bhau to melt the silver ornaments of the palace to pay Ibrahim Gardi\'s professional gunners.',
    quote: 'We have entered the Red Fort. The Mughal capital stands quiet, yet the empty granaries and barren streets feed no soldiers. Our state is gold-rich but bread-starved.',
    quoteAuthor: 'Letter from Sadashivrao Bhau to the Shaniwar Wada Treasury',
    sealColor: 'gold',
    insignia: Crown,
    category: 'Campaign',
    unlockCheck: (stats) => STAGE_ORDER.indexOf(stats.stage) >= STAGE_ORDER.indexOf('DELHI_BATTLE')
  },
  {
    id: 'panipat_stand',
    title: 'The Final Redoubt',
    subtitle: 'Panipat Strategic Entrenchment',
    requirement: 'Advance campaign to the Panipat Plains (Stage Panipat)',
    description: 'Established the massive defensive redoubt at Panipat, cutting off Durrani\'s communications but falling into a deadly food blockade.',
    historicalContext: 'At Panipat, the Marathas entrenched themselves with superior artillery. However, Ahmad Shah Durrani\'s brilliant light cavalry (Qizilbash patrol circles) systematically blockaded the Maratha camp, inducing a terrible famine that forced the starving army into a desperate, final sally.',
    quote: 'For two months we have survived on crushed bark and horsemeat. There is no grain left in Panipat. It is better to die on the battlefield with swords in hand than perish of hunger.',
    quoteAuthor: 'Joint petition of the Maratha Sirdars, January 1761',
    sealColor: 'gold',
    insignia: Trophy,
    category: 'Campaign',
    unlockCheck: (stats) => stats.stage === 'PANIPAT'
  },
  {
    id: 'mint_sovereign',
    title: 'Imperial Mint Sovereign',
    subtitle: 'Deccan Treasury Master',
    requirement: 'Accrue 160,000 or more Gold Mohurs in the campaign treasury',
    description: 'Maintained a massive gold reserve, demonstrating impeccable treasury balance and avoiding crippling debt to mercenary forces.',
    historicalContext: 'The logistical failure of the Panipat campaign was primarily a financial one. Sadashivrao Bhau was constantly short of cash to pay professional gunners and local suppliers, who refused Maratha credit in favor of Ahmad Shah Durrani\'s hard gold coin payments.',
    quote: 'An army marches on its belly, but its belly is filled only by the shine of gold Mohurs. Keep the cash chests full or expect mutiny before the battle begins.',
    quoteAuthor: 'Financial Ledger of Govind Pant Bundela, 1760 A.D.',
    sealColor: 'gold',
    insignia: Coins,
    category: 'State',
    unlockCheck: (stats) => stats.treasury >= 160000
  },
  {
    id: 'gardi_supremacy',
    title: 'Gardi Flintlock Supremacy',
    subtitle: 'French Field Artillery Mastery',
    requirement: 'Achieve Drill Level 3+ or select General Ibrahim Khan Gardi',
    description: 'Drilled the musketeer regiments to high European-pattern standards, securing devastating field barrage speed.',
    historicalContext: 'Ibrahim Khan Gardi, a Muslim artillery general who trained under French commander Bussy, commanded the elite Gardi infantry. His heavy, modern cannon batteries were the most formidable tactical asset the Marathas possessed, inflicting massive casualties on Durrani\'s center.',
    quote: 'My flintlock batteries shall fire in perfect intervals. The Durrani horsemen will find no gap in our line of smoke and iron.',
    quoteAuthor: 'General Ibrahim Khan Gardi, War Council, 1760 A.D.',
    sealColor: 'crimson',
    insignia: Award,
    category: 'Commander',
    unlockCheck: (stats) => stats.drillLevel >= 3 || stats.general === 'gardi'
  },
  {
    id: 'camp_pillar_hope',
    title: 'Pillar of the Grand Camp',
    subtitle: 'Sacred Companion Refuge',
    requirement: 'Select Queen Parvatibai or accumulate over 2,000 provisions',
    description: 'Demonstrated flawless supply-line security, ensuring the preservation of non-combatant lives during harsh winter marches.',
    historicalContext: 'Queen Parvatibai accompanied her husband Bhau on the campaign. When supplies ran low, she opened her private reserves and organized daily food distributions to save thousands of civilian dependents marching in the baggage train.',
    quote: 'The Queen has sold her personal gold ornaments to buy grain for the poor camp followers. She is the true anchor of our courage in this frozen North.',
    quoteAuthor: 'Deccan Camp Diary Entry, November 1760',
    sealColor: 'saffron',
    insignia: Package,
    category: 'State',
    unlockCheck: (stats) => stats.general === 'parvatibai' || stats.provisions >= 2000
  },
  {
    id: 'pashtun_empire',
    title: 'The Pashtun Vanguard',
    subtitle: 'Ahmad Shah Durrani Alignment',
    requirement: 'Select the Durrani Empire faction',
    description: 'Aligned with the Ahmad Shah Durrani faction, rallying the Rohillas and Shuja-ud-Daula to form a massive trans-Indus coalition.',
    historicalContext: 'Ahmad Shah Durrani crossed the Indus in late 1759, declaring a holy war. He successfully leveraged the grievances of local Rohilla chief Najib-ud-Daula and the wealth of Awadh to isolate the Marathas, combining Afghan shock cavalry with massive northern resources.',
    quote: 'The empire of Najib-ud-Daula and the Rohillas has merged with our Afghan vanguard. The Peshwa will find no allies north of the Chambal.',
    quoteAuthor: 'Royal Decree of Ahmad Shah Durrani, Kabul royal seal',
    sealColor: 'emerald',
    insignia: Compass,
    category: 'Commander',
    unlockCheck: (stats) => stats.faction === 'durrani'
  }
];

export const Achievements: React.FC<{
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
  onShowBattleLog?: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose, onHelp, onSettings, onShowBattleLog }) => {
  const [stats, setStats] = useState({
    stage: 'NIZAM_CAMPAIGN',
    faction: 'maratha',
    treasury: 145000,
    provisions: 1400,
    morale: 80,
    general: 'bhau',
    drillLevel: 1,
    manpower: 45000,
  });

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [unlockedMockOverride, setUnlockedMockOverride] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<'All' | 'Campaign' | 'State' | 'Tactics' | 'Commander'>('All');

  // Load actual stats from localStorage
  const loadStats = () => {
    const stage = localStorage.getItem('panipat_campaign_stage') || 'NIZAM_CAMPAIGN';
    const faction = localStorage.getItem('panipat_campaign_faction') || 'maratha';
    const treasury = Number(localStorage.getItem('panipat_campaign_treasury') || '145000');
    const provisions = Number(localStorage.getItem('panipat_campaign_provisions') || '1400');
    const morale = Number(localStorage.getItem('panipat_campaign_morale') || '80');
    const general = localStorage.getItem('panipat_campaign_general') || 'bhau';
    const drillLevel = Number(localStorage.getItem('panipat_campaign_drill_level') || '1');
    const manpower = Number(localStorage.getItem('panipat_campaign_manpower') || '45000');

    setStats({
      stage,
      faction,
      treasury,
      provisions,
      morale,
      general,
      drillLevel,
      manpower
    });
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if a milestone is unlocked (checking actual stats OR mock cheat override)
  const isUnlocked = (milestone: Milestone) => {
    if (unlockedMockOverride[milestone.id] !== undefined) {
      return unlockedMockOverride[milestone.id];
    }
    return milestone.unlockCheck(stats);
  };

  // Stats summary
  const unlockedCount = HISTORICAL_MILESTONES.filter(isUnlocked).length;
  const totalCount = HISTORICAL_MILESTONES.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // Filter milestones by category
  const filteredMilestones = HISTORICAL_MILESTONES.filter(m => {
    if (activeCategory === 'All') return true;
    return m.category === activeCategory;
  });

  // Toggle cheat for a milestone
  const toggleCheat = (id: string) => {
    setUnlockedMockOverride(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper colors for wax seals
  const sealColorClasses = {
    crimson: 'bg-gradient-to-tr from-red-900 via-red-750 to-red-600 text-red-100 shadow-[inset_0_4px_8px_rgba(255,255,255,0.2),inset_0_-8px_12px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_4px_8px_rgba(255,255,255,0.3),inset_0_-8px_12px_rgba(0,0,0,0.7),0_12px_20px_rgba(239,68,68,0.3)] border-red-950',
    saffron: 'bg-gradient-to-tr from-amber-900 via-orange-700 to-amber-500 text-amber-100 shadow-[inset_0_4px_8px_rgba(255,255,255,0.25),inset_0_-8px_12px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_4px_8px_rgba(255,255,255,0.35),inset_0_-8px_12px_rgba(0,0,0,0.7),0_12px_20px_rgba(245,158,11,0.3)] border-amber-950',
    gold: 'bg-gradient-to-tr from-yellow-900 via-yellow-600 to-yellow-400 text-yellow-100 shadow-[inset_0_4px_8px_rgba(255,255,255,0.3),inset_0_-8px_12px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_4px_8px_rgba(255,255,255,0.45),inset_0_-8px_12px_rgba(0,0,0,0.7),0_12px_20px_rgba(234,179,8,0.4)] border-yellow-950',
    emerald: 'bg-gradient-to-tr from-emerald-950 via-emerald-700 to-teal-500 text-emerald-100 shadow-[inset_0_4px_8px_rgba(255,255,255,0.2),inset_0_-8px_12px_rgba(0,0,0,0.6),0_8px_16px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_4px_8px_rgba(255,255,255,0.3),inset_0_-8px_12px_rgba(0,0,0,0.7),0_12px_20px_rgba(16,185,129,0.3)] border-emerald-950',
  };

  const sealInnerColorClasses = {
    crimson: 'bg-red-950/40 border-red-900/40',
    saffron: 'bg-amber-950/40 border-amber-900/40',
    gold: 'bg-yellow-950/40 border-yellow-900/40',
    emerald: 'bg-emerald-950/40 border-emerald-900/40',
  };

  return (
    <div className="h-screen w-screen bg-stone-950 overflow-hidden flex flex-col font-sans text-stone-200">
      <TopBar 
        screen={Screen.ACHIEVEMENTS} 
        onNavigate={onNavigate} 
        onToggleMenu={onToggleMenu}
        onHelp={onHelp}
        onSettings={onSettings}
        onShowBattleLog={onShowBattleLog}
      />

      <SideNav 
        screen={Screen.ACHIEVEMENTS} 
        onNavigate={onNavigate} 
        isOpen={isMenuOpen} 
        onClose={onMenuClose} 
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 pt-20 pb-4 h-full flex flex-col overflow-hidden bg-cover bg-center"
           style={{ backgroundImage: "linear-gradient(rgba(12,10,9,0.92), rgba(12,10,9,0.96)), url('https://images.unsplash.com/photo-1543165365-072e2ed12aec?q=80&w=2070&auto=format&fit=crop')" }}>
        
        {/* Core Layout */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6 items-stretch py-4">
          
          {/* Desk Section: Grid of Seals */}
          <div className="flex-1 flex flex-col">
            
            {/* Header / Summary Card */}
            <div className="mb-6 p-6 border-4 border-[#8B5E3C] bg-stone-900/90 shadow-2xl relative rounded-sm">
              <div className="absolute top-0 right-0 p-3 pointer-events-none">
                <Crown className="w-10 h-10 text-saffron/20" />
              </div>
              <span className="text-[10px] text-saffron uppercase tracking-[0.4em] font-mono font-black block mb-1">
                Imperial Registry of Hindusthan
              </span>
              <h2 className="text-3xl font-serif text-white font-black uppercase tracking-tight mb-2">
                HISTORICAL MILESTONES
              </h2>
              <p className="text-stone-400 text-xs italic leading-relaxed max-w-2xl mb-4">
                "Let our deeds be stamped in hot wax, sealed for eternity in the Peshwa's treasury logs. Every march, every siege, every heavy cannonade marks our path to sovereignty."
              </p>

              {/* Progress Bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono text-stone-400 uppercase tracking-wider">
                  <span>Sovereignty Decoded: {unlockedCount} of {totalCount} Milestones</span>
                  <span className="text-saffron font-bold">{progressPercent}% Unlocked</span>
                </div>
                <div className="w-full h-2.5 bg-stone-950 border border-stone-800 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-600 to-saffron rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {(['All', 'Campaign', 'State', 'Tactics', 'Commander'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm transition-all border ${activeCategory === cat ? 'bg-saffron text-stone-950 border-saffron shadow-sm' : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:text-stone-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Seals Desk Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 p-6 border border-stone-850 bg-stone-900/40 rounded-sm shadow-inner flex-1 min-h-[300px]">
              {filteredMilestones.map((m) => {
                const unlocked = isUnlocked(m);
                const Icon = m.insignia;

                return (
                  <motion.div
                    key={m.id}
                    layoutId={`seal-container-${m.id}`}
                    onClick={() => setSelectedMilestone(m)}
                    className="flex flex-col items-center justify-between p-4 bg-stone-950/40 hover:bg-stone-950/70 border border-stone-900 hover:border-stone-800/80 rounded-sm transition-all cursor-pointer select-none group relative overflow-hidden"
                  >
                    {/* Saffron Ribbon Hanging behind the seal */}
                    {unlocked && (
                      <div className="absolute top-0 w-6 h-12 bg-gradient-to-b from-amber-600/70 via-amber-500/50 to-transparent transform -rotate-12 mix-blend-screen pointer-events-none z-0" />
                    )}

                    {/* Wax Seal skeumorphic model */}
                    <div className="relative z-10 my-4 flex items-center justify-center">
                      
                      {/* Organic dripping/irregular circle background */}
                      <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 active:scale-95 border-4 ${unlocked ? sealColorClasses[m.sealColor] : 'bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900 border-stone-950 text-stone-600 shadow-[inset_0_4px_8px_rgba(255,255,255,0.05),inset_0_-8px_12px_rgba(0,0,0,0.8),0_4px_6px_rgba(0,0,0,0.5)]'}`}>
                        
                        {/* Realistic hot-wax organic drip deformations */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-inherit opacity-90 blur-[0.5px] pointer-events-none" />
                        <div className="absolute -bottom-1.5 -right-0.5 w-8 h-8 rounded-full bg-inherit opacity-90 blur-[0.5px] pointer-events-none" />
                        <div className="absolute -bottom-0.5 -left-1.5 w-7 h-7 rounded-full bg-inherit opacity-90 blur-[0.5px] pointer-events-none" />

                        {/* Stamped inner rim indentation */}
                        <div className={`w-18 h-18 rounded-full border-2 flex flex-col items-center justify-center relative shadow-[inset_0_-4px_8px_rgba(255,255,255,0.2),inset_0_6px_10px_rgba(0,0,0,0.6)] ${unlocked ? sealInnerColorClasses[m.sealColor] : 'bg-stone-800/70 border-stone-700/40'}`}>
                          <Icon className={`w-8 h-8 transition-all duration-300 ${unlocked ? 'text-white/80 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] scale-105' : 'text-stone-600'}`} />
                          
                          {!unlocked && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                              <Lock className="w-5 h-5 text-stone-500 drop-shadow-md" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Milestone Label */}
                    <div className="text-center mt-3 z-10 relative">
                      <h4 className={`text-xs font-serif uppercase tracking-wider font-bold transition-colors ${unlocked ? 'text-stone-100 group-hover:text-saffron' : 'text-stone-500'}`}>
                        {m.title}
                      </h4>
                      <p className="text-[10px] font-mono text-stone-500 mt-1">
                        {m.category}
                      </p>
                    </div>

                    {/* Unlocked Check Badge */}
                    {unlocked && (
                      <div className="absolute bottom-2 right-2 bg-saffron text-stone-950 p-0.5 rounded-full shadow-md">
                        <Check className="w-2.5 h-2.5 font-bold" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Side Drawer: Detailed Despatch Scroll (Desktop Sidebar or Overlay) */}
          <div className="w-full md:w-96 flex flex-col">
            <AnimatePresence mode="wait">
              {selectedMilestone ? (
                <motion.div
                  key={selectedMilestone.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="flex-1 flex flex-col parchment border-4 border-[#8B5E3C] p-6 shadow-2xl relative text-stone-900 rounded-sm h-full"
                >
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedMilestone(null)}
                    className="absolute top-4 right-4 text-stone-700 hover:text-stone-950 transition-colors p-1"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between pr-2">
                    <div>
                      {/* Wax seal header icon */}
                      <div className="flex items-center gap-3 mb-6 border-b border-stone-400/40 pb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md ${isUnlocked(selectedMilestone) ? sealColorClasses[selectedMilestone.sealColor] : 'bg-stone-300 text-stone-500'}`}>
                          {React.createElement(selectedMilestone.insignia, { size: 18 })}
                        </div>
                        <div>
                          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-stone-500 block">
                            Milestone Dispatch
                          </span>
                          <h3 className="text-stone-950 font-serif font-black text-lg uppercase leading-none mt-0.5">
                            {selectedMilestone.title}
                          </h3>
                        </div>
                      </div>

                      <span className="text-[9px] text-[#8B5E3C] font-mono uppercase tracking-widest font-black block mb-2">
                        ★ {selectedMilestone.category} Target:
                      </span>
                      <p className="text-stone-850 text-xs font-mono leading-relaxed mb-4 p-3 bg-stone-900/5 border border-stone-300/60 rounded-sm italic">
                        {selectedMilestone.requirement}
                      </p>

                      {/* Decoded content vs Encrypted content */}
                      {isUnlocked(selectedMilestone) ? (
                        <div className="flex flex-col">
                          <span className="text-[9px] text-[#8B5E3C] font-mono uppercase tracking-widest font-black block mb-1">
                            ✔ DECODED EXPEDITION ENTRY:
                          </span>
                          <p className="text-stone-900 font-serif text-sm leading-relaxed mb-6 font-medium">
                            {selectedMilestone.description}
                          </p>

                          <span className="text-[9px] text-[#8B5E3C] font-mono uppercase tracking-widest font-black block mb-1">
                            📜 CHRONICLES & DIPLOMATIC CORRESPONDENCE:
                          </span>
                          <p className="text-stone-800 font-serif text-xs leading-relaxed mb-4 bg-stone-950/[0.03] border-l-4 border-[#8B5E3C] pl-3 py-1 italic">
                            {selectedMilestone.historicalContext}
                          </p>

                          <div className="mt-4 p-4 bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 rounded-sm">
                            <h4 className="text-[9px] text-[#8B5E3C] font-mono uppercase tracking-widest mb-1.5 font-black">
                              ★ Authentic Quote:
                            </h4>
                            <p className="font-serif text-[11px] leading-relaxed italic text-stone-850">
                              "{selectedMilestone.quote}"
                            </p>
                            <span className="block text-[9px] font-mono font-bold text-stone-600 mt-2 text-right">
                              — {selectedMilestone.quoteAuthor}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 px-4 bg-stone-950/5 border border-stone-300 border-dashed rounded-sm flex flex-col items-center justify-center">
                          <Lock className="w-12 h-12 text-stone-400 mb-4 animate-bounce" />
                          <h4 className="font-serif text-stone-900 font-bold text-sm uppercase mb-1">Milestone Sealed</h4>
                          <p className="text-stone-600 text-xs leading-relaxed max-w-xs">
                            This historical dispatch is locked in the central archives. Satisfy the campaign target above to melt the wax seal and decrypt this chronicle.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Claim Button */}
                    {isUnlocked(selectedMilestone) && (
                      <div className="pt-6 border-t border-stone-400/30 mt-6">
                        <button
                          onClick={() => {
                            // Visual feedback
                            alert(`Claimed Royal Certificate of "${selectedMilestone.title}"! Added to thy Palace Archives.`);
                          }}
                          className="w-full py-2.5 bg-stone-950 text-saffron hover:bg-stone-900 transition-all font-serif font-bold text-xs uppercase tracking-widest border border-stone-850 flex items-center justify-center gap-2"
                        >
                          <Scroll size={14} /> Export Royal Certificate
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-panel"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="flex-1 flex flex-col items-center justify-center p-6 border-4 border-stone-800 border-dashed bg-stone-900/20 text-stone-500 rounded-sm text-center h-full min-h-[400px]"
                >
                  <Scroll className="w-16 h-16 text-stone-700 mb-4 animate-pulse" />
                  <h3 className="font-serif text-stone-400 font-bold text-md uppercase mb-2">Examine the Despatch Desk</h3>
                  <p className="text-stone-500 text-xs leading-relaxed max-w-xs">
                    Select any wax-sealed milestone letters on the parchment desk to read their tactical logs, decrypted history files, and translated correspondence from the 1761 expedition.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dev Mode Simulation Panel (Only displays in Dev Mode / customizable toggle) */}
        <div className="mt-auto px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="p-4 border border-saffron/20 bg-stone-900/90 rounded-sm shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-saffron tracking-wider font-mono">
                <Sparkles className="w-4.5 h-4.5 text-saffron animate-spin" />
                Grand Sirdar Command Deck (Dev Simulator)
              </span>
              <span className="text-[9px] font-mono text-stone-500">Allows instant milestone locking/unlocking for testing</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
              {HISTORICAL_MILESTONES.map(m => {
                const unlocked = isUnlocked(m);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleCheat(m.id)}
                    className={`px-2.5 py-1 font-mono text-[9px] uppercase font-semibold tracking-wider rounded-sm shrink-0 border transition-all ${unlocked ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-950/50 text-red-400 border-red-900/30'}`}
                  >
                    {m.title}: {unlocked ? '🔓 Unlocked' : '🔒 Locked'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
