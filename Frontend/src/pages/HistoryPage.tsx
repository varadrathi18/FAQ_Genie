import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyApi } from '../api/history';
import { HistoryGeneration } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Search, Plus, Sparkles, ExternalLink, Calendar, Layers, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  const [generations, setGenerations] = useState<HistoryGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await historyApi.getHistoryList();
        setGenerations(data);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err.message || 'Failed to fetch history.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = generations.filter((gen) => {
    const searchTarget = `${gen.projectName} ${gen.projectDescription || ''}`.toLowerCase();
    const matchesSearch = searchTarget.includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'published') {
      matchesStatus = gen.publicationStatus === 'published';
    } else if (statusFilter === 'draft') {
      matchesStatus = gen.publicationStatus !== 'published';
    }
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Unknown date';
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    } catch {
      return 'Unknown date';
    }
  };

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
          {(['all', 'published', 'draft'] as const).map((st) => (
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

      {/* States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#635BFF] mb-4" />
          <p className="text-sm text-[#69707D]">Loading generation history...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-20 bg-white border border-[#E5E7EB] rounded-xl">
          <Layers className="w-10 h-10 text-[#D1D5DB] mx-auto mb-4" />
          <h3 className="text-sm font-medium text-[#111318] mb-1">No generations found</h3>
          <p className="text-xs text-[#69707D]">
            {generations.length === 0 
              ? "You haven't generated any FAQs yet." 
              : "No generations match your current search and filters."}
          </p>
          {generations.length === 0 && (
            <Button onClick={() => navigate('/app/generate')} className="mt-4 shadow-xs text-xs">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create Your First Generation</span>
            </Button>
          )}
        </div>
      )}

      {/* Generations Grid */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((gen) => (
            <div
              key={gen.generationId}
              className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-[#D1D5DB] transition-all duration-150 flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base text-[#111318]">{gen.projectName}</h3>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">
                        v{gen.version}
                      </span>
                    </div>
                    {gen.projectUrl && (
                      <a
                        href={gen.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#635BFF] hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>{gen.projectUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {gen.publicationStatus === 'published' ? (
                    <Badge variant="success" size="sm">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Draft
                    </Badge>
                  )}
                </div>

                {/* Description preview */}
                <p className="text-xs text-[#69707D] line-clamp-2 leading-relaxed mb-4">
                  {gen.projectDescription || 'No description available.'}
                </p>

                {/* Stats pill row */}
                <div className="flex items-center gap-4 text-xs text-[#69707D] pt-2 border-t border-[#F1F5F9]">
                  <span className="flex items-center gap-1 font-mono">
                    <Layers className="w-3.5 h-3.5 text-[#635BFF]" />
                    <strong className="text-[#111318]">{gen.selectedFaqCount || gen.faqCount}</strong> FAQs
                  </span>

                  <span className="flex items-center gap-1 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    SEO 
                    {gen.seoScore !== null ? (
                      <><strong className="text-[#111318]">{gen.seoScore}</strong>/100</>
                    ) : (
                      <span className="text-gray-400 italic">Not analyzed</span>
                    )}
                  </span>

                  <span className="flex items-center gap-1 font-mono text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(gen.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#9CA3AF]" title={gen.generationId}>
                  ID: {gen.generationId.substring(0, 8)}...
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/app/history/${gen.generationId}`, { state: { projectId: gen.projectId } })}
                  className="text-xs"
                >
                  Inspect Collection
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

