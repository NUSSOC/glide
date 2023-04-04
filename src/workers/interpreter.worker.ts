import {
  loadPyodide,
  PyodideInterface,
  PyProxy,
  PyProxyAwaitable,
  PyProxyCallable,
} from 'pyodide';

import consoleScript from '../assets/console.py';

/**
 * @see https://pyodide.org/en/stable/usage/api/python-api/console.html#pyodide.console.ConsoleFuture.syntax_check
 */
type SyntaxCheck = 'syntax-error' | 'incomplete' | 'complete';

interface Message<T extends Record<string, unknown>> {
  type: keyof T;
  payload: any;
}

interface RunExportableData {
  code: string;
  exports?: { name: string; content: string }[];
}

let pyodide: PyodideInterface;
let interruptBuffer: Uint8Array | null;

let namespace: PyProxy;
let await_fut: PyProxyCallable;
let repr_shorten: PyProxyCallable;
let pyconsole: PyProxy;
let clear_console: PyProxyCallable;

const PS1 = '\u001b[32;1m>>> \u001b[0m' as const;
const PS2 = '\u001b[32m... \u001b[0m' as const;
const RUN_CODE = '\u001b[3m\u001b[32m<run code>\u001b[0m' as const;

const post = {
  write: (text: string) => postMessage({ type: 'write', payload: text }),
  writeln: (line: string) => postMessage({ type: 'writeln', payload: line }),
  error: (message: string) => postMessage({ type: 'error', payload: message }),
  system: (message: string) =>
    postMessage({ type: 'system', payload: message }),
  lock: () => postMessage({ type: 'lock' }),
  unlock: () => postMessage({ type: 'unlock' }),
  prompt: (newLine = true) => post.write(`${newLine ? '\n' : ''}${PS1}`),
  promptPending: () => post.write(PS2),
};

const setUpREPLEnvironment = () => {
  namespace = pyodide.globals.get('dict')();

  pyodide.runPython(consoleScript, { globals: namespace });

  repr_shorten = namespace.get('repr_shorten');
  await_fut = namespace.get('await_fut');
  pyconsole = namespace.get('pyconsole');
  clear_console = namespace.get('clear_console');

  return namespace.get('BANNER') as string;
};

const preparePyodide = async () => {
  const newPyodide = await loadPyodide();
  newPyodide.setStdout({ batched: post.writeln });
  newPyodide.setStderr({ batched: post.error });
  pyodide = newPyodide;

  if (interruptBuffer) pyodide.setInterruptBuffer(interruptBuffer);

  const banner = setUpREPLEnvironment();
  post.writeln(banner);
  post.prompt(false);
  post.unlock();

  return newPyodide;
};

const prepareExports = (exports?: { name: string; content: string }[]) => {
  let newExports = new Set<string>();
  exports?.forEach(({ name, content }) => {
    pyodide.FS.writeFile(name, content, { encoding: 'utf-8' });
    newExports.add(name);
  });

  const oldExports = pyodide.FS.readdir('.') as string[];
  oldExports.forEach((name) => {
    if (name === '.' || name === '..' || newExports.has(name)) return;

    pyodide.FS.unlink(name);
  });
};

const listeners = {
  initialize: async (newInterruptBuffer?: Uint8Array) => {
    pyodide ??= await preparePyodide();
    if (!newInterruptBuffer) return;

    pyodide.setInterruptBuffer(newInterruptBuffer);
    interruptBuffer = newInterruptBuffer;
  },

  run: async ({ code, exports }: RunExportableData) => {
    pyodide ??= await preparePyodide();

    post.writeln(RUN_CODE);

    try {
      post.lock();
      prepareExports(exports);
      await pyodide.loadPackagesFromImports(code);

      /**
       * `await pyodide.runPythonAsync(code)` is not used because it raises
       * an uncatchable `PythonError` when Pyodide emits a `KeyboardInterrupt`.
       * @see https://github.com/pyodide/pyodide/issues/2141
       */
      const result = pyodide.runPython(code);

      post.writeln(result?.toString());
    } catch (error) {
      if (error instanceof Error) {
        post.error(error.message);
      }

      /**
       * Pyodide may sometimes not catch `RecursionError`s and excessively
       * recursive code spills as JavaScript `RangeError`, causing Pyodide to
       * fatally crash. We need to restart Pyodide in this case.
       * @see https://github.com/pyodide/pyodide/issues/951
       */
      if (error instanceof RangeError) {
        post.system(
          "\nOops, something happened and we have to restart the interpreter. Don't worry, it's not your fault. You may continue once you see the prompt again.\n",
        );

        await preparePyodide();
      }

      throw error;
    } finally {
      post.prompt();
      post.unlock();
    }
  },

  replClear: async () => {
    try {
      clear_console();
      await await_fut(pyconsole.push(''));
    } finally {
      post.error('\nKeyboardInterrupt');
      post.prompt();
    }
  },

  replInput: async ({ code, exports }: RunExportableData) => {
    post.writeln(code);

    const future = pyconsole.push(code) as PyProxy;

    const status = future.syntax_check as SyntaxCheck;
    switch (status) {
      case 'syntax-error':
        post.error(future.formatted_error.trimEnd());
        post.prompt();
        return;

      case 'incomplete':
        post.promptPending();
        return;

      case 'complete':
        break;

      default:
        throw new Error(`Unexpected type: ${status}`);
    }

    prepareExports(exports);
    const wrapped = await_fut(future) as PyProxyAwaitable;

    try {
      const [value] = await wrapped;
      if (value !== undefined) {
        const repr = repr_shorten.callKwargs(value, {
          separator: '\n<long output truncated>\n',
        }) as string;

        post.writeln(repr);
      }

      if (pyodide.isPyProxy(value)) value.destroy();
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      const message = future.formatted_error || error.message;
      post.error(message.trimEnd());
    } finally {
      post.prompt();
      future.destroy();
      wrapped.destroy();
    }
  },
};

onmessage = async (event: MessageEvent<Message<typeof listeners>>) => {
  listeners[event.data.type]?.(event.data.payload);
};
