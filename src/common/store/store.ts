import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './slicer/userSlice';
import registerReducer from './slicer/registrationSlice';

const rootReducer = combineReducers({
  user: userReducer,
  register: registerReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
