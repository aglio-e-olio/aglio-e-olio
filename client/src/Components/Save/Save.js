import React, { useState, useCallback } from 'react';
import ReactModal from 'react-modal';
import './Save.css';
import axios from 'axios';
// import jsonSize from 'json-size'
// import Select, {ActionMeta, OnChangeValue} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/creatable';
import Select from 'react-select';

const Save = ({ isOpen, onSubmit, onCancel, yLines }) => {
  const [title, setTitle] = useState('');
  const [announcer, setAnnouncer] = useState();
  const [algorithm, setAlgorithm] = useState([]);
  const [extras, setExtras] = useState([]);

  // json 파일 크기 byte로 출력 나옴.
  // console.log(yLines);
  const jsonYLines = yLines.toJSON();
  // console.log(jsonYLines);
  // console.log(jsonSize(jsonYLines));

  const titleHandler = (e) => {
    e.preventDefault();
    setTitle(e.target.value);
  };

  const handleChangeAnnouncer = useCallback(
    (inputValue) => setAnnouncer(inputValue),
    []
  );

  //나중에 쓰일 듯.
  const [announcerOptions, setAnnouncerOptions] = useState([
    { label: '박현우', value: '박현우' },
    { label: '최준영', value: '최준영' },
    { label: '김도경', value: '김도경' },
    { label: '조헌일', value: '조헌일' },
    { label: '진승현', value: '진승현' },
  ]);

  const [algorithmOptions, setAlgorithmOptions] = useState([
    { label: 'BFS', value: 'BFS' },
    { label: 'DFS', value: 'DFS' },
    { label: 'STACK', value: 'STACK' },
    { label: 'QUEUE', value: 'QUEUE' },
  ]);

  const [extrasOptions, setExtrasOptions] = useState([]);

  const handleChangeAlgorithm = useCallback(
    (inputValue) => setAlgorithm(inputValue),
    []
  );

  const handleCreateAlgorithm = useCallback(
    (inputValue) => {
      const newValue = { value: inputValue.toLowerCase(), label: inputValue };
      setAlgorithmOptions([...algorithmOptions, newValue]);
      setAlgorithm(newValue);
    },
    [algorithmOptions]
  );

  const handleChangeExtras = useCallback(
    (inputValue) => setExtras(inputValue),
    []
  );

  const handleCreateExtras = useCallback(
    (inputValue) => {
      const newValue = { value: inputValue.toLowerCase(), label: inputValue };
      setExtrasOptions([...extrasOptions, newValue]);
      setExtras(newValue);
    },
    [extrasOptions]
  );

  const loadExtrasOptions = (inputValue, callback) =>
    setTimeout(() => {
      callback(
        extrasOptions.filter((item) =>
          item.label.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    }, 3000);

  // 저장 버튼 클릭시
  const submitHandler = (e) => {
    console.log('submit 발생');
    e.preventDefault();

    let saveTime = new Date();

    let body = {
      title: title,
      algorithm: algorithm,
      announcer: announcer,
      extras: extras,
      isPicture: true,
      teemMates: announcerOptions,
      saveTime: saveTime,
      doc: jsonYLines,
    };
    // console.log('yline은 ', yLines);
    // console.log('ylines를 json으로 바꾸면', JSON.stringify(yLines));
    // console.log('json으로 바꾼 ylines의 타입은', typeof JSON.stringify(yLines));
    console.log('body는 ', body);
    console.log('JSON으로 바꾸면', JSON.stringify(body));
    // console.log('body의 타입은', typeof body);
    // console.log(typeof JSON.stringify(body));
    // //yline을 JSON.stringify 하면 jsonYLines와 같다. 신기하네.

    axios
      .post('/myroom/save', JSON.stringify(body))
      .then(function (res) {
        console.log(res);
        onCancel();
      })
      .catch(function (err) {
        console.log(err);
        alert('post 실패');
        onCancel();
      });
  };

  //취소 버튼 클릭시
  const handleClickCancel = () => {
    onCancel();
  };
  return (
    <ReactModal isOpen={isOpen}>
      <div className="category" />
      <div>저장 화면 입니다.</div>
      <div className="category" />
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
        <div className="category" />
        <CreatableSelect
          placeholder="알고리즘 태그"
          value={algorithm}
          options={algorithmOptions}
          onChange={handleChangeAlgorithm}
          onCreateOption={handleCreateAlgorithm}
          isMulti
        />
        <div className="category" />
        <Select
          placeholder="발표자"
          value={announcer}
          options={announcerOptions}
          onChange={handleChangeAnnouncer}
        />
        <div className="category" />
        <AsyncCreatableSelect
          isClearable
          value={extras}
          options={extrasOptions}
          onChange={handleChangeExtras}
          onCreateOption={handleCreateExtras}
          cacheOptions
          loadOptions={loadExtrasOptions}
          placeholder="추가 태그"
        />
        <div className="category" />
        <button type="submit" class="btn btn-success">
          저장
        </button>
      </form>
      <div className="category" />
      <button class="btn btn-error" onClick={handleClickCancel}>
        취소
      </button>
    </ReactModal>
  );
};

export default Save;
