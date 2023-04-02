import { createSelector, PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '.';

interface File {
  name: string;
  content: string;
}

interface VaultState {
  files: Record<string, string>;
  list: string[];
}

const initialState: VaultState = {
  files: {},
  list: [],
};

export const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  reducers: {
    save: (state, action: PayloadAction<File>) => {
      const { name, content } = action.payload;

      if (state.files[name] === undefined) state.list.push(name);
      state.files[name] = content;
    },
    destroy: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      delete state.files[name];
      state.list = state.list.filter((file) => file !== name);
    },
    rename: (state, action: PayloadAction<{ from: string; to: string }>) => {
      const { from: oldName, to: newName } = action.payload;
      const isOldNameExist = state.files[oldName] !== undefined;
      const isNewNameExist = state.files[newName] !== undefined;
      if (!isOldNameExist || isNewNameExist) return;

      state.files[newName] = state.files[oldName];
      delete state.files[oldName];
      state.list = state.list.map((name) =>
        name === oldName ? newName : name,
      );
    },
  },
});

const selectVault = (state: RootState) => state.vault;

export const getFileNames = createSelector(selectVault, (vault) => vault.list);

export const getFileContent = (name: string) =>
  createSelector(selectVault, (vault) => vault.files[name]);

export const vaultActions = vaultSlice.actions;
export default vaultSlice.reducer;
