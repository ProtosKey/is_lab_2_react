import { api, request } from './api';

const credentials = (login, password) => ({ login, password });

export const register = (login, password) =>
    request(() => api.post('/auth/register', credentials(login, password)), 'Ошибка регистрации');

export const login = (login, password) =>
    request(() => api.post('/auth/login', credentials(login, password)), 'Ошибка входа');

export const logout = () => request(() => api.post('/auth/logout'), 'Ошибка выхода');

export const me = () => request(() => api.get('/auth/me'), 'Требуется авторизация');
