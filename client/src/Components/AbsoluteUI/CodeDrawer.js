import React from 'react';

const CodeDrawer = ({isOpen, setIsOpen}) => {
  return (
    <main
      className={
        " fixed top-20 overflow-hidden z-10 bg-gray-900 bg-opacity-0 inset-0 transform ease-in-out " +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0  "
          : " transition-all delay-500 opacity-0 translate-x-full  ")
      }
    >
      <section
        className={
          " w-screen max-w-lg right-0 absolute bg-white h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform  " +
          (isOpen ? " translate-x-0 " : " translate-x-full ")
        }
      >
        <article className="relative w-screen max-w-lg pb-10 flex flex-col space-y-6 overflow-y-scroll h-full">
          <header className="p-4 font-bold text-lg">Header</header>
          <button
            class="btn absolute bottom-20 right-4 z-30"
          >
            Run
          </button>
          <textarea
            className="w-full border-solid border-2 absolute bottom-2"
            placeholder={
              '코드 결과 출력 창입니다. \n현재 Javascript만 지원중입니다.'
            }
          />
        </article>
      </section>
      <section
        className=" w-screen h-full cursor-pointer "
        onClick={() => {
          setIsOpen(false);
        }}
      ></section>
    </main>
  );
};

export default CodeDrawer;
