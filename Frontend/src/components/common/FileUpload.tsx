import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  label?: string;
  badge?: string;
  file?: { name: string; size: string };
  onFileChange: (file?: { name: string; size: string }) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Product Specs & Technical Assets',
  badge = 'OPTIONAL',
  file,
  onFileChange,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      const sizeMb = (dropped.size / (1024 * 1024)).toFixed(1) + ' MB';
      onFileChange({ name: dropped.name, size: sizeMb });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const sizeMb = (selected.size / (1024 * 1024)).toFixed(1) + ' MB';
      onFileChange({ name: selected.name, size: sizeMb });
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-[#111318]">{label}</label>
        {badge && (
          <span className="text-[11px] font-semibold text-[#69707D] tracking-wider uppercase">
            {badge}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.txt,.docx,.png,.jpg,.markdown"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-white cursor-pointer transition-all duration-150 text-center group',
          isDragging
            ? 'border-[#635BFF] bg-[#EEECFF]/30'
            : 'border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F8F9FA]'
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-[#EEECFF] text-[#635BFF] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-[#111318]">
          <span className="hidden sm:inline">Browse files or drag assets here</span>
          <span className="sm:hidden">Tap to upload product spec or screenshots</span>
        </p>
        <p className="text-xs text-[#69707D] mt-1 tracking-wide">
          PDF, TXT, DOCX, PNG OR MARKDOWN UP TO 25MB
        </p>
      </div>

      {file && (
        <div className="mt-2.5 flex items-center justify-between p-2.5 px-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-[#ECFDF5] text-[#16845B] flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <FileText className="w-4 h-4 text-[#69707D] shrink-0" />
            <span className="truncate font-medium text-[#111318] text-xs sm:text-sm">
              {file.name}
            </span>
            <span className="text-xs text-[#69707D] shrink-0 font-mono">({file.size})</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileChange(undefined);
            }}
            className="text-[#69707D] hover:text-[#111318] p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
