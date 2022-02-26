import React from 'react';
import TagSort from '../Components/TagSort/TagSort';
import Navbar from '../Components/Atoms/Navbar';
import InfoList from '../Components/InfoList/InfoList';
import SplitPane from 'react-split-pane';
import './History.css';
import Preview from '../Components/Preview/Preview';

const History = () => {
  return (
    <div>
      <Navbar />
      <SplitPane split="vertical" minSize={100} defaultSize="20%">
        <TagSort />
        <SplitPane split="vertical" defaultSize="50%">
          <InfoList />
          <Preview />
        </SplitPane>
      </SplitPane>
    </div>
  );
};

export default History;
