import React from 'react';
import url from 'socket.io-client/lib/url';

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
          <h1 class="mb-5 text-5xl font-bold">나의 공부기록</h1>
          <p class="mb-5 whitespace-pre-line">
          함께 공부하며 저장했던 스냅샷과 녹화 기록을 나만의 코딩 테스트
            라이브러리에서 확인해보세요! <br/>이전 내용에서 수정하고 싶은 부분이
            있다면 언제든지 가능합니다.
          </p>
          <button class="btn btn-info" onClick={clickAction}>{buttonName}</button>
        </div>
      </div>
    </div>
  );
};

export default LobbyHistory;
