import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import axios from 'axios';
import './InfoList.css';

const initialState = {};

/* props로 아무것도 안 줬을 때의 컴포넌트도 따로 만들어야 할 듯. */
function InfoList({ algorithm_tag }) {
  let postId = [1, 2, 3];
  const [tagData, setTagData] = useState([]);
  const [searchedData, setSearchedData] = useState(tagData);

  /* props으로 받은 tag 처리 */
  useEffect(() => {
    axios({
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/comments',
      params: { postId: postId },
      // params: { algorithm: algorithm_tag },
    })
      .then((res) => {
        let firstSortedData = [...res.data];
        firstSortedData.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });
        setTagData(firstSortedData);
        setSearchedData(firstSortedData);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  /* 검색 처리 : filter 이용 */
  function handleSearch(e) {
    let value = e.target.value;
    let result = [];
    result = tagData.filter((data) => {
      if (data.name.search(value) != -1 || data.email.search(value) != -1) {
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
        placeholder="Type here"
        class="input input-bordered w-full max-w-xs"
        style={{ margin: 10 }}
      ></input>
      <button class="btn btn-active btn-primary">Search</button>
      <div className='card-wrapper'>
        {searchedData.map((value, index) => {
          return (
            <div class="card w-96 bg-base-100 card-compact shadow-xl" key={index}>
              <div class="card-body">
                <h2 class="card-title">
                  {value.postId}
                  <div class="badge badge-secondary">{value.id}</div>
                </h2>
                <p>{value.name}</p>
                <div class="justify-end card-actions">
                  <span class="badge badge-outline">{value.email}</span>
                  <span class="badge badge-outline">{value.email}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th></th>
              <th>
                  postId
              </th>
              <th>
                  id
              </th>
              <th>
                  name
              </th>
              <th>
                  email
              </th>
            </tr>
          </thead>
          <tbody>
            {searchedData.map((value, index) => {
              return (
                <tr key={index}>
                  <th></th>
                  <th>{value.postId}</th>
                  <td>{value.id}</td>
                  <td>{value.name}</td>
                  <td>{value.email}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div> */}
    </div>
  );
}

export default InfoList;
