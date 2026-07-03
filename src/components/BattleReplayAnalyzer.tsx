import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Map, 
  ShieldAlert, 
  HelpCircle, 
  Flame, 
  Crosshair, 
  Sparkles,
  Award,
  Activity,
  Compass
} from 'lucide-react';
import { panipatAudioEngine } from '../utils/audioSystem';

interface ReplayBattle {
  id: string;
  name: string;
  year: string;
  terrain: 'basalt' | 'marshes' | 'fortress' | 'dry_plains';
  terrainColor: string;
  description: string;
  foresightGuide: string;
  stages: {
    title: string;
    description: string;
    marathaDeploy: { name: string; x: number; y: number; type: 'inf' | 'cav' | 'art'; r: number; scale?: number; path?: {x: number; y: number}[] }[];
    afghanDeploy: { name: string; x: number; y: number; type: 'inf' | 'cav' | 'art'; r: number; scale?: number; path?: {x: number; y: number}[] }[];
    clashes: { x: number; y: number; radius: number; text: string }[];
    firingLines?: { fromX: number; fromY: number; toX: number; toY: number; color: string }[];
  }[];
}

const REPLAY_BATTLES: ReplayBattle[] = [
  {
    id: 'udgir',
    name: 'Battle of Udgir (Jan 1760)',
    year: 'Deccan Basalt Valleys',
    terrain: 'basalt',
    terrainColor: 'bg-stone-900',
    description: 'Sadashivrao Bhau executed a brilliant double-envelopment of the Nizam’s trenches, leveraging Ibrahim Khan Gardi’s heavy European-disciplined field cannons to pin down and encircle the heavy fortress columns.',
    foresightGuide: 'Artillery superiority paired with tight flanking infantry walls neutralizes unorganized heavy vanguard cavalry charges. Entrenchment remains vulnerable to coordinated cross-fire.',
    stages: [
      {
        title: 'Phase I: The Grand Artillery Squeeze',
        description: 'Ibrahim Khan Gardi deploys 9-pounder field guns on the high basalt ridges. The Nizam’s heavy cavalry moves forward blindly into the crossfire zone.',
        marathaDeploy: [
          { name: 'Gardi Heavy Battery', x: 150, y: 120, type: 'art', r: 16, path: [{x:150, y:120}] },
          { name: 'Huzurat Saffron Cavalry', x: 100, y: 250, type: 'cav', r: 14 },
          { name: 'Deccan Infantry Guard', x: 220, y: 80, type: 'inf', r: 12 }
        ],
        afghanDeploy: [
          { name: 'Nizam Cavalry Columns', x: 380, y: 200, type: 'cav', r: 14, path: [{x: 380, y: 200}, {x: 280, y: 190}] },
          { name: 'Nizam Rear Guard', x: 440, y: 280, type: 'inf', r: 12 }
        ],
        clashes: [
          { x: 280, y: 180, radius: 25, text: 'Artillery bombardment zone catches Nizam vanguard' }
        ],
        firingLines: [
          { fromX: 150, fromY: 120, toX: 280, toY: 180, color: 'stroke-amber-400' }
        ]
      },
      {
        title: 'Phase II: Double-Envelopment Squeeze',
        description: 'Sadashivrao Bhau orders the elite Saffron Cavalry to sweep behind the Nizam’s right flank while Ibrahim Gardi’s infantry bayonet-charges forward.',
        marathaDeploy: [
          { name: 'Gardi Heavy Battery', x: 150, y: 120, type: 'art', r: 16 },
          { name: 'Huzurat Saffron Cavalry', x: 320, y: 320, type: 'cav', r: 14, path: [{x:100, y:250}, {x:220, y:300}, {x:320, y:320}] },
          { name: 'Deccan Infantry Guard', x: 240, y: 140, type: 'inf', r: 12, path: [{x:220, y:80}, {x:240, y:140}] }
        ],
        afghanDeploy: [
          { name: 'Nizam Vanguard (Surrendering)', x: 280, y: 190, type: 'cav', r: 12 },
          { name: 'Nizam Rear Guard (Cut off)', x: 360, y: 250, type: 'inf', r: 14, path: [{x:440, y:280}, {x:360, y:250}] }
        ],
        clashes: [
          { x: 340, y: 280, radius: 30, text: 'Huzurat cavalry seals the encirclement ring' }
        ]
      }
    ]
  },
  {
    id: 'barari',
    name: 'Sacrifice at Barari Ghat (Oct 1760)',
    year: 'Yamuna Reeds and Shallows',
    terrain: 'marshes',
    terrainColor: 'bg-emerald-950/20',
    description: 'Ahmad Shah Durrani executed a surprise swamp ambush under heavy river fog. Outnumbered and cut off, General Dattaji Shinde stood defiant in the shallow reeds, making an immortal sacrifice.',
    foresightGuide: 'River channels and seasonal marsh fields negate high-speed cavalry charges. Always secure shallow crossing points (Ghats) with heavy physical scouts to avoid night-ambush routing.',
    stages: [
      {
        title: 'Phase I: The Reeds Night Incursion',
        description: 'Najib-ud-Daula leads Rohilla heavy sniper infantry across the cold, misty Yamuna shallows under cover of night. Maratha scouts are taken by surprise.',
        marathaDeploy: [
          { name: 'Dattaji Shinde Front Column', x: 180, y: 220, type: 'cav', r: 14 },
          { name: 'Maratha Camp Followers', x: 100, y: 120, type: 'inf', r: 12 }
        ],
        afghanDeploy: [
          { name: 'Najib Rohilla Snipers', x: 320, y: 280, type: 'inf', r: 14, path: [{x: 440, y: 320}, {x: 320, y: 280}] },
          { name: 'Afghan Vanguard Horse', x: 360, y: 180, type: 'cav', r: 12, path: [{x: 460, y: 150}, {x: 360, y: 180}] }
        ],
        clashes: [
          { x: 260, y: 240, radius: 20, text: 'Surprise skirmish in shallow river reeds' }
        ],
        firingLines: [
          { fromX: 320, fromY: 280, toX: 180, toY: 220, color: 'stroke-red-500' }
        ]
      },
      {
        title: 'Phase II: "Bachenge toh aur bhi ladenge!"',
        description: 'Dattaji Shinde is surrounded by Rohilla skirmishers. Refusing to surrender, he fights heroically in the mud, inspiring the future campaign rally.',
        marathaDeploy: [
          { name: 'Dattaji Shinde (Fallen Hero)', x: 230, y: 240, type: 'cav', r: 16, path: [{x:180, y:220}, {x:230, y:240}] },
          { name: 'Maratha Rear Retreat', x: 80, y: 90, type: 'inf', r: 10, path: [{x:100, y:120}, {x:80, y:90}] }
        ],
        afghanDeploy: [
          { name: 'Najib Rohilla Division', x: 280, y: 260, type: 'inf', r: 14, path: [{x:320, y:280}, {x:280, y:260}] },
          { name: 'Afghan Cavalry Sweep', x: 260, y: 150, type: 'cav', r: 12, path: [{x:360, y:180}, {x:260, y:150}] }
        ],
        clashes: [
          { x: 240, y: 220, radius: 35, text: 'Defiant final stand of the Scindia commanders' }
        ]
      }
    ]
  },
  {
    id: 'kunjpura',
    name: 'Storming of Kunjpura (Nov 1760)',
    year: 'Walled Afghan Granary Fort',
    terrain: 'fortress',
    terrainColor: 'bg-orange-950/10',
    description: 'The Maratha army bombarded and stormed the walled Afghan outpost of Kunjpura, massacring their isolated garrison and capturing critical wheat reservoirs.',
    foresightGuide: 'Walled bastions are highly vulnerable to professional siege cannons. Consuming regional depots provides short-term food relief but risks strategic overextension.',
    stages: [
      {
        title: 'Phase I: Breach of the Walled Gates',
        description: 'Ibrahim Khan Gardi’s modern siege artillery initiates a heavy breach barrage, shattering the old brick walls of Kunjpura fortress.',
        marathaDeploy: [
          { name: 'Gardi Siege Cannons', x: 120, y: 280, type: 'art', r: 16 },
          { name: 'Vanguard Raider Horse', x: 160, y: 150, type: 'cav', r: 12 }
        ],
        afghanDeploy: [
          { name: 'Kunjpura Fort Guard', x: 320, y: 160, type: 'inf', r: 14 },
          { name: 'Afghan Garrison Reserve', x: 380, y: 120, type: 'cav', r: 12 }
        ],
        clashes: [
          { x: 280, y: 180, radius: 25, text: 'Artillery fire breaches outer defensive gate' }
        ],
        firingLines: [
          { fromX: 120, fromY: 280, toX: 280, toY: 180, color: 'stroke-yellow-500' }
        ]
      },
      {
        title: 'Phase II: Capture of the Granary Silos',
        description: 'The Maratha vanguard breaches the gates and enters the fortress, securing 10,000 bags of wheat to relieve the camp’s mounting starvation.',
        marathaDeploy: [
          { name: 'Gardi Siege Cannons', x: 180, y: 240, type: 'art', r: 14, path: [{x:120, y:280}, {x:180, y:240}] },
          { name: 'Saffron Horse (Securing Fort)', x: 300, y: 170, type: 'cav', r: 14, path: [{x:160, y:150}, {x:300, y:170}] }
        ],
        afghanDeploy: [
          { name: 'Garrison (Defeated)', x: 340, y: 140, type: 'inf', r: 10, path: [{x:320, y:160}, {x:340, y:140}] },
          { name: 'Afghan Fleet (Routed)', x: 420, y: 90, type: 'cav', r: 8, path: [{x:380, y:120}, {x:420, y:90}] }
        ],
        clashes: [
          { x: 320, y: 150, radius: 30, text: 'Securing grain depots and weapon stores' }
        ]
      }
    ]
  },
  {
    id: 'panipat',
    name: 'Shattered Dream of Panipat (Jan 14, 1761)',
    year: 'The Great Battlefield Plains',
    terrain: 'dry_plains',
    terrainColor: 'bg-[#1D1714]',
    description: 'The catastrophic final clash. Blockaded and starving, the Marathas formed a defensive iron circle (Chakra) led by heavy guns, launching an apocalyptic morning charge against Ahmad Shah’s containment ring.',
    foresightGuide: 'Maintaining a rigid defensive crescent without active supply corridors leads to gradual starvation. Nomadic flanking reserve units decide late-stage battles.',
    stages: [
      {
        title: 'Phase I: The Morning Iron Clash',
        description: 'At dawn, Ibrahim Gardi’s heavy cannons open fire, tearing holes in the Afghan right. Sadashivrao Bhau leads a glorious central sword charge.',
        marathaDeploy: [
          { name: 'Ibrahim Gardi Artillery', x: 140, y: 110, type: 'art', r: 16 },
          { name: 'Sadashivrao Bhau Center', x: 150, y: 220, type: 'inf', r: 14 },
          { name: 'Holkar & Scindia Cavalry', x: 130, y: 320, type: 'cav', r: 12 }
        ],
        afghanDeploy: [
          { name: 'Najib Rohilla Flank', x: 340, y: 100, type: 'inf', r: 14 },
          { name: 'Shah Wali Khan Center', x: 350, y: 210, type: 'inf', r: 14 },
          { name: 'Pashtun Light Horse', x: 360, y: 310, type: 'cav', r: 12 }
        ],
        clashes: [
          { x: 240, y: 200, radius: 35, text: 'Bhau’s center crushes the Afghan royal vizier' }
        ],
        firingLines: [
          { fromX: 140, fromY: 110, toX: 340, toY: 100, color: 'stroke-amber-400' }
        ]
      },
      {
        title: 'Phase II: The Afghan Reserve Strike',
        description: 'Ahmad Shah Durrani unleashes his fresh 10,000-strong royal bodyguard cavalry reserves, striking the exhausted Maratha center from the flank.',
        marathaDeploy: [
          { name: 'Gardi Cannons (Overrun)', x: 180, y: 120, type: 'art', r: 12, path: [{x:140, y:110}, {x:180, y:120}] },
          { name: 'Bhau Center (Surrounded)', x: 230, y: 210, type: 'inf', r: 14, path: [{x:150, y:220}, {x:230, y:210}] },
          { name: 'Holkar Division (Retreating)', x: 80, y: 340, type: 'cav', r: 10, path: [{x:130, y:320}, {x:80, y:340}] }
        ],
        afghanDeploy: [
          { name: 'Najib-ud-Daula Flank', x: 320, y: 110, type: 'inf', r: 14, path: [{x:340, y:100}, {x:320, y:110}] },
          { name: 'Shah Wali (Reinforced)', x: 300, y: 210, type: 'inf', r: 14, path: [{x:350, y:210}, {x:300, y:210}] },
          { name: 'Shah Royal Reserve Charge', x: 260, y: 260, type: 'cav', r: 16, path: [{x:420, y:260}, {x:260, y:260}] }
        ],
        clashes: [
          { x: 250, y: 230, radius: 40, text: 'Afghan reserve encirclement breaks the Saffron circle' }
        ]
      }
    ]
  }
];

