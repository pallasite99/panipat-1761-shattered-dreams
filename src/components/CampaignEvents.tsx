import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scroll, Coins, Flag, Sparkles, AlertTriangle, BookOpen, Check, Award } from 'lucide-react';

export interface CampaignEventOption {
  id: string;
  label: string;
  goldEffect: number;
  provisionsEffect: number;
  moraleEffect: number;
  effectSummary: string;
  outcomeDescription: string;
}

export interface HistoricalEvent {
  id: string;
  faction: 'maratha' | 'durrani';
  title: string;
  subTitle: string; // Sanskrit or Persian
  date: string;
  description: string;
  trivia: string;
  icon: string;
  options: CampaignEventOption[];
}

interface CampaignEventsProps {
  isOpen: boolean;
  onClose: () => void;
  activeFaction: 'maratha' | 'durrani';
  onApplyEffects: (gold: number, provisions: number, morale: number, eventText: string) => void;
}

const HISTORICAL_EVENTS_DATABASE: HistoricalEvent[] = [
  // ================= MARATHA EVENTS =================
  {
    id: 'maratha_holkar_gardi',
    faction: 'maratha',
    title: 'The Great Artillery Streit',
    subTitle: 'गोळंदाज आणि कडाडती तोफ',
    date: 'June 1760',
    icon: '💣',
    description: 'Veteran commander Malharrao Holkar and Ibrahim Khan Gardi are locked in a fiery argument in the war chamber. Holkar demands traditional swift "Ganimi Kava" cavalry maneuvers, calling the grand Gardi brass guns a "useless, heavy burden on our horse lines." Gardi, infuriated, threatens to resign and lead his 10,000 disciplined musketeers back south if they are not paid their outstanding wage.',
    trivia: 'HISTORICAL INSIGHT: Ibrahim Khan Gardi’s artillery was incredibly lethal at Udgir, but their heavy frames restricted Maratha march speeds, which played into Abdali’s swift flanking designs.',
    options: [
      {
        id: 'gardi_pay',
        label: 'Mediate & Clear Gardi’s Arrears',
        goldEffect: -6500,
        provisionsEffect: 0,
        moraleEffect: 15,
        effectSummary: '-6,500 Gold Mohurs • +15 Army Morale',
        outcomeDescription: 'You pacify Ibrahim Khan Gardi by distributing silver from the emergency chest. The Gardi artillerymen double down on their drill practice, bolstering troop morale, but your dry gold reserve is heavily depleted.'
      },
      {
        id: 'gardi_holkar_side',
        label: 'Sway towards Holkar’s Guerrilla Doctrine',
        goldEffect: 3000,
        provisionsEffect: -25,
        moraleEffect: 8,
        effectSummary: '+3,000 Gold Mohurs • -25 provisions • +8 Army Morale',
        outcomeDescription: 'You stand with Malharrao’s traditional tactics. In response, Gardi scales down his heavy carriage maintenance, melting surplus bronze ball fittings to secure 3,000 Gold Mohurs, but the logistical oversight wastes 25T of raw food reserves.'
      }
    ]
  },
  {
    id: 'maratha_pilgrim_strain',
    faction: 'maratha',
    title: 'Sadhus and the Divine Caravan',
    subTitle: 'यात्रेकरूंचे असीम संघर्षण',
    date: 'July 1760',
    icon: '🕉️',
    description: 'Over 45,000 unarmed pilgrims, holy men, and ladies from southern Maharashtra have tail-gated your military baggage lines to reach the sacred shrines of Mathura and Kurukshetra. They do not fight, yet they require daily grain from the military storehouses. Starvation begins to creep into the rank and file.',
    trivia: 'HISTORICAL INSIGHT: For every one combat soldier, the Maratha camp of 1760 carried three non-combatant camp followers, placing extreme strain on local market grain prices.',
    options: [
      {
        id: 'pilgrim_feed',
        label: 'Distribute Army Provisions to the Faithful',
        goldEffect: 0,
        provisionsEffect: -65,
        moraleEffect: 20,
        effectSummary: '-65 Provisions • +20 Army Morale',
        outcomeDescription: 'You decree that no pilgrim shall starve on your watch. Miraculous prayers echo through the ranks as the camp feels blessed. Troops march with religious zeal, though food silos are dangerously depleted.'
      },
      {
        id: 'pilgrim_restrict',
        label: 'Restrict Silos & Prioritize Combat Soldiers',
        goldEffect: 0,
        provisionsEffect: 0,
        moraleEffect: -12,
        effectSummary: '0 Gold Mohurs • -12 Army Morale',
        outcomeDescription: 'You strictly padlock the grain reserves for armed divisions. The pilgrims go hungry, resulting in quiet sorrow, public lamentation, and dropping camp cohesion across the columns.'
      }
    ]
  },
  {
    id: 'maratha_shinde_avengers',
    faction: 'maratha',
    title: 'Surviving Veterans of Barari Ghat',
    subTitle: 'उत्तर दिशेचे झुंझार शिलेदार',
    date: 'August 1760',
    icon: '🏇',
    description: 'A cohort of battle-torn Gwalior Shinde cavalry survivors ride into your vanguard. Exhausted from their retreats and still mourning the martyrdom of Dattaji Shinde, they demand replacement mounts, armor, and immediate dry grains to ride out on patrol duty.',
    trivia: 'HISTORICAL INSIGHT: Dattaji Shinde’s bold stand in the frozen Yamuna silt at Barari Ghat was a rallying cry that united the Peshwa Confederacy to avenge their northern divisions.',
    options: [
      {
        id: 'shinde_equip',
        label: 'Re-equip them with Royal Horses & Arms',
        goldEffect: -4000,
        provisionsEffect: -10,
        moraleEffect: 12,
        effectSummary: '-4,000 Gold • -10 Provisions • +12 Morale',
        outcomeDescription: 'You supply them with prime horses from the regional durbars. The Gwalior horsemen raise their spears with a thundering war cry, ready for revenge, heavily boosting army morale!'
      },
      {
        id: 'shinde_conserve',
        label: 'Deny Royal Remounts to Conserve Coffers',
        goldEffect: 0,
        provisionsEffect: 15,
        moraleEffect: -10,
        effectSummary: '+15 provisions • -10 Army Morale',
        outcomeDescription: 'You tell them that existing troops have precedence. They silently camp in the rear margins, causing disappointment. Your strict rationing saves small grain bins (+15 provisions), but morale drops.'
      }
    ]
  },
  {
    id: 'maratha_doab_treaty',
    faction: 'maratha',
    title: 'Zemindars of the Rich Doab',
    subTitle: 'दोआबातील सधन सावकार करार',
    date: 'October 1760',
    icon: '🌾',
    description: 'Local administrators and landlords of the fertile Yamuna-Ganga Doab have arrived in your durbar. They offer a large convoy of 100 grain-carts (+80 Food) if you sign a charter guaranteeing instant protection against Rohilla raiders and a three-year military tax exemption.',
    trivia: 'HISTORICAL INSIGHT: The fertile Doab was a prized tax-basket. Maratha commands depended on local zemindar treaties to feed their forces during autumn operations.',
    options: [
      {
        id: 'doab_treaty_accept',
        label: 'Accept Treaty & Issue Protection Decree',
        goldEffect: -2500,
        provisionsEffect: 80,
        moraleEffect: 5,
        effectSummary: '-2,500 Gold • +80 Provisions • +5 Morale',
        outcomeDescription: 'You accept the treaty, dispatching a light guard to the territory. The grain-wagons arrive safely in the late evening, filling your storage bins, though administrative costs tax your immediate gold treasury.'
      },
      {
        id: 'doab_forcible_seize',
        label: 'Enforce Forced Supplies without Guarantees',
        goldEffect: 2000,
        provisionsEffect: 30,
        moraleEffect: -15,
        effectSummary: '+2,000 Gold • +30 Provisions • -15 Morale',
        outcomeDescription: 'You declare military requisition rights. Your scouts seize grains and take 2,000 Gold Mohurs as forced war contributions. Local anger flares, and disgruntled citizens sabotage several outer baggage carts (-15 Morale).'
      }
    ]
  },

  // ================= DURRANI EVENTS =================
  {
    id: 'durrani_ghazi_riot',
    faction: 'durrani',
    title: 'The Zeal of the Ghazi Volunteers',
    subTitle: 'غازیان جهاد مذهبی دانی',
    date: 'June 1760',
    icon: '⚔️',
    description: 'Thousands of passionate, irregular Afghan and tribal Ghazi horsemen have arrived from Central Asia. While incredibly brave, they despise waiting in military trenches during summer heat waves. They demand an immediate, aggressive assault on Maratha lines, threatening to desert if held back.',
    trivia: 'HISTORICAL INSIGHT: Ahmad Shah Durrani was a master of patience. He regularly spent months tracking the enemy while restraining his eager tribal irregulars with cash and iron discipline.',
    options: [
      {
        id: 'ghazi_satisfy',
        label: 'Distribute Plunder Backlog to Pacify Them',
        goldEffect: -4500,
        provisionsEffect: 0,
        moraleEffect: 18,
        effectSummary: '-4,500 Gold • +18 Army Morale',
        outcomeDescription: 'You satisfy the chiefs by distributing captured silver coin sacks. The Ghazi volunteers raise their swords in allegiance, confirming their absolute devotion to your royal command.'
      },
      {
        id: 'ghazi_skirmish',
        label: 'Order a Vanguard Border Skirmish',
        goldEffect: 0,
        provisionsEffect: -30,
        moraleEffect: 10,
        effectSummary: '-30 Provisions • +10 Army Morale',
        outcomeDescription: 'You authorize them to engage the Maratha advance guards. They strike with fury, keeping their fighting spirit high (+10 Morale), but several supply scouts are counter-attacked, losing 30T in provisions.'
      }
    ]
  },
  {
    id: 'durrani_zamburak_illness',
    faction: 'durrani',
    title: 'The Baloch Camel Contagion',
    subTitle: 'بیماری شتران زنبورک خانه',
    date: 'August 1760',
    icon: '🐫',
    description: 'A sand fever has broken out in the Baloch camel stables, crippling the draft animals carrying your heavy swivel guns (Zamburaks). The master of stables advises buying replacement beasts from Rohtas merchants or burning contaminated stable quarters immediately.',
    trivia: 'HISTORICAL INSIGHT: The lightweight Turkish camel swivel-guns (Zamburaks) were Ahmad Shah Abdali’s secret weapon. They fired heavy iron balls rapidly from elevated positions, destroying cavalry charges.',
    options: [
      {
        id: 'camel_purchase',
        label: 'Purchase Replacement Camels from Rohtas',
        goldEffect: -5000,
        provisionsEffect: 0,
        moraleEffect: 12,
        effectSummary: '-5,000 Gold • +12 Army Morale',
        outcomeDescription: 'You pay premium gold to local horse and camel merchants. Healthy, robust native beasts arrive, securing the speed of your Zamburak gun divisions and boosting camp confidence!'
      },
      {
        id: 'camel_quarantine',
        label: 'Order Quarantine and Burn Sick Quarters',
        goldEffect: 0,
        provisionsEffect: -20,
        moraleEffect: -8,
        effectSummary: '-20 Provisions • -8 Army Morale',
        outcomeDescription: 'You order the immediate destruction of affected stable straw. The blaze gets slightly out of hand, burning adjacent food tents (-20 Provisions). The loss of camels reduces military cohesion.'
      }
    ]
  },
  {
    id: 'durrani_najib_feast',
    faction: 'durrani',
    title: 'Najib’s Riverside Pavilions',
    subTitle: 'مهمانی بزرگ نجیب الدوله روهله',
    date: 'October 1760',
    icon: '🎪',
    description: 'Your primary Rohilla ally, Najib-ud-daulah, hosts a grand diplomatic assembly in his riverside camp on the Yamuna. He presents the Royal Cabinet with sweet dates, finest wheat flour, and cash, but requests a signed pledge for lucrative post-war Delhi administrations.',
    trivia: 'HISTORICAL INSIGHT: Najib-ud-daulah was the chief architect of the anti-Maratha alliance. He financed and fed the Afghan troops during their entire stay in Hindusthan.',
    options: [
      {
        id: 'feast_distribute',
        label: 'Distribute Grains to Combat Lines',
        goldEffect: -1500,
        provisionsEffect: 45,
        moraleEffect: 15,
        effectSummary: '-1,500 Gold • +45 Provisions • +15 Morale',
        outcomeDescription: 'You sign the pledge and order the gifts divided among active combat lines. The soldiers feast on wheat bread and sweets (+15 Morale, +45 Provisions), though administrative fees cost 1,500 gold.'
      },
      {
        id: 'feast_reserve',
        label: 'Store All as Dry Imperial Reserves',
        goldEffect: 0,
        provisionsEffect: 65,
        moraleEffect: -5,
        effectSummary: '+65 provisions • -5 Army Morale',
        outcomeDescription: 'You lock the flour in the royal reserve vault, refusing custom pledge negotiations. Your grain reserves swell by 65T, but the snubbed Rohilla emirs feel slighted (-5 Morale).'
      }
    ]
  },
  {
    id: 'durrani_yamuna_ford',
    faction: 'durrani',
    title: 'The Secret River Passage of Baghpat',
    subTitle: 'گذرگاه پنهان رودخانه باغپت',
    date: 'October 25, 1760',
    icon: '🌊',
    description: 'Your intelligence scouts discover an unguarded, shallow sandstone ford across the raging Yamuna river at Baghpat. Crossing the flooded waters is highly dangerous, but it would completely flank the Maratha army and cut off their line of food supplies from Delhi!',
    trivia: 'HISTORICAL INSIGHT: Abdali’s crossing at Baghpat on October 25 is widely recognized as a military marvel. It trapped the Maratha army north at Panipat, reversing the logistics of the war.',
    options: [
      {
        id: 'ford_dare',
        label: 'Order Audacious Flood Crossing',
        goldEffect: 4000,
        provisionsEffect: 35,
        moraleEffect: -10,
        effectSummary: '+4,000 Gold • +35 Provisions • -10 Morale',
        outcomeDescription: 'You command the army to plunge into the cold river. The crossing is terrifying (-10 Morale), but you catch Maratha supply line depots by surprise, looting 4,000 Gold and 35T in provisions!'
      },
      {
        id: 'ford_bridge',
        label: 'Construct Stable Pontoons for Safety',
        goldEffect: -4500,
        provisionsEffect: 0,
        moraleEffect: 15,
        effectSummary: '-4,500 Gold • +15 Army Morale',
        outcomeDescription: 'You choose safety first. You spend 4,500 Gold procuring local teak logs and chains, building secure pontoon crossings. Your troops cross without incident, high-spirited and safe!'
      }
    ]
  }
];

