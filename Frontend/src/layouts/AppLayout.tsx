import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { GuestAuthModal } from '../components/layout/GuestAuthModal';
import { useGeneration } from '../context/GenerationContext';
import { LoadingSynthesis } from '../components/common/LoadingSynthesis';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isGenerating } = useGeneration();

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-72 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Guest Save Flow Authentication Modal */}
      <GuestAuthModal />

      {/* Generation Loading State */}
      {isGenerating && <LoadingSynthesis />}
    </div>
  );
};
