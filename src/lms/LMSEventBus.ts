// src/lms/LMSEventBus.ts
type LMSEvent =
  | { type: 'STAGE_ADVANCED'; stageId: string }
  | { type: 'ARTICLE_READ'; articleId: string }
  | { type: 'ASSESSMENT_SUBMITTED'; stageId: string; score: number }
  | { type: 'DECISION_LOGGED'; context: string; choice: string }
  | { type: 'CAMPAIGN_COMPLETED' };

type Handler = (event: LMSEvent) => void;
const listeners = new Set<Handler>();

export const LMSEventBus = {
  emit: (event: LMSEvent) => listeners.forEach((h) => h(event)),
  on: (handler: Handler) => { listeners.add(handler); return () => listeners.delete(handler); },
};