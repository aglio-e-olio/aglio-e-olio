import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { codeContext } from '../../Context/ContextProvider';
import Dropdown from '../Dropdown/Dropdown';
import { XIcon } from '@heroicons/react/outline';

function Search() {
  const [sortedData, setSortedData] = useState([]);
  const [query, setQuery] = useState('');
  const inputRef = useRef('');

  // const [searchedData, setSearchedData] = useState(receivedData);

  const { setSearchedData, keywords, setKeywords } = useContext(codeContext);

  const persistEmail = JSON.parse(localStorage.getItem('persistEmail'));

  /* 서버에 해당 유저 데이터 받아오기 */
  function getData() {
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
  }

  useEffect(() => {
    getData();
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

  /* 검색 기능 */
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

    /* 중복 검색 방지 */
    let newKeywords = [...keywords, keyword].reduce((acc, cur) => {
      !(
        acc.find((keyword_obj) => keyword_obj.key === cur.key) &&
        acc.find((keyword_obj) => keyword_obj.value === cur.value)
      ) && acc.push(cur);

      return acc;
    }, []);

    setKeywords([...newKeywords]);
    inputRef.current.value = ''; // 검색 후 입력창 초기화
  }

  function handleKeyPress(e) {
    // enter 키 검색
    if (e.key === 'Enter') {
      searchKeyword();
    }
  }

  /* tag 버튼 누를 시 해당 tag 검색 필터에서 제외. */
  function handleKeywordBadge(e) {
    let temp = keywords;
    let i = 0;
    for (i = 0; i < temp.length; i++) {
      if (temp[i].value === e.target.innerText) {
        temp.splice(i, 1);
        break;
      }
    }
    setKeywords([...temp]);
    // setKeywords(temp); // 바뀌지 않음.
  }

  function handleXClick(value) {
    let temp = keywords;
    let i = 0;
    for (i = 0; i < temp.length; i++) {
      if (temp[i].value === value) {
        temp.splice(i, 1);
        break;
      }
    }
    setKeywords([...temp]);
    // setKeywords(temp); // 바뀌지 않음.
  }

  return (
    <div class='p-3'>
      <div>
        <input
          onChange={handleSearch}
          onKeyPress={handleKeyPress}
          type="text"
          placeholder="Search"
          class="input input-bordered w-full max-w-xs"
          ref={inputRef}
        ></input>
        <button
          class="btn btn-active btn-primary mr-10"
          onClick={searchKeyword}
        >
          Search
        </button>
        <Dropdown title="Algorithm" item="algo_tag" />
        <Dropdown title="Announcer" item="announcer" />
        <Dropdown title="Extra Tag" item="extra_tag" />
      </div>
      <div class="mx-2.5 mt-1">
        {keywords &&
          keywords.map((keyword, index) => {
            const classes = [
              'badge badge-info badge-outline gap-2 mx-2',
              'badge badge-success gap-2 mx-2',
              'badge badge-warning gap-2 mx-2',
              'badge badge-error gap-2 mx-2',
            ];
            const badge_class = classes[index % classes.length];
            return (
              <div
                key={index}
                onClick={handleKeywordBadge}
                class={badge_class}
                style={{ cursor: 'pointer' }}
              >
                {keyword.value}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  class="inline-block w-4 h-4 stroke-current"
                  onClick={(e) => handleXClick(keyword.value)}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Search;
