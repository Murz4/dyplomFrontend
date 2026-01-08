import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

export type IItems = {
  id: number;
  name: string;
  description?: string;
  is_archived: boolean;
  created_at?: string;
  creator: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
  members?: any[];
};

interface IInitialStateProps {
  items: IItems[];
  total: number | null;
  loading: boolean;
  error: string | null;
  nextCursor: number | null;
  hasMore: boolean;
  limit: number;
}

export const getProjects = createAsyncThunk(
  'getProjects/getProjectsFetch',
  async ({ cursor, limit = 10 }: { cursor?: number; limit?: number }, thunkAPI) => {
    try {
      const params: { limit: number; cursor?: number } = { limit };
      if (cursor !== undefined) {
        params.cursor = cursor;
      }

      const response = await apiClient.get('/projects/', { params });
      console.log(response.data);

      const items: IItems[] = response.data.items;
      const total: number = response.data.total;
      const nextCursor: number | null = response.data.next_cursor ?? null;

      return {
        items,
        nextCursor,
        limit,
        hasMore: nextCursor !== null,
        total,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

const initialState: IInitialStateProps = {
  items: [],
  loading: false,
  error: null,
  nextCursor: null,
  hasMore: true,
  limit: 10,
  total: null,
};

const getProjectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    removeProject: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    resetProjects: state => {
      state.items = [];
      state.nextCursor = null;
      state.hasMore = true;
      state.error = null;
      state.total = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getProjects.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.total = action.payload.total;

        if (!action.meta.arg.cursor) {
          state.items = action.payload.items;
        } else {
          const existingIds = new Set(state.items.map((item: IItems) => item.id));
          const newItems = action.payload.items.filter((item: IItems) => !existingIds.has(item.id));
          state.items = [...state.items, ...newItems];
        }

        state.nextCursor = action.payload.nextCursor;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(getProjects.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { removeProject, resetProjects } = getProjectsSlice.actions;
export default getProjectsSlice.reducer;
