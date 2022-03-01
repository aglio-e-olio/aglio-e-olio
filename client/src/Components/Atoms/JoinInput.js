import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeContext } from '../../Context/ContextProvider';

function JoinInput() {
  const [nametext, setNameText] = useState('');
  const [emailtext, setEmailText] = useState('');
  const [urltext, setUrlText] = useState('');

  const { joinUser, getEmail, addEmail, addUser, addLogin } = useContext(codeContext);

  const navigate = useNavigate();

  const onNameChange = (e) => {
    setNameText(e.target.value);
  };

  const onChange = (e) => {
    setEmailText(e.target.value);
  };

  const onUrlChange = (e) => {
    setUrlText(e.target.value);
  };

  const submitID = () => {
    addUser(nametext);
    addEmail(emailtext);
    addLogin(true);
    console.log(urltext);
    console.log(urltext.split('/').splice(3).join('/'));
    const url = urltext.split('/').splice(3).join('/');
    navigate(`/${url}`);
    
  };

  return (
    <div class="form-control">
      <input
        class="input input-bordered"
        onChange={onNameChange}
        value={nametext}
      />
      <label class="label">
        <span class="label-text">Email</span>
      </label>
      <input
        class="input input-bordered"
        onChange={onChange}
        value={emailtext}
      />
      <label class="label">
        <span class="label-text">url주소</span>
      </label>
      <input
        class="input input-bordered"
        onChange={onUrlChange}
        value={urltext}
      />
      <div class="form-control mt-6">
        <button class="btn btn-primary" onClick={submitID}>
          방에 들어가기
        </button>
      </div>
    </div>
  );
}

export default JoinInput;
