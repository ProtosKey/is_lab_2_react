import { api, request } from './api';

export const deleteByClimate = (climate) =>
    request(() => api.delete(`/special/cities/climate/${climate}`), 'Ошибка удаления города');

export const countByMeters = async (value) => {
    const result = await request(() => api.get('/special/cities/count-by-meters', { params: { value } }),
        'Ошибка подсчёта');
    return result.success ? { success: true, data: result.data.count } : result;
};

export const findByName = (substring) =>
    request(() => api.get('/special/cities/by-name', { params: { substring } }), 'Ошибка поиска');

export const movePopulation = (source, target) =>
    request(() => api.post('/special/cities/move-population', null, { params: { source, target } }),
        'Ошибка переселения');

export const movePopulationToSmallest = (source) =>
    request(() => api.post('/special/cities/move-population-to-smallest', null, { params: { source } }),
        'Ошибка переселения');
