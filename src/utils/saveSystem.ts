import { CampaignStage } from '../types';

export interface CampaignSave {
  id: string;
  name: string;
  date: string;
  faction: 'maratha' | 'durrani';
  stage: CampaignStage;
  treasury: number;
  provisions: number;
  morale: number;
  general: string;
  generalName: string;
  recruitedTroops: string[];
  drillLevel: number;
  manpower?: number;
  factions?: string;
  factionsLog?: string;
  scenarios?: string;
  scenConsequences?: string;
  diplomacyTrust?: string;
  diplomacyChats?: string;
  diplomacyRewards?: string;
  powderBarrels?: number;
  silverBullion?: number;
  rationsStance?: string;
  clearedStatuses?: string;
}

const STORAGE_KEY = 'panipat_campaign_saves_slots';

export const getSavedCampaigns = (): CampaignSave[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error parsing save games:', e);
    return [];
  }
};

export const saveCampaignToSlot = (slotName: string, id?: string): CampaignSave => {
  const saves = getSavedCampaigns();
  
  const faction = (localStorage.getItem('panipat_campaign_faction') as any) || 'maratha';
  const stage = (localStorage.getItem('panipat_campaign_stage') as CampaignStage) || CampaignStage.NIZAM_CAMPAIGN;
  const treasury = Number(localStorage.getItem('panipat_campaign_treasury') || '145000');
  const provisions = Number(localStorage.getItem('panipat_campaign_provisions') || '1400');
  const morale = Number(localStorage.getItem('panipat_campaign_morale') || '80');
  const general = localStorage.getItem('panipat_campaign_general') || 'bhau';
  const generalName = localStorage.getItem('panipat_campaign_general_name') || 'Sadashivrao Bhau';
  const manpower = Number(localStorage.getItem('panipat_campaign_manpower') || '45000');
  
  let recruitedTroops: string[] = [];
  try {
    const rawTroops = localStorage.getItem('panipat_campaign_recruited_troops');
    recruitedTroops = rawTroops ? JSON.parse(rawTroops) : [];
  } catch (e) {
    recruitedTroops = [];
  }
  
  const drillLevel = Number(localStorage.getItem('panipat_campaign_drill_level') || '1');

  const factions = localStorage.getItem('panipat_campaign_factions') || '';
  const factionsLog = localStorage.getItem('panipat_campaign_factions_log') || '';
  const scenarios = localStorage.getItem('panipat_campaign_scenarios') || '';
  const scenConsequences = localStorage.getItem('panipat_campaign_scen_consequences') || '';
  const diplomacyTrust = localStorage.getItem('panipat_diplomacy_trust') || '';
  const diplomacyChats = localStorage.getItem('panipat_diplomacy_chats') || '';
  const diplomacyRewards = localStorage.getItem('panipat_diplomacy_rewards') || '';
  const powderBarrels = localStorage.getItem('panipat_campaign_powder_barrels') ? Number(localStorage.getItem('panipat_campaign_powder_barrels')) : undefined;
  const silverBullion = localStorage.getItem('panipat_campaign_silver_bullion') ? Number(localStorage.getItem('panipat_campaign_silver_bullion')) : undefined;
  const rationsStance = localStorage.getItem('panipat_campaign_rations_stance') || undefined;

  const clearedStatuses: Record<string, boolean> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('cleared_council_') || key.startsWith('cleared_logistics_') || key.startsWith('cleared_treasury_'))) {
      clearedStatuses[key] = localStorage.getItem(key) === 'true';
    }
  }

  const saveId = id || `save_${Date.now()}`;
  const newSave: CampaignSave = {
    id: saveId,
    name: slotName || `Campaign ${new Date().toLocaleDateString()}`,
    date: new Date().toLocaleString(),
    faction,
    stage,
    treasury,
    provisions,
    morale,
    general,
    generalName,
    recruitedTroops,
    drillLevel,
    manpower,
    factions: factions || undefined,
    factionsLog: factionsLog || undefined,
    scenarios: scenarios || undefined,
    scenConsequences: scenConsequences || undefined,
    diplomacyTrust: diplomacyTrust || undefined,
    diplomacyChats: diplomacyChats || undefined,
    diplomacyRewards: diplomacyRewards || undefined,
    powderBarrels,
    silverBullion,
    rationsStance,
    clearedStatuses: Object.keys(clearedStatuses).length > 0 ? JSON.stringify(clearedStatuses) : undefined,
  };

  const existingIndex = saves.findIndex(s => s.id === saveId);
  if (existingIndex !== -1) {
    saves[existingIndex] = newSave;
  } else {
    saves.push(newSave);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  return newSave;
};

