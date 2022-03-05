import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { codeContext } from '../../Context/ContextProvider';
import Announcer from '../Dropdowns/Announcer';

function Search() {
  const [firstSortedData, setFirstSortedData] = useState([]);
  // const [searchedData, setSearchedData] = useState(receivedData);

  const {
    currentTag,
    persistEmail,
    selectPreview,
    searchedData,
    setSearchedData,
  } = useContext(codeContext);

  /* props으로 받은 tag 처리 */
  useEffect(() => {
    axios({
      method: 'GET',
      url: 'https://aglio-olio-api.shop/myroom/metadata',
      params: { algo_tag: 'BFS', user_email: persistEmail },
    })
      .then((res) => {
        let receivedData = [...res.data];
        receivedData.sort((a, b) => {
          if (a.save_time > b.save_time) return -1;
          if (a.save_time < b.save_time) return 1;
          return 0;
        });
        setFirstSortedData((data) => [...receivedData]);
        setSearchedData([...receivedData]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  let renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
  });
  console.log('renderCount', renderCount.current);

  function handleSearch(e) {
    // setQuery(e.target.value);
    let value = e.target.value;
    let result = [];
    result = firstSortedData.filter((data) => {
      if (
        data.title.search(value) !== -1 ||
        data.announcer.search(value) !== -1 ||
        (data.extra_tag
          ? data.extra_tag.find((tag) => tag.includes(value))
          : true) // 여러 태그 일부만 검색해도 검색 가능
      ) {
        return true;
      }
      return false;
    });
    setSearchedData(result);
  }

  return (
    <div>
      <input
        onChange={handleSearch}
        type="text"
        placeholder="Search"
        class="input float-left m-2.5 input-bordered w-full max-w-xs"
        style={{ margin: 10 }}
      ></input>
      <Announcer title="Announcer" />
    </div>
  );
}

export default Search;
