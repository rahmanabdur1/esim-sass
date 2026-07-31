// ==================== AUTH TYPES ====================
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}
export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

// ==================== ESIM TYPES ====================
export type ESIMStatus = 'active' | 'inactive' | 'expired' | 'pending';

export interface ESIM {
  id: string;
  iccid: string;
  label: string;
  status: ESIMStatus;
  dataTotal: number;
  dataUsed: number;
  dataRemaining: number;
  validFrom: string;
  validTo: string;
  country: Country;
  plan: Plan;
  qrCode: string;
  network: string;
  activationCode: string;
  createdAt: string;
}

// ==================== PLAN TYPES ====================
export interface Plan {
  id: string;
  name: string;
  data: number;
  validity: number;
  price: number;
  currency: string;
  network: string;
  coverage: string[];
  country: Country;
  region?: string;
  features: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

// ==================== COUNTRY TYPES ====================
export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: string;
  continent: string;
  networks: string[];
  coverageQuality: 'excellent' | 'good' | 'fair';
}

// ==================== ORDER TYPES ====================
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  plan: Plan;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod: PaymentMethod | string;
  createdAt: string;
  updatedAt: string;
  esim?: ESIM;
}

// ==================== API TYPES ====================
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

// ==================== FILTER TYPES ====================
export interface PlanFilters {
  country?: string;
  region?: string;
  minData?: number;
  maxData?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'data_asc' | 'data_desc' | 'validity';
  search?: string;
}

// ==================== SUPPORT TYPES ====================
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  content: string;
  sender: 'user' | 'support';
  createdAt: string;
}

// ==================== NOTIFICATION TYPES ====================
export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// ==================== ANALYTICS TYPES ====================
export interface UsageDataPoint {
  date: string;
  used: number;
  total: number;
}

export interface AnalyticsData {
  daily: UsageDataPoint[];
  weekly: UsageDataPoint[];
  monthly: UsageDataPoint[];
}

// ==================== REFERRAL TYPES ====================
export interface ReferralData {
  code: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  totalEarned: number;
  referrals: ReferralEntry[];
}

export interface ReferralEntry {
  id: string;
  email: string;
  status: 'pending' | 'completed';
  reward: number;
  joinedAt: string;
}

// ==================== REWARD TYPES ====================
export interface RewardData {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierPoints: number;
  history: RewardTransaction[];
}

export interface RewardTransaction {
  id: string;
  description: string;
  points: number;
  type: 'earned' | 'redeemed';
  createdAt: string;
}

// ==================== PAYMENT TYPES ====================
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  label: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// ==================== BLOG TYPES ====================
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: BlogAuthor;
  tags: string[];
  publishedAt: string;
  readTime: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface BlogCountry {
  code: string;
  name: string;
  flag: string;
  currency?: string;
  region?: string;
}

// ==================== UI TYPES ====================
export type Theme = 'light' | 'dark' | 'system';
export type ViewMode = 'grid' | 'list';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
