/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HistoricalProfile {
  id: string;
  name: string;
  title: string;
  faction: 'maratha' | 'durrani';
  bannerColor: string; // Tailwind bg color representation
  bannerAccent: string; // Border color / secondary representation
  emblem: string; // SVG or emoji character
  detailedHistory: string;
  achievements: string[];
  bannerSymbolDesc: string;
  birthDeath: string;
}

export const HISTORICAL_PROFILES: { [id: string]: HistoricalProfile } = {
  bhau: {
    id: 'bhau',
    name: 'Sadashivrao Bhau',
    title: 'De-Facto Generalissimo, Maratha Empire',
    faction: 'maratha',
    bannerColor: 'bg-gradient-to-b from-[#ff9933] to-[#cc7a00]',
    bannerAccent: 'border-saffron',
    emblem: '🚩',
    birthDeath: '1730 – 1761',
    bannerSymbolDesc: 'The sacred Saffron Jari Patka: emblem of the Peshwa crown, signifying sovereign service under Chhatrapati Shahu, dedicated to spiritual and temporal victory.',
    detailedHistory: 
      'Sadashivrao Bhau, the cousin of Peshwa Balaji Baji Rao, was the brilliant state financier and generalissimo of the Maratha Grand Expedition to the North. Prior to his march, he had crushed the Nizam of Hyderabad at the Battle of Udgir in 1760. Challenged to secure Northern frontiers from Ahmad Shah Abdali, Bhau led an enormous host together with hundreds of thousands of non-combatant pilgrims. Although his administrative capability was unmatched, winter snows, starvation in the Doab trenches, and regional divisions eventually isolated his forces at Panipat. He fought heroically to his last breath, charging on foot into the Afghan center when his noble cavalry fell around him.',
    achievements: [
      'Architect of the famous siege of Delhi Fort (1760).',
      'Crushed the Nizam at Udgir, collecting 60 Lakhs in reparations.',
      'Secured command of the grand artillery columns under Ibrahim Khan Gardi.'
    ]
  },
  shamsher: {
    id: 'shamsher',
    name: 'Shamsher Bahadur',
    title: 'Lord of Banda, Cavalry Commander',
    faction: 'maratha',
    bannerColor: 'bg-gradient-to-b from-amber-700 to-amber-950',
    bannerAccent: 'border-amber-500',
    emblem: '⚔️',
    birthDeath: '1734 – 1761',
    bannerSymbolDesc: 'The Double-Crescent Scimitar: symbol of the House of Mastani and Baji Rao, representing raw equine speed and legendary martial flexibility.',
    detailedHistory: 
      'Shamsher Bahadur (Krishna Rao) was the heroic son of Peshwa Baji Rao I and the warrior queen Mastani. Inheriting his parents\' legendary martial spirit and horse-riding expertise, he ruled the estate of Banda in Bundelkhand. When the call came from Pune for the northern campaign, he rallied thousands of fierce horseback raiders to support Sadashivrao Bhau. During the battle of Panipat, he commanded the critical wing of Maratha heavy shock cavalry. He swung his Damascus-forged blade in countless desperate charges, opening breaches in Najib-ud-Daula’s Rohilla infantry squares. Though mortally wounded on that bloody field, his courage stands as a testimony to the legendary lineage of Baji Rao.',
    achievements: [
      'Led the elite Maratha light cavalry through the Yamuna crossings.',
      'Fought alongside Jankoji Scindia to repel early Afghan vanguard attacks.',
      'Pioneered the crescent-shaped equine charge maneuvers.'
    ]
  },
  vishwas: {
    id: 'vishwas',
    name: 'Vishwasrao Peshwa',
    title: 'Heir-Apparent to the Peshwadom',
    faction: 'maratha',
    bannerColor: 'bg-gradient-to-b from-[#ff8c1a] to-[#b35900]',
    bannerAccent: 'border-orange-400',
    emblem: '👑',
    birthDeath: '1741 – 1761',
    bannerSymbolDesc: 'The Royal Peshwa Shield and Canopy: symbolizing the absolute dynastic legitimacy of Pune and the trust of Chhatrapati\'s crown.',
    detailedHistory: 
      'At just 19 years old, Vishwasrao was the eldest son of Peshwa Balaji Baji Rao and the designated successor to the entire Maratha Confederacy. His inclusion in the campaign was highly symbolic—designed to unify the competing generals (Holkar, Scindia, and Gaekwad) under a singular royal banner. Wise beyond his years and exceptionally handsome, he showed incredible battle leadership during the heavy shelling phases. His sudden death from a stray musket shot to the chest, while mounted on his royal elephant, sent shockwaves through the Maratha forces, triggering a tragic and premature vanguard charge from Sadashivrao Bhau, which ultimately cost them the battle.',
    achievements: [
      'Served as the nominal commander-in-chief of all confederate armies.',
      'Inspired thousands of veterans with his direct presence on the front lines.',
      'Successfully mediated early strategic disputes between old regional sirdars.'
    ]
  },
  gardi: {
    id: 'gardi',
    name: 'Ibrahim Khan Gardi',
    title: 'General of the French Artillery (Gardi)',
    faction: 'maratha',
    bannerColor: 'bg-gradient-to-b from-[#0f172a] to-[#1e3a8a]',
    bannerAccent: 'border-blue-400',
    emblem: '💣',
    birthDeath: 'd. 1761',
    bannerSymbolDesc: 'The Crossed Flintlocks and Field Cannon: representing state modernity, discipline, and the absolute field supremacy of coordinated artillery fire.',
    detailedHistory: 
      'Ibrahim Khan Gardi was an outstanding deccani Muslim artillery general who revolutionized Indian warfare. Trained by the French general Monsieur de Bussy, he implemented strict European discipline, heavy firearm drilling, and coordinate-based artillery bombardment. Sadashivrao Bhau recruited his entire corps ("the Gardis") into Peshwa service. At Panipat, Gardi’s heavy cannons fired with such brutal precision that they completely destroyed the Durrani right-wing forces. In spite of being offered bribery by other Islamic factions to defect, Ibrahim remained faithfully loyal to the Maratha cause to the actual end, perishing during a final, desperate bayonet charge.',
    achievements: [
      'Decimated the Nizams defense lines at the historic Battle of Udgir.',
      'Constructed modular nine-cannon artillery batteries at Panipat.',
      'Refused to yield to sectarian pressure, setting an immortal precedent of integrity.'
    ]
  },
  ahmad: {
    id: 'ahmad',
    name: 'Ahmad Shah Durrani',
    title: 'The Great Ahmad Shah Abdali, King of Afghans',
    faction: 'durrani',
    bannerColor: 'bg-gradient-to-b from-[#800000] to-[#3a0000]',
    bannerAccent: 'border-red-600',
    emblem: '⭐',
    birthDeath: '1722 – 1772',
    bannerSymbolDesc: 'The Crescent Pearl with Royal Falcon: Emblem of the unified Durrani clans, representing dominance, imperial vision, and trans-Indus sovereignty.',
    detailedHistory: 
      'Ahmad Shah Durrani (often called Ahmad Shah Abdali or "the Pearl of Pearls") is revered as the founder of the modern state of Afghanistan. A former commander of Nader Shah’s elite cavalry guard, he united the disparate Pashtun tribes under his charismatic banners. Hearing the appeals of Najib-ud-Daula to push back the Maratha power in the north, Abdali crossed the Indus in force. He demonstrated legendary troop discipline and strategic genius, keeping his forces connected to Trans-Indus reserves. His deployment of camel-mounted swivel-guns (Zamburaks) and a mobile reserve unit during the final hour of Panipat sealed his victory.',
    achievements: [
      'Unified all major Pashtun clans in Kabul under a singular dynastic seal.',
      'Pioneered highly mobile camel-heavy siege and missile warfare.',
      'Won the historic battle of Panipat, terminating the Maratha north expansion.'
    ]
  },
  shaf: {
    id: 'shaf',
    name: 'Shah Wali Khan',
    title: 'Grand Vizier of the Durrani Empire',
    faction: 'durrani',
    bannerColor: 'bg-gradient-to-b from-stone-800 to-neutral-900',
    bannerAccent: 'border-zinc-500',
    emblem: '📜',
    birthDeath: 'd. 1771',
    bannerSymbolDesc: 'The Grand Wazarat Quill and Mace: representing logistical absolute control, diplomatic consensus, and iron military order.',
    detailedHistory: 
      'Shah Wali Khan was the trustworthy Grand Vizier (Wazir) of the Durrani Empire. He was responsible for organizing the massive supply columns carrying dry wheat, gunpowders, and fresh Arabian horses from Kabul through the Khyber Pass to Hindusthan. Acting as Abdali’s chief executive on the battlefield, he personally led the central core of Afghan foot musketeers. During the pivotal Maratha counter-charge, when some allied forces panicked, Shah Wali Khan famously dismounted his stallion, sat in the mud, and declared that he would rather die on his knees than flee, successfully rallying the crumbling center.',
    achievements: [
      'Maintained crucial supply corridors from Kandahar across war-torn Punjab.',
      'Commanded 12,000 royal hand-picked heavy horse lancers in the center.',
      'Instrumental in mediating conflicts between regional Rohilla sirdars.'
    ]
  },
  najib: {
    id: 'najib',
    name: 'Najib-ud-Daula',
    title: 'Rohilla Ruler and Amir-al-Umara',
    faction: 'durrani',
    bannerColor: 'bg-gradient-to-b from-emerald-800 to-green-950',
    bannerAccent: 'border-emerald-500',
    emblem: '🕌',
    birthDeath: 'd. 1770',
    bannerSymbolDesc: 'The Crescent over the Shukratal Dome: representing regional Rohilla autonomy, political strategy, and heavy defensive musketry.',
    detailedHistory: 
      'Najib-ud-Daula was the ambitious and politically acute leader of the Rohilla Afghans in the Doab region. After being driven back by Dattaji Shinde, he realized that only a total alliance with Ahmad Shah Abdali could rescue his domains. He worked tirelessly to persuade Shuja-ud-Daula, the Nawab of Oudh, to join the Afghan coalition, thereby depriving the Marathas of crucial northern financial support. At Panipat, his trench construction and massive Rohilla foot-musketeer battalions held key positions, slowly grinding down the Scindia and Holkar regiments through defensive firepower.',
    achievements: [
      'Orchestrated the critical treaty of Oudh, establishing the grand Islamic coalition.',
      'Pioneered defensive earthen ramparts that neutralized Maratha cavalry sweeps.',
      'Declared Amir-al-Umara (Premier Noble) of Delhi post-victory.'
    ]
  },
  parvatibai: {
    id: 'parvatibai',
    name: 'Queen Parvatibai',
    title: 'Camp Anchor & Spiritual Pillar of the Campaign',
    faction: 'maratha',
    bannerColor: 'bg-gradient-to-b from-[#b35900] to-[#800000]',
    bannerAccent: 'border-saffron',
    emblem: '🌸',
    birthDeath: '1734 – 1763',
    bannerSymbolDesc: 'The Divine Maratha Lotus Crest: symbolizing resilient poise, administrative compassion, and absolute spiritual support of the encampments.',
    detailedHistory: 
      'Parvatibai was the resilient, highly respected wife of Generalissimo Sadashivrao Bhau. Breaking tradition, she accompanied the Grand Expedition of 1761, establishing a crucial presence as the moral caretaker of the massive non-combatant camper horde. Amidst freezing snows, isolated communications, and Afghan snipers, she organized volunteer groups, food distribution grids, and kept spirits elevated inside the defenses. Surviving the chaotic final battle of Panipat, her escape was guided by loyal warriors, returning to the Deccan to be memorialized for her loyalty and bravery.',
    achievements: [
      'Pioneered emergency child and civilian feeding grids inside the Panipat entrenchments.',
      'Sustained high encampment morale under heavy freezing conditions.',
      'Sovereign survivor of the grand campaign who returned to teach administration.'
    ]
  },
  gopikabai: {
    id: 'gopikabai',
    name: 'Regent Gopikabai',
    title: 'The Sovereign Peshwin, Regent Administrative Governor',
    faction: 'maratha',
    bannerColor: 'bg-gradient-to-b from-[#cc7a00] to-[#660000]',
    bannerAccent: 'border-yellow-600',
    emblem: '👑',
    birthDeath: '1725 – 1788',
    bannerSymbolDesc: 'The Royal Sovereign Wax Seal of Shaniwar Wada: representing absolute cash authority, treasury control, and dynastic directives.',
    detailedHistory: 
      'Gopikabai was the formidable wife of Peshwa Balaji Baji Rao and mother of heir-apparent Vishwasrao. Possessed of immense political foresight and sharp financial skills, she virtually managed the Pune capital administration (Shaniwar Wada) while the forces marched north. Her express directives dictated that sirdars provide regular status logs, and she directly managed the gold reserves that paid regional mercenaries. Her firm backing kept the Maratha state coherent during a period of exhausting regional coalition challenges.',
    achievements: [
      'Commanded the central Pune emergency gold reserves during the campaign.',
      'Exemplified strict administrative discipline, demanding regular military status reports.',
      'Sustained crucial back-channel diplomatic ties with Southern vassal kingdoms.'
    ]
  }
};

