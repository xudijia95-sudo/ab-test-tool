
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, TestMode, VariantData } from "../types";

export const analyzeDesignABTest = async (
  mode: TestMode,
  context: string,
  variants: VariantData[]
): Promise<AnalysisResult> => {
  // 每次调用时创建实例以确保使用最新的 API KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 对于涉及 2-4 张图片或复杂文案的对比分析，属于复杂推理任务
  // 使用 gemini-3-pro-preview 以获得更好的稳定性，减少因模型推理压力导致的 500 错误
  const model = 'gemini-3-pro-preview';

  // 准备多方案内容
  const variantParts = variants.flatMap((v) => {
    const labelText = `方案 ${v.label}`;
    if (v.type === 'image' && v.content) {
      // 确保基础 base64 数据不包含 Data URL 前缀
      const base64Data = v.content.includes(',') ? v.content.split(',')[1] : v.content;
      return [
        { inlineData: { data: base64Data, mimeType: v.mimeType || 'image/png' } },
        { text: `${labelText} 的视觉设计素材` }
      ];
    }
    return [{ text: `${labelText} 的文案/内容: ${v.content || '未提供'}` }];
  });

  const contents = [
    {
      parts: [
        ...variantParts,
        {
          text: `你是一位具备 15 年以上经验的资深营销专家、心理学家和 UI/UX 首席设计师。
          
          当前背景: "${context || '通用商业场景'}"
          测试模式: ${mode}
          对比方案数量: ${variants.length} (${variants.map(v => v.label).join(', ')})
          
          任务指令：
          1. 深度对比这 ${variants.length} 个方案。
          2. 基于转换率优化 (CRO) 原则、视觉层级 (Visual Hierarchy) 和认知负荷 (Cognitive Load) 理论，判定一个统计学上最可能胜出的方案。
          3. 为每个方案提供 0-100 的评分，并基于心理学反馈列出其关键的优点 (Pros) 和潜在的流失风险 (Cons)。
          4. 最终结合所有方案的精髓，输出一个综合优化后的“终极建议”文案或描述。
          
          输出规范：
          - 必须使用中文。
          - 结果必须是有效的 JSON 格式。`
        }
      ]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        // 使用适当的思维预算来处理这种复杂的比较任务
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winner: { type: Type.STRING, description: "获胜方案的标签，如 'A', 'B', 'C' 或 'D'" },
            winnerReason: { type: Type.STRING, description: "获胜的核心原因，一句话总结" },
            designReview: { type: Type.STRING, description: "详细的专家评审报告，不少于 100 字" },
            visualAppeal: {
              type: Type.OBJECT,
              properties: { score: { type: Type.INTEGER }, comment: { type: Type.STRING } },
              required: ["score", "comment"]
            },
            copyPersuasion: {
              type: Type.OBJECT,
              properties: { score: { type: Type.INTEGER }, comment: { type: Type.STRING } },
              required: ["score", "comment"]
            },
            conversionPotential: {
              type: Type.OBJECT,
              properties: { score: { type: Type.INTEGER }, comment: { type: Type.STRING } },
              required: ["score", "comment"]
            },
            variantDetails: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["label", "score", "pros", "cons"]
              }
            },
            optimizedSolution: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["content", "explanation"]
            }
          },
          required: ["winner", "winnerReason", "designReview", "variantDetails", "optimizedSolution", "visualAppeal", "copyPersuasion", "conversionPotential"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI 返回了空响应");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("AI Analysis Failed:", error);
    // 针对 RPC/Proxy 错误的友好封装
    if (error?.message?.includes('Rpc failed') || error?.status === 'UNKNOWN') {
      throw new Error("模型响应超时或负载过重。建议尝试减少方案数量，或确保上传的图片大小适中。");
    }
    throw error;
  }
};
