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
  TrendingUp, 
  Coins, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  UserCheck,
  Crown,
  PlayCircle
} from 'lucide-react';
import { Screen } from '../types';
import { TopBar, SideNav } from '../components/SharedUI';

// Define the Lessons structure for both pathways
interface Lesson {
  id: string;
  title: string;
  duration: string;
  level: 'Student' | 'Scholar';
  summary: string;
  fullText: string[];
  illustrationUrl: string;
  keyFact: string;
}

const LESSONS: Lesson[] = [
  // Student Path Lessons
  {
    id: 's1',
    title: 'The Great Gathering of 1761',
    duration: '5 mins',
    level: 'Student',
    summary: 'Discover how 200,000 soldiers gathered from thousands of miles away to fight on a single battlefield.',
    keyFact: 'Maratha soldiers marched for over 4 months from Pune covering a distance of 1,200 km just to reach Panipat!',
    illustrationUrl: 'https://images.unsplash.com/photo-1507727181347-9750059c4456?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "In the freezing cold of January 1761, a massive dynamic clash took place on the plains of Panipat, a historic town 100km north of Delhi.",
      "The Maratha Empire of India had marched all the way from their capital Pune in the south to defend Delhi and Punjab from an invading King, Ahmad Shah Durrani of Afghanistan.",
      "With the Maratha army traveled thousands of pilgrims, women, and elders who wanted to visit holy shrines in Northern India. This huge crowd created a moving city of tents, horses, and campfires.",
      "Ahmad Shah Durrani commanded a swift, highly-trained desert cavalry. Together with his allies, the Rohilla tribes, he surrounded the Maratha camp, starting a dramatic winter standoff that changed the fate of Hindusthan forever."
    ]
  },
  {
    id: 's2',
    title: 'Weapons of War: Musket vs. Camel Gun',
    duration: '6 mins',
    level: 'Student',
    summary: 'Compare the exciting military technology used in 1761, from heavy cannons to agile camel guns.',
    keyFact: 'The Afghan "Zamburak" was a small cannon mounted on a camel saddle that could spin and shoot in any direction!',
    illustrationUrl: 'https://images.unsplash.com/photo-1601662528567-5264024036f0?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "Battlefields in 1761 looked and sounded like thunder. Soldiers used long-barrel guns called matchlocks and curved swords called Talwars.",
      "The Marathas had advanced heavy brass cannons that could shoot immense balls of iron to crush enemy formations from a distance.",
      "The Afghan forces used a special weapon called the Jezail—a beautiful but deadly rifle with a curved stock that could fire much further than the standard Maratha muskets.",
      "Most unique of all were the 'Zamburaks'. These were light artillery guns placed on camels! The camels would kneel, firing deadly heavy shots, then stand up and gallop to a new spot, making them extremely fast and modern."
    ]
  },
  {
    id: 's3',
    title: 'Food, Water and the Fateful Siege',
    duration: '5 mins',
    level: 'Student',
    summary: 'Learn how staying fed and warm is just as important as swords in winning a grand campaign.',
    keyFact: 'By December 1760, coin currency was useless: a single fistful of dry grain in the besieged Maratha camp cost its weight in pure silver!',
    illustrationUrl: 'https://images.unsplash.com/photo-1549673967-893bd5798485?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "Even the bravest warrior cannot fight on an empty stomach. Before the big clash, both armies tried to cut off each other's supply carts.",
      "Ahmad Shah Durrani successfully isolated the Maratha army inside Panipat town, stopping all grain and money wagons coming up from Pune.",
      "As winter set in, the Marathas ran out of food and wood. Thousands of camp followers and animals starved in the freezing cold. The green grass inside the town was completely consumed by horses.",
      "With only one day of food left, the Maratha commanders had to make a desperate choice: either starve slowly or charge the Afghan lines with absolute bravery in a final clash."
    ]
  },

  // Scholar Lessons
  {
    id: 'c1',
    title: 'The Geopolitical Chessboard of Hindusthan',
    duration: '8 mins',
    level: 'Scholar',
    summary: 'Analyze the complex treaty dynamics, financial strains, and regional coalitions that set the stage for Panipat.',
    keyFact: 'The Marathas had contracted with the Mughal Emperor in 1752 (Ahadnama) to protect Delhi in exchange for tax extraction rights (Chauth) across Northern India.',
    illustrationUrl: 'https://images.unsplash.com/photo-1597405232148-732386992d9f?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "The conflict of 1761 was the result of a shifting power vacuum in North India. As the Mughal Empire declined, the Maratha Confederacy expanded rapidly, pushing their frontier posts up to the Khyber Pass.",
      "This rapid expansion alienated local powers. When the Afghan king Ahmad Shah Durrani invaded to reclaim Punjab, he did not fight alone; he formed a powerful religious-political coalition with Najib-ud-Daulah of the Rohillas and Shuja-ud-Daulah, the wealthy Nawab of Awadh.",
      "The Marathas, despite massive physical power, marched into the north with crucial diplomatic setbacks. Chief allies like the Jats of Bharatpur abandoned the campaign due to strategic differences, and regional Rajput rulers remained neutral.",
      "Consequently, Sadashivrao Bhau found himself isolated 1,000 kilometres from his Deccan supply bases, surrounded by hostile local kingdoms and carrying a colossal administrative debt."
    ]
  },
  {
    id: 'c2',
    title: 'The French Phalanx: Ibrahim Gardi’s Cannons',
    duration: '9 mins',
    level: 'Scholar',
    summary: 'Deconstruct the tactical evolution of Maratha warfare from guerrilla raids to European-style infantry drill.',
    keyFact: 'Ibrahim Khan Gardi had trained under the legendary French General Bussy, introducing systematic artillery-and-bayonet phalanxes to Indian soil.',
    illustrationUrl: 'https://images.unsplash.com/photo-1590766244534-7389814407ce?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "Historically, the Marathas excelled in 'Ganimi Kava'—lightning-fast guerrilla cavalry raids that avoided pitched battles to encircle and harass enemy logistics.",
      "However, for the 1761 expedition, Pune’s high command adopted a European model. Ibrahim Khan Gardi’s disciplined 'Gardi' infantry wore French uniforms, carried flintlock muskets, and operated elite brass field gun batteries.",
      "Tactically, the Gardi brigade operated as self-contained hollow squares. Surrounded by artillery on all four sides, they could advance methodically, repelling heavy cavalry charges with disciplined volleys of grape-shot and iron bayonets.",
      "At Panipat, this modern phalanx initially succeeded, decimating the Durrani right flank. However, the lack of coordination with traditional Maratha light cavalry, who refused to fight defensive, static battles, left the Gardi flanks catastrophically exposed to the Shah's elite mobile reserve."
    ]
  },
  {
    id: 'c3',
    title: 'Logistical Collapse under the Winter Frost',
    duration: '8 mins',
    level: 'Scholar',
    summary: 'Investigate how economic deficits, extreme weather, and horse-supply routes decided the campaign long before the battle commenced.',
    keyFact: 'The temperature on January 14, 1761, fell near 3°C on the Panipat plains, decimating Maratha soldiers dressed in light cotton garments designed for Deccan summers.',
    illustrationUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "Behind the romance of sword clashes lies the absolute reality of military economics. The Maratha grand expedition carried a daily wage bill of thousands of Rupees, while the Pune treasury was heavily in arrears.",
      "By blocking the crossing coordinates of the Yamuna River, Ahmad Shah Durrani succeeded in placing a complete chokehold over the Maratha camp. This cut off communication with Delhi, Pune, and the fertile supply lands of Awadh.",
      "The result was severe famine. Over 50,000 war-horses and pack camels starved to death. Maratha troops were forced to survive on minimal parched grain, and the camp followers began to die in large numbers.",
      "This logistical strangulation turned the final battle into an act of desperation. The Maratha soldiers, weak from starvation and shivering under inadequate clothing, charged the well-fed, warm Durrani coalition with the legendary courage of " +
      "men who had nothing left to lose."
    ]
  }
];

