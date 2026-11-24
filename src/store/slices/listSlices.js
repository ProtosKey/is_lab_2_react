import { createSlice } from '@reduxjs/toolkit';
import { clearUser } from './authSlice';

const makeListSlice = (name) =>
    createSlice({
        name,
        initialState: { items: [] },
        reducers: {
            setItems(state, action) {
                state.items = action.payload;
            },
        },
        extraReducers: (builder) => {
            builder.addCase(clearUser, (state) => {
                state.items = [];
            });
        },
    });

export const coordinatesSlice = makeListSlice('coordinates');
export const governorsSlice = makeListSlice('governors');

export const { setItems: setCoordinates } = coordinatesSlice.actions;
export const { setItems: setGovernors } = governorsSlice.actions;
