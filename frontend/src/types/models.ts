export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  price: string; // Decimal as string
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
  budget?: string | null; // Decimal as string
  startDate?: string | null;
  endDate?: string | null;
  storeId: string;
  store?: Store;
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
