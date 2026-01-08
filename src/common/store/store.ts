import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './slicer/userSlice';
import registerReducer from './slicer/registrationSlice';
import forgotPasswordReducer from './slicer/forgotPasswordSlice';
import getProjectsReducer from './slicer/getProjectsSlice';
import projectDataReducer from './slicer/projectDataSlice';
import getUserNameReducer from './slicer/fullNameSlice';
import getTasksReducer from './slicer/getTasksSlice';
import taskReducer from './slicer/taskSlice';
import getProjectTasksReducer from './slicer/getProjectTasksSlice';

const rootReducer = combineReducers({
  user: userReducer,
  register: registerReducer,
  projectData: projectDataReducer,
  forgotPassword: forgotPasswordReducer,
  projects: getProjectsReducer,
  fullName: getUserNameReducer,
  getTasks: getTasksReducer,
  task: taskReducer,
  projectTasks: getProjectTasksReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
