import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_API_URL, getApiUrl, setApiUrl } from '../../controllers/api';
import { setUser } from '../../store/slices/authSlice';
import { Card, Field } from '../main/card';
import { ErrorMessage } from '../main/message';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [server, setServer] = useState(getApiUrl());
    const [showServer, setShowServer] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setError('');
    }, [username, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const problem = username.trim() === '' ? 'Нужно указать имя пользователя'
            : password === '' ? 'Нужно указать пароль' : '';
        if (problem) {
            setError(problem);
            return;
        }

        if (showServer) {
            setApiUrl(server);
        }

        setBusy(true);
        const result = await onLogin(username.trim(), password);
        setBusy(false);

        if (!result.success) {
            setError(result.data);
            return;
        }
        dispatch(setUser(result.data));
        navigate('/main');
    };

    return (
        <Card title="Войти в аккаунт" centered className="form-card">
            <form className="grid-input" onSubmit={handleSubmit}>
                    <Field label="Пользователь">
                        <input
                            className="input-data no-add"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Укажите имя"
                            autoComplete="username"
                        />
                    </Field>
                    <Field label="Пароль">
                        <input
                            type="password"
                            className="input-data no-add"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Укажите пароль"
                            autoComplete="current-password"
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
                        <button type="button" className="more-btn" onClick={() => navigate('/register')}>
                            Зарегистрироваться
                        </button>
                    </div>
                    <div>
                        <button type="submit" className="submit-btn" disabled={busy}>
                            {busy ? 'Вход…' : 'Войти в аккаунт'}
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

export default Login;
