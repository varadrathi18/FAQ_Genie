import React, { useState } from 'react';
import { Search, Menu, X, ArrowLeft, Shield } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface TopBarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { currentUser, isGuest, logout, switchToGuest } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Check if we can navigate back on mobile
  const canGoBack = location.pathname.startsWith('/app/generate/') || location.pathname.startsWith('/app/history/');

  return (
    <header className="h-16 border-b border-[#E5E7EB] bg-white px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left side: Breadcrumb on Desktop / Mobile Nav Controls */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger / Back button */}
        <div className="flex items-center md:hidden">
          {canGoBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 text-[#111318] hover:bg-gray-100 rounded-md"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 -ml-1.5 text-[#111318] hover:bg-gray-100 rounded-md"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Mobile Logo & Title */}
          <Link to="/app/dashboard" className="flex items-center gap-2 ml-2">
            <div className="w-7 h-7 rounded-lg bg-[#635BFF] flex items-center justify-center text-white">
              <svg viewBox="0 0 40 40" width="18" height="18" fill="none">
                <path
                  d="M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V22C28 23.1046 27.1046 24 26 24H20L15 28V24H14C12.8954 24 12 23.1046 12 22V14Z"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-semibold text-sm text-[#111318]">Generate</span>
          </Link>
        </div>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#69707D]">
          <Link to="/app/dashboard" className="hover:text-[#111318] transition-colors">
            FAQGENIE
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[#111318] font-semibold">WORKSPACE</span>
        </div>
      </div>

      {/* Right side: Search and User Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search input (Hidden on very small screens, visible on md+) */}
        <div className="relative hidden sm:block w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#69707D]" />
          <input
            type="text"
            placeholder="Search FAQs... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#F8F9FA] hover:bg-white focus:bg-white border border-[#E5E7EB] focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] rounded-md text-[#111318] placeholder-[#9CA3AF] transition-all"
          />
        </div>

        {/* Guest mode warning indicator */}
        {isGuest && (
          <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[#FEF3C7] text-[#B45309] font-medium border border-[#FDE68A]">
            <Shield className="w-3 h-3" /> Guest Mode
          </span>
        )}

        {/* User Avatar with interactive dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center focus:outline-none ring-2 ring-transparent hover:ring-[#EEECFF] rounded-full transition-all"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#635BFF] text-white flex items-center justify-center font-semibold text-xs">
                {isGuest ? 'G' : (currentUser?.name?.charAt(0) || 'U')}
              </div>
            )}
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#F1F5F9]">
                <p className="text-xs font-semibold text-[#111318]">{currentUser?.name || 'Guest User'}</p>
                <p className="text-[11px] text-[#69707D] truncate">
                  {currentUser?.email || 'Browsing as Guest'}
                </p>
                <div className="mt-1.5 inline-block text-[10px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#EEECFF] text-[#493ee5]">
                  {currentUser?.tier || 'FREE'}
                </div>
              </div>

              <Link
                to="/app/profile"
                onClick={() => setShowUserDropdown(false)}
                className="block px-4 py-2 text-xs text-[#111318] hover:bg-[#F8F9FA]"
              >
                Account Profile
              </Link>
              <Link
                to="/app/settings"
                onClick={() => setShowUserDropdown(false)}
                className="block px-4 py-2 text-xs text-[#111318] hover:bg-[#F8F9FA]"
              >
                Workspace Settings
              </Link>

              <div className="border-t border-[#F1F5F9] my-1 pt-1">
                {isGuest ? (
                  <button
                    onClick={() => {
                      navigate('/login');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#635BFF] hover:bg-[#EEECFF]/40 font-medium"
                  >
                    Log In / Register
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-[#F8F9FA]"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
