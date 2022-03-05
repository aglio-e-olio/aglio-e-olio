import React, { useState } from 'react';
import LeftSideToolbar from './LeftSideToolbar';
import HeaderNav from './HeaderNav';
import CodeDrawer from './CodeDrawer';
import RightSideNav from './RightSideNav';

const AbsoluteUI = ({
  peers,
  handleSave,
  doc,
  provider,
  yLines,
  undoManager,
  setIsEraser,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div class="z-5 bg-none">
      <HeaderNav peers={peers} handleSave={handleSave} />
      <LeftSideToolbar setIsEraser={setIsEraser} yLines={yLines} undoManager={undoManager}/>
      <RightSideNav setIsOpen={setIsOpen} />
      <CodeDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        doc={doc}
        provider={provider}
      />
    </div>
  );
};

export default AbsoluteUI;
