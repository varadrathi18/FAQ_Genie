import { User } from '../types';

export const mockUsers: Record<string, User> = {
  sarah: {
    id: 'user_sarah_01',
    name: 'Sarah Chen',
    email: 'sarah.chen@acmelabs.io',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    role: 'Head of Product Marketing',
    tier: 'PRO TIER',
    isGuest: false,
  },
  guest: {
    id: 'user_guest_temp',
    name: 'Guest User',
    email: '',
    avatarUrl: '',
    role: 'Explorer',
    tier: 'FREE TIER',
    isGuest: true,
  },
};
