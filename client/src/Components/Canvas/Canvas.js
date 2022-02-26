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
import { useEraser } from '../../hooks/useEraser';

const date = new Date();

date.setUTCHours(0, 0, 0, 0);

const START_TIME = date.getTime();

let ERASER_FLAG = false;

function changeToEraser() {
    ERASER_FLAG = true;
  
}

function changeToPencil() {
  ERASER_FLAG = false;
}

function getYOffset() {
  //   return (Date.now() - START_TIME) / 80;
  return -60;
}

function getPoint(x, y) {
  return [x, y + getYOffset()];
}

export default function Canvas({
  doc,
  provider,
  awareness,
  yLines,
  undoManager,
}) {
  const {
    user: self,
    updateUserPoint,
    activateUser,
    deactivateUser,
  } = useUser({ awareness });

  const { users } = useUsers({ awareness });

  const {
    lines,
    isSynced,
    startLine,
    addPointToLine,
    completeLine,
    clearAllLines,
    undoLine,
    redoLine,
  } = useLines({ doc, provider, awareness, yLines, undoManager });

  const {
    //lines,
    //isSynced,
    startErase,
    addPointToErase,
    completeErase,
  } = useEraser({ doc, provider, awareness, yLines, undoManager });

  useKeyboardEvents();

  // On pointer down, start a new current line
  const handlePointerDown = React.useCallback(
    (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);

      if (ERASER_FLAG) {
        startErase(
          getPoint(e.clientX / window.innerWidth, e.clientY + window.scrollY)
        );
      } else {
        startLine(
          getPoint(e.clientX / window.innerWidth, e.clientY + window.scrollY)
        );
      }
    },
    [startLine, startErase]
  );

  // On pointer move, update awareness and (if down) update the current line
  const handlePointerMove = React.useCallback(
    (e) => {
      const point = getPoint(
        e.clientX / window.innerWidth,
        e.clientY + window.scrollY
      );

      updateUserPoint(point);

      if (e.currentTarget.hasPointerCapture(e.pointerId) && !ERASER_FLAG) {
        addPointToLine(point);
      } else if (
        e.currentTarget.hasPointerCapture(e.pointerId) &&
        ERASER_FLAG
      ) {
        addPointToErase(point);
      }
    },
    [addPointToLine, updateUserPoint, addPointToErase]
  );

  // On pointer up, complete the current line
  const handlePointerUp = React.useCallback(
    (e) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (ERASER_FLAG) {
        completeErase();
      } else {
        completeLine();
      }
    },
    [completeLine, completeErase]
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
        <ul class="menu bg-base-100 p-2 rounded-box fixed z-50 top-1/3 ">
          <li onClick={changeToPencil}>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </a>
          </li>
          <li onClick={changeToEraser}>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>
          </li>
          <li onClick={clearAllLines}>
            <a>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </a>
          </li>
        </ul>
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
