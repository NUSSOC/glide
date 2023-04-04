import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface PromptRef {
  focusWith: (key?: string) => void;
}

interface PromptProps {
  onCtrlC?: () => void;
  onReturn?: (command: string) => void;
  onF2?: () => void;
}

const Prompt = forwardRef<PromptRef, PromptProps>((props, ref): JSX.Element => {
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusWith: (key) => {
      if (key) setCommand((currentCommand) => currentCommand + key);
      inputRef.current?.focus();
    },
  }));

  return (
    <div className="flex items-center rounded-lg bg-slate-800 px-2 text-slate-300 shadow-2xl shadow-slate-900 focus-within:ring-2 focus-within:ring-slate-500">
      <ChevronRightIcon className="h-5" />

      <div className="relative ml-2 w-full">
        {!command.length && (
          <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full items-center overflow-hidden">
            <p className="overflow-ellipsis whitespace-nowrap text-sm opacity-50">
              Python commands go here! <kbd>Ctrl</kbd>+<kbd>C</kbd> stops
              execution. <kbd>F2</kbd> clears the console.
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          className="w-full bg-transparent py-2 pr-2 font-mono text-sm outline-none"
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              props.onReturn?.(command);
              setCommand('');
            }

            if (e.key === 'Tab') {
              e.preventDefault();
              setCommand((input) => `${input}\t`);
            }

            if (e.ctrlKey && e.key === 'c') {
              e.preventDefault();
              props.onCtrlC?.();
              setCommand('');
            }

            if (e.key === 'F2') {
              e.preventDefault();
              props.onF2?.();
            }
          }}
          value={command}
        />
      </div>
    </div>
  );
});

Prompt.displayName = 'Prompt';

export default Prompt;
