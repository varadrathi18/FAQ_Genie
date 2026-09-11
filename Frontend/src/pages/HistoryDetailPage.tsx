import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { historyApi } from '../api/history';
import { GenerationDetail } from '../types';
import { FAQCard } from '../components/faq/FAQCard';
import { LiveWidgetPreview } from '../components/preview/LiveWidgetPreview';
import { EmbedCodeTab } from '../components/preview/EmbedCodeTab';
import { JsonLdTab } from '../components/preview/JsonLdTab';
import { SEOScoreRadial } from '../components/seo/SEOScoreRadial';
import { SEOMetricsList } from '../components/seo/SEOMetricsList';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ArrowLeft, ExternalLink, Calendar, Layers, Eye, Code, FileJson, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const HistoryDetailPage: React.FC = () => {
  const { generationId } = useParams<{ generationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'faqs' | 'preview' | 'seo' | 'embed'>('faqs');

  const [generation, setGeneration] = useState<GenerationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!generationId) return;
      try {
        setIsLoading(true);
        setError(null);
        
        let projectId = location.state?.projectId;
        
        // Fallback: If no projectId passed in state (direct link visit), fetch history list to find it
        if (!projectId) {
          const list = await historyApi.getHistoryList();
          const gen = list.find((g) => g.generationId === generationId);
          if (!gen) {
            throw new Error('Generation not found or you do not have permission to view it.');
          }
          projectId = gen.projectId;
        }

        const detail = await historyApi.getGenerationDetail(projectId, generationId);
        setGeneration(detail);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err.message || 'Failed to load generation details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [generationId, location.state]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Unknown date';
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    } catch {
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 max-w-6xl mx-auto">
        <Loader2 className="w-10 h-10 animate-spin text-[#635BFF] mb-4" />
        <p className="text-[#69707D]">Loading generation details...</p>
      </div>
    );
  }

  if (error || !generation) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-left">
        <button
          type="button"
          onClick={() => navigate('/app/history')}
          className="inline-flex items-center gap-1.5 text-xs text-[#69707D] hover:text-[#111318] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Generations History</span>
        </button>

        <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-center border border-red-100">
          <AlertCircle className="w-8 h-8" />
          <h2 className="text-lg font-bold">Generation Not Found</h2>
          <span className="text-sm">{error || 'The requested generation does not exist.'}</span>
          <Button onClick={() => navigate('/app/history')} variant="secondary" className="mt-2">
            Return to History
          </Button>
        </div>
      </div>
    );
  }

  const selectedFaqs = generation.faqs.filter(f => f.selected);
  const isPublished = generation.publication?.status === 'published';

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
              {generation.inputSnapshot?.title || 'Unknown Project'}
            </h1>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono font-semibold">
              v{generation.version}
            </span>
            {isPublished ? (
              <Badge variant="success" size="sm">
                Published
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Draft
              </Badge>
            )}
          </div>

          <p className="text-xs text-[#69707D] mt-1.5 max-w-2xl leading-relaxed">
            {generation.inputSnapshot?.description || 'No description available.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#69707D] mt-3 font-mono">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#635BFF]" />
              <strong>{selectedFaqs.length}</strong> Selected
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              SEO 
              {generation.seoAnalysis ? (
                <><strong className="text-[#111318]">{generation.seoAnalysis.score}</strong>/100</>
              ) : (
                <span className="text-gray-400 italic">Not analyzed</span>
              )}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              Updated {formatDate(generation.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {generation.inputSnapshot?.url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(generation.inputSnapshot!.url, '_blank')}
              className="text-xs"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/generate')}
            className="text-xs shadow-xs"
          >
            <span>New Generation</span>
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
            {selectedFaqs.length > 0 ? (
              selectedFaqs.map((faq) => (
                <FAQCard
                  key={faq.id}
                  faq={faq}
                  isSelected={true}
                  onToggle={() => {}}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#69707D]">
                No FAQs were selected in this generation.
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <LiveWidgetPreview
            title={generation.inputSnapshot?.title || 'Widget Preview'}
            faqs={selectedFaqs}
          />
        )}

        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {generation.seoAnalysis ? (
              <>
                <SEOScoreRadial
                  score={generation.seoAnalysis.score}
                  questionCount={selectedFaqs.length}
                />
                <SEOMetricsList metrics={[]} backendMetrics={generation.seoAnalysis} />
              </>
            ) : (
              <div className="col-span-full py-16 text-center bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#69707D]">
                SEO analysis was not performed for this generation.
              </div>
            )}
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs">
              <EmbedCodeTab projectId={generation.projectId} />
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

