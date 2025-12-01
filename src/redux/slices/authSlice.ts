import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { login as loginService, logout as logoutService, type LoginResponse } from "../../services/authService";
const savedUser = sessionStorage.getItem("user");

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: !!savedUser,
  user: savedUser ? JSON.parse(savedUser) : null,
  loading: false,
  error: null,
};


export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    const response: LoginResponse = await loginService(username, password);
    if (!response.success) return rejectWithValue(response.message);
    return response.data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      logoutService();
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
.addCase(login.fulfilled, (state, action: ReturnType<typeof login.fulfilled>) => {
  state.loading = false;
  state.isAuthenticated = true;

  const userWithPassword = {
    ...action.payload,
    password: action.meta.arg.password
  };

  state.user = userWithPassword;
  sessionStorage.setItem("user", JSON.stringify(userWithPassword));
})

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
