import React from 'react';
import ReactModal from 'react-modal';
import './Save.css';
// import { useLine } from '../../hooks/useLine';
// import { useLines } from '../../hooks/useLines';

const Save = ({ isOpen, onSubmit, onCancel, yLines, doc }) => {
  // console.log(yLines.toArray()[0]);
  // //extend 해서 받아오는 건가?
  // Object.values(yLines).forEach((object) => {
  //   console.log(object);
  // })
  console.log(yLines.toJSON());
  console.log(yLines.toArray());


  const handleClickSubmit = () => {
    onSubmit();
  };

  const handleClickCancel = () => {
    onCancel();
  };
  return (
    <ReactModal isOpen={isOpen}>
      <div>세이브 모달 입니다.</div>
      <div>
        <button class="btn btn-success" onClick={handleClickSubmit}>
          저장
        </button>
        <button class="btn btn-error" onClick={handleClickCancel}>
          취소
        </button>
      </div>
    </ReactModal>
  );
};

export default Save;
