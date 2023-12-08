import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { LineItemDelta, LineItemSummary } from './types.ts';

export type OptimizationState = {
	[key: string]: {
		items?: LineItemDelta[],
		summary?: LineItemSummary
	},
}

const initialState: OptimizationState = {};

export const optimizationSlice = createSlice({
	name: 'optimization',
	initialState,
	reducers: {
		clearLineItemDelta: (state, _action: PayloadAction<void>) => {
			state = initialState;
			return state;
		},
		setLineItemDelta: (state, action: PayloadAction<OptimizationState>) => {
			state = action.payload;
			return state;
		},
		setLineItemDeltaForService: (state, action: PayloadAction<{
			service: string, result: {
				items: LineItemDelta[],
				summary: LineItemSummary
			} | undefined
		}>) => {
			if (!action.payload.result) {
				delete state[action.payload.service];
			} else {
				state[action.payload.service] = action.payload.result;
			}
			return state;
		}
	}
});

export const { setLineItemDelta, clearLineItemDelta, setLineItemDeltaForService } = optimizationSlice.actions;

export default optimizationSlice.reducer;
