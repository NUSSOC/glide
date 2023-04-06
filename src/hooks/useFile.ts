import { getState } from '../store';
import { getSelectedFile, getSelectedFileName } from '../store/filesSlice';
import { useAppSelector } from '../store/hooks';

const Selected = () => useAppSelector(getSelectedFile);

const SelectedName = () => useAppSelector(getSelectedFileName);

const NamesSet = () =>
  useAppSelector(({ files, vault }) => new Set(files.list.concat(vault.list)));

const NamesWithUnsaved = () =>
  useAppSelector(({ files, vault }) =>
    files.list.map((name) => {
      const fileInFiles = files.files[name];
      const fileInVault = vault.files[name];

      return { name, unsaved: fileInFiles !== fileInVault };
    }),
  );

const IsUnsavedOf = (name?: string) =>
  useAppSelector(({ files, vault }) => {
    if (!name) return true;

    const fileInFiles = files.files[name];
    const fileInVault = vault.files[name];

    return fileInFiles !== fileInVault;
  });

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
