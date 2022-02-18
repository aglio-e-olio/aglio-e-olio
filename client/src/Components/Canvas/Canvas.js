import * as React from 'react';
import { Line } from './Line';
import { UserToken } from './UserToken';
import { UserCursor } from './UserCursor';
import { useLines } from '../../hooks/useLines';
import { useUser } from '../../hooks/useUser';
import { useUsers } from '../../hooks/useUsers';
import { useKeyboardEvents } from '../../hooks/useKeyboardEvents';
import './Canvas.css';
import { useState } from 'react';

const date = new Date();

date.setUTCHours(0, 0, 0, 0);

const START_TIME = date.getTime();

function getYOffset() {
  //   return (Date.now() - START_TIME) / 80;
  return -60;
}

function getPoint(x, y) {
  return [x, y + getYOffset()];
}

export default function Canvas({doc, provider, awareness, yLines, undoManager}) {
  const {
    user: self,
    updateUserPoint,
    activateUser,
    deactivateUser,
  } = useUser(awareness);

  const { users } = useUsers(awareness);

  const {
    lines,
    isSynced,
    startLine,
    addPointToLine,
    completeLine,
    clearAllLines,
    undoLine,
    redoLine,
  } = useLines({doc, provider, awareness, yLines, undoManager});

  useKeyboardEvents();

  // On pointer down, start a new current line
  const handlePointerDown = React.useCallback(
    (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);

      startLine(
        getPoint(e.clientX / window.innerWidth, e.clientY + window.scrollY)
      );
    },
    [startLine]
  );

  // On pointer move, update awareness and (if down) update the current line
  const handlePointerMove = React.useCallback(
    (e) => {
      const point = getPoint(
        e.clientX / window.innerWidth,
        e.clientY + window.scrollY
      );

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
    setZindex((index) => (index === 10 ? 0 : 10));
  };

  return (
    <div>
      <div>
        <button className="switch-function" onClick={changeZofCanvas}>
          {zIndex === 10 ? 'Code Editor Mode' : 'White Board Mode'}
        </button>
        <button className="clear-button" onClick={clearAllLines}>
          Clear All
        </button>
      </div>
      <div className="canvas-container" style={{ zIndex: zIndex }}>
        <svg
          width={window.innerWidth}
          height={window.innerHeight}
          className="canvas-layer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerEnter={activateUser}
          onPointerLeave={deactivateUser}
          opacity={isSynced ? 1 : 0.8}
        >
          <g transform={`translate(0, -${getYOffset()})`}>
            {/* Lines */}
            {lines.map((line, i) => (
              <Line key={line.get('id')} line={line} />
            ))}
            {/* Live Cursors */}
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
      </div>
    </div>
  );
}
