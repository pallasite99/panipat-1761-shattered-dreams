import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowLeft,
  Sliders,
  Maximize2,
  Calendar,
  Layers,
  Thermometer,
  CloudLightning,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import * as d3 from 'd3';
import { Screen } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

// Detail layout for each interactive Cartographic Node
interface HistoricLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  faction: 'maratha' | 'durrani' | 'mughal' | 'neutral';
  importance: string;
  troopPresence: string;
  geography: string;
  climate1761: string;
  description: string;
  timelineEvent: string;
}

const HISTORIC_LOCATIONS: HistoricLocation[] = [
  {
    id: 'pune',
    name: 'Pune (Deccan Capital)',
    x: 320,
    y: 520,
    faction: 'maratha',
    importance: 'Fountainhead of Maratha Power',
    troopPresence: '30,000 Heavy Foot & Shiledars mobilized',
    geography: 'Rocky Deccan plateau; surrounded by Western Ghats hill-forts.',
    climate1761: 'Warm, pleasant Deccan winter winds.',
    description: 'The seed and nerve center of the Peshwas. Sadashivrao Bhau and Vishwasrao commenced the spectacular 1,200 km northward march here in March 1760 with golden banners, heavy court baggage, and thousands of non-combatant pilgrims.',
    timelineEvent: 'March 1760: Grand army sets off with general mobilization orders.'
  },
  {
    id: 'burhanpur',
    name: 'Burhanpur (Narmada Pass)',
    x: 350,
    y: 410,
    faction: 'maratha',
    importance: 'Gateway to Northern Hindusthan',
    troopPresence: 'Reinforced by Holkar & Scindia cavalry divisions',
    geography: 'Dense forest valley near Narmada & Tapti riverbeds.',
    climate1761: 'Arid, dry, and dust-heavy.',
    description: 'A major historic fortress settlement. Here, the Maratha army traversed the Narmada river and held diplomatic war councils. Logistics lines from Pune were structured, and the army was joined by veteran northern generals.',
    timelineEvent: 'May 1760: Crossing of the Narmada; integration of Scindia units.'
  },
  {
    id: 'gwalior',
    name: 'Gwalior Fortress',
    x: 390,
    y: 290,
    faction: 'maratha',
    importance: 'Military Hub of the Shindes',
    troopPresence: 'Scindia Veterans & French artillery battery reserve',
    geography: 'Steep sandstone hill-fort elevation.',
    climate1761: 'Intense sun heat transitioning to pre-monsoon showers.',
    description: 'Under the control of the brave Shinde (Scindia) clan. This invincible fortress provided crucial ammunition, armory smithies, and fresh horses, allowing the campaign to press into the troubled Chambal region.',
    timelineEvent: 'June 1760: Crucial weapon stockpiling and coordination with Jats.'
  },
  {
    id: 'delhi',
    name: 'Delhi (Imperial Red Fort)',
    x: 365,
    y: 190,
    faction: 'mughal',
    importance: 'The Mughal Throne & Prestige Center',
    troopPresence: 'Gardi artillery units and Imperial Sentry Garrison',
    geography: 'Silt plains flanking the wide Yamuna riverbanks.',
    climate1761: 'Dusty, hot summer turning into flooded river flows.',
    description: 'The ultimate cockpit of North Indian politics. Marathas stormed Delhi in August 1760, capturing the Red Fort to secure imperial prestige. However, they found the royal vaults completely empty, resulting in severe financial exhaustion.',
    timelineEvent: 'August 1760: Tactical capture of Delhi city; severe food scarcity begins.'
  },
  {
    id: 'kunjpura',
    name: 'Kunjpura Fort',
    x: 360,
    y: 145,
    faction: 'maratha',
    importance: 'Food Grain Chokepoint',
    troopPresence: 'Stormed and secured; 10,000 Afghan defenders defeated',
    geography: 'Swampy marshes near the Yamuna riverbed.',
    climate1761: 'Freezing, chilling autumn mist.',
    description: 'An Afghan fortress holding massive grain elevators, cash, and military stores. Sadashivrao Bhau launched a spectacular dawn assault, slaughtering Najib-ud-Daulah’s allies to feed his starving troops.',
    timelineEvent: 'October 1760: Assault on Kunjpura secures momentary grain supplies.'
  },
  {
    id: 'panipat',
    name: 'Panipat Battleground',
    x: 350,
    y: 160,
    faction: 'neutral',
    importance: 'Final Clash coordinates',
    troopPresence: '200,000 Combined Troops locked in a static winter siege',
    geography: 'Flat, hard, featureless agricultural plain.',
    climate1761: 'Extreme winter frost, reaching near freezing 3°C at night.',
    description: 'The historic cockpit where empires clashed. Over 100,000 Marathas were blockaded inside Panipat town by Durrani’s cavalry patrols, starving for over two months before charging out on January 14, 1761, for a do-or-die battle.',
    timelineEvent: 'Jan 14, 1761: The catastrophic, heroic battle starts at dawn.'
  },
  {
    id: 'kabul',
    name: 'Kabul & Kandahar (Durrani Base)',
    x: 100,
    y: 100,
    faction: 'durrani',
    importance: 'Empiric Throne of Ahmad Shah',
    troopPresence: '45,000 Pashtun veterans and camel gun squads mobilized',
    geography: 'Rugged, freezing mountain passes; dry valley canyons.',
    climate1761: 'Sub-zero snowstorms in Afghanistan mountain crossings.',
    description: 'The capital of the Durrani Empire. Ahmad Shah Abdali mobilized highly mobile horse archers, elite desert swordsmen, and camel-mounted Zamburak guns to march down through the Khyber Pass to defeat the expanding Maratha Confederacy.',
    timelineEvent: 'Late 1759: Mobilization of the Afghan coalition invader force.'
  }
];

