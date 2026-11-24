import React from 'react';
import Page from '../components/main/page';
import Settings from '../components/user/settings';
import useRequireAuth from '../utils/useRequireAuth';

const SettingsPage = () => {
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/about' }} loading={!ready}>
            <Settings />
        </Page>
    );
};

export default SettingsPage;
