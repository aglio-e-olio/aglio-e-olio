import React from 'react';
import InfoList from '../InfoList/InfoList';

export const Tags = React.memo(function Tags({ tags }) {

    let isClicked = false;
    
    function getInfoList() {
        isClicked = true;

    }
    
    
    return (
        <li>
            #{tags}
        </li>
    );
});