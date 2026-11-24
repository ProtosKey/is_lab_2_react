import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { changeLevel, changePassword, findAll } from '../../controllers/users';
import { USER_LEVELS } from '../../utils/enums';
import { Card, Field } from '../main/card';
import { ErrorMessage, GoodMessage, Messages } from '../main/message';
import Select from '../main/select';

const AdminUsers = () => {
    const currentUser = useSelector((state) => state.auth.user);
    const isAdmin = currentUser?.level === 'ADMIN';
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const result = await findAll();
        setLoading(false);
        if (result.success) {
            setUsers(result.data);
            setLoadError('');
        } else {
            setLoadError(result.data);
        }
    }, [isAdmin]);

    useEffect(() => {
        load();
    }, [load]);

    if (!isAdmin) {
        return (
            <Card title="Пользователи" centered className="form-card">
                <ErrorMessage>Раздел доступен только администратору</ErrorMessage>
            </Card>
        );
    }

    const isSelf = selectedId !== '' && String(selectedId) === String(currentUser?.id);
    const selectedUser = users.find((u) => String(u.id) === String(selectedId));

    const clearMessages = () => {
        setError('');
        setNotice('');
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        clearMessages();

        if (!selectedId) {
            setError('Выберите пользователя');
            return;
        }
        if (isSelf && !oldPassword) {
            setError('Укажите старый пароль');
            return;
        }
        if (!newPassword.trim()) {
            setError('Новый пароль не может быть пустым');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Новые пароли не совпадают');
            return;
        }

        setBusy(true);
        const result = await changePassword(Number(selectedId), isSelf ? oldPassword : null, newPassword);
        setBusy(false);

        if (!result.success) {
            setError(result.data);
            return;
        }

        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNotice(`Пароль пользователя (${selectedUser?.login ?? selectedId}) изменен`);
    };

    const handleLevelChange = async (id, level) => {
        clearMessages();
        const result = await changeLevel(id, level);
        if (!result.success) {
            setLoadError(result.data);
            return;
        }
        setUsers((prev) => prev.map((u) => (u.id === id ? result.data : u)));
    };

    return (
        <>
            <Card title="Смена пароля пользователя" centered className="form-card">
                <form className="grid-input" onSubmit={handlePasswordSubmit}>
                    <Field label="Пользователь">
                        <Select
                            value={selectedId}
                            onChange={(value) => {
                                clearMessages();
                                setOldPassword('');
                                setSelectedId(value);
                            }}
                        >
                            <option value="">Выберите пользователя</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    #{u.id} — {u.login} ({USER_LEVELS[u.level] ?? u.level})
                                </option>
                            ))}
                        </Select>
                    </Field>
                    {isSelf && (
                        <Field label="Старый пароль">
                            <input
                                type="password"
                                className="input-data no-add"
                                value={oldPassword}
                                onChange={(e) => {
                                    clearMessages();
                                    setOldPassword(e.target.value);
                                }}
                                placeholder="Введите старый пароль"
                                autoComplete="current-password"
                            />
                        </Field>
                    )}
                    <Field label="Новый пароль">
                        <input
                            type="password"
                            className="input-data no-add"
                            value={newPassword}
                            onChange={(e) => {
                                clearMessages();
                                setNewPassword(e.target.value);
                            }}
                            placeholder="Введите новый пароль"
                            autoComplete="new-password"
                        />
                    </Field>
                    <Field label="Повторите пароль">
                        <input
                            type="password"
                            className="input-data no-add"
                            value={confirmPassword}
                            onChange={(e) => {
                                clearMessages();
                                setConfirmPassword(e.target.value);
                            }}
                            placeholder="Повторите новый пароль"
                            autoComplete="new-password"
                        />
                    </Field>
                    <div className="double">
                        <button type="submit" className="submit-btn" disabled={busy}>
                            {busy ? 'Сохранение…' : 'Изменить пароль'}
                        </button>
                    </div>
                    <GoodMessage>{notice}</GoodMessage>
                    <ErrorMessage>{error}</ErrorMessage>
                </form>
            </Card>
            <Card title="Пользователи" centered className="form-card">
                <Messages error={loadError} />
                <div className="table">
                    <table className="data compact">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Логин</th>
                                <th>Роль</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4}>
                                        <div className="cell empty">{loading ? 'Загрузка…' : 'Пользователей нет'}</div>
                                    </td>
                                </tr>
                            )}
                            {users.map((u) => (
                                <tr key={u.id} className={String(u.id) === String(selectedId) ? 'editing' : undefined}>
                                    <td>
                                        <div className="cell">{u.id}</div>
                                    </td>
                                    <td>
                                        <div className="cell ellipsis" title={u.login}>{u.login}</div>
                                    </td>
                                    <td>
                                        <div className="cell plain">
                                            <Select
                                                value={u.level}
                                                disabled={u.id === currentUser?.id}
                                                onChange={(level) => handleLevelChange(u.id, level)}
                                            >
                                                <option value="ADMIN">Администратор</option>
                                                <option value="USER">Пользователь</option>
                                            </Select>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cell actions">
                                            <button
                                                type="button"
                                                className="small-btn"
                                                onClick={() => {
                                                    clearMessages();
                                                    setOldPassword('');
                                                    setSelectedId(String(u.id));
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            >
                                                Пароль
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    );
};

export default AdminUsers;
