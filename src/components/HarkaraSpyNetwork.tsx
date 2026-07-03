import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  MapPin, 
  Eye, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  AlertCircle, 
  Coins, 
  ArrowRight, 
  Cpu, 
  Sparkles,
  RefreshCw,
  Terminal,
  Flag,
  FileText
} from 'lucide-react';
import { panipatAudioEngine } from '../utils/audioSystem';

interface HarkaraLocation {
  id: string;
  name: string;
  coords: { x: number; y: number };
  description: string;
  intelBonus: string;
  cost: number;
  revealedIntel: string;
}

interface InterceptedCipher {
  id: string;
  title: string;
  lore: string;
  scrambledText: string;
  correctText: string;
  shift: number; // Caesar shift value
  difficulty: 'Wary' | 'Severe' | 'Imperial';
  rewardGold: number;
  rewardMorale: number;
}

const HARKARA_ZONES: HarkaraLocation[] = [
  {
    id: 'yamuna_crossings',
    name: 'Yamuna River Ford (Baghpat)',
    coords: { x: 45, y: 35 },
    description: 'The critical river bed where Abdali bypassed the Maratha guard lines.',
    intelBonus: '-15% Monsoon Supply Transit Time & Early Ambush Detection',
    cost: 15000,
    revealedIntel: 'Scouts report Rohilla bridge builders assembled 4 miles downstream. Heavy timber floating suggests bridge completion in 48 hours.'
  },
  {
    id: 'sonepat_plains',
    name: 'Sonepat Grasslands',
    coords: { x: 25, y: 55 },
    description: 'The strategic rear corridor connecting Delhi garrison with Panipat.',
    intelBonus: 'Attrition Protection (+10% starting provisions & route shields)',
    cost: 12000,
    revealedIntel: 'Afghan raiding patrols identified wearing local peasant garbs. They seek to poison the local water wells. Garrison notified.'
  },
  {
    id: 'delhi_highway',
    name: 'Delhi-Karnal Highway',
    coords: { x: 55, y: 70 },
    description: 'The imperial thoroughfare; primary logistical road for grain couriers.',
    intelBonus: '+20% State Treasury Tax Revenue Collection Efficiency',
    cost: 18000,
    revealedIntel: 'Interstellar couriers confirm 3 gold bullion carts departed Shaniwar Wada for Northern reinforcement. Secure escort advised.'
  },
  {
    id: 'panipat_outer_ring',
    name: 'Panipat Foothills & Saltmarshes',
    coords: { x: 75, y: 45 },
    description: 'The treacherous marshy marshes flanking Ibrahim Gardi\'s cannons.',
    intelBonus: '+25% French-pattern Artillery Precision & Splash area',
    cost: 20000,
    revealedIntel: 'Mud layers are deepening due to seasonal frost. Grounding heavy cannons on elevated stone mounds is highly recommended.'
  }
];

const ENEMY_CIPHERS: InterceptedCipher[] = [
  {
    id: 'cipher_najib',
    title: 'Najib-ud-Daula\'s Secret Pact Scroll',
    lore: 'An intercepted letter from Najib-ud-Daula to Shuja-ud-Daula arguing for a rapid joint blockade of the Yamuna crossings.',
    scrambledText: 'WKH RZKDK FDYDOUB LV UHDGB WR PDYFK DW GDZQ HQFLVFOLQJ BHK GLTOL...',
    correctText: 'THE AWADH CAVALRY IS READY TO MARCH AT DAWN ENCIRCLING THE DELHI...',
    shift: 3,
    difficulty: 'Wary',
    rewardGold: 10000,
    rewardMorale: 10
  },
  {
    id: 'cipher_abdali',
    title: 'Ahmad Shah\'s Royal Supply Command',
    lore: 'A coded imperial directive dispatched from Kabul outlining the exact grain replenishment paths bypassing our patrols.',
    scrambledText: 'VREDUX VHQG IRUBB FDPHOV ORDGHG ZLWK ZKHDW WR SDQLSDW WRPRUURZ...',
    correctText: 'SOUPY SEND FORTY CAMELS LOADED WITH WHEAT TO PANIPAT TOMORROW...',
    shift: 3,
    difficulty: 'Severe',
    rewardGold: 15000,
    rewardMorale: 15
  },
  {
    id: 'cipher_attack',
    title: 'Rohilla Midnight Flank Orders',
    lore: 'A high-frequency alert specifying a coordinated ambush against Ibrahim Gardi\'s heavy brass nine-pounder left flank.',
    scrambledText: 'DWWDFN WKH JDUGL DUWLOOHUB DU PDUKB FDPS DW PLGQLJKW ZLWK ILUH...',
    correctText: 'ATTACK THE GARDI ARTILLERY AT MARSHY CAMP AT MIDNIGHT WITH FIRE...',
    shift: 3,
    difficulty: 'Imperial',
    rewardGold: 22000,
    rewardMorale: 20
  }
];

