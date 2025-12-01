import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PageSubtitleState {
    title: string;
}

const initialState: PageSubtitleState = {
    title: ""
};

export const PageSubtitleState = createSlice({
    name: "pageSubtitle",
    initialState,
    reducers: {
        setPageSubtitle: (state, action: PayloadAction<string>) => {
            state.title = action.payload;
        }
    }
});

export const { setPageSubtitle } = PageSubtitleState.actions;
export default PageSubtitleState.reducer;
