import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentGenerationsTable } from '../components/dashboard/RecentGenerationsTable';
import { mockGenerations } from '../data/mockGenerations';
import { Button } from '../components/common/Button';
import { Plus, Sparkles, TrendingUp, CheckCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isGuest } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
            Workspace Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#69707D] mt-1">
            Welcome back, <span className="text-[#111318] font-medium">{currentUser.name}</span>. Managing 4 active FAQ collections and live schema embeds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate('/app/generate')}
            className="shadow-xs text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Generation</span>
          </Button>
        </div>
      </div>

      {/* Guest Mode Warning Banner if Guest */}
      {isGuest && (
        <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#B45309]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>
              You are currently viewing in <strong>Guest Exploration Mode</strong>. You can generate and preview FAQs freely.
            </span>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="px-3 py-1 font-semibold bg-[#B45309] text-white rounded hover:bg-[#92400E] transition-colors shrink-0"
          >
            Sign Up to Save
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="TOTAL FAQS"
          value="46"
          change="+12% this month"
          trend="up"
          subtext="Active across all live endpoints"
        />
        <StatCard
          label="ACTIVE GENERATIONS"
          value="4"
          change="All live"
          trend="up"
          subtext="No collections pending review"
        />
        <StatCard
          label="AVG SEO SCORE"
          value="91%"
          change="Top 5%"
          trend="up"
          subtext="Calculated across 46 questions"
        />
        <StatCard
          label="AUTO-SYNCED QUERIES"
          value="1,280"
          change="+240 this week"
          trend="up"
          subtext="CDN script & React widgets"
        />
      </div>

      {/* Main Table: Recent Generations */}
      <RecentGenerationsTable generations={mockGenerations} />

      {/* Quality Health & Persona Distribution Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persona Coverage Health Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 space-y-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111318]">Persona Balance Index</h3>
            <span className="text-[11px] font-mono text-[#16845B] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
              OPTIMAL
            </span>
          </div>
          <p className="text-xs text-[#69707D]">
            Distribution of questions across buyer awareness and technical sophistication stages.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#1D4ED8] font-medium">Nora (Beginner)</span>
                <span className="font-mono text-[#69707D]">38% (18 FAQs)</span>
              </div>
              <div className="h-1.5 bg-blue-50 rounded-full">
                <div className="h-full bg-blue-500 rounded-full w-[38%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#B45309] font-medium">Sam (Trust &amp; Risks)</span>
                <span className="font-mono text-[#69707D]">34% (16 FAQs)</span>
              </div>
              <div className="h-1.5 bg-amber-50 rounded-full">
                <div className="h-full bg-amber-500 rounded-full w-[34%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#7E22CE] font-medium">Pro (Technical)</span>
                <span className="font-mono text-[#69707D]">28% (12 FAQs)</span>
              </div>
              <div className="h-1.5 bg-purple-50 rounded-full">
                <div className="h-full bg-purple-500 rounded-full w-[28%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Card */}
        <div className="bg-gradient-to-br from-[#EEECFF] to-[#F4F3FF] border border-[#D9D6FE] rounded-lg p-5 flex flex-col justify-between select-none">
          <div>
            <div className="w-8 h-8 rounded-lg bg-[#635BFF] text-white flex items-center justify-center mb-3 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#111318]">New Feature Launch?</h3>
            <p className="text-xs text-[#464555] mt-1.5 leading-relaxed">
              Synthesize 12 high-converting FAQs from your product documentation in seconds.
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => navigate('/app/generate')}
              className="w-full justify-center text-xs"
            >
              <span>Start 4-Step FAQ Generation</span>
            </Button>
          </div>
        </div>

        {/* Sync Status Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col justify-between select-none">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#69707D]">
                INTEGRATION SYNC
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-base font-semibold text-[#111318]">Production Webhooks Active</h3>
            <p className="text-xs text-[#69707D] mt-1.5 leading-relaxed">
              Automatic re-indexing active on <strong>acmelabs.io</strong> with zero-delay edge cache purging.
            </p>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#69707D]">
            <span>Last audit: 12 min ago</span>
            <span className="text-[#635BFF] font-medium">99.98% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
};
