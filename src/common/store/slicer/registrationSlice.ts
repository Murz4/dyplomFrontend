import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

interface RegisterState {
  success: any;
  loading: boolean;
  error: string | null;
}

const initialState: RegisterState = {
  success: null,
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  'register/registerFetch',
  async (credentials: { full_name: string; email: string; password: string }, thunkAPI) => {
    console.log(5);
    console.log(credentials.full_name);
    console.log(credentials.email);
    console.log(credentials.password);
    try {
      const response = await apiClient.post('/user/register', credentials);
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(register.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default registerSlice.reducer;
