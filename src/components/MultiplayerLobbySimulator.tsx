import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Users, MessageSquare, Shield, ShieldCheck, Play, Send, Zap, ChevronRight, RefreshCw } from 'lucide-react';

interface LobbyRoom {
  id: string;
  name: string;
  players: string;
  region: string;
  ping: number;
  status: 'Waiting' | 'In Battle' | 'Full';
}

const INITIAL_ROOMS: LobbyRoom[] = [
  { id: '1', name: '🛡️ Deccan Vanguard Scrim', players: '1/2', region: 'Asia-Mumbai', ping: 35, status: 'Waiting' },
  { id: '2', name: '⚔️ Ahmad Abdali Grand Finals', players: '2/2', region: 'Europe-West', ping: 120, status: 'In Battle' },
  { id: '3', name: '🔥 Gardi Battery Calibration Run', players: '1/2', region: 'Asia-Mumbai', ping: 42, status: 'Waiting' },
  { id: '4', name: '🐎 Holkar Guerrilla Raid Tactics', players: '0/2', region: 'US-East', ping: 210, status: 'Waiting' }
];

const CHAT_TEMPLATES = [
  { sender: 'Sirdar_Scindia99', text: 'Who is ready to defend Kunjpura?' },
  { sender: 'DurraniCamelLancer', text: 'My Zamburaks are ready to pierce your ranks.' },
  { sender: 'PeshwaWarrior', text: 'Need a teammate for the central redoubt!' },
  { sender: 'FrenchArtilleryGardi', text: 'Gardi gunners represent!' }
];

interface LogEntry {
  turn: number;
  actor: 'Player' | 'Opponent' | 'System';
  message: string;
}

