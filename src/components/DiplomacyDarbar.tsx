import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scroll, 
  MessageSquare, 
  Shield, 
  Send, 
  Coins, 
  Flame, 
  Feather, 
  X, 
  HelpCircle, 
  Check, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  Heart,
  Undo
} from 'lucide-react';

interface Message {
  sender: 'player' | 'ruler' | 'system';
  text: string;
  timestamp: string;
}

interface Ruler {
  id: string;
  name: string;
  role: string;
  location: string;
  portrait: string; // Unicode emoji or label
  alliance: 'Neutral' | 'Maratha Ally' | 'Durrani Ally' | 'Suspicious' | 'Hostile';
  initialTrust: number;
  importance: string;
  description: string;
  introduction: string;
}

const HISTORICAL_RULERS: Ruler[] = [
  {
    id: 'shuja',
    name: "Nawab Shuja-Ud-Daula",
    role: "Nawab of Awadh & Vizier designate",
    location: "Sarayu Plains / Awadh Court",
    portrait: "🕌",
    alliance: 'Neutral',
    initialTrust: 45,
    importance: "Highly Critical (Commanding 30,000 elite infantry & river fleets)",
    description: "The wealthy Nawab of Awadh. He holds the absolute balance of military power in the eastern theater. Deserves elite courtly protocol and specific guarantees of sovereign immunity.",
    introduction: "To the Supreme Commander, my courtly salaam. Both the noble Shah Abdali of Kandahar and the Grand Peshwa's court of Pune seek our alliance. My sword lies in the balance. How do you intend to respect the sovereign borders and revenues of Awadh?"
  },
  {
    id: 'surajmal',
    name: "Maharaja Suraj Mal",
    role: "Lohagarh Sovereign & Chief of Jats",
    location: "Bharatpur Territory / Jamuna Forts",
    portrait: "👑",
    alliance: 'Maratha Ally',
    initialTrust: 75,
    importance: "High (Guards the Agra highway & possesses massive granaries)",
    description: "The pragmatic warrior-Socrates of the Jats. He holds absolute mastery over siege construction. He advises the Marathas to abandon their cumbersome bazaar trains and fight a fluid guerrilla warfare.",
    introduction: "Pranams, Commander. I have joined the Grand Coalition column because I believe in defending Hindusthan. Yet, your heavy bronze cannons, baggage train, and camp followers slow our march to a crawl. Will you listen to my tactical advice, or drag the ladies into the mud?"
  },
  {
    id: 'madhosingh',
    name: "Maharaja Madhosingh I",
    role: "Kachwaha Ruler of Jaipur",
    location: "Amber Chambers / Rajputana",
    portrait: "⚔️",
    alliance: 'Neutral',
    initialTrust: 40,
    importance: "Medium (Controls regional mercenaries & trade crossroads)",
    description: "A proud Rajput leader who is weary of the heavy Deccan tax demands (Chauth) previously imposed by Maratha commanders, but detests Najib's foreign Afghan invaders. Needs direct respect and royal gifts.",
    introduction: "The golden canopy of Jaipur is ancient, general, and we are wary of Deccan collectors. Tell me, if we stand together to block Najaf Khan, will the Maratha sirdars finally wipe out our tax arrears and guarantee our royal dynasty?"
  },
  {
    id: 'alha',
    name: "Sardar Alha Singh",
    role: "Chief of the Patiala Phulkian Misl",
    location: "Sirhind Frontier / Patiala Plains",
    portrait: "🌾",
    alliance: 'Suspicious',
    initialTrust: 30,
    importance: "Critical (Direct supply line behind Panipat battlefield)",
    description: "An incredibly resilient Sikh chief who holds the keys to the food reserves in Punjab. If treated as a sovereign ruler and protected from Najib's light horse patrols, he can sneak vital grain into the camp.",
    introduction: "Waheguru Ji Ka Khalsa! Our fields are lush with paddy, but our fortresses are harassed by Rohilla raiders and Durrani scouts. If you guarantee our safety and crown me sovereign of Sirhind, we shall supply your horses with green hay and your barracks with grain."
  },
  {
    id: 'najib',
    name: "Nawab Najib-Ud-Daula",
    role: "Rohilla Afghan Amir & Coalition Architect",
    location: "Ganga-Yamuna Doab / Rohilkhand",
    portrait: "🦅",
    alliance: 'Durrani Ally',
    initialTrust: 15,
    importance: "High (Abdali's chief strategist & logistical mastermind)",
    description: "The shrewd diplomatic genius who brought Abdali into Hindusthan. Although a staunch enemy of the Marathas, clever commanders can write letters to sow discord between him and the Shah, or probe for separate peace.",
    introduction: "A letter sealed in dark candlewax arrives by a night courier: 'Ahmad Shah Abdali's veteran columns have bridged the Yamuna. If you value your Peshwai honors and your Deccan silver, you will pack your tents and return to Pune before our cold winter blocks the river crossings.'"
  }
];

export interface DiplomaticRewards {
  gold: number;
  troops: number;
  provisions: number;
  morale: number;
  text: string;
}

interface DiplomacyDarbarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFaction: 'maratha' | 'durrani';
  onApplyRewards: (rewards: DiplomaticRewards) => void;
}

