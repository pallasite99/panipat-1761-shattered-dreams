import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Coins, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  UserCheck, 
  Award, 
  AlertCircle,
  FileText,
  Anchor,
  HelpCircle,
  PenTool
} from 'lucide-react';
import { CampaignStage } from '../types';
import { panipatAudioEngine } from '../utils/audioSystem';

interface DespatchEntry {
  id: string;
  title: string;
  date: string;
  category: 'Strategic' | 'Diplomatic' | 'Logistics' | 'Milestone';
  status: 'active' | 'completed' | 'pending';
  desc: string;
  metrics: string[];
}

export const PeshwaDespatchBook: React.FC = () => {
  const [faction, setFaction] = useState<'maratha' | 'durrani'>('maratha');
  const [stage, setStage] = useState<CampaignStage>(CampaignStage.NIZAM_CAMPAIGN);
  const [gold, setGold] = useState<number>(145000);
  const [provisions, setProvisions] = useState<number>(1400);
  const [manpower, setManpower] = useState<number>(45000);
  const [morale, setMorale] = useState<number>(75);
  
  // Dynamic features state
  const [ratifiedCount, setRatifiedCount] = useState<number>(0);
  const [treaties, setTreaties] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<{ id: string; name: string }[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [decisions, setDecisions] = useState<{ dilemma: string; choice: string }[]>([]);
  const [isSigned, setIsSigned] = useState<boolean>(false);

  useEffect(() => {
    // Read local states
    const curFaction = (localStorage.getItem('panipat_campaign_faction') || 'maratha') as 'maratha' | 'durrani';
    setFaction(curFaction);

    const curStage = (localStorage.getItem('panipat_campaign_stage') || CampaignStage.NIZAM_CAMPAIGN) as CampaignStage;
    setStage(curStage);

    setGold(Number(localStorage.getItem('panipat_campaign_treasury') || '145000'));
    setProvisions(Number(localStorage.getItem('panipat_campaign_provisions') || '1400'));
    setManpower(Number(localStorage.getItem('panipat_campaign_manpower') || '45000'));
    setMorale(Number(localStorage.getItem('panipat_campaign_morale') || '75'));

    // Check ratified treaties
    const ratifiedStr = localStorage.getItem('panipat_diplomacy_ratified_treaties');
    let ratifiedList: string[] = [];
    if (ratifiedStr) {
      try {
        const parsed = JSON.parse(ratifiedStr);
        Object.keys(parsed).forEach(rId => {
          if (parsed[rId]) {
            const rNames: Record<string, string> = {
              shuja: 'Nawab Shuja-ud-Daula (Awadh)',
              surajmal: 'Maharaja Suraj Mal (Jats)',
              madhosingh: 'Maharaja Madho Singh (Jaipur)',
              alha: 'Ruler Alha Singh (Patiala)',
              najib: 'Najib-ud-Daula (Rohillas)'
            };
            ratifiedList.push(rNames[rId] || rId);
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
    setTreaties(ratifiedList);
    setRatifiedCount(ratifiedList.length);

    // Check equipment
    const gearList: { id: string; name: string }[] = [];
    if (localStorage.getItem('panipat_equipment_winter_woolens') === 'true') {
      gearList.push({ id: 'woolens', name: 'Deccan Woolen Capes (Winter Protection)' });
    }
    if (localStorage.getItem('panipat_equipment_monsoon_tarps') === 'true') {
      gearList.push({ id: 'tarps', name: 'Waterproof Tarpaulin Depots (Monsoon Shelter)' });
    }
    if (localStorage.getItem('panipat_equipment_summer_wells') === 'true') {
      gearList.push({ id: 'wells', name: 'Step-well Supply Reservoirs (Summer Hydration)' });
    }
    setEquipment(gearList);

    // Check completed lessons
    const completedLessonsStr = localStorage.getItem('panipat_lms_completed_lessons');
    if (completedLessonsStr) {
      try {
        setCompletedLessons(JSON.parse(completedLessonsStr));
      } catch (e) {}
    }

    // Check decisions
    const decisionAnswersStr = localStorage.getItem('panipat_lms_decision_answers');
    if (decisionAnswersStr) {
      try {
        const parsedAnswers = JSON.parse(decisionAnswersStr);
        const dilemmaDetails: { dilemma: string; choice: string }[] = [];
        const DILEMMA_NAMES: Record<string, string> = {
          crossing: "Crossing the Flooded Yamuna River",
          silver: "Delhi Palace Silver Desecration",
          najib: "Najib's Diplomatic Counter-Spying",
          kunjpura: "Kunjpura Grain Forage Splitting"
        };
        const OPTION_NAMES: Record<string, string> = {
          gardi_cannon: "Artillery ferry defense",
          cavalry_swim: "Direct swim upstream (High casualties)",
          melt_silver: "Melt royal ceiling to pay starving soldiers",
          protect_art: "Protect history but face army mutiny",
          execute_envoys: "Execute Najib's envoys immediately",
          counter_gold: "Send a counter-offer of 10,000 Gold Mohurs",
          consolidate: "Keep the army concentrated at Panipat",
          split_scouts: "Dispatch Govind Pant's cavalry to forage"
        };
        Object.keys(parsedAnswers).forEach(dId => {
          const dName = DILEMMA_NAMES[dId] || dId;
          const oName = OPTION_NAMES[parsedAnswers[dId]] || parsedAnswers[dId];
          dilemmaDetails.push({ dilemma: dName, choice: oName });
        });
        setDecisions(dilemmaDetails);
      } catch (e) {}
    }

    // Check if signed before
    setIsSigned(localStorage.getItem('panipat_despatch_signed') === 'true');
  }, []);

  const handleSignLedger = () => {
    panipatAudioEngine.playSfx('stamp');
    localStorage.setItem('panipat_despatch_signed', 'true');
    setIsSigned(true);
  };

  const currentStageIndex = Object.values(CampaignStage).indexOf(stage);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 text-left">
      {/* Golden Parchment Theme Wrapper */}
      <div className="parchment border-4 border-double border-[#8B5E3C] p-6 md:p-10 shadow-2xl relative rounded-sm text-stone-900">
        
        {/* Subtle royal backdrop accents */}
        <div className="absolute top-4 right-4 opacity-15 pointer-events-none select-none">
          <BookOpen className="w-24 h-24 text-[#8B5E3C]" />
        </div>

        {/* Imperial Header */}
        <div className="border-b-2 border-stone-400/60 pb-6 mb-8 text-center relative">
          <span className="text-[10px] font-mono font-black text-[#8B5E3C] uppercase tracking-[0.4em] block mb-1">
            ⚜️ Shaniwar Wada Sovereign Scriptorium ⚜️
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-black uppercase text-[#2D241E] tracking-tight">
            {faction === 'maratha' ? "Peshwa's Despatch Book" : "Kabul Frontier Diwan Ledger"}
          </h2>
          <p className="text-xs text-stone-600 font-sans italic mt-1 max-w-lg mx-auto">
            "A record of letters, treaties, expenses, and strategic decisions submitted by the Grand Expedition commander to the high administrative councils."
          </p>
        </div>

        {/* Live Campaign Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#2d241e]/5 border border-stone-400/40 rounded p-4 mb-8">
          <div>
            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Expedition Commander</span>
            <span className="font-serif text-sm font-black text-stone-900">
              {faction === 'maratha' ? 'Sadashivrao Bhau' : 'Ahmad Shah Durrani'}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Active Campaign Stage</span>
            <span className="font-serif text-sm font-black text-stone-900 uppercase">
              {stage.replace(/_/g, ' ')}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Treasury Gold Balance</span>
            <span className="font-mono text-sm font-black text-yellow-800 flex items-center gap-1">
              <Coins size={14} className="text-amber-700" />
              {gold.toLocaleString()} Mohurs
            </span>
          </div>
          <div>
            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Expedition Morale</span>
            <span className="font-sans text-sm font-black text-orange-850">
              {morale}% static index
            </span>
          </div>
        </div>

        {/* Main Chronicle List */}
        <div className="space-y-8">
          
          {/* Dispatch 1: Campaign Mobilization */}
          <div className="border-l-4 border-[#8B5E3C] pl-6 relative">
            <div className="absolute -left-2.5 top-0 w-4 h-4 rounded-full bg-[#8B5E3C] border-2 border-[#fff]" />
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-serif text-lg font-black uppercase text-stone-900 tracking-wider">
                I. Deccan Mobilization Chronicles
              </h3>
              <span className="text-[10px] font-mono bg-stone-300 text-stone-800 px-2 py-0.5 rounded uppercase font-bold">
                Muster
              </span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-semibold mb-3">
              The grand campaign was authorized from Pune Shaniwar Wada, mobilising the heavy huzurat cavalry and Ibrahim Gardi's European-disciplined artillery cores.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] bg-[#fff]/60 border border-stone-400/20 p-3 rounded">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-stone-600" />
                <span><strong>Starting Manpower:</strong> 45,000 soldiers</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-stone-600" />
                <span><strong>Starting Provisions:</strong> 1,400 tons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-stone-600" />
                <span><strong>Mobilized in:</strong> March 1760 A.D.</span>
              </div>
            </div>
          </div>

          {/* Dispatch 2: Diplomatic Coalitions */}
          <div className="border-l-4 border-[#8B5E3C] pl-6 relative">
            <div className="absolute -left-2.5 top-0 w-4 h-4 rounded-full bg-[#8B5E3C] border-2 border-[#fff]" />
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-serif text-lg font-black uppercase text-stone-900 tracking-wider">
                II. Diplomatic Alliance Despatches
              </h3>
              <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded uppercase font-bold">
                Coalition
              </span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-semibold mb-3">
              Imperial seals are exchanged to bring powerful regional rulers into the active battle line. Fuzzily balanced alliances are verified at the Darbar Council.
            </p>

            {ratifiedCount > 0 ? (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold block">
                  ✓ Successfully Ratified Treaties ({ratifiedCount}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {treaties.map((tName, idx) => (
                    <span key={idx} className="bg-emerald-100 border border-emerald-300 text-emerald-950 text-[10.5px] font-mono px-2.5 py-1 rounded font-black flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-700" />
                      {tName}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-stone-200/50 border border-dashed border-stone-400 rounded text-stone-600 text-[11px] italic flex items-center gap-2">
                <AlertCircle size={16} className="text-[#8B5E3C]" />
                <span>No secret treaties are ratified yet. Scribes note that you should visit the "Council & Diplomacy" screen to negotiate territorial pledges or gold subsidies.</span>
              </div>
            )}
          </div>

          {/* Dispatch 3: Logistics Attrition Equipment */}
          <div className="border-l-4 border-[#8B5E3C] pl-6 relative">
            <div className="absolute -left-2.5 top-0 w-4 h-4 rounded-full bg-[#8B5E3C] border-2 border-[#fff]" />
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-serif text-lg font-black uppercase text-stone-900 tracking-wider">
                III. Quartermaster Logistical Reports
              </h3>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded uppercase font-bold">
                Supply Line
              </span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-semibold mb-3">
              Winter, Monsoon, and Summer conditions cause severe attrition. Procured equipment helps commanders bypass weather combat and movement rate penalties.
            </p>

            {equipment.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold block">
                  🛡️ Active Camp Equipment & Shelters ({equipment.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {equipment.map(eq => (
                    <div key={eq.id} className="bg-blue-50 border border-blue-200 text-blue-950 text-[10.5px] font-mono p-2 rounded flex items-center gap-2 font-bold">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      {eq.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-stone-200/50 border border-dashed border-stone-400 rounded text-stone-600 text-[11px] italic flex items-center gap-2">
                <AlertCircle size={16} className="text-[#8B5E3C]" />
                <span>No winter woolen cloaks, waterproof tarpaulins, or step-well channels bought. Scribes report that you face extreme weather combat penalties! Buy them in "Supply Lines".</span>
              </div>
            )}
          </div>

          {/* Dispatch 4: Academy Milestones & Decisions */}
          <div className="border-l-4 border-[#8B5E3C] pl-6 relative">
            <div className="absolute -left-2.5 top-0 w-4 h-4 rounded-full bg-[#8B5E3C] border-2 border-[#fff]" />
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-serif text-lg font-black uppercase text-stone-900 tracking-wider">
                IV. War Cabinet Operational Decisions
              </h3>
              <span className="text-[10px] font-mono bg-purple-100 text-purple-950 px-2 py-0.5 rounded uppercase font-bold">
                Cabinet
              </span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-semibold mb-3">
              Narrative choices made inside the Shaniwar Wada Seminary affect general soldier trust and operational logistics levels.
            </p>

            {decisions.length > 0 ? (
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold block">
                  ⚙️ Active Dilemma Outcomes Recorded ({decisions.length}):
                </span>
                <div className="space-y-2">
                  {decisions.map((dec, idx) => (
                    <div key={idx} className="bg-[#fff]/80 border border-stone-400/30 p-2.5 rounded text-[11px] font-sans">
                      <span className="text-[9.5px] font-mono uppercase font-black text-purple-850 block mb-0.5">
                        Dilemma: {dec.dilemma}
                      </span>
                      <p className="text-stone-850 font-semibold">
                        Command Choice: <span className="text-stone-950 font-black underline">"{dec.choice}"</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-stone-200/50 border border-dashed border-stone-400 rounded text-stone-600 text-[11px] italic flex items-center gap-2">
                <AlertCircle size={16} className="text-[#8B5E3C]" />
                <span>No choices recorded in the seminary yet. Scribes request you visit the "Grand Academy" and make tactical decisions in the Decision Chronicles tab.</span>
              </div>
            )}
          </div>

          {/* Dispatch 5: Battle Progress */}
          <div className="border-l-4 border-[#8B5E3C] pl-6 relative">
            <div className="absolute -left-2.5 top-0 w-4 h-4 rounded-full bg-[#8B5E3C] border-2 border-[#fff]" />
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-serif text-lg font-black uppercase text-stone-900 tracking-wider">
                V. Campaign Victory & Strategic Milestones
              </h3>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded uppercase font-bold">
                Combat
              </span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-semibold mb-3">
              The expedition continues to march towards the northern rivers. Below are your achievements so far.
            </p>

            <div className="p-3 bg-[#fff]/60 border border-stone-400/20 rounded text-[11px] space-y-2 font-mono">
              <div className="flex justify-between border-b border-stone-300/40 pb-1.5">
                <span>Completed Lessons in Syllabus:</span>
                <span className="font-bold text-stone-900">{completedLessons.length} / 10 lessons</span>
              </div>
              <div className="flex justify-between border-b border-stone-300/40 pb-1.5">
                <span>Active Stage Progression:</span>
                <span className="font-bold text-stone-900 uppercase">{stage.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Campaign Conquest Index:</span>
                <span className="font-bold text-stone-900">
                  {Math.round((currentStageIndex / (Object.values(CampaignStage).length - 1)) * 100)}% Complete
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Peshwa's Signature Seal Area */}
        <div className="mt-12 pt-8 border-t-2 border-dashed border-stone-400/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left max-w-sm">
            <h4 className="font-serif text-sm font-black uppercase text-stone-900 mb-1">
              Authenticity Sworn Records
            </h4>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Upon verifying the ledger, the expedition commander stamps the Peshwa's Court Royal Wax Stamp to validate these despatches before sending them back to Pune.
            </p>
          </div>

          <div className="relative">
            {isSigned ? (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-28 h-28 rounded-full border-4 border-dashed border-red-800 bg-red-100 flex items-center justify-center relative shadow-lg cursor-default select-none"
              >
                <div className="text-center transform -rotate-12">
                  <span className="text-[9px] font-mono font-black uppercase text-red-800 tracking-wider block">PESHWA SEAL</span>
                  <span className="font-serif text-xs font-black text-red-950 uppercase block">RATIFIED</span>
                  <span className="text-[8px] font-mono text-red-800 uppercase block">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                {/* Visual stamp ring */}
                <div className="absolute inset-2 border-2 border-red-700/40 rounded-full" />
              </motion.div>
            ) : (
              <button
                type="button"
                onClick={handleSignLedger}
                className="px-6 py-3.5 bg-red-900 hover:bg-red-850 text-white font-serif text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 rounded-sm transition-all flex items-center gap-2 cursor-pointer border border-red-700"
              >
                <PenTool size={16} />
                Affix Peshwa's Wax Seal
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
