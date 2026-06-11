import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, Swords, Users, Settings, ChevronRight, HelpCircle, Book, BookOpen, Scroll } from 'lucide-react';
import { Screen, CampaignStage, General } from '../types';

const MARATHA_GENERALS: General[] = [
  { id: 'bhau', name: 'Sadashivrao Bhau', faction: 'maratha', bio: 'Grand Commander of the Maratha grand expedition; master state financier.', bonus: 'Higher Aggression (+15% attack damage)' },
  { id: 'shamsher', name: 'Shamsher Bahadur', faction: 'maratha', bio: 'Sword & Cavalry Master (Son of Bajirao & Mastani); brave horse subahdar.', bonus: 'Heroic Sword Charge (+45% melee damage)' },
  { id: 'parvatibai', name: 'Queen Parvatibai', faction: 'maratha', bio: 'Camp Pillar & spiritual anchor of camp followers who organized emergency winter food distribution.', bonus: 'Sacred Resilience (+30% starting provisions & attrition immunity)' },
  { id: 'gopikabai', name: 'Regent Gopikabai', faction: 'maratha', bio: 'The fierce, highly influential regent empress of Pune Shaniwar Treasury controls administrative gold ledger.', bonus: 'Golden Sovereign (+40,000 baseline starting Gold Mohurs)' },
  { id: 'vishwas', name: 'Vishwasrao', faction: 'maratha', bio: 'The young, exceptionally handsome Crown Prince of Peshwadom; unifying dynasty figure.', bonus: 'Moral Boost (+20% static base team morale)' },
  { id: 'gardi', name: 'Ibrahim Khan Gardi', faction: 'maratha', bio: 'Artillery general trained under French discipline, developer of highly modular field cannon squares.', bonus: 'Better Artillery (+40% accuracy on heavy nine-pounder cannon fire)' },
];

const DURRANI_GENERALS: General[] = [
  { id: 'ahmad', name: 'Ahmad Shah Durrani', faction: 'durrani', bio: 'The Pearl of Pearls', bonus: 'Strategic Genius' },
  { id: 'shaf', name: 'Shah Wali Khan', faction: 'durrani', bio: 'Grand Vizier', bonus: 'Logistics Expert' },
  { id: 'najib', name: 'Najib-ud-Daula', faction: 'durrani', bio: 'Rohilla Leader', bonus: 'Diplomatic Edge' },
];

const IntroScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <motion.div
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 1.1 }}
         transition={{ duration: 1.5 }}
         className="text-white text-5xl font-serif text-center"
      >
        <span className="block text-stone-500 text-sm mb-4 tracking-[0.4em] uppercase">Imperial Strategy Presents</span>
        <h1 className="text-white font-black italic tracking-tighter">PANIPAT 1761</h1>
        <h2 className="text-saffron text-2xl mt-4 tracking-[0.2em] font-light">SHATTERED DREAMS</h2>
      </motion.div>
    </div>
  );
};

