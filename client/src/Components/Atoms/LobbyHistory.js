import React from 'react';

const LobbyHistory = ({ clickAction, buttonName }) => {
  return (
    <div
      class="hero min-h-screen"
      style={{
        background: 'url(/img/history_library.jpg)',
        backgroundSize: 'cover',
      }}
    >
      <div class="hero-overlay bg-opacity-60"></div>
      <div class="hero-content text-center text-neutral-content">
        <div class="max-w-md">
          <h1 class="mb-5 text-5xl font-bold">셀프 스터디룸</h1>
          <p class="mb-5 text-xl whitespace-pre-line text-gray-300">
            저장했던 공부 데이터와 녹화 기록을 <br />
            나만의 공간에서 복습해 보세요!
          </p>
          <button
            class="btn btn-active btn-lg btn-neutral btn-neutral border-white"
            onClick={clickAction}
          >
            {buttonName}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyHistory;
