import React from 'react';

const LobbyCreate = ({ clickAction, buttonName }) => {
  return (
    <div
      class="hero min-h-screen"
      style={{
        background: 'url(/img/studying_collaborative.jpg)',
        backgroundSize: 'cover',
      }}
      >
      <div class="hero-overlay bg-opacity-60"></div>
      <div class="hero-content text-center text-neutral-content">
        <div class="max-w-md">
          <h1 class="mb-5 text-5xl font-bold">실시간 스터디룸</h1>
          <p class="mb-5 whitespace-pre-line">
          친구들을 초대해서 함께 코드 에디터와 화이트보드를 <br/>이용해서 코딩
            스터디를 진행해보세요! <br/>코드 실행결과도 이곳에서 바로
            확인가능하답니다.
          </p>
          <button class="btn btn-active btn-lg btn-info" onClick={clickAction}>{buttonName}</button>
        </div>
      </div>
    </div>
  );
};

export default LobbyCreate;
