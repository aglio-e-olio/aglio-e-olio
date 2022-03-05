import React, { useContext, useEffect, useRef } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import CodeEditor from '../CodeEditor/Editor';
import io from 'socket.io-client';

const CodeDrawer = ({ isOpen, setIsOpen, doc, provider }) => {
  const { codes, roomInfo, compileResult } = useContext(codeContext);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect('/');
  }, []);

  function sendCode() {
    socketRef.current.emit('code compile', { codes, roomInfo });
  }

  return (
    <main
      className={
        ' fixed top-20 overflow-hidden z-10 bg-gray-900 bg-opacity-0 inset-0 transform ease-in-out ' +
        (isOpen
          ? ' transition-opacity opacity-100 duration-500 translate-x-0  '
          : ' transition-all delay-500 opacity-0 translate-x-full  ')
      }
    >
      <section
        className={
          ' w-screen max-w-lg right-0 absolute bg-white h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform  ' +
          (isOpen ? ' translate-x-0 ' : ' translate-x-full ')
        }
      >
        <article className="relative w-screen max-w-lg pb-10 flex flex-col space-y-6 overflow-y-scroll h-full">
          <button
            class="btn btn-secondary btn-xs w-8 top-1/3 left-0 fixed z-30"
            onClick={() => setIsOpen(false)}
          >
            <svg
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              aria-labelledby="chevronRightIconTitle"
              stroke="#ffffff"
              stroke-width="5"
              stroke-linecap="square"
              stroke-linejoin="miter"
              fill="none"
              color="#ffffff"
            >
              {' '}
              <title id="chevronRightIconTitle">Chevron Right</title>{' '}
              <polyline points="10 6 16 12 10 18 10 18" />{' '}
            </svg>
          </button>
          <button class="btn fixed bottom-20 right-4 z-30" onClick={sendCode}>
            Run
          </button>
          <CodeEditor doc={doc} provider={provider} />
          <textarea
            className="w-full border-solid border-2 fixed bottom-2"
            value={compileResult}
            placeholder={
              '코드 결과 출력 창입니다. \n현재 Javascript만 지원중입니다.'
            }
          />
        </article>
      </section>
    </main>
  );
};

export default CodeDrawer;
