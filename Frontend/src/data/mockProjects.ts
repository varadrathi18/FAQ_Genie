import { Project } from '../types';

export const mockProjects: Project[] = [
  {
    id: 'proj_01',
    name: 'AI Meeting Summaries',
    description: 'Real-time multi-speaker transcription and automatic Jira action-item extractor.',
    url: 'https://acmelabs.io/features/meeting',
    activeGenerations: 3,
    totalFaqs: 18,
    updatedAt: '2 hours ago',
  },
  {
    id: 'proj_02',
    name: 'Customer Portal 2.0',
    description: 'Self-service authentication and billing access management.',
    url: 'https://acmelabs.io/portal',
    activeGenerations: 1,
    totalFaqs: 12,
    updatedAt: 'Yesterday',
  },
  {
    id: 'proj_03',
    name: 'Stripe Billing v4',
    description: 'Usage-based metering, automatic invoice reconciliation, and tax compliance.',
    url: 'https://acmelabs.io/billing',
    activeGenerations: 2,
    totalFaqs: 16,
    updatedAt: 'Sep 4, 2026',
  },
  {
    id: 'proj_04',
    name: 'SOC-2 Security Hub',
    description: 'Compliance attestation, data encryption policy, and zero-retention audit trails.',
    url: 'https://acmelabs.io/security',
    activeGenerations: 1,
    totalFaqs: 10,
    updatedAt: 'Aug 28, 2026',
  },
];
