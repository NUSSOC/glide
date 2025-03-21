import { getState } from '../store';
import {
  getSelectedFile,
  getSelectedFileName,
  selectIsUnsavedOf,
  selectNamesSet,
  selectNamesWithUnsaved,
} from '../store/filesSlice';
import { useAppSelector } from '../store/hooks';

const Selected = () => useAppSelector(getSelectedFile);

const SelectedName = () => useAppSelector(getSelectedFileName);

const NamesSet = () => useAppSelector(selectNamesSet);

const NamesWithUnsaved = () => useAppSelector(selectNamesWithUnsaved);

const IsUnsavedOf = (name?: string) => useAppSelector(selectIsUnsavedOf(name));

const Exports = () => {
  const { files, list } = getState().vault;
  return list.map((name) => ({ name, content: files[name] }));
};

const useFile = {
  SelectedName,
  Selected,
  NamesSet,
  NamesWithUnsaved,
  IsUnsavedOf,
  Exports,
};

export default useFile;
