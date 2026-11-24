import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { changePassword } from '../../controllers/users';
import { Card, Field } from '../main/card';
import { ErrorMessage, GoodMessage } from '../main/message';

const Settings = () => {
    const user = useSelector((state) => state.auth.user);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotice('');
        setError('');

        if (!oldPassword) {
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
        const result = await changePassword(user.id, oldPassword, newPassword);
        setBusy(false);

        if (!result.success) {
            setError(result.data);
            return;
        }

        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNotice('Пароль изменён');
    };

    return (
        <Card title="Settings" centered className="form-card">
            <form className="grid-input" onSubmit={handleSubmit}>
                <Field label="Старый пароль">
                    <input
                        type="password"
                        className="input-data no-add"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Введите старый пароль"
                        autoComplete="current-password"
                    />
                </Field>
                <Field label="Новый пароль">
                    <input
                        type="password"
                        className="input-data no-add"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Введите новый пароль"
                        autoComplete="new-password"
                    />
                </Field>
                <Field label="Повторите пароль">
                    <input
                        type="password"
                        className="input-data no-add"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
    );
};

export default Settings;