export const MultiplayerLobbySimulator: React.FC<{
  onApplyRewards?: (rewards: { gold: number; provisions?: number; morale: number; text: string }) => void;
}> = ({ onApplyRewards }) => {
  const [rooms, setRooms] = useState<LobbyRoom[]>(INITIAL_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<LobbyRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'DurraniCamelLancer', text: 'My Zamburaks are ready to pierce your ranks.', time: '22:15' },
    { sender: 'PeshwaWarrior', text: 'Need a teammate for the central redoubt!', time: '22:16' }
  ]);
  const [typedChat, setTypedChat] = useState('');
  const [gameState, setGameState] = useState<'lobby' | 'ready_up' | 'battle' | 'results'>('lobby');
  const [isReady, setIsReady] = useState(false);
  const [opponentName, setOpponentName] = useState('DurraniCamelLancer');

  // Battle state
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [playerStamina, setPlayerStamina] = useState(3);
  const [battleLogs, setBattleLogs] = useState<LogEntry[]>([
    { turn: 0, actor: 'System', message: 'Battle commenced! Deccani Lancers vs. Durrani Camel Corps.' }
  ]);
  const [turnNumber, setTurnNumber] = useState(1);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);

  // Chat auto-simulator
  useEffect(() => {
    if (gameState !== 'lobby') return;
    const interval = setInterval(() => {
      const template = CHAT_TEMPLATES[Math.floor(Math.random() * CHAT_TEMPLATES.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setChatMessages((prev) => [...prev.slice(-15), { ...template, time: timeStr }]);
    }, 8000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Opponent ready check simulator
  useEffect(() => {
    if (gameState === 'ready_up') {
      const timer = setTimeout(() => {
        setBattleLogs([{ turn: 0, actor: 'System', message: `Matched with opponent: ${opponentName} (Ping: ${selectedRoom?.ping}ms)` }]);
        setGameState('battle');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Handle player sending chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedChat.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setChatMessages((prev) => [...prev, { sender: 'Peshwa_Player', text: typedChat, time: timeStr }]);
    setTypedChat('');
  };

  const handleJoinRoom = (room: LobbyRoom) => {
    setSelectedRoom(room);
    setOpponentName(room.id === '1' ? 'AhmadShahWarrior' : 'DurraniCamelLancer');
    setGameState('ready_up');
  };

  // Turn-based battle moves
  const executeCombatAction = (actionType: 'charge' | 'barrage' | 'outmaneuver') => {
    if (playerHp <= 0 || opponentHp <= 0) return;

    let pDamage = 0;
    let oDamage = 0;
    let logMsg = '';
    let oppLogMsg = '';

    if (actionType === 'charge') {
      pDamage = Math.floor(Math.random() * 15) + 15;
      logMsg = `Player ordered a fierce Deccani cavalry charge, crushing the enemy ranks for ${pDamage} damage!`;
    } else if (actionType === 'barrage') {
      pDamage = Math.floor(Math.random() * 25) + 10;
      logMsg = `Player ordered Ibrahim Gardi's heavy guns to barrage, inflicting ${pDamage} splash fire damage!`;
    } else if (actionType === 'outmaneuver') {
      pDamage = Math.floor(Math.random() * 10) + 10;
      logMsg = `Player outmaneuvered the Durrani camel scouts, dealing ${pDamage} precision damage and reclaiming stamina!`;
    }

    // Opponent counter action simulator
    const actions = ['charge', 'camel_snipers', 'fortify'];
    const oppAction = actions[Math.floor(Math.random() * actions.length)];
    if (oppAction === 'charge') {
      oDamage = Math.floor(Math.random() * 12) + 12;
      oppLogMsg = `Opponent launched a Camel Corps counter-charge, inflicting ${oDamage} damage!`;
    } else if (oppAction === 'camel_snipers') {
      oDamage = Math.floor(Math.random() * 18) + 10;
      oppLogMsg = `Opponent's Rohilla snipers hit our cavalry lanes, dealing ${oDamage} damage!`;
    } else {
      oDamage = Math.floor(Math.random() * 8) + 5;
      oppLogMsg = `Opponent fortified their river line, dealing ${oDamage} return fire damage.`;
    }

    const nextPlayerHp = Math.max(0, playerHp - oDamage);
    const nextOpponentHp = Math.max(0, opponentHp - pDamage);

    setPlayerHp(nextPlayerHp);
    setOpponentHp(nextOpponentHp);

    const newLogs: LogEntry[] = [
      { turn: turnNumber, actor: 'Player', message: logMsg },
      { turn: turnNumber, actor: 'Opponent', message: oppLogMsg }
    ];

    setBattleLogs((prev) => [...prev, ...newLogs]);
    setTurnNumber((prev) => prev + 1);

    // End condition
    if (nextOpponentHp <= 0 && nextPlayerHp > 0) {
      setBattleResult('victory');
      setGameState('results');
      if (onApplyRewards) onApplyRewards({ gold: 15000, morale: 25, provisions: 0, text: "Victory in Multiplayer match sector!" });
    } else if (nextPlayerHp <= 0 && nextOpponentHp > 0) {
      setBattleResult('defeat');
      setGameState('results');
      if (onApplyRewards) onApplyRewards({ gold: 0, morale: -15, provisions: 0, text: "Defeat in Multiplayer match sector." });
    } else if (nextPlayerHp <= 0 && nextOpponentHp <= 0) {
      setBattleResult('victory'); // Draw favors player in simulation
      setGameState('results');
    }
  };

  const resetSimulator = () => {
    setGameState('lobby');
    setSelectedRoom(null);
    setIsReady(false);
    setPlayerHp(100);
    setOpponentHp(100);
    setTurnNumber(1);
    setBattleResult(null);
  };

  return (
    <div className="bg-stone-900 border border-stone-850 p-6 rounded-sm text-left shadow-2xl relative">
      <div className="flex justify-between items-center border-b border-stone-800 pb-3 mb-4">
        <div>
          <h3 className="font-serif text-base text-saffron uppercase tracking-widest font-black flex items-center gap-2">
            <Globe size={18} className="text-saffron" /> Multiplayer Matchmaking Arena
          </h3>
          <p className="text-[10px] text-stone-500 font-mono mt-0.5">SIMULATED CROSS-NETWORK MULTIPLAYER</p>
        </div>
        <button
          onClick={resetSimulator}
          className="flex items-center gap-1 px-2.5 py-1 border border-stone-800 hover:border-saffron text-stone-400 hover:text-white font-mono text-[9px] uppercase tracking-widest rounded-sm transition-all cursor-pointer"
        >
          <RefreshCw size={10} /> Reset Arena
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* STATE 1: LOBBY SELECT */}
        {gameState === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Rooms Index */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="font-serif text-xs text-stone-300 uppercase tracking-widest font-bold">Active Combat Rooms</h4>
              <div className="space-y-3.5">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 bg-stone-950/60 border border-stone-850 hover:border-stone-700 transition-all rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-black text-white text-xs">{room.name}</span>
                        <span className={`text-[7px] font-mono px-2 py-0.5 border rounded-sm font-bold uppercase ${room.status === 'Waiting' ? 'border-emerald-900 bg-emerald-950/20 text-emerald-500' : 'border-stone-800 bg-stone-900 text-stone-500'}`}>
                          {room.status}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-[9px] text-stone-500 font-mono">
                        <span>REGION: <strong className="text-stone-400">{room.region}</strong></span>
                        <span>LATENCY: <strong className={room.ping > 100 ? 'text-red-500' : 'text-green-500'}>{room.ping} ms</strong></span>
                        <span>PLAYERS: <strong className="text-stone-400">{room.players}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinRoom(room)}
                      disabled={room.status !== 'Waiting'}
                      className="px-4 py-2 bg-saffron hover:bg-yellow-500 text-stone-950 font-mono text-[9px] font-black uppercase tracking-widest rounded-sm disabled:opacity-40 transition-all cursor-pointer shadow-md"
                    >
                      Join Room
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Lobby */}
            <div className="lg:col-span-5 bg-stone-950/60 border border-stone-850 p-4 rounded-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <h4 className="font-serif text-xs text-stone-300 uppercase tracking-widest font-black border-b border-stone-800 pb-2 mb-3 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-saffron" /> Global Recruits Chat
                </h4>
                <div className="h-44 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar text-[11px]">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="text-left font-sans">
                      <span className="text-stone-500 font-mono text-[9px] mr-1">[{msg.time}]</span>
                      <span className="text-saffron font-mono font-bold mr-1.5">{msg.sender}:</span>
                      <span className="text-stone-300 font-sans leading-normal">{msg.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2 border-t border-stone-850 pt-3 mt-4">
                <input
                  type="text"
                  value={typedChat}
                  onChange={(e) => setTypedChat(e.target.value)}
                  placeholder="Draft recruit dispatch..."
                  className="flex-1 bg-stone-900 border border-stone-800 text-stone-200 text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-saffron font-sans"
                />
                <button
                  type="submit"
                  className="p-2 bg-stone-800 hover:bg-saffron text-stone-400 hover:text-stone-955 rounded-sm transition-all cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* STATE 2: READY UP STAGE */}
        {gameState === 'ready_up' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 rounded-full border-4 border-saffron/30 border-t-saffron animate-spin flex items-center justify-center mb-6" />
            <h4 className="font-serif text-white text-lg uppercase tracking-widest font-black mb-1">
              Establishing Safe Connection Link
            </h4>
            <p className="text-stone-500 font-mono text-xs mb-6 uppercase">
              ROOM: {selectedRoom?.name} • PING: {selectedRoom?.ping}ms
            </p>

            <div className="bg-stone-950 p-6 border border-stone-850 rounded-sm w-full max-w-md flex justify-around items-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-saffron bg-saffron/10 flex items-center justify-center text-saffron text-lg font-serif mb-2 font-bold">
                  PW
                </div>
                <span className="text-[10px] font-mono text-stone-400">Peshwa_Player</span>
                <div className="text-[8px] font-mono text-green-500 mt-1 uppercase font-bold">READY</div>
              </div>

              <div className="text-stone-600 font-mono text-xs uppercase tracking-widest">VS</div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-afghan-red bg-red-950/20 flex items-center justify-center text-red-500 text-lg font-serif mb-2 font-bold">
                  DC
                </div>
                <span className="text-[10px] font-mono text-stone-400">{opponentName}</span>
                <div className="text-[8px] font-mono text-stone-500 mt-1 uppercase font-bold animate-pulse">CONNECTING</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE 3: BATTLE SCENE */}
        {gameState === 'battle' && (
          <motion.div
            key="battle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Arena HUD Panel */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                <h4 className="font-serif text-xs text-stone-400 uppercase tracking-widest">Frontier Tactical Grid</h4>
                <span className="text-[10px] font-mono text-saffron uppercase font-bold">Combat Turn: {turnNumber}</span>
              </div>

              {/* HPs bars */}
              <div className="grid grid-cols-2 gap-6 bg-stone-950 p-5 border border-stone-850 rounded-sm">
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1.5 uppercase font-bold">
                    <span className="text-stone-300">Peshwa_Player (Maratha)</span>
                    <span className="text-saffron">{playerHp}/100</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-900 border border-stone-800 rounded-sm overflow-hidden">
                    <div className="h-full bg-saffron transition-all duration-300" style={{ width: `${playerHp}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1.5 uppercase font-bold">
                    <span className="text-stone-400">{opponentName} (Afghan)</span>
                    <span className="text-red-500">{opponentHp}/100</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-900 border border-stone-800 rounded-sm overflow-hidden">
                    <div className="h-full bg-red-650 transition-all duration-300 animate-pulse" style={{ width: `${opponentHp}%` }} />
                  </div>
                </div>
              </div>

              {/* Combat moves selection */}
              <div className="space-y-3">
                <h5 className="font-serif text-[11px] text-stone-400 uppercase tracking-wider font-bold">Select Tactical Command Move:</h5>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => executeCombatAction('charge')}
                    className="p-4 bg-stone-950 hover:bg-stone-900 border border-stone-850 hover:border-saffron rounded-sm text-center font-serif transition-all cursor-pointer flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">🐎</span>
                    <span className="text-[10px] text-white uppercase font-bold tracking-wider">Cavalry Rush</span>
                    <span className="text-[8px] text-stone-500 font-mono">15-30 Direct Damage</span>
                  </button>

                  <button
                    onClick={() => executeCombatAction('barrage')}
                    className="p-4 bg-stone-950 hover:bg-stone-900 border border-stone-850 hover:border-saffron rounded-sm text-center font-serif transition-all cursor-pointer flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">🔥</span>
                    <span className="text-[10px] text-white uppercase font-bold tracking-wider">Artillery Volley</span>
                    <span className="text-[8px] text-stone-500 font-mono">10-35 Splash Fire</span>
                  </button>

                  <button
                    onClick={() => executeCombatAction('outmaneuver')}
                    className="p-4 bg-stone-950 hover:bg-stone-900 border border-stone-850 hover:border-saffron rounded-sm text-center font-serif transition-all cursor-pointer flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">🧭</span>
                    <span className="text-[10px] text-white uppercase font-bold tracking-wider">Outmaneuver</span>
                    <span className="text-[8px] text-stone-500 font-mono">10-20 Tactical Damage</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Combat Log */}
            <div className="lg:col-span-5 bg-stone-950 border border-stone-850 p-4 rounded-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <h4 className="font-serif text-xs text-stone-300 uppercase tracking-widest font-black border-b border-stone-800 pb-2 mb-3 flex items-center gap-1.5">
                  <Shield size={14} className="text-saffron" /> Live Combat Feed
                </h4>
                <div className="h-56 overflow-y-auto space-y-3 pr-2 custom-scrollbar text-[11px] font-sans">
                  {battleLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`text-left p-2 rounded-sm border ${log.actor === 'Player' ? 'bg-saffron/5 border-saffron/20 text-stone-300' : log.actor === 'Opponent' ? 'bg-red-950/10 border-red-900/20 text-stone-400' : 'bg-stone-900 border-stone-850 text-stone-500'}`}
                    >
                      <span className="font-mono text-[9px] mr-1 text-stone-500">[TURN {log.turn}]</span>
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[9px] font-mono text-stone-600 border-t border-stone-850 pt-2 text-center uppercase tracking-widest font-black">
                Real-Time Simulated Command Feed
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE 4: RESULTS */}
        {gameState === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            {battleResult === 'victory' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 text-3xl mb-6 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-bounce">
                  🏆
                </div>
                <h4 className="font-serif text-white text-2xl uppercase tracking-widest font-black mb-2">
                  Grand Combat Victory!
                </h4>
                <p className="text-stone-400 max-w-sm text-xs leading-relaxed font-sans mb-8">
                  You successfully shattered the Durrani Camel Lines at the Yamuna river sector. Your tactical commands were recorded in the records high ledger.
                </p>
                <div className="bg-stone-950 p-4 border border-emerald-900/40 text-emerald-400 font-mono text-xs tracking-wider uppercase rounded-sm mb-6 flex items-center gap-4 px-8">
                  <span>+15,000 Gold Mohurs</span>
                  <span>+25 Army Morale</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center text-red-500 text-3xl mb-6 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                  💀
                </div>
                <h4 className="font-serif text-white text-2xl uppercase tracking-widest font-black mb-2">
                  Tactical Defeat
                </h4>
                <p className="text-stone-400 max-w-sm text-xs leading-relaxed font-sans mb-8">
                  The Durrani camel snipers pinned your right flank. Seek new redoubt positions and retry the skirmish.
                </p>
                <div className="bg-stone-950 p-4 border border-red-900/40 text-red-400 font-mono text-xs tracking-wider uppercase rounded-sm mb-6 flex items-center gap-4 px-8">
                  <span>-15 Army Morale</span>
                </div>
              </>
            )}

            <button
              onClick={resetSimulator}
              className="px-6 py-2 bg-saffron hover:bg-yellow-500 text-stone-955 font-mono text-xs font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer shadow-md"
            >
              Return to Lobby
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
