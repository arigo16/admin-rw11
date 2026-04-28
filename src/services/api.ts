import axios from 'axios';
import { removeSecureItem, STORAGE_KEYS } from '@/utils/storage';

// ============ TypeScript Interfaces ============

// Base Response
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

// Paginated Response
export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Auth
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Pengurus
export interface Pengurus {
  id: number;
  nama: string;
  jabatan: string;
  bidang: string;
  periode: string | null;
  sequence: number;
  foto: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// RW Info
export interface RwInfo {
  [key: string]: string | string[] | object;
}

// Asset
export interface Asset {
  id: number;
  nama: string;
  kategori: string;
  kondisi: 'baik' | 'rusak_ringan' | 'rusak_berat';
  deskripsi: string | null;
  foto: string | null;
  jumlah: number;
  tanggal_perolehan: string | null;
  created_at: string;
  updated_at: string;
}

// Gallery
export interface GalleryPhoto {
  id: number;
  gallery_event_id: number;
  foto: string;
  caption: string | null;
  sequence: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryEvent {
  id: number;
  nama_event: string;
  deskripsi: string | null;
  tanggal_event: string | null;
  lokasi: string | null;
  photos: GalleryPhoto[];
  created_at: string;
  updated_at: string;
}

// Berita
export interface Berita {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  ringkasan: string | null;
  thumbnail: string | null;
  kategori: string | null;
  author_id: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    name: string;
  } | null;
}

// Dokumen
export interface Dokumen {
  id: number;
  nama: string;
  kategori: string | null;
  deskripsi: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  is_public: boolean;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  uploader: {
    id: number;
    name: string;
  } | null;
}

// Transaction Type
export interface TransactionType {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Transaction
export interface Transaction {
  id: number;
  id_settlement: string;
  mutation: 'IN' | 'OUT';
  type_id: number;
  amount: string;
  balance_before: string;
  balance_after: string;
  transaction_date: string;
  description: string | null;
  attachment: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  type: TransactionType;
  creator: {
    id: number;
    name: string;
  };
}

// Transaction Balance
export interface TransactionBalance {
  balance: number;
  formatted_balance: string;
  last_transaction: {
    id: number;
    id_settlement: string;
    mutation: 'IN' | 'OUT';
    amount: string;
    transaction_date: string;
  } | null;
  last_updated: string | null;
}

// Transaction Summary
export interface TransactionSummary {
  total_in: number;
  total_out: number;
  count_in: number;
  count_out: number;
  net: number;
  current_balance: number;
  formatted: {
    total_in: string;
    total_out: string;
    net: string;
    current_balance: string;
  };
}

// Contributor (Iuran Rutin)
export interface Contributor {
  id: number;
  code: string;
  name: string;
  type: 'RT' | 'RUKO' | 'LAINNYA';
  amount: string;
  is_active: boolean;
  start_month: number | null;
  start_year: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  bills?: ContributorBill[];
}

// Contributor Bill (Tagihan Iuran)
export interface ContributorBill {
  id: number;
  contributor_id: number;
  year_bill: number;
  month_bill: number;
  amount: string;
  status: 'PAID' | 'UNPAID';
  transaction_id: number | null;
  paid_at: string | null;
  paid_by: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  contributor?: Contributor;
  transaction?: Transaction;
  paid_by_user?: {
    id: number;
    name: string;
  } | null;
}

// Bills Summary
export interface BillsSummaryMonth {
  month: number;
  month_name: string;
  total_bills: number;
  paid_count: number;
  unpaid_count: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
}

export interface BillsSummary {
  year: number;
  months: BillsSummaryMonth[];
  totals: {
    total_bills: number;
    paid_count: number;
    unpaid_count: number;
    total_amount: number;
    paid_amount: number;
    unpaid_amount: number;
  };
}

// ============ RT Types ============

// Religion enum
export const RELIGIONS = [
  'ISLAM',
  'KRISTEN',
  'KATHOLIK',
  'BUDDHA',
  'HINDU',
  'KHONGHUCU'
] as const;
export type Religion = typeof RELIGIONS[number];

// Relatives enum
export const RELATIVES = [
  'Ibu',
  'Ayah',
  'Anak',
  'Istri',
  'Suami',
  'Kakek',
  'Nenek',
  'Cucu',
  'Paman',
  'Bibi',
  'Saudara Kandung',
  'Saudara Tiri',
  'Lainnya'
] as const;
export type Relatives = typeof RELATIVES[number];

// Family Status enum
export const FAMILY_STATUS = [
  { value: 'TK', label: 'Belum Kawin' },
  { value: 'K0', label: 'Kawin' },
  { value: 'K1', label: 'Kawin Anak 1' },
  { value: 'K2', label: 'Kawin Anak 2' },
  { value: 'K3', label: 'Kawin Anak 3' },
  { value: 'K4', label: 'Kawin Anak 4' },
  { value: 'K5', label: 'Kawin Anak 5' },
  { value: 'TK0', label: 'Bercerai' },
  { value: 'TK1', label: 'Bercerai Anak 1' },
  { value: 'TK2', label: 'Bercerai Anak 2' },
  { value: 'TK3', label: 'Bercerai Anak 3' },
  { value: 'TK4', label: 'Bercerai Anak 4' },
  { value: 'TK5', label: 'Bercerai Anak 5' },
] as const;
export type FamilyStatus = typeof FAMILY_STATUS[number]['value'];

// RT Owner/Occupant
export interface RtResident {
  id: number;
  name: string;
  handphone: string | null;
  kk: string | null;
  sum_family: string | null;
  religion: string | null;
}

// RT Member (family member)
export interface RtMember {
  id: number;
  house_id: number;
  name: string;
  kk: string | null;
  handphone: string | null;
  religion: string | null;
  relatives: string | null;
  is_domicile: boolean;
}

// RT House
export interface RtHouse {
  id: number;
  block: string;
  no: number;
  full_address?: string;
  occupied: boolean;
  occupied_by_owner: boolean;
  pay_ipl: boolean;
  ipl_amount: number | null;
  pay_cash: boolean;
  cash_amount: number | null;
  pay_pkk: boolean;
  pkk_amount: number | null;
  owner: RtResident | null;
  occupant: RtResident | null;
}

// RT House Detail (includes bills and members)
export interface RtHouseDetail extends RtHouse {
  bills_ipl: RtBillSummary[];
  bills_cash: RtBillSummary[];
  bills_pkk: RtBillSummary[];
  members: RtMember[];
}

// RT Bill Summary (for house detail)
export interface RtBillSummary {
  id: number;
  year_bill: number;
  month_bill: number;
  amount: number;
  status: 'UNPAID' | 'PENDING' | 'PAID';
  deleted_at: string | null;
}

// RT Bill
export interface RtBill {
  id: number;
  house_id: number;
  year_bill: number;
  month_bill: number;
  amount: number;
  status: 'UNPAID' | 'PENDING' | 'PAID';
  house?: {
    id: number;
    block: string;
    no: number;
  };
}

// RT Transaction
export interface RtTransaction {
  id: number;
  category: 'UTAMA' | 'PKK';
  type: string;
  id_settlement: string;
  notes: string;
  amount: number;
  mutation: 'DEBIT' | 'KREDIT';
  image: string | null;
  created_by: string;
  created_at: string;
}

// RT Balance
export interface RtBalance {
  balance: number;
  balance_pkk: number;
  total: number;
  last_updated: string;
}

// RT Vote Option
export interface RtVoteOption {
  id: number;
  option_name: string;
  option_desc: string | null;
  vote_count?: number;
  percentage?: number;
}

// RT Vote
export interface RtVote {
  id: number;
  title: string;
  description: string | null;
  start_vote: string;
  end_vote: string;
  is_active: boolean;
  is_multi_choice: boolean;
  answers_count?: number;
  options: RtVoteOption[];
}

// RT Information
export interface RtInformation {
  id: number;
  banner: string | null;
  title: string;
  content: string;
  is_pin: boolean;
  created_at: string;
}

// RT Contribution
export interface RtContribution {
  id: number;
  banner: string | null;
  name: string;
  description: string | null;
  goals: number;
  min_amount: number;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  total_collected: number;
  progress_percentage: number;
  transactions_count: number;
}

// RT Complaint
export interface RtComplaint {
  id: number;
  complaint: string;
  image: string | null;
  is_read: boolean;
  created_at: string;
  house: {
    id: number;
    block: string;
    no: number;
  };
}

// RT Suggestion
export interface RtSuggestion {
  id: number;
  suggestion: string;
  is_read: boolean;
  created_at: string;
  house: {
    id: number;
    block: string;
    no: number;
  };
}

// RT Dashboard
export interface RtDashboard {
  rt: number;
  houses: {
    total: number;
    occupied: number;
    empty: number;
  };
  balance: {
    main: number;
    pkk: number;
    total: number;
  };
  unpaid_bills: {
    ipl: number;
    cash: number;
    pkk: number;
    total: number;
  };
  pending: {
    complaints: number;
    suggestions: number;
  };
  active_votes: number;
}

// ============ Axios Instance ============

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Don't redirect if already on login page (to avoid reload loop)
        const isLoginPage = window.location.pathname.includes('/auth/login');
        if (!isLoginPage) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          removeSecureItem(STORAGE_KEYS.USER);
          // Remove auth cookie
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ============ Error Handler ============

export const handleApiError = (error: any): string => {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return data.message || 'Data not found.';
      case 422:
        const errors = data.errors;
        if (errors) {
          return Object.values(errors).flat().join(', ');
        }
        return data.message || 'Validation error.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || 'An error occurred.';
    }
  }

