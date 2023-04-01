declare module '*.svg' {
  import { SVGProps, VFC } from 'react';

  const SVG: VFC<SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.svg?url' {
  const svg: string;
  export default svg;
}

declare module '*.py' {
  const script: string;
  export default script;
}