const STORY_STEPS = (faction: 'maratha' | 'durrani') => [
  {
    title: faction === 'maratha' ? "Dattaji Shinde's Northern Hegemony & Punjab Campaign" : "The Pashtun Edge & Indus Vigilance",
    content: faction === 'maratha' 
      ? "From 1758 to 1759, General Dattaji Shinde held absolute sway over Northern India under the Peshwa's command. Securing Delhi and marching deep into Punjab, Dattaji established Maratha outpost garrisons all the way to Peshawar and Attock on the Indus River. Dattaji was a pivotal, powerful pillar of the campaign first, projecting imperial sovereignty to the very borders of Hindusthan."
      : "As the Maratha vanguard under General Dattaji Shinde fortifies Lahore and patrols the banks of the Indus, the Afghan frontier lands are put on defensive alert. Ruler Ahmad Shah Durrani gathers the Khans in Kabul, preparing a mighty trans-Indus counter-offensive to roll back the Scindia garrisons.",
    mapContent: faction === 'maratha' 
      ? "The vast Northern frontier secured by Dattaji Shinde, spanning Delhi, Punjab, and the banks of the mighty Indus." 
      : "The sovereign Indus River boundary where Afghan scouting riders face off against the Maratha's advanced patrols.",
    interactiveHeader: faction === 'maratha' ? "Shinde's Northern Despatches" : "Peshawar Frontier Report",
    interactiveContent: faction === 'maratha' 
      ? "Sovereign garrisons established in Lahore. Najib-ud-Daula pushed back to Shukratal. However, maintaining these isolated northern outposts strains the state treasury, and a frosty winter presents a severe logistics issue." 
      : "The Scindias are proud but heavily overextended. If we mobilize the trans-Indus tribes quickly, we can overwhelm their isolated guardposts before their main grand heavy columns can march from the Deccan."
  },
  {
    title: faction === 'maratha' ? "The Southern Flank: Victory at Udgir" : "The Kabul Durbar & Frontier Security",
    content: faction === 'maratha' 
      ? "To support Dattaji’s northern lines and secure state funding, Sadashivrao Bhau had to secure Pune's southern front. At the Battle of Udgir (January 1760), Ibrahim Khan Gardi’s French-disciplined artillery squares decisively defeated the Nizam of Hyderabad. The Nizam surrendered critical forts and paid 60 Lakhs rupees in tribute, delivering state funds for the Grand Expedition."
      : "Prior to making a decisive move across the Indus, Ahmad Shah Durrani subdues the rebellious frontier clans in the Kabul backyard. Securing safe pathways around his starting stronghold of Kabul, the Shah ensures that crucial wheat reservoirs, gunpowder, and fresh cavalry horses will flow smoothly from the capital to reinforce the campaign east.",
    mapContent: faction === 'maratha' 
      ? "The basalt hills of Udgir in Deccan. Secure fortress gains guard Pune's rear, providing the necessary funds for the grand army." 
      : "The rugged Kabul region. Capital defenses are cleared to keep caravan food routes secure.",
    interactiveHeader: faction === 'maratha' ? "Treaty of Udgir Tally" : "Kabul Treasury Ledger",
    interactiveContent: faction === 'maratha'
      ? "Sovereignty Gains: Seizure of Udgir, Asirgarh, and Burhanpur forts. 6,200,000 rupees loaded into army baggage chests to pay Ibrahim Gardi's French-pattern flintlock guards."
      : "Recruitment Reserves: All border khans have stamped their signatures. 18,000 Kabul veterans stand fully paid and ready for crossing the borders of Punjab."
  },
  {
    title: faction === 'maratha' ? "The Rising Host of Pune: Grand Northern Expedition" : "The Grand Coalition of Rohilkhand & Awadh",
    content: faction === 'maratha' 
      ? "Under the absolute command of Sadashivrao Bhau and Crown Prince Vishwasrao, the Peshwa's elite forces assemble in Shaniwar Wada. They march with Ibrahim Khan Gardi's famed French-drilled infantry and brass cannons to reinforce and join General Dattaji Shinde's northern army, preparing for a titanic campaign against the invading Afghan king."
      : "Ahmad Shah Durrani crosses the Indus with 30,000 veteran heavy horsemen. To secure his positions and seal the eastern theater, the Shah negotiates directly with Nawab Najib-ud-Daula of the Rohillas and Shuja-ud-Daula of Awadh to construct a massive grand coalition.",
    mapContent: faction === 'maratha' 
      ? "The marching pathways of the Grand Maratha Confederacy head north from Pune, rallying vassal Rajas of Hindusthan." 
      : "The strategic camp structures of the Durrani Coalition along the fertile banks of the Ganga and Yamuna rivers.",
    interactiveHeader: faction === 'maratha' ? "Expedition Mobilization Ledger" : "Coalition Alliance Despatches",
    interactiveContent: faction === 'maratha'
      ? "Mobilization details: 20,000 elite Huzurat cavalry, 10,000 Gardi musketeers, 200 cannons. Dattaji Shinde's northern outposts continue to maintain alert guard lines."
      : "Diplomacy report: Najib-ud-Daula pledges 20,000 Rohilla riders and begins direct overtures to Shuja-ud-Daula of Awadh to secure the eastern riverbanks."
  }
];

