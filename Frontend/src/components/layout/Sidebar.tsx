import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Sparkles, History, Database, Settings, User as UserIcon, Plus, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { currentUser, isGuest, logout, switchToGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/generate', label: 'Generate', icon: Sparkles },
    { to: '/app/history', label: 'History', icon: History },
    { to: '/app/knowledge', label: 'Knowledge', icon: Database },
  ];

  const secondaryNavItems = [
    { to: '/app/settings', label: 'Settings', icon: Settings },
    { to: '/app/profile', label: 'Profile', icon: UserIcon },
  ];

  const isGeneratingActive = location.pathname.startsWith('/app/generate');

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col justify-between h-full select-none">
      {/* Top section: Logo, CTA, and main navigation */}
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 40 40" width="24" height="24" fill="none">
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
        </div>

        {/* Primary Action Button */}
        <div className="p-4">
          <button
            onClick={() => {
              navigate('/app/generate');
              handleNavClick();
            }}
            className="w-full h-10 px-4 rounded-md bg-[#635BFF] hover:bg-[#5148E5] active:bg-[#4338CA] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate</span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/app/generate'
                ? isGeneratingActive
                : location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-[#EEECFF] text-[#493ee5]'
                    : 'text-[#69707D] hover:text-[#111318] hover:bg-[#F8F9FA]'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#493ee5]' : 'text-[#69707D]')} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Secondary Navigation links */}
        <div className="pt-6 mt-6 px-3 border-t border-[#F1F5F9] space-y-1">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-[#EEECFF] text-[#493ee5]'
                    : 'text-[#69707D] hover:text-[#111318] hover:bg-[#F8F9FA]'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#493ee5]' : 'text-[#69707D]')} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom section: User Card & Role Switcher */}
      <div className="p-3 border-t border-[#E5E7EB] bg-[#F8F9FA]/60">
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-white transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser?.name || 'User'}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#635BFF] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                {isGuest ? 'G' : (currentUser?.name?.charAt(0) || 'U')}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#111318] truncate leading-tight">
                {currentUser?.name || 'Guest User'}
              </p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#69707D] font-medium">
                {currentUser?.tier || 'FREE'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!isGuest) {
                logout();
              } else {
                navigate('/login');
              }
            }}
            title={isGuest ? 'Log In' : 'Sign Out'}
            className="p-1.5 text-[#69707D] hover:text-[#111318] rounded hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
