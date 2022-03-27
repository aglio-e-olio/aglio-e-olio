import React, { useState, useCallback, useContext, useEffect } from 'react';
import ReactModal from 'react-modal';
import '../Save/Save.css';
import axios from 'axios';
import * as Y from 'yjs';
// import jsonSize from 'json-size'
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { codeContext } from '../../Context/ContextProvider';
import { uploadFile } from 'react-s3';
import { v1 } from 'uuid';
import dotenv from 'dotenv';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '@heroicons/react/outline';

const UpdateStudy = ({ isOpen, onCancel, doc, data }) => {
  dotenv.config();

  const [title, setTitle] = useState(data.title);
  const [announcer, setAnnouncer] = useState(data.announcer);
  const navigate = useNavigate();
  const [isUpdate, setUpdate] = useState();
  const [metaData, setMetaData] = useState([]);
  const {
    exitSave,
    urlSnapshot,
    persistEmail,
    persistUser,
    selectedPreviewKey,
    setDocGCount,
  } = useContext(codeContext);

  function makeArray(array, data, key) {
    if (data && data[key]) {
      data[key].map((tag) => {
        let obj = {};
        obj.label = tag;
        obj.value = tag;
        array.push(obj);
      });
    }
    return array;
  }

  let algo_array = makeArray([], data, 'algo_tag');
  let extra_array = makeArray([], data, 'extra_tag');
  let announcer_array = makeArray([], data, 'teamMates');
  const [algorithm, setAlgorithm] = useState(algo_array);
  const [extras, setExtras] = useState(extra_array);

  //여기서 모달창이 계속 렌더링 되는 이유 해결하기!
  // console.log('SAVE 컴포넌트 안!');

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
  const [announcerOptions, setAnnouncerOptions] = useState(announcer_array);
  const [extrasOptions, setExtrasOptions] = useState([]);

  const titleHandler = (e) => {
    e.preventDefault();
    setTitle(e.target.value);
  };

  const handleChangeAnnouncer = useCallback(
    (inputValue) => setAnnouncer(inputValue),
    []
  );

  const handleChangeAlgorithm = useCallback(setAlgorithm, []);
  const handleChangeExtras = useCallback(setExtras, []);

  const handleCreateAlgorithm = useCallback(
    (inputValue) => {
      const newValue = { value: inputValue.toLowerCase(), label: inputValue };
      setAlgorithmOptions([...algorithmOptions, newValue]);
    },
    [algorithmOptions]
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
    const ydocCanvasData = Y.encodeStateAsUpdateV2(doc);
    console.log('submit 발생');
    e.preventDefault();

    const config = {
      bucketName: process.env.REACT_APP_S3_BUCKET,
      region: process.env.REACT_APP_REGION,
      accessKeyId: process.env.REACT_APP_ACCESS_KEY,
      secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
    };

    const byteString = atob(urlSnapshot.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ia], {
      type: 'image/png',
    });

    const file = new File(
      [blob],
      `image/${v1().toString().replace('-', '')}.png`
    );

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

    if (!(title && algorithm && announcer)) {
      Swal.fire('빈칸을 입력해 주세요');
      return;
    } else {
      uploadFile(file, config)
        .then((data) => {
          const updateTime = getTime();

          let body = {
            _id: selectedPreviewKey,
            title: title,
            algo_tag: algorithm.map((algo) => algo.value),
            announcer: announcer.value,
            extra_tag: extras.map((extra) => extra.value),
            type: 'image',
            teamMates: announcerOptions.map(
              (announcerOption) => announcerOption.value
            ),
            update_time: updateTime,
            canvas_data: ydocCanvasData,
            image_tn_ref: data.location, // data는 객체고 data.location에 링크 들어있다.
            user_email: persistEmail,
            nickname: persistUser,
          };

          const showLoading = function () {
            Swal.fire({
              title: '업데이트 중입니다',
              allowOutsideClick: false,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading();
              },
            });
          };

          showLoading();
          if (isUpdate) {
            axios
              .put('https://aglio-olio-api.shop/myroom/save', body)
              .then(function (res) {
                Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: '업데이트 성공!',
                  showConfirmButton: false,
                  timer: 2000,
                });
                if (exitSave === 1) {
                  setDocGCount(0);
                  navigate(-1);
                }
                onCancel();
              })
              .catch(function (err) {
                console.error(err);
                Swal.fire({
                  position: 'top',
                  icon: 'error',
                  title: '업데이트 실패',
                  showConfirmButton: false,
                  timer: 2000,
                });
              });
          } else {
            delete body['_id'];
            body['update_time'] = '-';
            body['save_time'] = updateTime;

            axios
              .post('https://aglio-olio-api.shop/myroom/new_data_save', body)
              .then(function (res) {
                Swal.fire({
                  position: 'top',
                  icon: 'success',
                  title: '새 데이터 저장 성공!',
                  showConfirmButton: false,
                  timer: 2000,
                  showLoaderOnConfirm: true,
                });
                if (exitSave === 1) {
                  setDocGCount(0);
                  navigate(-1);
                }
                onCancel();
              })
              .catch(function (err) {
                console.error(err);
                Swal.fire({
                  position: 'top',
                  icon: 'error',
                  title: '새 데이터 저장 실패',
                  showConfirmButton: false,
                  timer: 2000,
                });
              });
          }
        })
        .catch((err) => console.error(err));
    }
  };

  //취소 버튼 클릭시
  const handleClickCancel = () => {
    onCancel();
  };

  function onBtnClick(e) {
    if (e.target.innerText === '업데이트') setUpdate(true);
    else setUpdate(false);
  }

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      height: '55%',
      transform: 'translate(-50%, -50%)',
      border: 'none',
      borderRadius: '23px',
    },
  };

  return (
    <ReactModal isOpen={isOpen} style={modalStyles}>
      <XIcon
        class="inline-block w-5 h-5 stroke-current absolute right-5"
        style={{ cursor: 'pointer' }}
        onClick={handleClickCancel}
      />
      <div class="text-center text-2xl m-7">Update Your Study!</div>
      <form
        onSubmit={submitHandler}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <input
          type="text"
          placeholder={data.title}
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
          placeholder={data.announcer}
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
        <div class>
          <button
            type="submit"
            class="btn btn-success bg-neutral border-none w-24 float-right right-5 bottom-16 mx-2.5"
            onClick={onBtnClick}
          >
            업데이트
          </button>

          <button
            type="submit"
            class="btn btn-success bg-neutral border-none w-28 float-right right-5 bottom-16 mx-2.5"
            onClick={onBtnClick}
          >
            새로 만들기
          </button>
        </div>
      </form>
      <div className="category" />
    </ReactModal>
  );
};

export default UpdateStudy;
