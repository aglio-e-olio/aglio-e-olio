import React, { useContext, useEffect, useState } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import axios from 'axios';
import useLocalStorage from '../../hooks/useLocalStorage';

// const mockData = ['Dijkstra', 'BFS', 'DFS', '완전탐색', '분할정복', '그래프'];

const TagSort = () => {
  const { persistUser, getTag } = useContext(codeContext);
  const [tagData, setTagData] = useState([]);

  // const [persistName, setPersist] = useLocalStorage("persistName", );

  /* props으로 받은 tag 처리 */
  useEffect(() => {
    axios({
      method: 'GET',
      url: 'http://localhost:4000/tags',
      params: { nickname: persistUser },
    })
      .then((res) => {
        let firstSortedData = [...res.data];
        firstSortedData.sort((a, b) => {
          if (a.algorithm < b.algorithm) return -1;
          if (a.algorithm > b.algorithm) return 1;
          return 0;
        });
        firstSortedData.map((data) => {
          setTagData((tagData) => [...new Set([...tagData, data.algorithm])]);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [persistUser]);

  function getInfobyTag(tags) {
    getTag(tags);
  }

  return (
    <ul class="menu bg-base-100 w-56 p-2 rounded-box">
      {tagData.map((tags) => (
        <li onClick={() => getInfobyTag(tags)}>
          <a class="text-center">#{tags}</a>
        </li>
      ))}
    </ul>
  );
};

export default TagSort;
