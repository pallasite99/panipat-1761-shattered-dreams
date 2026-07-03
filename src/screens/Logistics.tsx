import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Wheat, 
  Zap, 
  Truck, 
  Box, 
  Users, 
  Award, 
  Compass, 
  Coins, 
  ShieldCheck, 
  Flame, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Screen } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

interface HistoricalUnit {
  id: string;
  name: string;
  type: 'cavalry' | 'infantry' | 'artillery' | 'guerrilla';
  cost: number;
  foodCost: number;
  combatPower: number;
  statBonus: string;
  avatar: string;
  description: string;
}

const HISTORICAL_ROSTER: HistoricalUnit[] = [
  {
    id: 'huzurat_cav',
    name: 'Huzurat Royal Cavalry',
    type: 'cavalry',
    cost: 45000,
    foodCost: 65,
    combatPower: 45,
    statBonus: '+15% Clash Damage, +10% Speed',
    avatar: 'https://images.unsplash.com/photo-1598618417082-96541f926b14?q=80&w=300&auto=format&fit=crop',
    description: 'The elite heavy broadsword lancers of the Peshwa. Draped in chainmail, these heavy riders make thundering charges that crack infantry lines.'
  },
  {
    id: 'gardi_musk',
    name: 'Gardi French Musketeers',
    type: 'infantry',
    cost: 35000,
    foodCost: 45,
    combatPower: 38,
    statBonus: '+20% Fire Accuracy, +15% Cohesion',
    avatar: 'https://images.unsplash.com/photo-1590766244534-7389814407ce?q=80&w=300&auto=format&fit=crop',
    description: 'Disciplined infantry trained in European-style square formations by General Ibrahim Khan Gardi. Equipped with flintlocks and bayonets.'
  },
  {
    id: 'brass_siege',
    name: 'Brass Imperial Artillery',
    type: 'artillery',
    cost: 55000,
    foodCost: 80,
    combatPower: 50,
    statBonus: '+25% Long-range Bombardment, -5% Army Speed',
    avatar: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=300&auto=format&fit=crop',
    description: 'Massive caliber bronze and iron-shot artillery. Requires slow supply ox-carts but shatters Afghan-Rohilla clay fortifications instantly.'
  },
  {
    id: 'bundela_horse',
    name: 'Bundelkhand Guerrilla Riders',
    type: 'guerrilla',
    cost: 25000,
    foodCost: 30,
    combatPower: 26,
    statBonus: '+30% Foraging Yields, +15% Critical Chance',
    avatar: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=300&auto=format&fit=crop',
    description: 'Highly agile riders trained in "Ganimi Kava". They harass isolated enemy caravans and secure critical food paths near the rivers.'
  },
  {
    id: 'rohilla_def_inf',
    name: 'Rohilla Defector Vanguard',
    type: 'infantry',
    cost: 20000,
    foodCost: 25,
    combatPower: 22,
    statBonus: '+10% Melee Strike, +15% Desert Cover',
    avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop',
    description: 'Hardened regional footmen who have defected for gold. Exceptionally skilled with curved swords and fighting in dry brush plains.'
  }
];

