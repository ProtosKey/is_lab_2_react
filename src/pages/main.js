import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Page from '../components/main/page';
import CityFilters from '../components/city/filters';
import CityTable from '../components/city/table';
import { findPage } from '../controllers/cities';
import { clearNotice, setLoading, setPage } from '../store/slices/citiesSlice';
import useRequireAuth from '../utils/useRequireAuth';

const NOTICE_DURATION = 5000;

const MainPage = () => {
    const ready = useRequireAuth();
    const dispatch = useDispatch();
    const { query, notice } = useSelector((state) => state.cities);
    const [error, setError] = useState('');
    const sequence = useRef(0);

    const load = useCallback(async () => {
        sequence.current += 1;
        const current = sequence.current;
        dispatch(setLoading(true));
        const result = await findPage(query);
        if (current !== sequence.current) {
            return;
        }
        dispatch(setLoading(false));
        if (result.success) {
            dispatch(setPage(result.data));
            setError('');
        } else {
            setError(result.data);
        }
    }, [dispatch, query]);

    useEffect(() => {
        if (ready) {
            load();
        }
    }, [ready, load]);

    useEffect(() => {
        if (!notice) {
            return undefined;
        }
        const timer = setTimeout(() => dispatch(clearNotice()), NOTICE_DURATION);
        return () => clearTimeout(timer);
    }, [notice, dispatch]);

    return (
        <Page back={{ value: 'Вернуться в начало', to: '/' }} loading={!ready}>
            <CityFilters />
            <CityTable error={error} notice={notice} reload={load} />
        </Page>
    );
};

export default MainPage;
