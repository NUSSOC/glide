import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ArrowUpTrayIcon, PlusIcon } from '@heroicons/react/24/outline';

import useFilesMutations from '../hooks/useFilesMutations';
import { useAppSelector } from '../store/hooks';

import Button from './Button';
import FileItem from './FileItem';

interface LibraryProps {
  open: boolean;
  onClose: () => void;
}

const Library = (props: LibraryProps): JSX.Element => {
  const files = useAppSelector(({ files, vault }) =>
    files.list.map((name) => {
      const fileInFiles = files.files[name];
      const fileInVault = vault.files[name];

      return { name, unsaved: fileInFiles !== fileInVault };
    }),
  );

  const { draft } = useFilesMutations();

  return (
    <Transition appear as={Fragment} show={props.open}>
      <Dialog className="relative z-10" onClose={props.onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center px-4 py-10 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-5 text-left align-middle shadow-xl ring-2 ring-slate-700 transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white"
                >
                  Library
                </Dialog.Title>

                <div className="mt-2">
                  <p className="text-sm text-slate-400">
                    The files you have saved are listed below.
                  </p>
                </div>

                <div className="mt-4 flex flex-col space-y-2">
                  {files.map(({ name, unsaved }) => (
                    <FileItem
                      key={name}
                      name={name}
                      onClick={props.onClose}
                      unsaved={unsaved}
                    />
                  ))}
                </div>

                <div className="mt-10 space-x-2">
                  <Button
                    icon={PlusIcon}
                    onClick={() => {
                      draft();
                      props.onClose();
                    }}
                  >
                    New File
                  </Button>
                  <Button icon={ArrowUpTrayIcon}>Upload</Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Library;
