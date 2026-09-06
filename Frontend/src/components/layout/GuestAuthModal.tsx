import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus, LogIn } from 'lucide-react';

export const GuestAuthModal: React.FC = () => {
  const { showGuestAuthModal, setShowGuestAuthModal, switchToSarah } = useAuth();
  const navigate = useNavigate();

  if (!showGuestAuthModal) return null;

  const handleLogin = () => {
    switchToSarah();
    setShowGuestAuthModal(false);
    navigate('/login');
  };

  const handleRegister = () => {
    switchToSarah();
    setShowGuestAuthModal(false);
    navigate('/register');
  };

  return (
    <Modal
      isOpen={showGuestAuthModal}
      onClose={() => setShowGuestAuthModal(false)}
      maxWidth="sm"
    >
      <div className="text-center py-2">
        <div className="w-12 h-12 rounded-xl bg-[#EEECFF] text-[#635BFF] flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-[#111318] mb-1.5">
          Save Your FAQ Generation
        </h3>
        <p className="text-sm text-[#69707D] mb-6 leading-relaxed">
          Create an account to save your generation, track continuous SEO schema changes, and sync with production webhooks.
        </p>

        <div className="space-y-2.5">
          <Button
            variant="primary"
            className="w-full justify-center h-10"
            onClick={handleRegister}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </Button>

          <Button
            variant="secondary"
            className="w-full justify-center h-10"
            onClick={handleLogin}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Log In
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-center text-xs text-[#69707D]"
            onClick={() => setShowGuestAuthModal(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
