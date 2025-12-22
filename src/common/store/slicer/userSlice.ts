import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

interface UserState {
  access: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  access: localStorage.getItem('access') || null,
  isAuthenticated: !!localStorage.getItem('access'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await apiClient.post('/user/login', credentials);

      const { access_token } = response.data;
      localStorage.setItem('access', access_token);

      return { access_token };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk('user/refreshToken', async (_, thunkAPI) => {
  try {
    const response = await apiClient.post('/user/refresh-token', {});

    const { access_token } = response.data;
    localStorage.setItem('access', access_token);

    return { access_token };
  } catch (error: any) {
    localStorage.removeItem('access');
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Token refresh failed');
  }
});

export const logout = createAsyncThunk('user/logout', async (_, thunkAPI) => {
  console.log(1);
  try {
    await apiClient.post('/user/logout');
    console.log(2);
  } catch (error) {
    console.error('Logout error:', error);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'User logout failed');
  } finally {
    localStorage.removeItem('access');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logoutLocal(state) {
      state.access = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access');
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ access_token: string }>) => {
        state.loading = false;
        state.access = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.access = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action: PayloadAction<{ access_token: string }>) => {
        state.access = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
        state.isAuthenticated = false;
        state.access = null;
        localStorage.removeItem('access');
      })
      .addCase(logout.fulfilled, state => {
        state.access = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { logoutLocal } = userSlice.actions;
export default userSlice.reducer;
