import { ComponentProps, ElementType, JSX } from 'react';

interface ItemProps extends ComponentProps<'div'> {
  icon?: ElementType;
  iconClassName?: string;
  labelClassName?: string;
  selected?: boolean;
}

const Item = (props: ItemProps): JSX.Element => {
  const {
    icon: Icon,
    iconClassName,
    labelClassName,
    selected,
    ...divProps
  } = props;

  return (
    <div
      {...divProps}
      className={`group flex select-none items-center space-x-2 rounded-xl p-2 transition-transform active:scale-95 ${
        selected ? 'bg-slate-700' : 'hover:bg-slate-800'
      } ${props.className ?? ''}`}
      role="button"
    >
      {Icon && (
        <Icon
          className={`w-5 flex-shrink-0 opacity-80 ${
            !selected ? 'group-hover:opacity-90' : ''
          } ${iconClassName ?? ''}`}
        />
      )}

      <p
        className={`whitespace-nowrap text-sm opacity-80 ${
          !selected ? 'group-hover:opacity-90' : ''
        } ${labelClassName ?? ''}`}
      >
        {props.children}
      </p>
    </div>
  );
};

export default Item;
