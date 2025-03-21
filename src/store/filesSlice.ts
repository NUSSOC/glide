import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { createSelector } from './utils';
import { RootState } from '.';

interface FilesState {
  files: Record<string, string>;
  list: string[];
  selected?: string;
}

const initialState: FilesState = {
  files: {},
  list: [],
};

const findSuitableName = (
  name: string,
  list: string[],
  transformer: (counter: number) => string,
) => {
  const names = new Set(list);
  let counter = 0;
  let newName = name;

  while (names.has(newName)) {
    newName = transformer(counter);
    counter += 1;
  }

  return newName;
};

export const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    rehydrate: (
      state,
      action: PayloadAction<Pick<FilesState, 'files' | 'list'>>,
    ) => {
      state.files = action.payload.files;
      state.list = action.payload.list;
    },
    draft: (state, action: PayloadAction<boolean | undefined>) => {
      const name = findSuitableName(
        'untitled.py',
        state.list,
        (counter) => `untitled-${counter + 1}.py`,
      );

      state.files[name] = '';
      state.list.push(name);

      const select = action.payload;
      if (select) state.selected = name;
    },
    create: (
      state,
      action: PayloadAction<{ name: string; content: string }>,
    ) => {
      const { name, content } = action.payload;
      const newName = findSuitableName(
        name,
        state.list,
        (counter) => `Copy${counter ? ` ${counter}` : ''} of ${name}`,
      );

      state.files[newName] = content;
      state.list.push(newName);
      state.selected = newName;
    },
    updateSelected: (state, action: PayloadAction<string>) => {
      if (state.selected === undefined) return;

      state.files[state.selected] = action.payload;
    },
    destroy: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      delete state.files[name];
      state.list = state.list.filter((file) => file !== name);
      if (state.selected === name) state.selected = undefined;
    },
    select: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      if (state.files[name] === undefined) return;

      state.selected = name;
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

      if (state.selected === oldName) state.selected = newName;
    },
  },
});

const selectFiles = (state: RootState) => state.files;

export const getSelectedFileName = createSelector(
  selectFiles,
  (files) => files.selected,
);

export const getSelectedFile = createSelector(selectFiles, (files) =>
  files.selected
    ? { name: files.selected, content: files.files[files.selected] }
    : { name: undefined, content: undefined },
);

export const selectNamesSet = createSelector(
  [(state) => state.files, (state) => state.vault],
  (files, vault) => new Set(files.list.concat(vault.list)),
);

export const selectNamesWithUnsaved = createSelector(
  [(state) => state.files, (state) => state.vault],
  (files, vault) =>
    files.list.map((name) => {
      const fileInFiles = files.files[name];
      const fileInVault = vault.files[name];

      return { name, unsaved: fileInFiles !== fileInVault };
    }),
);

export const selectIsUnsavedOf = (name?: string) =>
  createSelector(
    [(state) => state.files, (state) => state.vault],
    (files, vault) => {
      if (!name) return true;

      const fileInFiles = files.files[name];
      const fileInVault = vault.files[name];

      return fileInFiles !== fileInVault;
    },
  );

export const filesActions = filesSlice.actions;
export default filesSlice.reducer;
