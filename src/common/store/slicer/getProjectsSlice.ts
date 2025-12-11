import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

type IItems = {
  id: number;
  name: string;
};

interface IInitialStateProps {
  items: IItems[];
  loading: boolean;
  error: string | null;
}

export const getProjects = createAsyncThunk(
  'getProjects/getProjectsFetch',
  async ({ cursor = 0, limit = 10 }: { cursor?: number; limit?: number }, thunkAPI) => {
    try {
      const response = await apiClient.get('/projects/', { params: { cursor, limit } });
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Send Email failed');
    }
  }
);

const initialState: IInitialStateProps = {
  items: [],
  loading: false,
  error: null,
};

export const getProjectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getProjects.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
      })
      .addCase(getProjects.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default getProjectsSlice.reducer;
