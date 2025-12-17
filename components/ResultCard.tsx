import React from 'react';
import { AnalysisResult } from '../types';
import { Trophy, RotateCcw, ThumbsUp, ThumbsDown, Sparkles, Target, Eye, MessageSquare, MousePointer2 } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ScoreBar: React.FC<{ label: string; score: number; comment: string; icon: React.ReactNode }> = ({ label, score, comment, icon }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {icon}
        {label}
      </div>
      <span className="text-sm font-bold text-slate-900">{score}/100</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
      <div 
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
        style={{ width: `${score}%` }}
      />
    </div>
    <p className="text-xs text-slate-500 leading-relaxed">{comment}</p>
  </div>
);

const ProsConsList: React.FC<{ pros: string[]; cons: string[]; title: string; isWinner: boolean }> = ({ pros, cons, title, isWinner }) => (
  <div className={`p-5 rounded-xl border ${isWinner ? 'bg-white border-yellow-200 shadow-sm ring-1 ring-yellow-100' : 'bg-slate-50 border-slate-100'}`}>
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-bold text-slate-800">{title}</h4>
      {isWinner && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">获胜</span>}
    </div>
    <div className="space-y-4">
      <div>
        <h5 className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">
          <ThumbsUp className="w-3 h-3" /> 优点
        </h5>
        <ul className="space-y-1.5">
          {pros.map((p, i) => (
            <li key={i} className="text-sm text-slate-600 pl-3 border-l-2 border-green-200">{p}</li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="flex items-center gap-1.5 text-xs font-bold text-red-500 mb-2 uppercase tracking-wide">
          <ThumbsDown className="w-3 h-3" /> 缺点
        </h5>
        <ul className="space-y-1.5">
          {cons.map((c, i) => (
            <li key={i} className="text-sm text-slate-600 pl-3 border-l-2 border-red-200">{c}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const isTie = result.winner === 'Tie';
  
  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 1. Winner Banner */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className={`p-6 ${isTie ? 'bg-slate-700' : result.winner === 'A' ? 'bg-blue-600' : 'bg-purple-600'} text-white`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isTie ? "平局 - 难分伯仲" : `方案 ${result.winner} 获胜`}
                </h2>
                <p className="text-white/90 mt-1 text-sm max-w-xl">
                  {result.winnerReason}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="text-xs opacity-75 uppercase">方案 A</div>
                <div className="text-2xl font-bold">{result.scores.variantA}</div>
              </div>
              <div className="text-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="text-xs opacity-75 uppercase">方案 B</div>
                <div className="text-2xl font-bold">{result.scores.variantB}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Analysis Grid */}
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
          {/* Left Column: Detailed Scores */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              多维评估
            </h3>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <ScoreBar label="视觉吸引力" score={result.visualAppeal.score} comment={result.visualAppeal.comment} icon={<Eye className="w-4 h-4 text-blue-500"/>} />
              <div className="my-3 border-t border-slate-200/60"></div>
              <ScoreBar label="文案说服力" score={result.copyPersuasion.score} comment={result.copyPersuasion.comment} icon={<MessageSquare className="w-4 h-4 text-green-500"/>} />
              <div className="my-3 border-t border-slate-200/60"></div>
              <ScoreBar label="转化潜力" score={result.conversionPotential.score} comment={result.conversionPotential.comment} icon={<MousePointer2 className="w-4 h-4 text-orange-500"/>} />
            </div>
            
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2 text-sm">AI 设计评审</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                {result.designReview}
              </p>
            </div>
          </div>

          {/* Right Column: Pros/Cons Comparison */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-500" />
              优劣势对比
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <ProsConsList 
                title="方案 A 分析" 
                pros={result.variantAAnalysis.pros} 
                cons={result.variantAAnalysis.cons} 
                isWinner={result.winner === 'A'}
              />
              <ProsConsList 
                title="方案 B 分析" 
                pros={result.variantBAnalysis.pros} 
                cons={result.variantBAnalysis.cons} 
                isWinner={result.winner === 'B'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Variant C (Optimization) */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-xl overflow-hidden text-white relative">
        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="p-6 md:p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI 优化建议：方案 C</h3>
              <p className="text-indigo-200 text-sm">基于 AB 方案优点融合生成的更优解</p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-4">
             <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">优化内容 / 描述</h4>
             <div className="text-lg leading-relaxed font-medium">
               {result.variantC.content}
             </div>
          </div>
          
          <div className="flex items-start gap-2 text-indigo-200 text-sm">
            <span className="font-bold text-white shrink-0">优化思路：</span>
            {result.variantC.explanation}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onReset}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium py-3 px-8 rounded-full shadow-sm transition-all hover:shadow-md flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          开始新的测试
        </button>
      </div>
    </div>
  );
};
