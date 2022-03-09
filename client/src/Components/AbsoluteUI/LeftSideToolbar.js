import React, { useRef } from 'react';
import PenIcon from '../Atoms/PenIcon';
import EraserIcon from '../Atoms/EraserIcon';
import TrashIcon from '../Atoms/TrashIcon';
import RedoIcon from '../Atoms/RedoIcon';
import UndoIcon from '../Atoms/UndoIcon';
import './LeftSideToolbar.css'

const LeftSideToolbar = ({ setIsEraser, yLines, undoManager }) => {
  const penRef = useRef();
  const eraserRef = useRef();

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

  function handleFalseEraser() {
    penRef.current.className = 'btn btn-active';
    eraserRef.current.className = 'btn';
    setIsEraser((prev) => (prev = false));
  }

  function handleTrueEraser(e) {
    eraserRef.current.className = 'btn btn-active';
    penRef.current.className = 'btn';
    setIsEraser((prev) => (prev = true));
  }

  return (
    <div class="btn-group bg-neutral p-2 rounded-box fixed left-1 z-50 top-1/3 flex flex-col">
      <button class="btn btn-active" onClick={handleFalseEraser} ref={penRef}>
        {<PenIcon />}
      </button>
      <button class="btn" onClick={handleTrueEraser} ref={eraserRef}>
        <EraserIcon />
      </button>
      <button class="btn" onClick={clearAllLines}>
        {<TrashIcon />}
      </button>
      <button class="btn " onClick={undoLine}>
        {<UndoIcon />}
      </button>
      <button class="btn" onClick={redoLine}>
        {<RedoIcon />}
      </button>
    </div>
  );
};

export default LeftSideToolbar;
