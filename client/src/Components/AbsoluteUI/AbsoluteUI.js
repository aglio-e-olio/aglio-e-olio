import React, { useState } from 'react';
import LeftSideToolbar from './LeftSideToolbar';
import HeaderNav from './HeaderNav';
import CodeDrawer from './CodeDrawer';
import RightSideNav from './RightSideNav';

const AbsoluteUI = ({peers, handleSave, doc, provider}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div class='fixed top-0 left-0 right-0 bottom-0'>
            <HeaderNav peers={peers} handleSave={handleSave}/>
            <LeftSideToolbar />
            <RightSideNav setIsOpen={setIsOpen}/>
            <CodeDrawer isOpen={isOpen} setIsOpen={setIsOpen} doc={doc} provider={provider}/>
        </div>
    );
};

export default AbsoluteUI;