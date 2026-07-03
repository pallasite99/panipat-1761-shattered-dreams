import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ArrowLeft, 
  GraduationCap, 
  Award, 
  Map, 
  ChevronRight, 
  BookOpenText, 
  HelpCircle, 
  Flame, 
  Coins, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  UserCheck,
  Compass,
  Scroll,
  Dna,
  RefreshCw
} from 'lucide-react';
import { Screen } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

// Modular data and view imports
import { 
  Lesson, 
  Scenario, 
  QuizQuestion, 
  DocumentArchive, 
  LESSONS, 
  TIME_DECISIONS, 
  QUIZ_QUESTIONS, 
  MANUSCRIPTS 
} from '../data/lmsData';
import { KGraph } from '../components/KGraph';
import { TacticalSandbox } from '../components/TacticalSandbox';
import { FlintlockDrillSimulator } from '../components/FlintlockDrillSimulator';

export const LMS: React.FC<{
  onNavigate: (s: Screen) => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ onNavigate, onHelp, onSettings }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'formations' | 'drill' | 'chromaps' | 'decisions' | 'materials' | 'quiz'>('lessons');
  const [selectedPathway, setSelectedPathway] = useState<'Student' | 'Scholar'>('Student');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentArchive | null>(null);
  const [imageError, setImageError] = useState(false);

  // Persistence stats
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [decisionScores, setDecisionScores] = useState<Record<string, number>>({});
  const [selectedDecisionAnswers, setSelectedDecisionAnswers] = useState<Record<string, string>>({});

  // Dynamic Randomized Quiz state
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Initialize and load persistence data
  useEffect(() => {
    const lIds = localStorage.getItem('panipat_lms_completed_lessons');
    if (lIds) setCompletedLessonIds(JSON.parse(lIds));

    const scores = localStorage.getItem('panipat_lms_decision_scores');
    if (scores) setDecisionScores(JSON.parse(scores));

    const answers = localStorage.getItem('panipat_lms_decision_answers');
    if (answers) setSelectedDecisionAnswers(JSON.parse(answers));

    initQuiz();
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [selectedLesson]);

  // Shuffles and takes 6 dynamic questions from our 12 question warehouse
  const initQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 6);
    setShuffledQuestions(shuffled);
    setCurrentQuizIdx(0);
    setSelectedAnswerIdx(null);
    setHasSubmittedAnswer(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const completeLesson = (id: string) => {
    if (!completedLessonIds.includes(id)) {
      const nextCompleted = [...completedLessonIds, id];
      setCompletedLessonIds(nextCompleted);
      localStorage.setItem('panipat_lms_completed_lessons', JSON.stringify(nextCompleted));
    }
    setSelectedLesson(null);
  };

  const selectDecisionOption = (scenarioId: string, optionId: string, score: number) => {
    const nextAnswers = { ...selectedDecisionAnswers, [scenarioId]: optionId };
    setSelectedDecisionAnswers(nextAnswers);
    localStorage.setItem('panipat_lms_decision_answers', JSON.stringify(nextAnswers));

    const nextScores = { ...decisionScores, [scenarioId]: score };
    setDecisionScores(nextScores);
    localStorage.setItem('panipat_lms_decision_scores', JSON.stringify(nextScores));
  };

  const handleApplyDrillRewards = (rewards: { gold: number; morale: number; text: string }) => {
    const curGold = parseInt(localStorage.getItem('panipat_campaign_treasury') || '145000', 10);
    const curMorale = parseInt(localStorage.getItem('panipat_campaign_morale') || '75', 10);
    
    localStorage.setItem('panipat_campaign_treasury', (curGold + rewards.gold).toString());
    localStorage.setItem('panipat_campaign_morale', Math.min(100, curMorale + rewards.morale).toString());
    
    alert(`👑 BARRACKS AWARD CONFERRED!\n\n${rewards.text}`);
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx < shuffledQuestions.length - 1) {
      setCurrentQuizIdx(currentQuizIdx + 1);
      setSelectedAnswerIdx(null);
      setHasSubmittedAnswer(false);
    } else {
      setQuizCompleted(true);
      const prevMax = parseInt(localStorage.getItem('panipat_lms_quiz_max') || '0', 10);
      if (quizScore > prevMax) {
        localStorage.setItem('panipat_lms_quiz_max', quizScore.toString());
      }
    }
  };

  // Telemetry: calculates whether decisions align more with Maratha Ganimi Kava or Afghan Coalition lines
  const getPhilosophyAlignment = () => {
    let marathaCount = 0;
    let afghanCount = 0;
    let totalCount = 0;

    TIME_DECISIONS.forEach(scenario => {
      const answeredId = selectedDecisionAnswers[scenario.id];
      if (answeredId) {
        const option = scenario.options.find(o => o.id === answeredId);
        if (option) {
          totalCount++;
          if (option.alignment === 'Maratha') marathaCount++;
          if (option.alignment === 'Afghan') afghanCount++;
        }
      }
    });

    if (totalCount === 0) return { title: 'DECCAN ENTRUSTED NEUTRALIST', description: 'Begin deciding scenarios to analyze your tactical preferences.' };
    
    const percentage = Math.round((marathaCount / totalCount) * 100);
    if (percentage >= 60) return { title: 'SWIFT SAFFRON GUERRILLA RAID STRATEGIST', description: `Sided ${percentage}% with high mobile Ganimi Kava cavalry and Gardi core tactics.` };
    if (percentage <= 30) return { title: 'FRONTIER PASHTUN DEFENSIVE SOVEREIGN', description: `Aligned ${100 - percentage}% with robust local coalitions, food blockades, and defensive stalls.` };
    return { title: 'UNIVERSAL BALANCED MILITARY ACADEMICIAN', description: 'Pragmatic commander balancing heavy frontal siege shields with rapid flanking maneuvers.' };
  };

  const getDiplomaTitle = () => {
    let decisionTotal = 0;
    Object.keys(decisionScores).forEach(key => {
      decisionTotal += decisionScores[key] || 0;
    });
    const totalPoints = quizScore + decisionTotal;

    if (selectedPathway === 'Student') {
      if (totalPoints >= 100) return "★ HIGH CHANCELLOR YOUTH MEDAL ★";
      if (totalPoints >= 50) return "★ PESHWA SENTRY DIPLOMA ★";
      return "★ JUNIOR HISTORICAL APPRENTICE ★";
    } else {
      if (totalPoints >= 130) return "♛ GRAND STRATEGIC PLENIPOTENTIARY OF COALITIONS ♛";
      if (totalPoints >= 80) return "✹ WAR COUNCIL SCHOLASTIC FELLOW ✹";
      return "✦ OPERATIONAL CAMPAIGN SCRIBE ✦";
    }
  };

  const filteredLessons = LESSONS.filter(l => l.level === selectedPathway);
  const totalCompletedInCurrent = filteredLessons.filter(l => completedLessonIds.includes(l.id)).length;

  return (
    <div id="lms-screen-root" className="relative h-screen w-screen bg-[#140e0b] overflow-hidden text-stone-200">
      
      {/* Background Graphic overlay */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center sepia select-none"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop')" }}
        />
      </div>

      <TopBar screen={Screen.LMS as any} onNavigate={onNavigate} onHelp={onHelp} onSettings={onSettings} />

      <div className="flex h-full pt-16 relative z-10">
        
        <SideNav screen={Screen.LMS as any} onNavigate={onNavigate} isOpen={false} />

        <div className="flex-1 lg:pl-64 h-full flex flex-col overflow-hidden">
          
          {/* Main Title & Track Selector */}
          <div className="bg-[#1f1610] border-b border-[#8B5E3C]/30 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shrink-0">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-saffron w-5 h-5 animate-bounce" />
                <span className="text-[10px] text-saffron uppercase font-mono tracking-widest font-black">
                  SHANIWAR WADA SEMINARY
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif text-white font-black tracking-tight uppercase">
                PANIPAT MILITARY ACADEMY
              </h2>
            </div>

            {/* Path Selection */}
            <div className="flex bg-stone-950/80 p-1 border border-[#8B5E3C]/30 rounded-xs">
              <button
                type="button"
                id="btn-level-student"
                onClick={() => { setSelectedPathway('Student'); setSelectedLesson(null); }}
                className={`px-4 py-1.5 text-[10.5px] font-mono uppercase font-black tracking-wider transition-all rounded-xs cursor-pointer ${selectedPathway === 'Student' ? 'bg-saffron text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                👶 Student Track
              </button>
              <button
                type="button"
                id="btn-level-scholar"
                onClick={() => { setSelectedPathway('Scholar'); setSelectedLesson(null); }}
                className={`px-4 py-1.5 text-[10.5px] font-mono uppercase font-black tracking-wider transition-all rounded-xs cursor-pointer ${selectedPathway === 'Scholar' ? 'bg-[#9a3412] text-white font-black shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                📜 Scholar Track
              </button>
            </div>
          </div>

          {/* Expanded 6 module tabs */}
          <div className="bg-[#18110b] border-b border-stone-850 px-6 py-2.5 flex gap-2 overflow-x-auto shrink-0 scrollbar-thin">
            {[
              { id: 'lessons', label: '📖 Academy Syllabus' },
              { id: 'formations', label: '🛡️ Formations Sandbox' },
              { id: 'drill', label: '🎯 Barracks Drill' },
              { id: 'chromaps', label: '⛓️ Knowledge Network' },
              { id: 'decisions', label: '⚖️ Decision Chronicles' },
              { id: 'materials', label: '📜 Manuscript Room' },
              { id: 'quiz', label: '🏅 Challenge & Diploma' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id as any); setSelectedLesson(null); }}
                className={`px-4 py-1.5 font-mono text-[9.5px] font-black uppercase tracking-wider rounded border transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'bg-stone-950 text-saffron border-[#8B5E3C]' : 'bg-transparent text-stone-400 border-transparent hover:text-stone-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Primary View Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
            
            {/* Tab 1: Narrative Syllabus (10 Lessons) */}
            {activeTab === 'lessons' && (
              <AnimatePresence mode="wait">
                {!selectedLesson ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 text-left"
                  >
                    <div className="p-4 bg-[#20150d] border border-[#8B5E3C]/20 rounded-xs">
                      <h3 className="text-sm font-serif font-black text-white mb-1 uppercase tracking-wide">
                        {selectedPathway === 'Student' ? "Syllabus Track: Interactive Historical Stories" : "Advanced Course: Geopolitical Analysis Panels"}
                      </h3>
                      <p className="text-xs text-stone-400 leading-relaxed font-sans">
                        {selectedPathway === 'Student' 
                          ? "Welcome young cadet! Delve into the rich folklore, heavy weaponry, and tactical decisions made on Indian soil. Master all five progressive lessons to unlock your Royal Diploma." 
                          : "Welcome, Scholar. Critique the double-entry credit debt balances, European phalanx squares, and post-battle fallout that rearranged South Asian power. Master the five critical chapters."
                        }
                      </p>
                      
                      {/* Interactive Progress Ribbon */}
                      <div className="mt-4 flex items-center gap-3 text-[9px] font-mono text-saffron font-black uppercase tracking-widest leading-none">
                        <span>COURSE PROGRESS BAR:</span>
                        <div className="w-48 h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                          <div 
                            className="h-full bg-saffron transition-all duration-500" 
                            style={{ width: `${(totalCompletedInCurrent / filteredLessons.length) * 100}%` }}
                          />
                        </div>
                        <span>{totalCompletedInCurrent} / {filteredLessons.length} EXAMINED</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredLessons.map((lesson, idx) => {
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        return (
                          <motion.div
                            key={lesson.id}
                            whileHover={{ y: -3 }}
                            className="bg-stone-950 border border-stone-900 hover:border-[#8B5E3C]/50 p-5 rounded-sm flex flex-col justify-between space-y-4 shadow-lg"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[8.5px] font-mono font-black uppercase text-stone-500">
                                <span className="text-[#8B5E3C]">VOLUME 0{idx + 1}</span>
                                <span>⏱️ {lesson.duration}</span>
                              </div>
                              <h4 className="text-base font-serif font-black text-white leading-tight">
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-stone-400 leading-relaxed font-sans line-clamp-3">
                                {lesson.summary}
                              </p>
                            </div>

                            <div className="pt-3.5 border-t border-stone-900/60 flex justify-between items-center">
                              {isCompleted ? (
                                <span className="text-[9px] text-emerald-400 font-mono font-black uppercase flex items-center gap-1">
                                  ✓ CERTIFIED COMPLETE
                                </span>
                              ) : (
                                <span className="text-[9px] text-amber-600 font-mono font-black uppercase tracking-wider">
                                  ⚫ UNREAD CHRONICLE
                                </span>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => setSelectedLesson(lesson)}
                                className="px-3 py-1.5 bg-[#20150d] hover:bg-stone-900 border border-orange-950/40 text-saffron font-mono text-[9px] font-black uppercase tracking-widest transition-all rounded cursor-pointer"
                              >
                                STUDY TEXT ➔
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  // Monograph Reader
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto text-left space-y-6"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(null)}
                      className="px-4 py-2 bg-stone-950 text-[#8B5E3C] hover:text-saffron font-mono text-xs uppercase font-black tracking-widest border border-stone-850 hover:border-saffron/40 flex items-center gap-1.5 rounded cursor-pointer transition-colors"
                    >
                      ← Back to Course Catalogue
                    </button>

                    <div className="parchment border-4 border-[#8B5E3C] p-6 md:p-8 shadow-2xl space-y-6 rounded-xs">
                      <div className="border-b border-stone-950/20 pb-4">
                        <span className="text-[9px] text-[#8B5E3C] uppercase font-mono tracking-widest font-black block">
                          {selectedLesson.level} Path • Historical Monograph Volume
                        </span>
                        <h3 className="text-2xl md:text-3.5xl font-serif text-stone-950 font-black uppercase tracking-tight mt-1">
                          {selectedLesson.title}
                        </h3>
                      </div>

                      {/* Display image / text fallback */}
                      <div className="w-full h-48 md:h-64 border border-stone-950/20 bg-[#ebd3b4] rounded-xs overflow-hidden relative shadow-lg flex items-center justify-center">
                        {!imageError ? (
                          <img 
                            src={selectedLesson.illustrationUrl} 
                            alt={selectedLesson.title} 
                            className="w-full h-full object-cover filter brightness-90 sepia" 
                            referrerPolicy="no-referrer"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-[#eae0cf] relative select-none">
                            <BookOpenText className="w-12 h-12 text-[#8B5E3C] mb-2 animate-pulse" />
                            <h4 className="font-serif text-base font-black text-stone-900 uppercase">
                              {selectedLesson.title}
                            </h4>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 font-serif text-stone-900 text-sm md:text-base leading-relaxed font-semibold">
                        {selectedLesson.fullText.map((p, pIdx) => (
                          <p key={pIdx}>
                            {pIdx === 0 && <span className="text-2xl leading-none text-stone-950 font-serif mr-1">“</span>}
                            {p}
                          </p>
                        ))}
                      </div>

                      <div className="p-4 bg-orange-100 border-l-4 border-amber-600 font-sans text-xs text-stone-900 italic leading-relaxed rounded-r shadow-inner">
                        <strong className="block uppercase font-mono text-[9px] text-[#b45308] tracking-widest not-italic font-black mb-1">
                          📋 IMPERIAL DOCUMENTED METRIC FACT:
                        </strong>
                        "{selectedLesson.keyFact}"
                      </div>

                      <button
                        type="button"
                        onClick={() => completeLesson(selectedLesson.id)}
                        className="w-full py-3.5 bg-gradient-to-r from-stone-950 to-stone-900 text-saffron font-mono text-xs uppercase font-black tracking-widest border border-[#8B5E3C] shadow-lg hover:to-stone-850 active:scale-95 transition-all rounded cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Commit Lesson and Complete Rank Stage
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Tab 2: Formations Playbook Sandbox Game */}
            {activeTab === 'formations' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <div className="p-4 bg-[#20150d] border border-[#8B5E3C]/20 rounded text-left">
                  <h3 className="text-sm font-serif font-black text-white mb-1 uppercase tracking-wide">
                    🛡️ Interactive Drag-and-Drop Formations Sandbox
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    General officers did not organize troops randomly. Choose active weather patterns, assign forces (Gardi, Mawala, Camel Swivels, or Rohilla Heavy warriors) to defensive flanking lanes, and evaluate combat ratings!
                  </p>
                </div>

                <TacticalSandbox />
              </motion.div>
            )}

            {/* Tab: Barracks Drill Simulator */}
            {activeTab === 'drill' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <FlintlockDrillSimulator onApplyRewards={handleApplyDrillRewards} />
              </motion.div>
            )}

            {/* Tab 3: Interactive D3 Knowledge Graph (Relationships Map) */}
            {activeTab === 'chromaps' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <div className="p-4 bg-[#20150d] border border-[#8B5E3C]/20 rounded text-left">
                  <h3 className="text-sm font-serif font-black text-white mb-1 uppercase tracking-wide text-left">
                    ⛓️ Geopolitical & Campaign Knowledge Network (D3 Force-Directed)
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans text-left">
                    Explore an interactive hierarchical matrix demonstrating connection vectors between core commanders, crucial battles, and severe logistical collapses in 1761. Hover a node to focus relationships; drag nodes to watch nodes mathematically realign.
                  </p>
                </div>

                <KGraph />
              </motion.div>
            )}

            {/* Tab 4: 5 Operational Decision Chronicles */}
            {activeTab === 'decisions' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-6 text-left"
              >
                <div className="p-4 bg-[#20150d] border border-[#8B5E3C]/20 rounded">
                  <h3 className="text-sm font-serif font-black text-white mb-1 uppercase tracking-wide">
                    ⚖️ Unified Decision Chronicles (5 Tactical Milestones)
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Inhabit Sadashivrao Bhau\'s high war cabinet. Steer historical choices covering flooded river crossings, Delhi Red Fort treasure conversions, capital forage splitting, and espionage threats. Look at direct historical outcomes of your choice.
                  </p>
                </div>

                <div className="space-y-6">
                  {TIME_DECISIONS.map((scenario, sIdx) => {
                    const selectedOptId = selectedDecisionAnswers[scenario.id];
                    const activeOpt = scenario.options.find(o => o.id === selectedOptId);

                    return (
                      <div 
                        key={scenario.id}
                        className="bg-stone-950 border border-stone-850 p-5 md:p-6 rounded shadow-lg space-y-4"
                      >
                        <div className="flex justify-between items-center border-b border-stone-900 pb-2">
                          <span className="text-[9px] text-[#8B5E3C] font-mono font-black uppercase tracking-widest">
                            CAMPAIGN FORK 0{sIdx + 1}
                          </span>
                          {selectedOptId && (
                            <span className="text-[8.5px] bg-yellow-950 text-saffron px-2.5 py-0.5 rounded-sm font-mono font-bold uppercase border border-amber-900/30">
                              RESOLVED
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-serif font-black text-white uppercase tracking-tight">
                          {scenario.title}
                        </h4>

                        <p className="text-xs text-stone-300 leading-relaxed font-sans bg-stone-900/40 p-4 rounded border border-stone-850/50 italic">
                          "{scenario.problem}"
                        </p>

                        <div className="grid grid-cols-1 gap-3">
                          {scenario.options.map((option) => {
                            const isSelected = selectedOptId === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                disabled={selectedOptId !== undefined}
                                onClick={() => selectDecisionOption(scenario.id, option.id, option.scoreImpact)}
                                className={`p-4 text-left border rounded transition-all cursor-pointer text-xs ${
                                  selectedOptId === undefined 
                                    ? 'bg-stone-900 border-stone-800 hover:border-saffron hover:bg-[#1c130d]' 
                                    : isSelected 
                                      ? option.scoreImpact > 0 
                                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-100 font-bold' 
                                        : 'bg-rose-950/40 border-rose-600 text-rose-100'
                                      : 'bg-stone-950 opacity-30 border-transparent'
                                }`}
                              >
                                <div className="flex justify-between items-center gap-4">
                                  <span className="font-sans leading-relaxed">{option.text}</span>
                                  {selectedOptId === undefined ? (
                                    <ChevronRight size={13} className="text-stone-500 shrink-0" />
                                  ) : isSelected ? (
                                    <strong className="font-mono text-[10px] shrink-0 text-saffron">
                                      {option.scoreImpact > 0 ? `+${option.scoreImpact} pts` : `${option.scoreImpact} pts`}
                                    </strong>
                                  ) : null}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {selectedOptId && activeOpt && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-[#1f1510] border border-orange-950/50 rounded text-left space-y-1.5"
                          >
                            <span className="text-[8px] text-[#A57850] font-mono font-black uppercase tracking-widest block">
                              📜 AUTHENTIC CHRONOLOGY SCRAP:
                            </span>
                            <p className="text-stone-300 text-xs leading-relaxed font-sans font-medium">
                              {activeOpt.historicalResult}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Tab 5: Genuine Primary Sources Archives Room */}
            {activeTab === 'materials' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-6 text-left"
              >
                <div className="p-4 bg-[#20150d] border border-[#8B5E3C]/20 rounded">
                  <h3 className="text-sm font-serif font-black text-white mb-1 uppercase tracking-wide">
                    📜 Academic Manuscript Safe (Primary Sources Room)
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Read translated, authenticated extracts of original eighteenth century scrolls, messages encrypted in Pune, and letters sworn upon the Holy Quran.
                  </p>
                </div>

                {!selectedDoc ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MANUSCRIPTS.map(doc => (
                      <div 
                        key={doc.id}
                        className="bg-stone-950 border border-stone-850 p-5 rounded-sm flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <Scroll className="w-8 h-8 text-saffron" />
                          <h4 className="text-base font-serif font-black text-white leading-tight mt-1">{doc.title}</h4>
                          <span className="block text-[8px] font-mono font-bold uppercase text-stone-500">{doc.source}</span>
                          <p className="text-xs text-stone-400 line-clamp-3 font-sans leading-relaxed">{doc.excerpt}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="w-full py-2 bg-stone-900 border border-stone-800 hover:border-[#8B5E3C] text-[9.5px] font-mono text-saffron font-black uppercase tracking-widest rounded transition-all cursor-pointer"
                        >
                          UNROLL MANUSCRIPT ➔
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto parchment border-[10px] double border-[#8B5E3C] p-6 md:p-8 space-y-6 rounded-sm shadow-2xl text-stone-950 relative"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(null)}
                      className="absolute top-4 right-4 text-xs font-mono font-black text-[#9a3412] hover:underline cursor-pointer"
                    >
                      CLOSE [X]
                    </button>

                    <div className="border-b border-stone-950/20 pb-4 text-center">
                      <Scroll className="w-10 h-10 text-[#8B5E3C] mx-auto mb-1" />
                      <h3 className="text-xl md:text-2xl font-serif font-black uppercase text-stone-950">{selectedDoc.title}</h3>
                      <span className="block text-[9px] font-mono text-stone-600 uppercase mt-0.5">{selectedDoc.source}</span>
                      <span className="block text-[8px] font-mono text-stone-500 uppercase italic">Translation by {selectedDoc.translator}</span>
                    </div>

                    <div className="font-sans text-[11px] bg-[#ebd3b4]/30 p-3 border border-stone-950/10 rounded">
                      <strong className="block text-[8.5px] font-mono uppercase text-[#9a3412] font-black">HISTORICAL CONTEXT:</strong>
                      <p className="description-text leading-relaxed text-stone-800 mt-1">{selectedDoc.context}</p>
                    </div>

                    <div className="font-serif text-sm md:text-base leading-relaxed text-stone-900 whitespace-pre-wrap font-semibold border-t border-stone-950/10 pt-4 text-justify">
                      "{selectedDoc.fullMaterial}"
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedDoc(null)}
                      className="w-full py-2.5 bg-stone-950 text-saffron uppercase font-mono text-xs font-black tracking-widest rounded cursor-pointer hover:bg-stone-900 transition-colors"
                    >
                      ROLL UP SCROLL & CLOSE
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Tab 6: Challenge Exam & Dynamic Royal Diploma Certificate */}
            {activeTab === 'quiz' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto text-left"
              >
                {!quizCompleted ? (
                  <div className="bg-stone-950 border border-stone-850 p-5 md:p-8 rounded space-y-6 shadow-2xl">
                    <div className="border-b border-[#8B5E3C]/20 pb-4 text-center md:text-left flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <span className="text-[9px] text-saffron font-mono tracking-widest font-black uppercase block">
                          🏅 EXAM ROOM AUDITOR
                        </span>
                        <h3 className="text-lg font-serif text-white uppercase font-black tracking-tight mt-1">
                          Academy Challenge Exam
                        </h3>
                      </div>
                      
                      {/* Shuffle Button */}
                      <button
                        type="button"
                        onClick={initQuiz}
                        className="mt-2 md:mt-0 px-2.5 py-1 bg-stone-900 hover:bg-stone-850 hover:border-saffron text-[8.5px] font-mono text-stone-300 rounded border border-stone-800 transition-all flex items-center justify-center gap-1 cursor-pointer self-start md:self-auto"
                      >
                        <RefreshCw size={10} className="text-saffron animate-spin-slow" /> Reshuffle Questions
                      </button>
                    </div>

                    {shuffledQuestions.length > 0 && (
                      <div className="space-y-4">
                        
                        <div className="flex justify-between items-center text-[9px] font-mono text-stone-400">
                          <span>QUESTION {currentQuizIdx + 1} OF 6 (Random Shuffled)</span>
                          <div className="w-1/3 h-1 bg-stone-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-saffron transition-all" 
                              style={{ width: `${((currentQuizIdx) / 6) * 100}%` }}
                            />
                          </div>
                          <span>SCORE: {quizScore} pts</span>
                        </div>

                        <h4 className="text-sm font-serif font-black text-white text-left leading-relaxed">
                          {shuffledQuestions[currentQuizIdx].question}
                        </h4>

                        <div className="grid grid-cols-1 gap-3 pt-2">
                          {shuffledQuestions[currentQuizIdx].options.map((option, oIdx) => {
                            const isCorrect = oIdx === shuffledQuestions[currentQuizIdx].correctIdx;
                            const isSelected = selectedAnswerIdx === oIdx;

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={hasSubmittedAnswer}
                                onClick={() => setSelectedAnswerIdx(oIdx)}
                                className={`p-3 text-left border rounded text-xs font-mono transition-all cursor-pointer ${
                                  !hasSubmittedAnswer
                                    ? isSelected 
                                      ? 'bg-amber-950/40 border-saffron text-white font-black' 
                                      : 'bg-stone-900 border-stone-850 hover:border-stone-700'
                                    : isSelected
                                      ? isCorrect 
                                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100 font-black' 
                                        : 'bg-rose-950/40 border-rose-500 text-rose-100'
                                      : isCorrect
                                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100 font-semibold'
                                        : 'bg-stone-950 opacity-30 border-transparent'
                                }`}
                              >
                                {oIdx + 1}. {option}
                              </button>
                            );
                          })}
                        </div>

                        {!hasSubmittedAnswer ? (
                          <button
                            type="button"
                            disabled={selectedAnswerIdx === null}
                            onClick={() => {
                              setHasSubmittedAnswer(true);
                              if (selectedAnswerIdx === shuffledQuestions[currentQuizIdx].correctIdx) {
                                setQuizScore(prev => prev + 25); // 25 points per correct question
                              }
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-stone-900 to-stone-950 text-saffron uppercase font-mono text-[9px] font-black tracking-widest border border-saffron disabled:opacity-30 rounded cursor-pointer transition-all text-center"
                          >
                            ✓ SUBMIT TEST ANSWER
                          </button>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-stone-900/90 border border-stone-850 rounded text-left space-y-3"
                          >
                            <span className="text-[9.5px] font-mono uppercase font-black tracking-wider block">
                              {selectedAnswerIdx === shuffledQuestions[currentQuizIdx].correctIdx ? (
                                <span className="text-emerald-400">✓ CORRECT EXAM ENTRY!</span>
                              ) : (
                                <span className="text-rose-400">✗ ERRONEOUS CHRONOLOGY</span>
                              )}
                            </span>
                            
                            <p className="text-stone-300 text-[11px] leading-relaxed font-sans italic">
                              "{shuffledQuestions[currentQuizIdx].explanation}"
                            </p>

                            <button
                              type="button"
                              onClick={handleNextQuizQuestion}
                              className="w-full py-2 text-stone-950 bg-saffron hover:bg-amber-400 uppercase font-mono text-[9.5px] font-black tracking-wider transition-colors rounded cursor-pointer text-center"
                            >
                              {currentQuizIdx < 5 ? "Proceed to next ledger ▲" : "Examine Conferred Diplomas ▲"}
                            </button>
                          </motion.div>
                        )}

                      </div>
                    )}
                  </div>
                ) : (
                  // Printable Parchment Diploma
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-stone-900 border border-stone-850 rounded text-center space-y-2">
                      <h4 className="text-xs font-serif font-black text-white uppercase tracking-wider">
                        🎓 MILITARY TESTING RATINGS
                      </h4>
                      <p className="text-xs text-stone-400 leading-relaxed font-sans">
                        You scored <strong className="text-saffron font-bold text-sm mx-1">{quizScore} / 150 points</strong> in our randomized Hindusthan Chronicles knowledge exam.
                      </p>
                    </div>

                    {/* Classic Parchment Signed Diploma */}
                    <div className="parchment border-[8px] double border-[#8B5E3C] p-6 text-stone-950 text-center space-y-6 relative rounded shadow-2xl">
                      <div className="absolute top-2 left-2 text-[9px] text-[#8B5E3C]/60 font-mono">COURT LEDGER NO. 1761</div>
                      <div className="absolute top-2 right-2 text-[9px] text-[#8B5E3C]/60 font-mono">SHANIWAR WADA</div>

                      {/* Custom Wax Seal badge */}
                      <div className="absolute bottom-12 right-6 w-16 h-16 rounded-full bg-red-800 border-2 border-red-700/60 shadow-lg flex items-center justify-center transform rotate-12 opacity-85 select-none z-10">
                        <span className="font-serif text-[7.5px] text-white font-black leading-tight text-center">PESHWA<br/>SEAL<br/>1761</span>
                      </div>

                      <div className="space-y-1 pt-4">
                        <span className="text-[9px] text-[#9a3412] font-mono tracking-widest font-black uppercase block">
                          DECCAN STATE BOARD OF NORTHERN EXPEDITIONS
                        </span>
                        <h2 className="text-xl md:text-2xl font-serif font-black uppercase text-stone-950 tracking-tight">
                          DIPLOMA OF STRATEGIC EXPERTISE
                        </h2>
                      </div>

                      <div className="w-16 h-0.5 bg-[#8B5E3C] mx-auto opacity-35" />

                      <p className="text-xs font-serif text-stone-850 leading-relaxed italic max-w-md mx-auto">
                        "This document certifies successful operational parsing of flooded courier crossings, Delhi capital loans, French phalanx artillery, and the critical fallout of January 14."
                      </p>

                      <div className="space-y-1 bg-[#f0e2d3]/50 py-3 rounded border border-stone-950/5">
                        <span className="text-[7.5px] text-stone-500 uppercase font-mono block">BESTOWED HISTORICAL TITLE RANK</span>
                        <span className="text-xs md:text-sm font-serif font-black tracking-widest text-[#9a3412] block">
                          {getDiplomaTitle()}
                        </span>
                      </div>

                      {/* Political preference calculations */}
                      <div className="bg-[#ebd3b4]/30 p-3 rounded border border-stone-950/10 text-left space-y-1 font-sans">
                        <span className="text-[8px] text-stone-500 uppercase font-mono font-black block">TACTICAL DOCTRINE PREFERENCE TELEMETRY:</span>
                        <strong className="text-stone-900 text-[10px] font-serif uppercase tracking-tight block">
                          {getPhilosophyAlignment().title}
                        </strong>
                        <p className="text-[10px] leading-relaxed text-stone-700">{getPhilosophyAlignment().description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-left text-[9px] font-mono text-stone-600 uppercase border-t border-stone-950/10 pt-4">
                        <div>
                          <span>EXAMINING COMMANDER:</span>
                          <strong className="block text-stone-900 mt-0.5">IBRAHIM KHAN GARDI</strong>
                          <span className="text-[7.5px] italic text-stone-500">General of Phalanx Artillery</span>
                        </div>
                        <div className="text-right">
                          <span>ACADEMIC STAMP DATE:</span>
                          <strong className="block text-stone-900 mt-0.5">JUNE 16, 2026</strong>
                          <span className="text-[7.5px] italic text-stone-500">Certified Archive Ledger</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={initQuiz}
                        className="flex-1 py-3 bg-gradient-to-r from-stone-950 to-stone-900 text-saffron uppercase font-mono text-[10px] font-black tracking-widest hover:to-stone-850 rounded transition-all text-center cursor-pointer shadow-md"
                      >
                        🔄 RETAKE DIFFERENT RANDOMIZED QUESTIONS
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
