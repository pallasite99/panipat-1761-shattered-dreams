export interface Lesson {
  id: string;
  title: string;
  duration: string;
  level: 'Student' | 'Scholar';
  summary: string;
  fullText: string[];
  illustrationUrl: string;
  keyFact: string;
}

export interface TacticalUnit {
  id: string;
  name: string;
  faction: 'Maratha' | 'Afghan' | 'Neutral';
  type: 'Artillery' | 'Cavalry' | 'Infantry';
  icon: string;
  description: string;
  assault: number;
  defense: number;
  speed: number;
  advantage: string;
  vulnerability: string;
}

export interface ScenarioOption {
  id: string;
  text: string;
  historicalResult: string;
  scoreImpact: number;
  alignment: 'Maratha' | 'Afghan' | 'Neutral';
}

export interface Scenario {
  id: string;
  title: string;
  bgUrl: string;
  problem: string;
  options: ScenarioOption[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export interface DocumentArchive {
  id: string;
  title: string;
  source: string;
  translator: string;
  excerpt: string;
  fullMaterial: string;
  context: string;
}

// 1. Core Progressive Syllabus (10 Lessons)
export const LESSONS: Lesson[] = [
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
  {
    id: 's4',
    title: 'Mawala Jungle Combat Tactics',
    duration: '5 mins',
    level: 'Student',
    summary: 'Learn how light cavalry and infantry used India\'s natural hills, forests, and winding rivers to ambush large armies.',
    keyFact: 'Mawala units traveled light; carrying only parched flatbread and water, they could track enemy scout movements invisibly without horses!',
    illustrationUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "Mawala soldiers were mountain warriors from the Western Ghats (Sahyadri hills) of Maharashtra. They were legendary for their physical power, incredible stamina, and ability to climb steep cliffs under cover of night.",
      "Instead of charging in tight columns on open fields, Mawalas fought using guerrilla style tactics known as 'Ganimi Kava'. They blended into high forests, using deep ravines and dense foliage to circle behind giant enemy columns.",
      "They understood how to block mountain passes and trigger landslides. When fighting the Mughal or foreign armored warriors, Mawalas would wait for the hot midday sun or pouring rain to make the ground unusable for heavy horses, before descending with unmatched agility.",
      "Their weapons were light: a compact iron vest, cane shields, light bamboo bows, and the flexible 'Dandpatta' sword that could spin in circles to repel multiple attackers at once."
    ]
  },
  {
    id: 's5',
    title: 'Flags of Iron and Saffron',
    duration: '5 mins',
    level: 'Student',
    summary: 'Discover the symbols, colors, and battle-songs that kept desperate soldiers marching together under freezing winters.',
    keyFact: 'Standard-bearer elephants were the most targeted beasts in battle; if their royal flag collapsed, the entire army assumed defeat!',
    illustrationUrl: 'https://images.unsplash.com/photo-1590766244534-7389814407ce?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "In the eighteenth century, armies didn't have radios or satellite systems. To communicate across kilometers of dust and smoke, commanders used giant brass kettledrums, trumpet blasts, and immense colored banners.",
      "The Marathas fought under the 'Bhagwa Dhwaj'—the split-tail sacred orange/saffron flag symbolizing detachment, bravery, and righteous defense. Its presence at the center of the camp signified the personal command of the Peshwa's house.",
      "The Afghan Durrani coalition carried the green and silver flags of Islamic authority and regional Pashtun sovereignty, coupled with dynamic tribal standard banners.",
      "In the ultimate confusion of combat, soldiers kept their eyes locked on the standard-bearer elephants. These armored giants carried the massive flags high above the dust. If a standard-bearer elephant went down or fled, it often triggered immediately a panic retreat, as troops assumed their core commanders had been lost."
    ]
  },

