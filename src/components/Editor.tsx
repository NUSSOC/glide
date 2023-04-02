import { useEffect, useRef } from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';
import MonacoEditor from '@monaco-editor/react';
import { editor } from 'monaco-editor';

import useFilesMutations from '../hooks/useFilesMutations';
import { getSelectedFile } from '../store/filesSlice';
import { useAppSelector } from '../store/hooks';

import Button from './Button';

interface EditorProps {
  onRunCode?: (code: string) => void;
}

const Editor = (props: EditorProps): JSX.Element | null => {
  const ref = useRef<editor.IStandaloneCodeEditor>();

  const { update, save } = useFilesMutations();

  const { name, content } = useAppSelector(getSelectedFile);

  const runCode = () => {
    props.onRunCode?.(ref.current?.getValue() ?? '');
  };

  const saveFile = () => {
    console.log(name);
    if (!name) return;

    const currentContent = ref.current?.getValue() ?? '';
    save(name, currentContent);
  };

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 's') {
        console.log('kepencet');
        e.preventDefault();
        saveFile();
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => window.removeEventListener('keydown', handleShortcut);
  }, [name]);

  return (
    <section className="windowed h-full w-full">
      <MonacoEditor
        defaultLanguage="python"
        onChange={(value) => (value !== undefined ? update(value) : null)}
        onMount={(editor) => (ref.current = editor)}
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono',
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          minimap: { enabled: false },
        }}
        theme="vs-dark"
        value={content}
      />

      <div className="absolute bottom-3 right-3 space-x-2">
        <Button icon={PlayIcon} onClick={runCode}>
          Run
        </Button>
      </div>
    </section>
  );
};

export default Editor;
