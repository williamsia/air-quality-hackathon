// features/auth/authSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session, User } from './types.ts';

const initialState: Session = {};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		addUser(state, action: PayloadAction<User>) {
			state.user = action.payload;
		}
	},
	extraReducers: {}
});

export const { addUser } = authSlice.actions;

export default authSlice.reducer;
