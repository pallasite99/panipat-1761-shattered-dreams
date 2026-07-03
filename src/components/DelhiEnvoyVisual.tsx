import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Award, 
  Flame, 
  Compass, 
  Scroll, 
  Volume2, 
  ChevronRight,
  Shield,
  Flag,
  Skull
} from 'lucide-react';

interface DelhiEnvoyVisualProps {
  onComplete?: () => void;
}

interface CutsceneChapter {
  id: number;
  stageName: string;
  title: string;
  speaker: string;
  speakerRole: string;
  narrative: string;
  visualFocus: string;
  imagePath: string;
  icon: React.ComponentType<any>;
  themeColor: string;
  accentText: string;
}

const CINEMATIC_CHAPTERS: CutsceneChapter[] = [
  {
    id: 1,
    stageName: "MANDATE FROM THE ROYAL COURT",
    title: "Chapter I: The Peshwa's Decree",
    speaker: "Royal Court Envoy",
    speakerRole: "Keeper of the Golden Seal",
    narrative: "Under the shadow of Shaniwar Wada, the Peshwa hand-delivers the royal decree to Sirdar Dattaji Shinde. The mandate is absolute: lead a lightning vanguard of Deccan cavalry straight to Delhi, establish defense alliances, and lock down the northern river basins before the Afghan armies can cross.",
    visualFocus: "decree",
    imagePath: "/src/assets/images/shaniwar_wada_gates_cinematic_1783064539119.jpg",
    icon: Scroll,
    themeColor: "from-amber-950/80 to-stone-950/95",
    accentText: "A solemn charge to protect the northern skies..."
  },
  {
    id: 2,
    stageName: "THE DECCAN CAVALRY MARGINS",
    title: "Chapter II: 4,000 Iron Riders Assemble",
    speaker: "Sirdar Jankoji Shinde",
    speakerRole: "Vanguard Commander",
    narrative: "Under the blazing sun of Gwalior, four thousand veteran horsemen raise their lances. Riding with unmatched speed and minimal baggage, they traverse the dusty plains like a seasonal storm, their horses' hooves drumming a thunderous beat across Central India.",
    visualFocus: "cavalry",
    imagePath: "/src/assets/images/maratha_commanders_cinematic_1783064552255.jpg",
    icon: Shield,
    themeColor: "from-orange-950/80 to-stone-950/95",
    accentText: "Decaying leaves and golden dust follow their march."
  },
  {
    id: 3,
    stageName: "ENTRY INTO THE NORTH",
    title: "Chapter III: Gates of the Red Fort",
    speaker: "Delhi Wazir",
    speakerRole: "Emperor's Chief Advisor",
    narrative: "Dattaji Shinde arrives at the banks of the Yamuna, his dust-coated chargers drinking from the river. The Mughal courtiers in the Red Fort watch in nervous awe as the saffron banners are planted. Treaties are forced, and the authority of Pune is established over the imperial capital.",
    visualFocus: "delhi",
    imagePath: "/src/assets/images/peshwa_throne_cinematic_1783064567599.jpg",
    icon: Flag,
    themeColor: "from-red-950/80 to-stone-950/95",
    accentText: "The Maratha flag flies high above the northern plains!"
  },
  {
    id: 4,
    stageName: "THE RIVER OF DESTINY",
    title: "Chapter IV: Defiance at Barari Ghat",
    speaker: "General Dattaji Shinde",
    speakerRole: "Hero of the Scindia House",
    narrative: "But freezing winter fog brings ominous whispers. The local chiefs correspond secretly with Durrani, and the Maratha vanguard is isolated. On the muddy shores of Barari Ghat, surrounded by the enemy, Dattaji draws his sword and bellows his immortal cry: 'Bachenge toh aur bhi ladenge!'",
    visualFocus: "defiance",
    imagePath: "/src/assets/images/saffron_banner_cinematic_1783064579263.jpg",
    icon: Skull,
    themeColor: "from-yellow-950/80 to-stone-950/95",
    accentText: "No retreat, no surrender. A legend is born in the river mud!"
  }
];

