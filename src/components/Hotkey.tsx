import { Fragment, JSX, ReactNode } from 'react';

interface HotkeyProps {
  of: string;
  className?: string;
}

const isMac = navigator.platform.startsWith('Mac');

const ReturnIcon = (
  <svg
    aria-hidden="true"
    className="inline align-middle"
    fill="none"
    height="0.9em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.75"
    viewBox="0 0 16 16"
    width="0.9em"
  >
    <path d="M12 5v3a2 2 0 0 1-2 2H4" />
    <path d="m7 7-3 3 3 3" />
  </svg>
);

const CONVERTED_KEYS: Record<string, ReactNode> = isMac
  ? {
      Mod: '⌘',
      Alt: '⌥',
      Shift: '⇧',
      Ctrl: '⌃',
      Enter: ReturnIcon,
    }
  : {
      Mod: 'Ctrl',
      Alt: 'Alt',
      Shift: 'Shift',
      Ctrl: 'Ctrl',
      Enter: 'Enter',
    };

const SEPARATOR = '+' as const;

const convert = (key: string): ReactNode =>
  key in CONVERTED_KEYS ? CONVERTED_KEYS[key] : key;

const Hotkey = (props: HotkeyProps): JSX.Element => {
  const { of: hotkey } = props;

  const keys = hotkey.split(SEPARATOR);

  if (isMac)
    return (
      <kbd className={props.className}>
        {keys.map((key) => (
          <Fragment key={key}>{convert(key)}</Fragment>
        ))}
      </kbd>
    );

  return (
    <>
      {keys
        .flatMap((key) => [
          <kbd key={key} className={props.className}>
            {convert(key)}
          </kbd>,
          SEPARATOR,
        ])
        .slice(0, -1)}
    </>
  );
};

const K = Hotkey;

export default K;
