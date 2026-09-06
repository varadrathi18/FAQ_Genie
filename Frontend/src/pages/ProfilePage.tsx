import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { User, Mail, Shield, CheckCircle2, CreditCard } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, isGuest, switchToSarah, switchToGuest } = useAuth();
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Profile updated successfully', 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 text-left select-none">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
          Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#69707D] mt-1">
          Manage your personal workspace access, subscription tier, and security preferences.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-[#F1F5F9]">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#635BFF]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#635BFF] text-white flex items-center justify-center font-bold text-xl">
              {isGuest ? 'G' : 'SC'}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#111318]">{currentUser.name}</h2>
              <Badge variant="purple" size="sm">
                {currentUser.tier}
              </Badge>
            </div>
            <p className="text-xs text-[#69707D] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{currentUser.email || 'guest@faqgenie.ai'}</span>
            </p>
            <p className="text-xs text-[#464555] font-medium">{currentUser.role}</p>
          </div>
        </div>

        {/* Subscription / Plan info */}
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEECFF] text-[#635BFF] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#111318] block">
                {currentUser.tier === 'PRO TIER' ? 'Pro Plan Workspace' : 'Free Exploration Tier'}
              </span>
              <span className="text-xs text-[#69707D]">
                Unlimited FAQ generation, live widget CDN hosting, and automatic Schema.org rich results.
              </span>
            </div>
          </div>

          <Badge variant="success" size="sm" className="shrink-0">
            Active · Renews Annually
          </Badge>
        </div>

        {/* Simulation switcher for demo */}
        <div className="pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#69707D]">
          <div>
            <span className="font-semibold text-[#111318] block">Interactive Mode Switcher</span>
            <span>Switch personas to test the guest checkout and save flow.</span>
          </div>

          <div className="flex items-center gap-2">
            {isGuest ? (
              <Button size="sm" onClick={switchToSarah}>
                Switch to Sarah Chen (Pro)
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={switchToGuest}>
                Simulate Guest User
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
