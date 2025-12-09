import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './slicer/userSlice';
import registerReducer from './slicer/registrationSlice';
import forgotPasswordReducer from './slicer/forgotPasswordSlice';

const rootReducer = combineReducers({
  user: userReducer,
  register: registerReducer,
  forgotPassword: forgotPasswordReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
