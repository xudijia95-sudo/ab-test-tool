
import React, { useRef, useState } from 'react';
import { AnalysisResult } from '../types';
import { 
  Trophy, RotateCcw, ThumbsUp, ThumbsDown, Sparkles, 
  Target, Eye, MessageSquare, MousePointer2, ChevronRight,
  Download, Copy, Check, Share2, Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface ResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ScoreBar: React.FC<{ label: string; score: number; comment: string; icon: React.ReactNode }> = ({ label, score, comment, icon }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon} {label}
      </div>
      <span className="text-sm font-bold text-indigo-600">{score}/100</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
      <div className="h-full rounded-full bg-indigo-500 transition-all duration-1000" style={{ width: `${score}%` }} />
    </div>
    <p className="text-[11px] text-slate-500 leading-relaxed italic">{comment}</p>
  </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSaveImage = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      // 预处理：暂时调整样式以优化截图
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
        logging: false,
        onclone: (clonedDoc) => {
          // 可以在克隆的文档中隐藏某些不想要的元素
          const actionArea = clonedDoc.querySelector('.no-export');
          if (actionArea) (actionArea as HTMLElement).style.display = 'none';
        }
      });
      
      const link = document.createElement('a');
      link.download = `AB-Test-Report-${result.winner}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    const text = `
【A/B 测试预测报告】
获胜方案：方案 ${result.winner}
获胜理由：${result.winnerReason}

核心得分：
- 视觉吸引力：${result.visualAppeal.score}
- 文案说服力：${result.copyPersuasion.score}
- 转化潜力：${result.conversionPotential.score}

专家建议：${result.optimizedSolution.content}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* 可导出内容区域 */}
      <div ref={reportRef} className="p-1 md:p-4 rounded-3xl">
        <div className="space-y-8">
          {/* 获胜 Banner */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-indigo-600 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Trophy className="w-8 h-8 text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">方案 {result.winner} 综合表现最优</h2>
                    <p className="text-indigo-100 mt-1 text-sm">{result.winnerReason}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.variantDetails.map((v) => (
                    <div key={v.label} className={`px-4 py-2 rounded-lg backdrop-blur-sm border ${v.label === result.winner ? 'bg-white/20 border-white/40 shadow-inner' : 'bg-white/5 border-white/10 opacity-70'}`}>
                      <div className="text-[10px] uppercase font-bold text-indigo-200">方案 {v.label}</div>
                      <div className="text-xl font-bold">{v.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-10">
              {/* 左侧：多维评估 */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" /> 核心指标评估
                </h3>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <ScoreBar label="视觉吸引力" score={result.visualAppeal.score} comment={result.visualAppeal.comment} icon={<Eye className="w-4 h-4 text-blue-500"/>} />
                  <div className="my-4 border-t border-slate-200/50"></div>
                  <ScoreBar label="文案说服力" score={result.copyPersuasion.score} comment={result.copyPersuasion.comment} icon={<MessageSquare className="w-4 h-4 text-green-500"/>} />
                  <div className="my-4 border-t border-slate-200/50"></div>
                  <ScoreBar label="转化潜力" score={result.conversionPotential.score} comment={result.conversionPotential.comment} icon={<MousePointer2 className="w-4 h-4 text-orange-500"/>} />
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                  <h4 className="font-bold text-indigo-900 mb-2 text-sm">AI 专家评审报告</h4>
                  <p className="text-indigo-800 text-sm leading-relaxed">{result.designReview}</p>
                </div>
              </div>

              {/* 右侧：各方案明细 */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-indigo-500" /> 各方案优劣对比
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {result.variantDetails.map((v) => (
                    <div key={v.label} className={`p-4 rounded-xl border ${v.label === result.winner ? 'bg-yellow-50/30 border-yellow-200 ring-1 ring-yellow-100' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-slate-700">方案 {v.label} 分析</span>
                        {v.label === result.winner && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">Winner</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="flex items-center gap-1 text-[10px] font-bold text-green-600 mb-1 uppercase tracking-wider"><ThumbsUp className="w-3 h-3"/> 优势</h5>
                          <ul className="text-xs text-slate-500 space-y-1">
                            {v.pros.map((p, i) => <li key={i} className="pl-2 border-l border-green-200">{p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h5 className="flex items-center gap-1 text-[10px] font-bold text-red-500 mb-1 uppercase tracking-wider"><ThumbsDown className="w-3 h-3"/> 风险</h5>
                          <ul className="text-xs text-slate-500 space-y-1">
                            {v.cons.map((c, i) => <li key={i} className="pl-2 border-l border-red-200">{c}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 优化建议 */}
          <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden text-white">
            <div className="p-8 relative">
              <div className="absolute top-0 right-0 p-20 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold">方案融合：终极优化建议 (Solution+)</h3>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <div className="text-lg leading-relaxed text-indigo-100 font-medium">
                  {result.optimizedSolution.content}
                </div>
              </div>
              <div className="text-sm text-slate-400">
                <span className="text-white font-bold mr-2">战略逻辑:</span>
                {result.optimizedSolution.explanation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作栏 - 不会被导出到图片 */}
      <div className="no-export flex flex-wrap justify-center items-center gap-4 py-6">
        <button 
          onClick={handleSaveImage}
          disabled={isGenerating}
          className="bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isGenerating ? '正在生成长图...' : '保存分析长图'}
        </button>

        <button 
          onClick={handleCopyText}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3 px-6 rounded-full shadow-sm flex items-center gap-2 transition-all"
        >
          {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {isCopied ? '已复制到剪贴板' : '复制文字报告'}
        </button>

        <div className="w-px h-6 bg-slate-200 mx-2"></div>

        <button 
          onClick={onReset} 
          className="bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-100 font-bold py-3 px-6 rounded-full shadow-sm flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> 开启新测试
        </button>
      </div>
    </div>
  );
};
