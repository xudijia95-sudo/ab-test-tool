import React, { useRef } from 'react';
import { TestMode, VariantData } from '../types';
import { Upload, X, Type as TypeIcon, Image as ImageIcon } from 'lucide-react';

interface VariantInputProps {
  label: string;
  mode: TestMode;
  data: VariantData;
  onChange: (data: VariantData) => void;
  colorClass: string;
  disabled?: boolean;
}

export const VariantInput: React.FC<VariantInputProps> = ({
  label,
  mode,
  data,
  onChange,
  colorClass,
  disabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (text: string) => {
    onChange({ ...data, type: 'text', content: text });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          type: 'image',
          content: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    onChange({ type: 'image', content: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isImageMode = mode === TestMode.IMAGE;

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl shadow-sm border-2 ${colorClass} overflow-hidden transition-all duration-200 hover:shadow-md`}>
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">{label}</h3>
        <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
          {isImageMode ? <ImageIcon className="w-3 h-3" /> : <TypeIcon className="w-3 h-3" />}
          {isImageMode ? "图片素材" : "文案素材"}
        </span>
      </div>

      <div className="flex-grow p-4 relative min-h-[250px] flex flex-col">
        {isImageMode ? (
          data.content ? (
            <div className="relative w-full h-full flex-grow rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
              <img 
                src={data.content} 
                alt={`${label} Preview`} 
                className="w-full h-full object-contain"
              />
              {!disabled && (
                <button 
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div 
              onClick={() => !disabled && fileInputRef.current?.click()}
              className={`
                flex-grow border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer
                transition-colors hover:bg-slate-50 hover:border-indigo-400
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="bg-indigo-50 p-4 rounded-full">
                <Upload className="w-8 h-8 text-indigo-500" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-slate-700">点击上传图片</p>
                <p className="text-xs text-slate-400 mt-1">支持 PNG, JPG, WEBP</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={disabled}
              />
            </div>
          )
        ) : (
          <textarea
            className="w-full h-full flex-grow p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all text-slate-700 placeholder-slate-400 text-sm leading-relaxed"
            value={data.content}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="在此输入您的文案方案..."
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
