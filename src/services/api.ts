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

// ============ RT Types ============

// RT Owner/Occupant
export interface RtResident {
  id: number;
  name: string;
  handphone: string | null;
  kk: string | null;
  sum_family: string | null;
  religion: string | null;
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
  ipl_amount: number;
  pay_cash: boolean;
  cash_amount: number;
  pay_pkk: boolean;
  pkk_amount: number;
  owner: RtResident | null;
  occupant: RtResident | null;
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
  getHouseById: (id: number) => api.get<ApiResponse<RtHouse>>(`/rt/${rtNumber}/houses/${id}`),
  getHouseBills: (id: number) => api.get<ApiResponse<{
    house: { id: number; address: string };
    ipl: { unpaid_count: number; unpaid_total: number; bills: RtBill[] };
    cash: { unpaid_count: number; unpaid_total: number; bills: RtBill[] };
    pkk: { unpaid_count: number; unpaid_total: number; bills: RtBill[] };
  }>>(`/rt/${rtNumber}/houses/${id}/bills`),

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
});
