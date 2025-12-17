import React, { useState } from 'react';
import { TestMode, VariantData, AnalysisResult } from './types';
import { analyzeDesignABTest } from './services/geminiService';
import { VariantInput } from './components/VariantInput';
import { ResultCard } from './components/ResultCard';
import { Sparkles, Palette, type LucideIcon, Target } from 'lucide-react';

const App: React.FC = () => {
  const [testMode, setTestMode] = useState<TestMode>(TestMode.IMAGE);
  const [context, setContext] = useState('');
  
  const [variantA, setVariantA] = useState<VariantData>({ type: 'image', content: '' });
  const [variantB, setVariantB] = useState<VariantData>({ type: 'image', content: '' });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!variantA.content || !variantB.content) {
      setError("请确保方案 A 和方案 B 都已上传内容或图片");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeDesignABTest(testMode, context, variantA, variantB);
      setResult(data);
    } catch (err) {
      setError("分析过程中出现错误，请检查网络或稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: TestMode) => {
    setTestMode(newMode);
    // Reset variants when switching mode to avoid type mismatch confusion in UI
    const defaultType = newMode === TestMode.IMAGE ? 'image' : 'text';
    setVariantA({ type: defaultType, content: '' });
    setVariantB({ type: defaultType, content: '' });
    setResult(null);
    setError(null);
  };

  const resetTest = () => {
    setResult(null);
    setVariantA({ ...variantA, content: '' });
    setVariantB({ ...variantB, content: '' });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-lg shadow-md">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              AI 智能设计评审 <span className="text-indigo-600">A/B Test</span>
            </h1>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-500 hidden sm:block border border-slate-200">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro */}
        {!result && (
          <div className="text-center mb-12 max-w-3xl mx-auto animate-fade-in-up">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              让 AI 成为你的 <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                设计总监 & 增长专家
              </span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              上传两个设计方案或文案，AI 将从视觉美学、用户心理、转化潜力等维度进行深度对比分析，并生成更优的“方案 C”。
            </p>
          </div>
        )}

        {/* Configuration Panel */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 transition-all ${result ? 'opacity-50 hover:opacity-100' : ''}`}>
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Mode Selection */}
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-slate-700 mb-2">测试类型</label>
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-lg">
                {Object.values(TestMode).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    disabled={loading || !!result}
                    className={`
                      py-2 text-sm font-medium rounded-md transition-all
                      ${testMode === mode 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                    `}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Input */}
            <div className="w-full md:w-2/3">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" />
                目标用户 / 使用场景
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="例如：25-35岁女性，护肤品双十一大促落地页 Banner"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                disabled={loading || !!result}
              />
            </div>
          </div>
        </div>

        {/* Variants Grid */}
        <div className="grid md:grid-cols-2 gap-8 relative mb-10">
          {/* VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl z-10 border border-slate-100 md:flex hidden">
            <span className="text-sm font-black text-indigo-200 italic">VS</span>
          </div>

          <VariantInput 
            label="方案 A"
            mode={testMode}
            data={variantA}
            onChange={setVariantA}
            colorClass={result?.winner === 'A' ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg" : "border-slate-200"}
            disabled={loading || !!result}
          />

          <VariantInput 
            label="方案 B"
            mode={testMode}
            data={variantB}
            onChange={setVariantB}
            colorClass={result?.winner === 'B' ? "border-purple-500 ring-4 ring-purple-500/10 shadow-lg" : "border-slate-200"}
            disabled={loading || !!result}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 text-center animate-shake">
            {error}
          </div>
        )}

        {/* Action Button */}
        {!result && (
          <div className="text-center">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`
                group relative px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all
                disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto overflow-hidden
              `}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在深度分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    开始 AI 评审
                  </>
                )}
              </span>
            </button>
            <p className="mt-4 text-sm text-slate-400">
              分析耗时约 5-10 秒，请耐心等待
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <ResultCard result={result} onReset={resetTest} />
        )}

      </main>
    </div>
  );
};

export default App;
