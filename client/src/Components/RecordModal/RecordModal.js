import React, { useState, useCallback, useContext } from 'react';
import Modal from 'react-modal';
import { codeContext } from '../../Context/ContextProvider';
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import dotenv from 'dotenv';
import axios from 'axios';
import Swal from 'sweetalert2';

const RecordModal = ({ isOpen, onCancel, videoUrl }) => {
  dotenv.config();
  console.log(isOpen, 'isopen in recordmodal');
  const [title, setTitle] = useState('');
  const [announcer, setAnnouncer] = useState();
  const [algorithm, setAlgorithm] = useState([]);
  const [extras, setExtras] = useState([]);

  const { codes, urlSnapshot, email, persistUser, persistEmail } =
    useContext(codeContext);

  //여기서 모달창이 계속 렌더링 되는 이유 해결하기!
  // console.log('SAVE 컴포넌트 안!');

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

  const handleClickCancel = () => {
    onCancel();
  };

  function getTime() {
    const t = new Date();
    const date = ('0' + t.getDate()).slice(-2);
    const month = ('0' + (t.getMonth() + 1)).slice(-2);
    const year = t.getFullYear();
    const hours = ('0' + t.getHours()).slice(-2);
    const minutes = ('0' + t.getMinutes()).slice(-2);
    const seconds = ('0' + t.getSeconds()).slice(-2);
    const time = `${year}/${month}/${date} ${hours}:${minutes}:${seconds}`;
    return time;
  }

  const submitHandler = (e) => {
    // console.log(videoUrl, 'videoUrl!!');
    e.preventDefault();

    const saveTime = getTime();
    let body = {
      title: title,
      algo_tag: algorithm.map((algo) => algo.value),
      announcer: announcer.value,
      extra_tag: extras.map((extra) => extra.value),
      type: 'video',
      teamMates: announcerOptions.map(
        (announcerOption) => announcerOption.value
      ),
      save_time: saveTime,
      canvas_data: null,
      image_tn_ref: videoUrl, // data는 객체고 data.location에 링크 들어있다.
      user_email: persistEmail,
      nickname: persistUser,
      video_flag : false, // 비디오 추가
    };

    const showLoading = function () {
      Swal.fire({
        title: '영상 저장중입니다',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
    };

    showLoading();

    axios
      .post('https://aglio-olio-api.shop/myroom/save', body)
      .then(function (res) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'post 성공!',
          showConfirmButton: false,
          timer : 2000
        })
      })
      .catch(function (err) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'post 실패!',
          showConfirmButton: false,
          timer : 2000
        })
      });
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="category" />
      <div>녹화 저장 화면 입니다.</div>
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
        <button type="submit" class="btn btn-success bg-neutral">
          저장
        </button>
      </form>
      <div className="category" />
      <button class="btn btn-error" onClick={handleClickCancel}>
        취소
      </button>
    </Modal>
  );
};

export default RecordModal;
