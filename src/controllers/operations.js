import { api, request } from './api';

export const history = ({ offset = 0, limit = 10 } = {}) =>
    request(() => api.get('/operations', { params: { offset, limit } }), 'Ошибка загрузки истории');