const StoryScreen = ({ faction, onComplete }: { faction: 'maratha' | 'durrani'; onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [showIntel, setShowIntel] = useState(false);
  const isLastStep = step === STORY_STEPS(faction).length - 1;
  const currentSteps = STORY_STEPS(faction);

  return (
    <div className="h-screen w-screen bg-stone-950 flex items-center justify-center p-8 overflow-y-auto">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 text-left items-stretch"
      >
        <div className="flex flex-col justify-between parchment border-4 border-[#8B5E3C] p-6 md:p-8 shadow-2xl relative">
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono font-bold block mb-1">
              HINDUSTHAN CHRONICLES • STEP {step + 1} OF 3
            </span>
            <h2 className="text-stone-900 font-serif text-2xl md:text-3xl mb-4 font-black uppercase tracking-tight leading-none text-left">
              {currentSteps[step].title}
            </h2>
            <p className="text-xs md:text-sm text-stone-800 leading-relaxed mb-6 font-medium text-left">
              {currentSteps[step].content}
            </p>

            {/* Interactive User Tab Element */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowIntel(!showIntel)}
                className="w-full py-2.5 px-4 bg-stone-950 text-saffron uppercase font-mono text-[10px] font-bold tracking-wider hover:bg-stone-900 border border-stone-800 flex justify-between items-center transition-all cursor-pointer rounded-sm"
              >
                <span className="flex items-center gap-2">
                  <Scroll size={14} className="animate-spin" />
                  {showIntel ? "Seal Secret Intelligence Records" : `Examine ${currentSteps[step].interactiveHeader}`}
                </span>
                <span>{showIntel ? "▲ CLOSE" : "▼ DECRYPT"}</span>
              </button>

              <AnimatePresence>
                {showIntel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-2"
                  >
                    <div className="bg-stone-900 border border-stone-850 p-4 rounded-sm shadow-inner text-left">
                      <h4 className="text-[9px] text-saffron font-mono uppercase tracking-widest mb-1 font-bold">
                        ★ Decrypted Archives:
                      </h4>
                      <p className="text-stone-300 font-serif text-[11px] leading-relaxed italic">
                        "{currentSteps[step].interactiveContent}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-stone-950/10">
            {step > 0 && (
              <button 
                type="button"
                onClick={() => { setStep(step - 1); setShowIntel(false); }}
                className="px-6 py-3 bg-stone-900/10 hover:bg-stone-900/20 text-stone-900 font-serif text-xs uppercase tracking-widest border border-stone-900/25 transition-all font-black cursor-pointer"
              >
                Recall
              </button>
            )}
            <button 
              type="button"
              onClick={() => {
                if (isLastStep) {
                  onComplete();
                } else {
                  setStep(step + 1);
                  setShowIntel(false);
                }
              }}
              className="px-8 py-3 bg-[#8B5E3C] text-white font-serif text-sm uppercase tracking-widest hover:bg-[#724c2f] active:scale-95 transition-all font-black grow text-center cursor-pointer"
            >
              {isLastStep ? "Muster Commanders" : "Next Chronicle"}
            </button>
          </div>
        </div>

        <div className="border-4 border-stone-800 p-3 bg-stone-900 shadow-2xl flex flex-col justify-between">
          <div className="relative overflow-hidden w-full h-[300px] lg:h-full min-h-[300px] border border-stone-800">
            <img 
              src={faction === 'maratha' ? "/historical_map.png" : "/afghan_map.png"} 
              alt="Historical Map" 
              className="w-full h-full object-cover rounded-sm filter brightness-90 sepia-[20%]" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = faction === 'maratha' 
                  ? 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800&auto=format&fit=crop' 
                  : 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop';
              }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mt-4 p-4 bg-stone-950 border border-stone-800 text-stone-400 text-xs italic leading-relaxed text-left rounded-sm font-sans">
            <span className="font-bold text-stone-200 block uppercase text-[10px] tracking-widest font-mono mb-1">
              Cartographer Footnote:
            </span>
            {currentSteps[step].mapContent}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AssetLoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return p + 2;
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-screen w-screen bg-stone-950 flex flex-col items-center justify-center p-10">
      <div className="w-full max-w-lg mb-8 text-white font-mono text-xs tracking-widest uppercase flex justify-between">
          <span>Preparing battlefield assets...</span>
          <span>{progress}%</span>
      </div>
      <div className="w-full max-w-lg h-1.5 bg-stone-900 rounded-full overflow-hidden">
        <motion.div 
           className="h-full bg-saffron"
           style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-6 text-stone-500 text-[10px] tracking-[0.2em] uppercase">
        Verifying historical integrity...
      </div>
    </div>
  );
};

export const MainMenu: React.FC<{ 
  onNavigate: (s: Screen) => void;
  setCampaignStage: (s: CampaignStage) => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ onNavigate, setCampaignStage, onHelp, onSettings }) => {
  const [appState, setAppState] = useState<'intro' | 'assets' | 'story' | 'faction' | 'general' | 'menu'>('intro');
  const [devMode, setDevMode] = useState(false);
  const [faction, setFaction] = useState<'maratha' | 'durrani' | null>(null);
  const [general, setGeneral] = useState<General | null>(null);

  const menuItems = [
    { id: Screen.STRATEGIC_MAP, label: 'Grand Campaign', icon: Flag },
    { id: Screen.TACTICAL_HUD, label: 'Skirmish', icon: Swords },
    { id: Screen.WAR_COUNCIL, label: 'Multiplayer', icon: Users },
  ];

  if (appState === 'intro') return <IntroScreen onComplete={() => setAppState('assets')} />;
  if (appState === 'assets') return <AssetLoadingScreen onComplete={() => setAppState('faction')} />;
  
  if (appState === 'faction') {
      return (
          <div className="h-screen w-screen bg-stone-950 flex flex-col items-center justify-center text-center p-10">
              <h2 className="text-white text-5xl font-serif mb-16 uppercase tracking-[0.4em]">Choose Thy Faction</h2>
              <div className="flex gap-16">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => { 
                      setFaction('maratha'); 
                      localStorage.setItem('panipat_campaign_faction', 'maratha');
                      setCampaignStage(CampaignStage.NIZAM_CAMPAIGN);
                      setAppState('story'); 
                    }}
                    className="flex flex-col items-center gap-6 group"
                  >
                      <div className="w-64 h-64 border border-saffron/30 rounded-full flex items-center justify-center p-6 bg-stone-900 group-hover:bg-stone-800 transition-all">
                        <img src="/maratha_faction_logo.png" alt="Maratha Sigil" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-saffron font-serif text-3xl uppercase tracking-widest">Maratha Confederacy</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => { 
                      setFaction('durrani'); 
                      localStorage.setItem('panipat_campaign_faction', 'durrani');
                      setCampaignStage(CampaignStage.NIZAM_CAMPAIGN);
                      setAppState('story'); 
                    }}
                    className="flex flex-col items-center gap-6 group"
                  >
                      <div className="w-64 h-64 border border-afghan-red/30 rounded-full flex items-center justify-center p-6 bg-stone-900 group-hover:bg-stone-800 transition-all">
                        <img src="/durrani_faction_logo.png" alt="Durrani Sigil" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-red-650 font-serif text-3xl uppercase tracking-widest font-bold">Durrani Empire</span>
                  </motion.button>
              </div>
          </div>
      )
  }

  if (appState === 'story') return <StoryScreen faction={faction!} onComplete={() => setAppState('general')} />;

  if (appState === 'general') {
      const generals = faction === 'maratha' ? MARATHA_GENERALS : DURRANI_GENERALS;
      return (
        <div className="h-screen w-screen bg-stone-950 flex flex-col items-center justify-center p-10">
            <h2 className="text-white text-5xl font-serif mb-16 uppercase tracking-[0.4em]">Choose Thy General</h2>
            <div className="grid grid-cols-3 gap-10">
                {generals.map(g => (
                    <motion.button
                        key={g.id}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => { 
                          setGeneral(g); 
                          localStorage.setItem('panipat_campaign_general', g.id);
                          localStorage.setItem('panipat_campaign_general_name', g.name);
                          setAppState('menu'); 
                        }}
                        className="p-6 border border-stone-800 bg-stone-900 text-left hover:border-saffron transition-all"
                    >
                        <h3 className="text-saffron font-serif text-2xl uppercase mb-2">{g.name}</h3>
                        <p className="text-stone-400 text-sm mb-4 italic">{g.bio}</p>
                        <div className="text-stone-500 text-xs font-mono uppercase border-t border-stone-800 pt-2">Bonus: {g.bonus}</div>
                    </motion.button>
                ))}
            </div>
        </div>
      )
  }

  return (
    <div className="relative h-screen w-screen bg-stone-950 overflow-hidden">
      <button 
        onClick={() => setDevMode(!devMode)}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] text-[10px] uppercase font-bold tracking-widest text-saffron bg-black/50 p-2 rounded-sm border border-saffron/30 hover:bg-black/80 transition-colors"
      >
        {devMode ? 'Dev Mode (Active)' : 'Dev Mode (Inactive)'}
      </button>

      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543165365-072e2ed12aec?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,153,51,0.15),transparent_70%)]" />
      </div>

      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-3 bg-stone-950/40 backdrop-blur-sm border-b-4 border-stone-800/80">
        <h1 className="text-2xl font-serif font-bold text-saffron italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest uppercase">
          Panipat: 1761
        </h1>
        <div className="flex items-center gap-6">
          <button 
            onClick={onSettings}
            className="flex items-center gap-2 text-stone-400 hover:text-saffron transition-all active:scale-95 group uppercase text-[10px] font-bold tracking-widest"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button 
            onClick={onHelp}
            className="flex items-center gap-2 text-stone-400 hover:text-saffron transition-all active:scale-95 group uppercase text-[10px] font-bold tracking-widest"
          >
            <HelpCircle size={18} />
            <span>Manual</span>
          </button>
        </div>
      </header>
      
      <main className="relative z-10 h-full w-full flex flex-col justify-center items-center px-6 md:px-16 lg:px-24">
        {appState === 'menu' ? (
          menuItems.map((item) => (
             <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onNavigate(item.id)}
                className="w-full max-w-md flex items-center justify-between p-4 mb-4 border border-stone-800 bg-stone-900/50 hover:bg-stone-800 transition-all group"
              >
                <div className="flex items-center gap-4">
                   <item.icon className="text-stone-500 group-hover:text-saffron transition-colors" />
                   <span className="text-stone-300 group-hover:text-white font-serif text-xl uppercase tracking-widest">{item.label}</span>
                </div>
                <ChevronRight className="text-stone-700 group-hover:text-saffron transition-colors" />
              </motion.button>
          ))
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-20 text-center"
            >
              <div className="flex flex-col items-center gap-4 mb-6">
                <span className="text-[10px] text-saffron uppercase tracking-[0.6em] font-black gold-glow">The Third Battle of</span>
              </div>
              <h2 className="font-serif text-6xl md:text-9xl text-white uppercase mb-2 drop-shadow-[0_20px_50px_rgba(0,0,0,1)] font-black leading-none tracking-tighter">
                PANIPAT
              </h2>
            </motion.div>
          </>
        )}
      </main>
      
      <footer className="fixed bottom-0 w-full z-50 flex justify-between items-center px-10 py-4 bg-stone-900/95 border-t border-stone-800">
        <button 
             onClick={() => onNavigate(Screen.ENCYCLOPEDIA)}
             className="flex items-center gap-2 text-stone-500 hover:text-saffron transition-all"
        >
            <Book size={20} />
            <span className="uppercase text-xs font-bold tracking-widest">Encyclopedia</span>
        </button>
      </footer>
    </div>
  );
};
