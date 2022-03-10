import React, { useState } from 'react';
import Navbar from '../Components/Atoms/Navbar';
import InfoCards from '../Components/InfoCards/InfoCards';
import InfoTable from '../Components/InfoTable/InfoTable';
import SplitPane from 'react-split-pane';
import './History.css';
import Preview from '../Components/Preview/Preview';
import Search from '../Components/Search/Search';
import { useNavigate } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/outline';

const History = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('Table');

  // function handleView() {
  //   if
  //   setIsTable((prev) => !prev);
  // }
  return (
    <>
      <div class="bg-neutral relative" style={{ height: '150px' }}>
        <span class="m-auto left-0 absolute">
          <button class="btn btn-square btn-ghost relative mt-3 mx-5 z-10">
            <HomeIcon
              class="inline-block w-8 h-8 stroke-current text-white"
              onClick={() => navigate(-1)}
            />
          </button>
          <span
            class=""
            style={{ fontFamily: 'Pacifico', fontSize: '30px', color: 'white' }}
          >
            Aglio Olio
          </span>
        </span>

        <Search />
        <div
          class="inline-flex rounded-md shadow-sm m-3 my-5 absolute top-24 left-0"
          role="group"
        >
          <button
            type="button"
            class="py-0.5 px-3 text-sm font-medium text-gray-900 bg-white rounded-l-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            onClick={(e) => setView((prev) => e.target.innerText)}
          >
            Table
          </button>
          <button
            type="button"
            class="py-0.5 px-3 text-sm font-medium text-gray-900 bg-white rounded-r-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            onClick={(e) => setView((prev) => e.target.innerText)}
          >
            Cards
          </button>
        </div>
      </div>
      <SplitPane
        split="vertical"
        minSize="550px"
        style={{ overflow: 'hidden', height: '80vh' }}
      >
        <div>{view === 'Table' ? <InfoTable /> : <InfoCards />}</div>
        <Preview />
      </SplitPane>
      <footer
        class="footer items-center p-8 bg-neutral text-neutral-content"
        style={{ position: 'relative', top: '80.1vh' }}
      ></footer>
    </>
  );
};

export default History;
