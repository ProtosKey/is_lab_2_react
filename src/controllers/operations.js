import { api, request } from './api';

export const history = ({ cursor = null, limit = 10 } = {}) =>
    request(() => api.get('/operations', { params: { cursor: cursor ?? undefined, limit } }), 'Ошибка загрузки истории');
