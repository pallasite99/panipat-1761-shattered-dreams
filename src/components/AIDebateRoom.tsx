import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Coins, HelpCircle, RefreshCw, Send, ShieldCheck, Sparkles, User } from 'lucide-react';
import { CampaignStage } from '../types';
import { GoogleGenAI } from '@google/genai';
import { FallbackImage } from './FallbackImage';

import avatarSurajMal from '../assets/images/maharaja_suraj_mal_1780981012497.png';
import avatarShujaUdDaula from '../assets/images/nawab_shuja_ud_daula_1780981037889.png';
import avatarMarathaTreasurer from '../assets/images/maratha_treasurer_raghunathrao_1780981073863.png';
import avatarMalharraoHolkar from '../assets/images/malharrao_holkar_1780981055883.png';

type SpeakerId = 'bhau' | 'holkar' | 'gardi' | 'raghunathrao' | 'surajmal' | 'shuja';

interface DebateOption {
  generalName: string;
  avatarKey: SpeakerId;
  choiceLabel: string;
  effectsSummary: string;
  effects: {
    gold: number;
    morale: number;
    provisions: number;
  };
}

interface DebateMessage {
  id: string;
  role: 'narrator' | 'speaker' | 'user';
  speaker?: string;
  stance?: string;
  avatarUrl?: string;
  content: string;
}

interface DebateReply {
  reply: string;
  stance: string;
  question: string;
}

interface StageBlueprint {
  topic: string;
  intro: string;
  opening: {
    speaker: SpeakerId;
    stance: string;
    speech: string;
  };
  cycle: SpeakerId[];
  options: DebateOption[];
}

const SPEAKERS: Record<SpeakerId, { name: string; avatarUrl?: string; color: string }> = {
  bhau: { name: 'Sadashivrao Bhau', color: 'text-amber-500' },
  holkar: { name: 'Malharrao Holkar', avatarUrl: avatarMalharraoHolkar, color: 'text-saffron' },
  gardi: { name: 'Ibrahim Khan Gardi', color: 'text-emerald-400' },
  raghunathrao: { name: 'Raghunathrao', avatarUrl: avatarMarathaTreasurer, color: 'text-purple-400' },
  surajmal: { name: 'Maharaja Suraj Mal', avatarUrl: avatarSurajMal, color: 'text-orange-400' },
  shuja: { name: 'Shuja-ud-Daula', avatarUrl: avatarShujaUdDaula, color: 'text-cyan-400' },
};

