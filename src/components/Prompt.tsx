import { JSX, Ref, useImperativeHandle, useRef, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { produce } from 'immer';

import useCommandHistory from '../hooks/useCommandHistory';

interface PromptRef {
  focusWith: (key?: string) => void;
}

interface PromptProps {
  ref?: Ref<PromptRef>;
  onReturn?: (command: string) => void;
}

const Prompt = (props: PromptProps): JSX.Element => {
  const [{ dirty, command }, setCommand] = useState({
    dirty: false,
    command: '',
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const history = useCommandHistory();

  useImperativeHandle(
    props.ref,
    () => ({
      focusWith: (key) => {
        if (key)
          setCommand((state) => ({
            dirty: true,
            command: state.command + key,
          }));

        inputRef.current?.focus();
      },
    }),
    [setCommand],
  );

  return (
    <div className="flex w-full items-center rounded-lg bg-slate-800 px-2 text-slate-300 shadow-2xl shadow-slate-900 focus-within:ring-2 focus-within:ring-slate-500">
      <ChevronRightIcon className="h-5" />

      <div className="relative ml-2 w-full">
        {!command.length && (
          <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full items-center overflow-hidden">
            <p className="overflow-ellipsis whitespace-nowrap text-sm opacity-50">
              Python commands go here! More options? &rarr;
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="w-full bg-transparent py-2 pr-2 font-mono text-sm outline-none"
          onChange={(e) => {
            setCommand({ dirty: true, command: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              history.push(command);
              props.onReturn?.(command);
              setCommand({ dirty: false, command: '' });
            }

            if (e.key === 'Tab') {
              e.preventDefault();
              setCommand(
                produce((draft) => {
                  draft.command = `${command}\t`;
                }),
              );
            }

            if (e.key === 'ArrowUp' && (!command || !dirty)) {
              e.preventDefault();
              setCommand({ dirty: false, command: history.previous() ?? '' });
            }

            if (e.key === 'ArrowDown' && (!command || !dirty)) {
              e.preventDefault();
              setCommand({ dirty: false, command: history.next() ?? '' });
            }
          }}
          spellCheck={false}
          value={command}
        />
      </div>
    </div>
  );
};

export default Prompt;
