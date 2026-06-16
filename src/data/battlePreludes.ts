import { CampaignStage } from '../types';

export interface General {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bgColor: string;
  borderColor: string;
}

export interface DialogueStep {
  speakerId: string;
  text: string;
  mapHighlight: 'artillery' | 'cavalry' | 'defense' | 'neutral';
}

export interface StrategyPlan {
  id: 'artillery' | 'guerilla' | 'defense';
  title: string;
  proposer: string;
  icon: string;
  description: string;
  bonusText: string;
}

export interface PreludeCouncil {
  intro: string;
  mapName: string;
  gridLabels: string[];
  generals: General[];
  dialogues: DialogueStep[];
  strategies: StrategyPlan[];
}

export const MARATHA_PRELUDES: Record<CampaignStage, PreludeCouncil> = {
  [CampaignStage.NIZAM_CAMPAIGN]: {
    intro: "Inside the grand velvet commander's tent at the Siege of Udgir, candlelight flickers over hand-inked Deccan plateau transit routes. The generals gather around a massive oak table detailing fort bastions.",
    mapName: "Udgir Rock Bastions & Gatehouse",
    gridLabels: ["North Gate", "Nizam's Royal Keep", "Gardi Cannon Outposts", "Mawala Rear Camp"],
    generals: [
      { id: 'bhau', name: 'Sadashivrao Bhau', title: 'Commander-in-Chief', avatar: '🔱', bgColor: 'bg-amber-950/40', borderColor: 'border-saffron/60' },
      { id: 'gardi', name: 'Ibrahim Khan Gardi', title: 'Artillery Commander', avatar: '💂', bgColor: 'bg-indigo-950/40', borderColor: 'border-blue-400/60' },
      { id: 'holkar', name: 'Malharrao Holkar', title: 'Cavalry Sirdar', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
    ],
    dialogues: [
      { speakerId: 'bhau', text: "Genious minds, the Nizam's heavy walls are built of deep-rooted basalt. Before we advance our core standard, the gatehouse must be cracked open. How shall we approach?", mapHighlight: 'neutral' },
      { speakerId: 'gardi', text: "Sovereign Bhau, physical blades will fail against Udgir rock. Grant me command! My French-trained Gardi gunners can establish an artillery crescent to pound the gateway to loose gravel in two hours.", mapHighlight: 'artillery' },
      { speakerId: 'holkar', text: "Bah! A loud, slow waste. If we sit under their parapets, our infantry will be turned into hedgehog targets by Nizam's swivel matchlocks. Let my light riders execute flanking dashes to lure their cavalry into the marshes!", mapHighlight: 'cavalry' },
      { speakerId: 'bhau', text: "Disciplined pressure is what preserves armies. We must align Gardi's modern cannon lines but protect them with heavy vanguard shields so our Mawala swordsmen can breach the keep once the rubble settles.", mapHighlight: 'defense' },
    ],
    strategies: [
      { id: 'artillery', title: "Gardi's Artillery Breach", proposer: "Ibrahim Khan Gardi", icon: "💣", description: "Concentrates all 9-pounder batteries on the gateway ramparts immediately.", bonusText: "+1 Frag Bomb, starts with enemy fort gate weakened (Fort Integrity starts at 80%)" },
      { id: 'guerilla', title: "Ganimi Kava Cavalry Raid", proposer: "Malharrao Holkar", icon: "🏇", description: "Lures enemy columns into the open wetlands, reducing active skirmisher pressure.", bonusText: "+20 Starting Morale, +2 Stamina Focus slots" },
      { id: 'defense', title: "S saffron Encircled Ward", proposer: "Sadashivrao Bhau", icon: "🛡️", description: "Deploys protective defensive squads to cushion our vanguard as we close the ring.", bonusText: "+1 Adrenaline Syringe, upgraded starting Shield level (Armor Tier 3)" }
    ]
  },
  [CampaignStage.PUNE]: {
    intro: "The vast review grounds of Shaniwar Wada Palace. The Peshwa and his commanders inspect the massive gathers of Maratha Mawalas preparing to depart for the long journey north.",
    mapName: "Shaniwar Wada Review Field",
    gridLabels: ["Grand Parade Gate", "Infantry Quadrant", "Cavalry Stable Rings", "Peshwa Banner Hill"],
    generals: [
      { id: 'bhau', name: 'Sadashivrao Bhau', title: 'Commander-in-Chief', avatar: '🔱', bgColor: 'bg-amber-950/40', borderColor: 'border-saffron/60' },
      { id: 'gardi', name: 'Ibrahim Khan Gardi', title: 'Artillery Commander', avatar: '💂', bgColor: 'bg-indigo-950/40', borderColor: 'border-blue-400/60' },
      { id: 'holkar', name: 'Malharrao Holkar', title: 'Cavalry Sirdar', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
    ],
    dialogues: [
      { speakerId: 'bhau', text: "The journey to Delhi is long and the cold northern winter will test our southern blood. We must ensure our recruits survive the harsh road ahead with strict military drills.", mapHighlight: 'neutral' },
      { speakerId: 'gardi', text: "Indeed Bhau. Modern wars are not won by disorganized courage. Let us conduct rigorous French line drill reviews for the musketeers. Cohesion is our primary shield.", mapHighlight: 'defense' },
      { speakerId: 'holkar', text: "Traditional drilling is good for parades, Ibrahim, but the Afghans ride like the wind. Our horsemen need to practice fast skirmish sprints to avoid getting pinned down.", mapHighlight: 'cavalry' },
    ],
    strategies: [
      { id: 'defense', title: "Disciplined Line Drills", proposer: "Ibrahim Khan Gardi", icon: "🛡️", description: "Trains troops in defensive shield and fire-cohesion maneuvers.", bonusText: "+30 starting Morale, +1 Adrenaline Syringe" },
      { id: 'guerilla', title: "Cavalry Skirmish Runs", proposer: "Malharrao Holkar", icon: "🏇", description: "Focuses on agility drills to build incredible lung stamina and reflexes.", bonusText: "+2 Starting Stamina Focus slots, +20 starting Morale" },
      { id: 'artillery', title: "Artillery Crew Loading", proposer: "Sadashivrao Bhau", icon: "💣", description: "Hones the loading speed of Gardi's artillery teams under simulated siege pressures.", bonusText: "+1 Frag Bomb, +15% Artillery capability for the training round" }
    ]
  },
  [CampaignStage.BURHANPUR]: {
    intro: "In the dusty river banks of Burhanpur, scouts report that Ahmad Shah's vanguard has placed light barricades blockading the essential Tapti river crossing routes.",
    mapName: "Tapti River Ford Crossing",
    gridLabels: ["North Shallows", "Afghan Timber Redoubt", "Maratha Crossing Point", "Mud Flats Sector"],
    generals: [
      { id: 'holkar', name: 'Malharrao Holkar', title: 'Cavalry Sirdar', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
      { id: 'bhau', name: 'Sadashivrao Bhau', title: 'Commander-in-Chief', avatar: '🔱', bgColor: 'bg-amber-950/40', borderColor: 'border-saffron/60' },
      { id: 'gardi', name: 'Ibrahim Khan Gardi', title: 'Artillery Commander', avatar: '💂', bgColor: 'bg-indigo-950/40', borderColor: 'border-blue-400/60' },
    ],
    dialogues: [
      { speakerId: 'holkar', text: "Bhau, the Afghan riders blockading the river ford are light but highly mobile. A slow march through the muddy waters will make us targets. We must use Ganimi Kava!", mapHighlight: 'cavalry' },
      { speakerId: 'gardi', text: "The river is shallow enough. If we align our field guns, we can shell their timber barricades across the bank and clear a clean path with iron fire.", mapHighlight: 'artillery' },
      { speakerId: 'bhau', text: "A steady, unified advance will prevent any confusion. We shall cross in solid formations, holding our heavy leather shields high to deflect their matchlock fire.", mapHighlight: 'defense' },
    ],
    strategies: [
      { id: 'guerilla', title: "Ganimi Kava River Dash", proposer: "Malharrao Holkar", icon: "🏇", description: "Dispatches light cavalry columns to flank the river blockade and strike from behind.", bonusText: "+25 Starting Morale, +20% Critical hit chance" },
      { id: 'artillery', title: "Barricade Shelling", proposer: "Ibrahim Khan Gardi", icon: "💣", description: "Deploys field brass cannons to punch a hole through the timber blockades.", bonusText: "+1 Frag Bomb, starting enemy morale reduced by 15%" },
      { id: 'defense', title: "Shielded River Crossing", proposer: "Sadashivrao Bhau", icon: "🛡️", description: "Holds tight armor defense lines to weather the heat during transition.", bonusText: "+2 Adrenaline Syringes, Armor Tier up (Tier 3)" }
    ]
  },
  [CampaignStage.GWALIOR]: {
    intro: "Scouts look up at the towering rocky ranges of Gwalior. A stubborn garrison of Rohilla light infantries have fortified the steep mountain path, dropping boulders onto Maratha pilgrim routes.",
    mapName: "Gwalior Steep Mountain Pass",
    gridLabels: ["High Rock Bastion", "Hillside Archway", "Maratha Bottom Slope", "Cliffside Path"],
    generals: [
      { id: 'gardi', name: 'Ibrahim Khan Gardi', title: 'Artillery Commander', avatar: '💂', bgColor: 'bg-indigo-950/40', borderColor: 'border-blue-400/60' },
      { id: 'holkar', name: 'Malharrao Holkar', title: 'Cavalry Sirdar', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
      { id: 'bhau', name: 'Sadashivrao Bhau', title: 'Commander-in-Chief', avatar: '🔱', bgColor: 'bg-amber-950/40', borderColor: 'border-saffron/60' },
    ],
    dialogues: [
      { speakerId: 'bhau', text: "This hillside fort protects Najib's southern pipeline. Clashing on raw vertical cliffs is a nightmare. Our men are exposed to constant archer fire from the sky.", mapHighlight: 'neutral' },
      { speakerId: 'gardi', text: "Allow me to wheel up our heavy siege ordnance. We shall target their mountain archway with mortar bomb shells to crumble their shelters from below.", mapHighlight: 'artillery' },
      { speakerId: 'holkar', text: "The slope is too steep for siege wagons, Ibrahim! Let us carry small camel swivels up the cliffs under cover of a massive smoke screen, blind-siding their lookouts.", mapHighlight: 'defense' },
    ],
    strategies: [
      { id: 'artillery', title: "Ordance Bombardment", proposer: "Ibrahim Khan Gardi", icon: "💣", description: "Concentrates siege howitzer fire directly on the rocky hillside ramparts.", bonusText: "+1 Frag Bomb, Fort Gate integrity reduced (starts at 75%)" },
      { id: 'defense', title: "Smoke Screen Infiltration", proposer: "Malharrao Holkar", icon: "💨", description: "Fires large soot sacks to create a giant protective mist cover.", bonusText: "+2 Adrenaline Syringes, starts with smoke active" },
      { id: 'guerilla', title: "Fierce Mawala Scaling", proposer: "Sadashivrao Bhau", icon: "🧗", description: "Mawalas climb the high cliffs with absolute speed, bypassing main fire zones.", bonusText: "+2 Starting Stamina Focus slots, +30 starting Morale" }
    ]
  },
  [CampaignStage.DELHI_NEGOTIATIONS]: {
    intro: "Within sight of the legendary Lal Qila (Red Fort) of Delhi. Negotiations have dissolved, and the Maratha army is starving. The great gates must be forced open to secure Mughal treasure and food.",
    mapName: "Lal Qila (Red Fort) Delhi Gate",
    gridLabels: ["Imperial Red Gate", "Sovereign Palace Keep", "Yamuna Moat Area", "Maratha Front Siege Line"],
    generals: [
      { id: 'bhau', name: 'Sadashivrao Bhau', title: 'Commander-in-Chief', avatar: '🔱', bgColor: 'bg-amber-950/40', borderColor: 'border-saffron/60' },
      { id: 'gardi', name: 'Ibrahim Khan Gardi', title: 'Artillery Commander', avatar: '💂', bgColor: 'bg-indigo-950/40', borderColor: 'border-blue-400/60' },
      { id: 'holkar', name: 'Malharrao Holkar', title: 'Cavalry Sirdar', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
    ],
    dialogues: [
      { speakerId: 'bhau', text: "Delhi's Red Fort contains the granaries we need to feed our 100,000 pilgrims. There is no time to negotiate. We must assault the Delhi Gate immediately!", mapHighlight: 'neutral' },
      { speakerId: 'gardi', text: "Bhau, the gates of Lal Qila are layered in iron plates and iron studs. Standard swords have zero sway. My French batteries must concentrate full fire on the gates.", mapHighlight: 'artillery' },
      { speakerId: 'holkar', text: "A direct siege will cost us weeks! Let us send in a tiny distraction unit to scale the water-facing moat walls while my horsemen raid the outer city granaries.", mapHighlight: 'cavalry' },
    ],
    strategies: [
      { id: 'artillery', title: "Iron-Gate Cannonade", proposer: "Ibrahim Khan Gardi", icon: "💣", description: "Pounds the historic red brick gateway with continuous heavy iron balls.", bonusText: "+1 Frag Bomb, Fort Integrity reduced (starts at 70%)" },
      { id: 'guerilla', title: "Water-Gate Infiltration", proposer: "Malharrao Holkar", icon: "🌊", description: "Scales the silent Yamuna riverside wall to bypass main front batteries.", bonusText: "+20 starting Morale, +2 Stamina Focus slots" },
      { id: 'defense', title: "Granary Encirclement Hold", proposer: "Sadashivrao Bhau", icon: "🛡️", description: "Secures the outer fortress perimeter, protecting supply lines during bombardment.", bonusText: "+2 Adrenaline Syringes, extra Armor Tier (Tier 3)" }
    ]
  },
  [CampaignStage.SHINDE_STAND]: {
    intro: "A freezing mist rises from the Yamuna riverbed at Badghat. Dattaji Scindia's scouting vanguard is isolated, and the main Durrani force is launching a massive surprise river crossing.",
    mapName: "Badghat Sandy Riverbed",
    gridLabels: ["Yamuna Deep Waters", "Muddy River Shoal", "Scindia Outpost Camp", "Durrani Crossing Cavalry"],
    generals: [
      { id: 'scindia', name: 'Dattaji Shinde', title: 'Northern Sirdar', avatar: '🗡️', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60' },
      { id: 'jankoji', name: 'Jankoji Scindia', title: 'Young Vanguard Chief', avatar: '🔱', bgColor: 'bg-amber-950/40', borderColor: 'border-saffron/60' },
      { id: 'holkar', name: 'Malharrao Holkar', title: 'Cavalry Sirdar', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
    ],
    dialogues: [
      { speakerId: 'scindia', text: "The cold Yamuna fog blinds us. The Afghans are crossing in massive numbers! Sirdars, we are outnumbered, but the Scindia banner does not fly backward. If we survive, we fight! If not, we die with honor!", mapHighlight: 'neutral' },
      { speakerId: 'jankoji', text: "Uncle, we cannot let them cut off our pilgrim trails. We must hold our ground in the muddy riverbed, forming an impenetrable defense wall to delay their crossing!", mapHighlight: 'defense' },
      { speakerId: 'holkar', text: "Dattaji, this is madness! The mud has neutralized our cavalry's speed, while their camel swivels can sit on the high dry sands and chew us up. We must execute a fighting retreat!", mapHighlight: 'cavalry' },
    ],
    strategies: [
      { id: 'defense', title: "The Sovereign Mud Wall", proposer: "Jankoji Scindia", icon: "🛡️", description: "Arranges a heavy shield-wall in the freezing riverbed to delay their crossing.", bonusText: "+2 Adrenaline Syringes, Armor Tier up (Tier 3)" },
      { id: 'artillery', title: "Scything Shinde Stand", proposer: "Dattaji Shinde", icon: "⚔️", description: "An absolute, suicidal charge directly into the crossing columns to shatter their composure.", bonusText: "+35 starting Morale, increased Critical damage" },
      { id: 'guerilla', title: "Holkar's Delayed Retreat", proposer: "Malharrao Holkar", icon: "🏇", description: "Engages in hit-and-run cavalry delays while pulling the main baggage caravan back.", bonusText: "+2 Starting Stamina Focus slots, starting enemy morale reduced by 15%" }
    ]
  },
  [CampaignStage.DELHI_BATTLE]: {
    intro: "On the vast Delhi-Kunjpura Frontier plains. The Maratha grand army has marched north, and we must intercept the Durrani-aligned Kunjpura garrison before they can link forces with Ahmad Shah.",
    mapName: "Kunjpura Outpost Plains",
    gridLabels: ["Kunjpura Garrison Walls", "Frontier Plain Choke", "Mawala Vanguard Left", "Gardi Gun Positions"],
    generals: [
      { id: 'gardi', name: 'Ibrahim Khan Gardi', title: 'Artillery Commander', avatar: '💂', bgColor: 'bg-indigo-950/40', borderColor: 'border-blue-400/60' },
      { id: 'bhau', name: 'Sadashivrao Bhau', title: 'Commander-in-Chief', avatar: '🔱', bgColor: 'bg-amber-950/40', borderColor: 'border-saffron/60' },
      { id: 'jankoji', name: 'Jankoji Scindia', title: 'Vanguard Chief', avatar: '🗡️', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60' },
    ],
    dialogues: [
      { speakerId: 'bhau', text: "Kunjpura has stored massive provisions and gold reserved for the Afghans. If we storm it swiftly, we feed our army and starve Ahmad Shah's Coalition. Let us decide the battle line.", mapHighlight: 'neutral' },
      { speakerId: 'gardi', text: "The garrison has heavy fortifications. I will place my 9-pounder field pieces in a wide crescent to shell their battlements, crushing their spirits before the infantry charges.", mapHighlight: 'artillery' },
      { speakerId: 'jankoji', text: "Our Scindia horsemen are itching to avenge the riverbed. Let us bypass their artillery range and strike their matchlock regiments before they can form deep squares!", mapHighlight: 'cavalry' },
    ],
    strategies: [
      { id: 'artillery', title: "Gardi's Artillery Crescent", proposer: "Ibrahim Khan Gardi", icon: "💣", description: "Establishes a grand artillery line to pound the garrison fortifications.", bonusText: "+1 Frag Bomb, +20 starting Morale, lower fort gate integrity" },
      { id: 'guerilla', title: "Vanguard Cavalry Sweep", proposer: "Jankoji Scindia", icon: "🏇", description: "Fierce cavalry charge to trample their matchlock defenses and outriders.", bonusText: "+25 starting Morale, +2 Stamina Focus slots" },
      { id: 'defense', title: "Enclosed Supply Hold", proposer: "Sadashivrao Bhau", icon: "🛡️", description: "Advances in massive, shielded rows to safely encircle and isolate Kunjpura.", bonusText: "+2 Adrenaline Syringes, improved starting shield (Armor Tier 3)" }
    ]
  },
  [CampaignStage.PANIPAT]: {
    intro: "The frosty morning of January 14, 1761, on the plains of Panipat. The entire Maratha Empire stands arrayed for the ultimate battle of the century. Saffron banners flutter to the horizon.",
    mapName: "Frosty Plains of Panipat (Maratha Side)",
    gridLabels: ["Gardi Artillery Left", "Bhau's Saffron Center", "Holkar Cavalry Right", "Grand Durrani Coalition Front"],
    generals: [
      { id: 'bhau', name: 'Sadashivrao Bhau', title: 'Commander-in-Chief', avatar: '🔱', bgColor: 'bg-amber-950/40', borderColor: 'border-saffron/60' },
      { id: 'gardi', name: 'Ibrahim Khan Gardi', title: 'Artillery Commander', avatar: '💂', bgColor: 'bg-indigo-950/40', borderColor: 'border-blue-400/60' },
      { id: 'holkar', name: 'Malharrao Holkar', title: 'Cavalry Sirdar', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
    ],
    dialogues: [
      { speakerId: 'bhau', text: "Today we decide the fate of Hindustan. The Peshwa's crown will either dominate Delhi forever, or turn to ashes. Our food is gone, our water is cut. We must win, or die on this plain.", mapHighlight: 'neutral' },
      { speakerId: 'gardi', text: "Sovereign Bhau, my disciplined Gardi infantry squares can advance step-by-step behind a wall of continuous iron shellfire. Keep your cavalry back! If our lines remain unbroken, we will tear through Najib's centre.", mapHighlight: 'artillery' },
      { speakerId: 'holkar', text: "French squares are too rigid! If Ahmad Shah's Afghan cavalry breaks through the gaps, our infantry will be slaughtered like sheep in a pen. We must let our horsemen ride free, flanking their camel gun lines!", mapHighlight: 'cavalry' },
      { speakerId: 'bhau', text: "No retreat, sirdars! The golden spear of the Peshwa leads from the center. Keep our standard erect, hold our heavy shields tight against the cold Afghan winds, and charge with the fury of Mahadev!", mapHighlight: 'defense' },
    ],
    strategies: [
      { id: 'artillery', title: "Gardi's Iron Crescent Defense", proposer: "Ibrahim Khan Gardi", icon: "💣", description: "Organizes the grand artillery crescent, pounding their ranks with continuous fire.", bonusText: "+2 Frag Bombs, +15% Artillery capability, reduces starting enemy morale" },
      { id: 'guerilla', title: "Ganimi Kava Grand Flanking", proposer: "Malharrao Holkar", icon: "🏇", description: "Dispatches Holkar's cavalry regiments to sweep around the Afghan flank to target their encampment.", bonusText: "+30 starting Morale, +2 Stamina Focus slots, increased critical damage" },
      { id: 'defense', title: "Peshwa's Crimson Ward", proposer: "Sadashivrao Bhau", icon: "🛡️", description: "Establishes a thick, double-armored shield wall surrounding the Peshwa's standard.", bonusText: "+3 Adrenaline Syringes, Armor Tier up (Tier 3), +40 starting Morale" }
    ]
  }
};

export const DURRANI_PRELUDES: Record<CampaignStage, PreludeCouncil> = {
  [CampaignStage.NIZAM_CAMPAIGN]: {
    intro: "Overlooking the rugged, rock-ribbed Kabul outposts in the Hindu Kush foothills. Ahmad Shah Durrani groups with his supreme vanguard commanders to plan the subjugation of the frontier rebels.",
    mapName: "Kabul Rebel Outposts",
    gridLabels: ["Timber Gatehouse", "Rebel Shany Hillside", "Afghan Cannon Point", "Harkara Scout Ridge"],
    generals: [
      { id: 'durrani', name: 'Ahmad Shah Durrani', title: 'Sovereign Shah', avatar: '👑', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60' },
      { id: 'jahan', name: 'Jahan Khan', title: 'Vanguard Commander', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
      { id: 'najib', name: 'Najib-ud-Daula', title: 'Rohilla Chief', avatar: '🗡️', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60' },
    ],
    dialogues: [
      { speakerId: 'durrani', text: "Emirs, these Kabuli rebels think their stony peaks will save them from our decrees. Our supply lines to Lahore must stay pristine. How shall we dismantle them?", mapHighlight: 'neutral' },
      { speakerId: 'jahan', text: "Your Majesty, their gatehouse is built of thick mountain pine. Grant me the vanguard! Our light horse can execute rapid dashes through the ravines to catch them by surprise.", mapHighlight: 'cavalry' },
      { speakerId: 'durrani', text: "No, the paths are narrow, Jahan. We shall roll up our massive brass siege artillery. Let our guns pulverize their wooden gatehouse to dust before any soldier climbs the hill.", mapHighlight: 'artillery' },
      { speakerId: 'najib', text: "Sovereign, we can also starve them out by blockading the lower river pass, keeping our vanguard protected by heavy steel shields to minimize losses.", mapHighlight: 'defense' },
    ],
    strategies: [
      { id: 'artillery', title: "Sher-Dahan Cannonade", proposer: "Ahmad Shah Durrani", icon: "💣", description: "Wheel up massive imperial brass cannons to pound the timber barricades.", bonusText: "+1 Frag Bomb, starts with rebel gate weakened (Integrity starts at 80%)" },
      { id: 'guerilla', title: "Vanguard Ravine Sweep", proposer: "Jahan Khan", icon: "🏇", description: "Leads a speed-assault through mountain clefts to blind-side the lookout posts.", bonusText: "+20 starting Morale, +2 Stamina Focus slots" },
      { id: 'defense', title: "Iron Foothills Blockade", proposer: "Najib-ud-Daula", icon: "🛡️", description: "Sets up tight barricade shields surrounding the foothills to choke the garrison.", bonusText: "+1 Adrenaline Syringe, upgraded starting shield level (Armor Tier 3)" }
    ]
  },
  [CampaignStage.PUNE]: {
    intro: "Inside the grand, gold-domed stone council chamber of Kandahar. Ahmad Shah Durrani reviews his elite Pashtun and Afghan Royal guards before crossing the Indus river.",
    mapName: "Kandahar Drill Squares",
    gridLabels: ["Royal Mosque Gate", "Cavalry Quadrant", "Zamburak Camel Line", "Shah's Viewing Canopy"],
    generals: [
      { id: 'durrani', name: 'Ahmad Shah Durrani', title: 'Sovereign Shah', avatar: '👑', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60' },
      { id: 'wali', name: 'Shah Wali Khan', title: 'Grand Wazir', avatar: '📖', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60' },
      { id: 'jahan', name: 'Jahan Khan', title: 'Vanguard Commander', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
    ],
    dialogues: [
      { speakerId: 'durrani', text: "The warm southern plains lay before us, but Maratha artillery is formidable. We must ensure our royal divisions are trained to hold absolute discipline under fire.", mapHighlight: 'neutral' },
      { speakerId: 'wali', text: "Of course Shah. Keeping our caravan security tight is paramount. Let us drill our camel swivel (Zamburak) gunners to hold standard defensive posture.", mapHighlight: 'defense' },
      { speakerId: 'jahan', text: "The cavalry is our true hammer, Shah! We must practice fast skirmish sprints to ensure our horsemen can out-maneuver the Maratha Mawalas in open spaces.", mapHighlight: 'cavalry' },
    ],
    strategies: [
      { id: 'defense', title: "Royal Shield Discipline", proposer: "Shah Wali Khan", icon: "🛡️", description: "Focuses on holding tight armor posture against simulated cavalry drills.", bonusText: "+30 starting Morale, +1 Adrenaline Syringe" },
      { id: 'guerilla', title: "Pashtun Skirmish Drills", proposer: "Jahan Khan", icon: "🏇", description: "Agility and speed drills to maximize lung stamina and focus.", bonusText: "+2 Starting Stamina Focus slots, +20 starting Morale" },
      { id: 'artillery', title: "Zamburak Fire Mastery", proposer: "Ahmad Shah Durrani", icon: "💣", description: "Hones the firing speed of camel swivel-gun columns under realistic pressures.", bonusText: "+1 Frag Bomb, +15% Artillery/Camel Gun speed" }
    ]
  },
  [CampaignStage.BURHANPUR]: {
    intro: "The misty plains surrounding Lahore. The Maratha-Sikh garrison has established spear walls blocking the Afghan advance. Pathan horsemen group to decide their attack plan.",
    mapName: "Lahore Garrison Outskirts",
    gridLabels: ["Maratha Spear Line", "Lahore Citadel Gates", "Afghan vanguard camp", "River Ravi Shallows"],
    generals: [
      { id: 'durrani', name: 'Ahmad Shah Durrani', title: 'Sovereign Shah', avatar: '👑', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60' },
      { id: 'jahan', name: 'Jahan Khan', title: 'Vanguard Commander', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
      { id: 'najib', name: 'Najib-ud-Daula', title: 'Rohilla Chief', avatar: '🗡️', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60' },
    ],
    dialogues: [
      { speakerId: 'durrani', text: "Lahore must fall to open the road to Delhi. Sabaji Shinde has dug in deep with Sikh allies. What is our strategy?", mapHighlight: 'neutral' },
      { speakerId: 'jahan', text: "My Shah, their spear-walls are thick but static. Let my elite light riders flank them from the Ravi riverside, sweeping them from behind!", mapHighlight: 'cavalry' },
      { speakerId: 'najib', text: "A head-on charge will make us blood logs. Let us use heavy matchlock skirmishing to break their rows first, keeping our elite shield units in reserve.", mapHighlight: 'defense' },
    ],
    strategies: [
      { id: 'guerilla', title: "Lahore River Flanking", proposer: "Jahan Khan", icon: "🏇", description: "Fierce flanking sweeps to bypass spear walls completely.", bonusText: "+25 Starting Morale, +20% Critical hit chance" },
      { id: 'artillery', title: "Zamburak Battery Suppress", proposer: "Ahmad Shah Durrani", icon: "💣", description: "Unleashes heavy camel-swivel gun fire to shatter the frontline spear formations.", bonusText: "+1 Frag Bomb, reduces enemy starting morale by 15%" },
      { id: 'defense', title: "Pashtun Shield-Wall March", proposer: "Najib-ud-Daula", icon: "🛡️", description: "Slow, double-strength defensive shield wall march to cushion active fire.", bonusText: "+2 Adrenaline Syringes, Armor Tier up (Tier 3)" }
    ]
  },
  [CampaignStage.GWALIOR]: {
    intro: "At the foothills of the Rohilkhand. Rohilla chief Najib-ud-Daula's rear columns are besieged by stubborn regional rebels who have fortified a hilly supply depot.",
    mapName: "Rohilla Pact foothill Gates",
    gridLabels: ["Hill Gatehouse", "Rebel Archers Ridge", "Afghan Base camp", "Wooded Ravine Path"],
    generals: [
      { id: 'najib', name: 'Najib-ud-Daula', title: 'Rohilla Chief', avatar: '🗡️', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60' },
      { id: 'jahan', name: 'Jahan Khan', title: 'Vanguard Commander', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
      { id: 'durrani', name: 'Ahmad Shah Durrani', title: 'Sovereign Shah', avatar: '👑', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60' },
    ],
    dialogues: [
      { speakerId: 'najib', text: "Sovereign, my homelands are being picketed by native rebels. If they choke this supply post, our main host will have zero bread to chew in the north.", mapHighlight: 'neutral' },
      { speakerId: 'jahan', text: "Let us throw a massive smoke screen across the hillside and deploy Ghazi swordsmen to infiltrate their defensive arches under shadow!", mapHighlight: 'defense' },
      { speakerId: 'durrani', text: "Infiltration takes too long, Jahan. We shall roll up our royal Afghan mortar pieces and blow their gatehouse into wood charcoal.", mapHighlight: 'artillery' },
    ],
    strategies: [
      { id: 'artillery', title: "Royal Mortar Bombardment", proposer: "Ahmad Shah Durrani", icon: "💣", description: "Wheel up heavy field artillery pieces to pound the foothill defenses.", bonusText: "+1 Frag Bomb, Fort Gate integrity reduced (starts at 75%)" },
      { id: 'defense', title: "Soot-Smoke Cover Sweep", proposer: "Jahan Khan", icon: "💨", description: "Blinds rebel hillside archers with large black smoke screens.", bonusText: "+2 Adrenaline Syringes, starts with smoke active" },
      { id: 'guerilla', title: "Ghazi Peak Infiltration", proposer: "Najib-ud-Daula", icon: "🧗", description: "Infiltrates rebels under shadow through high mountain gorges, bypassing defenses.", bonusText: "+2 Starting Stamina Focus slots, +30 starting Morale" }
    ]
  },
  [CampaignStage.DELHI_NEGOTIATIONS]: {
    intro: "Overlooking the Awadh hills. Ahmad Shah Durrani and Rohilla Chief Najib-ud-Daula convene to sway the crucial Nawab Shuja-ud-Daula into the imperial coalition, aiming to storm the mercenary camps guarding his river crossing.",
    mapName: "Awadh Border Palisade outpost",
    gridLabels: ["Mercenary Palisade", "River Crossing point", "Awadh Royal Guard Camp", "Afghan Vanguard Battery"],
    generals: [
      { id: 'najib', name: 'Najib-ud-Daula', title: 'Rohilla Chief', avatar: '🗡️', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60' },
      { id: 'durrani', name: 'Ahmad Shah Durrani', title: 'Sovereign Shah', avatar: '👑', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60' },
      { id: 'wali', name: 'Shah Wali Khan', title: 'Grand Wazir', avatar: '📖', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60' },
    ],
    dialogues: [
      { speakerId: 'najib', text: "Nawab Shuja-ud-Daula watches our resolve. If we dismantle these Maratha-sponsored mercenary saboteurs swiftly, he will immediately sign our Pact.", mapHighlight: 'neutral' },
      { speakerId: 'durrani', text: "I want their wooden palisades pulverized to timber dust under our heavy cannon shells. Direct firepower is our ultimate voice of power.", mapHighlight: 'artillery' },
      { speakerId: 'wali', text: "Let us guarantee Shuja's grain routes stay stable. Hold the river-perimeters with solid shield fortifications to protect their trading scouts.", mapHighlight: 'defense' },
    ],
    strategies: [
      { id: 'artillery', title: "Imperial Gates Shrapnel", proposer: "Ahmad Shah Durrani", icon: "💣", description: "Pounds the timber palisade gate with constant explosive shells.", bonusText: "+1 Frag Bomb, Fort Gate integrity reduced (starts at 70%)" },
      { id: 'guerilla', title: "Rohilla Ambush Squad", proposer: "Najib-ud-Daula", icon: "🏇", description: "Surprises the saboteurs' outriders with rapid forest flank maneuvers.", bonusText: "+20 starting Morale, +2 Stamina Focus slots" },
      { id: 'defense', title: "Sovereign Highway Safeguard", proposer: "Shah Wali Khan", icon: "🛡️", description: "Deploys defensive lines to protect Nawab diplomatic convoys.", bonusText: "+2 Adrenaline Syringes, starting with armor upgrade (Tier 3)" }
    ]
  },
  [CampaignStage.SHINDE_STAND]: {
    intro: "Ahmad Shah's vanguard has reached Dadi Ghat. The Yamuna is freezing, but Scindia's scouting patrols are isolated on the other bank. The Shah orders an immediate aggressive crossing.",
    mapName: "Dadi Ghat Frozen Crossing",
    gridLabels: ["Yamuna Mud Sands", "Maratha Scouting Lines", "Durrani Crossing Cavalry", "Afghan Camel Artillery"],
    generals: [
      { id: 'jahan', name: 'Jahan Khan', title: 'Vanguard Commander', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
      { id: 'durrani', name: 'Ahmad Shah Durrani', title: 'Sovereign Shah', avatar: '👑', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60' },
      { id: 'najib', name: 'Najib-ud-Daula', title: 'Rohilla Chief', avatar: '🗡️', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60' },
    ],
    dialogues: [
      { speakerId: 'jahan', text: "The river mist is thick, but Dattaji's scouts are completely isolated! If we cross now, we can trample their vanguard in the riverbeds before they can retreat.", mapHighlight: 'cavalry' },
      { speakerId: 'durrani', text: "Yes, Jahan! Let our vanguard camel swivel gunners establish high positions on the muddy shoals to shred their ranks from across the water.", mapHighlight: 'artillery' },
      { speakerId: 'najib', text: "Dattaji Shinde fights with suicidal bravado, Shah. If we charge blindly, they will take scores of our men with them. We must cross under tight defensive shield covers.", mapHighlight: 'defense' },
    ],
    strategies: [
      { id: 'guerilla', title: "E ncircle the Riverbed", proposer: "Jahan Khan", icon: "🏇", description: "Flanks the muddy shoals to trap Dattaji's small vanguard in a tight crescent.", bonusText: "+25 starting Morale, +20% Critical damage on strike" },
      { id: 'artillery', title: "Zamburak Riverbed Suppress", proposer: "Ahmad Shah Durrani", icon: "💣", description: "Sets up high zamburak columns to lay iron fire over the sandy crossing lines.", bonusText: "+1 Frag Bomb, starting enemy morale reduced by 15%" },
      { id: 'defense', title: "Steel Pashtun Shield Crossing", proposer: "Najib-ud-Daula", icon: "🛡️", description: "Crosses under a robust heavy shield cover to deflect Scindia's desesperate charges.", bonusText: "+2 Adrenaline Syringes, starting Armor Tier up (Tier 3)" }
    ]
  },
  [CampaignStage.DELHI_BATTLE]: {
    intro: "On the plains near Kunjpura, intercepting the Maratha forces returning from their northern victory. The Shah and his Emirs plan to trap and destroy the returning vanguard column.",
    mapName: "Frontier plains of Delhi-Kunjpura",
    gridLabels: ["Maratha Column vanguard", "Afghan vanguard Left", "Kunjpura Garrison Lines", "Yamuna patrol Choke"],
    generals: [
      { id: 'durrani', name: 'Ahmad Shah Durrani', title: 'Sovereign Shah', avatar: '👑', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60' },
      { id: 'jahan', name: 'Jahan Khan', title: 'Vanguard Commander', avatar: '🏇', bgColor: 'bg-stone-900/40', borderColor: 'border-stone-500/60' },
      { id: 'najib', name: 'Najib-ud-Daula', title: 'Rohilla Chief', avatar: '🗡️', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60' },
    ],
    dialogues: [
      { speakerId: 'durrani', text: "The Marathas have sacked Kunjpura. They are returning loaded with spoils but exhausted. This is our moment to sever their vanguard column on the plains.", mapHighlight: 'neutral' },
      { speakerId: 'jahan', text: "Sovereign, let my heavy cavalry execute a direct lance charge to shatter their matchlock squad's ranks before they can consolidate into defensive squares!", mapHighlight: 'cavalry' },
      { speakerId: 'najib', text: "Quiet, Jahan. Their French Gardi guns are nearby. We must draw their horsemen out under the fire of our camel swivels while keeping our infantry behind tight steel shields.", mapHighlight: 'defense' },
    ],
    strategies: [
      { id: 'guerilla', title: "Frontier Cavalry lance charge", proposer: "Jahan Khan", icon: "🏇", description: "Rapid, devastating heavy lance charge into the returning vanguard flank.", bonusText: "+25 starting Morale, +2 Stamina Focus slots" },
      { id: 'artillery', title: "Lure to Zamburak Fire", proposer: "Ahmad Shah Durrani", icon: "💣", description: "Fakes a retreat to draw their cavalry under the direct sight of our camel batteries.", bonusText: "+1 Frag Bomb, active enemy starts weakened with morale -15%" },
      { id: 'defense', title: "E ver-Solid Iron Perimeter", proposer: "Najib-ud-Daula", icon: "🛡️", description: "Presents a massive shield wall to absorb Gardi's initial defensive matchlock fire.", bonusText: "+2 Adrenaline Syringes, improved starting shield (Armor Tier 3)" }
    ]
  },
  [CampaignStage.PANIPAT]: {
    intro: "The freezing dawn of January 14, 1761, on the plains of Panipat. Ahmad Shah Durrani sits on his charger, overlooking the massive lines of the Maratha Empire. The supreme battle has arrived.",
    mapName: "Plains of Panipat (Afghan Side)",
    gridLabels: ["Grand Durrani Center", "Shah's Imperial Reserves", "Najib's Rohillas Left", "Gardi Cannon Lines Opponent"],
    generals: [
      { id: 'durrani', name: 'Ahmad Shah Durrani', title: 'Sovereign Shah', avatar: '👑', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-500/60' },
      { id: 'najib', name: 'Najib-ud-Daula', title: 'Rohilla Chief', avatar: '🗡️', bgColor: 'bg-red-950/40', borderColor: 'border-red-500/60' },
      { id: 'wali', name: 'Shah Wali Khan', title: 'Grand Wazir', avatar: '📖', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-500/60' },
    ],
    dialogues: [
      { speakerId: 'durrani', text: "My brave Emirs, the Peshwa's entire power is arrayed before us. The saffron standard must fall today. This freezing wind will bear our triumphs, or our graves.", mapHighlight: 'neutral' },
      { speakerId: 'najib', text: "Your Majesty, Ibrahim Khan Gardi's French infantry squares are impenetrable. If our cavalry charges them head-on, they will be shredded. We must use our mobile camel zamburaks to harass and break their squares first!", mapHighlight: 'artillery' },
      { speakerId: 'wali', text: "Sovereign, my central Grand Wazir divisions shall stand firm like iron mountains. Let us absorb their suicide saffron charges, exhausting them while we preserve our elite reserves under shield.", mapHighlight: 'defense' },
      { speakerId: 'durrani', text: "Commanders, let us unleash our camel swivels from the center and have Jahan Khan lead a rapid flanking cavalry sweep to cut off Bhau's command line!", mapHighlight: 'cavalry' },
    ],
    strategies: [
      { id: 'artillery', title: "Zamburak Swivel barrage", proposer: "Najib-ud-Daula", icon: "💣", description: "Positions all camel-mounted swivel guns in the center to rip Gardi's squares.", bonusText: "+2 Frag Bombs, +15% Artillery capability, reduces starting enemy morale" },
      { id: 'guerilla', title: "Grand Afghan Flanking", proposer: "Jahan Khan", icon: "🏇", description: "Leads a swift heavy cavalry flank sweep to strike Bhau's command standard from behind.", bonusText: "+30 starting Morale, +2 Stamina Focus slots, increased critical damage" },
      { id: 'defense', title: "Grand Wazir's Iron Hold", proposer: "Shah Wali Khan", icon: "🛡️", description: "Deploys elite guards behind double steel shields to absorb the Maratha suicide charge.", bonusText: "+3 Adrenaline Syringes, Armor Tier up (Tier 3), +40 starting Morale" }
    ]
  }
};
