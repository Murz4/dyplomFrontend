import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

interface IInitialStateProps {
  name: string;
  surname: string;
  error: string | null;
  loading: boolean;
}

export const getUserName = createAsyncThunk('getUserName/getUserNameFetch', async (_, thunkAPI) => {
  try {
    const response = await apiClient.get('/user/profile/me');
    console.log('res', response.data);
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Invalid load name');
  }
});

const initialState: IInitialStateProps = {
  name: '',
  surname: '',
  loading: false,
  error: null,
};

const fullNameSlice = createSlice({
  name: 'fullName',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getUserName.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserName.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.name;
        state.surname = action.payload.surname;
      })
      .addCase(getUserName.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default fullNameSlice.reducer;
