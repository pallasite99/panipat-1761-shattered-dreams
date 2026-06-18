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
  
  let recruitedTroops: string[] = [];
  try {
    const rawTroops = localStorage.getItem('panipat_campaign_recruited_troops');
    recruitedTroops = rawTroops ? JSON.parse(rawTroops) : [];
  } catch (e) {
    recruitedTroops = [];
  }
  
  const drillLevel = Number(localStorage.getItem('panipat_campaign_drill_level') || '1');

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
    drillLevel
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
  
  // Set clears for current stage in Strategic Map
  localStorage.setItem(`cleared_council_${save.stage}`, 'true');
  localStorage.setItem(`cleared_logistics_${save.stage}`, 'true');
  localStorage.setItem(`cleared_treasury_${save.stage}`, 'true');
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
