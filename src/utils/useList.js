import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useList = (selector, setItems, fetchAll, ready = true) => {
    const dispatch = useDispatch();
    const items = useSelector(selector);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        const result = await fetchAll();
        if (result.success) {
            dispatch(setItems(result.data));
            setError('');
        } else {
            setError(result.data);
        }
        return result.success;
    }, [dispatch, fetchAll, setItems]);

    useEffect(() => {
        if (ready) {
            load();
        }
    }, [ready, load]);

    return { items, error, load };
};

export default useList;
