import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '../components/common/StepIndicator';
import { Input, Textarea } from '../components/common/Input';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { useGeneration } from '../context/GenerationContext';
import { Sparkles, Globe, RotateCcw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const GeneratePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    productInfo,
    updateProductInfoField,
    startGenerating,
    resetWorkflow,
  } = useGeneration();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInfo.title.trim() || !productInfo.description.trim()) {
      toast('Please provide a feature title and description', 'error');
      return;
    }

    startGenerating(() => {
      toast('12 FAQs synthesized across Nora, Sam, and Pro personas!', 'success');
      navigate('/app/generate/review');
    });
  };

  const handleReset = () => {
    resetWorkflow();
    toast('Reset to sample product spec', 'info');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-left">
      {/* Step Indicator Progression */}
      <StepIndicator currentStep={1} />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
          Tell us what you're launching
        </h1>
        <p className="text-xs sm:text-sm text-[#69707D] mt-1">
          We'll extract the core questions your users will have across every persona.
        </p>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleGenerate} className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
        {/* Card Top Title Bar */}
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

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Title */}
          <Input
            label="Feature / Product Title"
            badge="REQUIRED"
            value={productInfo.title}
            onChange={(e) => updateProductInfoField('title', e.target.value)}
            placeholder="e.g. AI Meeting Summaries & Action Items"
            required
          />

          {/* Description */}
          <Textarea
            label="Description"
            badge="REQUIRED"
            value={productInfo.description}
            onChange={(e) => updateProductInfoField('description', e.target.value)}
            placeholder="Describe what your product does, key benefits, target audience, and how it works..."
            charCount={productInfo.description.length}
            rows={4}
            required
          />

          {/* Target URL */}
          <Input
            label="Target / Documentation URL"
            badge="OPTIONAL"
            icon={<Globe className="w-4 h-4 text-[#69707D]" />}
            value={productInfo.url}
            onChange={(e) => updateProductInfoField('url', e.target.value)}
            placeholder="https://acmelabs.io/features/meeting"
            helperText="We'll crawl this URL to extract authentic technical details and terminology."
          />

          {/* Category Dropdown */}
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
            >
              <option value="new_feature">New Feature Announcement</option>
              <option value="major_release">Major Version Release</option>
              <option value="api_update">API / Developer Infrastructure Update</option>
            </select>
          </div>

          {/* File Upload */}
          <FileUpload
            label="Product Specs & Technical Assets"
            badge="OPTIONAL"
            file={productInfo.specFile}
            onFileChange={(file) => updateProductInfoField('specFile', file)}
          />
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 sm:px-6 bg-[#F8F9FA] border-t border-[#E5E7EB] flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-[#69707D]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset Sample</span>
          </Button>

          <Button type="submit" size="md" className="shadow-xs px-5">
            <Sparkles className="w-4 h-4 mr-2" />
            <span>Generate FAQs (12)</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
