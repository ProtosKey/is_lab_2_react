import React from 'react';
import { useParams } from 'react-router-dom';
import Page from '../components/main/page';
import GovernorForm from '../components/governors/form';
import useRequireAuth from '../utils/useRequireAuth';

const GovernorPage = () => {
    const ready = useRequireAuth();
    const { id } = useParams();

    return (
        <Page back={{ value: 'Вернуться назад', to: '/governors' }} loading={!ready}>
            <GovernorForm id={id} />
        </Page>
    );
};

export default GovernorPage;