/**
 * Historical Advisor profiles for Wax Seal Feedback
 */
export interface Advisor {
  name: string;
  role: string;
  avatar: string;
}

export const HISTORICAL_ADVISORS: { [id: string]: Advisor } = {
  nana: {
    name: "Nana Phadnavis",
    role: "Peshwa Secretary of State",
    avatar: "📜"
  },
  malhar: {
    name: "Malharrao Holkar",
    role: "Veteran Sirdar of Indore",
    avatar: "🌾"
  },
  jankoji: {
    name: "Jankoji Scindia",
    role: "Guardian of Gwalior Lines",
    avatar: "🛡️"
  },
  ibrahim: {
    name: "Ibrahim Khan Gardi",
    role: "Flintlock Siege Commander",
    avatar: "💣"
  },
  wazir: {
    name: "Shah Wali Khan",
    role: "Grand Vizier of Kabul",
    avatar: "👑"
  },
  shuja: {
    name: "Shuja-ud-Daula",
    role: "Nawab of Oudh",
    avatar: "🦁"
  }
};

/**
 * Generates custom advice representing high-quality historical quotes and responses
 */
export const getAdvisorFeedbackForPolicy = (
  policyId: string,
  faction: 'maratha' | 'durrani'
): {
  advisor: Advisor;
  sealText: string;
  quote: string;
  historicalContext: string;
  impactScore: string;
} => {
  if (faction === 'maratha') {
    switch (policyId) {
      case 'gardi_flintlock_drill':
        return {
          advisor: HISTORICAL_ADVISORS.ibrahim,
          sealText: "APPROVED • GARDI DIVISION",
          quote: "General, these French flintlocks are not mere wood and iron—they are clockwork machines of statecraft. Under disciplined drilling, the Rohilla horsemen will break prior to clashing with our steel.",
          historicalContext: "Monsieur de Bussy’s training manuals revolutionized Deccani tactics, proving that organized line infantry squares could render traditional heavy cavalry charges completely obsolete.",
          impactScore: "+30% Artillery Bombard Accuracy & Faster Siege Ticks"
        };
      case 'deccan_speed_march':
        return {
          advisor: HISTORICAL_ADVISORS.malhar,
          sealText: "APPROVED • INDORE SIRDAR",
          quote: "Swiftness is our ancient shield, Bhau! The desert camel heavy weights cannot match our barebacked runners. But remember—if we stretch our tail too thin, the Abdali will snap our neck at the crossings.",
          historicalContext: "Maratha cavalry typically relied on high mobility (Ganimi Kava). The speed of their messengers (Jasoods) allowed different regional commanders to coordinate across hundreds of miles.",
          impactScore: "+15% Tactical Campaign Speed & Clean Logistics"
        };
      case 'shaniwar_war_bonds':
        return {
          advisor: HISTORICAL_ADVISORS.nana,
          sealText: "AUTHORIZED • STATE TREASURY",
          quote: "The Peshwa's treasury is bled dry by northern outposts, yet we must not let our paid mercenaries hunger. I have signed mortgages on ancestral family ornaments. Let the sahukars release the gold Mohurs.",
          historicalContext: "The campaign of Panipat became an agonizing logistical struggle primarily because the Pune treasury owed vast debts, and northern tribute was impossible to collect with Abdali blocking the roads.",
          impactScore: "+80,000 Immediate Campaign Mohurs & Safe Sirdar wages"
        };
      case 'sovereign_dictate':
        return {
          advisor: HISTORICAL_ADVISORS.jankoji,
          sealText: "SEALED • SHINDE HOUSEHOLD",
          quote: "One sword, one sovereign commander! If we dispute command in front of the subahdars, the campaign falls before we sight the Yamuna. Sadashivrao shall hold the royal Peshwa baton alone.",
          historicalContext: "Bypassing Malharrao Holkar's experience caused political friction, but it consolidated decision-making under Sadashivrao Bhau, ending paralyzing circular debates in the war cabinet.",
          impactScore: "+25 Starting Regiment Morale & Total Cohesion"
        };
      case 'tapti_grain_foraging':
        return {
          advisor: HISTORICAL_ADVISORS.malhar,
          sealText: "CONFIRMED • DECCAN SUPPLY",
          quote: "Bhau, we carry too many non-combatants, singing saints, and pilgrims. We must buy up wheat along the Tapti defiles and forage for green grasses before Abdali sweeps the Doab plains clean.",
          historicalContext: "The presence of nearly 200,000 camp followers placed an unbearable logistical load on the Maratha army, requiring massive daily foraging operations under constant sniper threats.",
          impactScore: "-20% Logistics Attrition Rate & Steady Food"
        };
      default:
        return {
          advisor: HISTORICAL_ADVISORS.nana,
          sealText: "APPROVED • PESHWA COURT",
          quote: "We seal this decision in the name of the Peshwa. Let the sirdars execute it immediately on their march north.",
          historicalContext: "Every major decree from Pune had to be authorized under the Peshwa's administrative ledger (Daftar) and validated with the crimson wax seal.",
          impactScore: "+10% General Combat Bonus"
        };
    }
  } else {
    // Afghan faction choices
    switch (policyId) {
      default:
        return {
          advisor: HISTORICAL_ADVISORS.wazir,
          sealText: "SEALED • GRAND VIZIER",
          quote: "The Pearl of Pearls has seen the wisdom in this course list. By the grace of the Indus, we shall ride and shatter the Maratha fortifications.",
          historicalContext: "Ahmad Shah Durrani maintained an iron discipline among his commanders, relying on Shah Wali Khan to execute absolute central logistics while balancing the interests of local chieftains.",
          impactScore: "+15% Battle Attrition Resistance"
        };
    }
  }
};
