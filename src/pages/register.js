import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Page from '../components/main/page';
import Register from '../components/user/register';
import { register } from '../controllers/auth';
import { useSession } from '../utils/useRequireAuth';

const RegisterPage = () => {
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
            <Register onRegister={register} />
        </Page>
    );
};

export default RegisterPage;
