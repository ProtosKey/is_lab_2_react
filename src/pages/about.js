import React from 'react';
import Page from '../components/main/page';
import About from '../components/user/about';
import useRequireAuth from '../utils/useRequireAuth';

const AboutPage = () => {
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/main' }} loading={!ready}>
            <About />
        </Page>
    );
};

export default AboutPage;
