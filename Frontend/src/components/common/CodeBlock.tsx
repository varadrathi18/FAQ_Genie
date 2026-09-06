import React from 'react';
import { CopyButton } from './CopyButton';
import { cn } from '../../lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'html',
  className,
  showLineNumbers = false,
}) => {
  const lines = code.trim().split('\n');

  return (
    <div className={cn('relative rounded-lg bg-[#0F172A] border border-[#1E293B] overflow-hidden text-left', className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#1E293B]/60 border-b border-[#334155] text-xs text-[#94A3B8]">
        <span className="font-mono uppercase tracking-wider text-[11px]">{language}</span>
        <CopyButton
          textToCopy={code}
          label="Copy Code"
          variant="outline"
          className="bg-[#0F172A] text-gray-300 border-[#334155] hover:bg-[#1E293B] hover:text-white"
        />
      </div>
      <div className="p-4 overflow-x-auto font-mono text-xs text-emerald-400 leading-relaxed max-h-[380px]">
        <pre className="flex">
          {showLineNumbers && (
            <div className="select-none pr-4 text-[#475569] text-right font-mono">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <code className="text-gray-200 whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  );
};
