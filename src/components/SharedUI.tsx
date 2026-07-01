import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  HelpCircle, 
  User, 
  Flag, 
  Swords, 
  Users, 
  BookOpen, 
  ChevronRight, 
  TrendingUp, 
  Book, 
  ShieldCheck, 
  ArrowRight,
  Gavel,
  Map as MapIcon,
  Handshake,
  Archive,
  History,
  LayoutGrid,
  Zap,
  Star,
  RefreshCw,
  Castle,
  LogOut,
  Package,
  Menu,
  X,
  GraduationCap,
  Compass,
  Scroll,
  Coins
} from 'lucide-react';
import { Screen } from '../types';

// --- Shared Shell Components ---

export const TopBar: React.FC<{ 
  screen: Screen; 
  onNavigate: (s: Screen) => void;
  onToggleMenu?: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
  onShowBattleLog?: () => void;
}> = ({ screen, onNavigate, onToggleMenu, onHelp, onSettings, onShowBattleLog }) => {
  const [resources, setResources] = React.useState({
    manpower: 45000,
    provisions: 1400,
    gold: 145000
  });

  React.useEffect(() => {
    const update = () => {
      const savedManpower = localStorage.getItem("panipat_campaign_manpower");
      const savedProvisions = localStorage.getItem("panipat_campaign_provisions");
      const savedGold = localStorage.getItem("panipat_campaign_treasury");

      setResources({
        manpower: savedManpower ? Number(savedManpower) : 45000,
        provisions: savedProvisions ? Number(savedProvisions) : 1400,
        gold: savedGold ? Number(savedGold) : 145000
      });
    };

    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-10 py-3 bg-stone-950/90 backdrop-blur-sm border-b-4 border-stone-800/80 bronze-bevel">
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          className="lg:hidden text-saffron p-1"
          onClick={onToggleMenu}
        >
          <Menu size={24} />
        </button>
        <h1 
          className="text-lg md:text-2xl font-bold text-saffron italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif uppercase tracking-widest cursor-pointer whitespace-nowrap"
          onClick={() => onNavigate(Screen.MAIN_MENU)}
        >
          Panipat: 1761
        </h1>
        <nav className="hidden xl:flex gap-8 font-serif tracking-widest uppercase text-sm">
          <button 
            onClick={() => onNavigate(Screen.TACTICAL_HUD)}
            className={`transition-all duration-300 ${screen === Screen.TACTICAL_HUD ? 'text-saffron border-b-2 border-saffron pb-1' : 'text-stone-400 hover:text-saffron'}`}
          >
            Morale
          </button>
          <button 
            onClick={() => onNavigate(Screen.LOGISTICS)}
            className={`transition-all duration-300 ${screen === Screen.LOGISTICS ? 'text-saffron border-b-2 border-saffron pb-1' : 'text-stone-400 hover:text-saffron'}`}
          >
            Logistics
          </button>
          <button 
            onClick={() => onNavigate(Screen.COMMANDER_DEV)}
            className={`transition-all duration-300 ${screen === Screen.COMMANDER_DEV ? 'text-saffron border-b-2 border-saffron pb-1' : 'text-stone-400 hover:text-saffron'}`}
          >
            Intelligence
          </button>
        </nav>
      </div>

      {/* Persistent Resource Status Bar - Responsive & Compact */}
      <div className="flex items-center gap-3 sm:gap-5 bg-stone-900/60 px-3 sm:px-5 py-1 sm:py-1.5 rounded-full border border-stone-800/80 shadow-inner">
        <div className="flex items-center gap-1.5" title="Manpower (Active Soldiers)">
          <Users size={14} className="text-sky-400 shrink-0 animate-pulse" />
          <span className="text-[9px] font-mono uppercase text-stone-400 font-bold hidden lg:inline">Manpower</span>
          <span className="text-[11px] sm:text-xs font-serif font-black text-sky-200">{resources.manpower.toLocaleString()}</span>
        </div>
        <div className="w-px h-3 bg-stone-800" />
        <div className="flex items-center gap-1.5" title="Food Provisions">
          <Package size={14} className="text-emerald-400 shrink-0" />
          <span className="text-[9px] font-mono uppercase text-stone-400 font-bold hidden lg:inline">Provisions</span>
          <span className="text-[11px] sm:text-xs font-serif font-black text-emerald-300">{resources.provisions.toLocaleString()}T</span>
        </div>
        <div className="w-px h-3 bg-stone-800" />
        <div className="flex items-center gap-1.5" title="Treasury Gold Mohurs">
          <Coins size={14} className="text-amber-400 shrink-0" />
          <span className="text-[9px] font-mono uppercase text-stone-400 font-bold hidden lg:inline">Gold</span>
          <span className="text-[11px] sm:text-xs font-serif font-black text-amber-200">{resources.gold.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
      <div className="flex gap-4">
        {onShowBattleLog && (
          <button 
            onClick={onShowBattleLog}
            className="text-saffron hover:text-orange-300 transition-all active:scale-90"
            title="Campaign Chronicles"
          >
            <Scroll size={20} />
          </button>
        )}
        <button 
          onClick={onSettings}
          className="text-saffron hover:text-orange-300 transition-all active:scale-90"
        >
          <Settings size={20} />
        </button>
        <button 
          onClick={onHelp}
          className="text-saffron hover:text-orange-300 transition-all active:scale-90"
        >
          <HelpCircle size={20} />
        </button>
      </div>
      {screen === Screen.MAIN_MENU && (
        <div className="w-10 h-10 rounded-full border-2 border-saffron/50 overflow-hidden bg-stone-800 shadow-lg">
          <img 
            alt="Avatar" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCD4T3dZu2Z5dvjfYWCbffa1xGEvO8vBFLxkM1VXbQDJ3X64PEE64Xma8_R7dn1FDsL0curLiq5Tdv2gcH9eEQjzY8JUCn2ReXEBGXrEnaY-QqMJKHcXvgNdQl4trAELS-WroH-I0-xaUpFsDX70sz13ITsnTh1v2pcLNTU4QKx11ay2LM6bGqLoQRQ83y7Vz1x7gKUzNbYUbm_c8z18qJaIrbdY7OgbYi0Oh-lrThKAy47pLCCa0XS24g5t81wy85OWkzLHSRWq8T" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1597405232148-732386992d9f?q=80&w=2070&auto=format&fit=crop';
            }}
          />
        </div>
      )}
    </div>
  </header>
  );
};

