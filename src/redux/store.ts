import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import pageTitleReducer from "./slices/pageTitleSlice"; 
import PageSubtitleState from "./slices/pageSubtitleSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        pageTitle: pageTitleReducer,
        pageSubtitle: PageSubtitleState,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
