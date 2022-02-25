import React, { useContext } from 'react';
import { codeContext } from '../../Context/ContextProvider';

function Preview() {
  const {selectedPreviewKey} = useContext(codeContext);
  return <div>{selectedPreviewKey}</div>;
}

export default Preview;
