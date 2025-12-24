import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, TestMode, VariantData } from "../types";

/**
 * [核心分析引擎] analyzeDesignABTest
 * 功能：通过 Gemini API 深度对比 A/B 方案，生成极具差异化的专业分析报告
 */
export const analyzeDesignABTest = async (
  mode: TestMode,
  context: string,
  variantA: VariantData,
  variantB: VariantData
): Promise<AnalysisResult> => {
  // 在函数内部初始化，确保在执行上下文环境中安全获取 process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  // 处理图片或文字部分的辅助函数
  const preparePart = (variant: VariantData, label: string) => {
    if (variant.type === 'image' && variant.content) {
      const parts = variant.content.split(',');
      const base64Data = parts.length > 1 ? parts[1] : parts[0];
      return [
        { 
          inlineData: { 
            data: base64Data, 
            mimeType: variant.mimeType || 'image/png' 
          } 
        },
        { text: `方案 ${label} 的视觉素材` }
      ];
    }
    return [{ text: `方案 ${label} 文案内容: ${variant.content || '未提供'}` }];
  };

  const contents = [
    {
      parts: [
        ...preparePart(variantA, "A"),
        ...preparePart(variantB, "B"),
        {
          text: `你是一位顶级的营销策略专家和资深 UI/UX 设计师。请根据以下背景分析这组 A/B 测试方案。
          
          测试背景: "${context || '通用营销场景'}"
          对比模式: ${mode} (注意：如果是文案对比，请聚焦语感、心理暗示和转化诱导；如果是视觉对比，请聚焦视觉层次、品牌感和注意力流向)。

          你的任务：
          1. 严格对比方案 A 和方案 B 的差异。禁止给出模棱两可或完全相同的评价。
          2. 必须判定一个明确的获胜者（'A'、'B' 或在两者表现极度接近时判定为 'Tie'）。
          3. 获胜理由必须直击痛点，说明为什么这个方案更能打动目标用户。
          4. 为两个方案分别列出独特的优缺点（Pros & Cons），分析必须具有针对性。
          5. 设计一个“方案 C”，它应该融合两者的优点，或者针对获胜方案的不足进行针对性优化，并给出专业的优化思路。
          
          请确保所有返回的文本内容（理由、评论、优缺点）均为中文，且专业、精炼。`
        }
      ]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winner: { type: Type.STRING, description: "获胜方案标识，只能是 'A', 'B' 或 'Tie'" },
            winnerReason: { type: Type.STRING, description: "一句话直击要害的获胜理由" },
            scores: {
              type: Type.OBJECT,
              properties: {
                variantA: { type: Type.INTEGER, description: "方案 A 的综合评分 (0-100)" },
                variantB: { type: Type.INTEGER, description: "方案 B 的综合评分 (0-100)" }
              },
              required: ["variantA", "variantB"]
            },
            designReview: { type: Type.STRING, description: "高水平的设计评审报告，包含用户心理学分析" },
            visualAppeal: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "视觉吸引力评分" },
                comment: { type: Type.STRING, description: "针对视觉表现的专业点评" }
              },
              required: ["score", "comment"]
            },
            copyPersuasion: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "文案说服力评分" },
                comment: { type: Type.STRING, description: "针对文案逻辑和诱导性的点评" }
              },
              required: ["score", "comment"]
            },
            conversionPotential: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "转化潜力评分" },
                comment: { type: Type.STRING, description: "针对转化链路和 CTA 的点评" }
              },
              required: ["score", "comment"]
            },
            variantAAnalysis: {
              type: Type.OBJECT,
              properties: {
                pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "方案 A 的独特优势列表" },
                cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "方案 A 的明显短板或风险点" }
              },
              required: ["pros", "cons"]
            },
            variantBAnalysis: {
              type: Type.OBJECT,
              properties: {
                pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "方案 B 的独特优势列表" },
                cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "方案 B 的明显短板或风险点" }
              },
              required: ["pros", "cons"]
            },
            variantC: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING, description: "优化后的方案 C 内容或设计详述" },
                explanation: { type: Type.STRING, description: "为什么要这样优化的战略性解释" }
              },
              required: ["content", "explanation"]
            }
          },
          required: [
            "winner", "winnerReason", "scores", "designReview", 
            "visualAppeal", "copyPersuasion", "conversionPotential", 
            "variantAAnalysis", "variantBAnalysis", "variantC"
          ]
        }
      }
    });

    if (!response.text) {
      throw new Error("AI 未返回有效的分析数据。");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("A/B 测试 AI 分析失败:", error);
    throw error;
  }
};