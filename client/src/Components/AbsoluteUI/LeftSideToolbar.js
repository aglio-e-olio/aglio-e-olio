import React from 'react';
import PenIcon from '../Atoms/PenIcon';
import EraserIcon from '../Atoms/EraserIcon';
import TrashIcon from '../Atoms/TrashIcon';
import RedoIcon from '../Atoms/RedoIcon';
import UndoIcon from '../Atoms/UndoIcon';

const LeftSideToolbar = ({ setIsEraser, yLines, undoManager }) => {
  const clearAllLines = React.useCallback(() => {
    yLines.delete(0, yLines.length);
  }, []);

  // Undo the most recently done line
  const undoLine = React.useCallback(() => {
    undoManager.undo();
  }, []);

  // Redo the most recently undone line
  const redoLine = React.useCallback(() => {
    undoManager.redo();
  }, []);

  return (
    <ul class="menu bg-neutral p-2 rounded-box fixed left-1 z-50 top-1/3 ">
      <li onClick={() => setIsEraser(false)}>
        <a>
          <PenIcon />
        </a>
      </li>
      <li onClick={() => setIsEraser(true)}>
        <a>
          <EraserIcon />
        </a>
      </li>
      <li onClick={clearAllLines}>
        <a>
          <TrashIcon />
        </a>
      </li>
      <li onClick={undoLine}>
        <a>
          <UndoIcon />
        </a>
      </li>
      <li onClick={redoLine}>
        <a>
          <RedoIcon />
        </a>
      </li>
    </ul>
  );
};

export default LeftSideToolbar;
