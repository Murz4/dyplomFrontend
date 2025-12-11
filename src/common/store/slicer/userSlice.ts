import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

interface UserState {
  access: string | null;
  refresh: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  access: localStorage.getItem('access') || null,
  refresh: localStorage.getItem('refresh') || null,
  isAuthenticated: !!localStorage.getItem('access'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/user/login', credentials);
      const { access_token, refresh_token } = response.data;

      localStorage.setItem('access', access_token);
      localStorage.setItem('refresh', refresh_token);

      return { access_token, refresh_token };
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

    localStorage.setItem('access', response.data.access);

    if (response.data.refresh) {
      localStorage.setItem('refresh', response.data.refresh);
    }

    return response.data;
  } catch (error: any) {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');

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
      state.isAuthenticated = false;

      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ access_token: string; refresh_token: string }>) => {
        const { access_token, refresh_token } = action.payload;
        state.loading = false;
        state.access = access_token;
        state.refresh = refresh_token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action: PayloadAction<{ access: string; refresh?: string }>) => {
        state.access = action.payload.access;

        if (action.payload.refresh) {
          state.refresh = action.payload.refresh;
        }
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
        state.isAuthenticated = false;
        state.access = null;
        state.refresh = null;
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
