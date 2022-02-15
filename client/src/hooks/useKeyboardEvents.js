import * as React from "react";
import { undoManager } from "../utils/y";

export function useKeyboardEvents() {
  React.useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case "z": {
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              undoManager.redo();
            } else {
              undoManager.undo();
            }
            break;
          }
        }
      }
    }

    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}