export const loadCampaignFromSlot = (save: CampaignSave): void => {
  localStorage.setItem('panipat_campaign_faction', save.faction);
  localStorage.setItem('panipat_campaign_stage', save.stage);
  localStorage.setItem('panipat_campaign_treasury', save.treasury.toString());
  localStorage.setItem('panipat_campaign_provisions', save.provisions.toString());
  localStorage.setItem('panipat_campaign_morale', save.morale.toString());
  localStorage.setItem('panipat_campaign_general', save.general);
  localStorage.setItem('panipat_campaign_general_name', save.generalName);
  localStorage.setItem('panipat_campaign_recruited_troops', JSON.stringify(save.recruitedTroops));
  localStorage.setItem('panipat_campaign_drill_level', save.drillLevel.toString());
  localStorage.setItem('panipat_campaign_manpower', (save.manpower || 45000).toString());
  
  if (save.factions) localStorage.setItem('panipat_campaign_factions', save.factions);
  else localStorage.removeItem('panipat_campaign_factions');

  if (save.factionsLog) localStorage.setItem('panipat_campaign_factions_log', save.factionsLog);
  else localStorage.removeItem('panipat_campaign_factions_log');

  if (save.scenarios) localStorage.setItem('panipat_campaign_scenarios', save.scenarios);
  else localStorage.removeItem('panipat_campaign_scenarios');

  if (save.scenConsequences) localStorage.setItem('panipat_campaign_scen_consequences', save.scenConsequences);
  else localStorage.removeItem('panipat_campaign_scen_consequences');

  if (save.diplomacyTrust) localStorage.setItem('panipat_diplomacy_trust', save.diplomacyTrust);
  else localStorage.removeItem('panipat_diplomacy_trust');

  if (save.diplomacyChats) localStorage.setItem('panipat_diplomacy_chats', save.diplomacyChats);
  else localStorage.removeItem('panipat_diplomacy_chats');

  if (save.diplomacyRewards) localStorage.setItem('panipat_diplomacy_rewards', save.diplomacyRewards);
  else localStorage.removeItem('panipat_diplomacy_rewards');

  if (save.powderBarrels !== undefined) localStorage.setItem('panipat_campaign_powder_barrels', save.powderBarrels.toString());
  else localStorage.removeItem('panipat_campaign_powder_barrels');

  if (save.silverBullion !== undefined) localStorage.setItem('panipat_campaign_silver_bullion', save.silverBullion.toString());
  else localStorage.removeItem('panipat_campaign_silver_bullion');

  if (save.rationsStance) localStorage.setItem('panipat_campaign_rations_stance', save.rationsStance);
  else localStorage.removeItem('panipat_campaign_rations_stance');

  // Load cleared statuses
  if (save.clearedStatuses) {
    try {
      const parsed = JSON.parse(save.clearedStatuses);
      Object.keys(parsed).forEach(key => {
        localStorage.setItem(key, parsed[key] ? 'true' : 'false');
      });
    } catch (e) {
      console.error('Error loading cleared statuses:', e);
    }
  } else {
    // Fallback: set clears for current stage in Strategic Map
    localStorage.setItem(`cleared_council_${save.stage}`, 'true');
    localStorage.setItem(`cleared_logistics_${save.stage}`, 'true');
    localStorage.setItem(`cleared_treasury_${save.stage}`, 'true');
  }
};

export const deleteCampaignSlot = (id: string): void => {
  const saves = getSavedCampaigns();
  const filtered = saves.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const exportSaveToFile = (save: CampaignSave): void => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(save, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `panipat_1761_save_${save.name.replace(/\s+/g, '_')}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