export const BattleReplayAnalyzer: React.FC = () => {
  const [selectedBattleId, setSelectedBattleId] = useState<string>('udgir');
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(2500); // Ms per step
  const timerRef = useRef<any>(null);

  const battle = REPLAY_BATTLES.find(b => b.id === selectedBattleId) || REPLAY_BATTLES[0];
  const stage = battle.stages[activeStageIdx] || battle.stages[0];

  useEffect(() => {
    // Reset play state and step when battle changes
    setIsPlaying(false);
    setActiveStageIdx(0);
  }, [selectedBattleId]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveStageIdx(prev => {
          if (prev < battle.stages.length - 1) {
            panipatAudioEngine.playSfx('click');
            return prev + 1;
          } else {
            setIsPlaying(false);
            return 0; // Loop back
          }
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, selectedBattleId, speed]);

  const handleNextStep = () => {
    panipatAudioEngine.playSfx('click');
    if (activeStageIdx < battle.stages.length - 1) {
      setActiveStageIdx(activeStageIdx + 1);
    } else {
      setActiveStageIdx(0);
    }
  };

  const handlePrevStep = () => {
    panipatAudioEngine.playSfx('click');
    if (activeStageIdx > 0) {
      setActiveStageIdx(activeStageIdx - 1);
    } else {
      setActiveStageIdx(battle.stages.length - 1);
    }
  };

  const handleTogglePlay = () => {
    panipatAudioEngine.playSfx('click');
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    panipatAudioEngine.playSfx('click');
    setIsPlaying(false);
    setActiveStageIdx(0);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 text-left pb-16">
      
      {/* Left Map Sandbox Area */}
      <div className="lg:col-span-2 flex flex-col bg-stone-900 border border-stone-850 p-4 rounded shadow-2xl relative">
        
        {/* Battle selector header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-850 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Map className="text-saffron w-5 h-5" />
            <span className="text-xs font-mono font-black text-saffron uppercase tracking-widest">
              Interactive Vector Analyzer
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {REPLAY_BATTLES.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBattleId(b.id)}
                className={`px-3 py-1 text-[9.5px] font-mono uppercase font-black border tracking-wider rounded-xs cursor-pointer transition-all ${selectedBattleId === b.id ? 'bg-saffron text-stone-950 border-saffron font-black shadow' : 'bg-transparent text-stone-400 border-stone-800 hover:text-stone-200'}`}
              >
                {b.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Vector SVG Screen Container */}
        <div className="relative w-full h-[350px] md:h-[400px] border border-stone-800 rounded bg-[#100c0a] overflow-hidden shadow-inner flex items-center justify-center">
          
          {/* Authentic background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1613_1px,transparent_1px),linear-gradient(to_bottom,#1b1613_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />
          
          <svg className="w-full h-full max-w-full max-h-full" viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet">
            
            {/* Terrain Background Accents */}
            {battle.terrain === 'basalt' && (
              <path d="M 0,100 Q 150,80 300,120 T 500,90 L 500,0 L 0,0 Z" fill="#241e1a" opacity="0.6" />
            )}
            {battle.terrain === 'marshes' && (
              <>
                <path d="M 250,0 Q 200,150 280,280 T 230,400 L 290,400 Q 340,280 290,150 T 310,0 Z" fill="#064e3b" opacity="0.25" />
                <text x="260" y="40" fill="#10b981" opacity="0.4" className="font-mono text-[9px] uppercase tracking-widest font-black [writing-mode:vertical-lr]">Yamuna Shallows</text>
              </>
            )}
            {battle.terrain === 'fortress' && (
              <>
                <rect x="300" y="80" width="140" height="150" fill="#2d1510" rx="4" stroke="#4a1d12" strokeWidth="2" opacity="0.4" />
                <text x="310" y="105" fill="#f97316" opacity="0.5" className="font-mono text-[10px] uppercase tracking-widest font-black">Kunjpura Fort</text>
              </>
            )}

            {/* Firing lines / Barrage lines */}
            {stage.firingLines?.map((fl, idx) => (
              <motion.line
                key={`fl-${idx}`}
                x1={fl.fromX}
                y1={fl.fromY}
                x2={fl.toX}
                y2={fl.toY}
                className={`${fl.color} stroke-[2]`}
                strokeDasharray="4,4"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -20 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ))}

            {/* Clashing Blast Zones */}
            <AnimatePresence>
              {stage.clashes.map((cl, idx) => (
                <g key={`cl-${idx}`}>
                  <motion.circle
                    cx={cl.x}
                    cy={cl.y}
                    r={cl.radius}
                    className="fill-orange-600/10 stroke-orange-500/30 stroke-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.1, 0.9, 1], opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  />
                  {/* Flashing target star inside clash */}
                  <motion.circle
                    cx={cl.x}
                    cy={cl.y}
                    r={6}
                    className="fill-red-600 stroke-white stroke-1"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  {/* Dynamic clash text */}
                  <text 
                    x={cl.x} 
                    y={cl.y - cl.radius - 6} 
                    className="font-sans text-[8px] font-black fill-stone-200 text-center uppercase tracking-wider bg-black"
                    textAnchor="middle"
                  >
                    ⚡ {cl.text}
                  </text>
                </g>
              ))}
            </AnimatePresence>

            {/* Maratha Troops vectors (Saffron circles with shields) */}
            {stage.marathaDeploy.map((unit, idx) => {
              const prevUnit = battle.stages[activeStageIdx - 1]?.marathaDeploy.find(u => u.name === unit.name);
              const hasMoved = prevUnit && (prevUnit.x !== unit.x || prevUnit.y !== unit.y);

              return (
                <g key={`m-${idx}`}>
                  {/* Dotted travel trail */}
                  {unit.path && (
                    <path 
                      d={`M ${unit.path.map(p => `${p.x},${p.y}`).join(' L ')}`} 
                      className="stroke-saffron/40 stroke-[1.5]" 
                      fill="none" 
                      strokeDasharray="3,3" 
                    />
                  )}
                  {/* Animated military circle */}
                  <motion.circle
                    cx={unit.x}
                    cy={unit.y}
                    r={unit.r}
                    className="fill-stone-900 stroke-saffron stroke-[3]"
                    layoutId={`m-u-${unit.name}`}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  />
                  {/* Division icon letter */}
                  <text
                    x={unit.x}
                    y={unit.y + 3}
                    className="font-mono text-[9px] font-black fill-saffron"
                    textAnchor="middle"
                  >
                    {unit.type === 'art' ? '砲' : unit.type === 'cav' ? '騎' : '歩'}
                  </text>
                  {/* Label tag */}
                  <text
                    x={unit.x}
                    y={unit.y + unit.r + 10}
                    className="font-sans text-[8.5px] font-black fill-stone-300 uppercase tracking-widest"
                    textAnchor="middle"
                  >
                    {unit.name}
                  </text>
                </g>
              );
            })}

            {/* Afghan Troops vectors (Crescent-red squares with lances) */}
            {stage.afghanDeploy.map((unit, idx) => {
              return (
                <g key={`a-${idx}`}>
                  {/* Dotted travel trail */}
                  {unit.path && (
                    <path 
                      d={`M ${unit.path.map(p => `${p.x},${p.y}`).join(' L ')}`} 
                      className="stroke-red-500/40 stroke-[1.5]" 
                      fill="none" 
                      strokeDasharray="3,3" 
                    />
                  )}
                  {/* Animated military rect */}
                  <motion.rect
                    x={unit.x - unit.r}
                    y={unit.y - unit.r}
                    width={unit.r * 2}
                    height={unit.r * 2}
                    rx="2"
                    className="fill-stone-900 stroke-red-500 stroke-[3]"
                    layoutId={`a-u-${unit.name}`}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  />
                  {/* Division icon letter */}
                  <text
                    x={unit.x}
                    y={unit.y + 3}
                    className="font-mono text-[9px] font-black fill-red-500"
                    textAnchor="middle"
                  >
                    {unit.type === 'art' ? '砲' : unit.type === 'cav' ? '騎' : '歩'}
                  </text>
                  {/* Label tag */}
                  <text
                    x={unit.x}
                    y={unit.y + unit.r + 10}
                    className="font-sans text-[8.5px] font-black fill-stone-300 uppercase tracking-widest"
                    textAnchor="middle"
                  >
                    {unit.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick HUD key overlays */}
          <div className="absolute bottom-3 left-3 bg-stone-950/90 border border-stone-850 p-2 rounded flex gap-4 text-[9px] font-mono text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-saffron bg-stone-900" />
              Marathas (Saffron)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-red-500 bg-stone-900" />
              Afghans (Crescent)
            </span>
            <span className="flex items-center gap-1.5">
              <span>歩 / 騎 / 砲</span>
              Inf / Cav / Art
            </span>
          </div>

          <div className="absolute top-3 right-3 bg-stone-950/90 border border-[#8B5E3C]/20 px-2 py-1 rounded font-mono text-[9px] text-saffron uppercase font-black">
            Terrain: {battle.terrain.replace('_', ' ')}
          </div>
        </div>

        {/* Map playback controls toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-stone-850">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="p-1.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-white rounded transition-colors cursor-pointer"
              title="Previous Phase"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleTogglePlay}
              className="px-4 py-1.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 text-saffron hover:text-white rounded flex items-center gap-2 font-mono text-[10px] uppercase font-black cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause size={12} className="fill-saffron" />
                  Pause
                </>
              ) : (
                <>
                  <Play size={12} className="fill-saffron" />
                  Play Replay
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="p-1.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-white rounded transition-colors cursor-pointer"
              title="Next Phase"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-white rounded transition-colors cursor-pointer"
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
            <span>Replay Speed:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-200 outline-none text-[10px] font-bold"
            >
              <option value={3500}>0.5x Slow</option>
              <option value={2500}>1.0x Normal</option>
              <option value={1200}>2.0x Rapid</option>
            </select>
          </div>
        </div>

      </div>

      {/* Right Analysis Panel */}
      <div className="flex flex-col gap-6">
        
        {/* Battle Description Details */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded shadow-2xl flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="text-saffron w-4 h-4 animate-spin-slow" />
              <span className="text-[10px] text-saffron font-mono uppercase tracking-wider font-black">
                Cabinet Battle Description
              </span>
            </div>
            
            <h3 className="font-serif text-lg font-black uppercase text-white leading-tight mb-2">
              {battle.name}
            </h3>
            
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              {battle.description}
            </p>

            <div className="bg-[#2D1A12]/30 border border-[#8B5E3C]/20 p-4 rounded text-xs text-[#E1A070]">
              <span className="font-serif font-black uppercase block mb-1">
                🧠 Strategic Foresight Guide
              </span>
              <p className="opacity-90 font-medium">
                {battle.foresightGuide}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-stone-850 pt-4 flex justify-between items-center text-[10px] font-mono text-stone-500">
            <span>Historical Period:</span>
            <span className="text-stone-300 font-bold">{battle.year}</span>
          </div>
        </div>

        {/* Sync Stage Description Panel */}
        <div className="bg-stone-900 border border-stone-850 p-5 rounded shadow-2xl">
          <div className="flex items-center justify-between border-b border-stone-850 pb-2 mb-3">
            <span className="text-[10px] font-mono font-black text-stone-400 uppercase tracking-widest">
              Replay Phase Tracker
            </span>
            <span className="text-[9px] bg-[#8B5E3C] text-white font-mono px-2 py-0.5 rounded uppercase font-black">
              Phase {activeStageIdx + 1} of {battle.stages.length}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-md font-black text-white uppercase tracking-wider">
              {stage.title}
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed italic">
              "{stage.description}"
            </p>

            {/* Display list of simulated clashes occurring this phase */}
            <div className="pt-3 border-t border-stone-850/60 space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-500 font-bold block">
                ⚡ Active Battle Matrix Clashes:
              </span>
              {stage.clashes.map((cl, idx) => (
                <div key={idx} className="bg-stone-950/60 border border-stone-850 p-2.5 rounded flex items-start gap-2 text-[10.5px]">
                  <Flame size={14} className="text-orange-500 shrink-0 mt-0.5 animate-pulse" />
                  <span className="text-stone-400 font-sans leading-snug">
                    <strong className="text-stone-200 uppercase font-mono block text-[9.5px]">Clash Vector:</strong>
                    {cl.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
