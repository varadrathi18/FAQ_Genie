import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/common/StepIndicator';
import { LiveWidgetPreview } from '../components/preview/LiveWidgetPreview';
import { EmbedCodeTab } from '../components/preview/EmbedCodeTab';
import { JsonLdTab } from '../components/preview/JsonLdTab';
import { Button } from '../components/common/Button';
import { useGeneration } from '../context/GenerationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Check, Download, Save, Eye, Code, FileJson } from 'lucide-react';
import { cn } from '../lib/utils';

export const PreviewExportPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isGuest, setShowGuestAuthModal } = useAuth();
  const {
    productInfo,
    faqs,
    selectedFaqIds,
  } = useGeneration();

  const [activeTab, setActiveTab] = useState<'preview' | 'embed' | 'schema'>('preview');

  const selectedFaqs = faqs.filter((f) => selectedFaqIds.includes(f.id));

  const handleSaveGeneration = () => {
    if (isGuest) {
      // Trigger prompt #19: Guest Auth Modal!
      setShowGuestAuthModal(true);
    } else {
      toast('Generation saved successfully to AI Meeting Summaries!', 'success');
      setTimeout(() => navigate('/app/dashboard'), 800);
    }
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            product: productInfo,
            faqs: selectedFaqs,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${productInfo.title.toLowerCase().replace(/\s+/g, '-')}-faqs.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast('Downloaded JSON export bundle', 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-left">
      {/* Step Progression Bar */}
      <StepIndicator currentStep={4} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
            Preview &amp; Export FAQs
          </h1>
          <p className="text-xs sm:text-sm text-[#69707D] mt-1">
            Review your interactive widget, copy the embed script, or download the structured JSON-LD schema.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Export JSON</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveGeneration}
            className="shadow-xs text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            <span>Save Generation</span>
          </Button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5E7EB] rounded-lg w-full sm:w-auto self-start overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap',
            activeTab === 'preview'
              ? 'bg-[#635BFF] text-white shadow-xs'
              : 'text-[#69707D] hover:text-[#111318] hover:bg-gray-100'
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Widget Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('embed')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap',
            activeTab === 'embed'
              ? 'bg-[#635BFF] text-white shadow-xs'
              : 'text-[#69707D] hover:text-[#111318] hover:bg-gray-100'
          )}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Embed Script</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap',
            activeTab === 'schema'
              ? 'bg-[#635BFF] text-white shadow-xs'
              : 'text-[#69707D] hover:text-[#111318] hover:bg-gray-100'
          )}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>Schema.org JSON-LD</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'preview' && (
          <LiveWidgetPreview
            title={productInfo.title}
            faqs={selectedFaqs}
          />
        )}

        {activeTab === 'embed' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
            <EmbedCodeTab />
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
            <JsonLdTab faqs={selectedFaqs} />
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate('/app/generate/seo')}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to SEO Analysis</span>
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleSaveGeneration}
          className="shadow-xs"
        >
          <Check className="w-4 h-4 mr-1.5" />
          <span>Save &amp; Complete</span>
        </Button>
      </div>
    </div>
  );
};
