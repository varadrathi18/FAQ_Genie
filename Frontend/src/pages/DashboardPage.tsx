import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';
import { DashboardResponse } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentGenerationsTable } from '../components/dashboard/RecentGenerationsTable';
import { Button } from '../components/common/Button';
import { Plus, HelpCircle, AlertCircle, Loader2, FolderPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isGuest } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await dashboardApi.getDashboard();
        setDashboard(data);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 max-w-7xl mx-auto">
        <Loader2 className="w-10 h-10 animate-spin text-[#635BFF] mb-4" />
        <p className="text-[#69707D]">Loading workspace overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-center border border-red-100">
          <AlertCircle className="w-8 h-8" />
          <h2 className="text-lg font-bold">Failed to Load Dashboard</h2>
          <span className="text-sm">{error}</span>
          <Button onClick={() => window.location.reload()} variant="secondary" className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { overview, recentGenerations } = dashboard;

  // Empty State
  if (overview.projectCount === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
              Workspace Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#69707D] mt-1">
              Welcome back, <span className="text-[#111318] font-medium">{currentUser.name}</span>.
            </p>
          </div>
        </div>

        <div className="text-center py-20 bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center">
          <FolderPlus className="w-12 h-12 text-[#D1D5DB] mb-4" />
          <h3 className="text-lg font-semibold text-[#111318] mb-1">No projects yet</h3>
          <p className="text-sm text-[#69707D] mb-6 max-w-md">
            Get started by generating your first FAQ collection. It only takes a few minutes.
          </p>
          <Button onClick={() => navigate('/app/generate')} className="shadow-xs">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Generate your first FAQ collection</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
            Workspace Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#69707D] mt-1">
            Welcome back, <span className="text-[#111318] font-medium">{currentUser.name}</span>. 
            Managing {overview.projectCount} active {overview.projectCount === 1 ? 'project' : 'projects'}.
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
          label="TOTAL PROJECTS"
          value={overview.projectCount}
        />
        <StatCard
          label="SELECTED FAQS"
          value={overview.selectedFaqCount}
          subtext={`Out of ${overview.faqCount} generated total`}
        />
        <StatCard
          label="PUBLISHED COLLECTIONS"
          value={overview.publishedCount}
        />
        <StatCard
          label="AVG SEO SCORE"
          value={overview.averageSeoScore !== null ? `${overview.averageSeoScore}/100` : "—"}
          subtext={overview.averageSeoScore === null ? "Not analyzed" : undefined}
        />
      </div>

      {/* Main Table: Recent Generations */}
      <RecentGenerationsTable generations={recentGenerations} />
    </div>
  );
};

