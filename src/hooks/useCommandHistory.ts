import { useRef, useState } from 'react';
import produce from 'immer';

interface CommandHistory {
  push: (command: string) => void;
  previous: () => string | undefined;
  next: () => string | undefined;
}

const MAX_HISTORY_LENGTH = 100 as const;

const useCommandHistory = (): CommandHistory => {
  const [history, setHistory] = useState<string[]>([]);
  const position = useRef(0);

  return {
    push: (command: string) => {
      position.current = 0;

      setHistory(
        produce((draft) => {
          if (draft.length >= MAX_HISTORY_LENGTH) draft.splice(0, 1);
          draft.push(command);
        }),
      );
    },
    previous: () => {
      if (!history.length) return undefined;

      position.current = Math.max(position.current - 1, -history.length);
      return history.at(position.current);
    },
    next: () => {
      if (!history.length) return undefined;

      position.current = Math.min(position.current + 1, 0);
      return position.current ? history.at(position.current) : undefined;
    },
  };
};

export default useCommandHistory;
