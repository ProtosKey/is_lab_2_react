import { api } from "./api";

export const findAll = async () => {
    try {
        const response = await api.get('/users');
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error?.response?.data?.message ?? 'Ошибка загрузки пользователей' };
    }
};

export const changeLevel = async (id, level) => {
    try {
        const response = await api.put(`/users/${id}/level`, { level });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error?.response?.data?.message ?? 'Ошибка смены уровня' };
    }
};

export const changePassword = async (id, oldPassword, newPassword) => {
    try {
        const response = await api.put(`/users/${id}/password`, { oldPassword, newPassword });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error?.response?.data?.message ?? 'Ошибка смены пароля' };
    }
};
