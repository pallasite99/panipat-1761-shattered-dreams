import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scroll, Handshake, Shield, MessageSquare, Plus, Minus, Coins, Package, Users, HelpCircle, CheckCircle } from 'lucide-react';

interface CoalitionDiplomacyDarbarProps {
  onClose: () => void;
  onApplyRewards: (rewards: { gold: number; provisions: number; morale: number; text: string }) => void;
}

interface Sirdar {
  id: string;
  name: string;
  title: string;
  avatar: string;
  description: string;
  demands: string;
  troopForce: string;
  initialInterest: number;
  priority: 'Gold' | 'Territory' | 'Tax Waiver';
}

const HISTORICAL_SIRDARS: Sirdar[] = [
  {
    id: 'shuja',
    name: 'Nawab Shuja-ud-Daula',
    title: 'Sovereign Nawab of Awadh',
    avatar: '🕌',
    description: 'Controls 30,000 elite musketeers and heavy cannon batteries on the eastern Ganga corridor.',
    demands: 'Demands absolute post-war governorship over Delhi crown lands and high silver war subsidies.',
    troopForce: '8,500 Elite Awadh Matchlock Infantry',
    initialInterest: 35,
    priority: 'Territory'
  },
  {
    id: 'surajmal',
    name: 'Maharaja Suraj Mal Jats',
    title: 'Lohagarh Sovereign Commander',
    avatar: '👑',
    description: 'The master of fortress construction, commanding deep grain silos along Agra highway.',
    demands: 'Requires formal permanent exemption from Southern Deccan tax Chauth and adopting guerrilla cavalry tactics.',
    troopForce: '6,000 Jat Heavy Siege Engineers & Granary Access',
    initialInterest: 40,
    priority: 'Tax Waiver'
  },
  {
    id: 'alha',
    name: 'Sardar Alha Singh',
    title: 'Chief of the Phulkian Sikh Misl',
    avatar: '🌾',
    description: 'The resilient Punjab pioneer guarding supply passages behind current battlefields.',
    demands: 'Requires direct cash to defend Sirhind and protection treaties against Rohilla raids.',
    troopForce: '4,000 Light Cavalry Lancers & 200 Grain Wagons',
    initialInterest: 30,
    priority: 'Gold'
  },
  {
    id: 'vassal_shinde',
    name: 'Sardar Jankoji Scindia',
    title: 'Deccan Baron Representative',
    avatar: '⚔️',
    description: 'Represents the veteran Maratha military baronies, weary of the central Pune cabinet orders.',
    demands: 'Wants battlefield command autonomy and return of regional fort leases.',
    troopForce: '5,000 Rajput-Maratha Light Skirmish Hussars',
    initialInterest: 50,
    priority: 'Gold'
  }
];