export const DiplomacyDarbar: React.FC<DiplomacyDarbarProps> = ({
  isOpen,
  onClose,
  activeFaction,
  onApplyRewards
}) => {
  const [selectedRulerId, setSelectedRulerId] = useState<string>('shuja');
  const [trustRatings, setTrustRatings] = useState<{ [rulerId: string]: number }>(() => {
    const saved = localStorage.getItem('panipat_diplomacy_trust');
    if (saved) return JSON.parse(saved);
    
    // Set initial trusts based on local ruler and playing faction adjustments
    const initial: { [key: string]: number } = {};
    HISTORICAL_RULERS.forEach(r => {
      let t = r.initialTrust;
      if (activeFaction === 'durrani') {
        if (r.id === 'najib') t = 90;
        else if (r.id === 'surajmal') t = 20;
        else if (r.id === 'shuja') t = 50;
      }
      initial[r.id] = t;
    });
    return initial;
  });

  const [chatHistories, setChatHistories] = useState<{ [rulerId: string]: Message[] }>(() => {
    const saved = localStorage.getItem('panipat_diplomacy_chats');
    if (saved) return JSON.parse(saved);

    const initial: { [key: string]: Message[] } = {};
    HISTORICAL_RULERS.forEach(r => {
      initial[r.id] = [
        {
          sender: 'system',
          text: `You convened a diplomatic correspondence with ${r.name}, the ${r.role}.`,
          timestamp: '11:00 AM'
        },
        {
          sender: 'ruler',
          text: r.introduction,
          timestamp: '11:05 AM'
        }
      ];
    });
    return initial;
  });

  const [customLetter, setCustomLetter] = useState<string>('');
  const [claimedRewards, setClaimedRewards] = useState<{ [rulerId: string]: boolean }>(() => {
    const saved = localStorage.getItem('panipat_diplomacy_rewards');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeTab, setActiveTab] = useState<'chat' | 'bios'>('chat');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('panipat_diplomacy_trust', JSON.stringify(trustRatings));
  }, [trustRatings]);

  useEffect(() => {
    localStorage.setItem('panipat_diplomacy_chats', JSON.stringify(chatHistories));
  }, [chatHistories]);

  useEffect(() => {
    localStorage.setItem('panipat_diplomacy_rewards', JSON.stringify(claimedRewards));
  }, [claimedRewards]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistories, selectedRulerId]);

  const ruler = HISTORICAL_RULERS.find(r => r.id === selectedRulerId) || HISTORICAL_RULERS[0];
  const trust = trustRatings[ruler.id];

  const getRelationLevel = (t: number) => {
    if (t >= 80) return { label: 'ALLIED / BROTHER', color: 'text-emerald-400 font-extrabold border-emerald-500/30 bg-emerald-950/20' };
    if (t >= 60) return { label: 'FAVORABLE', color: 'text-green-500 font-black border-green-900/20 bg-green-950/10' };
    if (t >= 40) return { label: 'NEUTRAL / OBSERVANT', color: 'text-stone-400 border-stone-800 bg-stone-900/30' };
    if (t >= 25) return { label: 'SUSPICIOUS / WARY', color: 'text-amber-500 border-amber-900/20 bg-amber-950/10' };
    return { label: 'HOSTILE / INTRIGUING', color: 'text-red-500 border-red-900/30 bg-red-950/20' };
  };

  const currentRelation = getRelationLevel(trust);

  // Triggered when submitting a dialogue preset option
  const handleSelectOption = (optionText: string, rulerReply: string, trustModifier: number) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add player option
    const updatedChats = { ...chatHistories };
    updatedChats[ruler.id] = [
      ...updatedChats[ruler.id],
      { sender: 'player', text: optionText, timestamp: time }
    ];
    setChatHistories(updatedChats);

    // Simulate ruler typing
    setTimeout(() => {
      const updatedRulerTrust = Math.min(100, Math.max(0, trust + trustModifier));
      setTrustRatings(prev => ({ ...prev, [ruler.id]: updatedRulerTrust }));

      const systemNote = trustModifier > 0 
        ? `Scribe Note: Trust with ${ruler.name} increased by +${trustModifier}.` 
        : trustModifier < 0 
          ? `Scribe Note: Trust with ${ruler.name} decreased by ${trustModifier}.`
          : `Scribe Note: Trust remains stable.`;

      updatedChats[ruler.id] = [
        ...updatedChats[ruler.id],
        { sender: 'ruler', text: rulerReply, timestamp: time },
        { sender: 'system', text: systemNote, timestamp: time }
      ];
      setChatHistories({ ...updatedChats });
    }, 1000);
  };

  // Triggered when the player types a custom letter
  const handleSendCustomLetter = () => {
    if (!customLetter.trim()) return;
    const playerMsg = customLetter.trim();
    setCustomLetter('');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedChats = { ...chatHistories };
    updatedChats[ruler.id] = [
      ...updatedChats[ruler.id],
      { sender: 'player', text: playerMsg, timestamp: time }
    ];
    setChatHistories(updatedChats);

    // Dynamic semantic keyword parsing engine
    setTimeout(() => {
      const textLower = playerMsg.toLowerCase();
      let response = "";
      let trustChange = 0;

      if (ruler.id === 'shuja') {
        if (textLower.includes('gold') || textLower.includes('mouhr') || textLower.includes('tribute') || textLower.includes('treasury')) {
          response = `"Your offers of silver are enticing, commander. But we have golden crowns of our own. Siding with Pune must guarantee the safety of Lucknow. Our primary concern is the Maratha garrison stationed in Delhi."`;
          trustChange = 8;
        } else if (textLower.includes('allian') || textLower.includes('friend') || textLower.includes('brother') || textLower.includes('treaty')) {
          response = `"A treaty signed on paper is like dry reeds without trust. Write to us about secure frontiers. If your Hussar cavalry stops taxing neighboring towns, my advisors will look favorably on a treaty."`;
          trustChange = 5;
        } else if (textLower.includes('afghan') || textLower.includes('abdali') || textLower.includes('durrani')) {
          response = `"Ahmad Shah Abdali is a mountain of steel. He speaks of blood ties and holy obligation. We must tread carefully, for if the Maratha line breaks, we are left at the mercy of the Durrani swords."`;
          trustChange = 2;
        } else if (textLower.includes('tax') || textLower.includes('taxation') || textLower.includes('arrears') || textLower.includes('chauth')) {
          response = `"You speak of tax waivers? That is indeed a major sore point between Pune and Awadh! Guarantee we are immune to the Deccan chauth and our royal cavalry will ride in your rear flank."`;
          trustChange = 12;
        } else {
          response = `"Your envoy brings elegant prose, master. I will lay your thoughts before my courtly council of Siyars. Let us continue to maintain this mutual pipeline of communications."`;
          trustChange = 3;
        }
      } else if (ruler.id === 'surajmal') {
        if (textLower.includes('guerrilla') || textLower.includes('light') || textLower.includes('strategy') || textLower.includes('scout') || textLower.includes('women') || textLower.includes('follower')) {
          response = `"Aah! You speak with the wisdom of a seasoned general! Leaving the heavy luxury tents of the court behind and relying on swift raids is the only way to crack Abdali. You have won my profound military respect."`;
          trustChange = 15;
        } else if (textLower.includes('gold') || textLower.includes('money') || textLower.includes('treasury')) {
          response = `"Lohagarh's vaults are not empty, but we also do not squander gold on stubborn commanders. Prove your tactical humility, and Bharatpur's granaries will throw open their gates to your marching supply columns."`;
          trustChange = 5;
        } else if (textLower.includes('demand') || textLower.includes('order') || textLower.includes('threat')) {
          response = `"Do not threaten the Jat clan in our own lands, commander. Balanced coordinates are our guard. Respect us, and we respect you. Cross us, and we will safely retreat into our iron fortresses."`;
          trustChange = -15;
        } else {
          response = `"Your lines are sensible. In this war of giants, the peasant, the scout, and the horse must operate in harmony. Let us maintain high alert."`;
          trustChange = 4;
        }
      } else if (ruler.id === 'madhosingh') {
        if (textLower.includes('gold') || textLower.includes('gift') || textLower.includes('jewel') || textLower.includes('tribute') || textLower.includes('chauth')) {
          response = `"Jaipur appreciates your royal tribute. It goes some way to erasing the bad memories of Deccan tax collectors raiding Amber gates. Let us talk further of cooperative defenses."`;
          trustChange = 12;
        } else if (textLower.includes('afghan') || textLower.includes('abdali') || textLower.includes('foreigner') || textLower.includes('invad')) {
          response = `"True. The Durrani Shah comes with merciless tribal raiders. Our shrines and populations must be shielded from foreign sackings. We Rajput clans cannot tolerate the desolation of northern temples."`;
          trustChange = 8;
        } else {
          response = `"The Kachwaha house values honor above gold. We hear your words, and our envoys will keep watch. If you secure Delhi, Jaipur will mobilize the camel archer lines."`;
          trustChange = 2;
        }
      } else if (ruler.id === 'alha') {
        if (textLower.includes('food') || textLower.includes('grain') || textLower.includes('grain supply') || textLower.includes('starve') || textLower.includes('feed') || textLower.includes('provisions')) {
          response = `"We can manage a caravan of 10,000 grain bags. But Najib's scouts dominate Kunjpura. If you march your cannons to clear the northern Yamuna banks, we will send the cart-drivers under the shield of darkness!"`;
          trustChange = 15;
        } else if (textLower.includes('protection') || textLower.includes('safety') || textLower.includes('scout') || textLower.includes('secure')) {
          response = `"Yes! We need heavy guard teams for our Sirhind outposts. Send us protection against the Rohilla raiders, and the Phulkian misl will stand as your loyal northern shield."`;
          trustChange = 10;
        } else {
          response = `"We are a simple, brave farming clan. Your royal letters are highly flowery, but we need grain bags and gun shields. Action is what earns trust on the Sirhind frontier."`;
          trustChange = 3;
        }
      } else if (ruler.id === 'najib') {
        if (textLower.includes('distrust') || textLower.includes('split') || textLower.includes('double') || textLower.includes('apart') || textLower.includes('abdali')) {
          response = `"Hahaha! You try to sow doubts between Najib and the majestic Shah of Kandahar? We Afghan tribes are bound by the blood oaths of the Indus. Your cheap intrigues cannot snap our iron chain... though you write with fine penmanship."`;
          trustChange = 5; // Acknowledge cunning intrigue
        } else if (textLower.includes('gold') || textLower.includes('bribe') || textLower.includes('silver')) {
          response = `"You think of buying the mastermind of Rohilkhand with coin? It is our swords that will carve out the share of Delhi's imperial revenues. Keep your gold to pay your mutinous mercenaries!"`;
          trustChange = -10;
        } else {
          response = `"Save your letters, general. The destiny of the Doab is already set. The Deccan forces belong in the south. The cold northern winds belong to the heavy horse."`;
          trustChange = -5;
        }
      }

      const updatedRulerTrust = Math.min(100, Math.max(0, trust + trustChange));
      setTrustRatings(prev => ({ ...prev, [ruler.id]: updatedRulerTrust }));

      const systemNote = trustChange > 0 
        ? `Scribe Note: Trust with ${ruler.name} increased by +${trustChange}.` 
        : trustChange < 0 
          ? `Scribe Note: Trust with ${ruler.name} decreased by ${trustChange}.`
          : `Scribe Note: Letters delivered successfully.`;

      updatedChats[ruler.id] = [
        ...updatedChats[ruler.id],
        { sender: 'ruler', text: response, timestamp: time },
        { sender: 'system', text: systemNote, timestamp: time }
      ];
      setChatHistories({ ...updatedChats });
    }, 1200);
  };

  // Pre-authored contextual branches for the current ruler based on Faction
  const getDialogueOptions = () => {
    if (activeFaction === 'maratha') {
      switch (ruler.id) {
        case 'shuja':
          return [
            {
              option: "Offer permanent tax exemption on Awadh territory",
              reply: "That is indeed a major royal gesture! With Lucknow free from Deccan tribute demands, my courtly factions are highly satisfied. I shall ensure my main river flotillas remain neutral.",
              modifier: 15
            },
            {
              option: "Propose an elite joint protectorate over the Delhi Crown",
              reply: "An interesting proposal, General Bhau. A shared crown protects our eastern flank. But you must first prove your strength at Kunjpura before my troops march with you.",
              modifier: 10
            },
            {
              option: "Remind them of Najib's secret letters claiming Awadh's wealth",
              reply: "Najib's hunger for power is known to us! If he intends to direct Durrani horsemen to Lucknow, he is severely mistaken. We will start quietly withdrawing our veteran outposts from his campsite.",
              modifier: 12
            }
          ];
        case 'surajmal':
          return [
            {
              option: "Listen to his tactical counsel: leaving heavy baggage at Kunjpura",
              reply: "A sensible decree! Fast horses win wars. With our baggage train stabilized and secured in defensive outposts, our mobile speed is doubled. My riders stand fully behind your flank!",
              modifier: 20
            },
            {
              option: "Ask for grain supplies from the Agra granaries",
              reply: "Granted! Food is the fuel of valor. 5,000 carriage carts loaded with wheat flour and millet are dispatched to your encampments. Eat well, soldiers!",
              modifier: 10
            },
            {
              option: "Insist on his absolute obedience to deccani command",
              reply: "Your Deccan arrogance will be your ruin! We are allies, not servants. If you treat our royal Jats with disrespect, do not expect us to shield your retreat when the battle turns bloody.",
              modifier: -18
            }
          ];
        case 'madhosingh':
          return [
            {
              option: "Send royal jewels and offer immediate Jaipur border guarantees",
              reply: "We accept the beautiful tokens of Shaniwar Wada. High respect has been restored! The Rajputana chiefs shall refuse any recruitment requests from Najib-ud-Daula.",
              modifier: 15
            },
            {
              option: "Urge him to send Rajput Camel archers to reinforce our light division",
              reply: "Our Camel divisions are ready, but we cannot detail them to march so far north while the Doab is unsafe. Show us your military supremacy at Delhi first.",
              modifier: 5
            }
          ];
        case 'alha':
          return [
            {
              option: "Offer state security treaties and gold coins to support Sirhind defenses",
              reply: "This gold is highly helpful! We shall purchase extra shields and horse-shoes. In return, our scouts will feed you direct warnings of Durrani nocturnal crossings.",
              modifier: 18
            },
            {
              option: "Demand immediate free food deliveries without guarantees",
              reply: "And who are you to demand our crops? We have survived Najib, we have survived Lahore raids, and we shall survive your threats! No free grain leaves Patiala under intimidation.",
              modifier: -15
            }
          ];
        case 'najib':
          return [
            {
              option: "Offer separate peace: ceding Lahore revenues for neutrality",
              reply: "You offer Lahore which is under the boots of our cousin, the Shah? A laughable deal! We Rohillas will take our share by the muzzle of our flintlocks.",
              modifier: -10
            },
            {
              option: "Send a fabricated letter from the Shah expressing intent to enslave Doab chiefs",
              reply: "Wait... does the Shah speak of my family in this manner? This letter appears written by a scribe of Amber... yet there is a deep seed of truth. I must inspect Abdali's correspondence directly.",
              modifier: 15
            }
          ];
        default:
          return [];
      }
    } else {
      // Durrani Side Option Branches
      switch (ruler.id) {
        case 'najib':
          return [
            {
              option: "Request urgent mobilizations of Rohilla heavy cavalry",
              reply: "Instantly, Shah! 15,050 expert spearhead horsemen are armed and moving to block Kunjpura. We shall secure your supply river-crossings with our lives.",
              modifier: 10
            },
            {
              option: "Direct him to construct grain storage units in the Doab campaign line",
              reply: "Our grain reserves are now consolidated. The entire central theater is supplied. The starving Marathas will soon find only dry dust inside Delhi.",
              modifier: 15
            }
          ];
        case 'shuja':
          return [
            {
              option: "Propose anti-infliction treaties invoking regional solidarity",
              reply: "The Durrani coalition represents a pious wall. Awadh accepts the call to defend our northern frontiers. 12,000 matchlock infantry will join your vanguardcamp.",
              modifier: 18
            },
            {
              option: "Demand direct gold war contributions for the Ghazis",
              reply: "You demand Lucknow's treasures as tribute? We are coalition partners, not conquered subjects! Watch your language or we might reopen letters to Bhau.",
              modifier: -12
            }
          ];
        case 'surajmal':
          return [
            {
              option: "Offer to respect Lohagarh's independent borders in return for neutrality",
              reply: "A logical stance. If the Afghan forces promise to bypass the Agra highway and spare our temples, the Jat clan will withhold its cavalry from the Maratha vanguard.",
              modifier: 15
            }
          ];
        default:
          return [
            {
              option: "Offer future land leases in Sirhind in exchange for non-intervention",
              reply: "Your terms are interesting. If we receive sovereign seals for Sirhind, we will keep our trade lines closed to Maratha suppliers.",
              modifier: 12
            }
          ];
      }
    }
  };

  // Rewards description based on selected ruler reaching 75+ trust
  const getRulerRewardDescription = (rid: string) => {
    switch (rid) {
      case 'shuja':
        return {
          gold: 80000,
          troops: 8000,
          provisions: 120,
          morale: 15,
          text: `Nawab Shuja-ud-Daula provides financial subsidies (+80,000 gold) and auxiliary forces (+8,000 matchlock guards).`
        };
      case 'surajmal':
        return {
          gold: 40000,
          troops: 5000,
          provisions: 250,
          morale: 20,
          text: `Maharaja Suraj Mal throws open the Jat granaries (+250 provisions) and details heavy engineers (+5,000 siege troops).`
        };
      case 'madhosingh':
        return {
          gold: 60000,
          troops: 4000,
          provisions: 80,
          morale: 10,
          text: `Maharaja Madhosingh details elite Kachwaha Camel Archery lines (+4,000 cavalry) and gifts gold casket chests (+60,000 gold).`
        };
      case 'alha':
        return {
          gold: 15000,
          troops: 3000,
          provisions: 350,
          morale: 25,
          text: `Sardar Alha Singh slips food supply wagons through secret reeds (+350 provisions) and boosts soldier morale (+25% Morale).`
        };
      case 'najib':
        return {
          gold: 120000,
          troops: 15000,
          provisions: 150,
          morale: 15,
          text: `Nawab Najib-ud-Daula unlocks the massive Rohilla military reserves (+120,000 Mohurs and +15,000 expert light riders).`
        };
      default:
        return { gold: 0, troops: 0, provisions: 0, morale: 0, text: "" };
    }
  };

  const handleClaimReward = (rid: string) => {
    if (claimedRewards[rid] || trustRatings[rid] < 75) return;
    
    const reward = getRulerRewardDescription(rid);
    onApplyRewards(reward);

    setClaimedRewards(prev => ({ ...prev, [rid]: true }));

    // Append system message
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedChats = { ...chatHistories };
    updatedChats[rid] = [
      ...updatedChats[rid],
      {
        sender: 'system',
        text: `DIPLOMATIC TREATY SEALED! Claimed Reward: ${reward.text}`,
        timestamp: time
      }
    ];
    setChatHistories(updatedChats);
  };

  const handleResetDiplomacy = () => {
    if (window.confirm("Do you wish to rebuild the diplomatic trust and clear prior chat correspondence?")) {
      localStorage.removeItem('panipat_diplomacy_trust');
      localStorage.removeItem('panipat_diplomacy_chats');
      localStorage.removeItem('panipat_diplomacy_rewards');
      
      const initialTrust: { [key: string]: number } = {};
      const initialChats: { [key: string]: Message[] } = {};
      
      HISTORICAL_RULERS.forEach(r => {
        let t = r.initialTrust;
        if (activeFaction === 'durrani') {
          if (r.id === 'najib') t = 90;
          else if (r.id === 'surajmal') t = 20;
          else if (r.id === 'shuja') t = 50;
        }
        initialTrust[r.id] = t;
        initialChats[r.id] = [
          {
            sender: 'system',
            text: `You convened a diplomatic correspondence with ${r.name}, the ${r.role}.`,
            timestamp: '11:00 AM'
          },
          {
            sender: 'ruler',
            text: r.introduction,
            timestamp: '11:05 AM'
          }
        ];
      });

      setTrustRatings(initialTrust);
      setChatHistories(initialChats);
      setClaimedRewards({});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 md:p-6 text-stone-100 font-sans select-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-6xl h-[92vh] bg-[#14100e] border-4 border-[#8B5E3C] shadow-3xl bronze-bevel relative flex flex-col pointer-events-auto"
      >
        {/* Header Bar */}
        <div className="p-4 border-b border-[#8B5E3C]/30 bg-stone-950/70 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-saffron/15 border border-saffron flex items-center justify-center shadow-inner">
              <Scroll className="text-saffron" size={20} />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl text-saffron uppercase font-black tracking-widest flex items-center gap-2">
                <span>Royal Diplomatic Darbar</span>
                <span className="text-[9px] font-mono border border-emerald-500/30 text-emerald-500 bg-emerald-950/30 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Interactive Pact System</span>
              </h2>
              <p className="text-[10px] text-stone-400 font-serif lowercase italic mt-0.5">
                "with sweet letters and deep treasuries, empires are swayed before the cannons spark"
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDiplomacy}
              title="Reset All Diplomatic Trusts"
              className="p-1 px-2.5 bg-stone-900 border border-stone-800 hover:border-red-800/50 text-stone-500 hover:text-red-400 transition-all rounded-xs text-[9px] font-mono flex items-center gap-1.5 uppercase cursor-pointer"
            >
              <Undo size={10} /> Reset Darbar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-stone-900 border border-[#8B5E3C]/40 hover:border-saffron text-stone-400 hover:text-saffron transition-all rounded-xs cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Outer Split Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: List of Rulers */}
          <div className="w-full md:w-80 border-r border-[#8B5E3C]/20 bg-stone-900/10 flex flex-col overflow-y-auto">
            <div className="p-3 bg-stone-950/40 border-b border-[#8B5E3C]/10 text-left text-[9px] font-black uppercase tracking-widest text-[#8B5E3C]">
              Regional Sovereigns (1761 Coalition)
            </div>
            
            <div className="p-2 space-y-1.5 flex-1">
              {HISTORICAL_RULERS.map(r => {
                const tr = trustRatings[r.id];
                const rel = getRelationLevel(tr);
                const isSelected = r.id === selectedRulerId;
                const recClaimed = claimedRewards[r.id];
                const canClaim = tr >= 75 && !recClaimed;

                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRulerId(r.id)}
                    className={`w-full p-3 text-left relative transition-all rounded-xs border flex items-start gap-3 cursor-pointer
                      ${isSelected 
                        ? 'bg-[#1e1713] border-saffron shadow-[inset_0_0_10px_rgba(255,153,51,0.12)]' 
                        : 'bg-stone-950/40 border-stone-900 hover:bg-stone-900/60 hover:border-stone-850'
                      }
                    `}
                  >
                    {/* Left Icon Avatar */}
                    <div className="text-2xl mt-0.5 p-1 bg-stone-900 rounded-sm border border-[#8B5E3C]/10 select-none">
                      {r.portrait}
                    </div>

                    {/* Middle info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-serif text-[11px] font-extrabold text-stone-100 uppercase truncate leading-tight">{r.name}</h4>
                        {canClaim && (
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                        )}
                      </div>
                      <p className="text-[9px] text-[#8B5E3C] truncate font-sans font-bold uppercase tracking-wider">{r.role}</p>
                      
                      {/* Relations HUD */}
                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                        <span className={`text-[8px] uppercase tracking-wider font-bold`}>
                          Trust: <span className="text-white font-extrabold">{tr}%</span>
                        </span>
                        <span className={`text-[8px] uppercase tracking-wider font-bold shrink-0 ${tr >= 60 ? 'text-emerald-400' : tr >= 40 ? 'text-stone-400' : 'text-[#8b5e3c]'}`}>
                          {tr >= 85 ? 'ALLIED' : tr >= 60 ? 'FRIENDLY' : tr >= 40 ? 'OBSERVANT' : tr >= 25 ? 'SUSPICIOUS' : 'HOSTILE'}
                        </span>
                      </div>

                      {/* Micro Progress Bar of Trust */}
                      <div className="w-full bg-stone-950 h-1 rounded-full mt-1.5 overflow-hidden border border-stone-900">
                        <div 
                          className={`h-full transition-all duration-500
                            ${tr >= 75 ? 'bg-emerald-500' : tr >= 50 ? 'bg-yellow-500' : 'bg-red-500'}
                          `}
                          style={{ width: `${tr}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Faction Stance Card */}
            <div className="p-3 border-t border-[#8B5E3C]/10 bg-stone-950/60 text-left">
              <div className="text-[9px] uppercase font-mono text-stone-500 font-extrabold tracking-wide">Playing Active Campaign Faction:</div>
              <div className="flex items-center gap-1.5 mt-1 font-serif text-xs font-black uppercase text-saffron">
                <span className="text-sm">{activeFaction === 'maratha' ? '🍊' : '👑'}</span>
                <span>{activeFaction === 'maratha' ? 'Maratha Confederacy' : 'Durrani Empire'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Chat Panel */}
          <div className="flex-1 flex flex-col bg-[#0e0c0a] relative select-text">
            
            {/* Tab Swappers */}
            <div className="flex border-b border-[#8B5E3C]/20 bg-stone-950/30">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest font-serif transition-colors cursor-pointer
                  ${activeTab === 'chat' ? 'bg-[#14100e] text-saffron border-b-2 border-saffron' : 'text-stone-400 hover:bg-stone-900/30 hover:text-stone-200'}
                `}
              >
                📜 Diplomatic Scroll Chat
              </button>
              <button 
                onClick={() => setActiveTab('bios')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest font-serif transition-colors cursor-pointer
                  ${activeTab === 'bios' ? 'bg-[#14100e] text-saffron border-b-2 border-saffron' : 'text-stone-400 hover:bg-stone-900/30 hover:text-stone-200'}
                `}
              >
                🏰 Ruler Bio & Secrets
              </button>
            </div>

            {activeTab === 'chat' ? (
              <>
                {/* Active Ruler Banner info */}
                <div className="p-3 bg-stone-950/75 border-b border-[#8B5E3C]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-left">
                  <div>
                    <h3 className="font-serif text-sm text-saffron font-bold uppercase tracking-wide flex items-center gap-1.5">
                      <span>{ruler.name}</span>
                      <span className={`text-[8px] font-mono px-2 py-0.5 border rounded-xs uppercase ${currentRelation.color}`}>
                        {currentRelation.label}
                      </span>
                    </h3>
                    <p className="text-[10px] text-stone-400 font-sans tracking-wide mt-0.5">{ruler.role} • <span className="text-stone-500 font-bold uppercase">{ruler.location}</span></p>
                  </div>

                  {/* Trust Reward Activator */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 bg-stone-900/30 border border-[#8B5E3C]/20 p-1.5 px-3 rounded-xs">
                    <div className="text-left select-none">
                      <span className="text-[8px] text-stone-400 uppercase font-mono block font-black leading-none mb-1">Covenant Reward:</span>
                      <span className="text-[9px] text-[#8B5E3C] leading-none uppercase block font-semibold">Unlocked at 75% Trust</span>
                    </div>

                    {claimedRewards[ruler.id] ? (
                      <div className="py-1 px-2.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-sm font-serif font-black text-[9px] tracking-wider uppercase flex items-center gap-1">
                        <CheckCircle size={10} /> Sealed
                      </div>
                    ) : trust >= 75 ? (
                      <button
                        onClick={() => handleClaimReward(ruler.id)}
                        className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-stone-950 rounded-sm font-serif font-black text-[9px] tracking-wider uppercase flex items-center gap-1 cursor-pointer transition-transform hover:scale-[1.04]"
                      >
                        <Coins size={10} /> Seal Pact
                      </button>
                    ) : (
                      <div className="py-1 px-3 bg-stone-950/60 border border-stone-850 text-stone-600 rounded-sm font-serif font-black text-[9px] tracking-wider uppercase">
                        Unconfirmed
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Message Scroll Window */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-900/20 via-black to-black">
                  
                  {chatHistories[ruler.id]?.map((msg, idx) => (
                    <AnimatePresence key={idx}>
                      {msg.sender === 'system' ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mx-auto max-w-[85%] text-center p-2 rounded-xs border border-stone-800/60 bg-stone-950/40 font-mono text-[9px] text-stone-500 uppercase tracking-widest leading-relaxed flex items-center justify-center gap-1.5"
                        >
                          <Feather size={10} className="text-[#8b5e3c]" />
                          <span>{msg.text}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, x: msg.sender === 'player' ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'player' ? 'ml-auto flex-row-reverse text-right' : 'text-left'}`}
                        >
                          {/* Avatar icon */}
                          <div className="w-7 h-7 rounded-full bg-stone-950 border border-[#8B5E3C]/20 flex items-center justify-center text-sm shrink-0 shadow-lg select-none">
                            {msg.sender === 'player' ? '🍊' : ruler.portrait}
                          </div>

                          <div className={`space-y-1`}>
                            {/* Message Bubble container */}
                            <div className={`p-3 md:p-3.5 border font-sans text-xs shadow-xl leading-relaxed
                              ${msg.sender === 'player' 
                                ? 'parchment text-stone-950 border-[#8B5E3C] rounded-l-md rounded-tr-md font-medium shadow-[0_4px_15px_rgba(255,153,51,0.06)]' 
                                : 'bg-stone-900/90 text-stone-100 border-[#8B5E3C]/20 rounded-r-md rounded-tl-md'
                              }
                            `}>
                              <p className={msg.sender === 'player' ? 'font-serif text-[11px] font-bold' : 'font-serif text-[11px] text-stone-105 font-light italic'}>
                                {msg.text}
                              </p>
                            </div>
                            
                            {/* Timestamp indicator */}
                            <span className="text-[8px] text-stone-600 block px-1 uppercase font-mono font-bold tracking-wider">
                              {msg.sender === 'player' ? 'Huzurat Council' : ruler.name} • {msg.timestamp}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                  
                  <div ref={chatEndRef} />
                </div>

                {/* Preauthored Branch options triggers */}
                <div className="p-3 bg-stone-950/45 border-t border-[#8B5E3C]/20 text-left">
                  <div className="text-[9px] uppercase font-mono tracking-widest text-stone-500 font-black mb-2 select-none">
                    Select Context-Specific Court Proposal:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {getDialogueOptions().map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectOption(opt.option, opt.reply, opt.modifier)}
                        className="p-2 border border-stone-900 bg-stone-950/80 hover:bg-[#1f1712] hover:border-[#8B5E3C]/35 text-[10px] text-stone-300 hover:text-saffron font-serif font-black uppercase text-left rounded-sm transition-all duration-150 cursor-pointer flex justify-between items-center gap-2"
                      >
                        <span className="truncate flex-1">{opt.option}</span>
                        <span className={`text-[8px] font-mono shrink-0 px-1 py-0.5 rounded-sm uppercase tracking-tight
                          ${opt.modifier > 0 ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-950' : opt.modifier < 0 ? 'bg-red-950/40 text-red-400 border border-red-950' : 'bg-stone-900 text-stone-500'}
                        `}>
                          {opt.modifier > 0 ? `+${opt.modifier}` : opt.modifier === 0 ? '0' : opt.modifier} Trust
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scribe Letter Composer - Custom messages draft box */}
                <div className="p-3.5 bg-stone-950 border-t border-[#8B5E3C]/20 flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={customLetter}
                      onChange={(e) => setCustomLetter(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendCustomLetter();
                      }}
                      placeholder={`Draft a secure courtly despatch to ${ruler.name}... (e.g. mention "gold", "protection", "supplies", "treaty")`}
                      className="w-full h-11 pl-4 pr-10 bg-stone-900 border border-[#8B5E3C]/30 focus:border-saffron text-stone-200 text-xs rounded-sm focus:outline-none placeholder-stone-600 font-serif"
                    />
                    <div className="absolute right-3.5 top-3.5 pointer-events-none select-none" title="Scribe Seals">
                      <Feather size={13} className="text-[#8b5e3c]" />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSendCustomLetter}
                    className="h-11 px-5 bg-saffron hover:bg-[#db7d29] text-stone-950 font-serif font-black uppercase text-[10px] tracking-widest rounded-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Send size={11} />
                    <span>Send Letter</span>
                  </button>
                </div>
              </>
            ) : (
              /* RULERS BIOGRAPHIES & SECRETS SECURE CARD */
              <div className="flex-1 p-5 md:p-8 overflow-y-auto space-y-6 text-left parchment text-stone-950">
                <div className="border-b border-[#8B5E3C]/30 pb-3 flex items-start gap-4">
                  <div className="text-4xl p-2 bg-stone-200 border border-[#8B5E3C]/20 rounded-md select-none">{ruler.portrait}</div>
                  <div>
                    <h3 className="font-serif text-lg font-black uppercase tracking-wider text-amber-950">{ruler.name}</h3>
                    <p className="text-stone-700 font-sans text-xs font-semibold uppercase">{ruler.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-serif">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#8b5e3c] mb-1">Historical Core Background</h4>
                      <p className="text-xs text-stone-800 leading-relaxed font-sans font-medium">{ruler.description}</p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#8b5e3c] mb-1">Strategic Importance in 1761</h4>
                      <p className="text-xs text-stone-800 leading-relaxed font-sans font-medium">{ruler.importance}</p>
                    </div>

                    <div className="p-3.5 bg-stone-200/50 border border-[#8B5E3C]/20 rounded-xs">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-900 mb-1 flex items-center gap-1.5">
                        <AlertTriangle size={12} />
                        <span>Tactical Secret / Weakness</span>
                      </h4>
                      <p className="text-xs text-stone-800 font-sans italic font-semibold leading-normal mt-0.5">
                        {ruler.id === 'shuja' && `"Highly anxious about losing Awadh's wealthy revenue ports. Under no circumstance will Shuja accept a Maratha tax collector inside Awadh frontier."`}
                        {ruler.id === 'surajmal' && `"Irritated by professional arrogance. Releasing baggage followers and acknowledging his strategic guerrilla methods sweeps away his irritation instantly."`}
                        {ruler.id === 'madhosingh' && `"Cares about dynastic stature. Gifting ancient valuables or paying outstanding tribute arrears earns immediate alliance concessions."`}
                        {ruler.id === 'alha' && `"Deeply fears Rohilla raids on Patiala crops. Offering armed protection details locks in Alha Singh's food smuggling pipelines."`}
                        {ruler.id === 'najib' && `"A staunch pan-Afghan fundamentalist. Will only waver if provided forged proofs suggesting Ahmad Shah Abdali intents to dethrone regional Doab leaders."`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-l border-[#8b5e3c]/20 pl-0 md:pl-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#8b5e3c] mb-1">Expected Covenant Reward Details:</h4>
                    
                    <div className="bg-stone-100 p-4 border border-[#8B5E3C]/30 rounded-sm space-y-4 shadow-sm">
                      <div className="flex justify-between border-b border-[#8b5e3c]/10 pb-1.5 font-mono text-xs text-stone-800">
                        <span>Gold Subsidies:</span>
                        <span className="text-yellow-700 font-bold">+{getRulerRewardDescription(ruler.id).gold.toLocaleString()} Mohurs</span>
                      </div>
                      <div className="flex justify-between border-b border-[#8b5e3c]/10 pb-1.5 font-mono text-xs text-stone-800">
                        <span>Troops Reinforcement:</span>
                        <span className="text-cyan-800 font-bold">+{getRulerRewardDescription(ruler.id).troops.toLocaleString()} Infantry warriors</span>
                      </div>
                      <div className="flex justify-between border-b border-[#8b5e3c]/10 pb-1.5 font-mono text-xs text-stone-800">
                        <span>Food / Grain Supplies:</span>
                        <span className="text-emerald-700 font-bold">+{getRulerRewardDescription(ruler.id).provisions} Tons of wheat</span>
                      </div>
                      <div className="flex justify-between border-b border-[#8b5e3c]/10 pb-1.5 font-mono text-xs text-stone-800">
                        <span>Confederacy Morale Boost:</span>
                        <span className="text-orange-700 font-bold">+{getRulerRewardDescription(ruler.id).morale}% Command Focus</span>
                      </div>

                      <div className="pt-2 text-[11px] text-stone-605 italic leading-relaxed text-left">
                        <strong>Treaty Reward Effect:</strong> "{getRulerRewardDescription(ruler.id).text}"
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/5 border border-amber-950/20 text-stone-805 text-xs rounded-sm">
                      <strong>How to unlock:</strong> Elevate trust levels to <strong>75% or higher</strong> through strategic courtly proposals or typing custom despatches that hit their specific desires. Once unlocked, click'Seal Pact' in the message tab to draw immediate rewards.
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </motion.div>
    </div>
  );
};
