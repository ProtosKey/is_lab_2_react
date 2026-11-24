import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../controllers/auth';
import { clearUser } from '../../store/slices/authSlice';
import { USER_LEVELS } from '../../utils/enums';

export const SECTIONS = [
    { to: '/main', label: 'Города', match: ['/main', '/city'] },
    { to: '/coordinates', label: 'Координаты', match: ['/coordinates', '/coordinate'] },
    { to: '/governors', label: 'Губернаторы', match: ['/governors', '/governor'] },
    { to: '/import', label: 'Импорт', match: ['/import', '/prepare'] },
    { to: '/special', label: 'Спецоперации' },
    { to: '/history', label: 'История' },
    { to: '/about', label: 'Настройки', match: ['/about', '/settings'] },
];

const matches = (section, pathname) =>
    (section.match ?? [section.to]).some((path) => pathname === path || pathname.startsWith(`${path}/`));

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const user = useSelector((state) => state.auth.user);
    const [show, setShow] = useState(false);
    const button = useRef(null);
    const menu = useRef(null);

    useEffect(() => {
        setShow(false);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const outsideMenu = menu.current && !menu.current.contains(event.target);
            const outsideButton = button.current && !button.current.contains(event.target);
            if (outsideMenu && outsideButton) {
                setShow(false);
            }
        };
        const handleKey = (event) => {
            if (event.key === 'Escape') {
                setShow(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    const exit = useCallback(async () => {
        await logout();
        dispatch(clearUser());
        navigate('/login');
    }, [dispatch, navigate]);

    return (
        <div className="container double">
            <div className="container-content">
                <div className="header">
                    <div className="grid-header">
                        <div className="header-user">
                            {user && (
                                <>
                                    <span className="login-badge" title={user.login}>
                                        {user.login}
                                    </span>
                                    <span className="role">{USER_LEVELS[user.level] ?? user.level}</span>
                                </>
                            )}
                        </div>
                        <div>
                            <h1>Информационная Система</h1>
                        </div>
                        <div className="info-div">
                            <button
                                className="login-button"
                                ref={button}
                                aria-label="Меню"
                                aria-expanded={show}
                                onClick={() => setShow((prev) => !prev)}
                            >
                                &#8942;
                            </button>
                            {show && (
                                <div ref={menu} className="context">
                                    <div className="container-content">
                                        <div className="context-grid">
                                            {user ? (
                                                <>
                                                    {SECTIONS.map((section) => (
                                                        <div key={section.to}>
                                                            <button
                                                                className={`submit-btn ${matches(section, pathname) ? 'active' : ''}`}
                                                                onClick={() => navigate(section.to)}
                                                            >
                                                                {section.label}
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div>
                                                        <button className="exit-btn" onClick={exit}>
                                                            Выход
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    <button className="submit-btn" onClick={() => navigate('/login')}>
                                                        Вход
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
