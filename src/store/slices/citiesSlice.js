import { createSlice } from '@reduxjs/toolkit';
import { clearUser } from './authSlice';

export const PAGE_SIZES = [10, 20, 50];

export const INITIAL_QUERY = {
    filterField: '',
    filterValue: '',
    sortField: '',
    ascending: true,
    offset: 0,
    limit: PAGE_SIZES[0],
};

const initialState = {
    items: [],
    totalCount: 0,
    loading: false,
    notice: '',
    query: INITIAL_QUERY,
};

const citiesSlice = createSlice({
    name: 'cities',
    initialState,
    reducers: {
        setPage(state, action) {
            const { items, totalCount } = action.payload;
            state.items = items;
            state.totalCount = totalCount;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },

        setQuery(state, action) {
            state.query = { ...state.query, ...action.payload, offset: 0 };
        },
        setOffset(state, action) {
            state.query.offset = action.payload;
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

export const { setPage, setLoading, setQuery, setOffset, setNotice, clearNotice } = citiesSlice.actions;
export default citiesSlice.reducer;
