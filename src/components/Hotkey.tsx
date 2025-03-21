import { JSX } from 'react';

interface HotkeyProps {
  of: string;
  className?: string;
}

const isMac = navigator.platform.startsWith('Mac');

const CONVERTED_KEYS = isMac
  ? {
      Mod: '⌘',
      Alt: '⌥',
      Shift: '⇧',
      Ctrl: '⌃',
    }
  : {
      Mod: 'Ctrl',
      Alt: 'Alt',
      Shift: 'Shift',
      Ctrl: 'Ctrl',
    };

type ConvertibleKeys = keyof typeof CONVERTED_KEYS;

const SEPARATOR = '+' as const;

const convert = (key: string): string =>
  key in CONVERTED_KEYS ? CONVERTED_KEYS[key as ConvertibleKeys] : key;

const Hotkey = (props: HotkeyProps): JSX.Element => {
  const { of: hotkey } = props;

  const keys = hotkey.split(SEPARATOR);

  if (isMac)
    return <kbd className={props.className}>{keys.map(convert).join('')}</kbd>;

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
