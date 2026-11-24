import { useCallback, useState } from 'react';

const useCursorPager = () => {
    const [cursors, setCursors] = useState([null]);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);

    const cursor = cursors[cursors.length - 1];
    const page = cursors.length;
    const hasPrev = cursors.length > 1;

    const applyPage = useCallback((data) => {
        setNextCursor(data.nextCursor ?? null);
        setHasMore(Boolean(data.hasMore));
    }, []);

    const next = useCallback(() => {
        if (hasMore && nextCursor) {
            setCursors((prev) => [...prev, nextCursor]);
        }
    }, [hasMore, nextCursor]);

    const prev = useCallback(() => {
        setCursors((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    }, []);

    const reset = useCallback(() => {
        setCursors([null]);
    }, []);

    return { cursor, page, hasPrev, hasMore, applyPage, next, prev, reset };
};

export default useCursorPager;
