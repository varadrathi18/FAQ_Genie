import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Search, Code, CheckCircle, Zap } from 'lucide-react';
import { Button } from '../components/common/Button';
import { PersonaBadge } from '../components/common/PersonaBadge';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchToGuest, switchToSarah } = useAuth();

  const handleStartGuest = () => {
    switchToGuest();
    navigate('/app/generate');
  };

  const handleStartPro = () => {
    switchToSarah();
    navigate('/app/dashboard');
  };

  return (
    <div className="bg-[#F8F9FA] text-[#111318]">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEECFF] text-[#635BFF] text-xs font-semibold uppercase tracking-wider mb-6 border border-[#635BFF]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent FAQ Generator &amp; Orchestration</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111318] max-w-4xl mx-auto leading-[1.12]">
          Turn Product Knowledge into High-Converting,{' '}
          <span className="text-[#635BFF]">Persona-Aware FAQs</span>.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#69707D] max-w-2xl mx-auto leading-relaxed">
          Automatically extract customer questions from URLs and specs. Balance answers across{' '}
          <strong className="text-[#111318]">Nora (Beginner)</strong>,{' '}
          <strong className="text-[#111318]">Sam (Trust &amp; Risks)</strong>, and{' '}
          <strong className="text-[#111318]">Pro (Technical)</strong> personas with built-in SEO scoring.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Button size="lg" onClick={handleStartPro} className="w-full sm:w-auto text-sm">
            <span>Enter Workspace (Sarah Chen · Pro)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={handleStartGuest}
            className="w-full sm:w-auto text-sm"
          >
            <span>Try Guest Generator Flow</span>
            <Sparkles className="w-4 h-4 ml-1 text-[#635BFF]" />
          </Button>
        </div>

        <p className="mt-3 text-xs text-[#69707D]">
          No credit card required. Generate live widgets and Schema.org JSON-LD in under 90 seconds.
        </p>

        {/* Hero Interactive Mockup Preview */}
        <div className="mt-14 max-w-4xl mx-auto bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden text-left">
          {/* Mockup Header */}
          <div className="p-4 bg-[#F8F9FA] border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
              <span className="ml-2 font-mono text-xs text-[#69707D]">
                faqgenie.ai/workspace/ai-meeting-summaries
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#16845B] border border-[#A7F3D0] text-[11px] font-mono font-semibold">
                SEO 92/100
              </span>
            </div>
          </div>

          {/* Mockup Body Content */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <PersonaBadge persona="nora" />
              <span className="text-xs text-[#69707D]">NORA-01</span>
            </div>
            <h3 className="text-lg font-semibold text-[#111318]">
              Do I need coding experience to set up FAQGenie on my site?
            </h3>
            <p className="text-sm text-[#464555] leading-relaxed">
              No technical knowledge is required. You can embed the widget by pasting a single line of script into your site header, or automatically sync it via our Shopify, WordPress, and Webflow native integrations.
            </p>

            <div className="pt-4 border-t border-dashed border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 text-xs text-[#69707D]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[#16845B]">
                  <CheckCircle className="w-3.5 h-3.5" /> Google Rich Results Ready
                </span>
                <span>•</span>
                <span className="font-mono">Schema.org JSON-LD Injected</span>
              </div>
              <span className="text-[#635BFF] font-medium">12 FAQs Synthesized</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
              Engineered for Conversion, Search, and Trust
            </h2>
            <p className="mt-2 text-sm text-[#69707D]">
              Traditional FAQ generators produce boring, one-dimensional lists. FAQGenie balances every inquiry across three user archetypes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center font-bold">
                N
              </div>
              <h3 className="text-base font-semibold text-[#111318]">Nora · The Beginner</h3>
              <p className="text-xs text-[#69707D] leading-relaxed">
                Focused on setup friction, pricing transparency, and onboarding velocity. Answers remove hesitation for new buyers.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center font-bold">
                S
              </div>
              <h3 className="text-base font-semibold text-[#111318]">Sam · The Skeptic</h3>
              <p className="text-xs text-[#69707D] leading-relaxed">
                Addresses data privacy, zero-retention policies, SOC-2 compliance, and vendor risks to unblock security sign-offs.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center font-bold">
                P
              </div>
              <h3 className="text-base font-semibold text-[#111318]">Pro · The Technologist</h3>
              <p className="text-xs text-[#69707D] leading-relaxed">
                Covers webhooks, rate limits, schema entities, and CI/CD pipelines so developers can evaluate integrations immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO & Export section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#635BFF]">
              ALGORITHMIC SEARCH AUDITING
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#111318]">
              Instant Composite SEO Scoring for FAQ Collections
            </h2>
            <p className="text-sm text-[#69707D] leading-relaxed">
              We audit your selected questions collectively against Google Search Quality standards. Measure question quality, topic breadth, persona coverage, and semantic duplication before pushing live.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-[#111318]">
                <Zap className="w-4 h-4 text-[#635BFF]" />
                <span>Google SERP Rich Snippets with JSON-LD Schema</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#111318]">
                <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                <span>Zero keyword cannibalization audit</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#111318]">
                <Code className="w-4 h-4 text-[#7E22CE]" />
                <span>One-line async script or native React component embed</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#69707D]">EVALUATION MATRIX</span>
              <span className="text-xs font-mono font-bold text-[#16845B]">92 / 100 EXCELLENT</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Question Quality</span>
                  <span className="font-mono font-semibold">94%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-[#635BFF] rounded-full w-[94%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Topic Coverage</span>
                  <span className="font-mono font-semibold">95%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-[#635BFF] rounded-full w-[95%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Intent Diversity</span>
                  <span className="font-mono font-semibold">90%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-[#635BFF] rounded-full w-[90%]" />
                </div>
              </div>
            </div>
            <Button
              className="w-full mt-4 justify-center"
              onClick={() => navigate('/app/generate')}
            >
              Start Generating FAQs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
