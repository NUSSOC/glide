import { useState } from 'react';
import { Transition } from '@headlessui/react';

import { persistor } from '../store';
import { filesActions, getSelectedFileName } from '../store/filesSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { vaultActions } from '../store/vaultSlice';

import UnsavedBadge from './UnsavedBadge';

interface FileNameProps {}

interface RenamableInputProps {
  initialValue: string;
  onConfirm: (value: string) => void;
}

const RenamableInput = (props: RenamableInputProps): JSX.Element => {
  const [newFileName, setNewFileName] = useState<string>();
  const [editing, setEditing] = useState(false);

  return !editing ? (
    <div
      className="rounded-lg p-2 hover:bg-slate-800"
      onClick={() => {
        setEditing(true);
      }}
    >
      <p className="text-md">{props.initialValue}</p>
    </div>
  ) : (
    <input
      autoFocus
      className="w-fit rounded-lg bg-slate-800 bg-transparent p-2 outline-none ring-2 ring-slate-600"
      onBlur={() => {
        let newName = newFileName?.trim();
        setEditing(false);
        setNewFileName(undefined);

        if (!newName || newName === props.initialValue) return;

        if (!newName.endsWith('.py')) newName += '.py';
        props.onConfirm(newName);
      }}
      onChange={(e) => setNewFileName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          setEditing(false);
          setNewFileName(undefined);
        }
      }}
      placeholder={props.initialValue}
      type="text"
      value={newFileName ?? props.initialValue}
    />
  );
};

const FileName = (props: FileNameProps): JSX.Element => {
  const selectedFileName = useAppSelector(getSelectedFileName);

  const isFileUnsaved = useAppSelector(({ files, vault }) => {
    if (!selectedFileName) return true;

    const fileInFiles = files.files[selectedFileName];
    const fileInVault = vault.files[selectedFileName];

    return fileInFiles !== fileInVault;
  });

  const existingFileNames = useAppSelector(
    ({ files, vault }) => new Set(files.list.concat(vault.list)),
  );

  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center space-x-3">
      <RenamableInput
        initialValue={selectedFileName ?? ''}
        onConfirm={(newName) => {
          if (!selectedFileName) return;
          if (existingFileNames.has(newName)) return;

          dispatch(
            filesActions.rename({ from: selectedFileName, to: newName }),
          );
          dispatch(
            vaultActions.rename({ from: selectedFileName, to: newName }),
          );
          persistor.flush();
        }}
      />

      <Transition
        enter="transition-transform origin-left duration-75"
        enterFrom="scale-0"
        enterTo="scale-100"
        leave="transition-transform origin-left duration-150"
        leaveFrom="scale-100"
        leaveTo="scale-0"
        show={Boolean(selectedFileName && isFileUnsaved)}
      >
        <UnsavedBadge />
      </Transition>
    </div>
  );
};

export default FileName;
