import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

interface UserState {
  access: string | null;
  refresh: string | null;
  userInfo: Record<string, any> | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  access: null,
  refresh: null,
  userInfo: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/user/login', credentials);
      return response.data; // { access, refresh, userInfo }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk('user/refreshToken', async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as any;
    const refresh = state.user.refresh;

    if (!refresh) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/user/refresh-token', { refresh });
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Token refresh failed');
  }
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.access = null;
      state.refresh = null;
      state.userInfo = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ access: string; refresh: string; userInfo: Record<string, any> }>) => {
          state.loading = false;
          state.access = action.payload.access;
          state.refresh = action.payload.refresh;
          state.userInfo = action.payload.userInfo;
          state.isAuthenticated = true;
        }
      )
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action: PayloadAction<{ access: string }>) => {
        state.access = action.payload.access;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