// Interactive Sandbox Formations
interface TacticalFormation {
  name: string;
  creator: string;
  advantage: string;
  vulnerability: string;
  description: string;
  icon: string;
  stats: { attack: number; defense: number; mobility: number };
}

const FORMATIONS: TacticalFormation[] = [
  {
    name: 'Gardi Infantry artillery Square',
    creator: 'Ibrahim Khan Gardi (Maratha)',
    advantage: 'Highly lethal against frontal heavy cavalry charges. Relies on systematic gunpowder volleys and bayonets.',
    vulnerability: 'Very slow to move, vulnerable to flank cavalry encirclement if light horse divisions break.',
    description: 'A European-drilled phalanx with heavy cannon batteries placed in the center and protected by musketeers with fixed bayonets on all four sides.',
    icon: '🛡️',
    stats: { attack: 85, defense: 95, mobility: 20 }
  },
  {
    name: 'Durrani Crescent Wedge',
    creator: 'Ahmad Shah Abdali (Durrani)',
    advantage: 'Outstanding battlefield encirclement. Pushes enemy forces into a tight center to decimate them.',
    vulnerability: 'Requires precise coordination; can break in the center if hit by concentrated heavy artillery barrage.',
    description: 'The crescent formation allows fast light cavalry horse-archers to sweep around the enemy flanks while strong veteran troops hold the core line.',
    icon: '🌙',
    stats: { attack: 90, defense: 75, mobility: 85 }
  },
  {
    name: 'Pashtun Light Camel Zamburaks',
    creator: 'Shah Wali Khan (Afghan)',
    advantage: 'Extremely mobile firepower. Camels can kneel, fire light falconet cannon shells, then rapidly reposition.',
    vulnerability: 'Low defensive armor. Exposed to rapid long-range heavy artillery fire.',
    description: 'Swivel gun cannon mounts strapped securely to veteran camels. Able to provide quick tactical fire support exactly where the battle line is suffering.',
    icon: '🐫',
    stats: { attack: 80, defense: 45, mobility: 95 }
  }
];

// Interactive Roleplay Scenarios
interface ScenarioOption {
  id: string;
  text: string;
  historicalResult: string;
  scoreImpact: number;
}

interface Scenario {
  id: string;
  title: string;
  problem: string;
  options: ScenarioOption[];
}

