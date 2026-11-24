import { api, request } from './api';

export const importBatch = (batch, fileName) =>
    request(() => api.post('/import', batch, { params: { fileName } }), 'Ошибка импорта');
