import React, { useState } from 'react';
import { CodeBlock } from '../common/CodeBlock';
import { cn } from '../../lib/utils';

export const EmbedCodeTab: React.FC<{ projectId?: string }> = ({ projectId = 'gen_01' }) => {
  const [activeLang, setActiveLang] = useState<'html' | 'react' | 'webflow'>('html');

  const htmlSnippet = `<!-- FAQGenie Live Embed Container -->
<div id="faqgenie-widget" data-collection="${projectId}"></div>

<!-- FAQGenie Async Script Engine -->
<script
  src="https://cdn.faqgenie.ai/v1/widget.js"
  data-project="${projectId}"
  data-theme="auto"
  data-persona-filter="enabled"
  async
></script>`;

  const reactSnippet = `import { FAQGenieWidget } from '@faqgenie/react';

export default function FAQSection() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <FAQGenieWidget
        projectId="${projectId}"
        theme="light"
        enablePersonas={true}
        onFaqExpanded={(faqId) => console.log('FAQ expanded:', faqId)}
      />
    </section>
  );
}`;

  const webflowSnippet = `<!-- 1. Add an Embed element in Webflow Designer -->
<!-- 2. Paste the following HTML block: -->
<div class="faqgenie-embed-root" data-project="${projectId}"></div>
<script src="https://cdn.faqgenie.ai/v1/widget.js" async></script>`;

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
          <button
            type="button"
            onClick={() => setActiveLang('react')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              activeLang === 'react' ? 'bg-white text-[#111318] shadow-xs' : 'text-[#69707D] hover:text-[#111318]'
            )}
          >
            React
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('webflow')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
              activeLang === 'webflow' ? 'bg-white text-[#111318] shadow-xs' : 'text-[#69707D] hover:text-[#111318]'
            )}
          >
            Webflow / Shopify
          </button>
        </div>
      </div>

      {activeLang === 'html' && (
        <CodeBlock code={htmlSnippet} language="HTML" showLineNumbers />
      )}
      {activeLang === 'react' && (
        <CodeBlock code={reactSnippet} language="TypeScript / JSX" showLineNumbers />
      )}
      {activeLang === 'webflow' && (
        <CodeBlock code={webflowSnippet} language="HTML" showLineNumbers />
      )}
    </div>
  );
};
