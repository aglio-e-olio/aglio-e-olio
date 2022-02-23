import React, { useContext, useEffect, useState } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import {Tags} from '../Atoms/Tags';
import InfoList from '../InfoList/InfoList';

const mockData = ['Dijkstra', 'BFS', 'DFS', '완전탐색', '분할정복', '그래프'];

const TagSort = () => {
    const {nickName, getTag} = useContext(codeContext);

    useEffect(() => {
        // api 요청 하는 부분. 최초 렌더링 시에 하도록.
    },[]);

    function getInfobyTag(tags) {
        getTag(tags);
    }
    
    return (
        <ul class='menu bg-base-100 w-56 p-2 rounded-box'>
            {mockData.map((tags)=>(
                <li key={tags.toString()} onClick={() => getInfobyTag(tags)}><a>#{tags}</a></li>
            ))}
            
        </ul>
    );
};

export default TagSort;