  // Scholar Path Lessons
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
  },
  {
    id: 'c4',
    title: 'The Imperial Debt Ledger & Taxation Stresses',
    duration: '8 mins',
    level: 'Scholar',
    summary: 'Dive deep into double-entry accounting, state promissory notes (Hundis), and the heavy financial deficit of the Deccan forces.',
    keyFact: 'Sadashivrao Bhau was a brilliant civil tax treasurer who calculated that a single day\'s delay at Panipat bankrupted the state of 30,000 mohurs in interest alone.',
    illustrationUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "Sadashivrao Bhau was not merely a military commander; he was the head civil auditor of the Peshwa's state secretariat (Daftar) in Pune. His correspondence before the campaign contains dozens of tedious balance sheets measuring debt, land taxation revenues (Chauth), and troop pay arrears.",
      "To fund the northern march, Bhau relied heavily on 'Hundis'—sophisticated, credit promissory notes backed by wealthy bankers (Shroffs) of Pune, Gwalior, and Delhi. If the army was delayed, interest rates skyrocketed, and credit evaporated.",
      "As the blockade tightened, local merchants refused to accept Hundis, demanding instant payment in gold Mohurs or silver Rupees. The Maratha camp went bankrupt. Bhau was forced to melt down royal silver utensils, ancestral jewelry, and decorative temple domes to coin emergency tokens.",
      "This lesson exposes how the lack of a centralized, secure cash flow and reliance on volatile credit networks crippled the military initiative. An army that spends more time negotiating with hostile bankers than studying battle formations is defeated before firing a single bullet."
    ]
  },
  {
    id: 'c5',
    title: 'Shadows of Empire: Post-1761 Fallouts',
    duration: '9 mins',
    level: 'Scholar',
    summary: 'Trace how the mutual destruction of Maratha central authority and Durrani\'s financial exhaustion paved a direct red carpet for the British East India Company.',
    keyFact: 'Within less than five years of Panipat, the British secured the Diwani (tax extraction rights) of Bengal, utilizing the exact vacuum created by the battlefield losses of western forces.',
    illustrationUrl: 'https://images.unsplash.com/photo-1599507591144-667bb4024846?q=80&w=800&auto=format&fit=crop',
    fullText: [
      "The Third Battle of Panipat was a Pyrrhic outcome. While Ahmad Shah Durrani won a tactical masterpiece on January 14, his victory was a strategic disaster. His mutinous troop regiments demanded instant return to Kandahar to escape the severe cold, carrying no spoils of war.",
      "The Maratha Empire lost its entire senior warrior elite—Sadashivrao Bhau, the Peshwa's young heir Vishwasrao, Ibrahim Khan Gardi, and dozens of great chieftains. However, the administrative base of Pune survived and reconstructed under Peshwa Madhavrao I within a decade.",
      "The true, unforeseen victor of Panipat sat far away in Calcutta. The absolute destruction of Maratha hegemony in the north and the financial exhaustion of Delhi left a dramatic political and military vacuum.",
      "Sensing this vulnerability, the British East India Company moved rapidly. Defeating Shuja-ud-Daulah (who had exhausted his army supporting Abdali) and the Mughal Emperor at the Battle of Buxar in 1764, the British acquired the formal revenue-extracting Diwani of Bengal, initiating their transition to undisputed masters of South Asia."
    ]
  }
];

