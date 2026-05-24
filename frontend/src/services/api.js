import axios from 'axios';

// ─── Base Axios Instance ────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
    timeout: 30000,
});

// Attach JWT automatically if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('clinerva_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),
    getProfile: () => api.get('/auth/profile'),
};

// ─── Upload (Cloudinary Profile Image) ──────────────────────────────────────
export const uploadAPI = {
    /**
     * Upload or replace profile picture
     * @param {File} file - image File object
     */
    uploadProfileImage: (file) => {
        const form = new FormData();
        form.append('profileImage', file);
        return api.post('/upload/profile-image', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /** Delete current profile picture */
    deleteProfileImage: () => api.delete('/upload/profile-image'),

    /** Get responsive image URL variants (thumbnail / small / medium / large / original) */
    getProfileImageVariants: () => api.get('/upload/profile-image/variants'),

    /** Ping Cloudinary (Admin) */
    cloudinaryStatus: () => api.get('/upload/cloudinary/status'),
};

// ─── Patient / Trial Matching ────────────────────────────────────────────────
export const matchingAPI = {
    /** Rule-based: generate matches for a patient */
    generateMatches: (patientId) => api.get(`/matches/patient/${patientId}/generate`),

    /** Rule-based: get top N matches for a patient */
    getTopMatches: (patientId, limit = 5) =>
        api.get(`/matches/patient/${patientId}/top-matches`, { params: { limit } }),

    /** AI health check — verify Bytez GPT-4o is reachable */
    aiHealth: () => api.get('/matches/ai/health'),

    /**
     * AI eligibility validation (GPT-4o reasoning)
     * @param {string} patientId
     * @param {string} trialId
     */
    aiEligibility: (patientId, trialId) =>
        api.post('/matches/ai/eligibility', { patientId, trialId }),

    /**
     * Personalized AI recommendations for a patient's top matches
     * @param {string} patientId
     */
    aiRecommendations: (patientId) =>
        api.post('/matches/ai/recommendations', { patientId }),

    /**
     * Compare multiple trials side-by-side with GPT-4o
     * @param {string} patientId
     * @param {string[]} trialIds
     */
    aiCompareTrials: (patientId, trialIds) =>
        api.post('/matches/ai/compare', { patientId, trialIds }),
};

// ─── Patients ────────────────────────────────────────────────────────────────
export const patientAPI = {
    getAll: () => api.get('/patients'),
    getById: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    update: (id, data) => api.put(`/patients/${id}`, data),
};

// ─── Trials ──────────────────────────────────────────────────────────────────
export const trialAPI = {
    getAll: () => api.get('/trials'),
    getById: (id) => api.get(`/trials/${id}`),
    create: (data) => api.post('/trials', data),
};

export default api;
