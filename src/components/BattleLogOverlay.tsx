import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scroll, Lock, CheckCircle, FileText, Calendar, Compass, ShieldAlert, Award } from 'lucide-react';
import { CampaignStage } from '../types';

interface BattleLogOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  campaignStage: CampaignStage;
}

interface HistoricalLogEntry {
  stage: CampaignStage;
  title: string;
  sanskritTitle: string;
  date: string;
  icon: React.ReactNode;
  narrative: string;
  tacticalTidbit: string;
}

export const BattleLogOverlay: React.FC<BattleLogOverlayProps> = ({ isOpen, onClose, campaignStage }) => {
  const CAMP_STAGES_ORDER = [
    CampaignStage.NIZAM_CAMPAIGN,
    CampaignStage.PUNE,
    CampaignStage.BURHANPUR,
    CampaignStage.GWALIOR,
    CampaignStage.DELHI_NEGOTIATIONS,
    CampaignStage.SHINDE_STAND,
    CampaignStage.DELHI_BATTLE,
    CampaignStage.PANIPAT,
  ];

  const currentStageIndex = CAMP_STAGES_ORDER.indexOf(campaignStage);

  const historicalEntries: HistoricalLogEntry[] = [
    {
      stage: CampaignStage.NIZAM_CAMPAIGN,
      title: 'Decisive Breakthrough at Udgir',
      sanskritTitle: 'उदगीर विजयोत्सव',
      date: 'January 1760',
      icon: <Award className="text-amber-500" size={18} />,
      narrative: 'The Grand Campaign opens with a stunning exhibition of modern coordinate-based firepower. Ibrahim Khan Gardi’s nine-pounder field guns and disciplined flintlock musketeers utterly shattered the cavalry charges of the Nizam of Hyderabad. Cornered at Udgir fort, the Nizam was forced to surrender critical fortresses (including Daulatabad and Asirgarh) and pay 60 Lakhs in war reparations. This decisive victory secured the state coffer funds needed to finance the grand expedition to the North.',
      tacticalTidbit: 'HISTORICAL TRIVIA: Ibrahim Khan Gardi’s corps ("The Gardis") proved that disciplined European foot columns with field guns could overcome traditional heavy armor horse charges of Deccan rulers.'
    },
    {
      stage: CampaignStage.PUNE,
      title: 'Peshwadom Mobilization',
      sanskritTitle: 'सैन्य संचलन',
      date: 'March 14, 1760',
      icon: <Compass className="text-orange-400" size={18} />,
      narrative: 'With news of growing Afghan alliances in the North, Peshwa Balaji Baji Rao (Nanasaheb) calls a national war council at Patdur inside Pune. Crown Prince Vishwasrao is appointed titular commander, with his brilliant, financial-master cousin Sadashivrao Bhau acting as the actual Generalissimo. Over 100,200 soldiers, accompanied by an endless sea of camp followers, ladies, and southern pilgrims, cross the Godavari under the sacred saffron flag of the Confederacy.',
      tacticalTidbit: 'HISTORICAL TRIVIA: Because of holy pilgrimage season, thousands of non-combatant citizens joined the army line, placing extreme stress on grain reserves.'
    },
    {
      stage: CampaignStage.BURHANPUR,
      title: 'Crossing the Tapi River',
      sanskritTitle: 'तापी जलतरण',
      date: 'May 1760',
      icon: <Calendar className="text-stone-400" size={18} />,
      narrative: 'The unified Maratha columns reach Burhanpur on the river Tapi. The blazing dry summer breaks with temperature records soaring beyond 44°C. Severe heat exhaustion and waterborne cholera outbreaks sweep the baggage lines, decimating dozens of camp followers daily. In spite of these grueling logistical hurdles, Bhau utilizes Pune treasury funds to procure rapid local cart-oxen, pushing the expedition forward into Central India.',
      tacticalTidbit: 'HISTORICAL TRIVIA: Water wells in central garrisons were strictly guarded to prevent infection during the severe heatwaves.'
    },
    {
      stage: CampaignStage.GWALIOR,
      title: 'Gwalior Council of Suraj Mal',
      sanskritTitle: 'ग्वाल्हेर सल्लामसलत',
      date: 'June 1760',
      icon: <FileText className="text-yellow-500" size={18} />,
      narrative: 'Maharaja Suraj Mal, the brilliant Jat sovereign, aligns his forces with the Marathas at Gwalior. Warning Bhau about Northern tactics, Suraj Mal declares: "The fierce Afghan horsemen travel extremely light. Leave your heavy artillery carts, families, and court ladies under guard in Gwalior forts. Let us fight them in the quick mobile style of traditional Maratha guerrilla warfare (Ganimi Kava)!" Veteran Malharrao Holkar strongly supports this; however, Bhau refuses to separate the army from Ibrahim Gardis French infantry squares.',
      tacticalTidbit: 'HISTORICAL TRIVIA: Bhau’s refusal to discard heavy carriages alienated Suraj Mal, who subsequently withdrew his combat forces back to Bharatpur.'
    },
    {
      stage: CampaignStage.DELHI_NEGOTIATIONS,
      title: 'Storming of the Red Fort',
      sanskritTitle: 'लाल किल्ला विजय',
      date: 'August 1, 1760',
      icon: <ShieldAlert className="text-red-500" size={18} />,
      narrative: 'Sensing a strategic choke point, Maratha forces led by Sadashivrao Bhau storm and capture Delhi’s historic Red Fort, ousting the Afghan-appointed governor. However, they discover the city and palace completely devastated and looted by Ahmad Shah Abdali’s earlier raids. Out of silver to pay his starving, restless columns, Bhau takes the painful decision to smelt down the magnificent silver ceiling of the Diwan-i-Khas elite palace hall.',
      tacticalTidbit: 'HISTORICAL TRIVIA: This smelting generated approximately 9 Lakhs in silver Mohurs, helping to buy meager rations for the army for another month.'
    },
    {
      stage: CampaignStage.SHINDE_STAND,
      title: 'Dattaji’s Martyrdom at Barari Ghat',
      sanskritTitle: 'दत्ताजी शिंदे शौर्यगाथा',
      date: 'January 10, 1760 (Retrospective)',
      icon: <ShieldAlert className="text-rose-600" size={18} />,
      narrative: 'A heavy retrospective cloud. Commander Dattaji Shinde, holding the northern Yamuna banks with an outnumbered division, was ambushed and cut down by Rohilla tribal forces under Najib-ud-Daula at Barari Ghat. When lying mortally wounded in the silt, Najib asks: "Will you still fight us, Patel?" Dattaji defiantly mocks back with his final breath: "Yes! If I survive, I will fight again!" (बचेंगे तो और भी लड़ेंगे!). This heroic martyrdom unified Maratha anger, paving the road for the Grand Expedition.',
      tacticalTidbit: 'HISTORICAL TRIVIA: This battle alerted Pune that traditional cavalry was highly vulnerable when caught in muddy riverbeds without defensive firepower.'
    },
    {
      stage: CampaignStage.DELHI_BATTLE,
      title: 'Assault on Kunjpura Fortress',
      sanskritTitle: 'कुंजपुरा कोट भंजन',
      date: 'October 17, 1760',
      icon: <Award className="text-emerald-500" size={18} />,
      narrative: 'In a tactical masterpiece, Bhau launches a massive coordinated artillery siege against the heavily fortified Afghan supply garrison of Kunjpura. Ibrahim Khan Gardis field gun batteries reduce the clay fortress walls to rubble. Maratha cavalry charges inward, defeating the 15,000 Afghan defenders and capturing Kutub Shah (the executioner of Dattaji). They seize immense stocks of grains, wheat bags, and gold, temporarily relieving the campaign starvation.',
      tacticalTidbit: 'HISTORICAL TRIVIA: Grieved by Kunjpura’s loss, Abdali crossed the flooded, raging Yamuna River at Baghpat on October 25, cutting off the Maratha army from Delhi.'
    },
    {
      stage: CampaignStage.PANIPAT,
      title: 'The Cataclysmic Field of Panipat',
      sanskritTitle: 'पानिपत महायुद्ध',
      date: 'January 14, 1761',
      icon: <Scroll className="text-saffron animate-pulse" size={18} />,
      narrative: 'Having been blockaded and starved in their fortified camp at Panipat for over two months, the Maratha Grand Army exits their trenches on the cold morning of Makar Sankranti. Gardi’s heavy cannons mow down thousands of Afghan right-wingers under Najib, while Bhau’s central spearhead punches deep into Grand Vizier Shah Wali Khan’s core ranks. However, Abdali releases his fresh hidden reserve of 10,000 heavy camel zamburaks and elite horsemen, cutting off the wings. Vishwasrao perishes under bullet fire, triggering a tragic, heroic collapse of the line.',
      tacticalTidbit: 'HISTORICAL TRIVIA: Over 70,000 soldiers and camp followers lost their lives in a single day, destroying the cream of Maratha leadership.'
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          id="battle-log-overlay"
          className="fixed inset-0 z-[1100] bg-stone-950/98 backdrop-blur-md flex items-center justify-center p-4 md:p-10 overflow-hidden"
        >
          {/* Ancient Frame effect */}
          <div className="absolute inset-4 border border-saffron/10 rounded-sm pointer-events-none" />

          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="w-full max-w-5xl h-[90vh] bg-stone-900 border-2 border-amber-900/60 p-6 md:p-10 relative flex flex-col justify-between shadow-2xl overflow-hidden"
          >
            {/* Background seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none">
              <Scroll size={450} className="text-saffron" />
            </div>

            {/* Header */}
            <div>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-stone-500 hover:text-white transition-all cursor-pointer p-1 border border-stone-800 hover:border-saffron/40 hover:bg-stone-950"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-saffron/5 border border-saffron/30 flex items-center justify-center rounded-xs shadow-md">
                  <Scroll size={22} className="text-saffron animate-pulse" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-serif font-black text-white uppercase tracking-wider">
                    Chronicles of Panipat <span className="text-saffron text-sm font-sans block md:inline md:ml-2">युद्ध इतिहास</span>
                  </h2>
                  <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest leading-none">
                    Imperial Archive Department • Peshwadom Record 1761
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-stone-800 text-[10px] uppercase font-mono mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500">Campaign Timeline Stage:</span>
                  <span className="text-emerald-400 font-bold">{campaignStage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 flex items-center gap-1">Uncovered Records:</span>
                  <span className="text-saffron font-bold text-xs">{currentStageIndex + 1} / 8 Sectors</span>
                </div>
              </div>
            </div>

            {/* Scrolling log contents */}
            <div className="flex-1 overflow-y-auto pr-2 my-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-stone-950">
              {historicalEntries.map((entry, index) => {
                const isItemUnlocked = index <= currentStageIndex;

                if (!isItemUnlocked) {
                  return (
                    <div
                      key={entry.stage}
                      className="p-5 border border-dashed border-stone-800 bg-stone-950/20 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4 grayscale opacity-55"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xs bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
                          <Lock size={16} className="text-stone-500" />
                        </div>
                        <div className="text-left">
                          <span className="text-[8px] font-mono text-stone-600 block uppercase font-black">Stage Locked</span>
                          <h4 className="text-xs font-serif font-black uppercase text-stone-400">
                            [Restricted Sector: {entry.stage.replace('_', ' ')}]
                          </h4>
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-500 font-sans italic text-left md:text-right">
                        Complete preceding campaign operations to recover this operational ledger.
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.stage}
                    className="p-5 bg-stone-950/40 hover:bg-stone-950/70 border border-amber-900/40 rounded-xs transition-all relative group flex flex-col gap-3 font-sans text-left"
                  >
                    {/* Visual Stamp Line */}
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-saffron" />

                    {/* Meta info header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-850">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-amber-950/40 border border-saffron/40 flex items-center justify-center shrink-0 rounded-xs text-saffron">
                          {entry.icon}
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-saffron/80 uppercase font-bold tracking-widest block leading-none">
                            {entry.date} • {entry.sanskritTitle}
                          </span>
                          <h4 className="font-serif font-black text-sm text-stone-100 uppercase tracking-wide group-hover:text-saffron transition-all">
                            {entry.title}
                          </h4>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-xs tracking-wider font-extrabold uppercase shrink-0">
                        ✓ Recovered Chronicles
                      </span>
                    </div>

                    {/* Detailed Narrative Description */}
                    <p className="text-[11.5px] text-stone-300 font-sans leading-relaxed text-slate-350 italic">
                      "{entry.narrative}"
                    </p>

                    {/* Historical interactive trivia/tidbit bullet point */}
                    <div className="mt-1 p-3 bg-[#451205]/40 border border-amber-900/30 text-[9.5px] font-mono text-amber-205 py-2.5 rounded-xs leading-relaxed">
                      <strong className="text-saffron block mb-0.5 uppercase tracking-wider font-black">Strategic Archivist Insight:</strong>
                      {entry.tacticalTidbit}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer button */}
            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
              <p className="text-[9px] text-stone-500 font-mono uppercase tracking-widest">
                "Bachenge toh aur bhi ladenge" • Dattaji Shinde 1760
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-amber-950 to-stone-900 border border-saffron hover:border-amber-400 text-saffron hover:text-amber-300 text-[10px] font-mono font-black uppercase tracking-widest cursor-pointer transition-all"
              >
                Dismiss Chronicles
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
