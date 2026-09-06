import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { CopyButton } from '../components/common/CopyButton';
import { useToast } from '../context/ToastContext';
import { Sliders, Key, Webhook, Video, ShieldCheck, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [workspaceName, setWorkspaceName] = useState('Acme Labs Production');
  const [domain, setDomain] = useState('acmelabs.io');
  const [webhookUrl, setWebhookUrl] = useState('https://acmelabs.io/api/webhooks/faqgenie');
  const [zoomConnected, setZoomConnected] = useState(true);
  const [meetConnected, setMeetConnected] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Workspace settings updated successfully!', 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-left select-none">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#69707D] mt-1">
          Configure API credentials, domain verification, and team integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
            <Sliders className="w-4 h-4 text-[#635BFF]" />
            <h2 className="text-base font-semibold text-[#111318]">General Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Workspace Name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              required
            />
            <Input
              label="Primary Site Domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Video Transcription Integrations */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
            <Video className="w-4 h-4 text-[#635BFF]" />
            <h2 className="text-base font-semibold text-[#111318]">Live Audio &amp; Meeting Integrations</h2>
          </div>
          <p className="text-xs text-[#69707D]">
            Automatically listen to team calls or product demos to extract authentic user inquiries.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                  ZM
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#111318] block">Zoom Cloud Audio Sync</span>
                  <span className="text-xs text-[#69707D]">Zero-retention ephemeral audio processing</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setZoomConnected(!zoomConnected)}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  zoomConnected
                    ? 'bg-[#ECFDF5] text-[#16845B] border border-[#A7F3D0]'
                    : 'bg-white border border-[#E5E7EB] text-[#111318]'
                }`}
              >
                {zoomConnected ? 'Connected' : 'Connect'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  GM
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#111318] block">Google Meet Transcripts</span>
                  <span className="text-xs text-[#69707D]">Direct Google Workspace OAuth token</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMeetConnected(!meetConnected)}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  meetConnected
                    ? 'bg-[#ECFDF5] text-[#16845B] border border-[#A7F3D0]'
                    : 'bg-white border border-[#E5E7EB] text-[#111318]'
                }`}
              >
                {meetConnected ? 'Connected' : 'Connect'}
              </button>
            </div>
          </div>
        </div>

        {/* API Credentials & Webhook */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
            <Key className="w-4 h-4 text-[#635BFF]" />
            <h2 className="text-base font-semibold text-[#111318]">API Credentials &amp; Webhooks</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#111318]">Production API Secret Key</label>
                <span className="text-[11px] font-mono text-[#69707D]">READ &amp; WRITE</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="faq_live_99f38bc48a729e01"
                  className="w-full h-10 px-3.5 text-xs font-mono bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[#111318]"
                />
                <CopyButton
                  textToCopy="faq_live_99f38bc48a729e01"
                  label="Copy Key"
                  variant="outline"
                  className="shrink-0 h-10 px-3"
                />
              </div>
            </div>

            <Input
              label="Webhook Re-indexing Endpoint"
              icon={<Webhook className="w-4 h-4 text-[#69707D]" />}
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              helperText="Triggered automatically whenever an FAQ collection is re-generated or modified."
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" variant="primary" className="shadow-xs px-6">
            <Check className="w-4 h-4 mr-1.5" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
