import { api, request } from './api';

const ALL_LIMIT = 1000;

export const findPage = ({ cursor = null, limit = 10 } = {}) =>
    request(() => api.get('/governors', { params: { cursor: cursor ?? undefined, limit } }), 'Ошибка загрузки губернаторов');

export const findAll = async () => {
    const result = await request(
        () => api.get('/governors', { params: { limit: ALL_LIMIT } }),
        'Ошибка загрузки губернаторов',
    );
    return result.success ? { success: true, data: result.data.items } : result;
};

export const findById = (id) =>
    request(() => api.get(`/governors/${id}`), 'Губернатор не найден');

export const usage = (id) =>
    request(() => api.get(`/governors/${id}/usage`), 'Ошибка проверки связей');

export const create = (governor) =>
    request(() => api.post('/governors', governor), 'Ошибка создания губернатора');

export const update = (id, governor) =>
    request(() => api.put(`/governors/${id}`, governor), 'Ошибка обновления губернатора');

export const remove = (id, replacement) =>
    request(() => api.delete(`/governors/${id}`, { params: { replacement: replacement || undefined } }),
        'Ошибка удаления губернатора');
