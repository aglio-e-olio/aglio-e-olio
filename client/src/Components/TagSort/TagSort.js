import React, { useContext, useEffect, useState } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import axios from 'axios';
import useLocalStorage from '../../hooks/useLocalStorage';

// const mockData = ['Dijkstra', 'BFS', 'DFS', '완전탐색', '분할정복', '그래프'];

const TagSort = () => {
  const { persistEmail, getTag } = useContext(codeContext);
  const [tagData, setTagData] = useState([]);

  // const [persistName, setPersist] = useLocalStorage("persistName", );

  /* props으로 받은 tag 처리 */
  useEffect(() => {
    axios({
      method: 'GET',
      url: 'http://18.221.46.146:8000/myroom/tags/' + persistEmail,
    })
      .then((res) => {
        let firstSortedData = [...res.data.tags];
        firstSortedData.sort((a, b) => {
          if (a.tag_name < b.tag_name) return -1;
          if (a.tag_name > b.tag_name) return 1;
          return 0;
        });
        setTagData(firstSortedData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [persistEmail]);

  function getInfobyTag(tags) {
    getTag(tags);
  }

  return tagData ? (
    <ul class="menu bg-base-100 w-56 p-2 rounded-box">
      {tagData.map((tags) => (
        <li key={tags.prop} onClick={() => getInfobyTag(tags.tag_name)}>
          <a class="text-center">#{tags.tag_name}</a>
        </li>
      ))}
    </ul>
  ) : null;
};

export default TagSort;
