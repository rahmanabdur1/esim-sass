// ==================== APP CONSTANTS ====================
export const APP_NAME = 'eSIM Platform';
export const APP_DESCRIPTION = 'Global eSIM connectivity for travelers';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://esimplatform.com';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.esimplatform.com/v1';

// ==================== AUTH CONSTANTS ====================
export const TOKEN_KEY = 'esim_access_token';
export const REFRESH_TOKEN_KEY = 'esim_refresh_token';
export const TOKEN_EXPIRY_KEY = 'esim_token_expiry';

// ==================== ROUTES ====================
export const ROUTES = {
  HOME: '/',
  PLANS: '/plans',
  COUNTRIES: '/countries',
  ABOUT: '/about',
  CONTACT: '/contact',
  BLOG: '/blog',
  FAQ: '/faq',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  DASHBOARD: '/dashboard',
  MY_ESIMS: '/dashboard/my-esims',
  ESIM_DETAILS: '/dashboard/esim-details',
  BUY_PLAN: '/dashboard/buy-plan',
  CHECKOUT: '/dashboard/checkout',
  ORDERS: '/dashboard/orders',
  INVOICES: '/dashboard/invoices',
  ANALYTICS: '/dashboard/analytics',
  NOTIFICATIONS: '/dashboard/notifications',
  SUPPORT: '/dashboard/support',
  REFERRAL: '/dashboard/referral',
  REWARDS: '/dashboard/rewards',
  KNOWLEDGE_BASE: '/dashboard/knowledge-base',
  AFFILIATE: '/affiliate',
  COMPARE: '/dashboard/compare',
  TRAVEL_PLANNER: '/dashboard/travel-planner',
  ACTIVITY: '/dashboard/activity',
  ADVANCED_ANALYTICS: '/dashboard/advanced-analytics',
  PRIVACY_CENTER: '/dashboard/privacy',
  SYSTEM_STATUS: '/system-status',
  PROFILE: '/dashboard/profile',
  SECURITY: '/dashboard/security',
  PAYMENT_METHODS: '/dashboard/payment-methods',
  SETTINGS: '/dashboard/settings',
} as const;

// ==================== QUERY KEYS ====================
export const QUERY_KEYS = {
  USER: ['user'],
  ESIMS: ['esims'],
  ESIM: (id: string) => ['esim', id],
  PLANS: ['plans'],
  PLAN: (id: string) => ['plan', id],
  COUNTRIES: ['countries'],
  COUNTRY: (id: string) => ['country', id],
  ORDERS: ['orders'],
  ORDER: (id: string) => ['order', id],
  INVOICES: ['invoices'],
  ANALYTICS: ['analytics'],
  NOTIFICATIONS: ['notifications'],
  SUPPORT_TICKETS: ['support-tickets'],
  REFERRAL: ['referral'],
  REWARDS: ['rewards'],
  PAYMENT_METHODS: ['payment-methods'],
  BLOG_POSTS: ['blog-posts'],
  BLOG_POST: (slug: string) => ['blog-post', slug],
} as const;

// ==================== PAGINATION ====================
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ==================== REGIONS ====================
export const REGIONS = [
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'americas', label: 'Americas' },
  { value: 'africa', label: 'Africa' },
  { value: 'oceania', label: 'Oceania' },
  { value: 'middle-east', label: 'Middle East' },
] as const;

// ==================== DATA OPTIONS ====================
export const DATA_OPTIONS = [
  { value: '1', label: '1 GB' },
  { value: '3', label: '3 GB' },
  { value: '5', label: '5 GB' },
  { value: '10', label: '10 GB' },
  { value: '20', label: '20 GB' },
  { value: 'unlimited', label: 'Unlimited' },
] as const;

// ==================== VALIDITY OPTIONS ====================
export const VALIDITY_OPTIONS = [
  { value: '7', label: '7 Days' },
  { value: '15', label: '15 Days' },
  { value: '30', label: '30 Days' },
  { value: '60', label: '60 Days' },
  { value: '90', label: '90 Days' },
] as const;

// ==================== SORT OPTIONS ====================
export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'data_asc', label: 'Data: Low to High' },
  { value: 'data_desc', label: 'Data: High to Low' },
  { value: 'validity', label: 'Validity' },
] as const;

// ==================== STATUS CONFIGS ====================
export const ESIM_STATUS_CONFIG = {
  active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-100' },
  inactive: { label: 'Inactive', color: 'text-gray-600', bg: 'bg-gray-100' },
  expired: { label: 'Expired', color: 'text-red-600', bg: 'bg-red-100' },
  pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' },
} as const;

export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  processing: { label: 'Processing', color: 'text-blue-600', bg: 'bg-blue-100' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100' },
  failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-100' },
  refunded: { label: 'Refunded', color: 'text-purple-600', bg: 'bg-purple-100' },
} as const;

export const TICKET_STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-blue-600', bg: 'bg-blue-50' },
  in_progress: { label: 'In Progress', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  resolved: { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50' },
  closed: { label: 'Closed', color: 'text-gray-600', bg: 'bg-gray-50' },
} as const;

// ==================== REWARD TIERS ====================
export const REWARD_TIERS = {
  bronze: { label: 'Bronze', minPoints: 0, color: '#CD7F32', next: 1000 },
  silver: { label: 'Silver', minPoints: 1000, color: '#C0C0C0', next: 5000 },
  gold: { label: 'Gold', minPoints: 5000, color: '#FFD700', next: 10000 },
  platinum: { label: 'Platinum', minPoints: 10000, color: '#E5E4E2', next: null },
} as const;

// ==================== SOCIAL LINKS ====================
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/esimplatform',
  facebook: 'https://facebook.com/esimplatform',
  instagram: 'https://instagram.com/esimplatform',
  linkedin: 'https://linkedin.com/company/esimplatform',
};
