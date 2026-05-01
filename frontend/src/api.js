import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const login = async (username, password) => {
    const response = await api.post('/api/login', { username, password });
    return response.data;
};

export const register = async (username, password) => {
    const response = await api.post('/api/register', { username, password });
    return response.data;
};

// Company endpoints
export const getCompanies = async () => {
    const response = await api.get('/api/companies');
    return response.data;
};

export const getCompany = async (companyName) => {
    const response = await api.get(`/api/company/${encodeURIComponent(companyName)}`);
    return response.data;
};

export const getSectors = async () => {
    const response = await api.get('/api/sectors');
    return response.data;
};

export const getSectorCompanies = async (sectorName) => {
    const response = await api.get(`/api/sector/${encodeURIComponent(sectorName)}`);
    return response.data;
};

// News endpoint
export const getNews = async (query, maxArticles = 5) => {
    const response = await api.post('/api/news', { query, max_articles: maxArticles });
    return response.data;
};

// Chat endpoint
export const sendChatMessage = async (question, groqApiKey = null) => {
    const response = await api.post('/api/chat', { question, groq_api_key: groqApiKey });
    return response.data;
};

// PDF report endpoint
export const generateReport = async (company, options = {}) => {
    const response = await api.post('/api/report', {
        company,
        include_core: options.includeCore ?? true,
        include_pillars: options.includePillars ?? true,
        include_risk: options.includeRisk ?? true,
        include_notes: options.includeNotes ?? true,
    }, {
        responseType: 'blob',
    });
    return response.data;
};

// Stats endpoint
export const getStats = async () => {
    const response = await api.get('/api/stats');
    return response.data;
};

// Custom ESG endpoints
export const uploadCustomESG = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/custom-esg/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const processCustomESG = async () => {
    const response = await api.post('/api/custom-esg/process');
    return response.data;
};

export default api;
