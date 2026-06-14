import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  Users, 
  ShieldCheck, 
  Zap, 
  History, 
  ChevronRight, 
  ArrowLeft, 
  Info, 
  Landmark, 
  Award, 
  Sparkles, 
  CheckCircle, 
  X,
  Coins,
  Wheat
} from 'lucide-react';
import { Screen } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';
import { FallbackImage } from '../components/FallbackImage';

const TOPICS = [
  {
    id: 'battle-of-panipat',
    category: 'The Great Conflict',
    title: '1761: The Blood of Empire',
    image: 'https://images.unsplash.com/photo-1507727181347-9750059c4456?q=80&w=2070&auto=format&fit=crop',
    content: "The Third Battle of Panipat was not merely a military engagement, but a seismic shift in Indian history. On January 14, 1761, the frost-covered plains north of Delhi became the stage for the largest clash of the 18th century. The Maratha Confederacy, at the height of its power, faced the rising storm of the Durrani Empire. It was a test of two civilizations: the mobile horse-archers of the north against the disciplined fire-power of the south."
  },
  {
    id: 'maratha-forces',
    category: 'The Confederacy',
    title: 'The Iron Saffron Host',
    image: 'https://images.unsplash.com/photo-1601662528567-5264024036f0?q=80&w=2070&auto=format&fit=crop',
    content: "Led by Sadashivrao Bhau, the Maratha army was a massive, moving city of 250,000 souls. For the first time, the Marathas abandoned their traditional guerrilla warfare for a European-style infantry phalanx. Their pride was the 'Gardi' corps—10,000 musketeers who stood like walls of stone amidst the chaos. But this massive train proved a double-edged sword, as the harsh northern winter and severed supply lines began to starve the great beast from within."
  },
  {
    id: 'durrani-coalition',
    category: 'The Invaders',
    title: 'The Storm of Abdali',
    image: 'https://images.unsplash.com/photo-1549673967-893bd5798485?q=80&w=2070&auto=format&fit=crop',
    content: "Ahmad Shah Durrani commanded a terrifying synthesis of mobility and firepower. His Pashtun and Qizilbash cavalry were the finest horsemen in Asia, capable of sweeping maneuvers that left enemies reeling. Their secret weapon was the Jezail—a long musket that could pierce armor from distances where Maratha guns were silent. Abdali was a master of grand strategy, choosing to starve the Marathas into a desperate final charge."
  },
  {
    id: 'sadashivrao-bhau',
    category: 'Maratha Commander',
    title: 'Sadashivrao Bhau',
    image: 'https://images.unsplash.com/photo-1590766244534-7389814407ce?q=80&w=2070&auto=format&fit=crop',
    content: "The Commander-in-Chief of the Maratha forces, Sadashivrao Bhau was the nephew of the Peshwa. He was a brilliant administrator and a brave soldier, but he faced an impossible task in the high north. At Panipat, he chose to fight to the death with his family and his honor, symbolising the ultimate sacrifice of the Maratha spirit. His disappearance in the heat of battle remains one of Indian history's greatest mysteries."
  },
  {
    id: 'ahmad-shah-abdali',
    category: 'Afghan King',
    title: 'Ahmad Shah Abdali',
    image: 'https://images.unsplash.com/photo-1629815024701-d0061e86ba61?q=80&w=2070&auto=format&fit=crop',
    content: "Ahmad Shah Durrani, the founder of the Durrani Empire, was a master of desert warfare and tribal diplomacy. He saw himself as the protector of the northern frontiers. At Panipat, his tactical patience and use of mobile reserves proved decisive. Though he won the greatest victory of his career, the cost was so high that he never returned to India in such force again, famously remarking on the resilience of the Maratha foe."
  },
  {
    id: 'ibrahim-khan-gardi',
    category: 'Commanders',
    title: 'Ibrahim Khan Gardi',
    image: 'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=2070&auto=format&fit=crop',
    content: "Ibrahim Khan Gardi represented the modernization of Indian warfare. Trained by French generals, his artillery was the most advanced in the subcontinent. During the battle, his guns fired with such precision that they tore through the Afghan right wing. He remained loyal to the Peshwa until the bitter end, refusing to surrender even as his infantry squares were overwhelmed by a sea of cavalry."
  },
  {
    id: 'zamburak',
    category: 'Arsenal',
    title: 'The Desert Swivel',
    image: 'https://images.unsplash.com/photo-1595187143977-9ca267d35368?q=80&w=2070&auto=format&fit=crop',
    content: "The Zamburak was a stroke of military genius—a light cannon mounted on a camel. It gave Abdali mobile artillery that could traverse sand and scrub at the speed of a horse. During the climax of Panipat, 2,000 camels executed a circular firing pattern that decimated the Maratha center. The sight of these beasts rising to fire before vanishing into the dust became a nightmare for the Confederacy's infantry."
  },
  {
    id: 'parvatibai-camp',
    category: 'Historical Leaders',
    title: 'Parvatibai: Camp Pillar',
    image: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=2070&auto=format&fit=crop',
    content: "Parvatibai, the noble wife of Generalissimo Sadashivrao Bhau, accompanied the Maratha grand expedition to the north, acting as the spiritual and logistical anchor of the camp followers. In the freezing winter trenches of Panipat, where food became more precious than gold, she coordinated emergency food rations to support thousands of non-combatant civilians and pilgrims. Her presence maintained high morale amidst starving conditions. She survived the terrifying final rout of the battle, escaped with help of local loyalists back to the Deccan, and became a legendary symbol of Maratha endurance."
  },
  {
    id: 'gopikabai-pune',
    category: 'Historical Leaders',
    title: 'Gopikabai: Regent of Pune',
    image: 'https://images.unsplash.com/photo-1543157148-f68f2d47a1f1?q=80&w=1500&auto=format&fit=crop',
    content: "Gopikabai, the highly influential Peshwin (spouse of Balaji Baji Rao and mother of heir-apparent Vishwasrao), wielded tremendous political and administrative administrative authority in Pune. She managed the central treasury operations and dictated letters requesting strict accountability from sirdars during the campaign. Her fierce determination was driven by securing the royal lineage of her son, Vishwasrao. Her dynastic directives shaped the political alignment of Southern allies and forced commanders to maintain constant communication with the Maratha heartland."
  },
  {
    id: 'maharani-kishori',
    category: 'Historical Leaders',
    title: 'Maharani Kishori: Jat Sanctuary',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1500&auto=format&fit=crop',
    content: "Maharani Kishori, the renowned Empress of the Jat Kingdom of Bharatpur and wife of Maharaja Suraj Mal, played one of the most compassionate and vital humanitarian roles in the aftermath of Panipat. When thousands of freezing, starved, and heavily wounded Maratha soldiers retreated from the disaster, she personally intervened. Overriding political divisions, she ordered the Jat treasury to spend lakhs of Mohurs on grain feeding, clothing, and safe escorts for over 50,000 Maratha survivors back to Gwalior, establishing herself as an immortal beacon of mercy."
  },
  {
    id: 'legacy',
    category: 'Historical Impact',
    title: 'The Frozen Horizon',
    image: 'https://images.unsplash.com/photo-1568213813885-36d33b4e4f9b?q=80&w=2070&auto=format&fit=crop',
    content: "When the sun set on Panipat, the fields were white with the bones of 100,000 fallen men. While the Durrani army won the day, they retreated to Kabul soon after, unable to hold the vast plains. The Maratha power was broken for a generation, creating a vacuum that the British East India Company would eventually fill. It was the battle that decided who would NOT rule India, rather than who would."
  }
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Who was the Generalissimo and Commander-in-Chief of the Maratha Confederacy forces at Panipat in 1761?",
    options: ["Malharrao Holkar", "Nana Saheb Peshwa", "Sadashivrao Bhau", "Ibrahim Khan Gardi"],
    correctAnswer: 2,
    explanation: "Sadashivrao Bhau, nephew of Peshwa Nanasaheb, lead the ill-fated grand Maratha expedition northwards to secure Punjab paths."
  },
  {
    question: "What was the name of the long Afghan flintlock muskets that out-ranged the standard weapons at Panipat?",
    options: ["Matchlocks", "Jezail", "Bazaar Flint", "Zamburak Swivel"],
    correctAnswer: 1,
    explanation: "The Jezail musket, with its long rifled barrel, allowed Durrani snipers to pick off heavy Maratha officers from immense safety margins."
  },
  {
    question: "Which Empress of the Jat kingdom spent lakhs of Mohurs feeding and healing 50,000 wounded Maratha survivors of the rout?",
    options: ["Maharani Tarabai", "Gopikabai", "Parvatibai", "Maharani Kishori"],
    correctAnswer: 3,
    explanation: "Maharani Kishori of Bharatpur compassionately opened Jat silos and fortresses to rescue starving Maratha troops retreating southward."
  },
  {
    question: "The elite Maratha French-trained musketeer corps who stood in square combat was commanded by whom?",
    options: ["Jankoji Scindia", "Ibrahim Khan Gardi", "Dattaji Shinde", "Najib-ud-Daula"],
    correctAnswer: 1,
    explanation: "Ibrahim Khan Gardi, trained by French General de Bussy, remained loyal to the Deccan, executing precise battery fire until his overrun death."
  },
  {
    question: "What mobile weapon choice did Ahmad Shah Abdali use, which rose quickly to decimate Maratha central lines?",
    options: ["Zamburak (Camel-mounted swivel artillery)", "Elephants with siege towers", "Deccan heavy iron catapults", "French flintlock wagons"],
    correctAnswer: 0,
    explanation: "Zamburaks were light swivel-cannon guns strapped to trained camels. Over 2,000 camels fired lethal grape-shots that annihilated the Maratha ranks."
  }
];

