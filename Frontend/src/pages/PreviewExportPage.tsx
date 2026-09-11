import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/common/StepIndicator';
import { LiveWidgetPreview } from '../components/preview/LiveWidgetPreview';
import { EmbedCodeTab } from '../components/preview/EmbedCodeTab';
import { JsonLdTab } from '../components/preview/JsonLdTab';
import { Button } from '../components/common/Button';
import { useGeneration } from '../context/GenerationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Check, Download, Save, Eye, Code, FileJson, Loader2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const PreviewExportPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isGuest, setShowGuestAuthModal } = useAuth();
  const {
    productInfo,
    faqs,
    selectedFaqIds,
    projectId,
    generationId,
    seoAnalysis,
    publicationPreview,
    publication,
    isLoadingPublication,
    isPublishing,
    publicationError,
    loadPublicationPreview,
    publishGeneration,
    unpublishGeneration,
  } = useGeneration();

  const [activeTab, setActiveTab] = useState<'preview' | 'embed' | 'schema'>('preview');

  const selectedFaqs = faqs.filter((f) => selectedFaqIds.includes(f.id));
  const isPublished = publication?.status === 'published';

  useEffect(() => {
    if (!projectId || !generationId) {
      navigate('/app/dashboard');
      return;
    }
    // Only load preview if we have SEO analysis, we are not a guest, and not already published
    if (seoAnalysis && !isGuest && !isPublished && !publicationPreview) {
      loadPublicationPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, generationId, seoAnalysis, isGuest, isPublished]);

  const handlePublish = async () => {
    if (!seoAnalysis) {
      toast('Run SEO analysis before publishing.', 'error');
      return;
    }
    if (isGuest) {
      setShowGuestAuthModal(true);
      return;
    }
    try {
      await publishGeneration();
      toast('Generation published successfully!', 'success');
      // Optional: navigate to dashboard or keep them here
      // navigate('/app/dashboard');
    } catch (err: any) {
      // Error is stored in context, no need to navigate away
      toast('Publication failed', 'error');
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishGeneration();
      toast('Generation unpublished.', 'success');
    } catch (err: any) {
      toast('Unpublish failed', 'error');
    }
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            project: projectId,
            generation: generationId,
            product: productInfo,
            faqs: selectedFaqs,
            publication: publication || null,
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

  if (!seoAnalysis) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto mt-12 bg-white rounded-xl shadow-xs border border-[#E5E7EB]">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#111318]">SEO Analysis Required</h2>
        <p className="text-sm text-[#69707D] mt-2 mb-6">
          You must complete the SEO analysis step before you can preview and publish this generation.
        </p>
        <Button variant="primary" onClick={() => navigate('/app/generate/seo')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go to SEO Analysis
        </Button>
      </div>
    );
  }

  const themeToUse = publication?.theme || publicationPreview?.theme;
  const brandToUse = publication?.brand || publicationPreview?.brand;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-left">
      {/* Step Progression Bar */}
      <StepIndicator currentStep={4} />

      {/* Error Banner */}
      {publicationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span className="font-semibold">Publication Error: </span>
          {publicationError}
        </div>
      )}

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

          {isPublished ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnpublish}
              disabled={isPublishing}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              {isPublishing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
              <span>Unpublish</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing || isLoadingPublication}
              className="shadow-xs text-xs"
            >
              {isPublishing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              <span>{isGuest ? 'Publish Generation' : 'Publish to Live'}</span>
            </Button>
          )}
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
      <div className="relative">
        {isLoadingPublication && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl border border-[#E5E7EB]">
            <div className="flex flex-col items-center text-[#635BFF]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm font-medium">Loading Preview...</span>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <LiveWidgetPreview
            title={brandToUse?.siteTitle || productInfo.title}
            faqs={selectedFaqs}
            theme={themeToUse}
            brand={brandToUse}
          />
        )}

        {activeTab === 'embed' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
            <EmbedCodeTab embedCode={publication?.embedCode} isPublished={isPublished} />
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
            <JsonLdTab jsonLd={publication?.jsonLd} isPublished={isPublished} />
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

        {!isPublished && (
          <Button
            variant="primary"
            size="md"
            onClick={handlePublish}
            disabled={isPublishing || isLoadingPublication}
            className="shadow-xs"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
            <span>Publish &amp; Complete</span>
          </Button>
        )}
      </div>
    </div>
  );
};
