import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockGenerations } from '../data/mockGenerations';
import { mockFaqs } from '../data/mockFaqs';
import { FAQCard } from '../components/faq/FAQCard';
import { LiveWidgetPreview } from '../components/preview/LiveWidgetPreview';
import { EmbedCodeTab } from '../components/preview/EmbedCodeTab';
import { JsonLdTab } from '../components/preview/JsonLdTab';
import { SEOScoreRadial } from '../components/seo/SEOScoreRadial';
import { SEOMetricsList } from '../components/seo/SEOMetricsList';
import { mockSEOMetrics } from '../data/mockFaqs';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ArrowLeft, ExternalLink, Calendar, Layers, Eye, Code, FileJson, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export const HistoryDetailPage: React.FC = () => {
  const { generationId } = useParams<{ generationId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'faqs' | 'preview' | 'seo' | 'embed'>('faqs');

  const generation = mockGenerations.find((g) => g.id === generationId) || mockGenerations[0];
  const selectedFaqs = mockFaqs.filter((f) => generation.selectedFaqIds.includes(f.id));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-left select-none">
      {/* Top back navigation */}
      <button
        type="button"
        onClick={() => navigate('/app/history')}
        className="inline-flex items-center gap-1.5 text-xs text-[#69707D] hover:text-[#111318] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Generations History</span>
      </button>

      {/* Header Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#111318] tracking-tight">
              {generation.projectName}
            </h1>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono font-semibold">
              {generation.version}
            </span>
            <Badge variant="success" size="sm">
              Active
            </Badge>
          </div>

          <p className="text-xs text-[#69707D] mt-1.5 max-w-2xl leading-relaxed">
            {generation.productInfo.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#69707D] mt-3 font-mono">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#635BFF]" />
              <strong>{generation.faqCount}</strong> Questions Published
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              SEO Score: <strong>{generation.seoScore}</strong>/100
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              Updated {generation.lastUpdated}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(generation.productInfo.url, '_blank')}
            className="text-xs"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/generate')}
            className="text-xs shadow-xs"
          >
            <span>Re-Generate</span>
          </Button>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E7EB] rounded-lg w-full sm:w-auto self-start overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('faqs')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all',
            activeTab === 'faqs' ? 'bg-[#635BFF] text-white shadow-xs' : 'text-[#69707D] hover:bg-gray-100'
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Questions ({selectedFaqs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all',
            activeTab === 'preview' ? 'bg-[#635BFF] text-white shadow-xs' : 'text-[#69707D] hover:bg-gray-100'
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Widget Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all',
            activeTab === 'seo' ? 'bg-[#635BFF] text-white shadow-xs' : 'text-[#69707D] hover:bg-gray-100'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>SEO Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('embed')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all',
            activeTab === 'embed' ? 'bg-[#635BFF] text-white shadow-xs' : 'text-[#69707D] hover:bg-gray-100'
          )}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Embed &amp; JSON-LD</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'faqs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedFaqs.map((faq) => (
              <FAQCard
                key={faq.id}
                faq={faq}
                isSelected={true}
                onToggle={() => {}}
              />
            ))}
          </div>
        )}

        {activeTab === 'preview' && (
          <LiveWidgetPreview
            title={generation.projectName}
            faqs={selectedFaqs}
          />
        )}

        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SEOScoreRadial
              score={generation.seoScore}
              questionCount={selectedFaqs.length}
            />
            <SEOMetricsList metrics={mockSEOMetrics} />
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
              <EmbedCodeTab projectId={generation.id} />
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
              <JsonLdTab faqs={selectedFaqs} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
