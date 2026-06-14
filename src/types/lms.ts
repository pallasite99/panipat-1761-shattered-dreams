// src/types/lms.ts
export interface LearningObjective {
  id: string;
  stageId: string;
  description: string;
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate';
  satisfiedBy: 'stage-advance' | 'article-read' | 'assessment-pass' | 'decision-logged';
  satisfied: boolean;
}

export interface AssessmentQuestion {
  id: string;
  stageId: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  criteria: string;
  earned: boolean;
  earnedAt?: string;
}

export interface LearnerState {
  learnerId: string;
  objectives: Record<string, LearningObjective>;
  badges: Badge[];
  assessmentScores: Record<string, number>;
  articlesRead: string[];
  timePerStage: Record<string, number>;
  xAPIQueue: xAPIStatement[];
}

export interface xAPIStatement {
  actor: string;
  verb: 'experienced' | 'passed' | 'failed' | 'completed' | 'progressed';
  object: string;
  result?: { score?: number; success?: boolean };
  timestamp: string;
}