const TIME_DECISIONS: Scenario[] = [
  {
    id: 'rec1',
    title: 'The Crossing of the Yamuna River (October 1760)',
    problem: 'The Yamuna River is flooded and treacherous. Ahmad Shah Durrani’s scouts have reported that all deep water bridges and shallow fords are closely guarded. How should the Maratha leadership approach this major obstacle?',
    options: [
      {
        id: 'opt1_1',
        text: 'Wait for the floodwaters to fully recede to guarantee safe crossing for heavy logistics baggage.',
        historicalResult: 'ERRONEOUS. This gave Ahmad Shah Durrani critical weeks to seal alliances with major kings in northern India, leaving the Marathas isolated.',
        scoreImpact: -15
      },
      {
        id: 'opt1_2',
        text: 'Launch an elite, swift vanguard night-crossing at an unguarded deep-water ford, sending cavalry swimmers first.',
        historicalResult: 'HISTORICAL DECISION. This bold move surprised the enemy, initially securing the strategic road to Delhi, though at a cost of brave riders.',
        scoreImpact: 25
      },
      {
        id: 'opt1_3',
        text: 'Offer high financial gold peace terms to local zamindars to build custom pontoon boats under fire.',
        historicalResult: 'INEFFECTIVE. High corruption among regional chiefs depleted treasury reserves without securing stable crossings.',
        scoreImpact: -5
      }
    ]
  },
  {
    id: 'rec2',
    title: 'The Great Siege Dilemma: Famine or Fire?',
    problem: 'Your scouts report that there is only enough horse fodder and citizen bread rations to survive 48 hours. The Maratha army is fully trapped behind Panipat mud-walls. What is your command directive?',
    options: [
      {
        id: 'opt2_1',
        text: 'Send urgent messengers to the Jats requesting immediate gold rescue and dry food grain caravans.',
        historicalResult: 'DIPLOMATIC DEADEND. Major Jats had withdrawn from active coalition due to strategic disputes, ignoring all messages.',
        scoreImpact: -10
      },
      {
        id: 'opt2_2',
        text: 'Throw open the city gates at dawn and charge the Afghan encampment in a final, glorious do-or-die assault.',
        historicalResult: 'HISTORICAL REALITY. Compelled by famine, the entire Maratha army smeared their faces with saffron and charged at dawn. It was a brave surge that nearly broke Abdali’s center.',
        scoreImpact: 30
      },
      {
        id: 'opt2_3',
        text: 'Attempt a silent midnight retreat with camp followers, abandoning heavy artillery in the mud.',
        historicalResult: 'CATASTROPHIC failure. Afghan light riders patrol the roads 24/7; a silent retreat would lead to immediate encirclement and routing of defenseless civilians.',
        scoreImpact: -25
      }
    ]
  }
];

// Academic Knowledge Quiz
interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Which battle in January 1760 allowed Sadashivrao Bhau to pay his elite artillery divisions?",
    options: ["Battle of Burhanpur", "Battle of Udgir", "Battle of Delhi", "Battle of Pune"],
    correctIdx: 1,
    explanation: "At the Battle of Udgir in Deccan, Ibrahim Khan Gardi's French-trained cannons defeated the Nizam, securing massive forts and 60 Lakhs in tribute to fund the grand northern march."
  },
  {
    question: "What specific weapon of the Afghan army had exceptional long-range firing precision?",
    options: ["The Garmadi Rocket", "The Jezail Musket", "The Talwar Blade", "The Mughal Sabre"],
    correctIdx: 1,
    explanation: "The Jezail was an Afghan long-barrel musket with a curved stock. It had superior range and stability compared to the typical smoothbore matchlock guns used in India."
  },
  {
    question: "What was the 'Zamburak'?",
    options: ["A heavy stone-throwing trebuchet", "A mobile cannon mounted on a kneeling camel", "An explosive iron grenade thrower", "A protective leather armor for military horses"],
    correctIdx: 1,
    explanation: "Zamburaks were highly effective swivel guns mounted on camels, allowing fast tactical artillery fire across the sandy plains."
  },
  {
    question: "Which general led the highly disciplined French-pattern artillery for the Marathas?",
    options: ["Dattaji Shinde", "Malharrao Holkar", "Najib-ud-Daulah", "Ibrahim Khan Gardi"],
    correctIdx: 3,
    explanation: "Ibrahim Khan Gardi was the famous general who commanded the Maratha artillery, deploying disciplined European hollow-square tactics on the field."
  },
  {
    question: "What was the primary cause of the severe famine within the Maratha camp at Panipat?",
    options: ["An early summer drought in the Deccan", "The complete blockade of the Yamuna logistics crossing by Ahmad Shah", "Insects destroying the grain warehouse", "Corruption within the Pune grain merchants guild"],
    correctIdx: 1,
    explanation: "Ahmad Shah Durrani's troops blocked all river crossings and roads, preventing food and money wagons from reaching the Maratha position for weeks."
  }
];

