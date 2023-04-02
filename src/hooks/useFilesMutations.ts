import { persistor } from '../store';
import { filesActions } from '../store/filesSlice';
import { useAppDispatch } from '../store/hooks';
import { vaultActions } from '../store/vaultSlice';

interface UseFilesMutationsHook {
  save: (name: string, content: string) => void;
  rename: (from: string, to: string) => void;
  destroy: (name: string) => void;
  draft: (autoSelect?: boolean) => void;
  select: (name: string) => void;
  update: (content: string) => void;
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
      dispatch(filesActions.create(autoSelect));
    },
    select: (name: string) => {
      dispatch(filesActions.select(name));
    },
    update: (content: string) => {
      dispatch(filesActions.updateSelected(content));
    },
  };
};

export default useFilesMutations;
