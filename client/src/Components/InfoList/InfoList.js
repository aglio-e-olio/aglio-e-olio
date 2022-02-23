import React, { useContext } from 'react';
import { codeContext } from '../../Context/ContextProvider';

const InfoList = () => {
  const { currentTag } = useContext(codeContext);

  return <div>Hello I'm Info! this is {currentTag}</div>;
};

export default InfoList;
