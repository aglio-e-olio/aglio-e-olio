// @ts-ignore
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
// import { WebsocketProvider } from 'y-websocket'

import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup';
import { keymap, ViewUpdate } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { indentWithTab } from '@codemirror/commands';
import React, { useContext, useEffect } from 'react';
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
  const { codes, extractCode, persistUser } = useContext(codeContext);
  useEffect(() => {
    const ytext = doc.getText('codemirror');

    provider.awareness.setLocalStateField('user', {
      name: persistUser,
      color: userColor.color,
      colorLight: userColor.light,
    });

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        keymap.of([...yUndoManagerKeymap]),
        basicSetup,
        javascript(),
        keymap.of([indentWithTab]),
        yCollab(ytext, provider.awareness),
        EditorView.updateListener.of((editorUpdate) => {
          if (editorUpdate.docChanged) {
            const doc = editorUpdate.state.doc;
            const value = doc.toString();
            extractCode(value);
          }
        }),
        // oneDark
      ],
    });

    const view = new EditorView({
      state,
      parent: /** @type {HTMLElement} */ (document.querySelector('#editor')),
    });
  }, []);

  return <div className="w-full text-left" id="editor"></div>;
};

export default CodeEditor;
