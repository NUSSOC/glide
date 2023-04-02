import { useEffect, useRef } from 'react';

interface Interpreter {
  run: (code: string) => void;
  stop: () => void;
  execute: (command: string) => void;
}

interface Callbacks {
  write: (text: string) => void;
  writeln: (text: string) => void;
  error: (text: string) => void;
  exports?: () => { name: string; content: string }[];
}

interface Message<L extends Record<string, any>> {
  type: keyof L;
  payload: any;
}

const useInterpreter = (callbacks: Callbacks): Interpreter => {
  const workerRef = useRef<Worker>();
  const interruptBufferRef = useRef<Uint8Array>();

  const setUpInterpreterWorker = () => {
    const worker = new Worker(
      new URL('../workers/interpreter.worker.ts', import.meta.url),
    );

    worker.onmessage = (event: MessageEvent<Message<Callbacks>>) => {
      callbacks[event.data.type]?.(event.data.payload);
    };

    // TODO: Check if SharedArrayBuffer is supported. If not, just restart Pyodide.
    const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
    interruptBufferRef.current = interruptBuffer;
    worker.postMessage({
      type: 'setInterruptBuffer',
      payload: interruptBuffer,
    });

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

  return {
    run: (code) => {
      resetInterruptBuffer();
      workerRef.current?.postMessage({
        type: 'run',
        payload: { code, exports: callbacks.exports?.() },
      });
    },
    stop: () => {
      if (!interruptBufferRef.current) return;
      interruptBufferRef.current[0] = 2;
      workerRef.current?.postMessage({ type: 'replClear' });
    },
    execute: (code) => {
      resetInterruptBuffer();
      workerRef.current?.postMessage({
        type: 'replInput',
        payload: { code, exports: callbacks.exports?.() },
      });
    },
  };
};

export default useInterpreter;
