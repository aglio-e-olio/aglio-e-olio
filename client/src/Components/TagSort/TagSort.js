import React, { useContext, useEffect, useState } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import InfoList from '../InfoList/InfoList';
import axios from 'axios';

const mockData = ['Dijkstra', 'BFS', 'DFS', '완전탐색', '분할정복', '그래프'];

const TagSort = () => {
  const { nickName, getTag } = useContext(codeContext);
  const [tagData, setTagData] = useState([]);
  const [query, setQuery] = useState('');

  /* props으로 받은 tag 처리 */
  useEffect(() => {
    axios({
      method: 'GET',
      url: 'http://localhost:4000/tags',
      params: { nickname: nickName },
    })
      .then((res) => {
        console.log(res.data)
        let firstSortedData = [...res.data];
        firstSortedData.sort((a, b) => {
          if (a.algorithm < b.algorithm) return -1;
          if (a.algorithm > b.algorithm) return 1;
          return 0;
        });
        firstSortedData.map(data => {
            setTagData(tagData => [...tagData, data.algorithm]);
        });
        // setTagData(firstSortedData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function getInfobyTag(tags) {
    getTag(tags);
  }

  return (
    <ul class="menu bg-base-100 w-56 p-2 rounded-box">
      {tagData.map((tags) => {
          console.log(tags, "tags!")
          return(
        <li onClick={() => getInfobyTag(tags)}>
          <a>#{tags}</a>
        </li>
      )})}
      {console.log(tagData, "inthe map")}
    </ul>
  );
};

export default TagSort;
