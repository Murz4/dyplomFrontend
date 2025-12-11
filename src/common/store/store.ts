import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './slicer/userSlice';
import registerReducer from './slicer/registrationSlice';
import forgotPasswordReducer from './slicer/forgotPasswordSlice';
import getProjectsReducer from './slicer/getProjectsSlice';

const rootReducer = combineReducers({
  user: userReducer,
  register: registerReducer,
  forgotPassword: forgotPasswordReducer,
  projects: getProjectsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
