import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import citiesReducer from './slices/citiesSlice';
import { coordinatesSlice, governorsSlice } from './slices/listSlices';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cities: citiesReducer,
        coordinates: coordinatesSlice.reducer,
        governors: governorsSlice.reducer,
    },
});