export const BottomNav: React.FC<{ activeAction?: string; onAction?: (action: string) => void }> = ({ activeAction, onAction }) => (
  <footer className="fixed bottom-0 w-full z-50 flex justify-around md:justify-center items-center gap-2 md:gap-12 pb-2 md:pb-4 bg-stone-900/95 border-t-4 border-stone-700 hammered-metal shadow-[0_-10px_30px_rgba(0,0,0,0.5)] h-20 md:h-24">
    <button 
      onClick={() => onAction?.('attack')}
      className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-75 min-w-[60px] ${activeAction === 'attack' ? 'text-saffron scale-110' : 'text-stone-400 opacity-80 hover:opacity-100'}`}
    >
      <Swords size={24} className="md:w-7 md:h-7" />
      <span className="font-serif text-[10px] md:text-[12px] font-bold uppercase tracking-tighter">Attack</span>
    </button>
    <button 
      onClick={() => onAction?.('defend')}
      className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-75 min-w-[60px] ${activeAction === 'defend' ? 'bg-saffron text-stone-950 rounded-md scale-105 md:scale-110 shadow-[0_0_15px_#FF9933] px-3 md:px-6 py-1 md:py-2' : 'text-stone-400 opacity-80 hover:text-saffron'}`}>
      <ShieldCheck size={24} className="md:w-7 md:h-7" />
      <span className="font-serif text-[10px] md:text-[12px] font-bold uppercase tracking-tighter">Defend</span>
    </button>
    <button 
      onClick={() => onAction?.('retreat')}
      className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-75 min-w-[60px] ${activeAction === 'retreat' ? 'text-afghan-red scale-110' : 'text-stone-400 opacity-80 hover:opacity-100'}`}
    >
      <History size={24} className="md:w-7 md:h-7" />
      <span className="font-serif text-[10px] md:text-[12px] font-bold uppercase tracking-tighter">Retreat</span>
    </button>
    <button 
      onClick={() => onAction?.('maneuver')}
      className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-75 min-w-[60px] ${activeAction === 'maneuver' ? 'bg-saffron text-stone-950 rounded-md scale-105 md:scale-110 shadow-[0_0_15px_#FF9933] px-3 md:px-6 py-1 md:py-2' : 'text-stone-400 opacity-80 hover:text-saffron'}`}>
      <TrendingUp size={24} className="md:w-7 md:h-7" />
      <span className="font-serif text-[10px] md:text-[12px] font-bold uppercase tracking-tighter">Maneuver</span>
    </button>
  </footer>
);

