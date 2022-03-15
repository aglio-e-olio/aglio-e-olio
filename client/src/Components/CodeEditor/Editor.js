// @ts-ignore
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
// import { WebsocketProvider } from 'y-websocket'

import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup';
import { keymap, ViewUpdate } from '@codemirror/view';
import { python } from '@codemirror/lang-python'
// import { javascript } from '@codemirror/lang-javascript';
import { indentWithTab } from '@codemirror/commands';
import React, { useContext, useEffect, useState, useRef } from 'react';
import * as random from 'lib0/random';
import './Editor.css';
import { codeContext } from '../../Context/ContextProvider';

export const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' },
];

export const userColor = usercolors[random.uint32() % usercolors.length];


const CodeEditor = ({ doc, provider }) => {
  const editorRef = useRef();
  const { extractCode, persistUser } = useContext(codeContext);

  useEffect(() => {
    console.log('컴포넌트 나타남.')
    const ytext = doc.getText('codemirror');
    const codeUserColor = provider.awareness.getLocalState('color');
    console.log('codeUserColor는', codeUserColor, typeof (codeUserColor));
    provider.awareness.setLocalStateField('user', {
      name: persistUser,
      color: codeUserColor.color,
      colorLight: codeUserColor.color,
    });
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        keymap.of([...yUndoManagerKeymap]),
        basicSetup,
        python(),
        keymap.of([indentWithTab]),
        yCollab(ytext, provider.awareness),
      ],
    });
    const view = new EditorView({
      state,
      parent: editorRef.current
    });


    return () => {
      console.log('컴포넌트 사라짐.')
      view.destroy();
    }

  })

  return <div className="w-full text-left" ref={editorRef}></div>

};

export default CodeEditor;
