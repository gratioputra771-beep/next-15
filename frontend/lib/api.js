import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ───────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── DASHBOARD ──────────────────────────────────────────────
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// ─── SISWA ──────────────────────────────────────────────────
export const siswaAPI = {
  getAll: (params) => api.get('/siswa', { params }),
  getById: (id) => api.get(`/siswa/${id}`),
  create: (data) => api.post('/siswa', data),
  update: (id, data) => api.put(`/siswa/${id}`, data),
  delete: (id) => api.delete(`/siswa/${id}`),
};

// ─── KELAS ──────────────────────────────────────────────────
export const kelasAPI = {
  getAll: () => api.get('/kelas'),
  create: (data) => api.post('/kelas', data),
  update: (id, data) => api.put(`/kelas/${id}`, data),
};

// ─── GURU ───────────────────────────────────────────────────
export const guruAPI = {
  getAll: () => api.get('/guru'),
  create: (data) => api.post('/guru', data),
  update: (id, data) => api.put(`/guru/${id}`, data),
};

// ─── SESI ABSENSI ───────────────────────────────────────────
export const sesiAPI = {
  getAll: (params) => api.get('/sesi', { params }),
  getAktif: (params) => api.get('/sesi/aktif', { params }),
  create: (data) => api.post('/sesi', data),
  tutup: (id) => api.patch(`/sesi/${id}/tutup`),
  delete: (id) => api.delete(`/sesi/${id}`),
};

// ─── ABSENSI ────────────────────────────────────────────────
export const absensiAPI = {
  getAll: (params) => api.get('/absensi', { params }),
  getBySesi: (sesiId) => api.get(`/absensi/sesi/${sesiId}`),
  getBySiswa: (siswaId, params) => api.get(`/absensi/siswa/${siswaId}`, { params }),
  manual: (data) => api.post('/absensi/manual', data),
  bulkAlpa: (data) => api.post('/absensi/bulk-alpa', data),
};

// ─── QR ─────────────────────────────────────────────────────
export const qrAPI = {
  getSiswaQR: (siswaId) => api.get(`/qr/siswa/${siswaId}`),
  getKelasQR: (kelasId) => api.get(`/qr/kelas/${kelasId}`),
  scan: (data) => api.post('/qr/scan', data),
  refresh: (siswaId) => api.post(`/qr/refresh/${siswaId}`),
};

// ─── LAPORAN ────────────────────────────────────────────────
export const laporanAPI = {
  byKelas: (kelasId, params) => api.get(`/laporan/kelas/${kelasId}`, { params }),
  bySiswa: (siswaId, params) => api.get(`/laporan/siswa/${siswaId}`, { params }),
  rekapitulasi: (params) => api.get('/laporan/rekapitulasi', { params }),
};

export default api;
