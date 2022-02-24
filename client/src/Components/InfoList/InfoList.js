import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import axios from 'axios';
import './InfoList.css';


const initialState = {};

/* props로 아무것도 안 줬을 때의 컴포넌트도 따로 만들어야 할 듯. */
function InfoList({ algorithm_tag }) {
  const [tagData, setTagData] = useState([]);
  const [searchedData, setSearchedData] = useState(tagData);
  const [query, setQuery] = useState('');

  /* props으로 받은 tag 처리 */
  useEffect(() => {
    axios({
      method: 'GET',
      url: 'http://localhost:4000/tags',
      params: { algorithm: "Array" },
    })
      .then((res) => {
        console.log(res.data)
        let firstSortedData = [...res.data];
        firstSortedData.sort((a, b) => {
          if (a.title < b.title) return -1;
          if (a.title > b.title) return 1;
          return 0;
        });
        setTagData(firstSortedData);
        setSearchedData(firstSortedData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function handleSearch(e) {
    setQuery(e.target.value);
  }

  function handleKeyPress(e) {
    console.log('yeah');
  }

  /* 검색 처리 : filter 이용 */
  function searchKeyword() {
    console.log(query);
    let result = [];
    result = tagData.filter((data) => {
      if (
        data.announcer.search(query) !== -1 ||
        data.email.search(query) !== -1
      ) {

        return true;
      }
      return false;
    });

    setSearchedData(result);
  }

  return (
    <div >
      <input
        onChange={handleSearch}
        onKeyPress={handleKeyPress}
        type="text"
        placeholder="Type here"
        class="input input-bordered w-full max-w-xs"
        style={{ margin: 10 }}
      ></input>
      <button class="btn btn-active btn-primary" onClick={searchKeyword}>
        Search
      </button>
      <div class="overflow-auto h-screen card-wrapper">
        {searchedData.map((value, index) => {
          return (
            <div
              class="card w-96 bg-base-100 card-compact shadow-xl hover:shadow-md cursor-pointer"
              onClick={() => console.log(`${value.email} clicked`)}
              key={index}
            >
              <div class="card-body hover:bg-sky-700">
                <h2 class="card-title">
                  {value.title}
                </h2>
                <p>{value.announcer}</p>
                <p>{value.savingTime}</p>
                <div class="justify-end card-actions">
                  {value.tags.map(tag => <span class="badge badge-outline">{tag}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InfoList;