// 2. Playbook Units for the Interactive Sandbox Game
export const SANDBOX_UNITS: TacticalUnit[] = [
  {
    id: 'gardi',
    name: 'Gardi French artillery',
    faction: 'Maratha',
    type: 'Artillery',
    icon: '🛡️',
    description: 'European trained line infantry with heavy brass battery support.',
    assault: 85,
    defense: 95,
    speed: 20,
    advantage: 'Repels heavy front cavalry charges; exceptional long range fire.',
    vulnerability: 'Exposed flanks; very slow repositioning rate.'
  },
  {
    id: 'mawala',
    name: 'Mawala Raiders',
    faction: 'Maratha',
    type: 'Cavalry',
    icon: '🐎',
    description: 'Highly agile Deccan light cavalry trained for guerrilla encirclement.',
    assault: 80,
    defense: 50,
    speed: 90,
    advantage: 'Exceptional in forest ambush and supply raid harassment.',
    vulnerability: 'Weak against organized musket volleys and static spears.'
  },
  {
    id: 'zamburak',
    name: 'Camel Zamburaks',
    faction: 'Afghan',
    type: 'Artillery',
    icon: '🐫',
    description: 'Swivel guns mounted on kneeling desert baggage camels.',
    assault: 75,
    defense: 45,
    speed: 80,
    advantage: 'Extremely dynamic mobile artillery that relocates mid combat.',
    vulnerability: 'Thin armor; vulnerable to heavy concentrated battery counters.'
  },
  {
    id: 'rohilla',
    name: 'Rohilla Heavy Brigade',
    faction: 'Afghan',
    type: 'Infantry',
    icon: '⚔️',
    description: 'Ferocious, armored hand-to-hand swordsmen from the Rohilkhand hills.',
    assault: 90,
    defense: 75,
    speed: 40,
    advantage: 'Lethal in melee trenches; immune to dust storm penalties.',
    vulnerability: 'Exposed to grape shot barrages in wide plains.'
  }
];

