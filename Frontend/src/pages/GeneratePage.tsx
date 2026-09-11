import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/common/StepIndicator';
import { Input, Textarea } from '../components/common/Input';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { useGeneration } from '../context/GenerationContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Globe, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { projectsApi } from '../api/projects';
import { generationsApi } from '../api/generations';
import { knowledgeApi } from '../api/knowledge';
import { faqsApi } from '../api/faqs';
import { useJobPolling } from '../hooks/useJobPolling';

export const GeneratePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, setShowGuestAuthModal } = useAuth();
  const {
    productInfo,
    updateProductInfoField,
    resetWorkflow,
    setProjectId,
    setGenerationId,
    setFaqs,
    deselectAllFaqs,
  } = useGeneration();

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const { pollJob } = useJobPolling();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInfo.title.trim() || !productInfo.description.trim()) {
      toast('Please provide a feature title and description', 'error');
      return;
    }

    if (!isAuthenticated) {
      setShowGuestAuthModal(true);
      return;
    }

    setIsGenerating(true);
    setLoadingText('Creating project...');
    deselectAllFaqs();

    try {
      // 1. Create Project
      const projectRes = await projectsApi.createProject({
        title: productInfo.title,
        description: productInfo.description,
        websiteUrl: productInfo.url?.trim() || undefined
      });
      const projectId = projectRes.id;
      setProjectId(projectId);

      // 2. Create Generation
      setLoadingText('Initializing generation...');
      const genRes = await generationsApi.createGeneration(projectId, { inputSnapshot: productInfo });
      const generationId = genRes.id;
      setGenerationId(generationId);

      // 3. Knowledge Ingestion
      if (productInfo.url?.trim()) {
        setLoadingText('Ingesting website knowledge...');
        const knowRes = await knowledgeApi.ingestWebsite(projectId, productInfo.url);
        await pollJob(knowRes.jobId);
      } else {
        setLoadingText('Processing product description...');
        const knowRes = await knowledgeApi.ingestText(projectId, productInfo.title, productInfo.description);
        await pollJob(knowRes.jobId);
      }

      // 4. Generate FAQs
      setLoadingText('Generating FAQs...');
      const faqRes = await faqsApi.generateFaqs(projectId, generationId);
      await pollJob(faqRes.jobId);

      // 5. Fetch Generation to get real FAQs
      setLoadingText('Fetching results...');
      const finalGenRes = await generationsApi.getGeneration(projectId, generationId);
      
      if (finalGenRes.faqs) {
        setFaqs(finalGenRes.faqs);
      }

      toast(`Successfully generated ${finalGenRes.faqs?.length || 0} FAQs!`, 'success');
      navigate('/app/generate/review');

    } catch (error: any) {
      toast(error.message || 'Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    resetWorkflow();
    toast('Reset to blank product spec', 'info');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-left">
      <StepIndicator currentStep={1} />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
          Tell us what you're launching
        </h1>
        <p className="text-xs sm:text-sm text-[#69707D] mt-1">
          We'll extract the core questions your users will have across every persona.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#EEECFF] text-[#635BFF] flex items-center justify-center text-xs font-bold font-mono">
              1
            </span>
            <h2 className="text-base font-semibold text-[#111318]">Product Information</h2>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#69707D] font-semibold">
            CORE DETAILS
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <Input
            label="Feature / Product Title"
            badge="REQUIRED"
            value={productInfo.title}
            onChange={(e) => updateProductInfoField('title', e.target.value)}
            placeholder="e.g. AI Meeting Summaries & Action Items"
            required
            disabled={isGenerating}
          />

          <Textarea
            label="Description"
            badge="REQUIRED"
            value={productInfo.description}
            onChange={(e) => updateProductInfoField('description', e.target.value)}
            placeholder="Describe what your product does, key benefits, target audience, and how it works..."
            charCount={productInfo.description.length}
            rows={4}
            required
            disabled={isGenerating}
          />

          <Input
            label="Target / Documentation URL"
            badge="OPTIONAL"
            icon={<Globe className="w-4 h-4 text-[#69707D]" />}
            value={productInfo.url || ''}
            onChange={(e) => updateProductInfoField('url', e.target.value)}
            placeholder="https://acmelabs.io/features/meeting"
            helperText="We'll crawl this URL to extract authentic technical details and terminology."
            disabled={isGenerating}
          />

          <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#111318]">Release Category</label>
              <span className="text-[11px] font-semibold text-[#69707D] tracking-wider uppercase">
                REQUIRED
              </span>
            </div>
            <select
              value={productInfo.category}
              onChange={(e) => updateProductInfoField('category', e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-[#E5E7EB] rounded-md text-[#111318] focus:outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#EEECFF]"
              disabled={isGenerating}
            >
              <option value="new_feature">New Feature Announcement</option>
              <option value="major_release">Major Version Release</option>
              <option value="api_update">API / Developer Infrastructure Update</option>
            </select>
          </div>

          <FileUpload
            label="Product Specs & Technical Assets"
            badge="OPTIONAL"
            file={productInfo.specFile}
            onFileChange={(file) => updateProductInfoField('specFile', file)}
          />
        </div>

        <div className="p-4 sm:px-6 bg-[#F8F9FA] border-t border-[#E5E7EB] flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-[#69707D]"
            disabled={isGenerating}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset</span>
          </Button>

          <Button type="submit" size="md" className="shadow-xs px-5" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Generate FAQs</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
