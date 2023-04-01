import { useState } from 'react';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';

import FileName from './FileName';
import Item from './Item';
import Library from './Library';

const Navigator = (): JSX.Element => {
  const [openLibrary, setOpenLibrary] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between space-x-2">
        <FileName />

        <div className="flex flex-row items-center space-x-2">
          <Item className="text-slate-400">Save</Item>

          <Item
            className="text-slate-400"
            icon={BuildingLibraryIcon}
            onClick={() => setOpenLibrary(true)}
          >
            Library
          </Item>
        </div>
      </nav>

      <Library onClose={() => setOpenLibrary(false)} open={openLibrary} />
    </>
  );
};

export default Navigator;
