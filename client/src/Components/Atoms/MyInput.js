import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeContext } from '../../Context/ContextProvider';

function MyInput() {
  const [text, setText] = useState('');
  const {joinUser} = useContext(codeContext);

  const navigate = useNavigate();

  const onChange = (e) => {
    setText(e.target.value);
  };

  const submitID = () => {
      joinUser(text);
      navigate('/');
  }


  return (
    <div class='form-control'>
      <input class='input input-bordered' onChange={onChange} value={text}  />
      
      <div class="form-control mt-6">
          <button class="btn btn-primary" onClick={submitID}>시작하기!</button>
        </div>
    </div>
  );
}

export default MyInput;