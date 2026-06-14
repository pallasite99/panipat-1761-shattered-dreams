// src/lms/LMSProvider.tsx
import React, { useEffect, useState } from 'react';
import { LMSEventBus } from './LMSEventBus';
import { useLearnerStore } from './LearnerStore';

export function LMSProvider({ children }: { children: React.ReactNode }) {
  const { satisfyObjective, logArticleRead, recordAssessmentScore, pushXAPI, learnerId } = useLearnerStore();
  const [mode, setMode] = useState<'campaign' | 'academy' | null>(null);

  // Prompt for mode + learner ID on first load
  useEffect(() => {
    if (!learnerId) {
      const id = prompt('Academy Mode: Enter your name or student ID (leave blank for Campaign Mode)');
      if (id?.trim()) {
        useLearnerStore.getState().setLearnerId(id.trim());
        setMode('academy');
      } else {
        setMode('campaign');
      }
    } else {
      setMode('academy');
    }
  }, []);

  // Central event handler
  useEffect(() => {
    if (mode !== 'academy') return;
    return LMSEventBus.on((event) => {
      if (event.type === 'STAGE_ADVANCED') {
        satisfyObjective(`${event.stageId}-advance`);
        pushXAPI({ actor: learnerId, verb: 'progressed', object: event.stageId, timestamp: new Date().toISOString() });
      }
      if (event.type === 'ARTICLE_READ') logArticleRead(event.articleId);
      if (event.type === 'ASSESSMENT_SUBMITTED') recordAssessmentScore(event.stageId, event.score);
    });
  }, [mode]);

  return <>{children}</>;
}