  if (error.request) {
    return 'Network error. Please check your connection.';
  }

  return 'An unexpected error occurred.';
};

// ============ Auth API ============

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<LoginResponse>>('/login', { email, password }),
  logout: () => api.post<ApiResponse<null>>('/logout'),
  getUser: () => api.get<ApiResponse<{ user: User }>>('/user'),
};

// ============ Pengurus API ============

export const pengurusAPI = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    bidang?: string;
    is_active?: boolean;
  }) => api.get<PaginatedResponse<Pengurus>>('/pengurus', { params }),
  getByBidang: () => api.get<ApiResponse<Record<string, Pengurus[]>>>('/pengurus-by-bidang'),
  getById: (id: number) => api.get<ApiResponse<Pengurus>>(`/pengurus/${id}`),
  create: (data: Partial<Pengurus>) => api.post<ApiResponse<Pengurus>>('/pengurus', data),
  update: (id: number, data: Partial<Pengurus>) => api.put<ApiResponse<Pengurus>>(`/pengurus/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/pengurus/${id}`),
};

// ============ RW Info API ============

export const rwInfoAPI = {
  getAll: () => api.get<ApiResponse<RwInfo>>('/rw-info'),
  getByKey: (key: string) => api.get<ApiResponse<{ key: string; value: any }>>(`/rw-info/${key}`),
  update: (key: string, value: any) => api.post<ApiResponse<any>>('/rw-info', { key, value }),
  bulkUpdate: (data: Record<string, any>) => api.post<ApiResponse<RwInfo>>('/rw-info/bulk', { data }),
  delete: (key: string) => api.delete<ApiResponse<null>>(`/rw-info/${key}`),
};

