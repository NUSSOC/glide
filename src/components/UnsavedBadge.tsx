interface UnsavedBadgeProps {
  className?: string;
}

const UnsavedBadge = (props: UnsavedBadgeProps): JSX.Element => {
  return (
    <div
      className={`flex items-center space-x-2 rounded-full px-2 py-1 ring-1 ring-amber-400 ${
        props.className ?? ''
      }`}
    >
      <div className="h-2 w-2 rounded-full bg-amber-400" />
      <p className="select-none text-xs text-amber-400">Unsaved</p>
    </div>
  );
};

export default UnsavedBadge;
