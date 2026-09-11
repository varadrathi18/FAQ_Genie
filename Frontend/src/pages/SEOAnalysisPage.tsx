import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/common/StepIndicator';
import { SEOScoreRadial } from '../components/seo/SEOScoreRadial';
import { SEOMetricsList } from '../components/seo/SEOMetricsList';
import { StrategicRecommendations } from '../components/seo/StrategicRecommendations';
import { SERPSnippetPreview } from '../components/seo/SERPSnippetPreview';
import { Button } from '../components/common/Button';
import { useGeneration } from '../context/GenerationContext';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { adaptSeoAnalysis } from '../lib/seoAdapter';

export const SEOAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    productInfo,
    faqs,
    selectedFaqIds,
    seoAnalysis,
    isAnalyzingSeo,
    seoError,
    analyzeSeo,
  } = useGeneration();

  const selectedFaqs = faqs.filter((f) => selectedFaqIds.includes(f.id));

  useEffect(() => {
    if (selectedFaqIds.length > 0 && !seoAnalysis && !isAnalyzingSeo && !seoError) {
      analyzeSeo().catch(() => {});
    }
  }, [selectedFaqIds.length, seoAnalysis, isAnalyzingSeo, seoError, analyzeSeo]);

  const adaptedMetrics = seoAnalysis 
    ? adaptSeoAnalysis(seoAnalysis, selectedFaqIds.length) 
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-left">
      {/* Step Progression Bar */}
      <StepIndicator currentStep={3} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
            SEO &amp; Schema Readiness
          </h1>
          <p className="text-xs sm:text-sm text-[#69707D] mt-1">
            Algorithmic scoring of your selected {selectedFaqIds.length} FAQs against Google Search Quality standards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="primary"
            onClick={() => navigate('/app/generate/preview')}
            className="shadow-xs text-xs sm:text-sm"
            disabled={!seoAnalysis || isAnalyzingSeo}
          >
            <span>Preview &amp; Export</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Main Analysis Grid (2 Columns on Desktop) */}
      {isAnalyzingSeo ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
          <Loader2 className="w-8 h-8 text-[#635BFF] animate-spin mb-4" />
          <h3 className="text-lg font-medium text-[#111318]">Algorithmic Scoring in Progress</h3>
          <p className="text-sm text-[#69707D] mt-1">Analyzing coverage, uniqueness, and search intent...</p>
        </div>
      ) : seoError ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-red-100 rounded-lg shadow-xs px-4 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-[#111318] mb-2">Analysis Failed</h3>
          <p className="text-sm text-[#69707D] mb-6 max-w-md">{seoError}</p>
          <Button variant="outline" onClick={() => analyzeSeo()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Retry Analysis</span>
          </Button>
        </div>
      ) : adaptedMetrics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Radial Score + Recommendations */}
          <div className="space-y-6">
            <SEOScoreRadial
              score={adaptedMetrics.compositeScore}
              questionCount={selectedFaqIds.length}
              readTime={adaptedMetrics.estimatedReadTime}
            />
            {adaptedMetrics.recommendations.length > 0 && (
              <StrategicRecommendations recommendations={adaptedMetrics.recommendations} />
            )}
          </div>

          {/* Right Column: Evaluation Dimensions + SERP Google Simulation */}
          <div className="space-y-6">
            <SEOMetricsList metrics={adaptedMetrics} />
            <SERPSnippetPreview
              title={productInfo.title}
              url={productInfo.url}
              faqs={selectedFaqs}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E5E7EB] rounded-lg shadow-xs">
          <p className="text-sm text-[#69707D]">No FAQs selected for analysis.</p>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate('/app/generate/review')}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Review FAQs</span>
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/app/generate/preview')}
          className="shadow-xs"
          disabled={!seoAnalysis || isAnalyzingSeo}
        >
          <span>Continue to Preview &amp; Export</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
