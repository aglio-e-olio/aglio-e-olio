import React from 'react';
import './CreateRoom.css';
import JoinInput from '../Components/Atoms/JoinInput';
const JoinRoom = (props) => {
  return (
    <div class="hero min-h-screen bg-base-200">
      <div class="flex-col hero-content lg:flex-row-reverse">
        <div class="text-center lg:text-left">
          <h1 class="text-5xl font-bold">Start now!</h1>
          <p class="py-6">
            코딩 테스트를 위한 알고리즘 스터디의 처음과 끝을 알리오 올리오에서
            경험해보세요!
          </p>
        </div>
        <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div class="card-body">
            <div class="form-control">
              <label class="label">
                <span class="label-text">사용자 이름</span>
              </label>
              <JoinInput />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
