import { useState } from 'react';
import { Transition } from '@headlessui/react';

import useFile from '../hooks/useFile';
import useFilesMutations from '../hooks/useFilesMutations';

import UnsavedBadge from './UnsavedBadge';

interface RenamableInputProps {
  initialValue: string;
  onConfirm: (value: string) => void;
}

const RenamableInput = (props: RenamableInputProps): JSX.Element => {
  const [newFileName, setNewFileName] = useState<string>();
  const [editing, setEditing] = useState(false);

  return !editing ? (
    <div
      className="min-w-0 rounded-lg p-2 hover:bg-slate-800"
      onClick={() => setEditing(true)}
    >
      <p className="text-md overflow-hidden overflow-ellipsis whitespace-nowrap">
        {props.initialValue}
      </p>
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

const FileName = (): JSX.Element => {
  const name = useFile.SelectedName();
  const unsaved = useFile.IsUnsavedOf(name);
  const existingNames = useFile.NamesSet();

  const { rename } = useFilesMutations();

  return (
    <div className="flex min-w-0 items-center space-x-3">
      <RenamableInput
        initialValue={name ?? ''}
        onConfirm={(newName) => {
          if (!name) return;
          if (existingNames.has(newName)) return;

          rename(name, newName);
        }}
      />

      <Transition
        enter="transition-transform origin-left duration-75"
        enterFrom="scale-0"
        enterTo="scale-100"
        leave="transition-transform origin-left duration-150"
        leaveFrom="scale-100"
        leaveTo="scale-0"
        show={Boolean(name && unsaved)}
      >
        <UnsavedBadge />
      </Transition>
    </div>
  );
};

export default FileName;
