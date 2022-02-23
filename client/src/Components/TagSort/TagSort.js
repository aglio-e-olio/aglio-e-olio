import React, { useContext, useEffect } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import {Tags} from '../Atoms/Tags';
import InfoList from '../InfoList/InfoList';

const mockData = ['Dijkstra', 'BFS', 'DFS'];

const TagSort = () => {
    const {nickName} = useContext(codeContext);

    useEffect(() => {
        // api 요청 하는 부분. 최초 렌더링 시에 하도록.
    },[]);

    return (
        <div class='flex'>
        <ul class='menu bg-base-100 w-56 p-2 rounded-box'>
            {mockData.map((tags)=>(
                <li><a>#{tags}</a></li>
            ))}
            
        </ul>
        </div>
    );
};

export default TagSort;