export const HarkaraSpyNetwork: React.FC<{
  onApplyRewards: (rewards: { gold: number; morale: number; text: string }) => void;
}> = ({ onApplyRewards }) => {
  const [intelPoints, setIntelPoints] = useState(30);
  const [deployedSpies, setDeployedSpies] = useState<string[]>([]);
  const [activeCipherIdx, setActiveCipherIdx] = useState(0);
  const [userShift, setUserShift] = useState(0);
  const [decryptedCiphers, setDecryptedCiphers] = useState<string[]>([]);
  const [mapAlert, setMapAlert] = useState<string | null>(null);

  const currentCipher = ENEMY_CIPHERS[activeCipherIdx];

  const handleDeploySpy = (zoneId: string, cost: number, zoneName: string) => {
    panipatAudioEngine.playSfx('click');
    const curGold = parseInt(localStorage.getItem('panipat_campaign_treasury') || '145000', 10);
    
    if (curGold < cost) {
      alert(`⚠️ TREASURY EXHAUSTED!\n\nDeploying a Harkara scout at ${zoneName} requires ${cost.toLocaleString()} Gold Mohurs.`);
      return;
    }

    if (deployedSpies.includes(zoneId)) {
      return;
    }

    // Spend gold and deploy
    const nextGold = curGold - cost;
    localStorage.setItem('panipat_campaign_treasury', nextGold.toString());
    setDeployedSpies([...deployedSpies, zoneId]);
    setIntelPoints(prev => Math.min(100, prev + 20));

    // Play tactile feedback
    panipatAudioEngine.playSfx('stamp');
    setMapAlert(`📡 HARKARA SCOUT DEPLOYED AT ${zoneName.toUpperCase()}!\n\nLogistics and Tactical intelligence unlocked successfully.`);
  };

  const shiftText = (text: string, shiftVal: number): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) { // Uppercase
        let newCode = code - shiftVal;
        if (newCode < 65) newCode += 26;
        if (newCode > 90) newCode -= 26;
        return String.fromCharCode(newCode);
      }
      return char;
    }).join('');
  };

  const currentDecodedText = shiftText(currentCipher.scrambledText, userShift);
  const isDecryptedSuccess = currentDecodedText.substring(0, 15) === currentCipher.correctText.substring(0, 15);

  const handleClaimDecryptionReward = () => {
    if (!isDecryptedSuccess) return;

    panipatAudioEngine.playSfx('stamp');
    setDecryptedCiphers([...decryptedCiphers, currentCipher.id]);
    setIntelPoints(prev => Math.min(100, prev + 25));

    onApplyRewards({
      gold: currentCipher.rewardGold,
      morale: currentCipher.rewardMorale,
      text: `🏆 INTERCEPTED CIPHER DECRYPTED SUCCESSFULLY!\n\nScroll: ${currentCipher.title}\n\nRewarded: +${currentCipher.rewardGold.toLocaleString()} Gold Mohurs & +${currentCipher.rewardMorale}% Morale booster!`
    });

    if (activeCipherIdx < ENEMY_CIPHERS.length - 1) {
      setActiveCipherIdx(activeCipherIdx + 1);
      setUserShift(0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* LEFT PANEL: The Strategic Scout deployment board */}
      <div className="lg:col-span-7 flex flex-col space-y-6">
        <div className="parchment border-2 border-[#8B5E3C]/30 p-6 shadow-xl relative overflow-hidden rounded-xs">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5E3C]/5 rounded-bl-full pointer-events-none flex items-center justify-center">
            <Compass size={24} className="text-[#8B5E3C]/20 animate-spin-slow" />
          </div>

          <h3 className="text-stone-900 font-serif text-lg font-black uppercase tracking-tight mb-2 border-b-2 border-stone-900/10 pb-2">
            📡 Royal Harkara Scout Network
          </h3>
          <p className="text-xs text-stone-700 leading-relaxed font-serif mb-6">
            Harkaras are the legendary eyes and ears of the Shaniwar Wada. Recruit and position expert scouts across strategic river crossings, saltmarshes, and arterial highways to uncover secret enemy movements and secure active tactical defense modifiers.
          </p>

          {/* Interactive SVG/Tactical Scout Map */}
          <div className="relative bg-stone-950 border border-stone-800 rounded-sm overflow-hidden h-72 shadow-inner">
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')" }} />
            
            {/* Visual grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="absolute top-4 left-4 z-10 flex gap-4">
              <div className="bg-stone-900/95 px-3 py-1.5 rounded-xs border border-stone-800 text-[10px] font-mono uppercase text-stone-300">
                ACTIVE SCOUTS: <span className="text-saffron font-black">{deployedSpies.length} / 4</span>
              </div>
              <div className="bg-stone-900/95 px-3 py-1.5 rounded-xs border border-stone-800 text-[10px] font-mono uppercase text-stone-300">
                INTELLIGENCE CAPACITY: <span className="text-[#38bdf8] font-black">{intelPoints}%</span>
              </div>
            </div>

            {/* Render interactive scout locations on map */}
            {HARKARA_ZONES.map(zone => {
              const isDeployed = deployedSpies.includes(zone.id);
              return (
                <div 
                  key={zone.id}
                  className="absolute"
                  style={{ left: `${zone.coords.x}%`, top: `${zone.coords.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <button
                    type="button"
                    onClick={() => handleDeploySpy(zone.id, zone.cost, zone.name)}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border shadow-lg transition-all group ${isDeployed ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse' : 'bg-stone-900 hover:bg-[#8B5E3C] border-stone-700 text-stone-400 hover:text-white'}`}
                  >
                    <MapPin size={14} className={isDeployed ? "animate-bounce" : ""} />
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 bg-stone-950 border border-stone-800 p-2.5 rounded-xs shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 text-left">
                      <h4 className="text-[10px] font-mono text-saffron font-bold uppercase mb-1 tracking-wider">{zone.name}</h4>
                      <p className="text-[9px] text-stone-400 leading-normal mb-1">{zone.description}</p>
                      <div className="text-[8px] font-mono text-emerald-400 font-bold border-t border-stone-850 pt-1">
                        Bonus: {zone.intelBonus}
                      </div>
                      {!isDeployed && (
                        <div className="text-[8.5px] font-mono text-amber-500 font-bold mt-1.5 flex items-center gap-1">
                          <Coins size={9} /> {zone.cost.toLocaleString()} Mohurs
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Reveal panel */}
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-stone-500 text-left">
              📋 DEPLOYED INTEL FEED (REPORTS SECURED)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HARKARA_ZONES.map(zone => {
                const isDeployed = deployedSpies.includes(zone.id);
                return (
                  <div 
                    key={zone.id} 
                    className={`p-3 border rounded-sm text-left transition-all ${isDeployed ? 'bg-[#1D1714] border-[#8B5E3C]/35' : 'bg-stone-100/50 border-stone-900/5 opacity-55'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-black uppercase text-stone-800 flex items-center gap-1.5">
                        <Eye size={11} className={isDeployed ? "text-emerald-500" : "text-stone-400"} />
                        {zone.name.split(' (')[0]}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[7.5px] font-mono font-bold rounded-sm uppercase ${isDeployed ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-stone-300 text-stone-600'}`}>
                        {isDeployed ? 'active' : 'unreached'}
                      </span>
                    </div>
                    <p className="text-[10px] font-serif italic text-stone-700 leading-normal">
                      {isDeployed ? zone.revealedIntel : 'Scout deployment required to intercept messenger couriers.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: The Cipher Intercept Decryption Scriptorium */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        <div className="parchment border-2 border-[#8B5E3C]/30 p-6 shadow-xl relative rounded-xs">
          <h3 className="text-stone-900 font-serif text-lg font-black uppercase tracking-tight mb-2 border-b-2 border-stone-900/10 pb-2">
            🔏 Cipher Decryption Deck
          </h3>
          <p className="text-xs text-stone-700 leading-relaxed font-serif mb-4">
            Decrypt secret enemy directives intercepted from the Durrani alliance riders. Drag the character shift key or click to shift and realign the letter ciphers until the text renders readable.
          </p>

          <div className="bg-stone-950 border border-[#8B5E3C]/25 p-4 rounded-sm relative text-left">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[9px] font-mono text-saffron uppercase font-bold tracking-widest flex items-center gap-1">
                <FileText size={11} /> {currentCipher.title}
              </span>
              <span className={`px-2 py-0.5 text-[8px] font-mono uppercase font-black rounded-sm ${currentCipher.difficulty === 'Wary' ? 'bg-blue-950 text-blue-400 border border-blue-500/20' : currentCipher.difficulty === 'Severe' ? 'bg-amber-950 text-amber-500 border border-amber-500/20' : 'bg-red-955 text-red-400 border border-red-500/20'}`}>
                {currentCipher.difficulty} difficulty
              </span>
            </div>

            <p className="text-[10px] font-serif text-stone-400 leading-normal mb-4 italic">
              "{currentCipher.lore}"
            </p>

            {/* Intercepted scrambled text container */}
            <div className="bg-[#140e0b] border border-stone-850 p-3.5 rounded-xs font-mono text-xs text-stone-300 leading-relaxed tracking-wider break-all text-center">
              <div className="text-[8px] text-stone-500 uppercase tracking-widest mb-1 font-black text-left">
                📜 ENCRYPTED TEXT
              </div>
              <p className="text-stone-400 font-bold select-all">{currentCipher.scrambledText}</p>
            </div>

            {/* Decoded live rendering container */}
            <div className="bg-[#1D1714] border border-[#8B5E3C]/35 p-3.5 rounded-xs font-mono text-xs text-white leading-relaxed tracking-wider break-all text-center mt-3">
              <div className="text-[8px] text-saffron uppercase tracking-widest mb-1 font-black text-left flex items-center justify-between">
                <span>🔍 TRANSLATED RENDERING</span>
                <span className="flex items-center gap-1">
                  {isDecryptedSuccess ? (
                    <span className="text-emerald-400 font-black animate-pulse flex items-center gap-0.5">
                      <Unlock size={10} /> DECRYPTED MATCH
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold flex items-center gap-0.5">
                      <Lock size={10} /> LOCKED CIPHER
                    </span>
                  )}
                </span>
              </div>
              <p className={`font-black ${isDecryptedSuccess ? 'text-emerald-400 font-serif' : 'text-[#8B5E3C]'}`}>
                {currentDecodedText}
              </p>
            </div>

            {/* Slider control to change Shift */}
            <div className="mt-5 space-y-2 border-t border-stone-850 pt-4">
              <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                <span>DECRYPTION SHIFT KEY (SHIFT):</span>
                <span className="text-saffron font-black text-xs font-serif">{userShift}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="25" 
                value={userShift}
                disabled={decryptedCiphers.includes(currentCipher.id)}
                onChange={(e) => {
                  panipatAudioEngine.playSfx('click');
                  setUserShift(Number(e.target.value));
                }}
                className="w-full accent-saffron h-1.5 bg-stone-900 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-stone-500 uppercase">
                <span>No Rotation</span>
                <span>Shift 13 (Rot13)</span>
                <span>Full Cycle</span>
              </div>
            </div>

            {/* Decode submission button */}
            <div className="mt-5 pt-3 border-t border-stone-850">
              <button
                type="button"
                disabled={!isDecryptedSuccess || decryptedCiphers.includes(currentCipher.id)}
                onClick={handleClaimDecryptionReward}
                className={`w-full py-2.5 font-mono text-[9.5px] font-black uppercase tracking-widest rounded transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${isDecryptedSuccess ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600' : 'bg-stone-900 text-stone-500 border border-stone-850 cursor-not-allowed'}`}
              >
                <ShieldCheck size={13} />
                {isDecryptedSuccess ? 'AUTHENTICATE & STAMP LEDGER' : 'REALIGN DECRYPTION KEY'}
              </button>
            </div>
          </div>

          {/* Decryption status tracker */}
          <div className="mt-6 text-left space-y-2.5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-stone-500">
              📜 HISTORICAL MANUSCRIPT DISCLOSURES ({decryptedCiphers.length} / 3)
            </h4>
            <div className="space-y-1.5">
              {ENEMY_CIPHERS.map(c => {
                const isCleared = decryptedCiphers.includes(c.id);
                return (
                  <div key={c.id} className="flex justify-between items-center p-2 bg-stone-100/50 rounded border border-stone-900/5 text-[10px] font-serif italic text-stone-700">
                    <span className="font-bold">{c.title}</span>
                    <span className={`px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase rounded ${isCleared ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/15' : 'bg-stone-200 text-stone-500'}`}>
                      {isCleared ? 'decrypted' : 'awaiting decryption'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up strategic warning or report toast */}
      <AnimatePresence>
        {mapAlert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[1000] p-4"
          >
            <div className="parchment border-4 border-[#8B5E3C] max-w-md w-full p-6 text-left shadow-2xl relative">
              <h3 className="text-stone-900 font-serif text-lg font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                <Compass className="text-saffron animate-spin-slow" /> HARKARA DESPATCH RECEIVED
              </h3>
              <p className="text-xs text-stone-800 font-serif leading-relaxed italic mb-6">
                "{mapAlert}"
              </p>
              <div className="flex justify-end pt-3 border-t border-stone-950/10">
                <button
                  type="button"
                  onClick={() => {
                    panipatAudioEngine.playSfx('stamp');
                    setMapAlert(null);
                  }}
                  className="px-5 py-2.5 bg-stone-950 text-saffron font-mono text-[9px] font-black uppercase tracking-widest rounded-sm cursor-pointer hover:bg-stone-900"
                >
                  STAMP RECEIPT & DISMISS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
