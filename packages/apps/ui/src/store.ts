import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from './services/authSlice';

import { afrisetApi } from './services/afriset.ts';


const rootReducer = combineReducers({
	auth: authReducer,
	[afrisetApi.reducerPath]: afrisetApi.reducer,
});

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(afrisetApi.middleware)
});

export type RootState = ReturnType<typeof rootReducer>

setupListeners(store.dispatch);
