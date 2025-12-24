
import React, { useRef } from 'react';
import { TestMode, VariantData } from '../types';
import { Upload, X, Type as TypeIcon, Image as ImageIcon, Trash2 } from 'lucide-react';

interface VariantInputProps {
  data: VariantData;
  mode: TestMode;
  onChange: (data: VariantData) => void;
  onRemove?: () => void;
  isWinner?: boolean;
  disabled?: boolean;
}

export const VariantInput: React.FC<VariantInputProps> = ({
  data,
  mode,
  onChange,
  onRemove,
  isWinner,
  disabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isImageMode = mode === TestMode.IMAGE;

  // 根据标签分配颜色
  const getColorClasses = (label: string) => {
    if (isWinner) return 'border-yellow-400 ring-4 ring-yellow-400/10 shadow-lg';
    switch(label) {
      case 'A': return 'border-blue-200';
      case 'B': return 'border-purple-200';
      case 'C': return 'border-cyan-200';
      case 'D': return 'border-orange-200';
      default: return 'border-slate-200';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, type: 'image', content: reader.result as string, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl shadow-sm border-2 ${getColorClasses(data.label)} overflow-hidden transition-all duration-300 relative`}>
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-sm 
            ${data.label === 'A' ? 'bg-blue-500' : data.label === 'B' ? 'bg-purple-500' : data.label === 'C' ? 'bg-cyan-500' : 'bg-orange-500'}`}>
            {data.label}
          </span>
          <h3 className="font-bold text-slate-700">方案 {data.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onRemove && !disabled && (
            <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow p-4 min-h-[220px] flex flex-col">
        {isImageMode ? (
          data.content ? (
            <div className="relative w-full h-full flex-grow rounded-lg overflow-hidden border border-slate-100 bg-slate-50 group">
              <img src={data.content} className="w-full h-full object-contain" alt="Preview" />
              {!disabled && (
                <button onClick={() => onChange({...data, content: ''})} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div onClick={() => !disabled && fileInputRef.current?.click()} className="flex-grow border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all">
              <Upload className="w-6 h-6 text-slate-300" />
              <span className="text-xs font-medium text-slate-500">上传图片</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          )
        ) : (
          <textarea
            className="w-full h-full flex-grow p-3 bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none text-sm leading-relaxed"
            value={data.content}
            onChange={(e) => onChange({...data, type: 'text', content: e.target.value})}
            placeholder="输入文案内容..."
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
