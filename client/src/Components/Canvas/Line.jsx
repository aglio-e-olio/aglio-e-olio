import * as React from "react";
import * as Y from "yjs";
import { getStroke } from "perfect-freehand";
import { useLine } from "../../hooks/useLine";
import { getSvgPathFromStroke } from "../../utils/utils";


export const Line = React.memo(function Line({ line }) {
  const { points, color, isComplete } = useLine(line);

  let new_points = []

  points.map((point) => {
    const x = point[0] * window.innerWidth
    const y = point[1]
    new_points.push([x, y])
  })

  

  const pathData = getSvgPathFromStroke(
    getStroke(new_points, {
      size: 5,
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
      />
    </g>
  );
});