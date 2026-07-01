/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Screen, CampaignStage } from './types';
import { MainMenu } from './screens/MainMenu';
import { StrategicMap } from './screens/StrategicMap';
import { TacticalHUD } from './screens/TacticalHUD';
import { WarCouncil } from './screens/WarCouncil';
import { Logistics } from './screens/Logistics';
import { CommanderDev } from './screens/CommanderDev';
import { Treasury } from './screens/Treasury';
import { Victory } from './screens/Victory';
import { BattleScene } from './screens/BattleScene';
import { Encyclopedia } from './screens/Encyclopedia';
import { Timeline } from './screens/Timeline';
import { LMS } from './screens/LMS';
import { Cartography } from './screens/Cartography';
import { HelpOverlay, SettingsOverlay } from './components/GlobalOverlays';
import { BattleLogOverlay } from './components/BattleLogOverlay';
import { FeedbackWidget } from './components/FeedbackWidget';
import { panipatAudioEngine } from './utils/audioSystem';
import { CampaignSaveLoad } from './components/CampaignSaveLoad';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.MAIN_MENU);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [campaignStage, setCampaignStage] = useState<CampaignStage>(() => {
    return (localStorage.getItem('panipat_campaign_stage') as CampaignStage) || CampaignStage.NIZAM_CAMPAIGN;
  });
  const [audioStarted, setAudioStarted] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBattleLogOpen, setIsBattleLogOpen] = useState(false);
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('panipat_campaign_stage', campaignStage);
  }, [campaignStage]);

  React.useEffect(() => {
    if (currentScreen === Screen.BATTLE) {
      panipatAudioEngine.setScene('battle');
    } else if (currentScreen === Screen.MAIN_MENU) {
      panipatAudioEngine.setScene('menu');
    } else {
      panipatAudioEngine.setScene('campaign');
    }
  }, [currentScreen]);

  const startAudio = () => {
    if (!audioStarted) {
      panipatAudioEngine.init();
      setAudioStarted(true);
    }
  };

  const handleNavigate = (screen: Screen) => {
    startAudio();
    setCurrentScreen(screen);
    setIsMenuOpen(false); // Close menu on navigation
  };

  const handleAdvanceCampaign = () => {
    const stages = Object.values(CampaignStage);
    const currentIndex = stages.indexOf(campaignStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      setCampaignStage(nextStage);

      // Define resource adjustments for advancing to each stage
      const STAGE_TRANSITIONS: Record<string, { manpower: number; provisions: number; gold: number }> = {
        [CampaignStage.PUNE]: { manpower: 12000, provisions: 300, gold: 80000 },
        [CampaignStage.BURHANPUR]: { manpower: 5000, provisions: -400, gold: -30000 },
        [CampaignStage.GWALIOR]: { manpower: 8000, provisions: -300, gold: 40000 },
        [CampaignStage.DELHI_NEGOTIATIONS]: { manpower: 6000, provisions: -200, gold: -25000 },
        [CampaignStage.SHINDE_STAND]: { manpower: -5000, provisions: -300, gold: -15000 },
        [CampaignStage.DELHI_BATTLE]: { manpower: -4000, provisions: 800, gold: 50000 },
        [CampaignStage.PANIPAT]: { manpower: -10000, provisions: -800, gold: -20000 },
      };

      const change = STAGE_TRANSITIONS[nextStage];
      if (change) {
        const currentGold = Number(localStorage.getItem("panipat_campaign_treasury") || "145000");
        const currentProvisions = Number(localStorage.getItem("panipat_campaign_provisions") || "1400");
        const currentManpower = Number(localStorage.getItem("panipat_campaign_manpower") || "45000");

        localStorage.setItem("panipat_campaign_treasury", Math.max(0, currentGold + change.gold).toString());
        localStorage.setItem("panipat_campaign_provisions", Math.max(0, currentProvisions + change.provisions).toString());
        localStorage.setItem("panipat_campaign_manpower", Math.max(0, currentManpower + change.manpower).toString());
      }
    }
  };

  const renderScreen = () => {
    const commonProps = {
      onHelp: () => setIsHelpOpen(true),
      onSettings: () => setIsSettingsOpen(true),
      onShowBattleLog: () => setIsBattleLogOpen(true),
      onSaveLoad: () => setIsSaveLoadOpen(true),
    };

    switch (currentScreen) {
      case Screen.MAIN_MENU:
        return <MainMenu onNavigate={handleNavigate} setCampaignStage={setCampaignStage} {...commonProps} />;
      case Screen.STRATEGIC_MAP:
        return (
          <StrategicMap 
            onNavigate={handleNavigate} 
            isMenuOpen={isMenuOpen} 
            onToggleMenu={() => setIsMenuOpen(true)} 
            onMenuClose={() => setIsMenuOpen(false)} 
            campaignStage={campaignStage}
            onAdvance={handleAdvanceCampaign}
            {...commonProps}
          />
        );
      case Screen.TACTICAL_HUD:
        return <TacticalHUD onNavigate={handleNavigate} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(true)} onMenuClose={() => setIsMenuOpen(false)} {...commonProps} />;
      case Screen.WAR_COUNCIL:
        return <WarCouncil onNavigate={handleNavigate} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(true)} onMenuClose={() => setIsMenuOpen(false)} {...commonProps} />;
      case Screen.LOGISTICS:
        return <Logistics onNavigate={handleNavigate} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(true)} onMenuClose={() => setIsMenuOpen(false)} {...commonProps} />;
      case Screen.COMMANDER_DEV:
        return <CommanderDev onNavigate={handleNavigate} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(true)} onMenuClose={() => setIsMenuOpen(false)} {...commonProps} />;
      case Screen.TREASURY:
        return <Treasury onNavigate={handleNavigate} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(true)} onMenuClose={() => setIsMenuOpen(false)} {...commonProps} />;
      case Screen.VICTORY:
        return <Victory onNavigate={handleNavigate} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(true)} onMenuClose={() => setIsMenuOpen(false)} {...commonProps} />;
      case Screen.BATTLE:
        return <BattleScene onNavigate={handleNavigate} onAdvance={handleAdvanceCampaign} stage={campaignStage} {...commonProps} />;
      case Screen.ENCYCLOPEDIA:
        return <Encyclopedia onNavigate={handleNavigate} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(true)} onMenuClose={() => setIsMenuOpen(false)} {...commonProps} />;
      case Screen.TIMELINE:
        return (
          <Timeline 
            onNavigate={handleNavigate} 
            isMenuOpen={isMenuOpen} 
            onToggleMenu={() => setIsMenuOpen(true)} 
            onMenuClose={() => setIsMenuOpen(false)} 
            campaignStage={campaignStage}
            {...commonProps}
          />
        );
      case Screen.LMS:
        return <LMS onNavigate={handleNavigate} {...commonProps} />;
      case Screen.CARTOGRAPHY:
        return <Cartography onNavigate={handleNavigate} {...commonProps} />;
      default:
        return <MainMenu onNavigate={handleNavigate} {...commonProps} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-stone-950 overflow-hidden text-stone-200 antialiased font-sans">
      {renderScreen()}
      <HelpOverlay isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <BattleLogOverlay isOpen={isBattleLogOpen} onClose={() => setIsBattleLogOpen(false)} campaignStage={campaignStage} />
      <CampaignSaveLoad 
        isOpen={isSaveLoadOpen} 
        onClose={() => setIsSaveLoadOpen(false)} 
        onLoadSuccess={(loadedStage) => {
          setCampaignStage(loadedStage);
          handleNavigate(Screen.STRATEGIC_MAP);
        }}
        allowSave={currentScreen !== Screen.MAIN_MENU}
      />
      <FeedbackWidget currentScreen={currentScreen} />
    </div>
  );
}