const STAGE_BLUEPRINTS: Record<CampaignStage, StageBlueprint> = {
  [CampaignStage.NIZAM_CAMPAIGN]: {
    topic: 'Campaign Strategy Against the Nizam',
    intro: 'The court gathers over the first serious test of the march southward.',
    opening: {
      speaker: 'bhau',
      stance: 'Defensive Fortification',
      speech: 'We should fix the camp, harden the wagons, and force the enemy to spend blood against our earthworks before we move again.'
    },
    cycle: ['bhau', 'holkar', 'gardi'],
    options: [
      {
        generalName: 'Ibrahim Khan Gardi',
        avatarKey: 'gardi',
        choiceLabel: 'Deploy a disciplined artillery line',
        effectsSummary: '+25% artillery precision, -15,000 gold',
        effects: { gold: -15000, morale: 15, provisions: -20 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Press a light cavalry screen',
        effectsSummary: '+15 morale, +10 speed, -10 provisions',
        effects: { gold: -5000, morale: 20, provisions: -10 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Dig entrenchments and hold firm',
        effectsSummary: '+80 provisions, stronger defense',
        effects: { gold: -8000, morale: 5, provisions: 80 }
      }
    ]
  },
  [CampaignStage.PUNE]: {
    topic: 'Dynastic Funding at Shaniwar Wada',
    intro: 'Pune demands a decision between court loyalty and battlefield necessity.',
    opening: {
      speaker: 'raghunathrao',
      stance: 'Treasury Control',
      speech: 'Without a harder grip on the ledger, the march will starve before it reaches the north. We need gold now, not promises.'
    },
    cycle: ['raghunathrao', 'holkar', 'bhau'],
    options: [
      {
        generalName: 'Raghunathrao',
        avatarKey: 'raghunathrao',
        choiceLabel: 'Squeeze the northern revenue',
        effectsSummary: '+50,000 gold, weaker trust',
        effects: { gold: 50000, morale: -5, provisions: -30 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Negotiate soft loans',
        effectsSummary: '+20,000 gold, +10 morale',
        effects: { gold: 20000, morale: 10, provisions: 20 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Conscript the treasure chests',
        effectsSummary: '+35,000 gold, strict command',
        effects: { gold: 35000, morale: 15, provisions: 0 }
      }
    ]
  },
  [CampaignStage.BURHANPUR]: {
    topic: 'Supply Crossing at Burhanpur',
    intro: 'The camp stares at the river crossing and the burden of its own supply chain.',
    opening: {
      speaker: 'gardi',
      stance: 'Carriage Security',
      speech: 'If the powder chests are not sealed and moved with discipline, the artillery becomes dead iron before the river is even crossed.'
    },
    cycle: ['bhau', 'holkar', 'gardi'],
    options: [
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Build ferries and cross slowly',
        effectsSummary: '-12,000 gold, safer logistics',
        effects: { gold: -12000, morale: 10, provisions: 60 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Force a shallow ford tonight',
        effectsSummary: '+10 speed, -15 provisions',
        effects: { gold: 0, morale: 15, provisions: -15 }
      },
      {
        generalName: 'Ibrahim Khan Gardi',
        avatarKey: 'gardi',
        choiceLabel: 'Waterproof the powder trains',
        effectsSummary: '+15% artillery durability',
        effects: { gold: -5000, morale: 5, provisions: 10 }
      }
    ]
  },
  [CampaignStage.GWALIOR]: {
    topic: 'Vanguard Recruitment at Gwalior',
    intro: 'The council weighs speed, recruitment, and the cost of delay.',
    opening: {
      speaker: 'holkar',
      stance: 'Mobile Skirmish',
      speech: 'We should move light, recruit locally, and keep the enemy guessing rather than drag our whole supply train across the plain.'
    },
    cycle: ['raghunathrao', 'holkar', 'bhau'],
    options: [
      {
        generalName: 'Raghunathrao',
        avatarKey: 'raghunathrao',
        choiceLabel: 'Hire Bundela mercenaries',
        effectsSummary: '+15% infantry power, -20,000 gold',
        effects: { gold: -20000, morale: 10, provisions: -10 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Wait for Deccan levies',
        effectsSummary: '+20 morale, -15 provisions',
        effects: { gold: -5000, morale: 20, provisions: -15 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Conscript baggage guards',
        effectsSummary: '-8,000 gold, improved supply defense',
        effects: { gold: -8000, morale: 5, provisions: 40 }
      }
    ]
  },
  [CampaignStage.DELHI_NEGOTIATIONS]: {
    topic: 'Negotiations with Awadh',
    intro: 'A treaty may save the flank, but it will also expose the cost of compromise.',
    opening: {
      speaker: 'shuja',
      stance: 'Conditional Neutrality',
      speech: 'If Delhi is to be kept quiet, the court must hear what Awadh needs, not only what it wants to demand.'
    },
    cycle: ['raghunathrao', 'surajmal', 'bhau'],
    options: [
      {
        generalName: 'Shuja-ud-Daula',
        avatarKey: 'shuja',
        choiceLabel: 'Promise Delhi governorship',
        effectsSummary: '+35 trust, -15 morale',
        effects: { gold: -10000, morale: -15, provisions: 10 }
      },
      {
        generalName: 'Maharaja Suraj Mal',
        avatarKey: 'surajmal',
        choiceLabel: 'Offer marriage and trade',
        effectsSummary: '+20 trust, +15,000 gold',
        effects: { gold: 15000, morale: 10, provisions: 20 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Issue a military ultimatum',
        effectsSummary: '-40 trust, +25 morale',
        effects: { gold: 0, morale: 25, provisions: -10 }
      }
    ]
  },
  [CampaignStage.SHINDE_STAND]: {
    topic: 'Reinforcing Kunjpura',
    intro: 'The council argues over whether to reinforce the line or draw the enemy out.',
    opening: {
      speaker: 'bhau',
      stance: 'Immediate Relief',
      speech: 'If Kunjpura falls, the road is lost. Send men at once, and we will not give Abdali the river ford for free.'
    },
    cycle: ['bhau', 'holkar', 'gardi'],
    options: [
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Reinforce Kunjpura',
        effectsSummary: '+20% fort defense',
        effects: { gold: -12000, morale: 15, provisions: -20 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Use a fighting retreat',
        effectsSummary: '+15% cavalry damage',
        effects: { gold: 0, morale: 10, provisions: 15 }
      },
      {
        generalName: 'Ibrahim Khan Gardi',
        avatarKey: 'gardi',
        choiceLabel: 'Build artillery redoubts',
        effectsSummary: '+25% crossfire damage',
        effects: { gold: -8000, morale: 5, provisions: 10 }
      }
    ]
  },
  [CampaignStage.DELHI_BATTLE]: {
    topic: 'The Red Fort Question',
    intro: 'Victory has become a test of restraint, not only force.',
    opening: {
      speaker: 'raghunathrao',
      stance: 'War Treasury',
      speech: 'The treasury is dry, the men are unpaid, and Delhi is full of wealth. The council must decide whether honor can pay a soldier.'
    },
    cycle: ['raghunathrao', 'bhau', 'holkar'],
    options: [
      {
        generalName: 'Raghunathrao',
        avatarKey: 'raghunathrao',
        choiceLabel: 'Melt the silver roof',
        effectsSummary: '+60,000 gold, sacrilege cost',
        effects: { gold: 60000, morale: 15, provisions: -30 }
      },
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Protect royal assets',
        effectsSummary: '+15 trust, steadier politics',
        effects: { gold: 20000, morale: 5, provisions: 20 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Confiscate rebel estates',
        effectsSummary: '+45,000 gold, +10 morale',
        effects: { gold: 45000, morale: 10, provisions: -10 }
      }
    ]
  },
  [CampaignStage.PANIPAT]: {
    topic: 'The Final Debate at Panipat',
    intro: 'Starvation has reduced every plan to a test of nerve.',
    opening: {
      speaker: 'gardi',
      stance: 'Hollow Square Defense',
      speech: 'The army is cut off, the horses are weak, and the only path left is the one that keeps the line together until the very last breath.'
    },
    cycle: ['bhau', 'holkar', 'gardi'],
    options: [
      {
        generalName: 'Sadashivrao Bhau',
        avatarKey: 'bhau',
        choiceLabel: 'Hold the line to the end',
        effectsSummary: '+10% fortification, -25 provisions',
        effects: { gold: 0, morale: -10, provisions: -25 }
      },
      {
        generalName: 'Malharrao Holkar',
        avatarKey: 'holkar',
        choiceLabel: 'Attempt a breakout',
        effectsSummary: '+20% speed, +15 morale',
        effects: { gold: -15000, morale: 15, provisions: 10 }
      },
      {
        generalName: 'Ibrahim Khan Gardi',
        avatarKey: 'gardi',
        choiceLabel: 'Lead an artillery shield',
        effectsSummary: '+35% cannon precision',
        effects: { gold: -10000, morale: 20, provisions: -10 }
      }
    ]
  }
};

const stripJsonFence = (text: string) => text.replace(/```json/gi, '').replace(/```/g, '').trim();

const fallbackReply = (blueprint: StageBlueprint, speakerId: SpeakerId, userText: string): DebateReply => {
  const speaker = SPEAKERS[speakerId];
  const excerpt = userText.trim().replace(/\s+/g, ' ').slice(0, 120) || 'your counsel';
  return {
    reply: `${speaker.name} weighs your words on "${excerpt}" and answers with a hard historical turn: ${blueprint.topic.toLowerCase()} demands a sharper choice, not hesitation.`,
    stance: blueprint.options.find((option) => option.avatarKey === speakerId)?.choiceLabel || 'Strategic Counsel',
    question: `How do you answer ${speaker.name}?`
  };
};

export const AIDebateRoom: React.FC<{
  campaignStage: CampaignStage;
  treasuryMohurs: number;
  setTreasuryMohurs: React.Dispatch<React.SetStateAction<number>>;
  morale: number;
  setMorale: React.Dispatch<React.SetStateAction<number>>;
  provisions: number;
  setProvisions: React.Dispatch<React.SetStateAction<number>>;
}> = ({ campaignStage, treasuryMohurs, setTreasuryMohurs, morale, setMorale, provisions, setProvisions }) => {
  const blueprint = STAGE_BLUEPRINTS[campaignStage];
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [turnCount, setTurnCount] = useState(0);
  const [choiceMade, setChoiceMade] = useState(false);
  const [selectedGeneral, setSelectedGeneral] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const canResolve = turnCount >= 1;

  const seedSession = async () => {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      setApiStatus('failed');
      setMessages([
        { id: `narr-${Date.now()}`, role: 'narrator', content: blueprint.intro },
        {
          id: `open-${Date.now()}`,
          role: 'speaker',
          speaker: SPEAKERS[blueprint.opening.speaker].name,
          stance: blueprint.opening.stance,
          avatarUrl: SPEAKERS[blueprint.opening.speaker].avatarUrl,
          content: blueprint.opening.speech,
        },
      ]);
      setTurnCount(0);
      return;
    }

    try {
      setLoading(true);
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are writing the opening of an interactive historical council debate for Panipat: 1761.
Stage: ${campaignStage}
Topic: ${blueprint.topic}
Intro: ${blueprint.intro}
Opening speaker: ${SPEAKERS[blueprint.opening.speaker].name} (${blueprint.opening.stance})
Write valid JSON only:
{
  "intro": "One sentence framing the chamber.",
  "opening": "A persuasive in-character opening speech.",
  "question": "A short question inviting the player to answer."
}
No markdown.`;

      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const parsed = JSON.parse(stripJsonFence(response.text || '')) as Partial<{ intro: string; opening: string }>;

      setMessages([
        { id: `narr-${Date.now()}`, role: 'narrator', content: parsed.intro || blueprint.intro },
        {
          id: `open-${Date.now()}`,
          role: 'speaker',
          speaker: SPEAKERS[blueprint.opening.speaker].name,
          stance: blueprint.opening.stance,
          avatarUrl: SPEAKERS[blueprint.opening.speaker].avatarUrl,
          content: parsed.opening || blueprint.opening.speech,
        },
      ]);
      setApiStatus('success');
      setTurnCount(0);
    } catch (error) {
      console.error('Opening debate generation error:', error);
      setApiStatus('failed');
      setMessages([
        { id: `narr-${Date.now()}`, role: 'narrator', content: blueprint.intro },
        {
          id: `open-${Date.now()}`,
          role: 'speaker',
          speaker: SPEAKERS[blueprint.opening.speaker].name,
          stance: blueprint.opening.stance,
          avatarUrl: SPEAKERS[blueprint.opening.speaker].avatarUrl,
          content: blueprint.opening.speech,
        },
      ]);
      setTurnCount(0);
    } finally {
      setLoading(false);
    }
  };

  const requestReply = async (userText: string): Promise<DebateReply> => {
    const nextSpeakerId = blueprint.cycle[(turnCount + 1) % blueprint.cycle.length];
    const nextSpeaker = SPEAKERS[nextSpeakerId];
    const history = messages
      .slice(-6)
      .map((message) => `${message.role.toUpperCase()}: ${message.speaker ? `${message.speaker} - ` : ''}${message.content}`)
      .join('\n');

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return fallbackReply(blueprint, nextSpeakerId, userText);
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Continue this historical council debate for Panipat: 1761.
Stage: ${campaignStage}
Topic: ${blueprint.topic}
Next speaker: ${nextSpeaker.name}
History:
${history}
Player response:
"${userText}"

Return valid JSON only:
{
  "reply": "One paragraph in-character reply.",
  "stance": "Short strategic stance label",
  "question": "A short follow-up question"
}
No markdown.`;

      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const parsed = JSON.parse(stripJsonFence(response.text || '')) as Partial<DebateReply>;

      if (!parsed.reply) {
        return fallbackReply(blueprint, nextSpeakerId, userText);
      }

      return {
        reply: parsed.reply,
        stance: parsed.stance || nextSpeaker.name,
        question: parsed.question || `How do you answer ${nextSpeaker.name}?`,
      };
    } catch (error) {
      console.error('Debate reply generation error:', error);
      setApiStatus('failed');
      return fallbackReply(blueprint, nextSpeakerId, userText);
    }
  };

  useEffect(() => {
    setChoiceMade(false);
    setSelectedGeneral(null);
    setDraft('');
    setTurnCount(0);
    void seedSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignStage]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmitReply = async () => {
    const text = draft.trim();
    if (!text || loading || choiceMade) return;

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', speaker: 'You', content: text },
    ]);
    setDraft('');

    try {
      const reply = await requestReply(text);
      const nextSpeakerId = blueprint.cycle[(turnCount + 1) % blueprint.cycle.length];
      const nextSpeaker = SPEAKERS[nextSpeakerId];
      setMessages((prev) => [
        ...prev,
        {
          id: `speaker-${Date.now()}`,
          role: 'speaker',
          speaker: nextSpeaker.name,
          stance: reply.stance,
          avatarUrl: nextSpeaker.avatarUrl,
          content: reply.reply,
        },
      ]);
      setTurnCount((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: DebateOption) => {
    if (choiceMade) return;
    setChoiceMade(true);
    setSelectedGeneral(option.generalName);
    setTreasuryMohurs((prev) => Math.max(0, prev + option.effects.gold));
    setMorale((prev) => Math.min(100, Math.max(0, prev + option.effects.morale)));
    setProvisions((prev) => Math.max(0, prev + option.effects.provisions));
  };

  const handleResetDebate = () => {
    setChoiceMade(false);
    setSelectedGeneral(null);
    setDraft('');
    setTurnCount(0);
    void seedSession();
  };

  return (
    <div className="bg-stone-900 border border-stone-850 p-4 md:p-6 rounded-sm text-left shadow-2xl relative">
      <div className="flex flex-col gap-4 border-b border-stone-800 pb-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-serif text-base text-saffron uppercase tracking-widest font-black flex items-center gap-2">
              <Sparkles size={18} className="text-saffron animate-pulse" /> War Council Debate Room
            </h3>
            <p className="text-[10px] text-stone-500 font-mono mt-0.5">AI-guided dialogue with required player input</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetDebate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-950 hover:bg-stone-800 text-stone-200 font-mono text-[9px] font-black uppercase tracking-wider rounded-sm transition-all border border-stone-800 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Restart Debate
            </button>
            <div className="px-3 py-2 rounded-sm border border-stone-800 bg-stone-950/70 text-[9px] font-mono uppercase tracking-widest">
              {apiStatus === 'success' ? (
                <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck size={12} /> AI online</span>
              ) : apiStatus === 'failed' ? (
                <span className="text-amber-400 flex items-center gap-1"><AlertCircle size={12} /> Fallback mode</span>
              ) : (
                <span className="text-stone-500 flex items-center gap-1"><Sparkles size={12} /> Seeding</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-400 font-mono">
          <div className="bg-stone-950/60 border border-stone-850 rounded-sm p-3">
            <div className="text-saffron font-bold uppercase tracking-wider mb-1">Stage</div>
            <div className="font-serif text-stone-200 font-black">{campaignStage.replace(/_/g, ' ')}</div>
          </div>
          <div className="bg-stone-950/60 border border-stone-850 rounded-sm p-3">
            <div className="text-saffron font-bold uppercase tracking-wider mb-1">Council Topic</div>
            <div className="font-serif text-stone-200 font-black">{blueprint.topic}</div>
          </div>
          <div className="bg-stone-950/60 border border-stone-850 rounded-sm p-3">
            <div className="text-saffron font-bold uppercase tracking-wider mb-1">Turn Count</div>
            <div className="font-serif text-stone-200 font-black">{turnCount} player reply{turnCount === 1 ? '' : 'ies'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-[#e9dcc4] text-stone-900 border-2 border-[#b09e7c] rounded-md p-4 md:p-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.15)] relative overflow-hidden font-serif min-h-[420px] flex flex-col">
            <div className="text-center text-[11px] font-mono uppercase tracking-[0.2em] text-[#5c4a24] font-black border-b border-[#d4c8ab] pb-2 mb-4">
              DEBATE LOG
            </div>

            <div ref={logRef} className="flex-1 overflow-y-auto pr-1 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role !== 'user' && (
                    <div className="w-11 h-11 rounded-full border-2 border-[#b4a076] bg-[#fdfaf2] flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                      {message.avatarUrl ? (
                        <FallbackImage
                          src={message.avatarUrl}
                          fallbackSrc="/avatar-placeholder.svg"
                          alt={message.speaker || 'Speaker'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles size={18} className="text-[#b4a076]" />
                      )}
                    </div>
                  )}

                  <div className={`max-w-[82%] rounded-lg border p-3 shadow-sm ${message.role === 'user' ? 'bg-stone-950 text-stone-100 border-stone-700' : message.role === 'narrator' ? 'bg-stone-100 text-stone-700 border-stone-300 italic' : 'bg-[#fdf8ec] text-stone-900 border-[#d7c7a8]'}`}>
                    <div className="flex items-center justify-between gap-3 mb-2 text-[9px] uppercase tracking-widest font-mono">
                      <span className={message.role === 'user' ? 'text-stone-400' : 'text-[#8b5e3c]'}>
                        {message.role === 'user' ? 'You' : message.role === 'narrator' ? 'Court Herald' : message.speaker}
                      </span>
                      {message.stance && message.role === 'speaker' && (
                        <span className="px-1.5 py-0.5 rounded-sm border border-[#c5b898] bg-[#ded0b1] text-[#6d5b35]">
                          {message.stance}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${message.role === 'narrator' ? 'font-serif italic' : 'font-serif'}`}>
                      {message.content}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-11 h-11 rounded-full border-2 border-stone-700 bg-stone-950 flex items-center justify-center shrink-0 shadow-md text-stone-200">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-11 h-11 rounded-full border-2 border-[#b4a076] bg-[#fdfaf2] flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                    <Sparkles size={18} className="text-[#8b5e3c] animate-pulse" />
                  </div>
                  <div className="max-w-[82%] rounded-lg border p-3 bg-[#fdf8ec] text-stone-900 border-[#d7c7a8]">
                    <p className="text-sm font-serif italic">The council considers your words...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#d4c8ab]">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5c4a24] font-black mb-2">
                Your response
              </label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Speak your counsel to the court..."
                className="w-full min-h-[110px] resize-y bg-[#f8f0dd] border border-[#cbb88c] rounded-sm p-3 text-sm font-serif text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-saffron/40"
                disabled={loading || choiceMade}
              />
              <div className="flex items-center justify-between gap-3 mt-3">
                <p className="text-[10px] text-[#6d5b35] font-mono">
                  {choiceMade
                    ? 'Council sealed. The final directive has already been chosen.'
                    : 'A reply is required before the council advances.'}
                </p>
                <button
                  onClick={handleSubmitReply}
                  disabled={loading || choiceMade || !draft.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B5E3C] hover:bg-[#724c2f] text-white font-serif text-xs uppercase tracking-widest rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                  {loading ? 'Sending' : 'Submit Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-stone-950/70 border border-stone-800 rounded-sm p-4">
            <h4 className="font-serif text-xs text-stone-200 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
              <HelpCircle size={14} className="text-saffron" /> Council State
            </h4>
            <div className="space-y-2 text-[10px] font-mono text-stone-400">
              <div className="flex justify-between gap-3"><span>Gold</span><span className="text-saffron font-bold">{treasuryMohurs.toLocaleString()}</span></div>
              <div className="flex justify-between gap-3"><span>Morale</span><span className="text-orange-400 font-bold">{morale}%</span></div>
              <div className="flex justify-between gap-3"><span>Provisions</span><span className="text-blue-400 font-bold">{provisions}</span></div>
              <div className="flex justify-between gap-3"><span>Required Input</span><span className="text-emerald-400 font-bold">{draft.trim() ? 'Ready' : 'Pending'}</span></div>
            </div>
          </div>

          <div className="bg-stone-950/70 border border-stone-800 rounded-sm p-4">
            <h4 className="font-serif text-xs text-stone-200 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
              <Coins size={14} className="text-saffron" /> Resolution Stances
            </h4>
            {!canResolve ? (
              <p className="text-xs text-stone-500 leading-relaxed">
                Send at least one reply to unlock the final command choices.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {blueprint.options.map((option) => {
                  const isSelected = selectedGeneral === option.generalName;
                  return (
                    <button
                      key={option.generalName}
                      onClick={() => handleSelectOption(option)}
                      disabled={choiceMade}
                      className={`text-left p-3 rounded-sm border transition-all flex flex-col justify-between min-h-[112px] ${choiceMade ? (isSelected ? 'border-saffron bg-saffron/10 text-white' : 'border-stone-850 bg-stone-950/40 opacity-40 text-stone-500') : 'border-stone-800 bg-stone-950/80 hover:border-saffron hover:bg-stone-900 cursor-pointer hover:shadow-lg active:scale-95'}`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-mono text-saffron uppercase font-black">{option.generalName}</span>
                          {isSelected && <span className="text-[8px] font-mono bg-saffron text-black px-1.5 py-0.5 rounded-sm font-bold">Chosen</span>}
                        </div>
                        <div className="font-serif text-xs font-bold text-stone-200 leading-normal">
                          {option.choiceLabel}
                        </div>
                      </div>
                      <div className="border-t border-stone-850 mt-2.5 pt-2 flex justify-between items-center text-[9px] font-mono gap-2">
                        <span className="text-stone-500">Effects</span>
                        <span className="text-stone-300 font-bold text-right">{option.effectsSummary}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {choiceMade && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 border border-saffron/30 bg-saffron/5 text-stone-300 rounded-sm text-xs text-center font-sans leading-relaxed"
              >
                <strong>Debate resolved:</strong> the chosen stance has been ratified and campaign resources have been updated.
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
