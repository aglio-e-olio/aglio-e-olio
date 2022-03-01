import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeContext } from '../../Context/ContextProvider';

function MyInput() {
  const [nametext, setNameText] = useState('');
  const [emailtext, setEmailText] = useState('');
  const { joinUser, getEmail, addEmail, addUser, addLogin } = useContext(codeContext);

  const navigate = useNavigate();

  const onNameChange = (e) => {
    setNameText(e.target.value);
  };

  const onChange = (e) => {
    setEmailText(e.target.value);
  }

  const submitID = () => {
    addUser(nametext);
    addEmail(emailtext);
    addLogin(true);
    navigate('/');
  };

  return (
    <div class="form-control">
      <input class="input input-bordered" onChange={onNameChange} value={nametext} />
      <label class="label">
        <span class="label-text">Email</span>
      </label>
      <input class="input input-bordered" onChange={onChange} value={emailtext} />
      <div class="form-control mt-6">
        <button class="btn btn-primary" onClick={submitID}>
          시작하기!
        </button>
      </div>
    </div>
  );
}

export default MyInput;
