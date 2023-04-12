import {
  ElementType,
  Fragment,
  MouseEventHandler,
  ReactNode,
  SVGProps,
} from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  ArrowPathIcon,
  Bars3Icon,
  StopIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface TerminalMenuProps {
  onClickRestart?: MouseEventHandler<HTMLButtonElement>;
  onClickForceStop?: MouseEventHandler<HTMLButtonElement>;
  onClickClearConsole?: MouseEventHandler<HTMLButtonElement>;
}

interface MenuItemProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  icon?: ElementType<SVGProps<SVGSVGElement>>;
  iconClassName?: string;
}

const MenuItem = (props: MenuItemProps): JSX.Element => (
  <Menu.Item>
    {({ active }) => (
      <button
        className={`${
          active ? 'bg-blue-200 text-blue-900' : 'text-white'
        } group flex w-full items-center whitespace-nowrap rounded-md p-2 text-sm ${
          props.className ?? ''
        }`}
        onClick={props.onClick}
      >
        {props.icon && (
          <props.icon
            aria-hidden="true"
            className={`mr-2 h-5 w-5 ${props.iconClassName ?? ''}`}
          />
        )}

        {props.children}
      </button>
    )}
  </Menu.Item>
);

const MenuHeader = (props: { children: ReactNode }): JSX.Element => (
  <Menu.Item as="p" className="px-2 py-1 text-xs text-slate-400">
    {props.children}
  </Menu.Item>
);

const TerminalMenu = (props: TerminalMenuProps): JSX.Element => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="rounded-md bg-slate-500 bg-opacity-20 p-2 transition-transform hover:bg-opacity-30 active:scale-95">
        <Bars3Icon aria-hidden="true" className="h-5 w-5" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute bottom-11 right-0 z-40 origin-bottom-right divide-y-2 divide-slate-700 rounded-md bg-slate-800 shadow-2xl ring-2 ring-slate-700">
          <div className="px-1 py-1">
            <MenuHeader>Interpreter</MenuHeader>

            <MenuItem icon={ArrowPathIcon} onClick={props.onClickRestart}>
              Restart
            </MenuItem>

            <MenuItem icon={StopIcon} onClick={props.onClickForceStop}>
              Force stop
            </MenuItem>
          </div>

          <div className="px-1 py-1">
            <MenuHeader>Console</MenuHeader>

            <MenuItem icon={TrashIcon} onClick={props.onClickClearConsole}>
              Clear output
            </MenuItem>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default TerminalMenu;