// ============ Assets API ============

export const assetsAPI = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    kategori?: string;
    kondisi?: string;
  }) => api.get<PaginatedResponse<Asset>>('/assets', { params }),
  getByKategori: () => api.get<ApiResponse<Record<string, Asset[]>>>('/assets-by-kategori'),
  getById: (id: number) => api.get<ApiResponse<Asset>>(`/assets/${id}`),
  create: (data: FormData) =>
    api.post<ApiResponse<Asset>>('/assets', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post<ApiResponse<Asset>>(`/assets/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/assets/${id}`),
};

// ============ Gallery API ============

export const galleryAPI = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }) => api.get<PaginatedResponse<GalleryEvent>>('/gallery', { params }),
  getById: (id: number) => api.get<ApiResponse<GalleryEvent>>(`/gallery/${id}`),
  create: (data: Partial<GalleryEvent>) =>
    api.post<ApiResponse<GalleryEvent>>('/gallery', data),
  update: (id: number, data: Partial<GalleryEvent>) =>
    api.put<ApiResponse<GalleryEvent>>(`/gallery/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/gallery/${id}`),
  // Photos
  addPhoto: (eventId: number, data: FormData) =>
    api.post<ApiResponse<GalleryPhoto>>(`/gallery/${eventId}/photos`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  addPhotosBulk: (eventId: number, data: FormData) =>
    api.post<ApiResponse<GalleryPhoto[]>>(`/gallery/${eventId}/photos/bulk`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updatePhoto: (photoId: number, data: Partial<GalleryPhoto>) =>
    api.put<ApiResponse<GalleryPhoto>>(`/gallery-photos/${photoId}`, data),
  deletePhoto: (photoId: number) => api.delete<ApiResponse<null>>(`/gallery-photos/${photoId}`),
};

// ============ Berita API ============

export const beritaAPI = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    kategori?: string;
    published_only?: boolean;
  }) => api.get<PaginatedResponse<Berita>>('/berita', { params }),
  getById: (id: number) => api.get<ApiResponse<Berita>>(`/berita/${id}`),
  create: (data: FormData) =>
    api.post<ApiResponse<Berita>>('/berita', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post<ApiResponse<Berita>>(`/berita/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/berita/${id}`),
  publish: (id: number) => api.post<ApiResponse<Berita>>(`/berita/${id}/publish`),
  unpublish: (id: number) => api.post<ApiResponse<Berita>>(`/berita/${id}/unpublish`),
};

