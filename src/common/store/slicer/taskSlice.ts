import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from 'src/api/instances';

interface ICreator {
  id: number;
  name: string;
  surname: string;
  email: string;
}

interface IMemberUser {
  id: number;
  name: string;
  surname: string;
  email: string;
}

interface IMember {
  role: string;
  users: IMemberUser;
}

export interface ITask {
  id: number;
  name: string;
  priority_id: number;
  priority_name: string;
  created_by: number;
  creator: ICreator;
  weight: number;
  description: string;
  is_completed: boolean;
  start_at: string;
  deadline_at: string;
  project_name: string;
  project_id: string;
  members: IMember[];
  without_time: boolean;
}

interface ITaskState {
  task: ITask | null;
  loading: boolean;
  error: string | null;
}

const initialState: ITaskState = {
  task: null,
  loading: false,
  error: null,
};

export const getTaskById = createAsyncThunk('task/getTaskById', async (task_id: number, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(`/tasks/task/${task_id}`);
    return response.data as ITask;
  } catch (error: any) {
    console.error('error:', error);

    let errorMessage = 'Failed to fetch task';

    if (error.response?.data) {
      const data = error.response.data;

      if (data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((e: any) => e.msg).join('; ');
        } else if (typeof data.detail === 'object') {
          errorMessage = data.detail.msg || JSON.stringify(data.detail);
        }
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return rejectWithValue(errorMessage);
  }
});

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getTaskById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaskById.fulfilled, (state, action: PayloadAction<ITask>) => {
        state.loading = false;
        state.task = action.payload;
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Unknown error';
      });
  },
});

export default taskSlice.reducer;
