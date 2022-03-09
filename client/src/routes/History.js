import React, { useState } from 'react';
import Navbar from '../Components/Atoms/Navbar';
import InfoCards from '../Components/InfoCards/InfoCards';
import InfoTable from '../Components/InfoTable/InfoTable'
import SplitPane from 'react-split-pane';
import './History.css';
import Preview from '../Components/Preview/Preview';
import Search from '../Components/Search/Search';

const History = () => {
  // const { persistEmail, currentTag, selectedPreviewKey } =
  //   useContext(codeContext); // 에러처리 위함

  const [isTable, setIsTable] = useState(true)

  function handleView(){
    setIsTable(prev => !prev)
  }
  return (
    // 에러 핸들링 -> 클라이언트가 잘못된 요청 반복해서 보냄
    // <div>
    //   <Navbar />
    //   <SplitPane split="vertical" minSize={100} defaultSize="20%">
    //     <SplitPane split="vertical" defaultSize="50%">
    //       {(currentTag && persistEmail) && <InfoCards />}
    //       {selectedPreviewKey && <Preview />}
    //     </SplitPane>
    //   </SplitPane>
    // </div>
    <div style={{height:'100vh'}}>
      <Navbar />
      <div class="flex flex-col w-full border-opacity-50" style={{height: 150}}>
        <Search />
      </div>
      <div class="divider"></div>
      <SplitPane split="vertical" minSize="550px" >
        <div class='h-36'>
        <button class="btn btn-sm flex-left mb-2.5" onClick={handleView}>{isTable?"Table":" Cards"}</button>
        {isTable?<InfoTable />:<InfoCards />}
        </div>
        <Preview />
      </SplitPane>
    </div>
  );
};

export default History;
