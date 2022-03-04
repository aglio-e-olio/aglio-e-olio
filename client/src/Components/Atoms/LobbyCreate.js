import React from 'react';

const LobbyCreate = ({ clickAction, buttonName }) => {
  return (
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content flex-col">
        <img
          src="img/studying_collaborative.jpg"
          class="max-w-md rounded-lg shadow-2xl"
        />
        <div class="flex-row">
          <h1 class="text-5xl font-bold">실시간 스터디</h1>
          <p class="py-6 whitespace-pre-line">
            친구들을 초대해서 함께 코드 에디터와 화이트보드를 이용해서 코딩
            스터디를 진행해보세요! <br/>코드 실행결과도 이곳에서 바로
            확인가능하답니다.
          </p>
          <button class="btn btn-outline btn-info" onClick={clickAction}>
            {buttonName}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyCreate;
