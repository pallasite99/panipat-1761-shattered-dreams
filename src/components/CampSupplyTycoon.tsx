import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Sun, ShieldAlert, Heart, Coins, Flame, ChevronRight, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface CampSupplyTycoonProps {
  onClose: () => void;
  onApplyRewards: (rewards: { gold: number; provisions: number; morale: number; text: string }) => void;
}

interface CampEvent {
  title: string;
  description: string;
  choices: {
    label: string;
    consequence: string;
    action: (state: any) => any;
  }[];
}

const WINTER_STORM_EVENTS: CampEvent[] = [
  {
    title: "The Kunjpura Frost Gale",
    description: "A sudden freezing weather front has swept down from Lahore, causing camp temperatures to crash. Shivering pilgrims are burning wagon wheels to stay warm.",
    choices: [
      {
        label: "Release 50 bundles of Firewood Logs",
        consequence: "Keep the tents warm. Morale boosted, but log reserves will plunge.",
        action: (s) => ({ ...s, logs: Math.max(0, s.logs - 50), morale: Math.min(100, s.morale + 15) })
      },
      {
        label: "Distribute emergency treasury silver blankets",
        consequence: "Purchase woolen shawls from local merchants (-5,000 gold). Saves firewood.",
        action: (s) => ({ ...s, gold: Math.max(0, s.gold - 5000), morale: Math.min(100, s.morale + 10) })
      },
      {
        label: "Order strict firewood rationing",
        consequence: "Conserve key logs, but some pilgrims fall sick inside the mud trenches.",
        action: (s) => ({ ...s, morale: Math.max(10, s.morale - 15) })
      }
    ]
  },
  {
    title: "Sirhind Food Convoy Detour",
    description: "Sardar Alha Singh sent a grain cart caravan, but Rohilla scouts have occupied the bridges. We can pay mercenary sirdars to clear themes or sneak them.",
    choices: [
      {
        label: "Bribe guards with treasury gold",
        consequence: "Spend -6,000 gold Mohurs to bypass the outposts, successfully recovering 80 bags of grain.",
        action: (s) => ({ ...s, gold: Math.max(0, s.gold - 6000), grain: s.grain + 80, morale: Math.min(100, s.morale + 5) })
      },
      {
        label: "Deploy combat guard troops to escort",
        consequence: "Armed escort succeeds, but troops suffer fatigue (-15 guard stamina). Gain 80 grain bags.",
        action: (s) => ({ ...s, stamina: Math.max(10, s.stamina - 15), grain: s.grain + 80 })
      },
      {
        label: "Abandon the caravan path",
        consequence: "No gold or troop risk, but the food is plundered by Abdali scouts.",
        action: (s) => ({ ...s, morale: Math.max(10, s.morale - 10) })
      }
    ]
  },
  {
    title: "Starving Pilgrim Ration Riot",
    description: "A rumor that military captains are hoarding ghee and wheat has caused a frantic crowd to assemble before the primary warehouse gates.",
    choices: [
      {
        label: "Open the Soup Kitchens (+80 Grain)",
        consequence: "Feed the families generously. Consumes -80 Grain bags, but yields massive camp cheer.",
        action: (s) => ({ ...s, grain: Math.max(0, s.grain - 80), morale: Math.min(100, s.morale + 20) })
      },
      {
        label: "Politely pacify crowds with gold pieces",
        consequence: "Distribute -4,000 cash coins to pacify the riots without opening the granaries.",
        action: (s) => ({ ...s, gold: Math.max(0, s.gold - 4000), morale: Math.min(100, s.morale + 10) })
      },
      {
        label: "Lock warehouses behind heavy iron bayonets",
        consequence: "Retain complete food vaults, but trigger intense camp sorrow and desertions.",
        action: (s) => ({ ...s, stamina: Math.max(10, s.stamina - 10), morale: Math.max(10, s.morale - 20) })
      }
    ]
  },
  {
    title: "Bitter Frostbite Epidemic",
    description: "Dumbfounding cold has caused an outbreak of frostbite inside the southern trenches. Parvatibai requested dedicated medical tents built.",
    choices: [
      {
        label: "Erect heated medical shelters",
        consequence: "Consumes -40 logs and -3,000 gold. Heals the sick completely.",
        action: (s) => ({ ...s, logs: Math.max(0, s.logs - 40), gold: Math.max(0, s.gold - 3000), morale: Math.min(100, s.morale + 15) })
      },
      {
        label: "Order troops to share campfire quarters",
        consequence: "Conserves logs, but decreases overall troop readiness and stamina (-15).",
        action: (s) => ({ ...s, stamina: Math.max(10, s.stamina - 15), morale: Math.min(100, s.morale + 5) })
      }
    ]
  }
];

