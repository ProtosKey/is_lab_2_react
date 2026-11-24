import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import IndexPage from './pages/index';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import MainPage from './pages/main';
import CityPage from './pages/city';
import CoordinatesPage from './pages/coordinates';
import CoordinatePage from './pages/coordinate';
import GovernorsPage from './pages/governors';
import GovernorPage from './pages/governor';
import ImportPage from './pages/import';
import PreparePage from './pages/prepare';
import SpecialPage from './pages/special';
import HistoryPage from './pages/history';
import AboutPage from './pages/about';
import SettingsPage from './pages/settings';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const SessionWatcher = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const previous = useRef(user);

    useEffect(() => {
        if (previous.current && !user) {
            navigate('/login', { replace: true });
        }
        previous.current = user;
    }, [user, navigate]);

    return null;
};

function App() {
    return (
        <>
            <ScrollToTop />
            <SessionWatcher />
            <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/city" element={<CityPage />} />
                <Route path="/city/:id" element={<CityPage />} />
                <Route path="/coordinates" element={<CoordinatesPage />} />
                <Route path="/coordinate" element={<CoordinatePage />} />
                <Route path="/coordinate/:id" element={<CoordinatePage />} />
                <Route path="/governors" element={<GovernorsPage />} />
                <Route path="/governor" element={<GovernorPage />} />
                <Route path="/governor/:id" element={<GovernorPage />} />
                <Route path="/import" element={<ImportPage />} />
                <Route path="/prepare" element={<PreparePage />} />
                <Route path="/special" element={<SpecialPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
