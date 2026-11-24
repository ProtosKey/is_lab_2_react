import axios from 'axios';
import { store } from '../store';
import { clearUser } from '../store/slices/authSlice';

export const DEFAULT_API_URL = '/is_lab_2/api';
const API_URL_STORAGE_KEY = 'apiBase';

export const getApiUrl = () => localStorage.getItem(API_URL_STORAGE_KEY) || DEFAULT_API_URL;

export const setApiUrl = (url) => {
    const value = url && url.trim() ? url.trim().replace(/\/+$/, '') : DEFAULT_API_URL;
    localStorage.setItem(API_URL_STORAGE_KEY, value);
    api.defaults.baseURL = value;
};

export const api = axios.create({
    baseURL: getApiUrl(),
    withCredentials: true,
    timeout: 20000,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error?.config?.url ?? '';
        if (error?.response?.status === 401 && !url.startsWith('/auth/')) {
            store.dispatch(clearUser());
        }
        return Promise.reject(error);
    },
);

export const request = async (call, fallback) => {
    try {
        const response = await call();
        return { success: true, data: response.data };
    } catch (error) {
        const status = error?.response?.status;
        const body = error?.response?.data;
        const message = body && typeof body === 'object' ? body.message : undefined;
        const unavailable = !status || (status >= 500 && !message);
        return { success: false, status, data: message ?? (unavailable ? 'Сервер недоступен' : fallback) };
    }
};
