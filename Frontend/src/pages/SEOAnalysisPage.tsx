import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/common/StepIndicator';
import { SEOScoreRadial } from '../components/seo/SEOScoreRadial';
import { SEOMetricsList } from '../components/seo/SEOMetricsList';
import { StrategicRecommendations } from '../components/seo/StrategicRecommendations';
import { SERPSnippetPreview } from '../components/seo/SERPSnippetPreview';
import { Button } from '../components/common/Button';
import { useGeneration } from '../context/GenerationContext';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export const SEOAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    productInfo,
    faqs,
    selectedFaqIds,
    seoMetrics,
  } = useGeneration();

  const selectedFaqs = faqs.filter((f) => selectedFaqIds.includes(f.id));

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
          >
            <span>Preview &amp; Export</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Main Analysis Grid (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Radial Score + Recommendations */}
        <div className="space-y-6">
          <SEOScoreRadial
            score={seoMetrics.compositeScore}
            questionCount={selectedFaqIds.length}
            readTime={seoMetrics.estimatedReadTime}
          />
          <StrategicRecommendations />
        </div>

        {/* Right Column: Evaluation Dimensions + SERP Google Simulation */}
        <div className="space-y-6">
          <SEOMetricsList metrics={seoMetrics} />
          <SERPSnippetPreview
            title={productInfo.title}
            url={productInfo.url}
            faqs={selectedFaqs}
          />
        </div>
      </div>

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
        >
          <span>Continue to Preview &amp; Export</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
