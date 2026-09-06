import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard, cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  textToCopy: string;
  label?: string;
  copiedLabel?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copy',
  copiedLabel = 'Copied!',
  variant = 'ghost',
  className,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      toast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast('Failed to copy', 'error');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'p-1.5 rounded hover:bg-gray-100 text-[#69707D] hover:text-[#111318] transition-colors',
          copied && 'text-[#16845B]',
          className
        )}
        title="Copy to clipboard"
        {...props}
      >
        {copied ? <Check className="w-4 h-4 text-[#16845B]" /> : <Copy className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium py-1 px-2.5 rounded transition-colors',
        variant === 'ghost' && 'text-[#69707D] hover:text-[#111318] hover:bg-gray-100',
        variant === 'outline' && 'border border-[#E5E7EB] bg-white text-[#111318] hover:bg-gray-50',
        variant === 'default' && 'bg-[#635BFF] text-white hover:bg-[#5148E5]',
        copied && 'text-[#16845B] border-[#A7F3D0]',
        className
      )}
      {...props}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#16845B]" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
