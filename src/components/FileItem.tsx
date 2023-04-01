import { ArrowRightIcon, TrashIcon } from '@heroicons/react/24/outline';

import { persistor } from '../store';
import { filesActions } from '../store/filesSlice';
import { useAppDispatch } from '../store/hooks';
import { vaultActions } from '../store/vaultSlice';

import UnsavedBadge from './UnsavedBadge';

interface FileItemProps {
  name: string;
  onClick?: () => void;
  unsaved?: boolean;
}

const FileItem = (props: FileItemProps): JSX.Element => {
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center space-x-2">
      <div
        className="group flex w-full min-w-0 select-none flex-row items-center justify-between rounded-lg bg-slate-700 p-3 text-slate-100 transition-transform hover:bg-slate-600 active:scale-95"
        onClick={() => {
          dispatch(filesActions.select(props.name));
          props.onClick?.();
        }}
        role="button"
      >
        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap opacity-90">
          {props.name}
        </p>

        <div className="flex items-center space-x-3 pl-2">
          {props.unsaved && <UnsavedBadge className="group-hover:hidden" />}

          <div className="hidden animate-pulse items-center space-x-1 text-xs opacity-70 group-hover:flex">
            <p>Open</p>
            <ArrowRightIcon className="h-4" />
          </div>
        </div>
      </div>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-400 transition-transform hover:scale-110 active:scale-95"
        onClick={() => {
          dispatch(filesActions.delete(props.name));
          dispatch(vaultActions.delete(props.name));
          persistor.flush();
        }}
        role="button"
      >
        <TrashIcon className="h-5" />
      </div>
    </div>
  );
};

export default FileItem;
