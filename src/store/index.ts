import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistCombineReducers,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import filesReducer, { filesActions } from './filesSlice';
import vaultReducer from './vaultSlice';

const persistConfig = { key: 'root', storage, whitelist: ['vault'] };

const rootReducer = persistCombineReducers(persistConfig, {
  files: filesReducer,
  vault: vaultReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store, null, () => {
  const vault = store.getState().vault;
  store.dispatch(filesActions.rehydrate(vault));
});

export const getState = store.getState;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
