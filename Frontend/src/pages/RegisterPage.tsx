import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('Sarah Chen');
  const [email, setEmail] = useState('sarah.chen@acmelabs.io');
  const [password, setPassword] = useState('••••••••••••');
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email, password);
    toast('Account created successfully! Welcome to FAQGenie Pro.', 'success');
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm text-left">
        <div className="mb-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center text-white mx-auto mb-3 shadow-xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-[#111318] tracking-tight">Create your Workspace</h2>
          <p className="text-xs text-[#69707D] mt-1">
            Start synthesizing persona-balanced FAQs with Google SERP structured schemas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="text-[11px] text-[#69707D] leading-relaxed">
            By registering, you agree to our Terms of Service and isolated zero-retention data privacy standards.
          </div>

          <Button type="submit" className="w-full justify-center h-10 mt-2">
            <span>Create Account &amp; Start</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[#69707D]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#635BFF] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
