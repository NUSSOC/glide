import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { StopIcon } from '@heroicons/react/24/outline';
import { slate, yellow } from 'tailwindcss/colors';
import { Terminal as Xterm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebglAddon } from 'xterm-addon-webgl';

import Button from './Button';
import Prompt from './Prompt';
import 'xterm/css/xterm.css';

interface TerminalRef {
  append: (result?: string) => void;
  write: (result?: string) => void;
  error: (result?: string) => void;
}

interface TerminalProps {
  onCtrlC?: () => void;
  onReturn?: (line: string) => void;
  showStopButton?: boolean;
}

const Terminal = forwardRef<TerminalRef, TerminalProps>(
  (props, ref): JSX.Element => {
    const xtermRef = useRef<Xterm>();
    const fitAddonRef = useRef<FitAddon>();
    const terminalRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const resizeObserver = new ResizeObserver(() =>
        fitAddonRef.current?.fit(),
      );

      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
      const terminal = terminalRef.current;
      if (!terminal) return;

      const xterm = new Xterm({
        cursorBlink: false,
        cursorStyle: 'underline',
        fontFamily: 'JetBrains Mono',
        fontSize: 14,
        theme: { background: slate[900], cursor: yellow[400] },
        disableStdin: true,
      });

      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon);
      xterm.loadAddon(new WebglAddon());

      xterm.open(terminal);
      fitAddon.fit();

      xtermRef.current = xterm;
      fitAddonRef.current = fitAddon;

      return () => xterm.dispose();
    }, []);

    const write = (text: string, line = true) => {
      const trimmed = text.replace(/\n/g, '\r\n');
      const xterm = xtermRef.current;
      if (!trimmed || !xterm) return;

      const writer = (text: string) =>
        line ? xterm.writeln(text) : xterm.write(text);

      try {
        writer(trimmed);
      } catch (error) {
        if (!(error instanceof Error)) throw error;

        console.log('oops', error.message);
        xterm.clear();
        writer(trimmed);
      }
    };

    useImperativeHandle(ref, () => ({
      append: (result?: string) => write(result ?? ''),
      write: (result?: string) => write(result ?? '', false),
      error: (result?: string) =>
        write('\u001b[31m' + (result ?? '') + '\u001b[0m'),
    }));

    return (
      <section ref={containerRef} className="windowed h-full w-full">
        <div ref={terminalRef} className="h-full" />

        <div className="absolute bottom-0 left-0 z-10 w-full px-2 pb-2">
          <Prompt
            onCtrlC={() => {
              props.onCtrlC?.();
              xtermRef.current?.scrollToBottom();
            }}
            onF2={() => {
              xtermRef.current?.clear();
            }}
            onReturn={(input) => {
              props.onReturn?.(input);
              xtermRef.current?.scrollToBottom();
            }}
          />
        </div>

        {props.showStopButton && (
          <div className="absolute right-3 top-3 z-20 space-x-2 opacity-50 hover:opacity-100">
            <Button icon={StopIcon} onClick={props.onCtrlC}>
              Stop
            </Button>
          </div>
        )}
      </section>
    );
  },
);

Terminal.displayName = 'Terminal';

export default Terminal;
