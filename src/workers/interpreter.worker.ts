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

let pyodide: PyodideInterface;
let waiting = false;

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

  const banner = setUpREPLEnvironment();
  post.writeln(banner);

  return newPyodide;
};

const listeners = {
  setInterruptBuffer: async (interruptBuffer: Uint8Array) => {
    pyodide ??= await preparePyodide();
    pyodide.setInterruptBuffer(interruptBuffer);
  },

  run: async (code: string) => {
    pyodide ??= await preparePyodide();
    waiting = false;

    post.writeln(`${waiting ? '\n' : ''}\n${PS1}${RUN_CODE}`);

    try {
      await pyodide.loadPackagesFromImports(code);

      /**
       * `await pyodide.runPythonAsync(code)` is not used because it raises
       * an uncatchable `PythonError` when Pyodide emits a `KeyboardInterrupt`.
       * @see https://github.com/pyodide/pyodide/issues/2141
       */
      const result = pyodide.runPython(code);

      post.writeln(result?.toString());
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      post.error(error.message);
    }
  },

  replClear: async () => {
    try {
      clear_console();
      await await_fut(pyconsole.push(''));
    } finally {
      post.error(`${waiting ? '\n' : ''}KeyboardInterrupt`);
      waiting = false;
    }
  },

  replInput: async (input: string) => {
    for (const line of input.split('\n')) {
      post.writeln(`${waiting ? '' : PS1}${line}`);

      const future = pyconsole.push(line) as PyProxy;

      const status = future.syntax_check as SyntaxCheck;
      switch (status) {
        case 'syntax-error':
          waiting = false;
          post.error(future.formatted_error.trimEnd());
          continue;

        case 'incomplete':
          waiting = true;
          post.write(PS2);
          continue;

        case 'complete':
          waiting = false;
          break;

        default:
          throw new Error(`Unexpected type: ${status}`);
      }

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
        future.destroy();
        wrapped.destroy();
      }
    }
  },
};

onmessage = async (event: MessageEvent<Message<typeof listeners>>) => {
  listeners[event.data.type]?.(event.data.payload);
};