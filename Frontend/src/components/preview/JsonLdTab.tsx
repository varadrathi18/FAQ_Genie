import React from 'react';
import { FAQ } from '../../types';
import { CodeBlock } from '../common/CodeBlock';

interface JsonLdTabProps {
  faqs: FAQ[];
}

export const JsonLdTab: React.FC<JsonLdTabProps> = ({ faqs }) => {
  const schemaObj = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const jsonString = `<script type="application/ld+json">\n${JSON.stringify(
    schemaObj,
    null,
    2
  )}\n</script>`;

  return (
    <div className="space-y-4 text-left select-none">
      <div>
        <h4 className="text-sm font-semibold text-[#111318]">Schema.org FAQPage JSON-LD</h4>
        <p className="text-xs text-[#69707D] mt-0.5">
          Standard RFC-compliant structured data for Google Search rich result carousels.
        </p>
      </div>

      <CodeBlock code={jsonString} language="JSON-LD" showLineNumbers />
    </div>
  );
};
