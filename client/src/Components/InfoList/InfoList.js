import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './InfoList.css';
import { codeContext } from '../../Context/ContextProvider';
import PictureIcon from '../Atoms/PictureIcon';
import CameraIcon from '../Atoms/CameraIcon';

/* props로 아무것도 안 줬을 때의 컴포넌트도 따로 만들어야 할 듯. */
function InfoList() {
  const [tagData, setTagData] = useState([]);
  const [searchedData, setSearchedData] = useState(tagData);
  const [query, setQuery] = useState('');

  const { currentTag, persistUser, selectPreview } = useContext(codeContext);

  /* props으로 받은 tag 처리 */
  useEffect(() => {
    axios({
      method: 'GET',
      url: 'http://localhost:4000/meta',
      params: { algorithm: currentTag, nickname: persistUser },
    })
      .then((res) => {
        let firstSortedData = [...res.data];
        firstSortedData.sort((a, b) => {
          if (a.savingTime > b.savingTime) return -1;
          if (a.savingTime < b.savingTime) return 1;
          return 0;
        });
        setTagData(firstSortedData);
        setSearchedData(firstSortedData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentTag]);

  function handleSearch(e) {
    // setQuery(e.target.value);
    let value = e.target.value;
    let result = [];
    result = tagData.filter((data) => {
      if (
        data.title.search(value) !== -1 ||
        data.announcer.search(value) !== -1 ||
        data.email.search(value) !== -1 ||
        data.tags.find((tag) => tag.value.includes(value)) // 여러 태그 일부만 검색해도 검색 가능
      ) {
        return true;
      }
      return false;
    });

    setSearchedData(result);
  }

  function handleKeyPress(e) {
    // enter 키 검색
    if (e.key === 'Enter') {
      searchKeyword();
    }
  }

  /* 검색 처리 : filter 이용 */
  function searchKeyword() {
    let result = [];
    result = tagData.filter((data) => {
      if (
        data.title.search(query) !== -1 ||
        data.announcer.search(query) !== -1 ||
        data.email.search(query) !== -1 ||
        data.tags.find((tag) => tag.value.includes(query)) // 여러 태그 일부만 검색해도 검색 가능
      ) {
        return true;
      }
      return false;
    });

    setSearchedData(result);
  }

  function handleCardClick(value) {
    selectPreview(value._id);
  }

  return (
    <div>
      <input
        onChange={handleSearch}
        onKeyPress={handleKeyPress}
        type="text"
        placeholder="Type here"
        class="input input-bordered w-full max-w-xs"
        style={{ margin: 10 }}
      ></input>
      <div class="overflow-auto h-screen card-wrapper">
        {searchedData.map((value) => {
          return (
            <div
              class="card w-96 bg-base-100 card-compact shadow-xl hover:shadow-md cursor-pointer"
              onClick={() => handleCardClick(value)}
              key={value._id}
            >
              <div class="card-body hover:bg-sky-700">
                <h2 class="card-title">{value.title}</h2>
                {value.isPicture ? <PictureIcon /> : <CameraIcon />}
                <p>{value.announcer}</p>
                <p>{value.savingTime}</p>
                <div class="justify-end card-actions">
                  {value.tags.map((tag) => (
                    <span key={tag._id} class="badge badge-outline">
                      {tag.value}
                    </span> // tag 안에 _id와 value 넣음
                  ))}
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
