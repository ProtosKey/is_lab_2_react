import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../store/slices/authSlice';
import { Card, Field } from '../main/card';
import { ErrorMessage } from '../main/message';
import {DEFAULT_API_URL, getApiUrl, setApiUrl} from "../../controllers/api";

const Register = ({ onRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [server, setServer] = useState(getApiUrl());
    const [showServer, setShowServer] = useState(false);
    const [repeat, setRepeat] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setError('');
    }, [username, password, repeat]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const problem = username.trim() === '' ? 'Нужно создать имя пользователя'
            : password === '' ? 'Нужно придумать пароль'
                : password !== repeat ? 'Пароли не совпадают' : '';
        if (problem) {
            setError(problem);
            return;
        }

        if (showServer) {
            setApiUrl(server);
        }

        setBusy(true);
        const result = await onRegister(username.trim(), password);
        setBusy(false);

        if (!result.success) {
            setError(result.data);
            return;
        }
        dispatch(setUser(result.data));
        navigate('/main');
    };

    return (
        <Card
            title="Зарегистрировать аккаунт"
            centered
            className="form-card"
        >
            <form className="grid-input" onSubmit={handleSubmit}>
                    <Field label="Пользователь">
                        <input
                            className="input-data no-add"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Создайте имя пользователя"
                            autoComplete="username"
                        />
                    </Field>
                    <Field label="Пароль">
                        <input
                            type="password"
                            className="input-data no-add"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Придумайте пароль"
                            autoComplete="new-password"
                        />
                    </Field>
                    <Field label="Повторите пароль">
                        <input
                            type="password"
                            className="input-data no-add"
                            value={repeat}
                            onChange={(e) => setRepeat(e.target.value)}
                            placeholder="Повторите пароль"
                            autoComplete="new-password"
                        />
                    </Field>
                    {showServer && (
                        <Field label="Сервер">
                            <input
                                className="input-data no-add"
                                value={server}
                                onChange={(e) => setServer(e.target.value)}
                                placeholder={DEFAULT_API_URL}
                            />
                        </Field>
                    )}
                    <div>
                        <button type="button" className="more-btn" onClick={() => navigate('/login')}>
                            Уже есть аккаунт
                        </button>
                    </div>
                    <div>
                        <button type="submit" className="submit-btn" disabled={busy}>
                            {busy ? 'Регистрация…' : 'Зарегистрировать аккаунт'}
                        </button>
                    </div>
                    <div className="double">
                        <button
                            type="button"
                            className="more-btn"
                            onClick={() => setShowServer((prev) => !prev)}
                        >
                            {showServer ? 'Скрыть адрес сервера' : 'Изменить адрес сервера'}
                        </button>
                    </div>
                    <ErrorMessage>{error}</ErrorMessage>
                </form>
        </Card>
    );
};

export default Register;
