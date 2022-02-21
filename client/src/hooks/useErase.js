import * as Y from 'yjs';
import * as React from 'react';
import { toPairs } from '../utils/utils';

export function useErase(line) {
  const [isComplete, setIsComplete] = React.useState();
  const [color, setColor] = React.useState();
  const [erPts, setErPts] = React.useState([]);

  // Subscribe to changes to the line itself and sync
  // them into React state.
  React.useEffect(() => {
    function handleChange() {
      const current = line.toJSON();
      setIsComplete(current.isComplete);
      setColor(current.userColor);
    }

    handleChange();

    line.observe(handleChange);

    return () => {
      line.unobserve(handleChange);
    };
  }, [line]);

  // Subscribe to changes in the line's points array and sync
  // them into React state.
  React.useEffect(() => {
    const points = line.get('points');

    function handleChange() {
      // For performance reasons (I think), we store the
      // numbers as [x, y, x, y]; but now we need to turn
      // them into [[x, y], [x, y]].
      setErPts(toPairs(points.toArray()));
    }

    handleChange();

    points.observe(handleChange);

    return () => {
      points.unobserve(handleChange);
    };
  }, [line]);

  return { erPoints: erPts, color, isComplete };
}
