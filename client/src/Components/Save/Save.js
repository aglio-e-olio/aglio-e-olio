import React from 'react';
import styled from 'styled-components';

const StyledSave = styled.div`
margin-left : 900px;
`;

const Save = () => {
  function save_snapshot() {}

  return (
    <StyledSave>
      <button className="save-snapshot-button" onClick={save_snapshot}>
        Save
      </button>
    </StyledSave>
  );
};

export default Save;