export const CoalitionDiplomacyDarbar: React.FC<CoalitionDiplomacyDarbarProps> = ({
  onClose,
  onApplyRewards
}) => {
  const [selectedSirdarId, setSelectedSirdarId] = useState<string>('shuja');
  
  // Treaty Offer States
  const [offerGold, setOfferGold] = useState<number>(10000); // 0 to 40,500
  const [offerDelhiGovernor, setOfferDelhiGovernor] = useState<boolean>(false);
  const [offerTaxWaiver, setOfferTaxWaiver] = useState<boolean>(false);
  const [alliesAssurance, setAlliesAssurance] = useState<'Standard' | 'Joint Defense' | 'Sovereign Autonomy'>('Standard');

  // Logs of Court sessions
  const [courtLog, setCourtLog] = useState<string[]>([
    "Envoys light the royal court incense. Scribes roll out parchments."
  ]);

  const [pactSigned, setPactSigned] = useState<boolean>(false);

  const activeSirdar = HISTORICAL_SIRDARS.find(s => s.id === selectedSirdarId) || HISTORICAL_SIRDARS[0];

  // Dynamic agreement evaluation
  const calculateAgreementScore = () => {
    let score = activeSirdar.initialInterest;

    // Gold offers
    const goldMultiplier = offerGold / 1000; // e.g. 10 score for 10k
    score += goldMultiplier;

    // Priorities matchup
    if (activeSirdar.priority === 'Gold') {
      score += (offerGold / 600); // extra multiplier for gold prioritization
    }

    if (activeSirdar.priority === 'Territory' && offerDelhiGovernor) {
      score += 35;
    }

    if (activeSirdar.priority === 'Tax Waiver' && offerTaxWaiver) {
      score += 40;
    }

    // Assurances
    if (alliesAssurance === 'Joint Defense') score += 10;
    if (alliesAssurance === 'Sovereign Autonomy') score += 15;

    // Penalties if offering mutually exclusive items or underfunding
    if (offerGold < 5000) score -= 15;

    return Math.min(100, Math.max(0, score));
  };

  const agreementScore = calculateAgreementScore();

  const handleApplyTreatyOffer = () => {
    if (agreementScore < 70) {
      alert("Agreement levels are too low! Scribes warn starting a pact below 70% results in immediate rejection of deeds.");
      return;
    }

    setPactSigned(true);
    setCourtLog(prev => [
      `📜 TREATY RATIFIED! Sealed alliance pact with ${activeSirdar.name} under sacred witnesses!`,
      ...prev
    ]);
  };

  const handleTransferPactBenefits = () => {
    let troopsBonus = 5000;
    let goldCost = offerGold;
    let provisionsBonus = 120;
    let moraleBonus = 15;

    if (selectedSirdarId === 'shuja') {
      troopsBonus = 8500;
      moraleBonus = 20;
    } else if (selectedSirdarId === 'surajmal') {
      troopsBonus = 6000;
      provisionsBonus = 250;
    } else if (selectedSirdarId === 'alha') {
      troopsBonus = 4000;
      provisionsBonus = 200;
    } else {
      troopsBonus = 5000;
      moraleBonus = 10;
    }

    onApplyRewards({
      gold: -goldCost,
      provisions: provisionsBonus,
      morale: moraleBonus,
      text: `Drafted Imperial Pact with ${activeSirdar.name}: Subsidized ${goldCost.toLocaleString()} Mohurs to acquire ${troopsBonus} elite soldiers and +${provisionsBonus} provisions corridor.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4">
      <div id="diplomatic-darbar-modal" className="w-full max-w-5xl bg-[#130f0c] border-4 border-amber-850 rounded-sm relative flex flex-col max-h-[92vh] text-[#F3E5AB]">
        
        {/* Header section */}
        <div className="p-4 border-b border-amber-800/30 bg-stone-950 flex justify-between items-center font-serif">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div className="text-left">
              <h3 className="text-lg font-black uppercase text-saffron tracking-widest">Coalition Diplomacy Darbar</h3>
              <p className="text-[10px] text-stone-400 font-sans italic">"barter terms in detailed assemblies to secure alliances and elite auxiliary forces"</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-3 bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs rounded-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Navigation: Faction list selector */}
          <div className="w-full md:w-80 border-r border-amber-900/20 bg-stone-950/30 overflow-y-auto p-3 space-y-2">
            <div className="text-[9px] uppercase font-mono font-black text-stone-500 tracking-wider text-left border-b border-stone-900 pb-1.5 mb-2">
              Sovereigns in Assembly
            </div>

            {HISTORICAL_SIRDARS.map(s => {
              const isSelected = s.id === selectedSirdarId;
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSirdarId(s.id); setPactSigned(false); }}
                  className={`w-full p-3 border rounded-xs text-left transition-all cursor-pointer flex gap-3 items-start ${isSelected ? 'border-saffron bg-[#2b1f13]' : 'border-stone-900 bg-stone-950/50 hover:bg-stone-900'}`}
                >
                  <div className="text-xl p-1 bg-stone-900 border border-stone-800 rounded-sm">
                    {s.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-serif font-bold text-white uppercase">{s.name}</h4>
                    <p className="text-[9px] text-[#8B5E3C] mt-0.5 font-sans truncate">{s.title}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Area: Deep barter panel */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 text-left">
            {!pactSigned ? (
              <>
                {/* Active Lord Bio description details */}
                <div className="p-4 bg-stone-950 border border-stone-850 rounded-sm">
                  <div className="flex justify-between items-center border-b border-stone-900 pb-2 mb-2">
                    <span className="text-xs uppercase font-serif text-saffron font-bold">{activeSirdar.name}</span>
                    <span className="text-[8px] font-mono text-stone-500 uppercase tracking-widest">{activeSirdar.title}</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed font-sans">{activeSirdar.description}</p>
                  <div className="mt-3 p-2 bg-[#2d1b0f] border-l-4 border-saffron rounded-xs text-[11px] leading-relaxed italic text-stone-200 font-serif">
                    <strong>Lord's Priority Direction:</strong> "{activeSirdar.demands}"
                  </div>
                </div>

                {/* Barter parameters table */}
                <div className="space-y-4">
                  <h4 className="font-serif font-black text-xs text-saffron uppercase tracking-widest border-b border-stone-900 pb-1.5">Treaty Drafting Barter Table</h4>
                  
                  {/* Parameter 1: Silver War Subsidies */}
                  <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-stone-300 uppercase font-bold tracking-wider font-mono">1. Silver War Subsidies (Gold Mohurs)</span>
                      <span className="font-mono text-saffron text-xs font-bold">{offerGold.toLocaleString()} M</span>
                    </div>
                    <p className="text-[9px] text-stone-500 leading-tight">Fund troop shields and shoeing costs. Underfunding alienates proud rulers.</p>
                    <input
                      type="range"
                      min="5000"
                      max="40000"
                      step="2500"
                      value={offerGold}
                      onChange={(e) => setOfferGold(Number(e.target.value))}
                      className="w-full mt-3 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer accent-saffron"
                    />
                    <div className="flex justify-between text-[8px] text-stone-600 font-mono font-bold mt-1">
                      <span>5,000 M (Token)</span>
                      <span>20,000 M (Standard)</span>
                      <span>40,000 M (Imperial)</span>
                    </div>
                  </div>

                  {/* Yes/No Checkboxes Parameter 2 & 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-stone-300 uppercase font-bold tracking-wider font-mono block">2. Delhi Governorship</span>
                          <p className="text-[9px] text-stone-500 mt-1 leading-normal">Cede total post-war civil revenue administration of Delhi. Major asset.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={offerDelhiGovernor}
                          onChange={(e) => setOfferDelhiGovernor(e.target.checked)}
                          className="h-4 w-4 accent-saffron cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-stone-300 uppercase font-bold tracking-wider font-mono block">3. Deccan Tax Chauth Waiver</span>
                          <p className="text-[9px] text-stone-500 mt-1 leading-normal">Formally erase tax arrears and waive Deccan taxation rights.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={offerTaxWaiver}
                          onChange={(e) => setOfferTaxWaiver(e.target.checked)}
                          className="h-4 w-4 accent-saffron cursor-pointer"
                        />
                      </div>
                    </div>

                  </div>

                </div>

                {/* Spliced results meter and claim buttons */}
                <div className="p-4 bg-stone-950 border border-stone-850 rounded-sm flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-left w-full md:w-auto">
                    <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold leading-none mb-1.5">Treaty Agreement Rating</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-md font-serif font-black ${agreementScore >= 70 ? 'text-emerald-400' : 'text-red-500'}`}>
                        {agreementScore.toFixed(0)}%
                      </span>
                      <div className="h-6 w-px bg-stone-800" />
                      <span className="text-[10px] text-stone-300 font-sans italic">
                        {agreementScore >= 75 ? 'Excellent. Rulers are highly aligned to sign.' : 'Too low. Add gold or grant prioritized items!'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={agreementScore < 70}
                    onClick={handleApplyTreatyOffer}
                    className="py-2.5 px-6 bg-gradient-to-r from-saffron to-[#9a3412] hover:from-[#f59e0b] hover:to-[#b45308] disabled:opacity-30 text-stone-950 font-serif font-black text-xs uppercase tracking-wider rounded-sm cursor-pointer shadow-md"
                  >
                    📝 RATIFY PACT TREATY
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border border-saffron bg-[#2b1f13] flex items-center justify-center mx-auto text-3xl">
                  📜
                </div>

                <div className="max-w-md mx-auto text-center space-y-2">
                  <h4 className="font-serif text-lg font-black uppercase text-white tracking-widest">PACT TREATY GRANTED</h4>
                  <p className="text-xs text-stone-300 leading-relaxed font-sans">
                    With pristine diplomacy, you have locked in support lines with <strong>{activeSirdar.name}</strong>. Their cavalry is detailed, their silos are unlocked, and their soldiers are preparing their shields under coalition banners!
                  </p>
                </div>

                <div className="p-3.5 bg-stone-950 border border-stone-850 rounded-xs flex gap-4 max-w-sm mx-auto text-left font-mono text-[10px]">
                  <div>
                    <span className="text-stone-500 uppercase block">Acquired Force</span>
                    <span className="text-xs font-black text-white">{activeSirdar.troopForce}</span>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handleTransferPactBenefits}
                    className="py-3 px-8 bg-saffron hover:bg-yellow-500 text-stone-950 font-serif font-black uppercase text-xs tracking-widest rounded-sm cursor-pointer"
                  >
                    CONCLUDE NEGOTIATIONS
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