export const Logistics: React.FC<{ 
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose, onHelp, onSettings }) => {
  React.useEffect(() => {
    const savedStage = localStorage.getItem('panipat_campaign_stage') || 'nizam_campaign';
    localStorage.setItem(`cleared_logistics_${savedStage}`, 'true');
  }, []);

  // Sync core economic stats with localStorage
  const [treasuryMohurs, setTreasuryMohurs] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_treasury');
    return saved ? Number(saved) : 145000;
  });
  const [provisions, setProvisions] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_provisions');
    return saved ? Number(saved) : 385;
  });
  const [morale, setMorale] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_morale');
    return saved ? Number(saved) : 75;
  });

  // Track recruited unit IDs
  const [recruitedUnitIds, setRecruitedUnitIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('panipat_campaign_recruited_troops');
    return saved ? JSON.parse(saved) : ['huzurat_cav']; // Default recruited
  });

  // Track tactical training rank level
  const [drillLevel, setDrillLevel] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_drill_level');
    return saved ? Number(saved) : 1;
  });

  const [activeTab, setActiveTab] = useState<'recruitment' | 'depot'>('recruitment');
  const [log, setLog] = useState<string[]>([
    "⚔️ [LOGISTICS STANDING] Ready to review vanguard forces and dispatch supply caravan commands."
  ]);

  // Track active season and equipment states
  const [activeSeason, setActiveSeason] = useState<'winter' | 'monsoon' | 'summer'>('winter');
  const [hasWinterWoolens, setHasWinterWoolens] = useState<boolean>(() => {
    return localStorage.getItem('panipat_equipment_winter_woolens') === 'true';
  });
  const [hasMonsoonTarps, setHasMonsoonTarps] = useState<boolean>(() => {
    return localStorage.getItem('panipat_equipment_monsoon_tarps') === 'true';
  });
  const [hasSummerWells, setHasSummerWells] = useState<boolean>(() => {
    return localStorage.getItem('panipat_equipment_summer_wells') === 'true';
  });

  // Save states to localStorage whenever they modify
  useEffect(() => {
    localStorage.setItem('panipat_campaign_treasury', treasuryMohurs.toString());
  }, [treasuryMohurs]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_provisions', provisions.toString());
  }, [provisions]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_morale', morale.toString());
  }, [morale]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_recruited_troops', JSON.stringify(recruitedUnitIds));
  }, [recruitedUnitIds]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_drill_level', drillLevel.toString());
  }, [drillLevel]);

  useEffect(() => {
    localStorage.setItem('panipat_equipment_winter_woolens', hasWinterWoolens.toString());
  }, [hasWinterWoolens]);

  useEffect(() => {
    localStorage.setItem('panipat_equipment_monsoon_tarps', hasMonsoonTarps.toString());
  }, [hasMonsoonTarps]);

  useEffect(() => {
    localStorage.setItem('panipat_equipment_summer_wells', hasSummerWells.toString());
  }, [hasSummerWells]);

  const buyEquipment = (equip: 'winter' | 'monsoon' | 'summer') => {
    if (equip === 'winter') {
      if (hasWinterWoolens) return;
      if (treasuryMohurs < 18000) {
        setLog(prev => ["❌ [UPKEEP FAILURE] Insufficient Mohurs to procure Winter Woolen Capes! (Needs 18,000 Mohurs)", ...prev.slice(0, 5)]);
        return;
      }
      setTreasuryMohurs(prev => prev - 18000);
      setHasWinterWoolens(true);
      setMorale(prev => Math.min(100, prev + 15));
      setLog(prev => ["❄️ [EQUIPMENT ACQUIRED] Distributed thick winter woolen blanketing and heavy Capes to all front divisions! Winter fog penalty diminished, Morale +15.", ...prev.slice(0, 5)]);
    } else if (equip === 'monsoon') {
      if (hasMonsoonTarps) return;
      if (treasuryMohurs < 15000) {
        setLog(prev => ["❌ [UPKEEP FAILURE] Insufficient Mohurs to install elevated Monsoon Tarps! (Needs 15,000 Mohurs)", ...prev.slice(0, 5)]);
        return;
      }
      setTreasuryMohurs(prev => prev - 15000);
      setHasMonsoonTarps(true);
      setMorale(prev => Math.min(100, prev + 10));
      setLog(prev => ["☔ [EQUIPMENT ACQUIRED] Constructed raised Monsoonal Grain Depots and tarpaulin covers! Saved food caravan rot, Monsoon rain penalty diminished, Morale +10.", ...prev.slice(0, 5)]);
    } else if (equip === 'summer') {
      if (hasSummerWells) return;
      if (treasuryMohurs < 12000) {
        setLog(prev => ["❌ [UPKEEP FAILURE] Insufficient Mohurs to excavate deep Well Networks! (Needs 12,000 Mohurs)", ...prev.slice(0, 5)]);
        return;
      }
      setTreasuryMohurs(prev => prev - 12000);
      setHasSummerWells(true);
      setMorale(prev => Math.min(100, prev + 12));
      setLog(prev => ["☀️ [EQUIPMENT ACQUIRED] Excavated high-capacity deep step-wells across the camp sector! Dehydration minimized, Summer heatwave penalty diminished, Morale +12.", ...prev.slice(0, 5)]);
    }
  };

  // Recruits a specific battalion
  const handleRecruit = (unit: HistoricalUnit) => {
    if (recruitedUnitIds.includes(unit.id)) {
      setLog(prev => [`⚠️ [DUPLICATE] The noble ${unit.name} is already stationed at our front division!`, ...prev.slice(0, 5)]);
      return;
    }
    if (treasuryMohurs < unit.cost) {
      setLog(prev => [`❌ [TREASURY FAILURE] Not enough gold Mohurs to enroll ${unit.name}! Requires ${unit.cost.toLocaleString()} Mohurs.`, ...prev.slice(0, 5)]);
      return;
    }
    if (provisions < unit.foodCost) {
      setLog(prev => [`❌ [FOOD SHORTAGE] Insufficient grain food caravans to feed ${unit.name}! Requires ${unit.foodCost} Tons.`, ...prev.slice(0, 5)]);
      return;
    }

    setTreasuryMohurs(prev => prev - unit.cost);
    setProvisions(prev => prev - unit.foodCost);
    setRecruitedUnitIds(prev => [...prev, unit.id]);
    setMorale(prev => Math.min(100, prev + 12));
    
    setLog(prev => [
      `🏆 [RECRUITS SECURED] Successfully inducted ${unit.name} into our legion vanguard! Gained ${unit.combatPower} Tactical Impact points.`,
      `💰 Spent ${unit.cost.toLocaleString()} Mohurs and ${unit.foodCost} Tons which was deducted directly from your Campaign Reserves.`,
      ...prev.slice(0, 5)
    ]);
  };

  // Upgrades overall army drill level
  const triggerTacticalDrill = () => {
    const costProvisions = 55 + drillLevel * 20;
    const costGold = 10000 + drillLevel * 5000;

    if (provisions < costProvisions) {
      setLog(prev => [`❌ [DRILL FAILURE] Insufficient food grain to sustain rigid physical combat drills! Needs ${costProvisions} Tons.`, ...prev.slice(0, 5)]);
      return;
    }
    if (treasuryMohurs < costGold) {
      setLog(prev => [`❌ [DRILL FAILURE] Insufficient gold funds to pay military overseers and trainers! Needs ${costGold.toLocaleString()} Mohurs.`, ...prev.slice(0, 5)]);
      return;
    }

    setProvisions(prev => prev - costProvisions);
    setTreasuryMohurs(prev => prev - costGold);
    setDrillLevel(prev => prev + 1);
    setMorale(prev => Math.min(100, prev + 15));

    setLog(prev => [
      `⭐ [TACTICAL UPGRADE] Generalissimo Sadashivrao Bhau inspects a massive military training program! Regimental Drill Level raised to Tier ${drillLevel + 1}!`,
      `🛡️ Frontline units Cohesion and combat accuracy are substantially fortified (+10% permanent battle accuracy boost).`,
      ...prev.slice(0, 5)
    ]);
  };

  // Requisitions quick emergency supply chests
  const requisitionSupply = (type: 'grain' | 'powder') => {
    const cost = type === 'grain' ? 15000 : 20000;
    if (treasuryMohurs < cost) {
      setLog(prev => [`❌ [REQUISITION ERROR] Not enough central funds to finance this supply purchase!`, ...prev.slice(0, 5)]);
      return;
    }

    setTreasuryMohurs(prev => prev - cost);
    if (type === 'grain') {
      setProvisions(prev => prev + 120);
      setLog(prev => [`🌾 [SUPPLY FLOWS] Requisitioned rapid central grain bags from surrounding local farmlands! Added +120 Tons grain.`, ...prev.slice(0, 5)]);
    } else {
      setLog(prev => [`⚡ [SUPPLY FLOWS] Purchased emergency gunpowder kegs from the royal mint stores! Added +40 Blackpowder barrels.`, ...prev.slice(0, 5)]);
    }
  };

  const calculateTotalPower = () => {
    const basePower = recruitedUnitIds.reduce((sum, id) => {
      const u = HISTORICAL_ROSTER.find(item => item.id === id);
      return sum + (u ? u.combatPower : 0);
    }, 0);
    return basePower + drillLevel * 15;
  };

  return (
    <div className="relative h-screen w-screen bg-stone-950 overflow-hidden font-sans">
      <TopBar screen={Screen.LOGISTICS} onNavigate={onNavigate} onToggleMenu={onToggleMenu} onHelp={onHelp} onSettings={onSettings} />
      <SideNav screen={Screen.LOGISTICS} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />
      
      <main className="lg:pl-64 pt-16 h-[calc(100vh-4rem)] overflow-y-auto bg-stone-950 custom-scrollbar relative">
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-fixed"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549673967-893bd5798485?q=80&w=1500&auto=format&fit=crop')" }}
        />
        
        <div className="p-4 md:p-12 space-y-8 relative z-10">
          
          {/* Header Title & Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-white uppercase tracking-widest flex items-center gap-3">
                <Layers size={28} className="text-saffron" /> 
                <span>Vanguard Regiments & Logistics</span>
              </h2>
              <p className="text-stone-400 font-serif italic text-xs max-w-xl mt-1 leading-relaxed">
                "An iron soldier wins the skirmish, but the disciplined battalion backed by rolling food caravans and military drills secures the empire."
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-stone-900/90 border border-stone-850 p-3 rounded-xs font-mono">
              <span className="text-[10px] text-stone-500 uppercase font-black">Combat Power Index:</span>
              <span className="text-saffron font-serif font-black text-lg animate-pulse">{calculateTotalPower()} STR</span>
            </div>
          </div>

          {/* Quick HUD values */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-stone-900/60 p-4 border border-stone-850 rounded-xs">
            <div className="flex items-center gap-3 text-left">
              <Coins className="text-saffron" size={22} />
              <div>
                <span className="text-[8px] text-stone-500 uppercase block font-black">Treasury Gold</span>
                <span className="text-white text-md font-serif font-black">{treasuryMohurs.toLocaleString()} Mohurs</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <Wheat className="text-emerald-500" size={22} />
              <div>
                <span className="text-[8px] text-stone-500 uppercase block font-black">Grain Stocks</span>
                <span className="text-white text-md font-serif font-black">{provisions} Tons</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <Award className="text-amber-500" size={22} />
              <div>
                <span className="text-[8px] text-stone-500 uppercase block font-black">Tactical Combat Drills</span>
                <span className="text-saffron text-md font-serif font-black">Tier {drillLevel} Proficiency</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <Users className="text-teal-400" size={22} />
              <div>
                <span className="text-[8px] text-stone-500 uppercase block font-black">Active Battalions</span>
                <span className="text-white text-md font-serif font-black">{recruitedUnitIds.length} Regiments</span>
              </div>
            </div>
          </div>

          {/* Navigation Subtabs */}
          <div className="flex gap-2 border-b border-stone-850 pb-2">
            <button
              onClick={() => setActiveTab('recruitment')}
              className={`px-4 py-2 text-[10px] tracking-widest font-serif font-black uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'recruitment' ? 'bg-saffron text-stone-950 font-bold' : 'bg-stone-900 hover:bg-stone-850 text-stone-400'}`}
            >
              <Users size={12} /> Recruit Battalions
            </button>
            <button
              onClick={() => setActiveTab('depot')}
              className={`px-4 py-2 text-[10px] tracking-widest font-serif font-black uppercase rounded-xs transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'depot' ? 'bg-saffron text-stone-950 font-bold' : 'bg-stone-900 hover:bg-stone-850 text-stone-400'}`}
            >
              <Truck size={12} /> Requisitions & Drill Grounds
            </button>
          </div>

          {/* Core content switch */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Main interactive column */}
            <div className="lg:col-span-8 space-y-6">
              
              {activeTab === 'recruitment' ? (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-stone-850 pb-2">
                    <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest font-bold">REGIMENTAL ENROLLMENT REGISTRY</h3>
                    <span className="text-[9px] text-stone-500 font-mono">Cost is adjusted historically</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {HISTORICAL_ROSTER.map((unit) => {
                      const isEnrolled = recruitedUnitIds.includes(unit.id);
                      return (
                        <div 
                          key={unit.id}
                          className={`p-4 bg-stone-900/40 border transition-all rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isEnrolled ? 'border-saffron/40 bg-stone-900/70' : 'border-stone-850 hover:border-stone-700'}`}
                        >
                          <div className="flex items-start md:items-center gap-4 flex-1">
                            {/* Avatar placeholder / layout icon representing historical combatant */}
                            <div className="w-16 h-16 shrink-0 border border-stone-800 rounded-sm overflow-hidden relative bg-stone-950">
                              <span className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent z-10" />
                              <img src={unit.avatar} alt={unit.name} className="w-full h-full object-cover opacity-60" />
                              <div className="absolute bottom-1 left-1.5 z-25 text-[8px] font-mono text-saffron uppercase font-black">
                                {unit.type}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif text-base text-white tracking-wide font-black uppercase">{unit.name}</h4>
                                {isEnrolled && (
                                  <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase">
                                    ✓ Active Service
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-400 italic font-medium leading-relaxed">
                                "{unit.description}"
                              </p>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono uppercase text-stone-500">
                                <span>Tactical Power: <strong className="text-saffron">+{unit.combatPower} STR</strong></span>
                                <span>Synergy Alert: <strong className="text-white">{unit.statBonus}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 border-stone-950 pt-3 md:pt-0 gap-3">
                            <div className="text-left md:text-right font-mono">
                              <span className="text-[8px] text-stone-500 block uppercase font-bold">Required Investment:</span>
                              <div className="text-[10px] text-stone-300 space-y-0.5 font-bold">
                                <div className="flex items-center gap-1"><Coins size={10} className="text-saffron" /> {unit.cost.toLocaleString()} Mohurs</div>
                                <div className="flex items-center gap-1"><Wheat size={10} className="text-emerald-500" /> {unit.foodCost} Tons Rations</div>
                              </div>
                            </div>

                            <button
                              disabled={isEnrolled}
                              onClick={() => handleRecruit(unit)}
                              className={`px-4 py-2 font-mono text-[9px] font-black uppercase tracking-widest rounded-xs cursor-pointer w-full md:w-auto ${isEnrolled ? 'bg-stone-800 text-stone-500 border border-stone-850 cursor-not-allowed' : 'bg-saffron text-stone-950 hover:bg-amber-500 active:scale-95 transition-all'}`}
                            >
                              {isEnrolled ? "ENROLLED" : "⚔️ RECRUIT FORCE"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-stone-850 pb-2">
                    <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest font-bold">IMPERIAL LOGISTICAL ACTIONS</h3>
                    <span className="text-[9px] text-stone-500 font-mono">Exercise and secure supplies in winter</span>
                  </div>

                  {/* Campaign Season & Equipment Panel */}
                  <div className="bg-stone-905/40 border border-stone-850 p-5 rounded-xs space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <span className="text-[9px] text-saffron font-mono uppercase tracking-widest font-bold">
                          🌡️ CURRENT ENVIRONMENTAL THREAT ASSESSMENT
                        </span>
                        <h4 className="font-serif text-base text-white uppercase font-black tracking-tight">
                          Active Campaign Season Simulation
                        </h4>
                      </div>
                      
                      {/* Season Switcher */}
                      <div className="flex bg-stone-950 p-1 border border-stone-850 rounded-xs self-start">
                        {[
                          { id: 'winter', label: '❄️ Winter Frost' },
                          { id: 'monsoon', label: '☔ Monsoon Deluge' },
                          { id: 'summer', label: '☀️ Scorching Summer' }
                        ].map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setActiveSeason(s.id as any)}
                            className={`px-3 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded-xs transition-all cursor-pointer ${activeSeason === s.id ? 'bg-saffron text-stone-950 font-black' : 'text-stone-400 hover:text-stone-200'}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* Active Season Threat description Card */}
                      <div className="p-4 bg-stone-950 border border-stone-850 rounded-xs space-y-3 md:col-span-1">
                        <span className="text-[8px] font-mono font-bold text-stone-500 uppercase tracking-widest block">
                          ENVIRONMENTAL EFFECT
                        </span>
                        {activeSeason === 'winter' && (
                          <div className="space-y-1.5">
                            <h5 className="font-serif font-black text-xs text-sky-400 uppercase">Winter Cold & Frost</h5>
                            <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                              Sub-zero freezes over the Yamuna and frosted morning fog cuts musket sightlines. Demands thick blanketing to prevent heavy upkeep leaks.
                            </p>
                            <span className="block text-[9px] font-mono text-rose-500 font-bold uppercase">
                              ⚠️ Attrition Penalty: -20 Tons Food Upkeep
                            </span>
                          </div>
                        )}
                        {activeSeason === 'monsoon' && (
                          <div className="space-y-1.5">
                            <h5 className="font-serif font-black text-xs text-indigo-400 uppercase">Monsoon River Swell</h5>
                            <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                              Flooding clay banks and muddy roads delay standard supply wagons. Moisture ruins standard blackpowder paper containers.
                            </p>
                            <span className="block text-[9px] font-mono text-rose-500 font-bold uppercase">
                              ⚠️ Attrition Penalty: -30% Total Vanguard Power
                            </span>
                          </div>
                        )}
                        {activeSeason === 'summer' && (
                          <div className="space-y-1.5">
                            <h5 className="font-serif font-black text-xs text-amber-500 uppercase">Scorching Dry Heat</h5>
                            <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                              Excessive deccan sun dehydration and dry dust winds drain vanguard horses. Demands deep field well networks to preserve cohesion.
                            </p>
                            <span className="block text-[9px] font-mono text-rose-500 font-bold uppercase">
                              ⚠️ Attrition Penalty: -15 Camp Morale Limit
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Equipment Countermeasure Acquisition block */}
                      <div className="p-4 bg-stone-950 border border-stone-850 rounded-xs space-y-3 md:col-span-2">
                        <span className="text-[8px] font-mono font-bold text-stone-500 uppercase tracking-widest block">
                          EQUIPMENT COUNTERMEASURE
                        </span>
                        
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          {activeSeason === 'winter' && (
                            <div className="space-y-1 flex-1">
                              <h5 className="font-serif font-black text-xs text-white uppercase flex items-center gap-1.5">
                                🧥 Thick Winter Woolen Capes & blankets
                              </h5>
                              <p className="text-[11px] text-stone-400 leading-relaxed">
                                Distributes authenticated heavy warm woolen capes to defend all combat columns. <strong>Bypasses winter fog combat accuracy penalties on battlefields!</strong>
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[9px] font-mono text-stone-500 uppercase">STATUS:</span>
                                {hasWinterWoolens ? (
                                  <span className="text-[9px] font-mono text-emerald-400 font-black uppercase">✓ PROCURED & DISTRIBUTED</span>
                                ) : (
                                  <span className="text-[9px] font-mono text-amber-600 font-bold uppercase">⚫ NOT ACQUIRED</span>
                                )}
                              </div>
                            </div>
                          )}

                          {activeSeason === 'monsoon' && (
                            <div className="space-y-1 flex-1">
                              <h5 className="font-serif font-black text-xs text-white uppercase flex items-center gap-1.5">
                                ⛺ Raised Monsoonal Tarpaulin Grain Depots
                              </h5>
                              <p className="text-[11px] text-stone-400 leading-relaxed">
                                Builds waterproof raised silos. <strong>Bypasses heavy rain slippage and cavalry speed penalties during battle!</strong>
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[9px] font-mono text-stone-500 uppercase">STATUS:</span>
                                {hasMonsoonTarps ? (
                                  <span className="text-[9px] font-mono text-emerald-400 font-black uppercase">✓ ESTABLISHED & SECURE</span>
                                ) : (
                                  <span className="text-[9px] font-mono text-amber-600 font-bold uppercase">⚫ NOT ACQUIRED</span>
                                )}
                              </div>
                            </div>
                          )}

                          {activeSeason === 'summer' && (
                            <div className="space-y-1 flex-1">
                              <h5 className="font-serif font-black text-xs text-white uppercase flex items-center gap-1.5">
                                🧱 Deep Step-Well Water Networks
                              </h5>
                              <p className="text-[11px] text-stone-400 leading-relaxed">
                                Excavates solid deep masonry wells throughout central base camps. <strong>Bypasses extreme heat hydration fatigue penalties on battlefields!</strong>
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[9px] font-mono text-stone-500 uppercase">STATUS:</span>
                                {hasSummerWells ? (
                                  <span className="text-[9px] font-mono text-emerald-400 font-black uppercase">✓ EXCAVATED & ACTIVE</span>
                                ) : (
                                  <span className="text-[9px] font-mono text-amber-600 font-bold uppercase">⚫ NOT ACQUIRED</span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="shrink-0">
                            {activeSeason === 'winter' && (
                              <button
                                type="button"
                                disabled={hasWinterWoolens}
                                onClick={() => buyEquipment('winter')}
                                className={`px-4 py-2 font-mono text-[9px] font-black uppercase tracking-wider rounded-xs cursor-pointer ${hasWinterWoolens ? 'bg-stone-900 text-stone-600 border border-stone-850 cursor-not-allowed' : 'bg-saffron text-stone-950 hover:bg-amber-400'}`}
                              >
                                {hasWinterWoolens ? "DISTRIBUTED" : "BUY FOR 18,000 M"}
                              </button>
                            )}
                            {activeSeason === 'monsoon' && (
                              <button
                                type="button"
                                disabled={hasMonsoonTarps}
                                onClick={() => buyEquipment('monsoon')}
                                className={`px-4 py-2 font-mono text-[9px] font-black uppercase tracking-wider rounded-xs cursor-pointer ${hasMonsoonTarps ? 'bg-stone-900 text-stone-600 border border-stone-850 cursor-not-allowed' : 'bg-saffron text-stone-950 hover:bg-amber-400'}`}
                              >
                                {hasMonsoonTarps ? "CONSTRUCTED" : "BUY FOR 15,000 M"}
                              </button>
                            )}
                            {activeSeason === 'summer' && (
                              <button
                                type="button"
                                disabled={hasSummerWells}
                                onClick={() => buyEquipment('summer')}
                                className={`px-4 py-2 font-mono text-[9px] font-black uppercase tracking-wider rounded-xs cursor-pointer ${hasSummerWells ? 'bg-stone-900 text-stone-600 border border-stone-850 cursor-not-allowed' : 'bg-saffron text-stone-950 hover:bg-amber-400'}`}
                              >
                                {hasSummerWells ? "CONSTRUCTED" : "BUY FOR 12,000 M"}
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Drilling Troops details block */}
                  <div className="bg-stone-900/60 p-5 border border-stone-800 rounded-xs flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <span className="text-[9px] text-saffron uppercase font-mono font-black tracking-widest flex items-center gap-1.5">
                        <Award className="text-saffron" size={14} />
                        SADASHIVRAO BHAU'S TACTICAL COMBAX DRILLS
                      </span>
                      <h4 className="font-serif text-lg text-white font-black uppercase">COMMENCE EXPEDITION FIELD PROFICIENCY MANEUVERS</h4>
                      <p className="text-xs text-stone-400 italic leading-relaxed">
                        Order troop regiments to drill under French and Maratha tacticians. Standardizes flintlock alignments, sharpens cavalry timing, and drastically buffers army cohesion before clashing with Ahmad Shah Abdali.
                      </p>
                      <div className="flex gap-x-4 text-[9px] font-mono text-stone-500 uppercase">
                        <span>Current Drill Level: <strong className="text-white">Tier {drillLevel}</strong></span>
                        <span>Upgrade Bonus: <strong className="text-saffron font-bold">+15 Base Power, +5% Cohesion Scale</strong></span>
                      </div>
                    </div>

                    <div className="shrink-0 p-4 bg-stone-950 border border-stone-850 rounded-xs text-center space-y-3 w-full md:w-[220px]">
                      <div>
                        <span className="text-[8px] text-stone-500 uppercase block font-black">Drill Investment cost:</span>
                        <div className="font-mono text-[10px] mt-1 space-y-0.5 text-stone-300 font-bold">
                          <p>💎 {(10000 + drillLevel * 5000).toLocaleString()} Mohurs</p>
                          <p>🌾 {55 + drillLevel * 20} Tons Food</p>
                        </div>
                      </div>

                      <button
                        onClick={triggerTacticalDrill}
                        className="w-full py-2 bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black uppercase text-[9px] tracking-widest rounded-xs cursor-pointer shadow-md transition-all active:scale-[0.98]"
                      >
                        ⚡ INITIATE COMPREHENSIVE DRILLS
                      </button>
                    </div>
                  </div>

                  {/* Direct Supply purchase quick deck */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-stone-900/40 border border-stone-850 p-4 rounded-xs text-left space-y-3.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] text-stone-500 font-black font-mono block uppercase">Quick Provision Order:</span>
                        <h4 className="font-serif text-sm text-white uppercase font-bold mt-1">🌾 CONTRACT DECCAN GRAIN CARAVANS</h4>
                        <p className="text-xs text-stone-400 italic mt-1 leading-relaxed">
                          Pay 15,000 Gold Mohurs to secure heavy grain delivery carts bypassing Northern river scouts. Gained immediately.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-stone-900/80 flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-stone-300">Cost: 15,000 M</span>
                        <button
                          onClick={() => requisitionSupply('grain')}
                          className="px-3.5 py-1.5 bg-stone-950 text-saffron border border-saffron hover:bg-saffron hover:text-stone-950 font-mono text-[9px] font-black uppercase tracking-wider rounded-xs cursor-pointer"
                        >
                          BUY +120 TONS
                        </button>
                      </div>
                    </div>

                    <div className="bg-stone-900/40 border border-stone-850 p-4 rounded-xs text-left space-y-3.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] text-stone-500 font-black font-mono block uppercase">Arsenal Support Order:</span>
                        <h4 className="font-serif text-sm text-white uppercase font-bold mt-1">⚡ BUY EMERGENCY BLACK POWDER</h4>
                        <p className="text-xs text-stone-400 italic mt-1 leading-relaxed">
                          Secure safe gunpowder barrels from Gwalior stores. Prevents siege cannon shell shortages and expands combat options.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-stone-900/80 flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-stone-300">Cost: 20,000 M</span>
                        <button
                          onClick={() => requisitionSupply('powder')}
                          className="px-3.5 py-1.5 bg-stone-950 text-saffron border border-saffron hover:bg-saffron hover:text-stone-950 font-mono text-[9px] font-black uppercase tracking-wider rounded-xs cursor-pointer"
                        >
                          BUY EMERGENCY POWDER
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Right Information & Logs sidebar column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Campaign Logistics Logs feed */}
              <div className="bg-stone-900 border border-stone-800 p-4 rounded-xs text-left space-y-4">
                <span className="text-[8px] text-stone-500 uppercase font-mono tracking-widest block font-black border-b border-stone-800 pb-1.5">
                  🛡️ LOGISTICS CENTRAL TELEMETRY
                </span>

                <div className="space-y-3 flex flex-col max-h-[220px] overflow-y-auto custom-scrollbar font-mono text-[9px] leading-relaxed text-stone-400">
                  <AnimatePresence>
                    {log.map((entry, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={idx}
                        className="bg-stone-950/80 p-2.5 border-l-2 border-saffron rounded-r-xs"
                      >
                        {entry}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Historical Context Banner card */}
              <div className="bg-[#1e140f] border border-orange-900/20 p-5 rounded-xs text-left relative overflow-hidden">
                <span className="absolute -right-6 -bottom-6 text-stone-900/10 pointer-events-none font-serif text-9xl font-black">
                  ₹
                </span>
                <span className="text-[8px] text-saffron uppercase font-mono tracking-widest block font-black mb-1.5">
                  Historical Chronicle
                </span>
                <h4 className="font-serif text-white text-xs uppercase font-bold mb-2">THE 1761 STARVATION DISASTER</h4>
                <p className="text-[10px] text-stone-300 leading-relaxed italic">
                  "By December 1760, Abdali had successfully blockaded the Maratha camp at Panipat, completely cutting off the road back to Delhi. Hundreds of horses and non-combatants starved daily. Coins lost all value, and citizens would trade precious gold necklaces for mere handfuls of raw grain."
                </p>
                <div className="mt-4 pt-3 border-t border-orange-950/40 flex justify-between items-center text-[8px] text-stone-500 font-mono">
                  <span>Source: Peshwa Letters & Bakhars</span>
                  <span className="text-saffron font-bold">1761 CE</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
