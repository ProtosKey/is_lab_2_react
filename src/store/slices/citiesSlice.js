import { createSlice } from '@reduxjs/toolkit';
import { clearUser } from './authSlice';

export const PAGE_SIZES = [10, 20, 50];

export const INITIAL_QUERY = {
    filterField: '',
    filterValue: '',
    sortField: '',
    ascending: true,
    cursor: null,
    limit: PAGE_SIZES[0],
};

const initialState = {
    items: [],
    totalCount: 0,
    nextCursor: null,
    hasMore: false,
    cursors: [null],
    loading: false,
    notice: '',
    query: INITIAL_QUERY,
};

const citiesSlice = createSlice({
    name: 'cities',
    initialState,
    reducers: {
        setPage(state, action) {
            const { items, totalCount, nextCursor, hasMore } = action.payload;
            state.items = items;
            state.totalCount = totalCount;
            state.nextCursor = nextCursor ?? null;
            state.hasMore = Boolean(hasMore);
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setQuery(state, action) {
            state.cursors = [null];
            state.query = { ...state.query, ...action.payload, cursor: null };
        },
        nextPage(state) {
            if (state.hasMore && state.nextCursor) {
                state.cursors.push(state.nextCursor);
                state.query.cursor = state.nextCursor;
            }
        },
        prevPage(state) {
            if (state.cursors.length > 1) {
                state.cursors.pop();
                state.query.cursor = state.cursors[state.cursors.length - 1];
            }
        },
        setNotice(state, action) {
            state.notice = action.payload;
        },
        clearNotice(state) {
            state.notice = '';
        },
    },
    extraReducers: (builder) => {
        builder.addCase(clearUser, () => initialState);
    },
});

export const { setPage, setLoading, setQuery, nextPage, prevPage, setNotice, clearNotice } = citiesSlice.actions;
export default citiesSlice.reducer;
