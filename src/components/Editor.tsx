import { useEffect, useRef } from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';
import MonacoEditor from '@monaco-editor/react';
import { editor } from 'monaco-editor';

import useFile from '../hooks/useFile';
import useFilesMutations from '../hooks/useFilesMutations';

import Button from './Button';

interface EditorProps {
  onRunCode?: (code: string) => void;
}

interface CoreEditorProps extends EditorProps {
  onSave: (content: string) => void;
  onChange: (value: string) => void;
  value: string;
  dependsOn?: string;
}

const CoreEditor = (props: CoreEditorProps): JSX.Element => {
  const { dependsOn: dependency } = props;

  const ref = useRef<editor.IStandaloneCodeEditor>();

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 's') {
        e.preventDefault();

        const content = ref.current?.getValue();
        if (content !== undefined) props.onSave(content);
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => window.removeEventListener('keydown', handleShortcut);
  }, [dependency]);

  const runCode = () => {
    props.onRunCode?.(ref.current?.getValue() ?? '');
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
          fontFamily: 'JetBrains Mono',
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          minimap: { enabled: false },
        }}
        theme="vs-dark"
        value={props.value}
      />

      <div className="absolute bottom-3 right-3 space-x-2">
        <Button icon={PlayIcon} onClick={runCode}>
          Run
        </Button>
      </div>
    </section>
  );
};

const Editor = (props: EditorProps): JSX.Element | null => {
  const { update, save } = useFilesMutations();
  const { name, content } = useFile.Selected();

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
