// src/lms/LearnerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearnerState, xAPIStatement } from '../types/lms';

const defaultState: LearnerState = {
  learnerId: '',
  objectives: {},
  badges: [],
  assessmentScores: {},
  articlesRead: [],
  timePerStage: {},
  xAPIQueue: [],
};

export const useLearnerStore = create<LearnerState & {
  setLearnerId: (id: string) => void;
  satisfyObjective: (objectiveId: string) => void;
  logArticleRead: (articleId: string) => void;
  recordAssessmentScore: (stageId: string, score: number) => void;
  pushXAPI: (statement: xAPIStatement) => void;
  reset: () => void;
}>()(
  persist(
    (set) => ({
      ...defaultState,
      setLearnerId: (id) => set({ learnerId: id }),
      satisfyObjective: (objectiveId) =>
        set((s) => ({
          objectives: {
            ...s.objectives,
            [objectiveId]: { ...s.objectives[objectiveId], satisfied: true },
          },
        })),
      logArticleRead: (articleId) =>
        set((s) => ({ articlesRead: [...new Set([...s.articlesRead, articleId])] })),
      recordAssessmentScore: (stageId, score) =>
        set((s) => ({ assessmentScores: { ...s.assessmentScores, [stageId]: score } })),
      pushXAPI: (statement) =>
        set((s) => ({ xAPIQueue: [...s.xAPIQueue, statement] })),
      reset: () => set(defaultState),
    }),
    { name: 'panipat-lms' } // namespaced localStorage key
  )
);