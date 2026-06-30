import { describe, it, expect, beforeEach } from 'vitest';
import { getSavedCampaigns, saveCampaignToSlot, loadCampaignFromSlot, deleteCampaignSlot, CampaignSave } from './saveSystem';
import { CampaignStage } from '../types';

describe('Save and Load Serialization System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array if no games are saved', () => {
    const saves = getSavedCampaigns();
    expect(saves).toEqual([]);
  });

  it('should save a campaign to slot successfully', () => {
    // Seed some mock current game state in localStorage
    localStorage.setItem('panipat_campaign_faction', 'maratha');
    localStorage.setItem('panipat_campaign_stage', CampaignStage.PUNE);
    localStorage.setItem('panipat_campaign_treasury', '150000');
    localStorage.setItem('panipat_campaign_provisions', '1200');
    localStorage.setItem('panipat_campaign_morale', '85');
    localStorage.setItem('panipat_campaign_general', 'gardi');
    localStorage.setItem('panipat_campaign_general_name', 'Ibrahim Khan Gardi');
    localStorage.setItem('panipat_campaign_recruited_troops', JSON.stringify(['Gardi Infantry', 'Huzurat Elite']));
    localStorage.setItem('panipat_campaign_drill_level', '3');

    const saved = saveCampaignToSlot('Test Slot 1', 'save_test_123');

    expect(saved.id).toBe('save_test_123');
    expect(saved.name).toBe('Test Slot 1');
    expect(saved.faction).toBe('maratha');
    expect(saved.stage).toBe(CampaignStage.PUNE);
    expect(saved.treasury).toBe(150000);
    expect(saved.provisions).toBe(1200);
    expect(saved.morale).toBe(85);
    expect(saved.general).toBe('gardi');
    expect(saved.generalName).toBe('Ibrahim Khan Gardi');
    expect(saved.recruitedTroops).toEqual(['Gardi Infantry', 'Huzurat Elite']);
    expect(saved.drillLevel).toBe(3);

    // Assert it exists in saved lists
    const savesList = getSavedCampaigns();
    expect(savesList).toHaveLength(1);
    expect(savesList[0].id).toBe('save_test_123');
  });

  it('should overwrite existing save slot with identical id', () => {
    localStorage.setItem('panipat_campaign_treasury', '100000');
    saveCampaignToSlot('Slot A', 'save_1');

    localStorage.setItem('panipat_campaign_treasury', '200000');
    saveCampaignToSlot('Slot A Updated', 'save_1');

    const list = getSavedCampaigns();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Slot A Updated');
    expect(list[0].treasury).toBe(200000);
  });

  it('should restore state perfectly when loading a slot', () => {
    const mockSave: CampaignSave = {
      id: 'save_99',
      name: 'Scholar Playthrough',
      date: '2026-06-30',
      faction: 'durrani',
      stage: CampaignStage.PANIPAT,
      treasury: 90000,
      provisions: 800,
      morale: 60,
      general: 'abdali',
      generalName: 'Ahmad Shah Abdali',
      recruitedTroops: ['Rohilla Militia', 'Camel Swivel Guns'],
      drillLevel: 2
    };

    loadCampaignFromSlot(mockSave);

    expect(localStorage.getItem('panipat_campaign_faction')).toBe('durrani');
    expect(localStorage.getItem('panipat_campaign_stage')).toBe(CampaignStage.PANIPAT);
    expect(localStorage.getItem('panipat_campaign_treasury')).toBe('90000');
    expect(localStorage.getItem('panipat_campaign_provisions')).toBe('800');
    expect(localStorage.getItem('panipat_campaign_morale')).toBe('60');
    expect(localStorage.getItem('panipat_campaign_general')).toBe('abdali');
    expect(localStorage.getItem('panipat_campaign_general_name')).toBe('Ahmad Shah Abdali');
    expect(JSON.parse(localStorage.getItem('panipat_campaign_recruited_troops') || '[]')).toEqual(['Rohilla Militia', 'Camel Swivel Guns']);
    expect(localStorage.getItem('panipat_campaign_drill_level')).toBe('2');

    // Should also mark standard screens cleared for the stage
    expect(localStorage.getItem(`cleared_council_${CampaignStage.PANIPAT}`)).toBe('true');
  });

  it('should successfully delete a save game slot', () => {
    localStorage.setItem('panipat_campaign_treasury', '5000');
    saveCampaignToSlot('Slot 1', 's1');
    saveCampaignToSlot('Slot 2', 's2');

    expect(getSavedCampaigns()).toHaveLength(2);

    deleteCampaignSlot('s1');

    const finalSaves = getSavedCampaigns();
    expect(finalSaves).toHaveLength(1);
    expect(finalSaves[0].id).toBe('s2');
  });
});
