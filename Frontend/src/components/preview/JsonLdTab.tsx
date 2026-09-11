import React from 'react';
import { CodeBlock } from '../common/CodeBlock';
import { Loader2 } from 'lucide-react';

interface JsonLdTabProps {
  jsonLd?: string;
  isPublished?: boolean;
}

export const JsonLdTab: React.FC<JsonLdTabProps> = ({ jsonLd, isPublished }) => {
  if (!isPublished) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-[#69707D]">
        <CodeBlock code="<!-- Publish generation to view JSON-LD schema -->" language="HTML" />
        <p className="mt-4 text-sm font-medium">Publish this generation to generate the Schema.org structured data.</p>
      </div>
    );
  }

  if (!jsonLd) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-[#69707D]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#635BFF]" />
        <p className="text-sm font-medium">Loading JSON-LD schema...</p>
      </div>
    );
  }

  const jsonString = `<script type="application/ld+json">\n${jsonLd}\n</script>`;

  return (
    <div className="space-y-4 text-left select-none">
      <div>
        <h4 className="text-sm font-semibold text-[#111318]">Schema.org FAQPage JSON-LD</h4>
        <p className="text-xs text-[#69707D] mt-0.5">
          Standard RFC-compliant structured data for Google Search rich result carousels.
        </p>
      </div>

      <CodeBlock code={jsonString} language="HTML" showLineNumbers />
    </div>
  );
};
