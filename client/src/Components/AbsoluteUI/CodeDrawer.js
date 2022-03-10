import React, { useContext, useEffect, useRef } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import CodeEditor from '../CodeEditor/Editor';
import io from 'socket.io-client';
import ReactToolTip from 'react-tooltip';

const CodeDrawer = ({ isOpen, setIsOpen, doc, provider, socket, isSelfStudy }) => {
  const { codes, extractCode, compileResult } = useContext(codeContext);

  function sendCode() {
    let text = doc.getText('codemirror')
    let sendingData = text.toString();
    socket.emit('code compile', { sendingData, isSelfStudy: isSelfStudy });
  }

  return (
    <section
      className={
        ' rounded-box w-screen max-w-lg top-20 right-0 absolute bg-white bg-opacity-80 h-3/4 shadow-xl delay-400 duration-500 ease-in-out transition-all transform  ' +
        (isOpen ? ' translate-x-0 z-50' : ' translate-x-full')
      }
    >
      <article className="indicator relative w-screen max-w-lg pb-10 flex flex-col space-y-6 overflow-y-scroll h-full">
        <button
          class="btn btn-ghost btn-xs w-8 top-1/3 -left-8 h-24 fixed z-30"
          onClick={() => setIsOpen(false)}
          data-tip ="코드편집기를 닫습니다"
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={4}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          ) : (
            <svg></svg>
          )}
        </button>
        <button
          class="tab tab-lifted tab-active fixed -bottom-2 right-4 z-30"
          onClick={sendCode}
          data-tip = "코드를 실행합니다"
        >
          Run
        </button>
        <CodeEditor doc={doc} provider={provider} />
        <textarea
          className="textarea textarea-info w-full fixed -bottom-20"
          value={compileResult}
          placeholder={
            '코드 결과 출력 창입니다. \n현재 Javascript만 지원중입니다.'
          }
        />
      </article>
    </section>
  );
};

export default CodeDrawer;
