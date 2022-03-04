import React, { useState } from 'react';
import LeftSideToolbar from './LeftSideToolbar';
import HeaderNav from './HeaderNav';
import CodeDrawer from './CodeDrawer';

const AbsoluteUI = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div class='fixed top-0 left-0 right-0 bottom-0'>
            <HeaderNav setIsOpen={setIsOpen}/>
            <LeftSideToolbar />
            <CodeDrawer isOpen={isOpen} setIsOpen={setIsOpen}/>
        </div>
    );
};

export default AbsoluteUI;