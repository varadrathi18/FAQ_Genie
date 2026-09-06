import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { GenerationProvider } from './context/GenerationContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <GenerationProvider>
            <AppRoutes />
          </GenerationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
