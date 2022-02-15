import * as React from "react";
import * as Y from "yjs";
import { getStroke } from "perfect-freehand";
import { useLine } from "../../hooks/useLine";
import { getSvgPathFromStroke } from "../../utils/utils";


export const Line = React.memo(function Line({ line }) {
  const { points, color, isComplete } = useLine(line);

  const pathData = getSvgPathFromStroke(
    getStroke(points, {
      size: 12,
      thinning: 0.5,
      streamline: 0.6,
      smoothing: 0.7,
      last: isComplete
    })
  );

  return (
    <g fill={color}>
      <path
        className="canvas-line"
        d={pathData}
        fill={isComplete ? "black" : color}
      />
    </g>
  );
});