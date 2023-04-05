import { useEffect, useLayoutEffect, useRef } from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';
import MonacoEditor from '@monaco-editor/react';
import { editor } from 'monaco-editor';

import useFile from '../hooks/useFile';
import useFilesMutations from '../hooks/useFilesMutations';

import Button from './Button';

interface EditorProps {
  onRunCode?: (code: string) => void;
  showRunButton?: boolean;
}

interface CoreEditorProps extends EditorProps {
  onSave: (content: string) => void;
  onChange: (value: string) => void;
  value: string;
  dependsOn?: string;
}

const CoreEditor = (props: CoreEditorProps): JSX.Element => {
  const ref = useRef<editor.IStandaloneCodeEditor>();

  const handleShortcut = (e: KeyboardEvent) => {
    const isMod = navigator.platform.startsWith('Mac') ? e.metaKey : e.ctrlKey;

    if (isMod && e.key === 's') {
      e.preventDefault();

      const content = ref.current?.getValue();
      if (content !== undefined) props.onSave(content);
    }

    if (e.key === 'F5') {
      e.preventDefault();
      saveThenRunCode();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleShortcut]);

  const saveThenRunCode = () => {
    const content = ref.current?.getValue() ?? '';
    props.onSave(content);
    props.onRunCode?.(content);
  };

  return (
    <section className="windowed h-full w-full">
      <MonacoEditor
        defaultLanguage="python"
        onChange={(value) =>
          value !== undefined ? props.onChange(value) : null
        }
        onMount={(editor) => (ref.current = editor)}
        options={{
          fontSize: 14,
          fontFamily: 'monospace',
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          minimap: { enabled: false },
        }}
        theme="vs-dark"
        value={props.value}
      />

      {props.showRunButton && (
        <div className="absolute bottom-3 right-3 space-x-2">
          <Button icon={PlayIcon} onClick={saveThenRunCode}>
            Run
          </Button>
        </div>
      )}
    </section>
  );
};

const Editor = (props: EditorProps): JSX.Element | null => {
  const { update, save } = useFilesMutations();
  const { name, content } = useFile.Selected();

  useLayoutEffect(() => {
    document.title = `${name ? `${name} | ` : ''}Glide`;
  }, [name]);

  if (name === undefined || content === undefined) return null;

  return (
    <CoreEditor
      {...props}
      dependsOn={name}
      onChange={update}
      onSave={(newContent) => save(name, newContent)}
      value={content}
    />
  );
};

export default Editor;
