import React from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import Canvas from './Canvas';

const CanvasContainer = ({ roomID }) => {
  return <Canvas roomID = {roomID}/>;
};

export default CanvasContainer;
