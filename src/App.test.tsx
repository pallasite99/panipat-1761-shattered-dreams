import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { Screen, CampaignStage } from './types';
import { panipatAudioEngine } from './utils/audioSystem';

// 🎭 Mock out all heavyweight screen and overlay components to isolate App.tsx state transitions
vi.mock('./screens/MainMenu', () => ({
  MainMenu: ({ onNavigate }: any) => (
    <div data-testid="screen-main-menu">
      <button onClick={() => onNavigate(Screen.STRATEGIC_MAP)}>Go to Strategic Map</button>
    </div>
  ),
}));

vi.mock('./screens/StrategicMap', () => ({
  StrategicMap: ({ onAdvance, onNavigate }: any) => (
    <div data-testid="screen-strategic-map">
      <button onClick={onAdvance}>Advance Stage</button>
      <button onClick={() => onNavigate(Screen.BATTLE)}>Go to Battle</button>
    </div>
  ),
}));

vi.mock('./screens/TacticalHUD', () => ({ TacticalHUD: () => <div data-testid="screen-tactical-hud" /> }));
vi.mock('./screens/WarCouncil', () => ({ WarCouncil: () => <div data-testid="screen-war-council" /> }));
vi.mock('./screens/Logistics', () => ({ Logistics: () => <div data-testid="screen-logistics" /> }));
vi.mock('./screens/CommanderDev', () => ({ CommanderDev: () => <div data-testid="screen-commander-dev" /> }));
vi.mock('./screens/Treasury', () => ({ Treasury: () => <div data-testid="screen-treasury" /> }));
vi.mock('./screens/Victory', () => ({ Victory: () => <div data-testid="screen-victory" /> }));
vi.mock('./screens/BattleScene', () => ({ BattleScene: () => <div data-testid="screen-battle-scene" /> }));
vi.mock('./screens/Encyclopedia', () => ({ Encyclopedia: () => <div data-testid="screen-encyclopedia" /> }));
vi.mock('./screens/Timeline', () => ({ Timeline: () => <div data-testid="screen-timeline" /> }));
vi.mock('./screens/LMS', () => ({ LMS: () => <div data-testid="screen-lms" /> }));
vi.mock('./screens/Cartography', () => ({ Cartography: () => <div data-testid="screen-cartography" /> }));

vi.mock('./components/GlobalOverlays', () => ({
  HelpOverlay: () => <div data-testid="help-overlay" />,
  SettingsOverlay: () => <div data-testid="settings-overlay" />,
}));

vi.mock('./components/BattleLogOverlay', () => ({
  BattleLogOverlay: () => <div data-testid="battle-log-overlay" />,
}));

vi.mock('./components/FeedbackWidget', () => ({
  FeedbackWidget: () => <div data-testid="feedback-widget" />,
}));

vi.mock('./components/CampaignSaveLoad', () => ({
  CampaignSaveLoad: ({ onLoadSuccess }: any) => (
    <div data-testid="campaign-save-load">
      <button onClick={() => onLoadSuccess(CampaignStage.GWALIOR)}>Load Gwalior</button>
    </div>
  ),
}));

// Mock Audio Engine to inspect calls
vi.spyOn(panipatAudioEngine, 'setScene');
vi.spyOn(panipatAudioEngine, 'init');

describe('App Game State and Campaign Stage Management', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the Main Menu by default', () => {
    render(<App />);
    expect(screen.getByTestId('screen-main-menu')).toBeDefined();
    expect(panipatAudioEngine.setScene).toHaveBeenCalledWith('menu');
  });

  it('should navigate to Strategic Map and trigger audio scene transitions', () => {
    render(<App />);
    const navBtn = screen.getByText('Go to Strategic Map');
    fireEvent.click(navBtn);

    expect(screen.getByTestId('screen-strategic-map')).toBeDefined();
    expect(panipatAudioEngine.init).toHaveBeenCalled();
    expect(panipatAudioEngine.setScene).toHaveBeenCalledWith('campaign');
  });

  it('should advance the campaign stage correctly', () => {
    render(<App />);
    
    // Set initial stage to Nizam
    localStorage.setItem('panipat_campaign_stage', CampaignStage.NIZAM_CAMPAIGN);

    // Navigate to Strategic Map
    fireEvent.click(screen.getByText('Go to Strategic Map'));

    // Verify stage persisted to localStorage
    expect(localStorage.getItem('panipat_campaign_stage')).toBe(CampaignStage.NIZAM_CAMPAIGN);

    // Trigger Advance Stage
    const advanceBtn = screen.getByText('Advance Stage');
    fireEvent.click(advanceBtn);

    // Nizam Campaign should advance to PUNE
    expect(localStorage.getItem('panipat_campaign_stage')).toBe(CampaignStage.PUNE);
  });

  it('should load a campaign stage and navigate from the SaveLoad component', () => {
    render(<App />);

    // Click load button from mocked save-load
    const loadBtn = screen.getByText('Load Gwalior');
    fireEvent.click(loadBtn);

    // Verify campaign stage is updated and screen changes to Strategic Map
    expect(localStorage.getItem('panipat_campaign_stage')).toBe(CampaignStage.GWALIOR);
    expect(screen.getByTestId('screen-strategic-map')).toBeDefined();
  });
});
