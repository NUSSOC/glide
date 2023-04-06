import { persistor } from '../store';
import { filesActions } from '../store/filesSlice';
import { useAppDispatch } from '../store/hooks';
import { vaultActions } from '../store/vaultSlice';

interface UseFilesMutationsHook {
  /**
   * For performance reasons, the caller should ensure that the new
   * name is not already in use in *both* the files and vault stores.
   */
  rename: (from: string, to: string) => void;
  save: (name: string, content: string) => void;
  destroy: (name: string) => void;
  draft: (autoSelect?: boolean) => void;
  select: (name: string) => void;
  update: (content: string) => void;
  create: (name: string, content: string) => void;
  toggleExport: (name: string) => void;
}

const useFilesMutations = (): UseFilesMutationsHook => {
  const dispatch = useAppDispatch();

  return {
    save: (name: string, content: string) => {
      dispatch(filesActions.updateSelected(content));
      dispatch(vaultActions.save({ name, content }));
      persistor.flush();
    },
    rename: (from: string, to: string) => {
      if (from === to) return;

      dispatch(filesActions.rename({ from, to }));
      dispatch(vaultActions.rename({ from, to }));
      persistor.flush();
    },
    destroy: (name: string) => {
      dispatch(filesActions.destroy(name));
      dispatch(vaultActions.destroy(name));
      persistor.flush();
    },
    draft: (autoSelect?: boolean) => {
      dispatch(filesActions.draft(autoSelect));
    },
    select: (name: string) => {
      dispatch(filesActions.select(name));
    },
    update: (content: string) => {
      dispatch(filesActions.updateSelected(content));
    },
    create: (name: string, content: string) => {
      dispatch(filesActions.create({ name, content }));
      dispatch(vaultActions.save({ name, content }));
      persistor.flush();
    },
    toggleExport: (name: string) => {
      dispatch(filesActions.toggleExport(name));
    },
  };
};

export default useFilesMutations;
