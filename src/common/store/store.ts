import { combineReducers, configureStore } from '@reduxjs/toolkit';

// import emotionEquipReducer from './slicer/emotionEquipSlice';

const reducer = combineReducers({
  // emotionEquip: emotionEquipReducer,
});

export type RootState = ReturnType<typeof reducer>;

export const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
});

export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];

export { useAppDispatch, useAppSelector } from './hooks.ts';
export default store;
