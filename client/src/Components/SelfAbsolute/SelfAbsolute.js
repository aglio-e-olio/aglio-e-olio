import React, { useState } from 'react';
import LeftSideToolbar from '../AbsoluteUI/LeftSideToolbar';
import RightSideNav from '../AbsoluteUI/RightSideNav';
import CodeDrawer from '../AbsoluteUI/CodeDrawer';
import SelfHeader from './SelfHeader';

const SelfAbsolute = ({
  peers,
  handleSave,
  doc,
  provider,
  yLines,
  undoManager,
  setIsEraser,
  socket
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <SelfHeader handleSave={handleSave}/>
      <LeftSideToolbar
        setIsEraser={setIsEraser}
        yLines={yLines}
        undoManager={undoManager}
      />
      <RightSideNav setIsOpen={setIsOpen} />
      <CodeDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        doc={doc}
        provider={provider}
        socket={socket}
        isSelfStudy={true}
      />
    </div>
  );
};

export default SelfAbsolute;