// Boundaries representing 18th-century state zones (simplified polygons)
const EMPIRE_BOUNDARIES = [
  {
    name: 'Durrani Afghan Kingdom',
    color: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.45)',
    points: [[50, 50], [250, 50], [220, 200], [50, 150]]
  },
  {
    name: 'Maratha Southwestern Sovereignty',
    color: 'rgba(245, 158, 11, 0.07)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
    points: [[220, 430], [450, 410], [400, 580], [250, 580]]
  },
  {
    name: 'Mughal Delhi / Rohilkhand Zone',
    color: 'rgba(59, 130, 246, 0.06)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    points: [[300, 130], [430, 130], [410, 220], [310, 225]]
  }
];

export const Cartography: React.FC<{
  onNavigate: (s: Screen) => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ onNavigate, onHelp, onSettings }) => {
  const [selectedLoc, setSelectedLoc] = useState<HistoricLocation>(HISTORIC_LOCATIONS[5]); // Default to Panipat
  const [showMarathaRoute, setShowMarathaRoute] = useState(true);
  const [showDurraniRoute, setShowDurraniRoute] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);

  // Active D3 Map Zoom States
  const [zoomScale, setZoomScale] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomGRef = useRef<SVGGElement | null>(null);

  // Interactive path-building system (Distance Calculator)
  const [calcStart, setCalcStart] = useState<HistoricLocation | null>(null);
  const [calcEnd, setCalcEnd] = useState<HistoricLocation | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);

  useEffect(() => {
    if (!svgRef.current || !zoomGRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(zoomGRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomScale(event.transform.k);
      });

    svg.call(zoom);

    // Initial zoom frame center helper
    const initialTransform = d3.zoomIdentity.translate(40, -10).scale(1.05);
    svg.call(zoom.transform, initialTransform);
  }, []);

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    if (direction === 'reset') {
      const resetTransform = d3.zoomIdentity.translate(40, -10).scale(1.05);
      svg.transition().duration(500).call(d3.zoom<SVGSVGElement, unknown>().transform as any, resetTransform);
      return;
    }

    const currentZoom = d3.zoomTransform(svgRef.current);
    const nextScale = direction === 'in' ? currentZoom.k * 1.3 : currentZoom.k / 1.3;
    const cappedScale = Math.max(0.5, Math.min(5, nextScale));
    
    // Zoom centered towards center of view frame
    const centerTransform = d3.zoomIdentity
      .translate(400 - (400 - currentZoom.x) * (cappedScale / currentZoom.k), 300 - (300 - currentZoom.y) * (cappedScale / currentZoom.k))
      .scale(cappedScale);

    svg.transition().duration(400).call(d3.zoom<SVGSVGElement, unknown>().transform as any, centerTransform);
  };

  const handleCalculateDistance = (loc: HistoricLocation) => {
    if (!calcStart || (calcStart && calcEnd)) {
      setCalcStart(loc);
      setCalcEnd(null);
      setCalculatedDistance(null);
    } else {
      if (loc.id === calcStart.id) return;
      setCalcEnd(loc);
      // Coordinate distance calculation
      const dx = loc.x - calcStart.x;
      const dy = loc.y - calcStart.y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      // Scale translation: Pune to Panipat is 1,200km; coordinates have 380px distance. ~ 3.15km per coordinate pixel.
      const kmDistance = Math.round(pixelDist * 3.15);
      setCalculatedDistance(kmDistance);
    }
  };

  const handleResetDistanceCalc = () => {
    setCalcStart(null);
    setCalcEnd(null);
    setCalculatedDistance(null);
  };

  return (
    <div id="cartography-screen-root" className="relative h-screen w-screen bg-[#140e0b] overflow-hidden text-stone-200">
      
      {/* Background paper texture underlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/old-map.png')" }} />

      {/* Common Navigation Bars */}
      <TopBar screen={Screen.STRATEGIC_MAP as any} onNavigate={onNavigate} onHelp={onHelp} onSettings={onSettings} />

      <div className="flex h-full pt-16 relative z-10">
        
        {/* Left Drawer side-rail */}
        <SideNav screen={Screen.STRATEGIC_MAP as any} onNavigate={onNavigate} isOpen={false} />

        {/* Core Screen Divided Grid Layout */}
        <div className="flex-1 lg:pl-64 h-full flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT PANEL: The Interactive D3 Map Container */}
          <div className="flex-1 h-2/3 md:h-full relative flex flex-col border-r border-[#8B5E3C]/30 bg-[#16100c]">
            
            {/* Map Header with quick actions */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-auto">
              <div className="bg-stone-950/90 border border-[#8B5E3C]/40 px-3.5 py-2 rounded-xs shadow-xl flex items-center gap-2.5">
                <Compass className="text-saffron w-5 h-5 animate-spin-slow" />
                <div>
                  <h3 className="font-serif text-[11px] font-black tracking-widest text-[#dfb28e] uppercase">
                    1761 HINDUSTHAN CHART
                  </h3>
                  <p className="text-[8.5px] text-stone-400 font-mono tracking-wide">
                    D3 zooming drag enabled • Scroll zoom
                  </p>
                </div>
              </div>

              {/* Reset view triggers */}
              <button 
                type="button"
                id="btn-map-zoom-in"
                onClick={() => handleZoom('in')}
                className="w-9 h-9 bg-stone-900 border border-stone-800 hover:border-saffron text-stone-300 flex items-center justify-center rounded-xs transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                type="button"
                id="btn-map-zoom-out"
                onClick={() => handleZoom('out')}
                className="w-9 h-9 bg-stone-900 border border-stone-800 hover:border-saffron text-stone-300 flex items-center justify-center rounded-xs transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button 
                type="button"
                id="btn-map-zoom-reset"
                onClick={() => handleZoom('reset')}
                className="w-9 h-9 bg-stone-900 border border-stone-800 hover:border-saffron text-stone-300 flex items-center justify-center rounded-xs transition-colors cursor-pointer"
                title="Reset View"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* Map Layer Option Toggles (Float panel) */}
            <div className="absolute bottom-4 left-4 z-20 bg-stone-950/95 border border-stone-800 p-3.5 rounded-xs shadow-2xl flex flex-col gap-2 max-w-xs text-left">
              <span className="text-[9px] text-saffron uppercase font-mono font-bold tracking-widest flex items-center gap-1">
                <Layers size={10} /> Chart Layers Overlay
              </span>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-stone-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showBoundaries} 
                    onChange={e => setShowBoundaries(e.target.checked)}
                    className="accent-saffron h-3.5 w-3.5 rounded-xs"
                  />
                  <span>Empire Bounds</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showRivers} 
                    onChange={e => setShowRivers(e.target.checked)}
                    className="accent-saffron h-3.5 w-3.5 rounded-xs"
                  />
                  <span>Rivers & Waters</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showMarathaRoute} 
                    onChange={e => setShowMarathaRoute(e.target.checked)}
                    className="accent-saffron h-3.5 w-3.5 rounded-xs"
                  />
                  <span>Peshwa March</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showDurraniRoute} 
                    onChange={e => setShowDurraniRoute(e.target.checked)}
                    className="accent-saffron h-3.5 w-3.5 rounded-xs"
                  />
                  <span>Abdali Route</span>
                </label>
              </div>
            </div>

            {/* Scale multiplier Indicator */}
            <div className="absolute top-4 right-4 z-20 bg-stone-950/80 px-2.5 py-1 border border-stone-850 rounded-xs font-mono text-[9px] text-[#A57850]">
              SCALE: {(zoomScale * 100).toFixed(0)}%
            </div>

            {/* THE MAP CANVAS SVG */}
            <svg 
              ref={svgRef}
              className="w-full h-full cursor-grab active:cursor-grabbing select-none"
              id="cartography-main-svg"
            >
              <defs>
                {/* Patterns for aged parchment paper watermarking */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 94, 60, 0.04)" strokeWidth="1"/>
                </pattern>
                
                {/* Vintage Arrow Marker filters for Campaign routes */}
                <marker id="maratha-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#eab308" />
                </marker>
                <marker id="durrani-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                </marker>
              </defs>

              {/* Grid texture */}
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Zoom and pan manipulation container */}
              <g ref={zoomGRef}>
                
                {/* 1. EMPIRE REGIONAL BOUNDARIES */}
                {showBoundaries && EMPIRE_BOUNDARIES.map((b, idx) => {
                  const pathData = `M ${b.points.map(p => p.join(',')).join(' L ')} Z`;
                  return (
                    <g key={idx}>
                      <path 
                        d={pathData} 
                        fill={b.color} 
                        stroke={b.borderColor} 
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        className="transition-all"
                      />
                      <text
                        x={(b.points[0][0] + b.points[2][0]) / 2 - 40}
                        y={(b.points[0][1] + b.points[2][1]) / 2}
                        className="font-serif text-[8.5px] italic font-black uppercase fill-stone-500 opacity-60 tracking-wider mix-blend-overlay"
                      >
                        {b.name}
                      </text>
                    </g>
                  );
                })}

                {/* 2. MAJESTIC HISTORICAL RIVERS (Yamuna & Narmada) */}
                {showRivers && (
                  <g id="river-layers">
                    {/* Yamuna River */}
                    <path
                      d="M 330,85 C 335,115 352,130 355,145 C 358,160 361,168 365,190 C 370,220 385,250 440,290 C 470,312 490,320 520,330"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      opacity="0.25"
                    />
                    <text x="440" y="280" className="font-serif text-[7.5px] font-bold italic fill-sky-300 opacity-50 tracking-widest uppercase">
                      Yamuna River
                    </text>

                    {/* Narmada Choke-River */}
                    <path
                      d="M 220,405 C 270,402 330,408 380,404 C 430,400 480,406 530,403"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.22"
                    />
                    <text x="250" y="416" className="font-serif text-[7.5px] font-bold italic fill-sky-300 opacity-50 tracking-widest uppercase">
                      Narmada River Choke Line
                    </text>
                  </g>
                )}

                {/* 3. TROOP MARCHING HIGHWAY PATHS */}
                {/* Maratha 1,200km Route: Pune -> Burhanpur -> Gwalior -> Delhi -> Kunjpura -> Panipat */}
                {showMarathaRoute && (
                  <path
                    d="M 320,520 Q 330,470 350,410 T 390,290 T 365,190 T 360,145 T 350,160"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="2.5"
                    strokeDasharray="5,4"
                    markerEnd="url(#maratha-arrow)"
                    className="animate-dash"
                  />
                )}

                {/* Durrani Invader Route: Kabul -> Sirhind -> Panipat */}
                {showDurraniRoute && (
                  <path
                    d="M 100,100 Q 210,110 320,120 T 350,160"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="5,4"
                    markerEnd="url(#durrani-arrow)"
                    className="animate-dash"
                  />
                )}

                {/* Projected user distance calculator line */}
                {calcStart && calcEnd && (
                  <line 
                    x1={calcStart.x} 
                    y1={calcStart.y} 
                    x2={calcEnd.x} 
                    y2={calcEnd.y} 
                    stroke="#22c55e" 
                    strokeWidth="2" 
                    strokeDasharray="3,3"
                  />
                )}

                {/* 4. HISTORIC HOTSPOT MARKERS (INTERACTIVE NODES) */}
                {HISTORIC_LOCATIONS.map((loc) => {
                  const isSelected = selectedLoc.id === loc.id;
                  const isCalcStart = calcStart?.id === loc.id;
                  const isCalcEnd = calcEnd?.id === loc.id;
                  
                  // Color codes for markers
                  let markerColor = 'stroke-amber-500 fill-amber-500 bg-amber-500';
                  if (loc.faction === 'maratha') markerColor = 'stroke-saffron fill-saffron bg-saffron';
                  if (loc.faction === 'durrani') markerColor = 'stroke-red-500 fill-red-500 bg-red-500';
                  if (loc.faction === 'mughal') markerColor = 'stroke-blue-500 fill-blue-500 bg-blue-500';

                  return (
                    <g 
                      key={loc.id} 
                      transform={`translate(${loc.x}, ${loc.y})`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedLoc(loc)}
                    >
                      {/* Interactive click radius helper */}
                      <circle r="22" fill="transparent" />

                      {/* Ripple pulsing animation for selected or high priority Panipat node */}
                      {(isSelected || loc.id === 'panipat' || isCalcStart || isCalcEnd) && (
                        <circle 
                          r="15" 
                          fill="none" 
                          className={`stroke-2 animate-ping opacity-60 ${
                            isCalcStart || isCalcEnd ? 'stroke-emerald-400' : isSelected ? 'stroke-saffron' : 'stroke-orange-600'
                          }`}
                        />
                      )}

                      {/* Main Node Point */}
                      <circle 
                        r={isSelected ? "7" : "5.5"} 
                        className={`transition-all duration-300 stroke-stone-950 stroke-1.5 ${
                          isCalcStart || isCalcEnd 
                            ? 'fill-emerald-400 stroke-emerald-900' 
                            : markerColor
                        }`} 
                      />

                      {/* Stylized visual crest ring around selected point */}
                      {isSelected && (
                        <circle 
                          r="11" 
                          fill="none" 
                          stroke="rgba(245, 158, 11, 0.4)" 
                          strokeWidth="1"
                        />
                      )}

                      {/* Node Text Flag / Banner */}
                      <g transform="translate(10, 4)">
                        {/* Background for labels so they remain readable over rivers */}
                        <rect 
                          x="-3" 
                          y="-13" 
                          width={loc.name.length * 5.4 + 6} 
                          height="16" 
                          fill="rgba(15, 10, 8, 0.88)" 
                          stroke="rgba(139, 94, 60, 0.25)"
                          strokeWidth="0.5"
                          rx="1.5"
                        />
                        <text 
                          className={`font-serif text-[8.5px] font-black uppercase tracking-wide ${
                            isCalcStart || isCalcEnd 
                              ? 'fill-emerald-400' 
                              : isSelected ? 'fill-white' : 'fill-stone-300 group-hover:fill-saffron'
                          }`}
                        >
                          {loc.name.split(' (')[0]}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Custom Compass Rose graphic asset (rendered at south-east water) */}
                <g transform="translate(620, 490) scale(0.65)">
                  <circle r="42" fill="rgba(20, 15, 10, 0.4)" stroke="rgba(139, 94, 60, 0.3)" strokeWidth="1" />
                  <circle r="45" fill="none" stroke="rgba(139, 94, 60, 0.15)" strokeWidth="0.5" strokeDasharray="3,3" />
                  
                  {/* Pointy Diamond Star */}
                  <polygon points="0,-48 8,-8 0,0" fill="#8B5E3C" />
                  <polygon points="0,-48 -8,-8 0,0" fill="#ebd3b4" />
                  
                  <polygon points="0,48 -8,8 0,0" fill="#cbd5e1" opacity="0.4" />
                  <polygon points="0,48 8,8 0,0" fill="#64748b" opacity="0.4" />

                  <polygon points="48,0 8,8 0,0" fill="#8B5E3C" />
                  <polygon points="48,0 8,-8 0,0" fill="#ebd3b4" opacity="0.7" />

                  <polygon points="-48,0 -8,8 0,0" fill="#cbd5e1" opacity="0.4" />
                  <polygon points="-48,0 -8,-8 0,0" fill="#64748b" opacity="0.4" />

                  <text x="-3" y="-53" className="font-serif text-[10px] font-bold fill-stone-400">N</text>
                  <text x="-3" y="60" className="font-serif text-[10px] font-bold fill-stone-400">S</text>
                  <text x="53" y="3" className="font-serif text-[10px] font-bold fill-stone-400">E</text>
                  <text x="-64" y="3" className="font-serif text-[10px] font-bold fill-stone-400">W</text>
                </g>

              </g> SVG Zoom Groups close
            </svg>

            {/* Scale disclaimer footer inside canvas map */}
            <div className="absolute right-4 bottom-4 z-20 pointer-events-none text-right">
              <span className="text-[7.5px] font-mono text-stone-500 uppercase block">Map projection: Albers Equal Area Conic (1761 survey approx)</span>
            </div>
          </div>

          {/* RIGHT PANEL: Historical Context & Timeline Metadata Sideboard */}
          <div className="w-full md:w-96 h-1/3 md:h-full bg-stone-950 border-t md:border-t-0 border-[#8B5E3C]/30 flex flex-col justify-between overflow-hidden">
            
            {/* Header / Active spot */}
            <div className="p-5 border-b border-[#8B5E3C]/20 bg-[#1e140f] shrink-0 text-left">
              <span className="text-[9px] text-[#A57850] uppercase font-mono tracking-widest font-black block">
                🔴 SELECTED LOCATION INTEL
              </span>
              <h2 className="text-xl font-serif text-white uppercase font-black tracking-tight mt-1">
                {selectedLoc.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                  selectedLoc.faction === 'maratha' ? 'bg-saffron' :
                  selectedLoc.faction === 'durrani' ? 'bg-red-500' :
                  selectedLoc.faction === 'mughal' ? 'bg-blue-500' : 'bg-stone-500'
                }`} />
                <span className="text-[10px] font-mono text-[#ecd8c3] uppercase tracking-wider font-bold">
                  Sovereignty: {selectedLoc.faction.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Core Informational Description Scroller */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-left bg-stone-950/80 custom-scrollbar">
              
              {/* Highlight Timeline Banner */}
              <div className="p-3 bg-[#17100b] border-l-2 border-saffron rounded-r-xs flex gap-2 items-start">
                <Calendar className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
                <div className="text-[10.5px]">
                  <strong className="block font-mono text-saffron font-bold uppercase text-[9px] tracking-wider mb-0.5">TIMELINE INSTANT</strong>
                  <p className="text-stone-300 font-sans italic leading-relaxed">{selectedLoc.timelineEvent}</p>
                </div>
              </div>

              {/* Geographic metrics */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-mono text-[#8B5E3C] uppercase tracking-widest font-black">
                  GEOGRAPHIC PARAMETERS
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <div className="bg-stone-900/40 p-2 border border-stone-900/65 flex gap-1.5 items-center">
                    <Thermometer className="w-4.5 h-4.5 text-[#CD853F]" />
                    <div>
                      <span className="text-[8.5px] text-stone-500 font-mono block">WINTER CLIMATE</span>
                      <strong className="text-stone-300 font-serif">{selectedLoc.climate1761.split('; ')[0]}</strong>
                    </div>
                  </div>
                  <div className="bg-stone-900/40 p-2 border border-stone-900/65 flex gap-1.5 items-center">
                    <CloudLightning className="w-4.5 h-4.5 text-sky-400" />
                    <div>
                      <span className="text-[8.5px] text-stone-500 font-mono block">TERRAIN METRICS</span>
                      <strong className="text-stone-300 font-serif">{selectedLoc.geography.split('; ')[0]}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central text Monograph description */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-mono text-[#8B5E3C] uppercase tracking-widest font-black">
                  HISTORICAL IMPORTANCE
                </h4>
                <p className="text-xs text-stone-300 font-serif leading-relaxed italic border-l border-stone-800 pl-3">
                  "{selectedLoc.description}"
                </p>
              </div>

              {/* Strategic Logistics / Troops count */}
              <div className="p-3 bg-stone-900 rounded-xs space-y-1">
                <span className="text-[8.5px] font-mono text-stone-400 font-bold uppercase tracking-widest block">
                  🛡️ MOBILIZED TROOP PRESENCE
                </span>
                <p className="text-xs text-white font-mono font-bold">
                  {selectedLoc.troopPresence}
                </p>
              </div>

              {/* SECTION: Live Distance & Kos Messenger Calculator */}
              <div className="pt-4 border-t border-stone-900 space-y-3">
                <span className="text-[9px] text-[#A57850] font-mono font-black uppercase tracking-widest flex items-center gap-1">
                  <Navigation size={10} className="text-saffron animate-bounce" /> Kos Distance Calculator
                </span>
                <p className="text-[10px] text-stone-400 leading-relaxed font-sans">
                  Select two locations to trace the historical marching coordinate lines and estimate total travel weeks for 18th-century horse messengers.
                </p>

                {/* Distance visual widgets */}
                <div className="bg-stone-900/50 p-3 border border-stone-850 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-stone-500">STARTING OUT:</span>
                    <strong className="text-white">{calcStart ? calcStart.name.split(' (')[0] : 'Click below to choose...'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-stone-500">DESTINATION:</span>
                    <strong className="text-white">{calcEnd ? calcEnd.name.split(' (')[0] : 'Click second location...'}</strong>
                  </div>

                  {calculatedDistance !== null && (
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="pt-2 border-t border-stone-850 flex flex-col gap-1 items-center justify-center text-center py-2 bg-stone-950/60"
                    >
                      <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase">ESTIMATED PHYSICAL ROADWAY</span>
                      <strong className="text-lg text-white font-serif tracking-tight">
                        {calculatedDistance} Kilometers
                      </strong>
                      <span className="text-[9px] text-stone-500 font-mono italic">
                        (~{Math.round(calculatedDistance * 0.282)} Kos • {Math.round(calculatedDistance / 35)} Days Caravan March)
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCalculateDistance(selectedLoc)}
                    className="flex-1 py-1.5 bg-[#8B5E3C]/20 hover:bg-[#8B5E3C]/40 border border-[#8B5E3C]/50 text-stone-200 font-mono text-[9px] font-extrabold uppercase tracking-widest transition-all rounded-xs cursor-pointer"
                  >
                    {!calcStart ? "📍 Set as Start" : calcStart && !calcEnd ? "🏁 Set as Destination" : "📍 Reset & Set Start"}
                  </button>
                  {(calcStart || calcEnd) && (
                    <button
                      type="button"
                      onClick={handleResetDistanceCalc}
                      className="px-2.5 py-1.5 bg-transparent border border-transparent hover:border-stone-800 text-stone-500 hover:text-stone-300 font-mono text-[9px] uppercase tracking-wider rounded-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Call to arms buttons footer */}
            <div className="p-4 bg-stone-900/60 border-t border-stone-900 shrink-0 flex gap-2">
              <button
                type="button"
                onClick={() => onNavigate(Screen.STRATEGIC_MAP)}
                className="flex-1 py-3 bg-gradient-to-r from-stone-950 to-stone-900 hover:from-stone-900 hover:to-stone-800 text-saffron font-mono text-xs uppercase font-black tracking-widest border border-[#8B5E3C] shadow-lg transition-all rounded-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} /> Back to Campaign
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
