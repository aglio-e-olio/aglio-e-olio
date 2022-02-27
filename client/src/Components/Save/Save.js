import React, { useState, useCallback, useContext } from 'react';
import ReactModal from 'react-modal';
import './Save.css';
import axios from 'axios';
// import jsonSize from 'json-size'
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { codeContext } from '../../Context/ContextProvider';
import { uploadFile } from 'react-s3';

import { v1, v3, v4, v5 } from 'uuid';

const Save = ({ isOpen, onCancel, yLines }) => {
  const [title, setTitle] = useState('');
  const [announcer, setAnnouncer] = useState();
  const [algorithm, setAlgorithm] = useState([]);
  const [extras, setExtras] = useState([]);

  const { codes, urlSnapshot, email, persistUser } = useContext(codeContext);

  //여기서 모달창이 계속 렌더링 되는 이유 해결하기!
  console.log('SAVE 컴포넌트 안!');

  const jsonYLines = yLines.toJSON();

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


    //image S3에 저장하기 위함.
    const S3_BUCKET = 'screen-audio-record';
    const REGION = 'ap-northeast-2';
    const ACCESS_KEY = prompt('AWS ACCESS_KEY를 입력해주세요.');
    const SECRET_ACCESS_KEY = prompt('AWS SECRET_ACCESS_KEY를 입력해주세요.');

    const config = {
      bucketName: S3_BUCKET,
      region: REGION,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_ACCESS_KEY,
    };

    uploadFile(urlSnapshot, config)
      .then((data) => {
        console.log(data);
        let saveTime = new Date();
        let body = {
          title: title,
          algo_tag: algorithm.map((algo) => algo.value),
          announcer: announcer.value,
          extra_tag: extras.map((extra) => extra.value),
          is_picture: true,
          teemMates: announcerOptions.map(
            (announcerOption) => announcerOption.value
          ),
          save_time: saveTime,
          canvas_data: jsonYLines,
          image_tn_ref: data.location, // data는 객체고 data.location에 링크 들어있다.
          user_email: 'tmdgus3901@gmail.com',
          nickname: persistUser,
          // code_data : codes
        };

        axios
        .post('http://18.221.46.146:8000/myroom/save', body)
        .then(function (res) {
          console.log(res);
          alert('post 성공');
          // onCancel();
        })
        .catch(function (err) {
          console.log(err);
          alert('post 실패');
          // onCancel();
        });

      })
      .catch((err) => console.log(err));

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
          value={extras}
          options={extrasOptions}
          onChange={handleChangeExtras}
          onCreateOption={handleCreateExtras}
          cacheOptions
          loadOptions={loadExtrasOptions}
          placeholder="추가 태그"
          isMulti
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
