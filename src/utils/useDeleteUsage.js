import { useCallback, useState } from 'react';

const useDeleteUsage = (fetchUsage) => {
    const [linkedCount, setLinkedCount] = useState(0);
    const [checking, setChecking] = useState(false);
    const [replacement, setReplacement] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const reset = useCallback(() => {
        setLinkedCount(0);
        setChecking(false);
        setReplacement('');
        setDeleteError('');
    }, []);

    const prepare = useCallback(async (id) => {
        setLinkedCount(0);
        setReplacement('');
        setDeleteError('');
        setChecking(true);
        const result = await fetchUsage(id);
        setChecking(false);
        if (result.success) {
            setLinkedCount(result.data.count ?? 0);
        } else {
            setDeleteError(result.data);
        }
    }, [fetchUsage]);

    const needsReplacement = linkedCount > 0;
    const confirmDisabled = checking || (needsReplacement && !replacement);

    return {
        linkedCount,
        checking,
        needsReplacement,
        confirmDisabled,
        replacement,
        setReplacement,
        deleteError,
        setDeleteError,
        prepare,
        reset,
    };
};

export default useDeleteUsage;
