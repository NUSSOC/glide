import { useEffect, useState } from 'react';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';

import useFile from '../hooks/useFile';

import FileName from './FileName';
import K from './Hotkey';
import Item from './Item';
import Library from './Library';

const isMac = navigator.platform.startsWith('Mac');

const Navigator = (): JSX.Element => {
  const [openLibrary, setOpenLibrary] = useState(false);
  const name = useFile.SelectedName();

  const handleShortcut = (e: KeyboardEvent) => {
    const isMod = isMac ? e.metaKey : e.ctrlKey;

    if (isMod && e.key === 'o') {
      e.preventDefault();
      setOpenLibrary(true);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleShortcut]);

  return (
    <>
      <nav className="flex items-center justify-between space-x-2">
        <FileName />

        <div className="flex flex-row items-center space-x-2">
          {name && (
            <Item
              className="text-slate-400"
              onClick={() => {
                window.dispatchEvent(
                  new KeyboardEvent('keydown', {
                    key: 's',
                    metaKey: isMac,
                    ctrlKey: !isMac,
                  }),
                );
              }}
            >
              Save <K of="Mod+S" />
            </Item>
          )}

          <Item
            className="text-slate-400"
            icon={BuildingLibraryIcon}
            onClick={() => setOpenLibrary(true)}
          >
            Library <K of="Mod+O" />
          </Item>
        </div>
      </nav>

      <Library onClose={() => setOpenLibrary(false)} open={openLibrary} />
    </>
  );
};

export default Navigator;
