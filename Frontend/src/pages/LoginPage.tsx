import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('sarah.chen@acmelabs.io');
  const [password, setPassword] = useState('••••••••••••');
  const { login, switchToSarah } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    toast('Welcome back, Sarah Chen!', 'success');
    navigate('/app/dashboard');
  };

  const handleQuickDemo = () => {
    switchToSarah();
    toast('Logged in as Sarah Chen (Pro Tier)', 'success');
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm text-left">
        <div className="mb-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center text-white mx-auto mb-3 shadow-xs">
            <LogIn className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-[#111318] tracking-tight">Sign In to FAQGenie</h2>
          <p className="text-xs text-[#69707D] mt-1">
            Access your active FAQ collections, schema audits, and webhook syncs.
          </p>
        </div>

        {/* Quick Demo Login Banner */}
        <div className="mb-6 p-3 bg-[#EEECFF] border border-[#635BFF]/20 rounded-lg flex items-center justify-between">
          <div className="text-xs">
            <span className="font-semibold text-[#493ee5] block">Demo Account Ready</span>
            <span className="text-[#69707D] text-[11px]">Sarah Chen (Head of Product Marketing)</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-[#635BFF] text-white hover:bg-[#5148E5] transition-colors"
          >
            1-Click Demo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#111318]">Password</label>
              <a href="#" className="text-xs text-[#635BFF] hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full justify-center h-10 mt-2">
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[#69707D]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#635BFF] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
