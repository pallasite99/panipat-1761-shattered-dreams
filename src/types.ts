/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Screen {
  MAIN_MENU = 'MAIN_MENU',
  STRATEGIC_MAP = 'STRATEGIC_MAP',
  TACTICAL_HUD = 'TACTICAL_HUD',
  WAR_COUNCIL = 'WAR_COUNCIL',
  LOGISTICS = 'LOGISTICS',
  COMMANDER_DEV = 'COMMANDER_DEV',
  TREASURY = 'TREASURY',
  VICTORY = 'VICTORY',
  BATTLE = 'BATTLE',
  ENCYCLOPEDIA = 'ENCYCLOPEDIA',
  TIMELINE = 'TIMELINE',
  LMS = 'LMS',
  CARTOGRAPHY = 'CARTOGRAPHY',
  LEARNING_HUB = 'LEARNING_HUB',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
}

export enum CampaignStage {
  NIZAM_CAMPAIGN = 'NIZAM_CAMPAIGN',
  PUNE = 'PUNE',
  BURHANPUR = 'BURHANPUR',
  GWALIOR = 'GWALIOR',
  DELHI_NEGOTIATIONS = 'DELHI_NEGOTIATIONS',
  SHINDE_STAND = 'SHINDE_STAND',
  DELHI_BATTLE = 'DELHI_BATTLE',
  PANIPAT = 'PANIPAT',
}

export interface BattleProps {
  onNavigate: (s: Screen) => void;
  onAdvance: () => void;
  stage: CampaignStage;
  onHelp?: () => void;
  onSettings?: () => void;
  onShowBattleLog?: () => void;
}

export interface Unit {
  id: string;
  name: string;
  type: 'Infantry' | 'Cavalry' | 'Artillery';
  strength: number;
  maxStrength: number;
  ammunition?: number;
  stamina?: number;
  image: string;
  description: string;
}
export interface Faction {
  id: string;
  name: string;
  relation: 'Neutral' | 'Hostile' | 'Wary' | 'Allied';
  trust: number;
  leader: string;
  description: string;
}

export interface General {
  id: string;
  name: string;
  faction: 'maratha' | 'durrani';
  bio: string;
  bonus: string;
}
