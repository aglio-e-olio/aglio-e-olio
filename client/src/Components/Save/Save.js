import React from 'react';
import ReactModal from 'react-modal';
import './Save.css';

const Save = ({ isOpen, onSubmit, onCancel }) => {
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
