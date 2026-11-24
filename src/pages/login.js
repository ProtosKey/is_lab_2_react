import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Page from '../components/main/page';
import Login from '../components/user/login';
import { login } from '../controllers/auth';
import { useSession } from '../utils/useRequireAuth';

const LoginPage = () => {
    const navigate = useNavigate();
    const { user } = useSession();

    useEffect(() => {
        if (user) {
            navigate('/main', { replace: true });
        }
    }, [user, navigate]);

    const back = () => navigate('/');

    return (
        <Page back={{ value: 'Вернуться назад', onClick: back }}>
            <Login onLogin={login} />
        </Page>
    );
};

export default LoginPage;
