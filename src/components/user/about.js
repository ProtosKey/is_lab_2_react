import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../controllers/api';
import { logout } from '../../controllers/auth';
import { clearUser } from '../../store/slices/authSlice';
import { USER_LEVELS } from '../../utils/enums';
import { Card, Field } from '../main/card';

const About = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    const handleLogout = async () => {
        await logout();
        dispatch(clearUser());
        navigate('/login');
    };

    return (
        <Card title="О пользователе" centered className="form-card">
            <div className="grid-input">
                <Field label="Пользователь">
                    <input
                        className="input-data no-add"
                        value={user?.login ?? ''}
                        readOnly
                        aria-readonly="true"
                        tabIndex={-1}
                    />
                </Field>
                <Field label="Роль">
                    <input
                        className="input-data no-add"
                        value={USER_LEVELS[user?.level] ?? user?.level ?? ''}
                        readOnly
                        aria-readonly="true"
                        tabIndex={-1}
                    />
                </Field>
                <Field label="Сервер">
                    <input
                        className="input-data no-add"
                        value={getApiUrl()}
                        readOnly
                        aria-readonly="true"
                        tabIndex={-1}
                    />
                </Field>
                <div className="double">
                    <button type="button" className="submit-btn" onClick={() => navigate('/settings')}>
                        Изменить пароль
                    </button>
                </div>
                <div className="double">
                    <button type="button" className="exit-btn" onClick={handleLogout}>
                        Выход
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default About;
