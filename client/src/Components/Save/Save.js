import React, { useState } from 'react';
import ReactModal from 'react-modal';
import './Save.css';
import axios from 'axios';

const Save = ({ isOpen, onSubmit, onCancel, yLines }) => {
  const [title, setTitle] = useState('');
  const [announcer, setAnnouncer] = useState();
  const [algorithm, setAlgorithm] = useState([]);

  const titleHandler = (e) => {
    e.preventDefault();
    setTitle(e.target.value);
  };

  const announcerHandler = (e) => {
    e.preventDefault();
    setAnnouncer(e.target.value);
  };

  const announcerOptions = [
    { key: '박현우', value: '박현우' },
    { key: '최준영', value: '최준영' },
    { key: '조헌일', value: '조헌일' },
    { key: '김도경', value: '김도경' },
    { key: '진승현', value: '진승현' },
  ];

  const algorithmHandler = (e) => {
    e.preventDefault();
    setAlgorithm([
      ...algorithm,
      e.target.value,
    ]);

  };

  const algorithmOptions = [
    { key: 'BFS', value: 'BFS' },
    { key: 'DFS', value: 'DFS' },
    { key: 'STACK', value: 'STACK' },
    { key: 'QUEUE', value: 'QUEUE' },
  ];


  // console.log(yLines.toJSON());
  // 저장 버튼 클릭시
  const submitHandler = (e) => {
    console.log('submit 발생');
    e.preventDefault();
    console.log(title);
    console.log(algorithm);
    console.log(announcer);

    let body = {
      title: title,
      algorithm: algorithm,
      announcer: announcer,
    };

    axios
      .post('/api/user/snapshot', body)
      .then(function (res) {
        console.log(res);
        onCancel();
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  //취소 버튼 클릭시
  const handleClickCancel = () => {
    onCancel();
  };
  return (
    <ReactModal isOpen={isOpen}>
      <div>세이브 모달 입니다.</div>
      <form
        onSubmit={submitHandler}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <input
          type="text"
          placeholder="제목"
          class="input input-bordered input-primary w-full max-w-xs"
          value={title}
          onChange={titleHandler}
        ></input>
        <select onChange={algorithmHandler} value={algorithm}>
          {algorithmOptions.map((item, index) => (
            <option key={item.key} value={item.key}>
              {item.value}
            </option>
          ))}
        </select>
        <select onChange={announcerHandler} value={announcer}>
          {announcerOptions.map((item, index) => (
            <option key={item.key} value={item.key}>
              {item.value}
            </option>
          ))}
        </select>

        <button type="submit" class="btn btn-success">
          저장
        </button>
      </form>

      <div>
        <button class="btn btn-error" onClick={handleClickCancel}>
          취소
        </button>
      </div>
    </ReactModal>
  );
};

export default Save;
