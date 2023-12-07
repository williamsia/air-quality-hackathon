import { createSlice } from "@reduxjs/toolkit"


interface DemoState {
}

const initialState: DemoState = {}
const demoSlice = createSlice({
	name: "demo",
	initialState,
	reducers: {},
})

export const {} = demoSlice.actions
// export const selectTree = (state: RootState) => state.demo.tree

export default demoSlice.reducer
