export interface Product {
  id: string;
  name: string;
  sku: string;
  asCode?: string | null;
  description?: string | null;
  category?:
    | 'ELECTRONICS'
    | 'FASHION'
    | 'BEAUTY'
    | 'LIFESTYLE'
    | 'FITNESS'
    | 'HOME'
    | 'FOOD'
    | 'OTHER';
  stock?: number | null;
  price: string; // Decimal as string
  imageUrls?: string[] | null;
  metadata?: Record<string, unknown> | null;
  campaignProducts?: CampaignProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface Influencer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  followers?: number | null;
  status: 'COLD' | 'ACTIVE' | 'FINAL';
  platform?: string | null;
  profileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  status: string; // DRAFT, ACTIVE, COMPLETED, CANCELLED
  type?: 'REELS' | 'POSTS' | 'STORIES' | 'MIXED' | null;
  budget?: string | null; // Decimal as string
  budgetSpent?: string | null; // Decimal as string
  budgetAllocated?: string | null; // Decimal as string
  startDate?: string | null;
  endDate?: string | null;
  deliverableDeadline?: string | null;
  brief?: string | null;
  reelsRequired?: number | null;
  postsRequired?: number | null;
  storiesRequired?: number | null;
  storeId: string;
  store?: Store;
  products?: CampaignProduct[];
  influencerLinks?: InfluencerCampaignLink[];
  financialDocuments?: FinancialDocument[];
  invoiceImages?: InvoiceImage[];
  courierShipments?: CourierShipment[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignProduct {
  id: string;
  quantity: number;
  discount?: string | null; // Decimal as string
  campaignId: string;
  productId: string;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

export interface InfluencerCampaignLink {
  id: string;
  rate: string; // Decimal as string
  status: string; // PENDING, ACCEPTED, REJECTED, COMPLETED
  deliverables?: string | null;
  influencerId: string;
  influencer?: Influencer;
  campaignId: string;
  campaign?: Campaign;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialDocument {
  id: string;
  type: 'PO' | 'INVOICE' | 'FORM';
  documentNumber: string;
  amount: string; // Decimal as string
  status: string; // PENDING, APPROVED, PAID, REJECTED
  issueDate: string;
  dueDate?: string | null;
  paidDate?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  filePath?: string | null;
  campaignId: string;
  campaign?: Campaign;
  createdAt: string;
  updatedAt: string;
}

export interface ApifyRunLog {
  id: string;
  runId: string;
  taskId?: string | null;
  status: string; // CREATED, READY, RUNNING, SUCCEEDED, FAILED, TIMED_OUT, ABORTED
  startedAt?: string | null;
  finishedAt?: string | null;
  statusMessage?: string | null;
  resultsCount: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSnapshot {
  id: string;
  timestamp: string;
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget?: string | null; // Decimal as string
  totalInfluencers: number;
  coldInfluencers: number;
  activeInfluencers: number;
  finalInfluencers: number;
  totalRevenue?: string | null; // Decimal as string
  totalExpenses?: string | null; // Decimal as string
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  firmId: string;
  createdAt: string;
  updatedAt: string;
}

// Apify related types
export interface InstagramProfileData {
  username: string;
  fullName: string;
  bio: string;
  followersCount: number;
  profilePictureUrl: string;
  profileUrl: string;
  emails?: string[];
}

export interface ApifyRunResult {
  profileData: InstagramProfileData | null;
  emails: string[];
  success: boolean;
  error?: string;
}

export interface ScrapeProfileRequest {
  instagramUrl: string;
  dryRun?: boolean;
}

export interface ScrapeProfileResponse {
  runId: string;
  message: string;
}

export interface RunStatusResponse {
  runId: string;
  status: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  statusMessage?: string | null;
  resultsCount: number;
  isDryRun: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface CsvImportResult<T> {
  successes: T[];
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export interface InvoiceImage {
  id: string;
  imagePath: string;
  ocrData?: Record<string, unknown> | null;
  extractedTotal?: string | null; // Decimal as string
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  campaignId?: string | null;
  campaign?: Campaign;
  productId?: string | null;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

export interface CourierShipment {
  id: string;
  trackingNumber: string;
  courierName: string;
  courierCompany: string;
  sendStoreId?: string | null;
  sendStore?: Store;
  returnStoreId?: string | null;
  returnStore?: Store;
  influencerId?: string | null;
  influencer?: Influencer;
  campaignId?: string | null;
  campaign?: Campaign;
  sentDate?: string | null;
  receivedDate?: string | null;
  returnedDate?: string | null;
  status:
    | 'PENDING'
    | 'SENT'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'RETURNED'
    | 'FAILED';
  statusTimeline?: TimelineEvent[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  status: string;
  timestamp: string;
  notes?: string;
  location?: string;
  userId?: string;
}
