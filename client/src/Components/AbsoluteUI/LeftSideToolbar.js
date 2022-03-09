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

  function handleTrueEraser(e) {
    console.log('e는?', e);
    setIsEraser((prev) => (prev = true));
  }

  function handleFalseEraser() {
    setIsEraser((prev) => (prev = false));
  }


  return (
    <div class="btn-group bg-neutral p-2 rounded-box fixed left-1 z-50 top-1/3 flex flex-col">
      <button class="btn" onClick={handleFalseEraser}>
        {<PenIcon />}
      </button>
      <button class="btn" onClick={handleTrueEraser}>
        <EraserIcon />
      </button>
      <button class="btn" onClick={clearAllLines}>
        {<TrashIcon />}
      </button>
      <button class="btn" onClick={undoLine}>
        {<UndoIcon />}
      </button>
      <button class="btn" onClick={redoLine}>
        {<RedoIcon />}
      </button>
    </div>

  );
};

export default LeftSideToolbar;
