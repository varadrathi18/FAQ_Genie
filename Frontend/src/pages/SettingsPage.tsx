import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import { Sliders, ShieldCheck, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [workspaceName, setWorkspaceName] = useState('Acme Labs Production');
  const [domain, setDomain] = useState('acmelabs.io');

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
