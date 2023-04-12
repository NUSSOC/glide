import { ChangeEventHandler, ComponentProps } from 'react';

import Button from './Button';

interface FileUploaderProps extends ComponentProps<typeof Button> {
  onUpload?: (name: string, content: string | null) => void;
}

const FileUploader = (props: FileUploaderProps): JSX.Element => {
  const { onUpload: onUploadFile, ...buttonProps } = props;

  const handleUpload: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    const files = e.target.files;
    if (!files?.length) return;

    const file = Array.from(files)[0];

    const reader = new FileReader();
    reader.onload = ({ target }) =>
      props.onUpload?.(file.name, target?.result as string);

    reader.readAsText(file);

    e.target.value = '';
  };

  return (
    <Button
      {...buttonProps}
      className={`relative cursor-pointer ${props.className ?? ''}`}
    >
      {props.children}
      <input
        accept="text/csv, text/x-python-script, text/x-python, .py, .csv, text/plain"
        className="absolute bottom-0 left-0 right-0 top-0 cursor-pointer opacity-0"
        onChange={handleUpload}
        type="file"
      />
    </Button>
  );
};

export default FileUploader;
