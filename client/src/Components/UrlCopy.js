import React from 'react';
import UrlCopyIcon from './Atoms/UrlCopyIcon';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function UrlCopy() {
  console.log('UrlCopy 안');
  const doCopy = (text) => {
    // 흐음 1.
    if (navigator.clipboard) {
      // (IE는 사용 못하고, 크롬은 66버전 이상일때 사용 가능합니다.)
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success("클립보드 복사 성공!", {
            autoClose: 2000,
            position: toast.POSITION.TOP_RIGHT
          });
        })
        .catch(() => {
          toast.error("클립보드 복사 실패!", {
            autoClose: 2000,
            position: toast.POSITION.TOP_RIGHT
          });
        });
    } else {
      // 흐름 2.
      if (!document.queryCommandSupported('copy')) {
        return toast.error("복사하기가 지원되지 않는 브라우저 입니다", {
          autoClose: 2000,
          position: toast.POSITION.TOP_RIGHT
        });
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
      toast.success("클립보드 복사 성공!", {
        autoClose: 1000,
        position: toast.POSITION.TOP_RIGHT
      });
    }
  };

  const url = window.document.location.href;

  return (
    <>
    <button class="btn btn-ghost mx-3" onClick={() => doCopy(url)}>
      <UrlCopyIcon />
    </button>
    <ToastContainer />
    </>
  );
}

export default UrlCopy;
