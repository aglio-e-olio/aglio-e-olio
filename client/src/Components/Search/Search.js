import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { codeContext } from '../../Context/ContextProvider';
import Dropdown from '../Dropdown/Dropdown';

function Search() {
  const [sortedData, setSortedData] = useState([]);
  const [query, setQuery] = useState('');
  
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
      params: { user_email: persistEmail },
    })
      .then((res) => {
        let receivedData = [...res.data];
        receivedData.sort((a, b) => {
          if (a.save_time > b.save_time) return -1;
          if (a.save_time < b.save_time) return 1;
          return 0;
        });
        setSortedData((data) => [...receivedData]);
        setSearchedData([...receivedData]); // 초기 info에 보여지는 데이터 설정
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  // let renderCount = useRef(0);
  // useEffect(() => {
  //   renderCount.current += 1;
  // });
  // console.log('renderCount', renderCount.current);

  /* 태그 선택 시 데이터 필터링 */
  useEffect(() => {
    let datas = sortedData;
    let result = [];
    keywords.map((keyword) => {
      result = datas.filter((data) => {
        if (keyword.key === 'search') {
          /* input으로 들어온 string 타입의 검색어 */
          if (
            data.title.search(keyword.value) !== -1 ||
            data.announcer.search(keyword.value) !== -1 ||
            (data.algo_tag
              ? data.algo_tag.find((tag) => tag.includes(keyword.value))
              : true) ||
            (data.extra_tag
              ? data.extra_tag.find((tag) => tag.includes(keyword.value))
              : true) // 여러 태그 일부만 검색해도 검색 가능
          ) {
            return true;
          }
          return false;
        } else if (typeof data[keyword.key] === 'string') {
          /* Announcer 등 string type */
          if (data[keyword.key].search(keyword.value) !== -1) return true;
          return false;
        } else {
          /* algo_tag & extra_tag 등 array type */
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
    setQuery(e.target.value);
  }

  function searchKeyword() {
    if (query === '') {
      return;
    }

    let keyword = {};
    keyword.key = 'search';
    keyword.value = query;

    let newKeywords = [...keywords, keyword].reduce((acc, cur) => {
      !(
        acc.find((keyword_obj) => keyword_obj.key === cur.key) &&
        acc.find((keyword_obj) => keyword_obj.value === cur.value)
      ) && acc.push(cur);

      return acc;
    }, []);

    setKeywords([...newKeywords]);
  }

  function handleKeyPress(e) {
    // enter 키 검색
    if (e.key === 'Enter') {
      searchKeyword();
    }
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
          onKeyPress={handleKeyPress}
          type="text"
          placeholder="Search"
          class="input input-bordered w-full max-w-xs"
          style={{ margin: 10 }}
        ></input>
        <button class="btn btn-active btn-primary" onClick={searchKeyword}>
          Search
        </button>
        <div>
          <Dropdown title="Algorithm" item="algo_tag" />
          <Dropdown title="Announcer" item="announcer" />
          <Dropdown title="Extra Tag" item="extra_tag" />
        </div>
      </div>
      <br></br>
      <div class="mx-2.5">
        {keywords &&
          keywords.map((keyword, index) => {
            return (
                <button
                  class="btn btn-sm m-2.5 no-animation"
                  onClick={handleKeywordBtn}
                >
                  {keyword.value}
                </button>
            );
          })}
      </div>
    </div>
  );
}

export default Search;