// 3. 5 Operational Decision Chronicles (Scenarios)
export const TIME_DECISIONS: Scenario[] = [
  {
    id: 'rec1',
    title: 'The Crossing of the Yamuna River (October 1760)',
    bgUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=400',
    problem: 'The Yamuna River is flooded and treacherous. Ahmad Shah Durrani’s scouts have reported that all deep water bridges and shallow fords are closely guarded. How should the Maratha leadership approach this major obstacle?',
    options: [
      {
        id: 'opt1_1',
        text: 'Wait for the floodwaters to fully recede to guarantee safe crossing for heavy logistics baggage.',
        historicalResult: 'ERRONEOUS. This gave Ahmad Shah Durrani critical weeks to seal alliances with major kings in northern India, leaving the Marathas isolated.',
        scoreImpact: -15,
        alignment: 'Maratha'
      },
      {
        id: 'opt1_2',
        text: 'Launch an elite, swift vanguard night-crossing at an unguarded deep-water ford, sending cavalry swimmers first.',
        historicalResult: 'HISTORICAL DECISION. This bold move surprised the enemy, initially securing the strategic road to Delhi, though at a cost of brave riders.',
        scoreImpact: 25,
        alignment: 'Maratha'
      },
      {
        id: 'opt1_3',
        text: 'Offer high financial gold peace terms to local zamindars to build custom pontoon boats under fire.',
        historicalResult: 'INEFFECTIVE. High corruption among regional chiefs depleted treasury reserves without securing stable crossings.',
        scoreImpact: -5,
        alignment: 'Neutral'
      }
    ]
  },
  {
    id: 'rec2',
    title: 'The Great Siege Dilemma: Famine or Fire?',
    bgUrl: 'https://images.unsplash.com/photo-1599507591144-667bb4024846?q=80&w=400',
    problem: 'Your scouts report that there is only enough horse fodder and citizen bread rations to survive 48 hours. The Maratha army is fully trapped behind Panipat mud-walls. What is your command directive?',
    options: [
      {
        id: 'opt2_1',
        text: 'Send urgent messengers to the Jats requesting immediate gold rescue and dry food grain caravans.',
        historicalResult: 'DIPLOMATIC DEADEND. Major Jats had withdrawn from active coalition due to strategic disputes, ignoring all messages.',
        scoreImpact: -10,
        alignment: 'Neutral'
      },
      {
        id: 'opt2_2',
        text: 'Throw open the city gates at dawn and charge the Afghan encampment in a final, glorious do-or-die assault.',
        historicalResult: 'HISTORICAL REALITY. Compelled by famine, the entire Maratha army smeared their faces with saffron and charged at dawn. It was a brave surge that nearly broke Abdali’s center.',
        scoreImpact: 30,
        alignment: 'Maratha'
      },
      {
        id: 'opt2_3',
        text: 'Attempt a silent midnight retreat with camp followers, abandoning heavy artillery in the mud.',
        historicalResult: 'CATASTROPHIC failure. Afghan light riders patrol the roads 24/7; a silent retreat would lead to immediate encirclement and routing of defenseless civilians.',
        scoreImpact: -25,
        alignment: 'Afghan'
      }
    ]
  },
  {
    id: 'rec3',
    title: 'Red Fort Silver Desecration (August 1760)',
    bgUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=400',
    problem: 'Starving soldiers in occupied Delhi mutiny demanding months of pension payments. Do you strip the ancient silver ceiling of the Diwan-i-Khas from Delhi\'s Red Fort to coin emergency currency, risking massive public dishonor, or conserve the historical art but risk widespread deserters?',
    options: [
      {
        id: 'opt3_1',
        text: 'Strip physical silver artifacts immediately to pay wages, prioritizing army cohesion over local aesthetics.',
        historicalResult: 'HISTORICAL OUTCOME. Bhau stripped and melted the ceiling, yielding about 9 Lakhs in silver Rupees. It kept the army intact, but permanently destroyed goodwill among northern nobles.',
        scoreImpact: 20,
        alignment: 'Maratha'
      },
      {
        id: 'opt3_2',
        text: 'Issue empty tax receipts promising northern land segments instead of physical silver.',
        historicalResult: 'TROOP REBEL. Demoralized soldiers deserted in massive numbers. Without land stability, paper promises were considered worthless currency.',
        scoreImpact: -15,
        alignment: 'Neutral'
      },
      {
        id: 'opt3_3',
        text: 'Request Najib-ud-Daulah for a financial loan to avoid treasury desecration.',
        historicalResult: 'DUMMY NEGOTIATION. Najib laughed at the request and leaked it, exposing the Maratha bankruptcy to the entire Afghan encampment.',
        scoreImpact: -20,
        alignment: 'Afghan'
      }
    ]
  },
  {
    id: 'rec4',
    title: 'Najib’s Double-Agent Threat (October 1760)',
    bgUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400',
    problem: 'Intercepted messages reveal a secret courier offering high financial rewards if local Maratha commanders desert. Do you print decoy execution notices, make counter-alliances, or seek a peace deal with Najib’s envoys?',
    options: [
      {
        id: 'opt4_1',
        text: 'Execute the envoys publicly to state your absolute military terms and steel the courage of the troops.',
        historicalResult: 'TERRIFYING ESCALATION. Shut down the potential for regional peace talks and sealed Najib\'s resolve to destroy the Deccan lines completely.',
        scoreImpact: 10,
        alignment: 'Maratha'
      },
      {
        id: 'opt4_2',
        text: 'Ignore the correspondence entirely, and double down on standard surveillance guards around common infantry tents.',
        historicalResult: 'INEFFICIENCY. Did not mitigate general mutiny rumors. Let espionage scouts move cleanly through local files.',
        scoreImpact: 5,
        alignment: 'Neutral'
      },
      {
        id: 'opt4_3',
        text: 'Initiate a secret backchannel counter-payment to the Rohilla chieftains to buy territorial passage.',
        historicalResult: 'EXPLOITED STALL. The Rohillas accepted initial bribes to delay, but fed full tactical troop movements to Ahmad Shah, worsening Maratha encampments.',
        scoreImpact: -15,
        alignment: 'Afghan'
      }
    ]
  },
  {
    id: 'rec5',
    title: 'Kunjpura Storage Splitting (November 1760)',
    bgUrl: 'https://images.unsplash.com/photo-1549673967-893bd5798485?q=80&w=400',
    problem: 'Having dramatically sacked Kunjpura fort, capturing thousands of grain bags, do you split your army by dispatching light cavalry under Govind Pant to secure foraging corridors, or keep your entire heavy phalanx consolidated in a single defensive shield?',
    options: [
      {
        id: 'opt5_1',
        text: 'Consolidate the entire army at Panipat town with all Kunjpura grain to form a secure garrison.',
        historicalResult: 'SAFE famine. The sheer volume of troops and camp followers devoured the entire grain reserve inside 18 days, restarting starvation protocols.',
        scoreImpact: 10,
        alignment: 'Neutral'
      },
      {
        id: 'opt5_2',
        text: 'Dispatch Govind Pant\'s cavalry to forage roads and cut off Afghan messengers.',
        historicalResult: 'HISTORICAL CHOICE. A tactical layout error. Govind Pant\'s light cavalry was ambushed and decapitated by Attai Khan\'s elite Afghan riders, ending all Maratha supply channels.',
        scoreImpact: -15,
        alignment: 'Afghan'
      },
      {
        id: 'opt5_3',
        text: 'Dispatch the grain directly to Delhi vanguards under a heavily armored infantry guard.',
        historicalResult: 'STRATEGIC SPLIT. Kept the Delhi garrison alive but significantly weakened the primary tactical front at Panipat plains by 8,000 disciplined muskets.',
        scoreImpact: 15,
        alignment: 'Maratha'
      }
    ]
  }
];

