import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

import { DashboardPage } from '../pages/DashboardPage';
import { GeneratePage } from '../pages/GeneratePage';
import { ReviewFaqsPage } from '../pages/ReviewFaqsPage';
import { SEOAnalysisPage } from '../pages/SEOAnalysisPage';
import { PreviewExportPage } from '../pages/PreviewExportPage';
import { HistoryPage } from '../pages/HistoryPage';
import { HistoryDetailPage } from '../pages/HistoryDetailPage';
import { KnowledgePage } from '../pages/KnowledgePage';
import { SettingsPage } from '../pages/SettingsPage';
import { ProfilePage } from '../pages/ProfilePage';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated / App Workspace Pages */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        
        {/* Multi-step Generation Workflow */}
        <Route path="generate" element={<GeneratePage />} />
        <Route path="generate/review" element={<ReviewFaqsPage />} />
        <Route path="generate/seo" element={<SEOAnalysisPage />} />
        <Route path="generate/preview" element={<PreviewExportPage />} />

        {/* History and Details */}
        <Route path="history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="history/:generationId" element={<ProtectedRoute><HistoryDetailPage /></ProtectedRoute>} />

        {/* Knowledge Base and Drift */}
        <Route path="knowledge" element={<ProtectedRoute><KnowledgePage /></ProtectedRoute>} />

        {/* User and Workspace Management */}
        <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
