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
import PenIcon from '../Atoms/PenIcon';
import EraserIcon from '../Atoms/EraserIcon';
import TrashIcon from '../Atoms/TrashIcon';

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
  return -65;
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

  const [zIndex, setZindex] = useState(0);
  const changeZofCanvas = () => {
    setZindex((index) => (index === 10 ? 0 : 10));
  };

  return (
    <div>
      <div >
        {/* <ul class="menu bg-neutral p-2 rounded-box fixed left-1 z-50 top-1/3 ">
          <li onClick={changeToPencil}>
            <a>
              <PenIcon />
            </a>
          </li>
          <li onClick={changeToEraser}>
            <a>
              <EraserIcon />
            </a>
          </li>
          <li onClick={clearAllLines}>
            <a>
              <TrashIcon />
            </a>
          </li>
        </ul> */}
      </div>
      <div className="z-0 " style={{ zIndex: zIndex }}>
        <svg
          width={window.innerWidth}
          height={window.innerHeight}
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