// 4. 12 Comprehensive Quiz Questions
export const QUIZ_QUESTIONS: QuizQuestion[] = [
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
  },
  {
    question: "What was Sadashivrao Bhau's final coded message (telegram) sent back to Pune as credit collapsed?",
    options: [
      "\"Send 10,000 horsemen directly via Agra road.\"",
      "\"Two pearls have been dissolved, 27 gold mohurs lost...\"",
      "\"The battle is won, secure the northern border immediately.\"",
      "\"Requesting Bussy of the French army to come with reinforcements.\""
    ],
    correctIdx: 1,
    explanation: "This famous encrypted sentence metaphorically detailed the heavy loss of life: two pearls (his nephew Vishwasrao and cousin Bhau), 27 gold mohurs (core generals), and countless common troops."
  },
  {
    question: "Which European nation's rise to power was accelerated by the mutual destruction at Panipat?",
    options: ["Kingdom of France", "British Empire (East India Company)", "Portuguese Empire", "Dutch East India Company"],
    correctIdx: 1,
    explanation: "By destroying both the Maratha northern authority and draining the Afghan/Mughal treasury, Panipat paved a direct path for the British to secure Bengal-Delhi tax rights."
  },
  {
    question: "Who was the chief of the Jats of Bharatpur who abandoned the Maratha collation due to command disputes?",
    options: ["Raja Suraj Mal", "Maharaja Ranjit Singh", "Rao Shinde", "Sadashivrao Bhau"],
    correctIdx: 0,
    explanation: "Suraj Mal initially allied with the Marathas but withdrew his forces when the Maratha command ignored local advice on using guerrilla tactics."
  },
  {
    question: "What was the estimated morning temperature on January 14, 1761, at Panipat plains?",
    options: ["3°C", "22°C", "15°C", "-5°C"],
    correctIdx: 0,
    explanation: "The temperature plummeted near 3°C, paralyzing the Deccan troops who were wearing light cotton clothing designed for hot southern summers."
  },
  {
    question: "What is the historical native term for the traditional Maratha light guerrilla cavalry strategy?",
    options: ["Gardi Phalanx", "Ganimi Kava", "Zamburak Charge", "Chauth Levy"],
    correctIdx: 1,
    explanation: "'Ganimi Kava' was Shivaji's signature guerrilla style featuring swift horse encirclement, decoy retreats, and logistical ambush."
  },
  {
    question: "Which Delhi Red Fort historical structure had its silver ceiling melted down to pay the Maratha army?",
    options: ["The Diwan-i-Khas", "The Moti Masjid", "The Lahore Gatehouse", "The Rang Mahal"],
    correctIdx: 0,
    explanation: "Sadashivrao Bhau was forced to strip the ornate silver ceiling of the Diwan-i-Khas (Hall of Private Audience) to coin emergency silver rupees."
  },
  {
    question: "Why did Najib-ud-Daulah join the Afghan invader Ahmad Shah Abdali instead of assisting the native Marathas?",
    options: [
      "Najib was Abdali's biological brother-in-law.",
      "Religious Rohilla-Pashtun alignments and fear of Maratha Deccan expansion.",
      "The Marathas had defaulted on a silver tribute treaty with Kabul.",
      "The French forced the Rohillas to sign an artillery contract."
    ],
    correctIdx: 1,
    explanation: "Najib-ud-Daulah, leader of the Rohilla Afghans, saw the expanding Deccan Maratha power as a threat to his territory and swore holy oaths to assist Abdali."
  }
];