export const CampSupplyTycoon: React.FC<CampSupplyTycoonProps> = ({
  onClose,
  onApplyRewards
}) => {
  // Campaign simulation numbers
  const [day, setDay] = useState<number>(1);
  const [grain, setGrain] = useState<number>(240);
  const [logs, setLogs] = useState<number>(180);
  const [gold, setGold] = useState<number>(25000);
  const [temperature, setTemperature] = useState<number>(18); // Fahrenheit
  const [morale, setMorale] = useState<number>(70); // Pilgrim Morale
  const [stamina, setStamina] = useState<number>(75); // Troop Guard readiness
  
  // Daily Allocations Policies
  const [rationLevel, setRationLevel] = useState<'Normal' | 'Generous' | 'Rationed'>('Normal');
  const [heatLevel, setHeatLevel] = useState<'Full campfires' | 'Moderate heat' | 'Smothered coals'>('Moderate heat');
  
  // High cold-front event tracking
  const [activeEvent, setActiveEvent] = useState<CampEvent | null>(WINTER_STORM_EVENTS[0]);
  const [eventResolved, setEventResolved] = useState<boolean>(false);
  const [sysLogs, setSysLogs] = useState<string[]>([
    "Queen Parvatibai commissions the auxiliary ration office."
  ]);

  const [phase, setPhase] = useState<'play' | 'over'>('play');

  // Load new daily events
  useEffect(() => {
    if (day > 1 && day <= 4) {
      setActiveEvent(WINTER_STORM_EVENTS[day - 1]);
      setEventResolved(false);
    } else if (day === 5) {
      setActiveEvent({
        title: "The Ultimate Blizzards of Panipat Core",
        description: "The final frostwave approaches. Outer water channels are frozen solid. Survival depends on whatever remains of our wood and food stores.",
        choices: [
          {
            label: "Sustain the final overnight watch",
            consequence: "Throw everything into camp heating and food distribution.",
            action: (s) => ({ ...s })
          }
        ]
      });
      setEventResolved(false);
    }
  }, [day]);

  // Handle purchases from local Sikh or regional scouts
  const buyBazaarGoods = (type: 'grain' | 'logs') => {
    if (type === 'grain') {
      if (gold < 4000) return;
      setGold(prev => prev - 4000);
      setGrain(prev => prev + 60);
      setSysLogs(prev => ["✓ Purchased 60 bags of grain from regional Punjabi scouts for 4,000 gold Mohurs.", ...prev]);
    } else {
      if (gold < 3000) return;
      setGold(prev => prev - 3000);
      setLogs(prev => prev + 50);
      setSysLogs(prev => ["✓ Purchased 50 firewood bundles from local farm wagon drivers for 3,000 gold Mohurs.", ...prev]);
    }
  };

  const executeChoice = (choice: any) => {
    const nextState = choice.action({ grain, logs, gold, stamina, morale });
    setGrain(nextState.grain);
    setLogs(nextState.logs);
    setGold(nextState.gold);
    setStamina(nextState.stamina);
    setMorale(nextState.morale);
    setEventResolved(true);
    setSysLogs(prev => [`Event resolved: ${choice.label}`, ...prev]);
  };

  // End Day and update logs/morale
  const handleEndCampaignDay = () => {
    if (!eventResolved) {
      alert("Please resolve the active daily crisis before retiring to your quarters.");
      return;
    }

    // Daily consumption calculations
    let grainConsumed = 35;
    let moraleShift = 0;
    let staminaShift = 0;

    if (rationLevel === 'Generous') {
      grainConsumed = 55;
      moraleShift += 12;
      staminaShift += 10;
    } else if (rationLevel === 'Rationed') {
      grainConsumed = 20;
      moraleShift -= 15;
      staminaShift -= 8;
    }

    let logsConsumed = 30;
    if (heatLevel === 'Full campfires') {
      logsConsumed = 50;
      moraleShift += 10;
    } else if (heatLevel === 'Smothered coals') {
      logsConsumed = 15;
      moraleShift -= 15;
      staminaShift -= 5;
    }

    // Temperature impact
    const nextTemp = Math.floor(Math.random() * 14) + 6; // 6 to 20 Fahrenheit
    if (nextTemp < 12) {
      moraleShift -= 8;
      staminaShift -= 8;
      setSysLogs(prev => ["❄️ Intense frost gale penetrates the canvas tents! Shivering families suffer.", ...prev]);
    }

    const updatedGrain = Math.max(0, grain - grainConsumed);
    const updatedLogs = Math.max(0, logs - logsConsumed);
    const updatedMorale = Math.max(0, Math.min(100, morale + moraleShift));
    const updatedStamina = Math.max(0, Math.min(100, stamina + staminaShift));

    setGrain(updatedGrain);
    setLogs(updatedLogs);
    setMorale(updatedMorale);
    setStamina(updatedStamina);
    setTemperature(nextTemp);

    setSysLogs(prev => [
      `End of Day ${day}: Consumed ${grainConsumed} grain packs & ${logsConsumed} logs.`,
      ...prev
    ]);

    // Check Win/Loss
    if (updatedMorale <= 15 || updatedStamina <= 15) {
      setPhase('over');
      return;
    }

    if (day >= 5) {
      setPhase('over');
    } else {
      setDay(prev => prev + 1);
    }
  };

  const handleClaimTycoonOutcome = () => {
    const isSuccess = morale > 30 && stamina > 30;

    if (isSuccess) {
      onApplyRewards({
        gold: gold, // transfer rest of reserves
        provisions: grain + 150, // transfer remaining grain as general grain
        morale: morale * 0.4, // boost army general morale based on survival morale
        text: `Surviving Queen Parvatibai's Winter Tycoon: Camp secured and winter base survived! Transferred grain as provisions and bolstered general troops (+${(morale*0.4).toFixed(0)}% Morale).`
      });
    } else {
      onApplyRewards({
        gold: 0,
        provisions: 0,
        morale: -15,
        text: "Winter Tycoon Demise: Starving families broke defenses; camp disintegrated in freezing blizzard (-15% Morale)."
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4">
      <div id="camp-tycoon-modal" className="w-full max-w-4xl bg-[#1d1612] border-4 border-[#8B5E3C] shadow-3xl rounded-sm text-[#F3E5AB] font-sans flex flex-col max-h-[92vh]">
        
        {/* Header styling */}
        <div className="p-4 border-b border-[#8B5E3C]/30 bg-stone-950 flex justify-between items-center font-serif">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❄️</span>
            <div className="text-left">
              <h3 className="text-lg font-black uppercase text-saffron tracking-widest">Emergency Camp Supply Tycoon</h3>
              <p className="text-[10px] text-stone-400 font-sans italic">"expand parvatibai's ration depot and steer 50,000 non-combatants through sub-zero blizzards"</p>
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

        {phase === 'play' ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5">
            
            {/* HUD dashboard metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-stone-950 p-2 border border-stone-850 rounded-sm text-left">
                <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold">Campaign Day</span>
                <span className="text-md font-serif font-black text-white">{day} of 5 (Frozen)</span>
              </div>
              <div className="bg-stone-950 p-2 border border-stone-850 rounded-sm text-left">
                <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold">Grain Storage Bags</span>
                <span className="text-md font-serif font-black text-white flex items-center gap-1">
                  <Package size={12} className="text-amber-500" />
                  {grain} Bags
                </span>
              </div>
              <div className="bg-stone-950 p-2 border border-stone-850 rounded-sm text-left">
                <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold">Firewood Logs</span>
                <span className="text-md font-serif font-black text-white flex items-center gap-1">
                  <Flame size={12} className="text-orange-500" />
                  {logs} Bundles
                </span>
              </div>
              <div className="bg-stone-950 p-2 border border-stone-850 rounded-sm text-left">
                <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold font-sans">Camp Temp</span>
                <span className="text-md font-serif font-black text-blue-400">{temperature}°F (Frost)</span>
              </div>
              <div className="bg-stone-950 p-2 border border-stone-850 rounded-sm text-left">
                <span className="text-[8px] text-stone-500 uppercase block font-mono font-bold">Silver Mohurs</span>
                <span className="text-md font-serif font-black text-saffron">{gold.toLocaleString()} M</span>
              </div>
            </div>

            {/* Survivor Health sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-950/60 p-3.5 border border-stone-850 rounded-sm">
              <div className="text-left">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-stone-300 font-bold uppercase tracking-wider font-mono">1. Pilgrim Morale</span>
                  <span className="font-mono text-xs text-white">{morale}% Stagger</span>
                </div>
                <div className="w-full bg-stone-950 h-2.5 rounded-sm overflow-hidden border border-stone-850">
                  <div 
                    className={`h-full transition-all duration-300 ${morale > 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${morale}%` }}
                  />
                </div>
              </div>

              <div className="text-left">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-stone-300 font-bold uppercase tracking-wider font-mono">2. Front Guard Stamina</span>
                  <span className="font-mono text-xs text-white">{stamina}% Combat State</span>
                </div>
                <div className="w-full bg-stone-950 h-2.5 rounded-sm overflow-hidden border border-stone-850">
                  <div 
                    className={`h-full transition-all duration-300 ${stamina > 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${stamina}%` }}
                  />
                </div>
              </div>
            </div>

            {/* active day crisis events card */}
            <div className="bg-stone-950 p-4 border border-stone-800 rounded-sm text-left">
              <div className="flex items-center gap-1.5 border-b border-stone-900 pb-2 mb-3">
                <AlertCircle size={14} className="text-saffron shrink-0" />
                <h4 className="font-serif font-extrabold text-[#F3E5AB] text-xs uppercase tracking-wider">
                  DAY {day} CAMP CRISIS: {activeEvent?.title}
                </h4>
              </div>

              <p className="text-xs leading-relaxed font-sans text-stone-300 mb-4 italic">
                "{activeEvent?.description}"
              </p>

              {eventResolved ? (
                <div className="p-3 bg-emerald-950/30 border border-emerald-900 border-dashed rounded-xs text-[11px] text-emerald-400 font-serif italic text-center">
                  This crisis is handled. Review your resource quotas and bazaar purchases below before concluding this cold cycle!
                </div>
              ) : (
                <div className="space-y-2">
                  {activeEvent?.choices.map((choice, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => executeChoice(choice)}
                      className="w-full p-2.5 bg-[#261d15] hover:bg-[#34271c] border border-[#8B5E3C]/40 text-left rounded-sm transition-all text-xs font-serif text-stone-250 hover:text-saffron cursor-pointer"
                    >
                      <div className="font-bold flex items-center gap-1.5 uppercase">
                        <ChevronRight size={12} className="text-saffron" />
                        {choice.label}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1 leading-normal font-sans pl-3.5 italic">{choice.consequence}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Daily allocations distribution panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Controls */}
              <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm text-left space-y-4">
                <h5 className="font-serif font-black text-xs text-saffron uppercase tracking-wider">Quota Allocations Stance</h5>
                
                <div>
                  <span className="text-[8px] font-mono text-stone-500 uppercase block font-bold mb-1.5">Ration distribution level</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'Rationed', icon: '🥣' },
                      { key: 'Normal', icon: '🍞' },
                      { key: 'Generous', icon: '🍛' }
                    ].map(lvl => (
                      <button
                        key={lvl.key}
                        type="button"
                        onClick={() => setRationLevel(lvl.key as any)}
                        className={`p-2 border text-[10px] uppercase font-mono font-bold rounded-xs cursor-pointer flex flex-col items-center gap-1 ${rationLevel === lvl.key ? 'border-saffron bg-saffron/10 text-saffron' : 'border-stone-800 bg-stone-900 text-stone-400'}`}
                      >
                        <span>{lvl.icon}</span>
                        <span>{lvl.key}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[8px] font-mono text-stone-500 uppercase block font-bold mb-1.5">Camp Firewood Quota</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'Smothered coals', icon: '🪵' },
                      { key: 'Moderate heat', icon: '🪵🪵' },
                      { key: 'Full campfires', icon: '🔥' }
                    ].map(lvl => (
                      <button
                        key={lvl.key}
                        type="button"
                        onClick={() => setHeatLevel(lvl.key as any)}
                        className={`p-2 border text-[10px] uppercase font-mono font-bold rounded-xs cursor-pointer flex flex-col items-center gap-1 ${heatLevel === lvl.key ? 'border-saffron bg-saffron/10 text-saffron' : 'border-stone-800 bg-stone-900 text-stone-400'}`}
                      >
                        <span>{lvl.icon}</span>
                        <span>{lvl.key.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Purchase Bazaar panel */}
              <div className="bg-stone-950 p-4 border border-stone-850 rounded-sm text-left flex flex-col justify-between">
                <div>
                  <h5 className="font-serif font-black text-xs text-saffron uppercase tracking-wider">Bazaar foraging trades</h5>
                  <p className="text-[10px] text-stone-500 mt-1 leading-snug">Exchange Silver Mohurs with regional merchants traveling along the Ganga canals to restock.</p>
                </div>

                <div className="space-y-2 mt-4">
                  <button
                    type="button"
                    disabled={gold < 4000}
                    onClick={() => buyBazaarGoods('grain')}
                    className="w-full p-2 bg-stone-900 hover:bg-[#201d1c]/50 border border-stone-800 rounded-sm text-left flex justify-between items-center text-xs tracking-wide cursor-pointer disabled:opacity-30"
                  >
                    <div>
                      <span className="font-serif font-bold text-white block">🍙 FORAGE GRAIN SACKS</span>
                      <span className="text-[9px] text-stone-400 font-sans">+60 deep grain sacks</span>
                    </div>
                    <span className="text-saffron font-bold text-[10px]">-4,000 M</span>
                  </button>

                  <button
                    type="button"
                    disabled={gold < 3000}
                    onClick={() => buyBazaarGoods('logs')}
                    className="w-full p-2 bg-stone-900 hover:bg-[#201d1c]/50 border border-stone-800 rounded-sm text-left flex justify-between items-center text-xs tracking-wide cursor-pointer disabled:opacity-30"
                  >
                    <div>
                      <span className="font-serif font-bold text-white block">🪵 FORAGE FIREWOOD EXTRA</span>
                      <span className="text-[9px] text-stone-400 font-sans">+50 timber bundles</span>
                    </div>
                    <span className="text-saffron font-bold text-[10px]">-3,000 M</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Scribe Event logs list */}
            <div className="bg-stone-950 p-3 h-20 border border-stone-850 overflow-y-auto text-left rounded-sm font-mono text-[9px] text-stone-400 space-y-0.5 leading-relaxed">
              <span className="text-stone-500 uppercase block font-black border-b border-stone-900 pb-1 mb-1">Winter Depot Scribe Chronicle:</span>
              {sysLogs.map((log, idx) => (
                <div key={idx}>» {log}</div>
              ))}
            </div>

            {/* Transition trigger */}
            <div className="pt-2 border-t border-stone-900 flex justify-end">
              <button
                type="button"
                onClick={handleEndCampaignDay}
                className="px-6 py-2 bg-saffron hover:bg-yellow-500 text-stone-950 font-serif font-black uppercase text-xs tracking-widest rounded-sm cursor-pointer shadow-md transition-all active:scale-[0.98]"
              >
                End Winter Day {day} 🌙
              </button>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-saffron/10 border border-saffron rounded-full flex items-center justify-center mx-auto text-3xl">
              🌨️
            </div>
            
            <div className="max-w-md mx-auto text-center space-y-2">
              <h4 className="font-serif text-lg font-black uppercase tracking-wider text-white">
                {morale > 30 && stamina > 30 ? 'SURVIVED THE FREEZING MARCH!' : 'CAMP CONSTITUENTS DEFEATED'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                {morale > 30 && stamina > 30 
                  ? `With exquisite calculations and generous food networks, you kept the mud fortification warm and secure. The pilgrims prayed, and Vishwasrao's lines stand solid for the final clash!`
                  : `Bitter sub-zero blizzards completely overwhelmed the rampart defenses. With zero fuel and rotten flour sacks, families fled, leaving defenses collapsed under Afghan snow drills.`}
              </p>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-850 rounded-xs flex gap-4 max-w-sm mx-auto text-left font-mono">
              <div>
                <span className="text-[8px] text-stone-500 uppercase block">Pilgrim Trust</span>
                <span className="text-sm font-black text-white">{morale}% Rating</span>
              </div>
              <div className="w-px h-8 bg-stone-900" />
              <div>
                <span className="text-[8px] text-stone-500 uppercase block">Treasury Left</span>
                <span className="text-sm font-black text-saffron">{gold} M</span>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={handleClaimTycoonOutcome}
                className="py-3 px-8 bg-saffron hover:bg-yellow-500 text-stone-950 font-serif font-black uppercase text-xs tracking-widest rounded-sm cursor-pointer shadow-md"
              >
                CONCLUDE SUPPLY TYCOON
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
