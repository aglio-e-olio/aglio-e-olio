import React from 'react';
import styled from 'styled-components';

const StyledSave = styled.div`
  position : absolute;
  margin-top : 5px;
  margin-left: 1200px;
`;

const Record = () => {
  function save_record() {}

  return (
    <StyledSave>
      <button className="record-button" onClick={save_record}>
        Record
      </button>
    </StyledSave>
  );
};

export default Record;
