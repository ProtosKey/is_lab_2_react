import React from 'react';
import Page from '../components/main/page';
import AdminUsers from '../components/user/adminUsers';
import useRequireAuth from '../utils/useRequireAuth';

const UsersPage = () => {
    const ready = useRequireAuth();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/main' }} loading={!ready}>
            <AdminUsers />
        </Page>
    );
};

export default UsersPage;
