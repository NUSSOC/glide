import { ComponentProps, ElementType, JSX } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  icon?: ElementType;
}

const Button = (props: ButtonProps): JSX.Element => {
  const { icon: Icon, ...buttonProps } = props;

  return (
    <button
      {...buttonProps}
      className={`inline-flex justify-center rounded-lg border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 transition-transform hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-sky-500 active:scale-95 ${
        props.className ?? ''
      }`}
    >
      {Icon && <Icon className="-ml-1 mr-2 h-5 w-5" />}
      {props.children}
    </button>
  );
};

export default Button;
