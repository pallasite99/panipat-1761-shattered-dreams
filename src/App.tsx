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
import { LearningHub } from './screens/LearningHub';
import { Timeline } from './screens/Timeline';
import { WarChestDashboard } from './screens/WarChestDashboard';
import { HelpOverlay, SettingsOverlay } from './components/GlobalOverlays';
import { FeedbackWidget } from './components/FeedbackWidget';
import { panipatAudioEngine } from './utils/audioSystem';
import { LMSProvider } from './lms/LMSProvider';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.MAIN_MENU);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [campaignStage, setCampaignStage] = useState<CampaignStage>(CampaignStage.NIZAM_CAMPAIGN);
  const [audioStarted, setAudioStarted] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [learnerId, setLearnerId] = useState<string | null>(null);

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
    setIsMenuOpen(false);
  };

  const handleAdvanceCampaign = () => {
    const stages = Object.values(CampaignStage);
    const currentIndex = stages.indexOf(campaignStage);
    if (currentIndex < stages.length - 1) {
      setCampaignStage(stages[currentIndex + 1]);
    }
  };

  const renderScreen = () => {
    const commonProps = {
      onHelp: () => setIsHelpOpen(true),
      onSettings: () => setIsSettingsOpen(true),
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
        return <WarCouncil campaignStage={campaignStage} onNavigate={handleNavigate} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(true)} onMenuClose={() => setIsMenuOpen(false)} {...commonProps} />;
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
      case Screen.LEARNING_HUB:
        return <LearningHub onNavigate={handleNavigate} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(true)} onMenuClose={() => setIsMenuOpen(false)} {...commonProps} />;
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
      case Screen.WAR_CHEST:
        return <WarChestDashboard onNavigate={handleNavigate} learnerId={learnerId} />;
      default:
        return <MainMenu onNavigate={handleNavigate} {...commonProps} />;
    }
  };

  return (
    <LMSProvider learnerId={learnerId} setLearnerId={setLearnerId}>
      <div className="h-screen w-screen bg-stone-950 overflow-hidden text-stone-200 antialiased font-sans">
        {renderScreen()}
        <HelpOverlay isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <FeedbackWidget currentScreen={currentScreen} />
      </div>
    </LMSProvider>
  );
}