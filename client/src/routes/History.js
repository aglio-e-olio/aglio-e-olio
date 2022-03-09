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
  const [view, setView] = useState('table');

  // function handleView() {
  //   if 
  //   setIsTable((prev) => !prev);
  // }
  return (
    <>
      <div class="bg-neutral" style={{ height: '150px' }}>
        <button class="btn btn-square btn-ghost left-0 fixed m-3 mx-5">
          <HomeIcon
            class="inline-block w-8 h-8 stroke-current text-white"
            onClick={() => navigate(-1)}
          />
        </button>
        <Search />
        <div class="btn-group ">
          <input
            type="radio"
            name="options"
            data-title="Table"
            class="btn btn-sm"
            onClick={(e) => setView((prev) => e.dataset.title)}
            checked
          />
          <input
            type="radio"
            name="options"
            data-title="Cards"
            class="btn btn-sm"
            onClick={(e) => setView((prev) => e.dataset.title)}
          />
        </div>
      </div>
      <div>
        <SplitPane
          split="vertical"
          minSize="550px"
        >
          <div class="h-36">
            {/* <button class="btn btn-sm flex-left mb-2.5" onClick={handleView}>
            {isTable ? 'Table' : ' Cards'}
          </button> */}
            {view === 'table' ? <InfoTable /> : <InfoCards />}
          </div>
          <Preview />
        </SplitPane>
      </div>
      {/* <footer class="footer p-5 bg-neutral text-neutral-content"></footer> */}
    </>
  );
};

export default History;
