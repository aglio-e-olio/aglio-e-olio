import React, { useContext } from 'react';
import CodeEditorWrapper from '../Molecules/CodeEditorWrapper';

const MyDrawer = ({ doc, provider }) => {
  return (
    <div class="h-screen drawer drawer-end w-full">
      <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content">
        <label for="my-drawer-4" class="btn btn-primary drawer-button">
          Code Editor
        </label>
      </div>
      <div class="drawer-side">
        <label for="my-drawer-4" class="drawer-overlay w-1/2"></label>
          <CodeEditorWrapper doc={doc} provider={provider} />
          
      </div>
    </div>
  );
};

export default MyDrawer;
