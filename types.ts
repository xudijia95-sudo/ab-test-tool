export enum TestMode {
  TEXT = '文案对比',
  IMAGE = '视觉/图片对比'
}

export interface VariantData {
  type: 'text' | 'image';
  content: string; // Text string or Base64 string
  mimeType?: string; // e.g., 'image/png'
}

export interface DetailedScore {
  score: number; // 0-100
  comment: string;
}

export interface AnalysisResult {
  winner: 'A' | 'B' | 'Tie'; // 获胜者
  winnerReason: string; // 获胜理由
  
  // Scoring
  scores: {
    variantA: number;
    variantB: number;
  };

  // Detailed Analysis
  designReview: string; // AI设计评审
  visualAppeal: DetailedScore; // 视觉吸引力
  copyPersuasion: DetailedScore; // 文案说服力
  conversionPotential: DetailedScore; // 转化潜力

  // Pros & Cons
  variantAAnalysis: {
    pros: string[];
    cons: string[];
  };
  variantBAnalysis: {
    pros: string[];
    cons: string[];
  };

  // Optimization
  variantC: {
    content: string; // Improved copy or description of improved design
    explanation: string;
  };
}
