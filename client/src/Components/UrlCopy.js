import React from 'react';
import UrlCopyIcon from './Atoms/UrlCopyIcon';
import Swal from 'sweetalert2'

function UrlCopy() {
  console.log('UrlCopy 안');
  const doCopy = (text) => {
    // 흐음 1.
    if (navigator.clipboard) {
      // (IE는 사용 못하고, 크롬은 66버전 이상일때 사용 가능합니다.)
      navigator.clipboard
        .writeText(text)
        .then(() => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: '클립보드에 복사되었습니다!',
            showConfirmButton: false,
            timer: 1500
          })
        })
        .catch(() => {
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: '다시 복사를 시도하세요',
            showConfirmButton: false,
            timer: 1500
          })
        });
    } else {
      // 흐름 2.
      if (!document.queryCommandSupported('copy')) {
        return Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: '복사를 지원하지 않는 브라우저 입니다.',
          showConfirmButton: false,
          timer: 1500
        })
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
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: '클립보드에 복사되었습니다!',
        showConfirmButton: false,
        timer: 1500
      })
    }
  };

  const url = window.document.location.href;

  return (
    <button class="btn btn-ghost mx-3" onClick={() => doCopy(url)}>
      <UrlCopyIcon />
    </button>
  );
}

export default UrlCopy;
