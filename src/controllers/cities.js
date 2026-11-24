import { api, request } from './api';

const ALL_LIMIT = 1000;

const pageParams = (query) => ({
    params: {
        filterField: query.filterField || undefined,
        filterValue: query.filterValue || undefined,
        sortField: query.sortField || undefined,
        ascending: query.ascending,
        offset: query.offset,
        limit: query.limit,
    },
});

export const findPage = (query) =>
    request(() => api.get('/cities', pageParams(query)), 'Ошибка загрузки городов');

export const findAll = () =>
    request(() => api.get('/cities', { params: { limit: ALL_LIMIT } }), 'Ошибка загрузки городов');

export const findById = (id) => request(() => api.get(`/cities/${id}`), 'Город не найден');

export const create = (city) => request(() => api.post('/cities', city), 'Ошибка создания города');

export const update = (id, city) => request(() => api.put(`/cities/${id}`, city), 'Ошибка обновления города');

export const remove = (id) => request(() => api.delete(`/cities/${id}`), 'Ошибка удаления города');
