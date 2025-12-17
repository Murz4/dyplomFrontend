import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import apiClient from 'src/api/instances';

interface sendEmailState {
  success: any;
  loading: boolean;
  error: string | null;
}

const initialState: sendEmailState = {
  success: null,
  loading: false,
  error: null,
};

export const forgotPassword = createAsyncThunk(
  'forgotPassword/forgotPasswordFetch',
  async (email: string, thunkAPI) => {
    console.log(email);

    try {
      const response = await apiClient.post('/user/forgot_password', { email });
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Send Email failed');
    }
  }
);

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(forgotPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default forgotPasswordSlice.reducer;
