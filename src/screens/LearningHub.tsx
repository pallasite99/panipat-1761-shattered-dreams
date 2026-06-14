import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Clock3,
  Sparkles,
  Shield,
  MapPinned,
  Users,
  Landmark,
  ListChecks,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Screen } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

type AgeBand = '5-7' | '8-10' | '11-13';

type LearningChapter = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  childNote: string;
  facts: string[];
  activity: string;
  checkpointQuestion: string;
  options: string[];
  answerIndex: number;
  takeaway: string;
};

const CHAPTERS: LearningChapter[] = [
  {
    id: 'people',
    title: 'Who Was Involved?',
    subtitle: 'The main people and teams',
    summary: 'The story centers on two large powers, the Maratha Confederacy and the Durrani Empire, with many leaders, generals, and advisors helping each side.',
    childNote: 'Think of this like learning the cast of a very important history story.',
    facts: [
      'Sadashivrao Bhau led the Maratha army in the north.',
      'Ahmad Shah Durrani led the Afghan coalition.',
      'Ibrahim Khan Gardi managed disciplined artillery units.',
      'Several regional leaders helped shape the campaign on both sides.'
    ],
    activity: 'Point out which leader belonged to which side in the game portraits.',
    checkpointQuestion: 'Which leader headed the Maratha army during the northern campaign?',
    options: ['Sadashivrao Bhau', 'Najib-ud-Daula', 'Shah Wali Khan'],
    answerIndex: 0,
    takeaway: 'The conflict was led by many important people, but each side had one main commander.'
  },
  {
    id: 'places',
    title: 'Where Did It Happen?',
    subtitle: 'Maps, rivers, and routes',
    summary: 'The armies moved across a wide landscape of forts, rivers, plains, and cities. Geography shaped how fast the armies could travel and where they could fight.',
    childNote: 'Maps matter because armies cannot ignore rivers, hills, and long distances.',
    facts: [
      'Pune was the Maratha starting heartland.',
      'Delhi and the Yamuna region were important political and military centers.',
      'Panipat was the final battlefield on open plains.',
      'Rivers and supply roads changed the outcome as much as soldiers did.'
    ],
    activity: 'Open the map screen and trace one route from south to north.',
    checkpointQuestion: 'Which battlefield became the final major clash point?',
    options: ['Panipat', 'Pune', 'Kabul'],
    answerIndex: 0,
    takeaway: 'The campaign stretched across a huge distance, and location changed the strategy.'
  },
  {
    id: 'movement',
    title: 'How Did Armies Move?',
    subtitle: 'Supplies, cavalry, and planning',
    summary: 'Armies could not fight without food, water, horses, and weapons. Fast movement helped, but supply lines had to stay open for the troops to keep going.',
    childNote: 'An army is not just soldiers. It is also food, tools, animals, and messengers.',
    facts: [
      'Cavalry moved quickly and could scout or attack fast.',
      'Artillery was powerful but heavy and slow.',
      'Supplies often decided whether a campaign stayed strong.',
      'Weather and terrain could help one side and slow the other.'
    ],
    activity: 'Use the logistics screen to see how provisions affect the army.',
    checkpointQuestion: 'What did armies need most to keep moving during a long campaign?',
    options: ['Food and supplies', 'Only trophies', 'A bigger flag'],
    answerIndex: 0,
    takeaway: 'The strongest army is the one that can stay supplied and organized.'
  },
  {
    id: 'impact',
    title: 'Why Does It Matter?',
    subtitle: 'What changed after the battle',
    summary: 'The battle changed power in northern India, affected future alliances, and influenced the balance between regional powers for years afterward.',
    childNote: 'History is not only about who won. It is also about what changed next.',
    facts: [
      'The battle became one of the most important turning points of the 18th century.',
      'It showed that logistics and diplomacy can matter as much as battlefield bravery.',
      'It changed how different powers planned future campaigns.',
      'The story still matters because it teaches strategy, leadership, and consequence.'
    ],
    activity: 'Read the timeline and find one event that led to the final battle.',
    checkpointQuestion: 'What does this battle teach most clearly?',
    options: ['Only swords matter', 'Planning and supply matter', 'Maps are unnecessary'],
    answerIndex: 1,
    takeaway: 'History helps us understand how decisions, places, and people shape the future.'
  }
];

