import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, Flame, Trophy } from 'lucide-react';

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface GoldCoin {
  id: number;
  x: number;
  y: number;
  delay: number;
  scale: number;
}

export const PuneCelebrationVisual: React.FC = () => {
  const [drumActive, setDrumActive] = useState<boolean>(false);
  const [drumStats, setDrumStats] = useState<number>(0);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [coins, setCoins] = useState<GoldCoin[]>([]);
  const [celebrationPower, setCelebrationPower] = useState<number>(100);

  // Auto-generate some fireworks and falling coins
  useEffect(() => {
    // Background firework interval
    const fwInterval = setInterval(() => {
      const colors = ['#f59e0b', '#f97316', '#ef4444', '#10b981', '#3b82f6'];
      const newFw: Firework = {
        id: Date.now() + Math.random(),
        x: 40 + Math.random() * 320, // 40 to 360 wide
        y: 30 + Math.random() * 80,  // 30 to 110 high
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      setFireworks(prev => [...prev.slice(-3), newFw]);
    }, 2500);

    // Initial coins
    const baseCoins = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: -10 - Math.random() * 20,
      delay: Math.random() * 4,
      scale: 0.6 + Math.random() * 0.6
    }));
    setCoins(baseCoins);

    return () => clearInterval(fwInterval);
  }, []);

  const triggerManualFirework = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgWidth = 400;
    const svgHeight = 300;
    
    // Scale client coordinate to SVG viewBox
    const x = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const y = ((e.clientY - rect.top) / rect.height) * svgHeight;

    if (y < 160) { // Only high in the sky
      const colors = ['#f59e0b', '#ea580c', '#e11d48', '#f87171', '#fbbf24'];
      const clickFw: Firework = {
        id: Date.now() + Math.random(),
        x,
        y: Math.max(20, y),
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      setFireworks(prev => [...prev.slice(-4), clickFw]);
      setCelebrationPower(p => Math.min(200, p + 15));
    }
  };

  const handleDrumBeat = () => {
    setDrumActive(true);
    setDrumStats(prev => prev + 1);
    setCelebrationPower(p => Math.min(200, p + 10));
    
    // Launch a spectacular high-power firework
    const colors = ['#f59e0b', '#fb7185', '#fcd34d', '#34d399'];
    const drumFw: Firework = {
      id: Date.now() + Math.random(),
      x: 100 + Math.random() * 200,
      y: 40 + Math.random() * 50,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setFireworks(prev => [...prev.slice(-3), drumFw]);

    setTimeout(() => {
      setDrumActive(false);
    }, 200);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Visual Canvas Panel */}
      <div 
        id="pune-celebration-visual-card"
        className="relative w-full aspect-[4/3] bg-[#0b0806] rounded-xs border-2 border-amber-600/35 overflow-hidden flex flex-col justify-end shadow-2xl group"
      >
        {/* Sky Ambient Glow Gradient */}
        <div className="absolute inset-0 bg-radial-gradient from-amber-950/20 via-stone-950/80 to-black pointer-events-none" />
        
        {/* Confetti / Golden Dust Particles loop */}
        <div className="absolute inset-x-0 top-0 bottom-12 overflow-hidden pointer-events-none opacity-45">
          <div className="absolute inset-0 bg-[radial-gradient(#fecdd3_1px,transparent_1px)] [background-size:16px_16px] animate-[pulse_3s_infinite]" />
        </div>

        {/* Falling Gold Coins (Souverign Tributes) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {coins.map(coin => (
            <motion.div
              key={coin.id}
              initial={{ y: -50, x: `${coin.x}%`, rotate: 0, opacity: 0 }}
              animate={{ 
                y: 350, 
                rotate: 360, 
                opacity: [0, 1, 1, 0],
                x: `${coin.x + Math.sin(coin.id) * 5}%`
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: coin.delay,
                ease: "linear"
              }}
              style={{ scale: coin.scale }}
              className="absolute w-3 h-3 bg-gradient-to-tr from-amber-400 to-yellow-250 rounded-full border border-yellow-100 shadow-md flex items-center justify-center text-[5px] font-mono font-black text-amber-950 select-none"
            >
              ⚜️
            </motion.div>
          ))}
        </div>

        {/* Interactive Sky Overlay message */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 text-[9px] font-mono uppercase tracking-[0.2em] bg-stone-950/90 border border-amber-800/40 text-amber-500 py-1 px-2.5 rounded-full pointer-events-none shadow-md">
          ✨ Click the sky to launch Victory Rockets!
        </div>

        {/* SVG Drawing Canvas of Shaniwar Wada Delhi Gate Celebration */}
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full relative z-10 cursor-crosshair pb-3 select-none"
          onClick={triggerManualFirework}
        >
          {/* Distant Pune Hills at Night */}
          <path d="M 0 190 Q 70 170 150 185 Q 220 178 300 190 Q 360 183 400 192 L 400 230 L 0 230 Z" fill="#130e0b" />
          <path d="M 0 194 C 50 185, 120 180, 200 195 C 280 180, 350 190, 400 195 L 400 230 L 0 230 Z" fill="#19120c" />

          {/* Sparklers Firework Animations */}
          <AnimatePresence>
            {fireworks.map(fw => (
              <g key={fw.id}>
                {/* Center flash */}
                <motion.circle
                  initial={{ r: 1, opacity: 1 }}
                  animate={{ r: [2, 10, 0], opacity: [1, 0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  cx={fw.x}
                  cy={fw.y}
                  fill="#ffffff"
                />
                
                {/* Starburst sparks */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, k) => {
                  const rad = (angle * Math.PI) / 180;
                  const dx = Math.cos(rad);
                  const dy = Math.sin(rad);
                  return (
                    <motion.line
                      key={k}
                      initial={{ x1: fw.x, y1: fw.y, x2: fw.x, y2: fw.y, opacity: 1 }}
                      animate={{
                        x2: fw.x + dx * 32,
                        y2: fw.y + dy * 32,
                        opacity: [1, 0.4, 0]
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      stroke={fw.color}
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Ambient glow */}
                <circle cx={fw.x} cy={fw.y} r="25" fill={fw.color} opacity="0.15" className="blur-xl" />
              </g>
            ))}
          </AnimatePresence>

          {/* Flame Torches on Castle Walls (Flickering) */}
          {[60, 115, 285, 340].map((tx, idx) => (
            <g key={idx} transform={`translate(${tx}, 142)`}>
              {/* Torch mount */}
              <line x1="0" y1="0" x2="3" y2="-6" stroke="#555" strokeWidth="2.5" />
              <rect x="1" y="-9" width="4" height="4" fill="#333" />
              {/* Animated flame particle */}
              <motion.circle
                animate={{
                  r: [2, 3.5, 2],
                  y: [-9, -13, -9],
                  fill: ['#f59e0b', '#ef4444', '#facc15']
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.4 + idx * 0.15,
                  ease: "easeInOut"
                }}
                cx="3"
                cy="-9"
                r="3"
              />
              <circle cx="3" cy="-11" r="6" fill="#facc15" opacity="0.15" className="animate-pulse" />
            </g>
          ))}

          {/* --- SHANIWAR WADA FORTRESS STRUCTURE (DELHI GATE) --- */}
          {/* Main Stone Wall base */}
          <rect x="40" y="150" width="320" height="85" fill="#2d1f14" stroke="#1c1209" strokeWidth="2" />
          
          {/* Left Wing Bastion */}
          <polygon points="40,235 40,135 15,135 15,142 8,142 8,150 15,150 15,235" fill="#1f150d" />
          <path d="M 8 135 H 42 V 150 H 8 Z" fill="#130a05" />
          {/* Right Wing Bastion */}
          <polygon points="360,235 360,135 385,135 385,142 392,142 392,150 385,150 385,235" fill="#1f150d" />
          <path d="M 358 135 H 392 V 150 H 358 Z" fill="#130a05" />

          {/* Center gateway arch */}
          <path d="M 160 235 V 180 Q 200 155 240 180 V 235 Z" fill="#100b08" stroke="#1f150d" strokeWidth="3" />
          {/* Heavy Spiked Wooden Gate (Draped open in triumph, allowing victory procession) */}
          {/* Left Door */}
          <rect x="162" y="181" width="36" height="53" fill="#311c0f" opacity="0.85" />
          <line x1="164" y1="181" x2="164" y2="234" stroke="#facc15" strokeWidth="1" strokeDasharray="2 3" /> {/* Spikes */}
          <line x1="172" y1="181" x2="172" y2="234" stroke="#facc15" strokeWidth="1" strokeDasharray="2 3" />
          {/* Right Door */}
          <rect x="202" y="181" width="36" height="53" fill="#311c0f" opacity="0.85" />
          <line x1="236" y1="181" x2="236" y2="234" stroke="#facc15" strokeWidth="1" strokeDasharray="2 3" /> {/* Spikes */}
          <line x1="228" y1="181" x2="228" y2="234" stroke="#facc15" strokeWidth="1" strokeDasharray="2 3" />

          {/* Signature Shaniwar Wada Balcony (Nagar Khana Above Gate) */}
          <rect x="145" y="125" width="110" height="25" fill="#3d2719" stroke="#130904" strokeWidth="2" />
          {/* Balcony pillars */}
          {[150, 165, 180, 195, 210, 225, 240, 250].map((px) => (
            <line key={px} x1={px} y1="125" x2={px} y2="150" stroke="#f59e0b" strokeWidth="1.5" />
          ))}
          {/* Balcony roof / Arch */}
          <polygon points="140,125 155,108 245,108 260,125" fill="#ac6739" />
          <line x1="140" y1="125" x2="260" y2="125" stroke="#facc15" strokeWidth="2" />

          {/* Saffron Jaripatka Pride Flags draped on Bastions */}
          {/* Left Bastion Flag */}
          <line x1="28" y1="135" x2="28" y2="92" stroke="#d97706" strokeWidth="2" />
          <motion.path
            animate={{
              d: [
                "M 28 92 L 54 99 L 28 106 L 48 113 L 28 120 Z",
                "M 28 92 L 51 101 L 28 108 L 45 111 L 28 120 Z",
                "M 28 92 L 54 99 L 28 106 L 48 113 L 28 120 Z"
              ]
            }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            fill="#f97316"
            stroke="#fcd34d"
            strokeWidth="0.5"
          />

          {/* Right Bastion Flag */}
          <line x1="372" y1="135" x2="372" y2="92" stroke="#d97706" strokeWidth="2" />
          <motion.path
            animate={{
              d: [
                "M 372 92 L 398 99 L 372 106 L 392 113 L 372 120 Z",
                "M 372 92 L 395 101 L 372 108 L 389 111 L 372 120 Z",
                "M 372 92 L 398 99 L 372 106 L 392 113 L 372 120 Z"
              ]
            }}
            transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}
            fill="#f97316"
            stroke="#fcd34d"
            strokeWidth="0.5"
          />

          {/* Saffron powder loops / Saffron clouds rising from bottom */}
          <motion.circle
            animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ repeat: Infinity, duration: 3 }}
            cx="200" cy="225" r="45" fill="#f97316" opacity="0.2" className="blur-xl pointer-events-none"
          />

          {/* --- CROWD CELEBRATIONS SILHOUETTES AT THE GATE --- */}
          {/* Clashing spears, raised flags, rejoicing people silhouettes */}
          <path d="M 40 235 Q 110 228 160 235 Q 240 235 400 235" stroke="#120c08" strokeWidth="8" />
          
          {/* Citizen shapes (rejoicing silhouette path) */}
          <path d="
            M 10 235 
            Q 13 226 15 224 Q 18 226 20 235
            M 30 235 Q 35 218 38 215 Q 41 218 45 235
            M 60 235 Q 63 224 66 220 Q 70 224 75 235
            M 90 235 Q 94 220 98 217 Q 102 220 106 235
            M 120 235 Q 125 215 130 210 Q 135 215 140 235
            M 260 235 Q 265 212 270 208 Q 275 212 280 235
            M 300 235 Q 303 222 306 220 Q 310 222 315 235
            M 330 235 Q 334 218 338 215 Q 342 218 346 235
            M 380 235 Q 383 225 386 222 Q 390 225 393 235
          " fill="#0f0906" stroke="#000" strokeWidth="1" />

          {/* Raised Spears / Swords fluttering jaripatka banners */}
          <g stroke="#221105" strokeWidth="1.5">
            {/* Left group */}
            <line x1="50" y1="235" x2="45" y2="195" />
            <polygon points="45,195 48,198 42,198" fill="#cbd5e1" stroke="none" />
            
            <line x1="80" y1="235" x2="88" y2="185" />
            <polygon points="88,185 86,189 91,189" fill="#cbd5e1" stroke="none" />
            {/* Saffron ribbon on spear */}
            <path d="M 88 190 Q 98 192 104 188 L 88 194 Z" fill="#ea580c" stroke="none" />

            <line x1="125" y1="235" x2="115" y2="190" />
            <line x1="135" y1="235" x2="148" y2="195" />

            {/* Right group */}
            <line x1="285" y1="235" x2="272" y2="188" />
            <polygon points="272,188 270,192 275,192" fill="#cbd5e1" stroke="none" />
            <path d="M 272 191 Q 262 193 255 189 L 272 195 Z" fill="#ea580c" stroke="none" />

            <line x1="315" y1="235" x2="322" y2="185" />
            <line x1="355" y1="235" x2="350" y2="195" />
          </g>

          {/* --- VICOTRY PROCESSION ELEPHANT (CENTER FORWARD) --- */}
          {/* Highly stylized caparisoned imperial banner elephant stepping through the gates of Delhi Gate */}
          <g transform="translate(162, 190)">
            {/* Elephants Body */}
            <ellipse cx="38" cy="32" rx="22" ry="14" fill="#374151" stroke="#111827" strokeWidth="1.5" />
            {/* Head */}
            <circle cx="16" cy="24" r="11" fill="#374151" stroke="#111827" strokeWidth="1.5" />
            {/* Ear */}
            <path d="M 22 18 Q 30 18 24 28 Q 18 28 22 18 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="1" />
            {/* Trunk */}
            <path d="M 10 26 Q 2 30 4 38 Q 6 38 6 32" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
            {/* Golden Head Cap / Shringara */}
            <polygon points="12,14 20,14 16,22" fill="#facc15" stroke="#b45309" strokeWidth="0.5" />
            <circle cx="16" cy="18" r="1.5" fill="#ef4444" />
            
            {/* Caparison (Jhool - Royal Red/Gold cloth) */}
            <path d="M 22 28 Q 38 24 54 28 Q 50 44 38 44 Q 26 44 22 28 Z" fill="#b91c1c" stroke="#d97706" strokeWidth="1" />
            <rect x="30" y="32" width="16" height="10" fill="#facc15" opacity="0.8" />
            
            {/* Tusks */}
            <path d="M 10 28 Q 6 28 8 26" fill="none" stroke="#fff" strokeWidth="1.5" />

            {/* Saffron Standard Bearer sitting on top of the howdah */}
            <rect x="32" y="10" width="14" height="9" fill="#acc639" opacity="0" /> {/* howdah seat */}
            <path d="M 30 12 L 48 12 L 44 18 L 34 18 Z" fill="#78350f" stroke="#000" strokeWidth="0.5" />
            
            {/* Soldier sitting inside */}
            <circle cx="39" cy="8" r="3.5" fill="#fbcfe8" /> {/* face */}
            <path d="M 39 2 L 43 5 L 39 8 Z" fill="#ea580c" /> {/* pagri */}
            {/* Standard banner pole */}
            <line x1="44" y1="-12" x2="44" y2="16" stroke="#b45309" strokeWidth="1.5" />
            {/* Jaripatka flag on elephant */}
            <motion.path
              animate={{
                d: [
                  "M 44 -12 L 64 -7 L 44 -2 L 58 3 L 44 8 Z",
                  "M 44 -12 L 61 -6 L 44 -1 L 55 4 L 44 8 Z",
                  "M 44 -12 L 64 -7 L 44 -2 L 58 3 L 44 8 Z"
                ]
              }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
              fill="#ea580c"
              stroke="#fbbf24"
              strokeWidth="0.5"
            />
          </g>

          {/* --- MASSIVE CEREMONIAL VICTORY DRUMS (DHOL-TASHA) --- */}
          {/* Animated pulsing shockwaves when drum is beaten */}
          {drumActive && (
            <>
              {/* Left Drum Shockwave */}
              <motion.circle
                initial={{ r: 15, opacity: 0.8 }}
                animate={{ r: 90, opacity: 0 }}
                transition={{ duration: 0.4 }}
                cx="90"
                cy="255"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                className="pointer-events-none"
              />
              {/* Right Drum Shockwave */}
              <motion.circle
                initial={{ r: 15, opacity: 0.8 }}
                animate={{ r: 90, opacity: 0 }}
                transition={{ duration: 0.4 }}
                cx="310"
                cy="255"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                className="pointer-events-none"
              />
            </>
          )}

          {/* Left Ceremonial Nagada Drum */}
          <g transform="translate(90, 255)">
            <ellipse cx="0" cy="0" rx="14" ry="7" fill="#451a03" stroke="#eab308" strokeWidth="1" />
            <path d="M -14 0 Q -10 18 0 18 Q 10 18 14 0 Z" fill="#78350f" stroke="#eab308" strokeWidth="1.2" />
            {/* Drum skin */}
            <ellipse cx="0" cy="-1.5" rx="12" ry="5.5" fill="#fef08a" opacity="0.9" />
            {/* Crossed beat sticks */}
            <line x1="-10" y1="-8" x2="3" y2="4" stroke="#451a03" strokeWidth="1.5" />
            <line x1="10" y1="-8" x2="-3" y2="4" stroke="#451a03" strokeWidth="1.5" />
          </g>

          {/* Right Ceremonial Nagada Drum */}
          <g transform="translate(310, 255)">
            <ellipse cx="0" cy="0" rx="14" ry="7" fill="#451a03" stroke="#eab308" strokeWidth="1" />
            <path d="M -14 0 Q -10 18 0 18 Q 10 18 14 0 Z" fill="#78350f" stroke="#eab308" strokeWidth="1.2" />
            {/* Drum skin */}
            <ellipse cx="0" cy="-1.5" rx="12" ry="5.5" fill="#fef08a" opacity="0.9" />
            {/* Crossed beat sticks */}
            <line x1="-10" y1="-8" x2="3" y2="4" stroke="#451a03" strokeWidth="1.5" />
            <line x1="10" y1="-8" x2="-3" y2="4" stroke="#451a03" strokeWidth="1.5" />
          </g>
        </svg>

        {/* Shaniwar Wada Signet overlay bottom left */}
        <div className="absolute bottom-3 left-3 bg-stone-950/85 border border-[#8B5E3C]/30 px-2.5 py-1.5 rounded-xs pointer-events-none">
          <span className="text-[7.5px] font-mono text-amber-500 block leading-none font-bold uppercase tracking-wider">
            DECCAN TRIUMPH
          </span>
          <span className="text-[10px] text-white font-serif font-black block mt-0.5">
            SHANIWAR WADA PALACE
          </span>
        </div>

        {/* Celebration Multiplier Tracker bottom right */}
        <div className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-950/90 to-red-950/90 border border-saffron/45 px-2.5 py-1 rounded-sm flex items-center gap-1.5 pointer-events-none animate-pulse">
          <Sparkles size={11} className="text-saffron shrink-0" />
          <span className="text-[8px] font-mono text-stone-300">FEVER STATE:</span>
          <span className="text-[10px] font-mono font-black text-saffron">
            {celebrationPower}%
          </span>
        </div>
      </div>

      {/* Interactive Drum-Beater Button panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleDrumBeat}
          className={`py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-stone-950 font-mono font-black text-[11px] uppercase tracking-widest border border-amber-400 rounded-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
            drumActive ? 'scale-98 border-white ring-2 ring-amber-400' : ''
          }`}
        >
          🥁 BEAT THE DHOL-TASHA GRAND DRUMS
          <span className="px-1.5 py-0.5 bg-amber-950 text-white font-mono text-[9px] rounded-xs">
            {drumStats}
          </span>
        </button>

        <div className="p-3 bg-stone-950 border border-stone-850 rounded-xs text-left flex gap-3.5 items-center">
          <div className="p-2 bg-saffron/10 rounded-xs">
            <Trophy className="text-saffron shrink-0" size={16} />
          </div>
          <div>
            <h5 className="text-[10.5px] font-sans font-black text-white uppercase tracking-wider">
              6,000,000 Rupee Tribute
            </h5>
            <p className="text-[9.5px] font-sans text-stone-400 leading-tight mt-0.5">
              Securely hauled into Shaniwar Wada's state vaults. Fully finances Ibrahim Khan's heavy cannons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
