import React, { useState } from 'react';
import LeftSideToolbar from './LeftSideToolbar';
import HeaderNav from './HeaderNav';
import CodeDrawer from './CodeDrawer';
import RightSideNav from './RightSideNav';

const AbsoluteUI = ({
  peerAudios,
  handleSave,
  doc,
  provider,
  yLines,
  undoManager,
  setIsEraser,
  startRecord,
  stopRecord,
  socket,
  exit
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div class="z-5 bg-none">
      <HeaderNav peerAudios={peerAudios} handleSave={handleSave} startRecord={startRecord} stopRecord={stopRecord} exit={exit}/>
      <LeftSideToolbar setIsEraser={setIsEraser} yLines={yLines} undoManager={undoManager}/>
      <RightSideNav setIsOpen={setIsOpen} />
      <CodeDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        doc={doc}
        provider={provider}
        socket={socket}
        isSelfStudy={false}
      />
    </div>
  );
};

export default AbsoluteUI;
