export type AnalysisStructureMode = 'pyramid' | 'list';

export interface PerfumeAnalysis {
  name: string;
  tagline: string;
  opening: string;
  narrative: string;
  structureMode: AnalysisStructureMode;
  structureSummary: string;
  layers: {
    top: string;
    heart: string;
    base: string;
  };
  persona: {
    profile: string;
    setting: string;
    season: string;
  };
  references: Array<{ name: string; reason: string }>;
  pros: string[];
  cons: string[];
  verdict: { score: number; summary: string };
  soulObject: { object: string; rationale: string };
  bottleDesign: string;
  visualPrompt: string;
}

export interface AnalyzeResponse {
  analysis: PerfumeAnalysis;
  model: string;
}
