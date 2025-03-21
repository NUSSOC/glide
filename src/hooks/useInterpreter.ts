import { useEffect, useRef } from 'react';

interface Interpreter {
  run: (code: string) => void;
  stop: () => void;
  execute: (command: string) => void;
  restart: () => void;
}

interface Callbacks {
  write: (text: string) => void;
  writeln: (text: string) => void;
  error: (text: string) => void;
  system: (text: string) => void;
  exports?: () => { name: string; content: string }[];
  lock: () => void;
  unlock: () => void;
}

interface Message<L extends Record<string, any>> {
  type: keyof L;
  payload: any;
}

const useInterpreter = (callbacks: Callbacks): Interpreter => {
  const workerRef = useRef<Worker>(null);
  const interruptBufferRef = useRef<Uint8Array>(null);

  const setUpInterpreterWorker = () => {
    const worker = new Worker(
      new URL('../workers/interpreter.worker.ts', import.meta.url),
    );

    worker.onmessage = (event: MessageEvent<Message<Callbacks>>) => {
      callbacks[event.data.type]?.(event.data.payload);
    };

    let interruptBuffer: Uint8Array | null = null;

    if (typeof SharedArrayBuffer !== 'undefined') {
      interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
      interruptBufferRef.current = interruptBuffer;
    }

    worker.postMessage({ type: 'initialize', payload: interruptBuffer });

    workerRef.current = worker;
  };

  useEffect(() => {
    if (workerRef.current) return;

    setUpInterpreterWorker();
  }, []);

  const resetInterruptBuffer = () => {
    if (!interruptBufferRef.current) return;
    interruptBufferRef.current[0] = 0;
  };

  const restartInterpreter = () => {
    workerRef.current?.terminate();
    setUpInterpreterWorker();
  };

  return {
    run: (code) => {
      resetInterruptBuffer();
      workerRef.current?.postMessage({
        type: 'run',
        payload: { code, exports: callbacks.exports?.() },
      });
    },
    stop: () => {
      if (interruptBufferRef.current) {
        interruptBufferRef.current[0] = 2;
        workerRef.current?.postMessage({ type: 'replClear' });
      } else {
        callbacks.system(
          "\nDue to browser incompatibility, we can't stop your code execution gracefully. Instead, we'll restart the interpreter for you. Hold on yah...\n",
        );
        restartInterpreter();
      }
    },
    execute: (code) => {
      resetInterruptBuffer();
      workerRef.current?.postMessage({
        type: 'replInput',
        payload: { code, exports: callbacks.exports?.() },
      });
    },
    restart: () => {
      callbacks.system('\nOkies! Restarting interpreter...\n');
      restartInterpreter();
    },
  };
};

export default useInterpreter;
