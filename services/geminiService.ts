import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, TestMode, VariantData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeDesignABTest = async (
  mode: TestMode,
  context: string,
  variantA: VariantData,
  variantB: VariantData
): Promise<AnalysisResult> => {
  if (!apiKey) {
    // Mock response for development without API key
    console.warn("No API Key found. Returning mock data.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          winner: 'A',
          winnerReason: "方案 A 的视觉层级更清晰，用户视线流动更自然，且按钮颜色在此背景下对比度更高。",
          scores: { variantA: 88, variantB: 75 },
          designReview: "在当前使用场景下，方案 A 采用了更符合现代审美的极简主义风格，减少了认知负荷。方案 B 虽然信息丰富，但显得略微拥挤。",
          visualAppeal: { score: 90, comment: "配色和谐，留白处理得当。" },
          copyPersuasion: { score: 85, comment: "文案直击痛点，使用了强有力的动词。" },
          conversionPotential: { score: 92, comment: "CTA 按钮位置醒目，引导性强。" },
          variantAAnalysis: {
            pros: ["视觉中心明确", "色彩引导性强", "文案简洁"],
            cons: ["副标题字体略小"]
          },
          variantBAnalysis: {
            pros: ["信息展示全面", "产品细节丰富"],
            cons: ["视觉杂乱", "CTA 淹没在背景中"]
          },
          variantC: {
            content: "建议结合 A 的布局和 B 的产品细节展示。将 CTA 按钮改为橙色以提升点击率，并放大副标题字号。",
            explanation: "综合了两者的优点，解决了 A 方案信息量不足和 B 方案视觉混乱的问题。"
          }
        });
      }, 2000);
    });
  }

  try {
    const parts: any[] = [];

    // System Instruction / Context
    parts.push({
      text: `你是一位世界顶级的设计总监和转化率优化专家（CRO）。
      你的任务是分析两个设计/文案方案（A/B测试），并给出专业的评审意见。
      
      测试类型: ${mode}
      目标用户/使用场景: ${context || "未指定，请根据内容推断"}
      
      请基于设计美学、心理学原理、文案说服力和转化潜力进行深度分析。
      如果是图片对比，请重点关注构图、色彩、层级、清晰度。
      如果是文案对比，请重点关注语气、清晰度、痛点共鸣、行动号召。
      
      请生成一个“方案 C”，如果是文案测试，直接写出优化后的文案；如果是图片测试，请详细描述优化后的画面设计方案。
      `
    });

    // Add Variant A
    parts.push({ text: "\n--- 方案 A ---\n" });
    if (variantA.type === 'image' && variantA.mimeType) {
       // Strip base64 prefix if present for API usage if passing raw bytes, 
       // but generic inlineData helper usually expects pure base64.
       const base64Data = variantA.content.split(',')[1]; 
       parts.push({
         inlineData: {
           mimeType: variantA.mimeType,
           data: base64Data
         }
       });
    } else {
      parts.push({ text: variantA.content });
    }

    // Add Variant B
    parts.push({ text: "\n--- 方案 B ---\n" });
    if (variantB.type === 'image' && variantB.mimeType) {
       const base64Data = variantB.content.split(',')[1];
       parts.push({
         inlineData: {
           mimeType: variantB.mimeType,
           data: base64Data
         }
       });
    } else {
      parts.push({ text: variantB.content });
    }

    // Define Schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        winner: { type: Type.STRING, enum: ["A", "B", "Tie"], description: "获胜方案" },
        winnerReason: { type: Type.STRING, description: "一句话总结获胜理由" },
        scores: {
          type: Type.OBJECT,
          properties: {
            variantA: { type: Type.NUMBER, description: "方案A总分 (0-100)" },
            variantB: { type: Type.NUMBER, description: "方案B总分 (0-100)" }
          },
          required: ["variantA", "variantB"]
        },
        designReview: { type: Type.STRING, description: "整体AI设计评审意见" },
        visualAppeal: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            comment: { type: Type.STRING }
          },
          required: ["score", "comment"],
          description: "视觉吸引力评分及评价"
        },
        copyPersuasion: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            comment: { type: Type.STRING }
          },
          required: ["score", "comment"],
          description: "文案说服力评分及评价"
        },
        conversionPotential: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            comment: { type: Type.STRING }
          },
          required: ["score", "comment"],
          description: "转化潜力评分及评价"
        },
        variantAAnalysis: {
          type: Type.OBJECT,
          properties: {
            pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "方案A优点 (3点)" },
            cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "方案A缺点 (3点)" }
          },
          required: ["pros", "cons"]
        },
        variantBAnalysis: {
          type: Type.OBJECT,
          properties: {
            pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "方案B优点 (3点)" },
            cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "方案B缺点 (3点)" }
          },
          required: ["pros", "cons"]
        },
        variantC: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING, description: "生成的优化方案内容（文案或画面描述）" },
            explanation: { type: Type.STRING, description: "优化思路解释" }
          },
          required: ["content", "explanation"]
        }
      },
      required: [
        "winner", "winnerReason", "scores", "designReview", 
        "visualAppeal", "copyPersuasion", "conversionPotential", 
        "variantAAnalysis", "variantBAnalysis", "variantC"
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("API returned empty response");
    
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
