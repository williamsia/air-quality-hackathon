import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import demoReducer from "../features/demo/demoSlice";
import { demoApiSlice } from "../features/demo/demoApiSlice";

export const store = configureStore({
  reducer: {
    demo: demoReducer,
    [demoApiSlice.reducerPath]: demoApiSlice.reducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(demoApiSlice.middleware),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
