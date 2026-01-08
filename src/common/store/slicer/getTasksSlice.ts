import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getTasks } from 'src/api/getTasks';

interface ITask {
  project_id: number;
  task_id: number;
  name: string;
  description: string;
  priority_id: number;
  start_at?: string;
  deadline_at?: string;
  is_overdue: boolean;
  is_completed: boolean;
  without_time?: boolean;
}

interface ITasksState {
  tasks: ITask[];
  loading: boolean;
  error: string | null;
  cache: Record<string, ITask[]>;
}

const initialState: ITasksState = {
  tasks: [],
  loading: false,
  error: null,
  cache: {},
};

export const fetchTasks = createAsyncThunk(
  'getTasks/fetchTasks',
  async ({ year, month }: { year: number; month: number }, { getState }) => {
    const state = getState() as { getTasks: ITasksState };
    const cacheKey = `${year}-${String(month).padStart(2, '0')}`;

    if (state.getTasks.cache[cacheKey]) {
      return { tasks: state.getTasks.cache[cacheKey], fromCache: true };
    }

    const tasks = await getTasks({ year, month });
    return { tasks, cacheKey, fromCache: false };
  }
);

const getTasksSlice = createSlice({
  name: 'getTasks',
  initialState,
  reducers: {
    clearCache: state => {
      state.cache = {};
      state.tasks = [];
    },
    clearError: state => {
      state.error = null;
    },
    clearCacheForCurrentMonth: (state, action: PayloadAction<{ year: number; month: number }>) => {
      const { year, month } = action.payload;
      const cacheKey = `${year}-${String(month).padStart(2, '0')}`;
      delete state.cache[cacheKey];
    },
    addNewTask: (state, action: PayloadAction<ITask>) => {
      const newTask = action.payload;

      state.tasks.push(newTask);

      if (newTask.deadline_at) {
        const taskDate = new Date(newTask.deadline_at);
        const year = taskDate.getFullYear();
        const month = taskDate.getMonth() + 1;
        const cacheKey = `${year}-${String(month).padStart(2, '0')}`;

        if (state.cache[cacheKey]) {
          state.cache[cacheKey].push(newTask);
        } else {
          state.cache[cacheKey] = [newTask];
        }
      }

      if (newTask.start_at) {
        const startDate = new Date(newTask.start_at);
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth() + 1;
        const startCacheKey = `${startYear}-${String(startMonth).padStart(2, '0')}`;

        let deadlineCacheKey = '';
        if (newTask.deadline_at) {
          const deadlineDate = new Date(newTask.deadline_at);
          deadlineCacheKey = `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}`;
        }

        if (startCacheKey !== deadlineCacheKey) {
          if (state.cache[startCacheKey]) {
            state.cache[startCacheKey].push(newTask);
          } else {
            state.cache[startCacheKey] = [newTask];
          }
        }
      }
    },
    updateTask: (state, action: PayloadAction<ITask>) => {
      const updatedTask = action.payload;

      const index = state.tasks.findIndex(task => task.task_id === updatedTask.task_id);
      if (index !== -1) {
        state.tasks[index] = updatedTask;
      }

      Object.keys(state.cache).forEach(key => {
        const taskIndex = state.cache[key].findIndex(task => task.task_id === updatedTask.task_id);
        if (taskIndex !== -1) {
          state.cache[key][taskIndex] = updatedTask;
        }
      });
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      const taskId = action.payload;

      state.tasks = state.tasks.filter(task => task.task_id !== taskId);

      Object.keys(state.cache).forEach(key => {
        state.cache[key] = state.cache[key].filter(task => task.task_id !== taskId);
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;

        if (!action.payload.fromCache && action.payload.cacheKey) {
          state.cache[action.payload.cacheKey] = action.payload.tasks;
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Unknown error';
      });
  },
});

export const { clearCache, clearError, addNewTask, updateTask, deleteTask, clearCacheForCurrentMonth } =
  getTasksSlice.actions;

export default getTasksSlice.reducer;