export const SideNav: React.FC<{ 
  screen: Screen; 
  onNavigate: (s: Screen) => void;
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ screen, onNavigate, isOpen, onClose }) => {
  const items = [
    { id: Screen.STRATEGIC_MAP, label: 'Grand Campaign', icon: MapIcon },
    { id: Screen.BATTLE, label: 'Active Battle', icon: Swords },
    { id: Screen.WAR_COUNCIL, label: 'Council & Diplomacy', icon: Gavel },
    { id: Screen.TIMELINE, label: 'Historical Timeline', icon: History },
    { id: Screen.ENCYCLOPEDIA, label: 'Encyclopedia', icon: BookOpen },
    { id: Screen.LMS, label: 'Grand Academy', icon: GraduationCap },
    { id: Screen.CARTOGRAPHY, label: 'Imperial Cartography', icon: Compass },
    { id: Screen.LOGISTICS, label: 'Supply Lines', icon: Package },
    { id: Screen.TREASURY, label: 'Imperial Mint', icon: RefreshCw },
    { id: Screen.VICTORY, label: 'Military Archives', icon: Archive },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 h-full z-[70] pt-20 flex flex-col bg-stone-900 w-64 border-r-8 border-stone-800 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="lg:hidden absolute top-4 right-4">
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="px-6 py-6 border-b border-stone-800/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-saffron overflow-hidden bg-stone-800 shrink-0">
               <img 
                alt="Seal"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoqmUxg9GV6TRqt6Dke37hlud-01WKE35WNXtghjTRUOWIaMlpcmg9678BhULAuy3wodVHZpsH_WKzmcGt5s5cAaeIkH3pY0QBfCXYbCBgMFfNQJavfqRFE7qD1-NTm0QfNEO5nAD4lKgIJOHembUIu615q6n6wZO3A5UQ_JymbOM_opijgs1jb-7J2bXdGb4Mgs0bCg8Ey7ygPTcOQDsdZdcJo1IBOnK3xpOgCzQs6tDevIejtfVIZiBu4XXRDgwvQjI3Ob3TNN-J"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1597405232148-732386992d9f?q=80&w=2070&auto=format&fit=crop';
                }}
               />
            </div>
            <div>
              <h2 className="text-md font-bold text-stone-200 font-serif leading-none">Command Center</h2>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Imperial Strategy</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 mt-4 font-serif text-stone-100 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-all ${screen === item.id ? 'bg-saffron/20 border-l-4 border-saffron text-white font-bold' : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'}`}
            >
              <item.icon size={20} />
              <span className="tracking-widest uppercase text-xs">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-8 mt-auto border-t border-stone-800/50">
          <button 
            onClick={() => onNavigate(Screen.MAIN_MENU)}
            className="flex items-center gap-2 text-stone-500 hover:text-white transition-colors uppercase font-bold text-[10px] tracking-[0.2em]"
          >
            <LogOut size={14} /> Retreat to Palace
          </button>
        </div>
      </aside>
    </>
  );
};
