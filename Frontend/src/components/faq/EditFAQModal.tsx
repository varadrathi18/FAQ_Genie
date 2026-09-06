import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { PersonaBadge } from '../common/PersonaBadge';
import { FAQ } from '../../types';
import { useToast } from '../../context/ToastContext';

interface EditFAQModalProps {
  faq: FAQ | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updated: Partial<FAQ>) => void;
}

export const EditFAQModal: React.FC<EditFAQModalProps> = ({
  faq,
  isOpen,
  onClose,
  onSave,
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question);
      setAnswer(faq.answer);
    }
  }, [faq]);

  if (!faq) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast('Please provide both question and answer', 'error');
      return;
    }
    onSave(faq.id, { question, answer });
    toast('FAQ updated successfully!', 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit FAQ Entry"
      description="Refine phrasing or update technical details before finalizing for SEO."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <PersonaBadge persona={faq.persona} />
          <span className="text-xs font-mono text-[#69707D]">ID: {faq.codeId}</span>
        </div>

        <Input
          label="Question"
          badge="REQUIRED"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question phrasing"
          required
        />

        <Textarea
          label="Answer"
          badge="REQUIRED"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter comprehensive answer"
          rows={5}
          charCount={answer.length}
          required
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB]">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
