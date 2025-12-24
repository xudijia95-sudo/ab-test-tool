import React, { useState } from 'react';
import { TestMode, VariantData, AnalysisResult } from './types';
import { analyzeDesignABTest } from './services/geminiService';
import { VariantInput } from './components/VariantInput';
import { ResultCard } from './components/ResultCard';
import { Sparkles, Palette, Target } from 'lucide-react';

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
      setError("请填写文案或上传方案图片（两边都需要输入内容才能对比哦）");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeDesignABTest(testMode, context, variantA, variantB);
      setResult(data);
    } catch (err) {
      setError("计算引擎遇到微小波动，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: TestMode) => {
    setTestMode(newMode);
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-20">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              A/B 智能决策工具 <span className="text-indigo-600 font-medium text-xs ml-2 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">输入驱动模式</span>
            </h1>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-500 border border-slate-200 hidden sm:block">
            实时特征匹配算法
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {!result && (
          <div className="text-center mb-12 max-w-3xl mx-auto animate-fade-in-up">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
              科学评估，告别“盲测”
            </h2>
            <p className="text-lg text-slate-600">
              通过算法模型分析文案长度、关键词力度及视觉权重。输入不同的内容，即可获得完全不同的评估报告。
            </p>
          </div>
        )}

        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 transition-opacity ${result ? 'opacity-60' : ''}`}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-slate-700 mb-2">测试类型</label>
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-lg">
                {Object.values(TestMode).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    disabled={loading || !!result}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${testMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400" />
                目标用户 / 使用场景
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="例如：双十一大促，追求高性价比的学生群体"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                disabled={loading || !!result}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 relative mb-10">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg z-10 border border-slate-100 md:flex hidden">
            <span className="text-sm font-black text-indigo-300 italic">VS</span>
          </div>

          <VariantInput 
            label="方案 A"
            mode={testMode}
            data={variantA}
            onChange={setVariantA}
            colorClass={result?.winner === 'A' ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg" : "border-slate-200"}
            disabled={loading || !!result}
          />

          <VariantInput 
            label="方案 B"
            mode={testMode}
            data={variantB}
            onChange={setVariantB}
            colorClass={result?.winner === 'B' ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg" : "border-slate-200"}
            disabled={loading || !!result}
          />
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 text-center animate-bounce">
            {error}
          </div>
        )}

        {!result && (
          <div className="text-center">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-12 py-4 bg-slate-900 hover:bg-indigo-600 text-white text-lg font-bold rounded-full shadow-xl transition-all disabled:opacity-50 hover:-translate-y-1 flex items-center gap-3 mx-auto"
            >
              {loading ? "正在深度计算指标..." : "计算最优方案"}
              {!loading && <Sparkles className="w-5 h-5" />}
            </button>
            <p className="mt-4 text-xs text-slate-400">结果完全由文案特征和素材权重实时推导</p>
          </div>
        )}

        {result && <ResultCard result={result} onReset={resetTest} />}
      </main>
    </div>
  );
};

export default App;
