import React from 'react';

const LobbyHistory = ({ clickAction, buttonName }) => {
  return (
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content flex-col">
        <img
          src="img/history_library.jpg"
          class="max-w-md rounded-lg shadow-2xl"
        />
        <div class="flex-row">
          <h1 class="text-5xl font-bold">나의 공부기록</h1>
          <p class="py-6 whitespace-pre-line">
            함께 공부하며 저장했던 스냅샷과 녹화 기록을 나만의 코딩 테스트
            라이브러리에서 확인해보세요! <br/>이전 내용에서 수정하고 싶은 부분이
            있다면 언제든지 가능합니다.
          </p>
          <button class="btn btn-outline btn-info" onClick={clickAction}>
            {buttonName}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyHistory;
