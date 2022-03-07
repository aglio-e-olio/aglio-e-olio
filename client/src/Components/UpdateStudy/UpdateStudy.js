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
import { useNavigate } from 'react-router-dom';

const UpdateStudy = ({ isOpen, onCancel, doc, data }) => {
  console.log(data, "data 있나?")
  dotenv.config();

  const [title, setTitle] = useState(data.title);
  const [announcer, setAnnouncer] = useState(data.announcer);
  const navigate = useNavigate();
  const [metaData, setMetaData] = useState([]);

  const getData = async (selectedPreviewKey) => {
    try {
      const res = await axios({
        method: "GET",
        url: 'https://aglio-olio-api.shop/myroom/preview',
        params: { _id: selectedPreviewKey },
      })
      setMetaData(prev => prev = res.data)
    } catch(err) {
      console.error(err)
    }
  }
 
  useEffect(() => {
    getData(selectedPreviewKey)
  }, [])

  let algo_array = [];
  if (data && data.algo_tag) {
    data.algo_tag.map((tag) => {
      let algo_object = {};
      algo_object.label = tag;
      algo_object.value = tag;
      algo_array.push(algo_object);
    });
  }
  const [algorithm, setAlgorithm] = useState(algo_array && [...algo_array]);

  let extra_array = [];
  if (data && data.extra_tag) {
    data.extra_tag.map((tag) => {
      let extra_object = {};
      extra_object.label = tag;
      extra_object.value = tag;
      extra_array.push(extra_object);
    });
  }
  const [extras, setExtras] = useState(extra_array && [...extra_array]);

  const { exitSave, urlSnapshot, persistEmail, persistUser, selectedPreviewKey, setDocGCount } =
    useContext(codeContext);

  //여기서 모달창이 계속 렌더링 되는 이유 해결하기!
  console.log('SAVE 컴포넌트 안!');

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

    if (!(title && algorithm && announcer)) {
      alert('빈칸을 입력해 주세요.');
      return;
    } else {
      uploadFile(file, config)
        .then((data) => {
          let updateTime = new Date();
          let body = {
            _id: selectedPreviewKey,
            title: title,
            algo_tag: algorithm.map((algo) => algo.value),
            announcer: announcer.value,
            extra_tag: extras.map((extra) => extra.value),
            type: "image",
            teemMates: announcerOptions.map(
              (announcerOption) => announcerOption.value
            ),
            update_time: updateTime,
            canvas_data: ydocCanvasData,
            image_tn_ref: data.location, // data는 객체고 data.location에 링크 들어있다.
            user_email: persistEmail,
            nickname: persistUser,
          };

          axios
            .put('https://aglio-olio-api.shop/myroom/save', body)
            .then(function (res) {
              console.log(res);
              alert('post 성공');
              if (exitSave === 1) {
                setDocGCount(0);
                navigate(-1);
              }
              // onCancel();
            })
            .catch(function (err) {
              console.error(err);
              alert('post 실패');
              // onCancel();
            });
        })
        .catch((err) => console.error(err));
    }
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
        <button type="submit" class="btn btn-success bg-neutral">
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

export default UpdateStudy;
