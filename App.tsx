
import React, { useState } from 'react';
import { TestMode, VariantData, AnalysisResult } from './types';
import { analyzeDesignABTest } from './services/geminiService';
import { VariantInput } from './components/VariantInput';
import { ResultCard } from './components/ResultCard';
import { Sparkles, Palette, Target, Plus, AlertCircle } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);
const LABELS = ['A', 'B', 'C', 'D'];

const App: React.FC = () => {
  const [testMode, setTestMode] = useState<TestMode>(TestMode.IMAGE);
  const [context, setContext] = useState('');
  
  // 初始化两个方案
  const [variants, setVariants] = useState<VariantData[]>([
    { id: generateId(), label: 'A', type: 'image', content: '' },
    { id: generateId(), label: 'B', type: 'image', content: '' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addVariant = () => {
    if (variants.length >= 4) return;
    const nextLabel = LABELS[variants.length];
    setVariants([...variants, { 
      id: generateId(), 
      label: nextLabel, 
      type: testMode === TestMode.IMAGE ? 'image' : 'text', 
      content: '' 
    }]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 2) return;
    const newVariants = variants.filter(v => v.id !== id).map((v, index) => ({
      ...v,
      label: LABELS[index]
    }));
    setVariants(newVariants);
  };

  const updateVariant = (id: string, data: VariantData) => {
    setVariants(variants.map(v => v.id === id ? data : v));
  };

  const handleAnalyze = async () => {
    const incomplete = variants.some(v => !v.content);
    if (incomplete) {
      setError("请确保所有添加的方案都已上传图片或填写文案。");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeDesignABTest(testMode, context, variants);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "分析失败。可能是因为图片过大或网络波动，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: TestMode) => {
    setTestMode(newMode);
    const type = newMode === TestMode.IMAGE ? 'image' : 'text';
    setVariants(variants.map(v => ({ ...v, type, content: '' })));
    setResult(null);
    setError(null);
  };

  const resetTest = () => {
    setResult(null);
    setVariants(variants.map(v => ({ ...v, content: '' })));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-800 font-sans pb-20">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              多维 A/B 测试专家
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
              v2.1 增强引擎
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!result && (
          <div className="text-center mb-10 max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">多方案竞优决策</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              基于 Gemini 3 Pro 视觉推理引擎。支持上传 2-4 个方案，全方位模拟用户直觉并预测点击转化结果。
            </p>
          </div>
        )}

        {/* 全局配置栏 */}
        <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-6 items-end ${result ? 'hidden' : ''}`}>
          <div className="w-full md:w-64">
            <label className="block text-xs font-black text-slate-400 mb-2 uppercase">测试模式</label>
            <div className="grid grid-cols-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
              {Object.values(TestMode).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${testMode === mode ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow w-full">
            <label className="block text-xs font-black text-slate-400 mb-2 uppercase flex items-center gap-2">
              <Target className="w-3 h-3" /> 业务场景说明
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="输入背景信息以获得更精准的反馈（如：投放渠道、目标人群、核心诉求等）"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* 方案网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {variants.map((v) => (
            <VariantInput 
              key={v.id}
              data={v}
              mode={testMode}
              onChange={(updated) => updateVariant(v.id, updated)}
              onRemove={variants.length > 2 ? () => removeVariant(v.id) : undefined}
              disabled={loading || !!result}
              isWinner={result?.winner === v.label}
            />
          ))}
          
          {/* 添加按钮 */}
          {!result && variants.length < 4 && (
            <button 
              onClick={addVariant}
              className="h-[220px] md:min-h-[320px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/20 transition-all group"
            >
              <div className="p-3 bg-slate-50 rounded-full group-hover:bg-indigo-50 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold tracking-wide">添加对比方案 ({variants.length}/4)</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-3 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 提交区域 */}
        {!result && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="group px-16 py-4 bg-slate-900 hover:bg-indigo-600 text-white text-lg font-black rounded-full shadow-2xl transition-all disabled:opacity-50 hover:-translate-y-1 flex items-center gap-4"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>深度分析中，请稍候...</span>
                </>
              ) : (
                <>
                  <span>开启多维竞优分析</span>
                  <Sparkles className="w-5 h-5 text-yellow-300 group-hover:scale-125 transition-transform" />
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
              Multimodal Reasoning Engine: Gemini-3 Pro
            </p>
          </div>
        )}

        {result && <ResultCard result={result} onReset={resetTest} />}
      </main>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default App;
