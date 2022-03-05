import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { codeContext } from '../../Context/ContextProvider';
import Dropdown from '../Dropdown/Dropdown';

function Search() {
  const [sortedData, setSortedData] = useState([]);
  const [bridge, setBridge] = useState([]);
  // const [searchedData, setSearchedData] = useState(receivedData);

  const {
    persistEmail,
    selectPreview,
    searchedData,
    setSearchedData,
    keywords,
    setKeywords,
  } = useContext(codeContext);

  /* 서버에 해당 유저 데이터 받아오기 */
  useEffect(() => {
    axios({
      method: 'GET',
      url: 'https://aglio-olio-api.shop/myroom/metadata',
      params: { algo_tag: 'DFS', user_email: persistEmail },
    })
      .then((res) => {
        let receivedData = [...res.data];
        receivedData.sort((a, b) => {
          if (a.save_time > b.save_time) return -1;
          if (a.save_time < b.save_time) return 1;
          return 0;
        });
        setSortedData((data) => [...receivedData]);
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

  useEffect(() => {
    let datas = sortedData;
    let result = [];
    keywords.map((keyword) => {
      result = datas.filter((data) => {
        if (typeof data[keyword.key] === 'string') {
          if (data[keyword.key].search(keyword.value) !== -1) return true;
          return false;
        } else {
          if (
            data[keyword.key]
              ? data[keyword.key].find((tag) => tag.includes(keyword.value))
              : true
          )
            return true;
          return false;
        }
      });
      datas = result;
    });
    setSearchedData(datas);
  }, [keywords]);

  /* 매 input event마다 데이터 필터링 */
  function handleSearch(e) {
    let value = e.target.value;
    let result = [];
    result = sortedData.filter((data) => {
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
    setBridge(result);
    setSearchedData(result);
  }

  /* tag 버튼 누를 시 해당 tag 검색 필터에서 제외. */
  function handleKeywordBtn(e) {
    let temp = keywords;
    let i = 0;
    for (i = 0; i < temp.length; i++) {
      if (temp[i].value === e.target.innerHTML) {
        temp.splice(i, 1);
        break;
      }
    }
    setKeywords([...temp]);
    // setKeywords(temp); // 바뀌지 않음.
  }

  return (
    <div>
      <div class="m-2.5">
        <input
          onChange={handleSearch}
          type="text"
          placeholder="Search"
          class="input float-left  input-bordered w-full max-w-xs"
          style={{ margin: 10 }}
        ></input>
        {/* <Dropdown title="Algorithm" item="algo_tag" /> */}
        <Dropdown title="Announcer" item="announcer" />
        <Dropdown title="Extra Tag" item="extra_tag" />
      </div>
      <br></br>
      <div class="float-left mx-2.5">
        {keywords &&
          keywords.map((keyword) => {
            return (
              <button class="btn btn-xs mx-2.5" onClick={handleKeywordBtn}>
                {keyword.value}
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default Search;