type ProgressState = {
  ageBand: AgeBand;
  readAloud: boolean;
  sessionMinutes: number;
  completed: Record<string, boolean>;
  quizScores: Record<string, number>;
};

const STORAGE_KEY = 'panipat_learning_lms';

const DEFAULT_PROGRESS: ProgressState = {
  ageBand: '8-10',
  readAloud: true,
  sessionMinutes: 12,
  completed: {},
  quizScores: {},
};

const loadProgress = (): ProgressState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(saved) as Partial<ProgressState>;
    return {
      ageBand: parsed.ageBand || DEFAULT_PROGRESS.ageBand,
      readAloud: parsed.readAloud ?? DEFAULT_PROGRESS.readAloud,
      sessionMinutes: parsed.sessionMinutes || DEFAULT_PROGRESS.sessionMinutes,
      completed: parsed.completed || {},
      quizScores: parsed.quizScores || {},
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
};

export const LearningHub: React.FC<{
  onNavigate: (s: Screen) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuClose: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ onNavigate, isMenuOpen, onToggleMenu, onMenuClose, onHelp, onSettings }) => {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [activeChapterId, setActiveChapterId] = useState(CHAPTERS[0].id);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showParentPanel, setShowParentPanel] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const activeChapter = CHAPTERS.find((chapter) => chapter.id === activeChapterId) || CHAPTERS[0];
  const completedCount = Object.values(progress.completed).filter(Boolean).length;
  const completionPercent = Math.round((completedCount / CHAPTERS.length) * 100);
  const averageQuizScore = useMemo(() => {
    const scores = Object.values(progress.quizScores) as number[];
    if (!scores.length) return 0;
    return Math.round(scores.reduce((sum: number, value) => sum + Number(value), 0) / scores.length);
  }, [progress.quizScores]);

  const setAgeBand = (ageBand: AgeBand) => setProgress((prev) => ({ ...prev, ageBand }));
  const setSessionMinutes = (sessionMinutes: number) => setProgress((prev) => ({ ...prev, sessionMinutes }));
  const toggleReadAloud = () => setProgress((prev) => ({ ...prev, readAloud: !prev.readAloud }));

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    const correct = index === activeChapter.answerIndex;
    const score = correct ? 100 : 0;

    setFeedback(
      correct
        ? 'Correct. You understood the chapter.'
        : `Not quite. The right answer is "${activeChapter.options[activeChapter.answerIndex]}".`
    );

    setProgress((prev) => ({
      ...prev,
      completed: { ...prev.completed, [activeChapter.id]: correct || prev.completed[activeChapter.id] },
      quizScores: { ...prev.quizScores, [activeChapter.id]: score },
    }));
  };

  const resetChapter = () => {
    setSelectedAnswer(null);
    setFeedback('');
  };

  const goNext = () => {
    const currentIndex = CHAPTERS.findIndex((chapter) => chapter.id === activeChapter.id);
    const next = CHAPTERS[(currentIndex + 1) % CHAPTERS.length];
    setActiveChapterId(next.id);
    resetChapter();
  };

  const markRevisit = () => {
    setProgress((prev) => ({
      ...prev,
      completed: { ...prev.completed, [activeChapter.id]: false },
      quizScores: { ...prev.quizScores, [activeChapter.id]: 0 },
    }));
    resetChapter();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-[#16110d] via-[#231910] to-[#0e0a08] text-stone-100">
      <TopBar
        screen={Screen.LEARNING_HUB}
        onNavigate={onNavigate}
        onToggleMenu={onToggleMenu}
        onHelp={onHelp}
        onSettings={onSettings}
      />
      <SideNav screen={Screen.LEARNING_HUB} onNavigate={onNavigate} isOpen={isMenuOpen} onClose={onMenuClose} />

      <main className="h-full pt-16 lg:pl-64">
        <div className="h-[calc(100vh-4rem)] grid grid-cols-1 xl:grid-cols-[340px_1fr]">
          <aside className="border-r border-stone-800 bg-stone-950/75 p-5 overflow-y-auto">
            <div className="rounded-xs border border-saffron/20 bg-[#21150d] p-4 mb-4">
              <div className="flex items-center gap-2 text-saffron font-mono text-[10px] uppercase tracking-[0.3em] font-black">
                <GraduationCap size={14} />
                Learning Mode
              </div>
              <h2 className="mt-3 font-serif text-2xl font-black leading-tight">
                History, told in small, guided steps
              </h2>
              <p className="mt-2 text-sm text-stone-300 leading-relaxed">
                This section turns the campaign into a classroom. Each chapter has a short explanation, a map or people focus, and a simple check for understanding.
              </p>
            </div>

            <div className="rounded-xs border border-stone-800 bg-stone-950 p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Learner Profile</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-saffron">{progress.ageBand}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['5-7', '8-10', '11-13'] as AgeBand[]).map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => setAgeBand(band)}
                    className={`rounded-xs border px-2 py-2 text-[9px] font-mono font-black uppercase tracking-widest transition-colors ${
                      progress.ageBand === band
                        ? 'border-saffron bg-saffron/10 text-saffron'
                        : 'border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={toggleReadAloud}
                  className={`rounded-xs border px-3 py-2 text-[9px] font-mono font-black uppercase tracking-widest ${
                    progress.readAloud ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300' : 'border-stone-800 text-stone-400'
                  }`}
                >
                  Read Aloud: {progress.readAloud ? 'On' : 'Off'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowParentPanel((prev) => !prev)}
                  className="rounded-xs border border-stone-800 px-3 py-2 text-[9px] font-mono font-black uppercase tracking-widest text-stone-300"
                >
                  {showParentPanel ? 'Hide Guide' : 'Show Guide'}
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Session length</span>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={progress.sessionMinutes}
                  onChange={(e) => setSessionMinutes(Number(e.target.value))}
                  className="w-full accent-saffron"
                />
                <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono uppercase">
                  <span>5 min</span>
                  <span>{progress.sessionMinutes} min</span>
                  <span>20 min</span>
                </div>
              </div>
            </div>

            {showParentPanel && (
              <div className="rounded-xs border border-stone-800 bg-stone-950 p-4 mb-4">
                <div className="flex items-center gap-2 text-saffron font-mono text-[10px] uppercase tracking-[0.3em] font-black">
                  <Shield size={14} />
                  Parent / Teacher Guide
                </div>
                <ul className="mt-3 space-y-2 text-sm text-stone-300 leading-relaxed">
                  <li>Keep the chapter length short and repeat key names aloud.</li>
                  <li>Ask the child to point to a place on the map after each lesson.</li>
                  <li>Use the quiz as a conversation, not a test.</li>
                  <li>Revisit chapters when the answer is wrong; progress updates automatically.</li>
                </ul>
              </div>
            )}

            <div className="rounded-xs border border-stone-800 bg-stone-950 p-4">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-stone-500">
                <span>Progress</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-stone-900 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-saffron to-amber-500" style={{ width: `${completionPercent}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="rounded-xs border border-stone-800 p-2">
                  <span className="block uppercase tracking-widest text-stone-500">Chapters</span>
                  <span className="block mt-1 text-stone-100 font-black">{completedCount}/{CHAPTERS.length}</span>
                </div>
                <div className="rounded-xs border border-stone-800 p-2">
                  <span className="block uppercase tracking-widest text-stone-500">Quiz Avg</span>
                  <span className="block mt-1 text-stone-100 font-black">{averageQuizScore}%</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="relative overflow-y-auto p-4 md:p-6 xl:p-8">
            <div className="mx-auto max-w-6xl space-y-5">
              <div className="rounded-xs border border-saffron/20 bg-stone-950/75 p-4 md:p-5 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-saffron font-black">
                      <BookOpen size={14} />
                      Chapter {CHAPTERS.findIndex((chapter) => chapter.id === activeChapter.id) + 1}
                    </div>
                    <h1 className="mt-2 font-serif text-3xl md:text-5xl font-black leading-tight text-white">
                      {activeChapter.title}
                    </h1>
                    <p className="mt-2 text-stone-300 text-base md:text-lg italic">
                      {activeChapter.subtitle}
                    </p>
                    <p className="mt-4 text-stone-200 leading-relaxed max-w-3xl">
                      {activeChapter.summary}
                    </p>
                    <p className="mt-3 text-sm text-saffron/90 font-medium">
                      {activeChapter.childNote}
                    </p>
                  </div>
                  <div className="rounded-xs border border-stone-800 bg-[#1b130f] p-4 min-w-[220px]">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-stone-500">
                      <Clock3 size={13} />
                      Suggested session
                    </div>
                    <div className="mt-2 text-3xl font-serif font-black text-saffron">{progress.sessionMinutes} min</div>
                    <div className="mt-3 text-sm text-stone-300">
                      Read aloud is {progress.readAloud ? 'enabled' : 'off'}.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
                <div className="space-y-4">
                  <div className="rounded-xs border border-stone-800 bg-stone-950/80 p-4 md:p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-black text-white">Key facts</h3>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">4 quick points</span>
                    </div>
                    <ul className="mt-4 grid gap-3">
                      {activeChapter.facts.map((fact) => (
                        <li key={fact} className="flex gap-3 rounded-xs border border-stone-800 bg-stone-900/60 p-3">
                          <Sparkles className="mt-0.5 text-amber-400 shrink-0" size={15} />
                          <span className="text-stone-200 leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xs border border-stone-800 bg-stone-950/80 p-4 md:p-5">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-stone-500">
                      <ListChecks size={14} />
                      Try it
                    </div>
                    <p className="mt-2 text-stone-200 leading-relaxed">{activeChapter.activity}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={resetChapter}
                        className="rounded-xs border border-stone-800 px-3 py-2 text-[10px] font-mono font-black uppercase tracking-widest text-stone-300"
                      >
                        <RotateCcw size={12} className="inline-block mr-1" />
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="rounded-xs border border-saffron bg-saffron px-3 py-2 text-[10px] font-mono font-black uppercase tracking-widest text-stone-950"
                      >
                        <ArrowRight size={12} className="inline-block mr-1" />
                        Next chapter
                      </button>
                      <button
                        type="button"
                        onClick={markRevisit}
                        className="rounded-xs border border-stone-800 px-3 py-2 text-[10px] font-mono font-black uppercase tracking-widest text-stone-300"
                      >
                        Revisit later
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xs border border-stone-800 bg-stone-950/80 p-4 md:p-5">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-stone-500">
                      <Landmark size={14} />
                      Checkpoint
                    </div>
                    <h3 className="mt-2 font-serif text-xl font-black text-white leading-tight">
                      {activeChapter.checkpointQuestion}
                    </h3>
                    <div className="mt-4 space-y-2">
                      {activeChapter.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === activeChapter.answerIndex;
                        const answered = selectedAnswer !== null;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleAnswer(index)}
                            className={`w-full rounded-xs border px-3 py-3 text-left transition-colors ${
                              answered
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200'
                                  : isSelected
                                    ? 'border-red-500 bg-red-950/30 text-red-200'
                                    : 'border-stone-800 bg-stone-950 text-stone-500'
                                : 'border-stone-800 bg-stone-950 text-stone-200 hover:border-saffron hover:bg-stone-900'
                            }`}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="font-medium">{option}</span>
                              {answered && isCorrect && <CheckCircle2 size={14} className="text-emerald-400" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="mt-4 rounded-xs border border-stone-800 bg-stone-900/80 p-3 text-sm text-stone-200"
                        >
                          {feedback}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="rounded-xs border border-stone-800 bg-[#1a120d] p-4 md:p-5">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-stone-500">
                      <Users size={14} />
                      What this chapter teaches
                    </div>
                    <p className="mt-2 text-stone-200 leading-relaxed">{activeChapter.takeaway}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
