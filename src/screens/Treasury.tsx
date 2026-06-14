import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Landmark, 
  ShoppingBag, 
  TrendingUp, 
  History, 
  ShieldCheck, 
  Wallet, 
  Scale, 
  RefreshCw, 
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Wheat,
  Zap
} from 'lucide-react';
import { Screen } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

export const Treasury: React.FC<{ 
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose, onHelp, onSettings }) => {
  React.useEffect(() => {
    const savedStage = localStorage.getItem('panipat_campaign_stage') || 'nizam_campaign';
    localStorage.setItem(`cleared_treasury_${savedStage}`, 'true');
  }, []);

  // Sync core stats with localStorage
  const [treasuryMohurs, setTreasuryMohurs] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_treasury');
    return saved ? Number(saved) : 145000;
  });

  // MetaMask Integration States
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem('panipat_wallet_address') || null;
  });
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [claimedWeb3Bonus, setClaimedWeb3Bonus] = useState<boolean>(() => {
    return localStorage.getItem('panipat_claimed_web3_bonus') === 'true';
  });

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (typeof window !== 'undefined' && 'ethereum' in window) {
        try {
          const ethereum = (window as any).ethereum;
          if (ethereum) {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setWalletAddress(accounts[0]);
              localStorage.setItem('panipat_wallet_address', accounts[0]);
            }
          }
        } catch (e) {
          console.error("MetaMask initial check failed:", e);
        }
      }
    };
    checkIfWalletIsConnected();

    if (typeof window !== 'undefined' && 'ethereum' in window) {
      const ethereum = (window as any).ethereum;
      if (ethereum && ethereum.on) {
        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            localStorage.setItem('panipat_wallet_address', accounts[0]);
          } else {
            setWalletAddress(null);
            localStorage.removeItem('panipat_wallet_address');
          }
        };
        ethereum.on('accountsChanged', handleAccountsChanged);
        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
          }
        };
      }
    }
  }, []);

  const connectWallet = async () => {
    setIsConnectingWallet(true);
    setWalletError(null);
    if (typeof window !== 'undefined' && 'ethereum' in window) {
      try {
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
          throw new Error("MetaMask provider is not present.");
        }
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          setWalletAddress(addr);
          localStorage.setItem('panipat_wallet_address', addr);
          
          if (!claimedWeb3Bonus) {
            setTreasuryMohurs(prev => prev + 50000);
            setClaimedWeb3Bonus(true);
            localStorage.setItem('panipat_claimed_web3_bonus', 'true');
            setLedger(prev => [
              { id: Date.now().toString(), type: 'Diplomacy', text: "MetaMask Central Web3 Wallet aligned. Awarded +50k Mohurs!", cost: "+50,000 M", date: "Just now" },
              ...prev.slice(0, 5)
            ]);
            alert("🎉 [METAMASK SOVEREIGN SEALED] Web3 wallet successfully linked! Claimed +50,000 Gold Mohurs into Central Campaign Treasury!");
          } else {
            alert("🔌 [METAMASK RECONNECTED] Your sovereign Web3 ledger was successfully restored.");
          }
        }
      } catch (err: any) {
        console.error("MetaMask connection error:", err);
        setWalletError(err.message || "Failed to connect to MetaMask. Please check your extension.");
      } finally {
        setIsConnectingWallet(false);
      }
    } else {
      setIsConnectingWallet(false);
      setWalletError("MetaMask extension not found in your browser. Checking sandbox simulation...");
      // Auto fallback to sandbox
      const dummyAddr = "0x71C677762dbD553a992d95A7E24300eCb58635ab";
      setWalletAddress(dummyAddr);
      localStorage.setItem('panipat_wallet_address', dummyAddr);
      if (!claimedWeb3Bonus) {
        setTreasuryMohurs(prev => prev + 50000);
        setClaimedWeb3Bonus(true);
        localStorage.setItem('panipat_claimed_web3_bonus', 'true');
        setLedger(prev => [
          { id: Date.now().toString(), type: 'Diplomacy', text: "Sandbox Web3 Wallet simulated. Awarded +50k Mohurs!", cost: "+50,000 M", date: "Just now" },
          ...prev.slice(0, 5)
        ]);
        alert("🛡️ [SANDBOX WALLET CONNECTED] Simulated fallback Web3 wallet successfully connected! Claimed your +50,000 Gold Mohurs Bounty.");
      }
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('panipat_wallet_address');
    setWalletError(null);
  };
  
  const [provisions, setProvisions] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_provisions');
    return saved ? Number(saved) : 385;
  });

  // Unique commodities for Treasury Bazaar
  const [powderBarrels, setPowderBarrels] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_powder_barrels');
    return saved ? Number(saved) : 45;
  });

  const [silverBullion, setSilverBullion] = useState<number>(() => {
    const saved = localStorage.getItem('panipat_campaign_silver_bullion');
    return saved ? Number(saved) : 15;
  });

  const [tickerNews, setTickerNews] = useState<string>("🌾 Imperial Grains in high demand. Starvation index rises inside Northern trenches.");

  // Transaction ledger states
  const [ledger, setLedger] = useState<{ id: string; type: 'Purchase' | 'Sale' | 'Diplomacy'; text: string; cost: string; date: string }[]>([
    { id: '1', type: 'Purchase', text: "Buy 100 Tons of Grains for winter supply camps", cost: "-15,000 Mohurs", date: "Just now" },
    { id: '2', type: 'Sale', text: "Liquidate surplus Gwalior silver seals to banking syndicates", cost: "+30,000 Mohurs", date: "2 turns ago" }
  ]);

  // Market price modifiers that can fluctuate
  const [grainBuyPrice, setGrainBuyPrice] = useState(150);
  const [grainSellPrice, setGrainSellPrice] = useState(75);
  const [powderBuyPrice, setPowderBuyPrice] = useState(450);
  const [powderSellPrice, setPowderSellPrice] = useState(220);
  const [silverBuyPrice, setSilverBuyPrice] = useState(2500);
  const [silverSellPrice, setSilverSellPrice] = useState(2100);

  // Synchronize values to localStorage
  useEffect(() => {
    localStorage.setItem('panipat_campaign_treasury', treasuryMohurs.toString());
  }, [treasuryMohurs]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_provisions', provisions.toString());
  }, [provisions]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_powder_barrels', powderBarrels.toString());
  }, [powderBarrels]);

  useEffect(() => {
    localStorage.setItem('panipat_campaign_silver_bullion', silverBullion.toString());
  }, [silverBullion]);

  // Simulate market price fluctuation on click
  const handleMarketFluctuation = () => {
    const drift = () => (Math.random() * 0.3 - 0.15); // +/- 15% range drift
    
    // Calculate new drifted values
    const newG = Math.max(100, Math.round(150 * (1 + drift())));
    const newP = Math.max(300, Math.round(450 * (1 + drift())));
    const newS = Math.max(1800, Math.round(2500 * (1 + drift())));

    setGrainBuyPrice(newG);
    setGrainSellPrice(Math.round(newG * 0.5));
    setPowderBuyPrice(newP);
    setPowderSellPrice(Math.round(newP * 0.5));
    setSilverBuyPrice(newS);
    setSilverSellPrice(Math.round(newS * 0.82));

    const headlines = [
      "🐪 Abdali's camel zamburak regiments blockade Lahore supply hubs, raising gold powder imports!",
      "🌾 Secret Suraj Mal grain caravans successfully breach Southern defense walls. Grain price drops slightly.",
      "💎 Banking syndicates in Gwalior request silver bullion mortgages. Bullion trading spike reported!",
      "❄️ Harsh frosty winter wind prevents deep foraging. General camp follow followers suffer starvation."
    ];
    setTickerNews(headlines[Math.floor(Math.random() * headlines.length)]);

    // Add entry to ledger
    setLedger(prev => [
      { id: Date.now().toString(), type: 'Diplomacy', text: "Regional commodities price indexes fluctuated and updated.", cost: "0 Mohurs", date: "Just now" },
      ...prev.slice(0, 5)
    ]);
  };

  // Commodity Buy and Sell handlers
  const handleTrade = (item: 'grain' | 'powder' | 'silver', action: 'buy' | 'sell') => {
    if (action === 'buy') {
      const price = item === 'grain' ? grainBuyPrice : item === 'powder' ? powderBuyPrice : silverBuyPrice;
      if (treasuryMohurs < price) {
        alert("❌ [INSUFFICIENT FUNDS] You do not hold enough Gold Mohurs to acquire this commodity.");
        return;
      }
      setTreasuryMohurs(prev => prev - price);
      if (item === 'grain') setProvisions(prev => prev + 25);
      if (item === 'powder') setPowderBarrels(prev => prev + 1);
      if (item === 'silver') setSilverBullion(prev => prev + 1);

      setLedger(prev => [
        { id: Date.now().toString(), type: 'Purchase', text: `Acquired 1 unit of ${item.toUpperCase()} commodity from bazaar`, cost: `-${price.toLocaleString()} M`, date: "Just now" },
        ...prev.slice(0, 5)
      ]);
    } else {
      // Selling commodities
      const qty = item === 'grain' ? provisions : item === 'powder' ? powderBarrels : silverBullion;
      const minQty = item === 'grain' ? 25 : 1;
      
      if (qty < minQty) {
        alert("❌ [INSUFFICIENT GOODS] You do not hold any reserves of this resource item to sell.");
        return;
      }

      const price = item === 'grain' ? grainSellPrice : item === 'powder' ? powderSellPrice : silverSellPrice;
      setTreasuryMohurs(prev => prev + price);
      if (item === 'grain') setProvisions(prev => Math.max(0, prev - 25));
      if (item === 'powder') setPowderBarrels(prev => Math.max(0, prev - 1));
      if (item === 'silver') setSilverBullion(prev => Math.max(0, prev - 1));

      setLedger(prev => [
        { id: Date.now().toString(), type: 'Sale', text: `Liquidated 1 unit of ${item.toUpperCase()} commodity to bazaar caravan`, cost: `+${price.toLocaleString()} M`, date: "Just now" },
        ...prev.slice(0, 5)
      ]);
    }
  };

  // paid Ambassador launch
  const handleSendAmbassador = () => {
    if (treasuryMohurs < 25000) {
      alert("❌ Not enough funds to bribe other courts! Need 25,000 M.");
      return;
    }

    setTreasuryMohurs(prev => prev - 25000);
    const successRoll = Math.random() > 0.45;

    if (successRoll) {
      // Boost the relationship trust scores of Jat (3) and Awadh (4) in localStorage
      const savedFact = localStorage.getItem('panipat_campaign_factions');
      if (savedFact) {
        try {
          const factions = JSON.parse(savedFact);
          const updated = factions.map((f: any) => {
            if (f.id === '3' || f.id === '4') {
              return { ...f, trust: Math.min(100, f.trust + 25) };
            }
            return f;
          });
          localStorage.setItem('panipat_campaign_factions', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }

      setLedger(prev => [
        { id: Date.now().toString(), type: 'Diplomacy', text: "Ambassador embassy SECURED! Regional Trust boosted by +25!", cost: "-25,000 M", date: "Just now" },
        ...prev.slice(0, 5)
      ]);
      alert("🏆 [EMBASSY TRIUMPH] Your paid ambassadors presented gorgeous silk and gold gifts. Maharaja Suraj Mal and Shuja-ud-Daula relations improved by +25 Trust points!");
    } else {
      setLedger(prev => [
        { id: Date.now().toString(), type: 'Diplomacy', text: "Ambassador embassy INTERCEPTED by Rohilla spies", cost: "-25,000 M", date: "Just now" },
        ...prev.slice(0, 5)
      ]);
      alert("💀 [EMBASSY CAPTURED] Absolute disaster! Najib-ud-Daula's Afghan light scouts intercepted your diplomatic caravan. Secret documents were burned and gold confiscated!");
    }
  };

  return (
    <div className="relative h-screen w-screen bg-stone-950 overflow-hidden font-sans">
      <TopBar screen={Screen.TREASURY} onNavigate={onNavigate} onToggleMenu={onToggleMenu} onHelp={onHelp} onSettings={onSettings} />
      <SideNav screen={Screen.TREASURY} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />
      
      <main className="lg:pl-64 pt-16 h-[calc(100vh-4rem)] overflow-y-auto bg-stone-950/70 custom-scrollbar relative">
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-fixed"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1968&auto=format&fit=crop')" }}
        />

        <div className="p-4 md:p-12 space-y-8 relative z-10">
          
          {/* Main layout Top wealth card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-5 bg-stone-900 border border-stone-800 p-5 flex flex-col justify-between bronze-bevel shadow-2xl gap-4 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-saffron/10 border border-saffron/30 rounded-full flex items-center justify-center shrink-0">
                  <Coins size={24} className="text-saffron" />
                </div>
                <div>
                  <h2 className="text-[8px] text-stone-500 uppercase font-black tracking-[0.2em] leading-none">Central Campaign Treasury</h2>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl md:text-3xl font-serif text-white font-black">{treasuryMohurs.toLocaleString()}</span>
                    <span className="text-[10px] text-saffron font-serif italic">Gold Mohurs</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-stone-800/60 pt-3 flex items-center justify-between">
                <span className="text-[8px] text-stone-500 uppercase tracking-widest font-bold">Gwalior Sovereign Treasury</span>
                <div className="text-green-500 font-mono text-[9px] font-black uppercase flex items-center gap-1">
                  <TrendingUp size={11} /> ACTIVE
                </div>
              </div>
            </motion.div>

            {/* MetaMask / Web3 Sovereign Ledger card */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-4 bg-stone-900 border border-stone-800 p-5 flex flex-col justify-between bronze-bevel shadow-2xl gap-3 text-left"
            >
              <div className="space-y-1">
                <h3 className="font-serif text-white uppercase tracking-widest font-black text-xs flex items-center gap-1.5">
                  <Wallet size={14} className="text-saffron" /> Sovereign Web3 Ledger
                </h3>
                <p className="text-[9px] text-stone-400 italic leading-tight">
                  Connect your decentralized MetaMask web3 ledger to synchronize campaign tokens and secure imperial credits.
                </p>
              </div>

              <div className="space-y-1.5">
                {walletAddress ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between p-1.5 bg-green-950/30 border border-green-900/35 rounded-xs">
                      <div className="flex items-center gap-1">
                        <ShieldCheck size={12} className="text-green-400 shrink-0" />
                        <span className="font-mono text-[9px] text-green-300 font-bold">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                      </div>
                      <button 
                        onClick={disconnectWallet}
                        className="text-[8px] font-mono uppercase text-stone-500 hover:text-red-400 transition-colors bg-transparent border-0 cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                    <p className="text-[8.5px] text-saffron font-bold animate-pulse">
                      ✨ Sovereign Seal Active (+50,000 M claimed)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <button 
                      onClick={connectWallet}
                      disabled={isConnectingWallet}
                      className="bg-stone-950 hover:bg-stone-850 hover:text-saffron border border-stone-800 text-stone-300 font-semibold text-[9px] uppercase font-mono tracking-widest py-1.5 transition-all rounded-xs cursor-pointer text-center w-full shadow-inner flex items-center justify-center gap-1"
                    >
                      {isConnectingWallet ? (
                        <>
                          <RefreshCw size={10} className="animate-spin text-saffron" /> Linking Web3...
                        </>
                      ) : (
                        <>
                          🦊 Connect MetaMask Wallet
                        </>
                      )}
                    </button>
                    {walletError && (
                      <p className="text-[8.5px] text-red-500 leading-tight flex items-start gap-1">
                        <AlertCircle size={10} className="shrink-0 mt-0.5" />
                        <span>{walletError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* paid ambassador diplomacy launcher */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 bg-stone-900 border border-stone-800 p-5 flex flex-col justify-between bronze-bevel shadow-2xl gap-3 text-left"
            >
              <div className="space-y-1">
                <h3 className="font-serif text-white uppercase tracking-widest font-black text-xs flex items-center gap-1.5">
                  <Landmark size={14} className="text-saffron" /> Dispatch High Embassy
                </h3>
                <p className="text-[9px] text-stone-400 italic leading-tight">
                  Send high ranking diplomats with rich gold gifts (25k M) to gain regional trust.
                </p>
              </div>
              <button 
                onClick={handleSendAmbassador}
                className="bg-saffron hover:bg-yellow-600 hover:text-black font-semibold text-[9px] uppercase text-stone-950 font-mono tracking-widest py-1.5 transition-all border border-yellow-700 rounded-xs cursor-pointer text-center w-full"
              >
                💸 DISPATCH EMBASSY (25k)
              </button>
            </motion.div>
          </div>

          {/* Market News Ticker section */}
          <div className="flex items-center gap-3 bg-stone-900/90 border border-stone-850 p-3 rounded-xs text-left">
            <span className="bg-saffron text-stone-950 px-2 py-0.5 rounded-full text-[8.5px] font-black font-mono tracking-widest uppercase flex items-center shrink-0 animate-pulse">
              Market Head
            </span>
            <span className="text-stone-300 font-serif italic text-xs truncate">
              {tickerNews}
            </span>
            <button 
              onClick={handleMarketFluctuation}
              className="ml-auto bg-stone-880 hover:bg-stone-800 p-1 border border-stone-800 rounded-xs text-saffron hover:text-white cursor-pointer transition-colors shrink-0"
              title="Refresh Commodities index rates"
            >
              <RefreshCw size={13} className="animate-spin-slow" />
            </button>
          </div>

          {/* Commodity Bazaar & Transaction Ledger Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Interactive Commodities Trade Deck (Left, col 7) */}
            <div className="lg:col-span-7 bg-stone-900 border border-stone-800 p-5 rounded-xs space-y-4 text-left">
              <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest font-black flex items-center gap-2 border-b border-stone-850 pb-2">
                <ShoppingBag size={15} className="text-saffron" /> Campaign Bazaars COMMODITY CONTRACTS
              </h3>

              <div className="grid grid-cols-1 gap-4">
                
                {/* 1. Grain bags */}
                <div className="p-3.5 bg-stone-950/60 border border-stone-850 rounded-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="p-2.5 bg-[#1e140f] border border-orange-950 text-emerald-500 rounded-sm">
                      <Wheat size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-black text-white uppercase">🌾 Gwalior Grains (Mauch bags)</h4>
                      <p className="text-[10px] text-stone-400 italic">Core army sustenance. Current stock: <strong className="text-white">{provisions} Tons</strong></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTrade('grain', 'buy')}
                      className="px-3.5 py-1.5 bg-green-950 text-green-400 border border-green-900 font-mono text-[9px] font-black uppercase rounded-xs cursor-pointer hover:bg-green-900 transition-colors"
                    >
                      Buy 25T ({grainBuyPrice} M)
                    </button>
                    <button 
                      onClick={() => handleTrade('grain', 'sell')}
                      className="px-3.5 py-1.5 bg-red-950 text-red-400 border border-red-900 font-mono text-[9px] font-black uppercase rounded-xs cursor-pointer hover:bg-red-900 transition-colors"
                    >
                      Sell 25T ({grainSellPrice} M)
                    </button>
                  </div>
                </div>

                {/* 2. Gunpowder Keg */}
                <div className="p-3.5 bg-stone-950/60 border border-stone-850 rounded-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="p-2.5 bg-[#1e140f] border border-orange-950 text-amber-500 rounded-sm">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-black text-white uppercase">⚡ Gunpowder Kegs (Heavy Sulphur)</h4>
                      <p className="text-[10px] text-stone-400 italic">Propels Ibrahim Gardi's heavy field cannons. Stock: <strong className="text-white">{powderBarrels} Kegs</strong></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTrade('powder', 'buy')}
                      className="px-3.5 py-1.5 bg-green-950 text-green-400 border border-green-900 font-mono text-[9px] font-black uppercase rounded-xs cursor-pointer hover:bg-green-900 transition-colors"
                    >
                      Buy 1K ({powderBuyPrice} M)
                    </button>
                    <button 
                      onClick={() => handleTrade('powder', 'sell')}
                      className="px-3.5 py-1.5 bg-red-950 text-red-400 border border-red-900 font-mono text-[9px] font-black uppercase rounded-xs cursor-pointer hover:bg-red-900 transition-colors"
                    >
                      Sell 1K ({powderSellPrice} M)
                    </button>
                  </div>
                </div>

                {/* 3. Silver Bullion */}
                <div className="p-3.5 bg-stone-950/60 border border-stone-850 rounded-xs flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="p-2.5 bg-[#1e140f] border border-orange-950 text-yellow-600 rounded-sm">
                      <Coins size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-black text-white uppercase">💎 Melted Silver Bullion Seals</h4>
                      <p className="text-[10px] text-stone-400 italic">Precious metal bars liquefied for quick collateral. Stock: <strong className="text-white">{silverBullion} Bullions</strong></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTrade('silver', 'buy')}
                      className="px-3.5 py-1.5 bg-green-950 text-green-400 border border-green-900 font-mono text-[9px] font-black uppercase rounded-xs cursor-pointer hover:bg-green-900 transition-colors"
                    >
                      Buy 1B ({silverBuyPrice} M)
                    </button>
                    <button 
                      onClick={() => handleTrade('silver', 'sell')}
                      className="px-3.5 py-1.5 bg-red-950 text-red-400 border border-red-900 font-mono text-[9px] font-black uppercase rounded-xs cursor-pointer hover:bg-red-900 transition-colors"
                    >
                      Sell 1B ({silverSellPrice} M)
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Financial ledger updates (Right, col 5) */}
            <div className="lg:col-span-5 bg-stone-900/60 border border-stone-800 p-5 rounded-xs space-y-4 text-left">
              <h3 className="font-serif text-sm text-stone-300 uppercase tracking-widest font-black flex items-center gap-2 border-b border-stone-850 pb-2">
                <History size={15} className="text-saffron" /> Financial Transcripts Ledger
              </h3>

              <div className="space-y-2.5 max-h-[250px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {ledger.map((tx) => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-stone-950 border border-stone-850/50 hover:border-saffron/15 rounded-xs flex items-center justify-between gap-3 text-left font-mono text-[10px]"
                    >
                      <div className="space-y-0.5">
                        <span className={`text-[8px] font-mono px-1 rounded-xs uppercase font-black ${tx.type === 'Purchase' ? 'bg-red-950/40 text-red-400 border border-red-900/20' : tx.type === 'Sale' ? 'bg-green-950/40 text-green-400 border border-green-900/20' : 'bg-saffron/10 text-saffron border border-saffron/20'}`}>
                          {tx.type}
                        </span>
                        <p className="text-stone-300 font-sans italic leading-tight">{tx.text}</p>
                        <span className="text-[7.5px] text-stone-600 block">{tx.date}</span>
                      </div>
                      <span className={`text-xs font-black shrink-0 ${tx.cost.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.cost}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
