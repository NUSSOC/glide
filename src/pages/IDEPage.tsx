import { ComponentRef, useRef, useState } from 'react';
import Split from 'react-split';

import Editor from '../components/Editor';
import Navigator from '../components/Navigator';
import Terminal from '../components/Terminal';
import useFile from '../hooks/useFile';
import useInterpreter from '../hooks/useInterpreter';

const IDEPage = (): JSX.Element => {
  const consoleRef = useRef<ComponentRef<typeof Terminal>>(null);

  const exports = useFile.Exports();

  const [running, setRunning] = useState(false);

  const interpreter = useInterpreter({
    write: (text: string) => consoleRef.current?.write(text),
    writeln: (text: string) => consoleRef.current?.append(text),
    error: (text: string) => consoleRef.current?.error(text),
    system: (text: string) => consoleRef.current?.system(text),
    exports: () => exports,
    lock: () => setRunning(true),
    unlock: () => setRunning(false),
  });

  return (
    <main className="h-screen w-screen  bg-slate-900 p-3 text-white">
      <Split
        className="flex h-full w-full flex-col"
        direction="vertical"
        gutterSize={15}
        sizes={[70, 30]}
      >
        <div className="flex h-full flex-col space-y-3">
          <Navigator />
          <Editor onRunCode={interpreter.run} showRunButton={!running} />
        </div>

        <Terminal
          ref={consoleRef}
          onCtrlC={interpreter.stop}
          onReturn={interpreter.execute}
          showStopButton={running}
        />
      </Split>
    </main>
  );
};

export default IDEPage;
