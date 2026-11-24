import { api, request } from './api';

const ALL_LIMIT = 1000;

export const findPage = ({ offset = 0, limit = 10 } = {}) =>
    request(() => api.get('/coordinates', { params: { offset, limit } }), 'Ошибка загрузки координат');

export const findAll = async () => {
    const result = await request(
        () => api.get('/coordinates', { params: { limit: ALL_LIMIT } }),
        'Ошибка загрузки координат',
    );
    return result.success ? { success: true, data: result.data.items } : result;
};

export const findById = (id) =>
    request(() => api.get(`/coordinates/${id}`), 'Координаты не найдены');

export const usage = (id) =>
    request(() => api.get(`/coordinates/${id}/usage`), 'Ошибка проверки связей');

export const create = (coordinates) =>
    request(() => api.post('/coordinates', coordinates), 'Ошибка создания координат');

export const update = (id, coordinates) =>
    request(() => api.put(`/coordinates/${id}`, coordinates), 'Ошибка обновления координат');

export const remove = (id, replacement) =>
    request(() => api.delete(`/coordinates/${id}`, { params: { replacement: replacement || undefined } }),
        'Ошибка удаления координат');