export const DelhiEnvoyVisual: React.FC<DelhiEnvoyVisualProps> = ({ onComplete }) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; size: number; rotate: number; speed: number; type: 'leaf' | 'dust' }>>([]);

  // Generate wind-blown dust and dry leaves
  useEffect(() => {
    const generated = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      size: Math.random() * 10 + 5,
      rotate: Math.random() * 360,
      speed: Math.random() * 5 + 4,
      type: Math.random() > 0.5 ? 'leaf' : 'dust' as const
    }));
    setParticles(generated);
  }, []);

  // Timer for automatic progress
  useEffect(() => {
    setProgress(0);
    const duration = 6500; // 6.5 seconds per chapter
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentChapterIndex]);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        handleNextChapter();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  const handleNextChapter = () => {
    if (currentChapterIndex < CINEMATIC_CHAPTERS.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
    } else {
      if (onComplete) {
        onComplete();
      }
    }
  };

  const currentChapter = CINEMATIC_CHAPTERS[currentChapterIndex];
  const IconComponent = currentChapter.icon;

  return (
    <div className="w-full h-full min-h-[550px] md:min-h-[650px] bg-stone-950 flex flex-col justify-between overflow-hidden relative select-none text-white font-sans">
      
      {/* 1. PARTICLES LAYER */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {particles.map((item) => (
          <div
            key={item.id}
            className="absolute top-[-20px] animate-fall"
            style={{
              left: `${item.left}%`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.speed}s`,
              animationIterationCount: 'infinite',
              transform: `rotate(${item.rotate}deg)`,
            }}
          >
            {item.type === 'leaf' ? (
              // Dry Autumn Leaf for cold northern vibe
              <div 
                className="bg-gradient-to-tr from-amber-700 to-yellow-600 rounded-full opacity-60"
                style={{
                  width: `${item.size}px`,
                  height: `${item.size * 1.5}px`,
                  borderRadius: '60% 10% 60% 40%',
                  boxShadow: '0 2px 4px rgba(120, 53, 4, 0.3)'
                }}
              />
            ) : (
              // Dusty golden air particle
              <div 
                className="bg-yellow-500/40 rounded-full opacity-80 blur-[1px]"
                style={{
                  width: `${item.size * 0.6}px`,
                  height: `${item.size * 0.6}px`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 2. BACKGROUND CINEMATIC PICTURE */}
      <div className="absolute inset-0 z-0 bg-stone-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter.visualFocus}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="w-full h-full absolute inset-0 flex items-center justify-center p-4 md:p-8 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full">
              <motion.img
                src={currentChapter.imagePath}
                alt={currentChapter.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none pointer-events-none opacity-40 filter sepia brightness-90"
                initial={{ scale: 1.15, x: 10, y: 5 }}
                animate={{ scale: 1.03, x: 0, y: 0 }}
                transition={{ duration: 6.8, ease: "linear" }}
              />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/30 to-stone-950/98 z-10" />
              <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-stone-950 via-stone-950/90 to-transparent z-10" />
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-stone-950 via-stone-950/50 to-transparent z-10" />
            </div>

            {/* Middle Content */}
            <div className="relative z-20 w-full max-w-5xl h-full flex items-center justify-center">
              {currentChapter.visualFocus === 'decree' && (
                <motion.div 
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="bg-stone-950/90 border border-amber-600/30 p-6 md:p-8 rounded-xs backdrop-blur-md max-w-lg text-center bronze-bevel"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-full border border-amber-500/35 flex items-center justify-center animate-pulse">
                      <Scroll className="text-saffron w-6 h-6" />
                    </div>
                  </div>
                  <h4 className="font-serif font-black text-md md:text-lg text-saffron uppercase tracking-widest mb-2">
                    THE NORTHERN MANDATE
                  </h4>
                  <p className="text-[10px] md:text-xs font-mono text-stone-300 leading-relaxed uppercase tracking-wider">
                    📜 Establish defensive alliances, secure Mughal tributary status, and prevent the Durrani confederation from cross-pollinating with Rohilla chiefs.
                  </p>
                </motion.div>
              )}

              {currentChapter.visualFocus === 'cavalry' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
                  <motion.div 
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-stone-950/90 border border-saffron/30 p-5 rounded-xs text-center backdrop-blur-sm relative"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-saffron text-stone-950 text-[7px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                      VANGUARD CHIEF
                    </div>
                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-saffron flex items-center justify-center border border-stone-800 mb-2.5 text-stone-950 font-serif font-black text-xs">
                      DS
                    </div>
                    <h4 className="font-serif font-bold text-xs uppercase tracking-wide text-white">Dattaji Shinde</h4>
                    <p className="text-[9px] font-mono text-saffron uppercase tracking-widest mt-1">Fearless Sirdar</p>
                    <p className="text-[9.5px] text-stone-300 font-sans mt-2 leading-relaxed">
                      Known for his indomitable warrior spirit, Dattaji acts as the spearhead of the empire's power projection.
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-stone-950/90 border border-amber-500/30 p-5 rounded-xs text-center backdrop-blur-sm relative"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 text-[7px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                      GWALIOR HEIR
                    </div>
                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center border border-stone-800 mb-2.5 text-stone-950 font-serif font-black text-xs">
                      JS
                    </div>
                    <h4 className="font-serif font-bold text-xs uppercase tracking-wide text-white">Jankoji Shinde</h4>
                    <p className="text-[9px] font-mono text-amber-400 uppercase tracking-widest mt-1">Loyal Nephew</p>
                    <p className="text-[9.5px] text-stone-300 font-sans mt-2 leading-relaxed">
                      A brilliant young commander of the Scindia forces, ready to ride to the ends of Hindusthan under Dattaji's shield.
                    </p>
                  </motion.div>
                </div>
              )}

              {currentChapter.visualFocus === 'delhi' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-stone-950/90 border border-red-800/40 p-6 md:p-8 rounded-xs backdrop-blur-md max-w-lg text-center bronze-bevel"
                >
                  <div className="flex justify-center mb-3">
                    <Flag className="text-saffron w-10 h-10 animate-pulse" />
                  </div>
                  <h4 className="font-serif font-black text-md text-saffron uppercase tracking-widest mb-1">
                    Red Fort Proclomation
                  </h4>
                  <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-3">
                    Securing the Mughal Throne
                  </p>
                  <blockquote className="font-serif italic text-xs md:text-sm text-stone-200 border-l-2 border-saffron/40 pl-3 text-left leading-relaxed">
                    "Pune's arm is long and swift. We stand on the Yamuna as protectors of this crown. Any invader who crosses the Indus must answer to the Scindia spears first!"
                  </blockquote>
                </motion.div>
              )}

              {currentChapter.visualFocus === 'defiance' && (
                <motion.div 
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="bg-gradient-to-t from-red-950/30 to-stone-950/95 border-2 border-red-700/40 p-6 rounded-xs backdrop-blur-md max-w-md shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600" />
                    <div className="flex justify-center mb-2">
                      <Skull className="text-red-500 w-12 h-12 animate-bounce" />
                    </div>
                    <h4 className="font-serif font-black text-md text-red-400 uppercase tracking-widest">
                      BARARI GHAT PROMISE
                    </h4>
                    <p className="text-[9.5px] font-mono text-stone-400 uppercase tracking-widest mb-2">
                      "Bachenge Toh Aur Bhi Ladenge"
                    </p>
                    <p className="text-[11px] text-stone-300 leading-relaxed font-sans text-left">
                      Isolated in a frozen mist, surrounded by Shuja-ud-Daula's betrayal and Abdali's heavy vanguard, Dattaji's defiant stand at Barari Ghat is set in stone. He will fight to his very last breath.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. TOP BAR: TITLE AND METADATA */}
      <div className="relative z-20 w-full p-4 md:p-6 bg-gradient-to-b from-stone-950 via-stone-950/80 to-transparent flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-saffron/15 rounded-xs border border-saffron/30">
            <Compass className="text-saffron animate-bounce" size={16} />
          </div>
          <div>
            <span className="text-[8px] font-mono text-saffron uppercase tracking-[0.25em] block leading-none">
              HISTORICAL IMMERSIVE CUTSCENE
            </span>
            <h1 className="text-md md:text-lg font-serif uppercase tracking-wider text-white mt-1">
              Dattaji Shinde Sent to Delhi
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="p-2 bg-stone-900/95 border border-stone-800 rounded-xs hover:border-saffron/40 transition-colors"
            title={muted ? "Unmute" : "Mute Sound Cues"}
          >
            <Volume2 size={14} className={muted ? "text-stone-500" : "text-saffron"} />
          </button>
          
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 bg-stone-900/95 border border-stone-800 text-stone-400 hover:text-saffron hover:border-saffron/40 text-[9px] font-mono uppercase tracking-widest transition-all rounded-xs hover:scale-105 active:scale-95"
          >
            Skip Cinematic
          </button>
        </div>
      </div>

      {/* 4. MAIN FLOATING TEXT CARD & STAGE SELECTORS */}
      <div className="relative z-20 w-full p-4 md:p-8 bg-gradient-to-t from-stone-950 via-stone-950/98 to-stone-950/20 flex flex-col gap-4">
        
        {/* Progress Bar of Cinematic Sequence */}
        <div className="w-full h-[3px] bg-stone-900 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-500 via-saffron to-yellow-400"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>

        {/* Narrative Box */}
        <div className="bg-stone-950/95 border-2 border-saffron/35 p-5 md:p-6 rounded-xs shadow-2xl flex flex-col md:flex-row gap-5 items-start relative overflow-hidden">
          
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-saffron/5 to-transparent pointer-events-none" />

          {/* Left Icon Panel */}
          <div className="p-3 bg-saffron/10 border border-saffron/30 rounded-xs shrink-0 mx-auto md:mx-0">
            <IconComponent className="text-saffron animate-pulse" size={26} />
          </div>

          {/* Core Story text */}
          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 pb-2 border-b border-stone-900">
              <h3 className="font-serif text-md text-saffron uppercase tracking-wide">
                {currentChapter.title}
              </h3>
              <div className="text-[9px] font-mono text-stone-400 uppercase">
                <span className="text-white font-black">{currentChapter.speaker}</span> • {currentChapter.speakerRole}
              </div>
            </div>
            
            <p className="text-xs md:text-sm text-stone-300 font-sans leading-relaxed pt-2">
              {currentChapter.narrative}
            </p>

            <div className="pt-2 flex items-center justify-center md:justify-start gap-1.5 text-[9px] font-mono text-saffron font-bold">
              <Sparkles size={10} className="animate-spin" />
              <span>{currentChapter.accentText}</span>
            </div>
          </div>
        </div>

        {/* Bottom Sequence Indicators */}
        <div className="flex justify-between items-center mt-2">
          {/* Indicators */}
          <div className="flex gap-2">
            {CINEMATIC_CHAPTERS.map((ch, index) => (
              <div 
                key={ch.id}
                className="flex items-center gap-1"
              >
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentChapterIndex 
                      ? "w-8 bg-saffron" 
                      : index < currentChapterIndex 
                        ? "w-4 bg-amber-800" 
                        : "w-2 bg-stone-800"
                  }`}
                />
                <span className={`text-[7px] font-mono uppercase tracking-widest hidden sm:inline ${
                  index === currentChapterIndex ? "text-saffron font-bold" : "text-stone-600"
                }`}>
                  {ch.id}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[8px] font-mono text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-saffron rounded-full animate-ping" />
            <span>Cinematic playing automatically...</span>
          </div>
        </div>
      </div>

    </div>
  );
};
