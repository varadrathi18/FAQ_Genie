import React from 'react';
import { Generation } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { ArrowRight, Sparkles } from 'lucide-react';

interface RecentGenerationsTableProps {
  generations: Generation[];
}

export const RecentGenerationsTable: React.FC<RecentGenerationsTableProps> = ({ generations }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden select-none">
      {/* Header */}
      <div className="p-5 border-b border-[#F1F5F9] flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#111318]">Recent Generations</h3>
          <p className="text-xs text-[#69707D] mt-0.5">
            Active FAQ collections published across web properties and documentation portals.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/history')}
          className="text-xs font-semibold text-[#635BFF] hover:text-[#5148E5] flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#69707D] font-mono uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">PROJECT / FEATURE</th>
              <th className="px-5 py-3">FAQS</th>
              <th className="px-5 py-3">SEO SCORE</th>
              <th className="px-5 py-3">STATUS</th>
              <th className="px-5 py-3">LAST UPDATED</th>
              <th className="px-5 py-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {generations.map((gen) => (
              <tr
                key={gen.id}
                className="hover:bg-[#F8F9FA]/70 transition-colors cursor-pointer"
                onClick={() => navigate(`/app/history/${gen.id}`)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#111318]">{gen.projectName}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">
                      {gen.version}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-gray-700">
                  {gen.faqCount} FAQs
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-[#111318]">
                      {gen.seoScore}
                    </span>
                    <span className="text-[10px] font-mono text-[#16845B] bg-[#ECFDF5] px-1 rounded border border-[#A7F3D0]">
                      HIGH
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-gray-500 font-mono">
                  {gen.lastUpdated}
                </td>
                <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/app/history/${gen.id}`)}
                    className="px-3 py-1.5 text-xs font-medium text-[#111318] bg-white border border-[#E5E7EB] hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards (matches Mobile Image 2) */}
      <div className="md:hidden divide-y divide-[#F1F5F9]">
        {generations.map((gen) => (
          <div
            key={gen.id}
            onClick={() => navigate(`/app/history/${gen.id}`)}
            className="p-4 space-y-2.5 active:bg-[#F8F9FA] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#111318]">{gen.projectName}</span>
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">
                  {gen.version}
                </span>
              </div>
              <Badge variant="success" size="sm">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-[#69707D]">
              <div className="flex items-center gap-3">
                <span className="font-mono">{gen.faqCount} FAQs</span>
                <span>•</span>
                <span className="font-mono text-[#111318] font-bold">SEO {gen.seoScore}/100</span>
              </div>
              <span className="font-mono text-[11px]">{gen.lastUpdated}</span>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/history/${gen.id}`);
                }}
                className="w-full py-2 text-xs font-semibold text-[#635BFF] bg-[#EEECFF] rounded-md flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Review Collection</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
