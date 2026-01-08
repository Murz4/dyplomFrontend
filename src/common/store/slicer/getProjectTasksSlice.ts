import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

export type IUser = {
  id: number;
  name: string;
  surname: string;
  email: string;
};

export type ITaskMember = {
  role: string;
  users: IUser;
};

export type ITask = {
  id: number;
  name: string;
  priority_id: number;
  priority_name: string;
  created_by: number;
  creator: IUser;
  weight: number;
  description: string;
  is_completed: boolean;
  without_time: boolean;
  start_at: string;
  deadline_at: string;
  members: ITaskMember[];
};

interface IInitialStateProps {
  items: ITask[];
  loading: boolean;
  error: string | null;
  nextCursor: number | null;
  hasMore: boolean;
  limit: number;
}

interface IGetTasksParams {
  project_id: number;
  cursor?: number;
  limit?: number;
  priority_id?: number;
  filters?: 'today' | 'week' | 'overdue' | 'completed' | 'upcoming';
}

export const getProjectTasks = createAsyncThunk(
  'getTasks/getTasksFetch',
  async ({ project_id, cursor, limit = 5, priority_id, filters }: IGetTasksParams, thunkAPI) => {
    try {
      const params: any = { limit };

      if (cursor !== undefined) {
        params.cursor = cursor;
      }

      if (priority_id !== undefined) {
        params.priority_id = priority_id;
      }

      if (filters) {
        params.filters = filters;
      }

      const response = await apiClient.get(`/tasks/${project_id}`, { params });
      console.log(response.data);

      const items: ITask[] = response.data.items;
      const nextCursor: number | null = response.data.next_cursor ?? null;

      return {
        items,
        nextCursor,
        limit,
        hasMore: nextCursor !== null && nextCursor !== 0,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

const initialState: IInitialStateProps = {
  items: [],
  loading: false,
  error: null,
  nextCursor: null,
  hasMore: true,
  limit: 5,
};

const getProjectTasksSlice = createSlice({
  name: 'projectTasks',
  initialState,
  reducers: {
    removeTask: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    updateTask: (state, action: PayloadAction<ITask>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    toggleTaskCompletion: (state, action: PayloadAction<number>) => {
      const task = state.items.find(t => t.id === action.payload);
      if (task) {
        task.is_completed = !task.is_completed;
      }
    },
    resetTasks: state => {
      state.items = [];
      state.nextCursor = null;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getProjectTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectTasks.fulfilled, (state, action) => {
        state.loading = false;

        if (!action.meta.arg.cursor) {
          state.items = action.payload.items;
        } else {
          const existingIds = new Set(state.items.map((item: ITask) => item.id));
          const newItems = action.payload.items.filter((item: ITask) => !existingIds.has(item.id));
          state.items = [...state.items, ...newItems];
        }

        state.nextCursor = action.payload.nextCursor;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(getProjectTasks.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { removeTask, updateTask, toggleTaskCompletion, resetTasks } = getProjectTasksSlice.actions;
export default getProjectTasksSlice.reducer;