// ============ Dokumen API ============

export const dokumenAPI = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    kategori?: string;
    is_public?: boolean;
  }) => api.get<PaginatedResponse<Dokumen>>('/dokumen', { params }),
  getById: (id: number) => api.get<ApiResponse<Dokumen>>(`/dokumen/${id}`),
  create: (data: FormData) =>
    api.post<ApiResponse<Dokumen>>('/dokumen', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post<ApiResponse<Dokumen>>(`/dokumen/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/dokumen/${id}`),
  togglePublic: (id: number) => api.post<ApiResponse<Dokumen>>(`/dokumen/${id}/toggle-public`),
};

// ============ Transactions API ============

export const transactionsAPI = {
  // Transactions
  getAll: (params?: {
    page?: number;
    per_page?: number;
    mutation?: 'IN' | 'OUT';
    type_id?: number;
    start_date?: string;
    end_date?: string;
    month?: number;
    year?: number;
    search?: string;
  }) => api.get<PaginatedResponse<Transaction>>('/transactions', { params }),
  getById: (id: number) => api.get<ApiResponse<Transaction>>(`/transactions/${id}`),
  create: (data: FormData) =>
    api.post<ApiResponse<Transaction>>('/transactions', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post<ApiResponse<Transaction>>(`/transactions/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/transactions/${id}`),

  // Balance & Summary
  getBalance: () => api.get<ApiResponse<TransactionBalance>>('/transactions/balance'),
  getSummary: (params?: { month?: number; year?: number }) =>
    api.get<ApiResponse<TransactionSummary>>('/transactions/summary', { params }),

  // Transaction Types
  getTypes: (params?: { active_only?: boolean }) =>
    api.get<ApiResponse<TransactionType[]>>('/transaction-types', { params }),
  createType: (data: { name: string }) =>
    api.post<ApiResponse<TransactionType>>('/transaction-types', data),
  updateType: (id: number, data: { name?: string; is_active?: boolean }) =>
    api.put<ApiResponse<TransactionType>>(`/transaction-types/${id}`, data),
  deleteType: (id: number) => api.delete<ApiResponse<null>>(`/transaction-types/${id}`),
};

// ============ Contributors API (Iuran Rutin) ============

export const contributorsAPI = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    type?: 'RT' | 'RUKO' | 'LAINNYA';
    is_active?: boolean;
    search?: string;
    all?: boolean;
  }) => api.get<PaginatedResponse<Contributor>>('/contributors', { params }),
  getById: (id: number) => api.get<ApiResponse<Contributor>>(`/contributors/${id}`),
  create: (data: {
    code: string;
    name: string;
    type: 'RT' | 'RUKO' | 'LAINNYA';
    amount: number;
    is_active?: boolean;
    start_month?: number;
    start_year?: number;
    notes?: string;
  }) => api.post<ApiResponse<Contributor>>('/contributors', data),
  update: (id: number, data: Partial<{
    code: string;
    name: string;
    type: 'RT' | 'RUKO' | 'LAINNYA';
    amount: number;
    is_active: boolean;
    start_month: number;
    start_year: number;
    notes: string;
  }>) => api.put<ApiResponse<Contributor>>(`/contributors/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/contributors/${id}`),
};

// ============ Contributor Bills API (Tagihan Iuran) ============

