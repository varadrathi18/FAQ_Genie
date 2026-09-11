import { BackendSeoAnalysis, SEOMetrics } from '../types';

export const adaptSeoAnalysis = (
  backendData: BackendSeoAnalysis,
  selectedFaqCount: number
): SEOMetrics => {
  return {
    compositeScore: backendData.score,
    questionQuality: backendData.breakdown.answerCompleteness,
    topicCoverage: backendData.breakdown.coverage,
    intentDiversity: backendData.breakdown.sourceCoverage, 
    personaCoverage: backendData.breakdown.personaCoverage,
    duplicateRisk: Math.max(0, 100 - backendData.breakdown.uniqueness),
    estimatedReadTime: `~${Math.max(1, Math.round(selectedFaqCount * 0.5))} min read`,
    recommendations: backendData.recommendations.map(text => ({
      text,
      type: 'tip'
    }))
  };
};
