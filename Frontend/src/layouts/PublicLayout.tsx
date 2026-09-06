import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between text-[#111318]">
      {/* Public Header */}
      <header className="h-16 border-b border-[#E5E7EB] bg-white px-6 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center text-white shadow-xs">
            <svg viewBox="0 0 40 40" width="22" height="22" fill="none">
              <path
                d="M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V22C28 23.1046 27.1046 24 26 24H20L15 28V24H14C12.8954 24 12 23.1046 12 22V14Z"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="17" cy="18" r="1.3" fill="white" />
              <circle cx="20.5" cy="18" r="1.3" fill="white" />
              <circle cx="24" cy="18" r="1.3" fill="white" />
              <path
                d="M26 10L27.5 13L30.5 14.5L27.5 16L26 19L24.5 16L21.5 14.5L24.5 13L26 10Z"
                fill="#EEECFF"
              />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#111318]">FAQGenie</span>
        </Link>

        {/* Right Nav */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-4 py-2 text-xs font-semibold rounded-md bg-[#635BFF] text-white hover:bg-[#5148E5] transition-colors flex items-center gap-1.5"
            >
              <span>Go to App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-[#69707D] hover:text-[#111318] transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#635BFF] text-white hover:bg-[#5148E5] transition-colors flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <Sparkles className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-8 px-6 text-center text-xs text-[#69707D]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#111318]">FAQGenie</span>
            <span>— Intelligent FAQ Generator &amp; Orchestration Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/app/dashboard" className="hover:text-[#111318]">
              Dashboard
            </Link>
            <Link to="/app/generate" className="hover:text-[#111318]">
              Generate
            </Link>
            <Link to="/login" className="hover:text-[#111318]">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
