// import * as Y from 'yjs';
// import { WebrtcProvider } from 'y-webrtc';
// import { codeContext } from '../Context/ContextProvider';
// import { useContext } from 'react';

// export const doc = new Y.Doc();

// const VERSION = 9; // 그~ 렇게 중요하지는 않는 것 같음

// // Create websocket provider (but don't connect just yet)
// // export const provider = new WebsocketProvider(
// //     "wss://demos.yjs.dev",
// //     `draw-memo-${VERSION}`, // room Name
// //     doc,
// //     {
// //         connect:false
// //     }
// // )

// export const provider = new WebrtcProvider('proper room name', doc, {
//   connect: false,
// });

// export const awareness = provider.awareness;

// /**
//  * @param {yLines} Y.Array<Y.Map<any>>
//  */
// export const yLines = doc.getArray(`lines~${VERSION}`);

// /* Create an undo manager for the line maps */
// export const undoManager = new Y.UndoManager(yLines);
