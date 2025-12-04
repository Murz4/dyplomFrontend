import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

interface UserState {
  access: string | null;
  refresh: string | null;
  userInfo: Record<string, any> | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  access: null,
  refresh: null,
  userInfo: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      console.log(1);
      const response = await apiClient.post('/user/login', credentials);
      const tokens = response.data; // { access, refresh }
      console.log(tokens, 'asdsadsad');
      console.log(response, 'lolol');
      return { ...tokens };
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
        }
      )
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action: PayloadAction<{ access: string }>) => {
        state.access = action.payload.access;
      })
      .addCase(refreshAccessToken.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
