import React, { useState } from 'react';
import { CodeBlock } from '../common/CodeBlock';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const EmbedCodeTab: React.FC<{ embedCode?: string; isPublished?: boolean }> = ({ embedCode, isPublished }) => {
  const [activeLang, setActiveLang] = useState<'html' | 'react' | 'webflow'>('html');

  if (!isPublished) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-[#69707D]">
        <CodeBlock code="<!-- Publish generation to view embed code -->" language="HTML" />
        <p className="mt-4 text-sm font-medium">Publish this generation to generate the embed script.</p>
      </div>
    );
  }

  if (!embedCode) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-[#69707D]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#635BFF]" />
        <p className="text-sm font-medium">Loading embed code...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left select-none">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-[#111318]">Embedding Instructions</h4>
          <p className="text-xs text-[#69707D] mt-0.5">
            Embed via CDN script tag, React component, or Webflow custom code.
          </p>
        </div>

        {/* Framework toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg">
          <button
            type="button"
            onClick={() => setActiveLang('html')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              activeLang === 'html' ? 'bg-white text-[#111318] shadow-xs' : 'text-[#69707D] hover:text-[#111318]'
            )}
          >
            HTML / Script
          </button>
        </div>
      </div>

      {activeLang === 'html' && (
        <CodeBlock code={embedCode} language="HTML" showLineNumbers />
      )}
    </div>
  );
};