export const contributorBillsAPI = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    contributor_id?: number;
    status?: 'PAID' | 'UNPAID';
    year?: number;
    month?: number;
    type?: 'RT' | 'RUKO' | 'LAINNYA';
  }) => api.get<PaginatedResponse<ContributorBill>>('/contributor-bills', { params }),
  getById: (id: number) => api.get<ApiResponse<ContributorBill>>(`/contributor-bills/${id}`),
  generate: (data: {
    year: number;
    month: number;
    contributor_ids?: number[];
  }) => api.post<ApiResponse<{ period: string; created: number; skipped: number }>>('/contributor-bills/generate', data),
  pay: (id: number, data: FormData) =>
    api.post<ApiResponse<ContributorBill>>(`/contributor-bills/${id}/pay`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  unpay: (id: number) => api.post<ApiResponse<ContributorBill>>(`/contributor-bills/${id}/unpay`),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/contributor-bills/${id}`),
  getSummary: (params?: { year?: number }) =>
    api.get<ApiResponse<BillsSummary>>('/contributor-bills/summary', { params }),
};

// ============ Users API ============

export const usersAPI = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    all?: boolean;
  }) => api.get<PaginatedResponse<User>>('/users', { params }),
  getById: (id: number) => api.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<User>>('/users', data),
  update: (id: number, data: { name?: string; email?: string; password?: string }) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<null>>(`/users/${id}`),
};

// ============ RT API ============

// Factory function to create RT API for a specific RT number
export const createRtAPI = (rtNumber: number) => ({
  // Dashboard
  getDashboard: () => api.get<ApiResponse<RtDashboard>>(`/rt/${rtNumber}/dashboard`),

  // Houses
  getHouses: (params?: {
    page?: number;
    per_page?: number;
    block?: string;
    occupied?: 0 | 1;
    search?: string;
  }) => api.get<PaginatedResponse<RtHouse>>(`/rt/${rtNumber}/houses`, { params }),
  getHouseById: (id: number) => api.get<ApiResponse<RtHouseDetail>>(`/rt/${rtNumber}/houses/${id}`),
  getHouseBills: (id: number) => api.get<ApiResponse<{
    house: { id: number; address: string };
    ipl: { unpaid_count: number; unpaid_total: number; bills: RtBill[] };
    cash: { unpaid_count: number; unpaid_total: number; bills: RtBill[] };
    pkk: { unpaid_count: number; unpaid_total: number; bills: RtBill[] };
  }>>(`/rt/${rtNumber}/houses/${id}/bills`),
  updateHouse: (id: number, data: {
    block?: string;
    no?: number;
    occupied?: boolean;
    occupied_by_owner?: boolean;
    pay_ipl?: boolean;
    ipl_amount?: number | null;
    pay_cash?: boolean;
    cash_amount?: number | null;
    pay_pkk?: boolean;
    pkk_amount?: number | null;
  }) => api.put<ApiResponse<RtHouseDetail>>(`/rt/${rtNumber}/houses/${id}`, data),
  updateHouseBillsBulk: (houseId: number, data: {
    ipl?: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>;
    cash?: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>;
    pkk?: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>;
  }) => api.put<ApiResponse<{
    house: { id: number; address: string };
    updated: { ipl: number; cash: number; pkk: number };
    bills: {
      ipl: Array<{ id: number; amount: number; deleted_at: string | null }>;
      cash: Array<{ id: number; amount: number; deleted_at: string | null }>;
      pkk: Array<{ id: number; amount: number; deleted_at: string | null }>;
    };
  }>>(`/rt/${rtNumber}/houses/${houseId}/bills/bulk`, data),

  // Bills
  getBillsIPL: (params?: {
    page?: number;
    per_page?: number;
    year?: number;
    month?: number;
    status?: 'unpaid' | 'pending' | 'paid';
  }) => api.get<PaginatedResponse<RtBill>>(`/rt/${rtNumber}/bills/ipl`, { params }),
  getBillsCash: (params?: {
    page?: number;
    per_page?: number;
    year?: number;
    month?: number;
    status?: 'unpaid' | 'pending' | 'paid';
  }) => api.get<PaginatedResponse<RtBill>>(`/rt/${rtNumber}/bills/cash`, { params }),
  getBillsPKK: (params?: {
    page?: number;
    per_page?: number;
    year?: number;
    month?: number;
    status?: 'unpaid' | 'pending' | 'paid';
  }) => api.get<PaginatedResponse<RtBill>>(`/rt/${rtNumber}/bills/pkk`, { params }),

  // Transactions
  getTransactions: (params?: {
    page?: number;
    per_page?: number;
    category?: 'utama' | 'pkk';
    mutation?: 'debit' | 'kredit';
    start_date?: string;
    end_date?: string;
  }) => api.get<PaginatedResponse<RtTransaction>>(`/rt/${rtNumber}/transactions`, { params }),

  // Balance
  getBalance: () => api.get<ApiResponse<RtBalance>>(`/rt/${rtNumber}/balance`),

  // Votes
  getVotes: (params?: { active_only?: boolean }) =>
    api.get<ApiResponse<RtVote[]>>(`/rt/${rtNumber}/votes`, { params }),
  getVoteById: (id: number) => api.get<ApiResponse<{
    vote: RtVote;
    total_votes: number;
    results: RtVoteOption[];
  }>>(`/rt/${rtNumber}/votes/${id}`),

  // Information
  getInformation: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<RtInformation>>(`/rt/${rtNumber}/information`, { params }),

  // Contributions
  getContributions: (params?: { active_only?: boolean }) =>
    api.get<ApiResponse<RtContribution[]>>(`/rt/${rtNumber}/contributions`, { params }),

  // Complaints
  getComplaints: (params?: {
    page?: number;
    per_page?: number;
    is_read?: 0 | 1;
  }) => api.get<PaginatedResponse<RtComplaint>>(`/rt/${rtNumber}/complaints`, { params }),
  markComplaintRead: (id: number) =>
    api.post<ApiResponse<RtComplaint>>(`/rt/${rtNumber}/complaints/${id}/read`),

  // Suggestions
  getSuggestions: (params?: {
    page?: number;
    per_page?: number;
    is_read?: 0 | 1;
  }) => api.get<PaginatedResponse<RtSuggestion>>(`/rt/${rtNumber}/suggestions`, { params }),
  markSuggestionRead: (id: number) =>
    api.post<ApiResponse<RtSuggestion>>(`/rt/${rtNumber}/suggestions/${id}/read`),

  // House Owner
  getHouseOwner: (houseId: number) =>
    api.get<ApiResponse<{ house: { id: number; address: string }; owner: RtResident | null }>>(`/rt/${rtNumber}/houses/${houseId}/owner`),
  createOrUpdateOwner: (houseId: number, data: FormData) =>
    api.post<ApiResponse<RtResident>>(`/rt/${rtNumber}/houses/${houseId}/owner`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteOwner: (houseId: number) =>
    api.delete<ApiResponse<null>>(`/rt/${rtNumber}/houses/${houseId}/owner`),

  // House Occupant
  getHouseOccupant: (houseId: number) =>
    api.get<ApiResponse<{ house: { id: number; address: string }; occupant: RtResident | null }>>(`/rt/${rtNumber}/houses/${houseId}/occupant`),
  createOrUpdateOccupant: (houseId: number, data: FormData) =>
    api.post<ApiResponse<RtResident>>(`/rt/${rtNumber}/houses/${houseId}/occupant`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteOccupant: (houseId: number) =>
    api.delete<ApiResponse<null>>(`/rt/${rtNumber}/houses/${houseId}/occupant`),

  // House Members
  getHouseMembers: (houseId: number) =>
    api.get<ApiResponse<{ house: { id: number; address: string }; members: RtMember[] }>>(`/rt/${rtNumber}/houses/${houseId}/members`),
  getMemberById: (houseId: number, memberId: number) =>
    api.get<ApiResponse<RtMember>>(`/rt/${rtNumber}/houses/${houseId}/members/${memberId}`),
  createMember: (houseId: number, data: FormData) =>
    api.post<ApiResponse<RtMember>>(`/rt/${rtNumber}/houses/${houseId}/members`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMember: (houseId: number, memberId: number, data: FormData) =>
    api.post<ApiResponse<RtMember>>(`/rt/${rtNumber}/houses/${houseId}/members/${memberId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteMember: (houseId: number, memberId: number) =>
    api.delete<ApiResponse<null>>(`/rt/${rtNumber}/houses/${houseId}/members/${memberId}`),
  copyMemberFrom: (houseId: number, data: { source: 'owner' | 'occupant'; is_domicile: boolean; relatives: string }) =>
    api.post<ApiResponse<RtMember>>(`/rt/${rtNumber}/houses/${houseId}/members/copy-from`, data),
});
