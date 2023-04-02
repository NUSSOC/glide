import { createSelector, PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

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

export const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    rehydrate: (_, action: PayloadAction<FilesState>) => action.payload,
    create: (state, action: PayloadAction<boolean | undefined>) => {
      const name = `untitled-${state.list.length + 1}.py`;
      state.files[name] = name;
      state.list.push(name);

      const select = action.payload;
      if (select) state.selected = name;
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
      const isOldNameExist = Boolean(state.files[oldName]);
      const isNewNameExist = Boolean(state.files[newName]);
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

export const getFileNames = createSelector(selectFiles, (files) => files.list);

export const getSelectedFileName = createSelector(
  selectFiles,
  (files) => files.selected,
);

export const getSelectedFileContent = createSelector(selectFiles, (files) =>
  files.selected ? files.files[files.selected] : undefined,
);

export const getSelectedFile = createSelector(selectFiles, (files) =>
  files.selected
    ? { name: files.selected, content: files.files[files.selected] }
    : { name: undefined, content: undefined },
);

export const filesActions = filesSlice.actions;
export default filesSlice.reducer;
