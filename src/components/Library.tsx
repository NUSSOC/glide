import { JSX } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { ArrowUpTrayIcon, PlusIcon } from '@heroicons/react/24/outline';

import githubIconSrc from '../assets/github-white.svg?url';
import useFile from '../hooks/useFile';
import useFilesMutations from '../hooks/useFilesMutations';

import Button from './Button';
import FileItem from './FileItem';
import FileUploader from './FileUploader';

interface LibraryProps {
  open: boolean;
  onClose: () => void;
}

const Library = (props: LibraryProps): JSX.Element => {
  const files = useFile.NamesWithUnsaved();

  const { draft, create } = useFilesMutations();

  return (
    <Transition appear show={props.open}>
      <Dialog className="relative z-40" onClose={props.onClose}>
        <TransitionChild
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center px-4 py-10 text-center">
            <TransitionChild
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-5 text-left align-middle shadow-xl ring-2 ring-slate-700 transition-all">
                <div className="flex justify-between">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    Library
                  </DialogTitle>

                  <p className="select-none text-sm text-slate-600">
                    {__VERSION__}
                  </p>
                </div>

                <div className="mt-6 flex flex-col space-y-2">
                  {files.map(({ name, unsaved }, index) => (
                    <FileItem
                      key={name}
                      isFirst={index === 0}
                      name={name}
                      onClick={props.onClose}
                      unsaved={unsaved}
                    />
                  ))}
                </div>

                <div className="mt-10 space-x-2 flex justify-between">
                  <div className="space-x-2">
                    <Button
                      autoFocus={files.length === 0}
                      icon={PlusIcon}
                      onClick={() => {
                        draft(true);
                        props.onClose();
                      }}
                    >
                      New File
                    </Button>

                    <FileUploader
                      icon={ArrowUpTrayIcon}
                      onUpload={(name, content) => {
                        if (content === null) return;

                        create(name, content);
                        props.onClose();
                      }}
                    >
                      Upload
                    </FileUploader>
                  </div>

                  <a
                    href="https://github.com/NUSSOC/glide"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <button className="opacity-40 hover:opacity-100 hover:bg-sky-50/10 inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium active:scale-95 text-white items-center">
                      <img
                        alt="GitHub logo"
                        className="size-5 -ml-1 mr-2"
                        src={githubIconSrc}
                      />

                      <p>Star on GitHub</p>
                    </button>
                  </a>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Library;