export const CampaignEvents: React.FC<CampaignEventsProps> = ({
  isOpen,
  onClose,
  activeFaction,
  onApplyEffects
}) => {
  const [currentEvent, setCurrentEvent] = useState<HistoricalEvent | null>(null);
  const [selectedOption, setSelectedOption] = useState<CampaignEventOption | null>(null);
  const [outcomeStage, setOutcomeStage] = useState<boolean>(false);

  // Load a random unplayed event for this faction
  useEffect(() => {
    if (isOpen) {
      const factionPool = HISTORICAL_EVENTS_DATABASE.filter(e => e.faction === activeFaction);
      
      // Try to read completed events from localStorage
      const completedStr = localStorage.getItem('panipat_completed_events');
      const completedEventsList: string[] = completedStr ? JSON.parse(completedStr) : [];
      
      // Filter out completed ones, unless all are completed, then clear and recycle
      let availableEvents = factionPool.filter(e => !completedEventsList.includes(e.id));
      if (availableEvents.length === 0) {
        // Recycle
        availableEvents = factionPool;
        // Only keep events that are NOT matched if we can, else just use the list
        const resetCompleted = completedEventsList.filter(id => !id.startsWith(activeFaction));
        localStorage.setItem('panipat_completed_events', JSON.stringify(resetCompleted));
      }

      if (availableEvents.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableEvents.length);
        setCurrentEvent(availableEvents[randomIndex]);
      }
      setSelectedOption(null);
      setOutcomeStage(false);
    }
  }, [isOpen, activeFaction]);

  if (!isOpen || !currentEvent) return null;

  const handleSelectOption = (option: CampaignEventOption) => {
    setSelectedOption(option);
    setOutcomeStage(true);
  };

  const handleConfirmOutcome = () => {
    if (selectedOption && currentEvent) {
      // 1. Add this event into completed events in localStorage
      const completedStr = localStorage.getItem('panipat_completed_events');
      const completedList: string[] = completedStr ? JSON.parse(completedStr) : [];
      if (!completedList.includes(currentEvent.id)) {
        completedList.push(currentEvent.id);
        localStorage.setItem('panipat_completed_events', JSON.stringify(completedList));
      }

      // 2. Fire the state changer callback to the system
      const logText = `📜 [HISTORIC EVENT: ${currentEvent.title}] Made Choice: "${selectedOption.label}". Effects Applied: ${selectedOption.effectSummary}`;
      onApplyEffects(
        selectedOption.goldEffect,
        selectedOption.provisionsEffect,
        selectedOption.moraleEffect,
        logText
      );

      // 3. Clear local overlay states
      setSelectedOption(null);
      setOutcomeStage(false);
      onClose();
    }
  };

  const borderTheme = activeFaction === 'durrani' ? 'border-emerald-700/60' : 'border-amber-700/60';
  const bannerTheme = activeFaction === 'durrani' ? 'bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950' : 'bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950';
  const factionNameText = activeFaction === 'durrani' ? 'Durrani Command' : 'Maratha Campaign';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        id="historical-event-modal"
        className="fixed inset-0 z-[1200] bg-stone-950/98 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      >
        {/* Ambient background effect */}
        <div className="absolute inset-4 border border-saffron/10 pointer-events-none rounded-xs" />

        <motion.div
          initial={{ scale: 0.96, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 15 }}
          className={`w-full max-w-lg bg-stone-900 border-2 ${borderTheme} p-6 relative flex flex-col justify-between shadow-2xl overflow-hidden rounded-sm`}
        >
          {/* Close button (allowed if not locked in choice) */}
          {!outcomeStage && (
            <button
              onClick={onClose}
              id="close-historic-event-btn"
              className="absolute top-4 right-4 text-stone-500 hover:text-white transition-all p-1 border border-stone-800 hover:border-saffron/40 bg-stone-950 cursor-pointer rounded-xs"
            >
              <X size={15} />
            </button>
          )}

          {/* Heading Banner */}
          <div className="text-center mb-4">
            <span className="text-[9px] font-mono text-saffron uppercase font-extrabold tracking-widest block leading-none mb-1">
              {factionNameText} • 1760 Chronicle Dispatch
            </span>
            <div className={`py-1.5 px-3 ${bannerTheme} border-y border-stone-800 text-center`}>
              <h3 className="font-serif font-black text-white text-md uppercase tracking-wider flex items-center justify-center gap-2">
                <span>{currentEvent.icon}</span>
                {currentEvent.title}
              </h3>
              <span className="text-[10px] text-saffron font-bold block mt-0.5 italic">
                {currentEvent.subTitle}
              </span>
            </div>
          </div>

          {/* Interactive Flow */}
          <AnimatePresence mode="wait">
            {!outcomeStage ? (
              <motion.div
                key="event_decision"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* Event Description */}
                <div className="p-4 bg-stone-950/70 border border-stone-850 rounded-xs relative">
                  <div className="absolute top-2 right-3 text-[9px] font-mono text-stone-500 font-bold uppercase">
                    {currentEvent.date}
                  </div>
                  <p className="text-xs text-stone-300 font-sans leading-relaxed text-left italic">
                    "{currentEvent.description}"
                  </p>
                </div>

                {/* Historic Trivia Box */}
                <div id="trivia-box" className="p-3 bg-[#451205]/20 border border-amber-950/40 text-[9.5px] font-mono text-amber-200/90 text-left rounded-xs leading-relaxed flex items-start gap-2.5">
                  <BookOpen size={16} className="text-saffron shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="text-saffron font-extrabold uppercase block tracking-wider mb-0.5">Historical Archivist Seal:</span>
                    {currentEvent.trivia}
                  </div>
                </div>

                {/* List of Choice Options */}
                <div className="space-y-3 pt-2">
                  <span className="text-[9px] font-mono text-stone-400 font-bold uppercase tracking-widest block text-left">
                    Select Commander Action:
                  </span>
                  
                  {currentEvent.options.map((option) => {
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(option)}
                        className="w-full p-3.5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-stone-800 hover:border-saffron rounded-xs text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg group flex flex-col gap-1"
                      >
                        <h4 className="text-xs font-serif font-black text-stone-100 uppercase group-hover:text-saffron transition-all leading-tight">
                          • {option.label}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-[8.5px] font-mono">
                          <span className="text-stone-500 italic uppercase">Campaign logistics cost:</span>
                          <span className={`font-extrabold tracking-wider px-1.5 py-0.5 rounded-xs border ${
                            option.goldEffect < 0 || option.provisionsEffect < 0 || option.moraleEffect < 0
                              ? 'bg-red-950/40 border-red-900/30 text-rose-400'
                              : 'bg-emerald-950/40 border-emerald-900/30 text-emerald-400'
                          }`}>
                            {option.effectSummary}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="event_outcome"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 text-center py-2"
              >
                {/* Stamp Icon */}
                <div className="w-16 h-16 bg-saffron/5 border border-saffron/30 rounded-xs mx-auto flex items-center justify-center shadow-lg relative my-4">
                  <Scroll size={28} className="text-saffron animate-pulse" />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-950 border border-emerald-400 text-emerald-400 rounded-full p-0.5 shadow-md">
                    <Check size={11} className="font-extrabold" />
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black block">
                  ✓ Royal Command Dispatched
                </span>

                <h4 className="font-serif font-black text-sm text-stone-200 uppercase tracking-wide border-b border-stone-800 pb-2">
                  Outcome: {selectedOption?.label}
                </h4>

                <div className="p-4 bg-stone-950 border-l-4 border-saffron text-xs text-stone-300 font-sans leading-relaxed text-left italic">
                  "{selectedOption?.outcomeDescription}"
                </div>

                {/* Outcome effects recap */}
                <div className="p-3 bg-stone-950 border border-stone-850 rounded-xs flex justify-around text-center mt-2">
                  <div>
                    <span className="text-[8px] font-mono text-stone-500 block uppercase font-bold">Gold Treasury</span>
                    <strong className={`font-serif text-xs ${
                      (selectedOption?.goldEffect || 0) < 0 ? 'text-red-400' : (selectedOption?.goldEffect || 0) > 0 ? 'text-emerald-400' : 'text-stone-400'
                    }`}>
                      {(selectedOption?.goldEffect || 0) >= 0 ? '+' : ''}{selectedOption?.goldEffect}
                    </strong>
                  </div>
                  <div className="border-r border-stone-850 h-8" />
                  <div>
                    <span className="text-[8px] font-mono text-stone-500 block uppercase font-bold">Provisions</span>
                    <strong className={`font-serif text-xs ${
                      (selectedOption?.provisionsEffect || 0) < 0 ? 'text-red-400' : (selectedOption?.provisionsEffect || 0) > 0 ? 'text-emerald-400' : 'text-stone-400'
                    }`}>
                      {(selectedOption?.provisionsEffect || 0) >= 0 ? '+' : ''}{selectedOption?.provisionsEffect}T
                    </strong>
                  </div>
                  <div className="border-r border-stone-850 h-8" />
                  <div>
                    <span className="text-[8px] font-mono text-stone-500 block uppercase font-bold">Cohesion</span>
                    <strong className={`font-serif text-xs ${
                      (selectedOption?.moraleEffect || 0) < 0 ? 'text-red-400' : (selectedOption?.moraleEffect || 0) > 0 ? 'text-emerald-400' : 'text-stone-400'
                    }`}>
                      {(selectedOption?.moraleEffect || 0) >= 0 ? '+' : ''}{selectedOption?.moraleEffect}%
                    </strong>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    onClick={handleConfirmOutcome}
                    id="btn-affirm-historical-outcome"
                    className="w-full py-2.5 bg-gradient-to-r from-amber-950 to-stone-900 hover:from-saffron hover:to-orange-500 hover:text-stone-950 text-saffron text-[10px] font-mono font-black uppercase tracking-widest cursor-pointer border border-saffron hover:border-[#ffe1a8] rounded-xs shadow-md transition-all active:scale-95"
                  >
                    Affix Royal Seal & Continue
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scribe Footer */}
          <div className="mt-4 pt-3 border-t border-stone-850 flex justify-between items-center text-[8px] font-mono text-stone-500 uppercase tracking-widest leading-none">
            <span>Amanat-Khane Imperial Scribe</span>
            <span>Record Year 1761</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
