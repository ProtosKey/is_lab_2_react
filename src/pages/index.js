import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Page from '../components/main/page';
import { Card } from '../components/main/card';
import { SECTIONS } from '../components/main/header';
import { me } from '../controllers/auth';
import { setUser } from '../store/slices/authSlice';
import { useSession } from '../utils/useRequireAuth';

const IndexPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    useSession();

    const start = async () => {
        if (user) {
            navigate('/main');
            return;
        }
        const result = await me();
        if (result.success) {
            dispatch(setUser(result.data));
        }
        navigate(result.success ? '/main' : '/login');
    };

    return (
        <Page back={{ value: 'Начать работу', onClick: start }}>
            <Card title="Хранилище городов" centered>
                {user ? (
                    <div className="section-grid">
                        {SECTIONS.filter((section) => !section.adminOnly || user.level === 'ADMIN').map((section) => (
                            <button
                                key={section.to}
                                type="button"
                                className="submit-btn"
                                onClick={() => navigate(section.to)}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="info">
                        Учёт городов, координат и губернаторов с возможностью поиска, сортировки и фильтрации, а также импорта из файла и просмотра истории.
                    </p>
                )}
            </Card>
        </Page>
    );
};

export default IndexPage;
