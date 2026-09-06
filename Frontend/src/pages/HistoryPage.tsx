import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockGenerations } from '../data/mockGenerations';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Search, Plus, Sparkles, ExternalLink, Calendar, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');

  const filtered = mockGenerations.filter((gen) => {
    const matchesSearch =
      gen.projectName.toLowerCase().includes(search.toLowerCase()) ||
      gen.productInfo.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || gen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-left select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
            Generation History
          </h1>
          <p className="text-xs sm:text-sm text-[#69707D] mt-1">
            Browse and inspect past FAQ collections, SEO schemas, and deployment artifacts.
          </p>
        </div>

        <Button onClick={() => navigate('/app/generate')} className="shadow-xs text-xs sm:text-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Generation</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#69707D]" />
          <input
            type="text"
            placeholder="Filter generations by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-[#111318] focus:outline-none focus:border-[#635BFF] focus:bg-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'active', 'draft'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
                statusFilter === st
                  ? 'bg-[#111318] text-white shadow-xs'
                  : 'bg-white text-[#69707D] hover:bg-[#F8F9FA]'
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Generations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((gen) => (
          <div
            key={gen.id}
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-[#D1D5DB] transition-all duration-150 flex flex-col justify-between"
          >
            <div>
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-[#111318]">{gen.projectName}</h3>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">
                      {gen.version}
                    </span>
                  </div>
                  <a
                    href={gen.productInfo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#635BFF] hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>{gen.productInfo.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <Badge variant="success" size="sm">
                  Active
                </Badge>
              </div>

              {/* Description preview */}
              <p className="text-xs text-[#69707D] line-clamp-2 leading-relaxed mb-4">
                {gen.productInfo.description}
              </p>

              {/* Stats pill row */}
              <div className="flex items-center gap-4 text-xs text-[#69707D] pt-2 border-t border-[#F1F5F9]">
                <span className="flex items-center gap-1 font-mono">
                  <Layers className="w-3.5 h-3.5 text-[#635BFF]" />
                  <strong className="text-[#111318]">{gen.faqCount}</strong> FAQs
                </span>

                <span className="flex items-center gap-1 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  SEO <strong className="text-[#111318]">{gen.seoScore}</strong>/100
                </span>

                <span className="flex items-center gap-1 font-mono text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {gen.lastUpdated}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#9CA3AF]">
                ID: {gen.id}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/app/history/${gen.id}`)}
                className="text-xs"
              >
                Inspect Collection
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
