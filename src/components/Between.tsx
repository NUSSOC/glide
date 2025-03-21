import { JSX, ReactNode, useLayoutEffect, useRef, useState } from 'react';
import Split from 'react-split';

import ResizeObserver from '../lib/ResizeObserver';

interface BetweenProps {
  first: ReactNode;
  second: ReactNode;
  by: [number, number];
}

type Direction = 'vertical' | 'horizontal';

/**
 * @see https://github.com/nathancahill/split/blob/f9d7b974d24287864792347edd2c76581f117a22/packages/react-split/src/index.js#L16
 */
const GUTTER_CLASSNAMES = {
  vertical: 'gutter-vertical',
  horizontal: 'gutter-horizontal',
  default: 'gutter',
} as const;

const resetGutterTo = (direction: Direction) => {
  const gutters = document.getElementsByClassName(GUTTER_CLASSNAMES.default);
  if (!gutters.length) return;

  const gutter = gutters[0] as HTMLDivElement;

  if (direction === 'horizontal') {
    gutter.style.removeProperty('height');
    gutter.classList.remove(GUTTER_CLASSNAMES.vertical);
  } else {
    gutter.style.removeProperty('width');
    gutter.classList.remove(GUTTER_CLASSNAMES.horizontal);
  }

  gutter.classList.add(GUTTER_CLASSNAMES[direction]);
};

const Between = (props: BetweenProps): JSX.Element => {
  const { by: sizes } = props;

  const oneRef = useRef<HTMLDivElement>(null);
  const twoRef = useRef<HTMLDivElement>(null);

  const [direction, setDirection] = useState<Direction>('vertical');

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;

      const { width } = entries[0].contentRect;
      setDirection(width >= 1024 ? 'horizontal' : 'vertical');
    });

    resizeObserver.observe(document.body);

    return () => resizeObserver.disconnect();
  }, []);

  /**
   * This patch is needed to properly support reactive direction changes.
   * As of time of writing, the gutter and children `div`s are not properly
   * (re)set when `direction` changes. Seems like a bug on react-split.
   */
  useLayoutEffect(() => {
    resetGutterTo(direction);

    if (direction === 'horizontal') {
      oneRef.current?.style.removeProperty('height');
      twoRef.current?.style.removeProperty('height');
    } else {
      oneRef.current?.style.removeProperty('width');
      twoRef.current?.style.removeProperty('width');
    }
  }, [direction]);

  return (
    <Split
      className={`h-full ${direction === 'horizontal' ? 'flex' : ''}`}
      direction={direction}
      gutterSize={15}
      sizes={sizes}
    >
      <div ref={oneRef}>{props.first}</div>
      <div ref={twoRef}>{props.second}</div>
    </Split>
  );
};

export default Between;
