import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

import {
  filesActions,
  getFileNames,
  getSelectedFileName,
} from '../store/filesSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

import Item from './Item';

interface ExplorerProps {
  onSelectFile?: (contents: string) => void;
}

const Explorer = (props: ExplorerProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const fileNames = useAppSelector(getFileNames);

  const selectedFileName = useAppSelector(getSelectedFileName);

  return (
    <aside className="relative">
      <section className="h-full space-y-1 overflow-scroll px-2 pb-44 pt-5">
        {fileNames?.map((fileName) => (
          <Item
            key={fileName}
            icon={DocumentTextIcon}
            iconClassName="text-sky-200"
            onClick={() => dispatch(filesActions.select(fileName))}
            selected={selectedFileName === fileName}
          >
            {fileName}
          </Item>
        ))}
      </section>

      <section className="pointer-events-none absolute bottom-0 left-0 w-full px-2 pb-5 pt-36 bg-fade-to-t-slate-900">
        <div className="pointer-events-auto space-y-1">
          <Item className="text-slate-400" icon={PlusIcon}>
            New File
          </Item>

          <Item className="text-slate-400" icon={ArrowUpTrayIcon}>
            Upload
          </Item>
        </div>
      </section>
    </aside>
  );
};

export default Explorer;
