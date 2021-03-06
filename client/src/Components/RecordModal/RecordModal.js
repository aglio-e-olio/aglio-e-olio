import React, { useState, useCallback, useContext, useEffect } from 'react';
import Modal from 'react-modal';
import { codeContext } from '../../Context/ContextProvider';
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import dotenv from 'dotenv';
import axios from 'axios';
import Swal from 'sweetalert2';
import { XIcon } from '@heroicons/react/outline';

const RecordModal = ({ isOpen, onCancel, videoUrl, peerAudios }) => {
  dotenv.config();
  const [title, setTitle] = useState('');
  const [announcer, setAnnouncer] = useState();
  const [algorithm, setAlgorithm] = useState([]);
  const [extras, setExtras] = useState([]);

  const [announcerOptions, setAnnouncerOptions] = useState([]);

  const [algorithmOptions, setAlgorithmOptions] = useState([
    { label: 'BFS', value: 'BFS' },
    { label: 'DFS', value: 'DFS' },
    { label: 'STACK', value: 'STACK' },
    { label: 'QUEUE', value: 'QUEUE' },
    { label: 'Heap', value: 'Heap' },
    { label: '완전탐색', value: '완전탐색' },
    { label: 'Greedy', value: 'Greedy' },
    { label: 'DP', value: 'DP' },
    { label: '그래프', value: '그래프' },
    { label: '정렬', value: '정렬' },
    { label: '문자열', value: '문자열' },
  ]);

  const [extrasOptions, setExtrasOptions] = useState([]);

  const { persistUser, persistEmail } = useContext(codeContext);

  useEffect(() => {
    const peersName = [];

    if (peerAudios.size !== 0) {
      peerAudios.forEach((value, key) => {
        peersName.push({ label: value.name, value: value.name });
      });
    }
    setAnnouncerOptions((prev) => (prev = peersName));

    if (persistUser !== '') {
      setAnnouncerOptions((prev) => [
        ...prev,
        { label: persistUser, value: persistUser },
      ]);
    }

    return () => {};
  }, [peerAudios, persistUser]);

  const titleHandler = (e) => {
    e.preventDefault();
    setTitle(e.target.value);
  };

  const handleChangeAnnouncer = useCallback(
    (inputValue) => setAnnouncer(inputValue),
    []
  );

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
      image_tn_ref: videoUrl, // videoURL링크 들어있다.
      user_email: persistEmail,
      nickname: persistUser,
      video_flag: 'false', // 비디오 추가
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
          timer: 2000,
          showLoaderOnConfirm: true,
        });
        onCancel();
      })
      .catch(function (err) {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'post 실패!',
          showConfirmButton: false,
          timer: 2000,
        });
      });
  };

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      height: '50%',
      transform: 'translate(-50%, -50%)',
      border: 'none',
      borderRadius: '23px',
    },
  };

  return (
    <Modal isOpen={isOpen} style={modalStyles}>
      <XIcon
        class="inline-block w-5 h-5 stroke-current absolute right-5"
        style={{ cursor: 'pointer' }}
        onClick={handleClickCancel}
      />
      <div class="text-center text-2xl m-7">Save Your Record!</div>
      <form
        onSubmit={submitHandler}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <input
          type="text"
          placeholder="제목"
          class="input input-bordered w-full max-w-xs"
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
        <button
          type="submit"
          class="btn btn-success bg-neutral border-none w-16 absolute right-5 bottom-16"
        >
          저장
        </button>
      </form>
      <div className="category" />
    </Modal>
  );
};

export default RecordModal;
