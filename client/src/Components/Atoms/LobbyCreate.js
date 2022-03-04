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
          <p class="mb-5">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
          <button class="btn btn-info" onClick={clickAction}>{buttonName}</button>
        </div>
      </div>
    </div>
  );
};

export default LobbyCreate;
