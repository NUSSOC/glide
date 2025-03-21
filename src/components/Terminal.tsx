import {
  ComponentRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { DocumentDuplicateIcon, StopIcon } from '@heroicons/react/24/outline';
import { CanvasAddon } from '@xterm/addon-canvas';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { Terminal as Xterm } from '@xterm/xterm';
import { slate, yellow } from 'tailwindcss/colors';

import Button from './Button';
import Prompt from './Prompt';
import TerminalMenu from './TerminalMenu';
import '@xterm/xterm/css/xterm.css';

interface Position {
  x: number;
  y: number;
}

interface TerminalRef {
  append: (result?: string) => void;
  write: (result?: string) => void;
  error: (result?: string) => void;
  system: (result?: string) => void;
}

interface TerminalProps {
  onStop?: () => void;
  onReturn?: (line: string) => void;
  onRestart?: () => void;
  showStopButton?: boolean;
}

const isASCIIPrintable = (character: string): boolean =>
  character >= String.fromCharCode(32) && character <= String.fromCharCode(126);

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/**
 * @see https://github.com/xtermjs/xterm.js/pull/4255
 */
const getSafariVersion = (): number => {
  if (!isSafari) return 0;

  const majorVersion = navigator.userAgent.match(/Version\/(\d+)/);
  if (majorVersion === null || majorVersion.length < 2) return 0;

  return parseInt(majorVersion[1]);
};

const isWebGL2Compatible = (): boolean => {
  const context = document.createElement('canvas').getContext('webgl2');
  const isWebGL2Available = Boolean(context);

  return isWebGL2Available && (isSafari ? getSafariVersion() >= 16 : true);
};

const Terminal = forwardRef<TerminalRef, TerminalProps>(
  (props, ref): JSX.Element => {
    const xtermRef = useRef<Xterm>();
    const fitAddonRef = useRef<FitAddon>();
    const terminalRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const promptRef = useRef<ComponentRef<typeof Prompt>>(null);

    const [selection, setSelection] = useState<string>();
    const [selectionPosition, setSelectionPosition] = useState<Position>();

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
        fontFamily: 'monospace',
        fontSize: 14,
        theme: { background: slate[900], cursor: yellow[400] },
        disableStdin: true,
      });

      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon);

      if (isWebGL2Compatible()) {
        xterm.loadAddon(new WebglAddon());
      } else {
        xterm.loadAddon(new CanvasAddon());
      }

      xterm.onSelectionChange(() => setSelection(xterm.getSelection()));

      xterm.onKey(({ key }) => {
        if (!(isASCIIPrintable(key) || key >= '\u00a0')) return;

        promptRef.current?.focusWith(key);
      });

      xterm.open(terminal);
      fitAddon.fit();

      xtermRef.current = xterm;
      fitAddonRef.current = fitAddon;

      return () => xterm.dispose();
    }, []);

    const write = (text: string, line = true) => {
      const trimmed = text.replace(/\n/g, '\r\n');
      const xterm = xtermRef.current;
      if (!xterm) return;

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
      system: (result?: string) =>
        write('\u001b[33m' + (result ?? '') + '\u001b[0m'),
    }));

    const copySelectionToClipboard = () => {
      if (!selection) return;

      navigator.clipboard.writeText(selection);
    };

    return (
      <section ref={containerRef} className="relative h-full w-full">
        <div
          ref={terminalRef}
          className="windowed h-full"
          onMouseUp={(e) => {
            const rectangle = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rectangle.left;
            const y = e.clientY - rectangle.top;

            setSelectionPosition({ x, y });
          }}
        />

        <div className="absolute bottom-0 left-0 z-40 flex w-full space-x-2 px-2 pb-2">
          <Prompt
            ref={promptRef}
            onReturn={(input) => {
              props.onReturn?.(input);
              xtermRef.current?.scrollToBottom();
            }}
          />

          <TerminalMenu
            onClickClearConsole={() => xtermRef.current?.clear()}
            onClickForceStop={() => {
              props.onStop?.();
              xtermRef.current?.scrollToBottom();
            }}
            onClickRestart={props.onRestart}
          />
        </div>

        {selection && selectionPosition && (
          <div
            className="absolute z-20 opacity-20 hover:opacity-50"
            style={{
              left: selectionPosition.x + 5,
              top: selectionPosition.y - 10,
            }}
          >
            <Button
              icon={DocumentDuplicateIcon}
              onClick={copySelectionToClipboard}
            >
              Copy
            </Button>
          </div>
        )}

        {props.showStopButton && (
          <div className="absolute right-3 top-3 z-20 space-x-2 opacity-50 hover:opacity-100">
            <Button icon={StopIcon} onClick={props.onStop}>
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