export const Encyclopedia: React.FC<{ 
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose, onHelp, onSettings }) => {
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quiz mini-game states
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Filter topics
  const filteredTopics = TOPICS.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle quiz question validation and credit
  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAns(index);
    setShowFeedback(true);
    
    if (index === QUIZ_QUESTIONS[currentQ].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAns(null);
    setShowFeedback(false);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      setQuizCompleted(true);
      // Give rewards directly to localStorage
      const goldReward = score * 3000;
      const indexBonus = score >= 4 ? 120 : 50;

      const savedGold = localStorage.getItem('panipat_campaign_treasury');
      const savedGrain = localStorage.getItem('panipat_campaign_provisions');
      const savedMorale = localStorage.getItem('panipat_campaign_morale');

      const currentGold = savedGold ? Number(savedGold) : 145000;
      const currentGrain = savedGrain ? Number(savedGrain) : 385;
      const currentMorale = savedMorale ? Number(savedMorale) : 75;

      localStorage.setItem('panipat_campaign_treasury', (currentGold + goldReward).toString());
      localStorage.setItem('panipat_campaign_provisions', (currentGrain + indexBonus).toString());
      localStorage.setItem('panipat_campaign_morale', Math.min(100, currentMorale + 15).toString());
    }
  };

  const restartQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setSelectedAns(null);
    setShowFeedback(false);
    setQuizCompleted(false);
  };

  return (
    <div className="relative h-screen w-screen bg-stone-950 overflow-hidden font-sans">
      <TopBar 
        screen={Screen.ENCYCLOPEDIA} 
        onNavigate={onNavigate} 
        onToggleMenu={onToggleMenu} 
        onHelp={onHelp} 
        onSettings={onSettings} 
      />
      <SideNav screen={Screen.ENCYCLOPEDIA} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />

      <main className="lg:pl-64 h-[calc(100vh-4rem)] pt-16 flex flex-col md:flex-row bg-[#2D241E]">
        
        {/* Left List - Ink Style */}
        <div className="w-full md:w-80 lg:w-96 border-r border-stone-800 bg-stone-950/40 flex flex-col h-full z-10 shrink-0">
          
          {/* Quiz trigger top bar widget */}
          <div className="p-4 bg-stone-900/60 border-b border-stone-800 text-left">
            <button
              onClick={() => { setShowQuiz(!showQuiz); restartQuiz(); }}
              className="w-full py-3 px-4 bg-gradient-to-r from-saffron to-amber-600 text-stone-950 font-mono font-black text-[9.5px] uppercase tracking-wider rounded-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all text-center"
            >
              <Award size={14} className="shrink-0 animate-bounce" />
              <span>{showQuiz ? "🏛️ Read Historical Dossiers" : "🏛️ Enter Imperial Scholar Quiz"}</span>
            </button>
          </div>

          <div className="p-6 border-b border-stone-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
              <input 
                type="text" 
                disabled={showQuiz}
                placeholder={showQuiz ? "Search is locked inside Quiz durbars" : "Examine Historical Records..."}
                className="w-full bg-stone-900/50 border border-stone-800 rounded-none py-3 pl-10 pr-4 text-[10px] text-stone-300 focus:outline-none focus:border-saffron font-black uppercase tracking-widest disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar text-left">
            {filteredTopics.map((topic) => (
              <button
                key={topic.id}
                disabled={showQuiz}
                onClick={() => setSelectedTopic(topic)}
                className={`w-full p-6 text-left border-b border-stone-900 transition-all hover:bg-stone-900/30 group relative ${selectedTopic.id === topic.id && !showQuiz ? 'bg-saffron/5' : ''} ${showQuiz ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {selectedTopic.id === topic.id && !showQuiz && (
                  <motion.div layoutId="active-nav" className="absolute left-0 top-0 bottom-0 w-1 bg-saffron" />
                )}
                <span className="text-[9px] text-[#8B5E3C] uppercase font-black tracking-[0.2em] mb-2 block opacity-80 font-mono">
                  {topic.category}
                </span>
                <h3 className={`font-serif text-base uppercase tracking-tighter transition-colors ${selectedTopic.id === topic.id && !showQuiz ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'}`}>
                  {topic.title}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Parchment Style or QUIZ Board */}
        <div className="flex-1 overflow-y-auto parchment custom-scrollbar relative">
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {showQuiz ? (
              // Quiz Durbar Display
              <motion.div
                key="quiz_dossier"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 md:p-12 lg:p-16 max-w-2xl mx-auto relative z-10 text-stone-950 text-left"
              >
                <div className="border-4 border-[#8B5E3C] p-6 md:p-8 rounded-xs shadow-2xl bg-amber-50/98 bg-opacity-95 relative font-sans">
                  <div className="absolute inset-1 border border-[#8B5E3C]/30 rounded-xs pointer-events-none" />
                  
                  <div className="flex justify-between items-center border-b border-[#8B5E3C]/30 pb-3 mb-6">
                    <span className="text-[9px] font-black tracking-widest font-mono text-[#8B5E3C] uppercase flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-600 animate-spin-slow" />
                      IMPERIAL CHRONICLE QUIZ
                    </span>
                    <span className="text-[8.5px] font-black font-mono text-[#8B5E3C] uppercase bg-stone-950/10 px-2 py-0.5 rounded-xs">
                      {quizCompleted ? "COMPLETE" : `Question ${currentQ + 1} / ${QUIZ_QUESTIONS.length}`}
                    </span>
                  </div>

                  {!quizCompleted ? (
                    <div className="space-y-6">
                      <h3 className="font-serif text-xl md:text-2xl text-stone-900 font-black leading-tight">
                        {QUIZ_QUESTIONS[currentQ].question}
                      </h3>

                      <div className="space-y-3">
                        {QUIZ_QUESTIONS[currentQ].options.map((option, idx) => {
                          let btnStyle = "border-[#8B5E3C]/40 hover:bg-[#8B5E3C]/10";
                          if (showFeedback) {
                            if (idx === QUIZ_QUESTIONS[currentQ].correctAnswer) {
                              btnStyle = "bg-green-100 border-green-700 text-green-900 font-extrabold";
                            } else if (idx === selectedAns) {
                              btnStyle = "bg-red-100 border-red-700 text-red-900";
                            } else {
                              btnStyle = "opacity-50 border-[#8B5E3C]/20";
                            }
                          }

                          return (
                            <button
                              key={idx}
                              disabled={showFeedback}
                              onClick={() => handleAnswerSelect(idx)}
                              className={`w-full p-4 border text-left rounded-xs transition-all font-sans text-xs uppercase tracking-wider font-semibold cursor-pointer outline-none ${btnStyle}`}
                            >
                              <span className="font-mono text-[9px] text-[#8B5E3C]/80 mr-2">[{String.fromCharCode(65 + idx)}]</span>
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {showFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-stone-950 text-stone-300 p-4 border-l-4 border-saffron rounded-r-xs space-y-1.5"
                        >
                          <span className="text-[8.5px] font-mono text-saffron uppercase tracking-widest block font-black">
                            {selectedAns === QUIZ_QUESTIONS[currentQ].correctAnswer ? "⭐ EXCELLENT ASSESSMENT" : "💀 CHRONICLER MANDATE"}
                          </span>
                          <p className="text-[10px] leading-relaxed italic font-bold">
                            {QUIZ_QUESTIONS[currentQ].explanation}
                          </p>
                          <button
                            onClick={handleNextQuestion}
                            className="mt-3 px-3 py-1 bg-saffron text-stone-950 font-mono text-[9px] font-black uppercase tracking-wider rounded-xs cursor-pointer hover:bg-yellow-500"
                          >
                            Advance Scholar Ledger →
                          </button>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    // Quiz Results view
                    <div className="text-center space-y-6 py-6 font-sans">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-saffron/10 border border-saffron/40 flex items-center justify-center text-saffron">
                          <Award size={36} className="animate-bounce" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h2 className="font-serif text-3xl font-black text-stone-950 uppercase">QUIZ DURBAR EXAM CONCLUDED</h2>
                        <p className="text-stone-700 font-medium text-xs max-w-md mx-auto italic">
                          "The Peshwa central scribes have certified your understanding of the northern campaign records with great precision."
                        </p>
                      </div>

                      <div className="my-6 p-4 bg-stone-950 text-stone-200 border border-stone-800 rounded-sm text-left max-w-sm mx-auto">
                        <p className="text-[9px] font-mono text-saffron uppercase font-black tracking-widest text-center border-b border-stone-900 pb-1.5">
                          OFFICIAL REWARD SUMMARY
                        </p>
                        <div className="grid grid-cols-2 gap-3 divide-x divide-stone-900 py-3 text-center">
                          <div>
                            <span className="text-[7.5px] font-mono uppercase text-stone-500 block">Correct Answers:</span>
                            <span className="text-xl text-white font-serif font-black">{score} / {QUIZ_QUESTIONS.length}</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] font-mono uppercase text-stone-500 block">Bonus Awarded:</span>
                            <div className="text-[10.5px] font-mono font-bold space-y-0.5 text-saffron">
                              <p className="flex items-center justify-center gap-1"><Coins size={10} /> +{(score * 3000).toLocaleString()}</p>
                              <p className="flex items-center justify-center gap-1 text-emerald-400"><Wheat size={10} /> +{score >= 4 ? 120 : 50} Tons</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-center max-w-sm mx-auto">
                        <button
                          onClick={restartQuiz}
                          className="flex-1 py-2.5 border border-[#8B5E3C] hover:bg-[#8B5E3C]/10 text-[#8B5E3C] text-[10px] font-mono font-black uppercase tracking-wider rounded-xs cursor-pointer"
                        >
                          Retry Quiz Ledger
                        </button>
                        <button
                          onClick={() => setShowQuiz(false)}
                          className="flex-1 py-2.5 bg-stone-950 hover:bg-stone-900 text-white text-[10px] font-mono font-black uppercase tracking-wider rounded-xs cursor-pointer"
                        >
                          Close Scholar Board
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            ) : (
              // Standard Topic view
              <motion.div
                key={selectedTopic.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 md:p-16 lg:p-24 max-w-6xl mx-auto relative z-10"
              >
                <div className="flex flex-col gap-10">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-px bg-[#2D241E]/20" />
                    <span className="text-[10px] text-[#2D241E] uppercase tracking-[0.6em] font-black opacity-60">Imperial Compendium 1761</span>
                    <div className="w-12 h-px bg-[#2D241E]/20" />
                  </div>

                  <h1 className="font-serif text-5xl md:text-8xl text-stone-950 uppercase tracking-tighter leading-none mb-4 font-black">
                    {selectedTopic.title}
                  </h1>

                  {selectedTopic.image ? (
                    <div className="relative group overflow-hidden border-2 border-[#8B5E3C] shadow-2xl transform -rotate-1">
                      <div className="w-full h-80 md:h-[500px] bg-stone-850 flex items-center justify-center relative">
                         <span className="text-9xl font-serif text-stone-700 opacity-20">{selectedTopic.title.charAt(0)}</span>
                         <FallbackImage
                           src={selectedTopic.image}
                           fallbackSrc="/historical_map.png"
                           alt={selectedTopic.title}
                           className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-85"
                         />
                      </div>
                      {/* Caption Overlay */}
                      <div className="absolute bottom-4 left-6 bg-stone-950 text-white text-[9px] font-black tracking-widest px-4 py-1 uppercase scale-x-[-1] origin-left rotate-1">
                        Historical Record
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-stone-950/5 border-2 border-[#8B5E3C] border-dashed flex items-center justify-center">
                      <BookOpen size={80} className="text-[#8B5E3C]/20" />
                    </div>
                  )}

                  <div className="space-y-8 text-[#2D241E] leading-relaxed text-xl md:text-2xl font-body italic font-bold">
                     <p className="first-letter:text-7xl first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:font-black">
                       {selectedTopic.content}
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pb-20 text-left">
                     <div className="parchment border-2 border-[#8B5E3C] p-10 shadow-xl bronze-bevel">
                       <h4 className="text-[10px] text-[#2D241E] uppercase font-black tracking-widest mb-6 border-b border-[#2D241E]/10 pb-2">
                         Tactical Assessment
                       </h4>
                       <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-stone-600">
                          <li className="flex justify-between"><span>Strategic Importance</span> <span className="text-red-700">MAXIMUM</span></li>
                          <li className="flex justify-between"><span>Political Impact</span> <span className="text-[#8B5E3C]">CRITICAL</span></li>
                          <li className="flex justify-between"><span>Contemporary Threat</span> <span className="text-stone-900">EXTREME</span></li>
                       </ul>
                     </div>
                     <div className="parchment border-2 border-[#8B5E3C] p-10 shadow-xl bronze-bevel">
                       <h4 className="text-[10px] text-[#2D241E] uppercase font-black tracking-widest mb-6 border-b border-[#2D241E]/10 pb-2">
                         Historical Context
                       </h4>
                       <p className="text-[11px] text-[#2D241E] leading-relaxed font-bold italic opacity-70">
                         Analysis of the Bakhar manuscripts and Persian records from 1761 confirm the central role of this element in the unraveling of the Maratha northward expansion.
                       </p>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
