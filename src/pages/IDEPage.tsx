import { ComponentRef, JSX, useRef, useState } from 'react';

import Between from '../components/Between';
import Editor from '../components/Editor';
import Navigator from '../components/Navigator';
import Terminal from '../components/Terminal';
import useFile from '../hooks/useFile';
import useInterpreter from '../hooks/useInterpreter';

const IDEPage = (): JSX.Element => {
  const consoleRef = useRef<ComponentRef<typeof Terminal>>(null);

  const [running, setRunning] = useState(false);

  const interpreter = useInterpreter({
    write: (text: string) => consoleRef.current?.write(text),
    writeln: (text: string) => consoleRef.current?.append(text),
    error: (text: string) => consoleRef.current?.error(text),
    system: (text: string) => consoleRef.current?.system(text),
    exports: useFile.Exports,
    lock: () => setRunning(true),
    unlock: () => setRunning(false),
  });

  return (
    <main className="h-screen w-screen bg-slate-900 p-3 text-white">
      <Between
        by={[70, 30]}
        first={
          <div className="flex h-full flex-col space-y-3">
            <Navigator />
            <Editor onRunCode={interpreter.run} showRunButton={!running} />
          </div>
        }
        second={
          <Terminal
            ref={consoleRef}
            onRestart={interpreter.restart}
            onReturn={interpreter.execute}
            onStop={interpreter.stop}
            showStopButton={running}
          />
        }
      />
    </main>
  );
};

export default IDEPage;
