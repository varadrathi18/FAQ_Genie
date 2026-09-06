import { FAQ, SEOMetrics } from '../types';

export const mockFaqs: FAQ[] = [
  // Nora - Beginner Persona
  {
    id: 'faq-nora-01',
    codeId: 'NORA-01',
    persona: 'nora',
    question: 'Do I need coding experience to set up FAQGenie on my site?',
    answer:
      'No technical knowledge is required. You can embed the widget by pasting a single line of script into your site header, or automatically sync it via our Shopify, WordPress, and Webflow native integrations.',
    recommended: true,
    category: 'Beginners',
    isVerified: true,
  },
  {
    id: 'faq-nora-02',
    codeId: 'NORA-02',
    persona: 'nora',
    question: 'How quickly does the engine start generating relevant answers?',
    answer:
      'The initial workspace parses your live URL and documentation within 90 seconds. Once extracted, high-frequency customer inquiries are mapped immediately into draft answer blocks.',
    recommended: false,
    category: 'Beginners',
    isVerified: true,
  },
  {
    id: 'faq-nora-03',
    codeId: 'NORA-03',
    persona: 'nora',
    question: 'How do I use AI Meeting Summaries in my team calls?',
    answer:
      'Connect your Zoom or Google Meet account in Settings. Summaries will automatically generate and appear in your dashboard within 60 seconds after the call ends.',
    recommended: true,
    category: 'Beginners',
    isVerified: true,
  },
  {
    id: 'faq-nora-04',
    codeId: 'NORA-04',
    persona: 'nora',
    question: 'Can team members edit FAQ answers before they go live?',
    answer:
      'Yes, you have full editorial control. Team members can review, edit wording, approve drafts, or hide specific answers before publishing to your live public site.',
    recommended: false,
    category: 'Beginners',
    isVerified: true,
  },

  // Sam - Skeptical & Trust Persona
  {
    id: 'faq-sam-01',
    codeId: 'SAM-01',
    persona: 'sam',
    question: 'Will our customer inquiries or proprietary content be used to train AI models?',
    answer:
      'Never. We operate under an isolated data tenancy architecture. Your internal knowledge bases and support tickets are never retained or leveraged across shared model training pipelines.',
    recommended: true,
    category: 'Security & Audit',
    isVerified: true,
  },
  {
    id: 'faq-sam-02',
    codeId: 'SAM-02',
    persona: 'sam',
    question: 'Can we review and approve all answers before they appear on live production?',
    answer:
      'Yes. Every single generated question enters a strict staging queue. Nothing goes public without explicit manual confirmation from an authenticated workspace administrator.',
    recommended: true,
    category: 'Security & Audit',
    isVerified: true,
  },
  {
    id: 'faq-sam-03',
    codeId: 'SAM-03',
    persona: 'sam',
    question: 'Is audio transcribed locally or sent to external servers?',
    answer:
      'Audio streams are processed in our SOC-2 Type II compliant VPC with zero-retention policies. Your private recordings are never used to train foundational AI models.',
    recommended: true,
    category: 'Security & Audit',
    isVerified: true,
  },
  {
    id: 'faq-sam-04',
    codeId: 'SAM-04',
    persona: 'sam',
    question: 'What happens if two participants speak simultaneously?',
    answer:
      'Our multi-channel diarization model separates concurrent speech streams with 94.8% speaker disambiguation accuracy without leaking speech data across sessions.',
    recommended: false,
    category: 'Security & Audit',
    isVerified: true,
  },

  // Pro - Technical Persona
  {
    id: 'faq-pro-01',
    codeId: 'PRO-01',
    persona: 'pro',
    question: 'Does the output support programmatic Schema.org FAQPage JSON-LD injection?',
    answer:
      'Yes. Every export bundle includes validated JSON-LD schema with RFC-compliant URI entities, automatically optimized for Google Rich Results and knowledge rendering engines.',
    recommended: true,
    category: 'Developer',
    isVerified: true,
  },
  {
    id: 'faq-pro-02',
    codeId: 'PRO-02',
    persona: 'pro',
    question: 'Can we hook FAQ synchronization directly into our headless CI/CD build steps?',
    answer:
      'A comprehensive REST & GraphQL management API provides programmatic webhook triggers, allowing you to pull generated artifacts directly during static site builds.',
    recommended: true,
    category: 'Developer',
    isVerified: true,
  },
  {
    id: 'faq-pro-03',
    codeId: 'PRO-03',
    persona: 'pro',
    question: 'Can we export summary action items via GraphQL or webhooks?',
    answer:
      'Yes. Webhook events meeting.summary.created and action_item.assigned trigger automated JSON payloads compatible with Zapier, Slack, and Jira Cloud.',
    recommended: true,
    category: 'Developer',
    isVerified: true,
  },
  {
    id: 'faq-pro-04',
    codeId: 'PRO-04',
    persona: 'pro',
    question: 'What rate limits apply to automated API crawler re-indexing?',
    answer:
      'Enterprise and Pro tier workspaces can initiate up to 500 endpoint crawls per hour with automated rate-throttling, exponential backoff, and full cache-control header support.',
    recommended: false,
    category: 'Developer',
    isVerified: true,
  },
];

export const defaultSelectedFaqIds = [
  'faq-nora-01',
  'faq-nora-03',
  'faq-sam-01',
  'faq-sam-03',
  'faq-pro-01',
  'faq-pro-03',
];

export const mockSEOMetrics: SEOMetrics = {
  compositeScore: 92,
  questionQuality: 94,
  topicCoverage: 95,
  intentDiversity: 90,
  personaCoverage: 88,
  duplicateRisk: 0.4,
  estimatedReadTime: '~3 min',
  recommendations: [
    {
      text: 'Strong question phrasing targeting high-volume conversational search queries.',
      tag: 'PRIMARY KEYWORD TARGETING INTACT',
      type: 'check',
    },
    {
      text: 'Harmonious balance between trust/security inquiries and onboarding workflow.',
      tag: 'FUNNEL COVERAGE VERIFIED',
      type: 'check',
    },
    {
      text: 'Consider embedding schema JSON-LD directly into target page headers for rich snippet indexing.',
      type: 'tip',
    },
  ],
};