// 5. Genuine Primary Sources (Letters & Archives)
export const MANUSCRIPTS: DocumentArchive[] = [
  {
    id: 'doc1',
    title: 'The Kashiraj Pandit Chronicles',
    source: 'Kashiraj Pandit\'s Eyewitness Journal (1761)',
    translator: 'Sir Jadunath Sarkar (Trans. 1920)',
    excerpt: 'The Maratha army crawled like a massive white shadow in the mist of January 14. Demoralized by starvation, they smeared Saffron on their cheeks...',
    context: 'Written by Kashiraj, a secretary present in the camp of Shuja-ud-Daulah who witnessed everything and acted as temporary intermediary between both armies.',
    fullMaterial: 'The Marathas, having exhausted all grains, drank water of the mud ditch. At dawn, Sadashivrao Bhau mounted his elephant. The Marathas, with their uncombed hair flying, emerged from their trenches with swords unsheathed. Ibrahim Gardi\'s cannons began to roar with incredible impact, unleashing forty balls per minute, turning the Afghan right flank into smoke and blood. But as noon passed, a critical bullet struck young prince Vishwasrao on his forehead. Seeing his dead boy, Sadashivrao descended from his elephant, mounted his stallion, and plunged into the sea of Afghan sabres. No one saw him alive again.'
  },
  {
    id: 'doc2',
    title: 'Sadashivrao Bhau’s Coded Cry',
    source: 'Urgent Dispatch to Pune Merchant Guilds (Dec 1760)',
    translator: 'Deccan Archives Society',
    excerpt: 'Two pearls have been dissolved, 27 gold Mohurs lost, and of the silver and copper... the cast is beyond counting.',
    context: 'The final, highly poetic coded distress signal sent by Sadashivrao Bhau back to the Peshwa capital shortly before his communication was entirely blocked.',
    fullMaterial: 'We have entered a region where currency is rejected. The merchants refuse the hundis of Pune. Tell our sovereign that two precious pearls [Vishwasrao and his brother-in-chiefs] are dissolved into dust. Twenty-seven golden mohurs [established military generals] have been lost in skirmishes, and the countless common copper and silver copper coins [thousands of regular infantry and camp followers] have vanished in the cold. Send reinforcements or the empire of Hindusthan is shattered.'
  },
  {
    id: 'doc3',
    title: 'Najib-ud-Daulah’s Holy Sworn Alliance',
    source: 'Rohilla Treaty Sworn upon the Holy Quran (July 1760)',
    translator: 'Dr. Hari Ram Gupta (Oxford History Series)',
    excerpt: 'I swear by the Creator of the Heavens that I shall back the Pashtun King Ahmad Shah in this holy defense against Deccan incursions...',
    context: 'The official diplomatic document which sealed the regional Afghan-Rohilla alliance. Shuja-ud-Daulah was initially neutral but was swayed by Najib\'s intense words.',
    fullMaterial: 'To the Nawab Shuja-ud-Daulah: Hear our oath. The Deccan armies come like grasshoppers from the south. They desecrate Delhi, they tax the north, they threaten our borders. Swear upon the holy text. Ahmad Shah is a protector of the central faith who wants no territorial claims in Hindusthan; he will return to Kandahar when the Marathas are pushed back beyond the Narmada River. If you stay neutral, you will be eaten first. Join us and secure your Awadh throne.'
  }
];
