
export enum TestMode {
  TEXT = '文案对比',
  IMAGE = '视觉/图片对比'
}

export interface VariantData {
  id: string;
  label: string; // A, B, C, D
  type: 'text' | 'image';
  content: string;
  mimeType?: string;
}

export interface DetailedScore {
  score: number;
  comment: string;
}

export interface VariantAnalysis {
  label: string;
  score: number;
  pros: string[];
  cons: string[];
}

export interface AnalysisResult {
  winner: string; // 'A', 'B', 'C', 'D' 或 'Tie'
  winnerReason: string;
  
  // 综合评审
  designReview: string;
  
  // 核心维度（所有方案的平均/综合评价）
  visualAppeal: DetailedScore;
  copyPersuasion: DetailedScore;
  conversionPotential: DetailedScore;

  // 每个方案的具体分析
  variantDetails: VariantAnalysis[];

  // 终极建议
  optimizedSolution: {
    content: string;
    explanation: string;
  };
}
