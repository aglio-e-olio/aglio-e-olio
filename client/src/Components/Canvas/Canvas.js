import * as React from "react";
import { Line } from "./Line";
import { UserToken } from "./UserToken";
import { UserCursor } from "./UserCursor";
import { useLines } from "../../hooks/useLines";
import { useUser } from "../../hooks/useUser";
import { useUsers } from "../../hooks/useUsers";
import { useKeyboardEvents } from "../../hooks/useKeyboardEvents";
import "./Canvas.css";
import { useState } from "react";


const date = new Date();

date.setUTCHours(0, 0, 0, 0);

const START_TIME = date.getTime();

function getYOffset() {
  //   return (Date.now() - START_TIME) / 80;
  return -50;
}

function getPoint(x, y) {
  return [x, y + getYOffset()];
}

export default function Canvas() {
  const {
    user: self,
    updateUserPoint,
    activateUser,
    deactivateUser,
  } = useUser();

  const { users } = useUsers();

  const {
    lines,
    isSynced,
    startLine,
    addPointToLine,
    completeLine,
    clearAllLines,
    undoLine,
    redoLine,
  } = useLines();

  useKeyboardEvents();

  // On pointer down, start a new current line
  const handlePointerDown = React.useCallback(
    (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);

      startLine(getPoint(e.clientX, e.clientY));
    },
    [startLine]
  );

  // On pointer move, update awareness and (if down) update the current line
  const handlePointerMove = React.useCallback(
    (e) => {
      const point = getPoint(e.clientX, e.clientY);

      updateUserPoint(point);

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        addPointToLine(point);
      }
    },
    [addPointToLine, updateUserPoint]
  );

  // On pointer up, complete the current line
  const handlePointerUp = React.useCallback(
    (e) => {
      e.currentTarget.releasePointerCapture(e.pointerId);

      completeLine();
    },
    [completeLine]
  );

  const [_, forceUpdate] = React.useReducer((s) => !s, false);

  React.useEffect(() => {
    const timeout = setInterval(forceUpdate, 30);
    return () => clearInterval(timeout);
  }, []);

  const [zIndex, setZindex] = useState(0);
  const changeZofCanvas = () => {
    // console.log(changeZ.current.style);
    setZindex((index) => (index === 10 ? 0 : 10));
  };

  return (
    <div>
      <div>
        <button onClick={changeZofCanvas}>switch function</button>
      </div>
      <div className="canvas-container" style={{zIndex: zIndex}}>
        <svg
          className="canvas-layer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerEnter={activateUser}
          onPointerLeave={deactivateUser}
          opacity={isSynced ? 1 : 0.2}
        >
          <g transform={`translate(0, -${getYOffset()})`}>
            {/* Lines */}
            {lines.map((line, i) => (
              <Line key={line.get("id")} line={line} />
            ))}
            {/* Live Cursors */}
            {users
              .filter((user) => user.id !== self.id)
              .map((other) => (
                <UserCursor key={other.id} user={other} />
              ))}
          </g>
          {/* User Tokens */}
          {users.map((user, i) => (
            <UserToken
              key={user.id}
              user={user}
              index={i}
              isSelf={user.id === self.id}
            />
          ))}
        </svg>
        <div className="canvas-controls">
          <button onClick={undoLine}>Undo</button>
        </div>
        <div className="author">by steveruizok</div>
      </div>
    </div>
  );
}