export const LMS: React.FC<{
  onNavigate: (s: Screen) => void;
  onHelp?: () => void;
  onSettings?: () => void;
}> = ({ onNavigate, onHelp, onSettings }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'formations' | 'decisions' | 'quiz'>('lessons');
  const [selectedPathway, setSelectedPathway] = useState<'Student' | 'Scholar'>('Student');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [selectedLesson]);
  
  // Progress state saved to localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [decisionScores, setDecisionScores] = useState<Record<string, number>>({});
  const [selectedDecisionAnswers, setSelectedDecisionAnswers] = useState<Record<string, string>>({});
  
  // Quiz module state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Load persistence
  useEffect(() => {
    const lIds = localStorage.getItem('panipat_lms_completed_lessons');
    if (lIds) setCompletedLessonIds(JSON.parse(lIds));

    const scores = localStorage.getItem('panipat_lms_decision_scores');
    if (scores) setDecisionScores(JSON.parse(scores));

    const answers = localStorage.getItem('panipat_lms_decision_answers');
    if (answers) setSelectedDecisionAnswers(JSON.parse(answers));
  }, []);

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

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIdx(currentQuizIdx + 1);
      setSelectedAnswerIdx(null);
      setHasSubmittedAnswer(false);
    } else {
      setQuizCompleted(true);
      // Persist maximum score
      const prevMax = parseInt(localStorage.getItem('panipat_lms_quiz_max') || '0', 10);
      if (quizScore > prevMax) {
        localStorage.setItem('panipat_lms_quiz_max', quizScore.toString());
      }
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedAnswerIdx(null);
    setHasSubmittedAnswer(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const getDiplomaTitle = () => {
    const totalPoints = quizScore + Object.values(decisionScores).reduce((a: number, b: number) => a + b, 0);
    if (selectedPathway === 'Student') {
      if (totalPoints >= 60) return "★ PESHWA SENTRY BADGE & ACADEMY DIPLOMA ★";
      if (totalPoints >= 30) return "★ MAWALA CADET CERTIFICATE ★";
      return "★ JUNIOR HISTORIAN BADGE ★";
    } else {
      if (totalPoints >= 100) return "♛ GRAND STRATEGIC CHANCELLOR TITLE ♛";
      if (totalPoints >= 60) return "✹ WAR COUNCIL ACADEMIC FELLOW ✹";
      return "✦ CAMPAIGN SCHOLAR OF THE EMPIRE ✦";
    }
  };

  // Filter lessons based on selected level pathway
  const filteredLessons = LESSONS.filter(l => l.level === selectedPathway);
  const totalCompletedInCurrentPathResult = filteredLessons.filter(l => completedLessonIds.includes(l.id)).length;

  return (
    <div id="lms-screen-root" className="relative h-screen w-screen bg-[#140e0b] overflow-hidden text-stone-200">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center sepia"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1200&auto=format&fit=crop')" }}
        />
      </div>

      {/* Global Top Bar */}
      <TopBar screen={Screen.LMS as any} onNavigate={onNavigate} onHelp={onHelp} onSettings={onSettings} />

      <div className="flex h-full pt-16 relative z-10">
        
        {/* Left Side Navigation (reusing SideNav template) */}
        <SideNav screen={Screen.LMS as any} onNavigate={onNavigate} isOpen={false} />

        {/* Core LMS Layout */}
        <div className="flex-1 lg:pl-64 h-full flex flex-col overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-[#1f1610] border-b border-[#8B5E3C]/30 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shrink-0">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-saffron w-5 h-5 animate-bounce" />
                <span className="text-[10px] text-saffron uppercase font-mono tracking-widest font-bold">
                  MILITARY EDUCATION ACADEMY
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif text-white font-black tracking-tight uppercase">
                PANIPAT HISTORICAL LESSONS
              </h2>
            </div>

            {/* Pathway Selector (Students vs Scholar Adults) */}
            <div className="flex bg-stone-950/80 p-1 border border-[#8B5E3C]/30 rounded-xs">
              <button
                type="button"
                id="btn-level-student"
                onClick={() => { setSelectedPathway('Student'); setSelectedLesson(null); }}
                className={`px-4 py-1.5 text-xs font-mono uppercase font-black tracking-wider transition-all rounded-xs cursor-pointer ${selectedPathway === 'Student' ? 'bg-saffron text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                👶 Student Track
              </button>
              <button
                type="button"
                id="btn-level-scholar"
                onClick={() => { setSelectedPathway('Scholar'); setSelectedLesson(null); }}
                className={`px-4 py-1.5 text-xs font-mono uppercase font-black tracking-wider transition-all rounded-xs cursor-pointer ${selectedPathway === 'Scholar' ? 'bg-[#9a3412] text-white font-black shadow-md' : 'text-stone-400 hover:text-white'}`}
              >
                📜 Scholar Track
              </button>
            </div>
          </div>

          {/* Module Tabs Selector */}
          <div className="bg-[#18110b] border-b border-stone-850 px-6 py-2.5 flex gap-2 overflow-x-auto shrink-0">
            {[
              { id: 'lessons', label: '📖 Academy Lessons', idTag: 'tab-lms-lessons' },
              { id: 'formations', label: '🛡️ Formations Sandbox', idTag: 'tab-lms-formations' },
              { id: 'decisions', label: '⚖️ Scenario Checkpoints', idTag: 'tab-lms-decisions' },
              { id: 'quiz', label: '🏅 Challenge & Diploma', idTag: 'tab-lms-quiz' }
            ].map(tab => (
              <button
                key={tab.id}
                id={tab.idTag}
                type="button"
                onClick={() => { setActiveTab(tab.id as any); setSelectedLesson(null); }}
                className={`px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xs border transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? 'bg-stone-950 text-saffron border-[#8B5E3C]' : 'bg-transparent text-stone-400 border-transparent hover:text-stone-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive view container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
            
            {/* View A: Lessons */}
            {activeTab === 'lessons' && (
              <AnimatePresence mode="wait">
                {!selectedLesson ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 text-left"
                  >
                    <div className="p-4 bg-[#20150d] border border-[#8B5E3C]/20 rounded-xs">
                      <h3 className="text-sm font-serif font-bold text-white mb-1 uppercase tracking-wide">
                        {selectedPathway === 'Student' ? "Student Course: Simple Adventures" : "Strategic Course: Advanced Campaign Analysis"}
                      </h3>
                      <p className="text-xs text-stone-400 leading-relaxed font-sans">
                        {selectedPathway === 'Student' 
                          ? "Welcome to the Youth Academy! Read the stories below to learn about the incredible armies, creative innovations, and brave decisions made on Indian soil. Finish all three lessons to unlock your Diploma!" 
                          : "Welcome, Scholar. Dive deep into the structural economics of Pune, the military precision of European weaponry, and the tactical failures of the grand coordination. Read critically to answer high-stakes scenario checkpoints."
                        }
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-saffron font-bold uppercase tracking-wider">
                        <span>Course Progress:</span>
                        <div className="w-32 h-1.5 bg-stone-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-saffron transition-all" 
                            style={{ width: `${(totalCompletedInCurrentPathResult / filteredLessons.length) * 100}%` }}
                          />
                        </div>
                        <span>{totalCompletedInCurrentPathResult} / {filteredLessons.length} Completed</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredLessons.map((lesson, idx) => {
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        return (
                          <motion.div
                            key={lesson.id}
                            whileHover={{ y: -4 }}
                            className="bg-stone-950 border border-stone-850 hover:border-[#8B5E3C]/60 p-5 rounded-xs flex flex-col justify-between space-y-4 shadow-xl"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase text-stone-500">
                                <span className="text-[#8B5E3C]">LESSON {idx + 1}</span>
                                <span>⏱️ {lesson.duration}</span>
                              </div>
                              <h4 className="text-base font-serif font-bold text-white tracking-tight text-left">
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-stone-400 leading-relaxed text-left font-sans line-clamp-3">
                                {lesson.summary}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-stone-900 flex justify-between items-center">
                              {isCompleted ? (
                                <span className="text-[10px] text-emerald-400 font-mono font-black uppercase flex items-center gap-1">
                                  ✓ COMPLETED
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-500 font-mono font-bold uppercase">
                                  ⚫ UNREAD
                                </span>
                              )}
                              
                              <button
                                type="button"
                                id={`btn-open-lesson-${lesson.id}`}
                                onClick={() => setSelectedLesson(lesson)}
                                className="px-3.5 py-1.5 bg-stone-900 border border-stone-800 hover:border-saffron text-stone-200 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors rounded-xs cursor-pointer flex items-center gap-1"
                              >
                                STUDY <ChevronRight size={10} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto text-left space-y-6"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(null)}
                      className="px-4 py-2 bg-stone-950 text-[#8B5E3C] hover:text-saffron font-mono text-xs uppercase font-black tracking-widest border border-stone-850 hover:border-saffron/40 flex items-center gap-1.5 rounded-xs cursor-pointer transition-colors"
                    >
                      <ArrowLeft size={14} /> Back to Course Catalogue
                    </button>

                    <div className="parchment border-4 border-[#8B5E3C] p-6 md:p-8 shadow-2xl space-y-6 rounded-sm">
                      <div className="border-b border-stone-950/20 pb-4">
                        <span className="text-[9px] text-[#8B5E3C] uppercase font-mono tracking-widest font-black block">
                          {selectedLesson.level} Academy • Historical Monograph
                        </span>
                        <h3 className="text-xl md:text-3xl font-serif text-stone-950 font-black uppercase tracking-tight text-left mt-1">
                          {selectedLesson.title}
                        </h3>
                      </div>

                      {/* Image frame */}
                      <div className="w-full h-48 md:h-64 border border-stone-950/20 bg-[#ebd3b4] rounded-sm overflow-hidden relative shadow-lg flex items-center justify-center">
                        {!imageError ? (
                          <img 
                            src={selectedLesson.illustrationUrl} 
                            alt={selectedLesson.title} 
                            className="w-full h-full object-cover filter brightness-95 sepia-[15%]" 
                            referrerPolicy="no-referrer"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-[#eae0cf] relative select-none">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/old-map.png')" }} />
                            <BookOpenText className="w-12 h-12 text-[#8B5E3C] mb-2 animate-pulse relative z-10" />
                            <h4 className="relative z-10 font-serif text-sm md:text-base font-black text-stone-900 tracking-tight uppercase">
                              {selectedLesson.title}
                            </h4>
                            <p className="relative z-10 font-mono text-[8px] text-[#8B5E3C] font-bold uppercase tracking-widest mt-1">
                              HISTORICAL MONOGRAPH ARCHIVE • SECURED RECORD
                            </p>
                            <div className="relative z-10 w-16 h-0.5 bg-[#8B5E3C]/40 my-2" />
                            <p className="relative z-10 font-sans text-[10.5px] leading-relaxed text-stone-800 font-medium max-w-md italic">
                              "{selectedLesson.summary}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Monograph Text paragraphs */}
                      <div className="space-y-4 font-serif text-stone-900 text-xs md:text-sm leading-relaxed text-left font-medium">
                        {selectedLesson.fullText.map((p, pIdx) => (
                          <p key={pIdx}>
                            {pIdx === 0 ? <strong className="text-xl leading-none text-stone-950 font-serif mr-1">“</strong> : null}
                            {p}
                          </p>
                        ))}
                      </div>

                      {/* Golden Key Fact callout */}
                      <div className="p-4 bg-orange-100 border-l-4 border-amber-600 font-sans text-xs text-stone-900 italic leading-relaxed rounded-r-xs">
                        <strong className="block uppercase font-mono text-[9px] text-[#b45308] tracking-widest not-italic font-extrabold mb-1">
                          ⚠️ ACQUIRED HISTORICAL FACT:
                        </strong>
                        "{selectedLesson.keyFact}"
                      </div>

                      {/* Complete button */}
                      <button
                        type="button"
                        id="btn-complete-active-lesson"
                        onClick={() => completeLesson(selectedLesson.id)}
                        className="w-full py-3.5 bg-gradient-to-r from-stone-950 to-stone-900 hover:from-stone-900 hover:to-stone-800 text-saffron font-mono text-xs uppercase font-black tracking-widest border border-[#8B5E3C] shadow-lg transition-all rounded-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mark Lesson as Completed
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* View B: Formations Sandbox */}
            {activeTab === 'formations' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto space-y-6 text-left"
              >
                <div className="p-4 bg-[#20150d] border border-[#8B5E3C]/20 rounded-xs">
                  <h3 className="text-sm font-serif font-bold text-white mb-1 uppercase tracking-wide">
                    ⚔️ Interactive Tactical Formations Sandbox
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Tacticians in 1761 did not just fight randomly; they used complex military geometry. Study the 3 core formations below, examine their battle stats, and understand their natural combat counters.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {FORMATIONS.map((f, fIdx) => (
                    <div 
                      key={fIdx}
                      className="bg-stone-950 border-2 border-stone-900 hover:border-[#8B5E3C]/40 p-5 rounded-xs space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-3xl bg-stone-900 p-2 rounded-sm border border-stone-850">
                          {f.icon}
                        </div>
                        <div className="text-right font-mono text-[9px] text-[#8B5E3C]">
                          <span className="block font-bold">TACTICAL INTEL</span>
                          <span className="text-stone-500 font-medium">FORMATION 0{fIdx + 1}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-base font-serif font-bold text-white uppercase tracking-tight">
                          {f.name}
                        </h4>
                        <span className="text-[10px] font-mono text-saffron block font-medium">Designator: {f.creator}</span>
                      </div>

                      <p className="text-xs text-stone-400 font-sans leading-relaxed">
                        {f.description}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-stone-900">
                        <span className="text-[9px] text-stone-500 uppercase font-mono font-black block">FORMATION STATS</span>
                        <div className="space-y-1.5 text-[10px] font-mono text-stone-300">
                          <div className="flex justify-between items-center">
                            <span>⚔️ Assault Potential:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-stone-900 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500" style={{ width: `${f.stats.attack}%` }} />
                              </div>
                              <strong>{f.stats.attack}%</strong>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>🛡️ Defensive Shielding:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-stone-900 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${f.stats.defense}%` }} />
                              </div>
                              <strong>{f.stats.defense}%</strong>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>🐎 Combat Speed:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-stone-900 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500" style={{ width: `${f.stats.mobility}%` }} />
                              </div>
                              <strong>{f.stats.mobility}%</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 bg-[#211107] p-3 border border-orange-950 rounded-xs text-[10.5px]">
                        <div>
                          <strong className="text-emerald-400 block font-mono text-[9px] uppercase tracking-wider">🌟 Ideal Tactical Counter:</strong>
                          <p className="text-stone-300 font-sans font-medium italic mt-0.5">{f.advantage}</p>
                        </div>
                        <div className="pt-2 border-t border-orange-950/50">
                          <strong className="text-red-400 block font-mono text-[9px] uppercase tracking-wider">⚠️ Fatal Vulnerability:</strong>
                          <p className="text-stone-300 font-sans font-medium italic mt-0.5">{f.vulnerability}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* View C: Scenario Checkpoints */}
            {activeTab === 'decisions' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-6 text-left"
              >
                <div className="p-4 bg-[#20150d] border border-[#8B5E3C]/20 rounded-xs">
                  <h3 className="text-sm font-serif font-bold text-white mb-1 uppercase tracking-wide">
                    ⚖️ Historical Roleplay Scenario Checkpoints
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Read the critical situations below and make your commander decision. Review the actual historical results of each decision path, testing your military instincts.
                  </p>
                </div>

                <div className="space-y-6">
                  {TIME_DECISIONS.map((scenario, sIdx) => {
                    const selectedOptId = selectedDecisionAnswers[scenario.id];
                    const activeOpt = scenario.options.find(o => o.id === selectedOptId);

                    return (
                      <div 
                        key={scenario.id}
                        className="bg-stone-950 border border-stone-850 p-5 md:p-6 rounded-xs space-y-4 shadow-xl"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-[#8B5E3C] font-mono font-black uppercase tracking-widest">
                            CRITICAL CHECKPOINT 0{sIdx + 1}
                          </span>
                          {selectedOptId && (
                            <span className="text-[9px] bg-yellow-950 text-saffron px-2.5 py-0.5 rounded-xs font-mono font-bold uppercase">
                              DECIDED: {activeOpt && activeOpt.scoreImpact > 0 ? "✓ VALID PATHWAY" : "✗ RECOIL"}
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-serif font-bold text-white uppercase tracking-tight">
                          {scenario.title}
                        </h4>

                        <p className="text-xs text-stone-300 leading-relaxed font-sans text-left bg-stone-900/60 p-4 rounded-xs border border-stone-850/40 italic">
                          "{scenario.problem}"
                        </p>

                        <div className="grid grid-cols-1 gap-3.5">
                          {scenario.options.map((option) => {
                            const isThisSelected = selectedOptId === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                id={`btn-scenario-opt-${option.id}`}
                                disabled={selectedOptId !== undefined}
                                onClick={() => selectDecisionOption(scenario.id, option.id, option.scoreImpact)}
                                className={`p-4 text-left border rounded-xs transition-all flex items-center justify-between gap-4 cursor-pointer text-xs ${
                                  selectedOptId === undefined 
                                    ? 'bg-stone-900 border-stone-800 hover:border-saffron hover:bg-[#1a120b]' 
                                    : isThisSelected 
                                      ? option.scoreImpact > 0 
                                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100 font-bold' 
                                        : 'bg-red-950/40 border-red-500 text-red-100'
                                      : 'bg-stone-950 opacity-40 border-transparent'
                                }`}
                              >
                                <span className="font-sans text-left leading-relaxed">{option.text}</span>
                                {selectedOptId === undefined ? (
                                  <ChevronRight size={14} className="text-stone-500 shrink-0" />
                                ) : isThisSelected ? (
                                  <strong className="font-mono text-xs shrink-0">{option.scoreImpact > 0 ? `+${option.scoreImpact} pts` : `${option.scoreImpact} pts`}</strong>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>

                        {selectedOptId && activeOpt && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-[#1f1510] border border-orange-950 rounded-xs space-y-2 mt-4 text-left"
                          >
                            <span className="text-[9px] text-[#A57850] font-mono font-black uppercase tracking-widest block">
                              📜 SCHOLASTIC HISTORICAL RESULT:
                            </span>
                            <p className="text-stone-200 text-xs leading-relaxed font-sans font-medium">
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

            {/* View D: Knowledge Challenge Quiz & Diploma */}
            {activeTab === 'quiz' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto text-left"
              >
                {!quizCompleted ? (
                  <div className="bg-stone-950 border border-stone-850 p-5 md:p-8 rounded-xs space-y-6 shadow-2xl">
                    <div className="border-b border-[#8B5E3C]/20 pb-4 text-center md:text-left">
                      <span className="text-[9px] text-saffron font-mono tracking-widest font-black uppercase block">
                        🏅 ACADEMY EXAM EXAMINER
                      </span>
                      <h3 className="text-xl font-serif text-white uppercase font-black tracking-tight mt-1">
                        Historical Knowledge Challenge
                      </h3>
                      <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-stone-400">
                        <span>QUESTION {currentQuizIdx + 1} OF {QUIZ_QUESTIONS.length}</span>
                        <div className="w-1/2 h-1 bg-stone-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-saffron transition-all" 
                            style={{ width: `${((currentQuizIdx) / QUIZ_QUESTIONS.length) * 100}%` }}
                          />
                        </div>
                        <span>SCORE: {quizScore} pts</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-serif font-bold text-white text-left leading-relaxed">
                        {QUIZ_QUESTIONS[currentQuizIdx].question}
                      </h4>

                      <div className="grid grid-cols-1 gap-3 pt-2">
                        {QUIZ_QUESTIONS[currentQuizIdx].options.map((option, oIdx) => {
                          const isCorrect = oIdx === QUIZ_QUESTIONS[currentQuizIdx].correctIdx;
                          const isSelected = selectedAnswerIdx === oIdx;

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              id={`btn-quiz-opt-${oIdx}`}
                              disabled={hasSubmittedAnswer}
                              onClick={() => setSelectedAnswerIdx(oIdx)}
                              className={`p-3 text-left border rounded-xs text-xs font-mono transition-all cursor-pointer ${
                                !hasSubmittedAnswer
                                  ? isSelected 
                                    ? 'bg-amber-950/40 border-saffron text-white font-bold' 
                                    : 'bg-stone-900 border-stone-850 hover:border-stone-700'
                                  : isSelected
                                    ? isCorrect 
                                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100 font-bold' 
                                      : 'bg-red-950/40 border-red-500 text-red-100'
                                    : isCorrect
                                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-100 font-bold font-medium'
                                      : 'bg-stone-950 opacity-30 border-transparent'
                              }`}
                            >
                              {oIdx + 1}. {option}
                            </button>
                          );
                        })}
                      </div>

                      {/* Submit button / explanation */}
                      {!hasSubmittedAnswer ? (
                        <button
                          type="button"
                          id="btn-quiz-submit"
                          disabled={selectedAnswerIdx === null}
                          onClick={() => {
                            setHasSubmittedAnswer(true);
                            if (selectedAnswerIdx === QUIZ_QUESTIONS[currentQuizIdx].correctIdx) {
                              setQuizScore(prev => prev + 20); // 20 points per question
                            }
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-stone-900 to-stone-950 hover:from-stone-850 hover:to-stone-900 text-saffron uppercase font-mono text-[10px] font-black tracking-widest border border-saffron disabled:opacity-30 rounded-xs cursor-pointer active:scale-95 transition-all text-center"
                        >
                          ✓ Submit Answer
                        </button>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-stone-900/90 border border-stone-850 rounded-xs space-y-3"
                        >
                          <div className="flex items-center gap-1.5">
                            {selectedAnswerIdx === QUIZ_QUESTIONS[currentQuizIdx].correctIdx ? (
                              <span className="text-[10px] text-emerald-400 font-mono font-black uppercase flex items-center gap-1">
                                <CheckCircle2 size={13} /> EXCELLENT CORRECT ANSWER!
                              </span>
                            ) : (
                              <span className="text-[10px] text-red-400 font-mono font-black uppercase flex items-center gap-1">
                                <AlertCircle size={13} /> INCORRECT HISTORICAL RECORD
                              </span>
                            )}
                          </div>
                          
                          <p className="text-stone-300 text-[11px] leading-relaxed font-sans italic">
                            "{QUIZ_QUESTIONS[currentQuizIdx].explanation}"
                          </p>

                          <button
                            type="button"
                            id="btn-quiz-next"
                            onClick={handleNextQuizQuestion}
                            className="w-full py-2 text-stone-950 bg-saffron hover:bg-amber-400 uppercase font-mono text-[10px] font-black tracking-widest transition-colors rounded-xs cursor-pointer text-center"
                          >
                            {currentQuizIdx < QUIZ_QUESTIONS.length - 1 ? "Next Historical Question ▲" : "View Final Scoreboard ▲"}
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Quiz scoreboard completed + Printable Diploma Certificate UI
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-stone-900 border border-stone-850 rounded-xs text-center space-y-3">
                      <h4 className="text-sm font-serif font-bold text-white uppercase tracking-wide">
                        🎓 KNOWLEDGE EXAM RESULTS
                      </h4>
                      <p className="text-xs text-stone-400 leading-relaxed font-sans">
                        You scored <strong className="text-saffron font-bold text-sm mx-1">{quizScore} / 100 points</strong> in our interactive 1761 Hindusthan Chronicles knowledge exam.
                      </p>
                    </div>

                    {/* Highly aesthetic monographic Diploma Card */}
                    <div className="parchment border-[8px] double border-[#8B5E3C] p-6 text-stone-950 text-center space-y-6 relative rounded-sm shadow-2xl">
                      {/* Wax Seal absolute corner graphics */}
                      <div className="absolute top-2 left-2 text-[10px] text-[#8B5E3C]/60 font-mono">PANIPAT • 1761</div>
                      <div className="absolute top-2 right-2 text-[10px] text-[#8B5E3C]/60 font-mono">MILITARY ACADEMY</div>

                      <div className="space-y-1.5 pt-4">
                        <span className="text-[9px] text-[#9a3412] font-mono tracking-widest font-black uppercase block">
                          DECCAN PESHWADOM STATE BOARD OF NORTHERN EXPEDITIONS
                        </span>
                        <h2 className="text-2xl font-serif font-black uppercase text-stone-950 tracking-tight">
                          DIPLOMA OF IMPERIAL EXPERTISE
                        </h2>
                      </div>

                      <div className="w-16 h-0.5 bg-[#8B5E3C] mx-auto opacity-40" />

                      <p className="text-xs font-serif text-stone-800 leading-relaxed italic max-w-md mx-auto">
                        "For outstanding competence in parsing the geopolitical battlements, logistic blockades, and weapons technology of the Third Battle of Panipat."
                      </p>

                      <div className="space-y-1 my-6 bg-[#f0e2d3]/50 py-3 rounded-xs border border-stone-950/5">
                        <span className="text-[7.5px] text-stone-500 uppercase font-mono block">CONFERRED TITLE RANK</span>
                        <span className="text-xs md:text-sm font-serif font-black tracking-widest text-[#9a3412] block">
                          {getDiplomaTitle()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-left text-[9px] font-mono text-stone-600 uppercase border-t border-stone-950/10 pt-4">
                        <div>
                          <span>Instructor Signet:</span>
                          <strong className="block text-stone-900 mt-0.5">IBRAHIM KHAN GARDI</strong>
                          <span className="text-[7.5px] italic text-stone-500">General of Artillery</span>
                        </div>
                        <div className="text-right">
                          <span>Date Examined:</span>
                          <strong className="block text-stone-900 mt-0.5">JUNE 14, 2026</strong>
                          <span className="text-[7.5px] italic text-stone-500">Academic Ledger Stamp</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="btn-quiz-retry"
                      onClick={handleResetQuiz}
                      className="w-full py-3 bg-gradient-to-r from-[#8B5E3C] to-[#724c2f] text-white uppercase font-mono text-[10px] font-bold tracking-widest hover:brightness-110 active:scale-95 transition-all text-center rounded-xs cursor-pointer shadow-md"
                    >
                      🔄 Retake the Knowledge exam
                    </button>
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
