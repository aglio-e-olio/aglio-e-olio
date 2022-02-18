import React from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import Canvas from './Canvas';

const CanvasContainer = ({roomID}) => {
    const doc = new Y.Doc();
    const provider = new WebrtcProvider(roomID, doc);
    const awareness = provider.awareness;
    const yLines = doc.getArray('lines~9');
    const undoManager = new Y.UndoManager(yLines);

    return (
        <Canvas doc={doc} provider={provider} awareness={awareness} yLines={yLines} undoManager={undoManager} />
    );
};

export default CanvasContainer;