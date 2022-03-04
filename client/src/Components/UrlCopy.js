import React from 'react';

function UrlCopy() {
  console.log('UrlCopy 안');
  const doCopy = (text) => {
    // 흐음 1.
    if (navigator.clipboard) {
      // (IE는 사용 못하고, 크롬은 66버전 이상일때 사용 가능합니다.)
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert('클립보드에 복사되었습니다.');
        })
        .catch(() => {
          alert('복사를 다시 시도해주세요.');
        });
    } else {
      // 흐름 2.
      if (!document.queryCommandSupported('copy')) {
        return alert('복사하기가 지원되지 않는 브라우저입니다.');
      }

      // 흐름 3.
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.top = 0;
      textarea.style.left = 0;
      textarea.style.position = 'fixed';

      // 흐름 4.
      document.body.appendChild(textarea);
      // focus() -> 사파리 브라우저 서포팅
      textarea.focus();
      // select() -> 사용자가 입력한 내용을 영역을 설정할 때 필요
      textarea.select();
      // 흐름 5.
      document.execCommand('copy');
      // 흐름 6.
      document.body.removeChild(textarea);
      alert('클립보드에 복사되었습니다.');
    }
  };

  const url = window.document.location.href;

  return (
    <button class="btn btn-ghost mx-3" onClick={() => doCopy(url)}>
      <svg
        width="32px"
        height="32px"
        viewBox="0 2 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby="clipIconTitle"
        stroke="#ffffff"
        stroke-width="1.5"
        stroke-linecap="square"
        stroke-linejoin="miter"
        fill="none"
        color="#ffffff"
      >
        {' '}
        <title id="clipIconTitle">Attachment (paper clip)</title>{' '}
        <path d="M7.93517 13.7796L15.1617 6.55304C16.0392 5.67631 17.4657 5.67631 18.3432 6.55304C19.2206 7.43052 19.2206 8.85774 18.3432 9.73522L8.40091 19.5477C6.9362 21.0124 4.56325 21.0124 3.09854 19.5477C1.63382 18.0837 1.63382 15.7093 3.09854 14.2453L12.9335 4.53784C14.984 2.48739 18.3094 2.48739 20.3569 4.53784C22.4088 6.58904 22.4088 9.91146 20.3584 11.9619L13.239 19.082" />{' '}
      </svg>
    </button>
  );
}

export default UrlCopy;
