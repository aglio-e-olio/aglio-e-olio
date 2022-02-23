import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { v1 as uuid } from 'uuid';
import { codeContext } from '../Context/ContextProvider';
import './CreateRoom.css';
import MyInput from '../Components/Atoms/MyInput';

const CreateRoom = (props) => {
  const { nickName, joinUser } = useContext(codeContext);

  const navigate = useNavigate();
  function create() {
    const id = uuid();
    navigate(`/room/${id}`);
  }

  function history() {
    const userID = nickName;
    navigate(`/history/${userID}`);
  }



  return (
    <div>
      {nickName ? (
        <div>
        <button className="create-room-button" onClick={create}>
          Create Room
        </button>
        <button class='btn' onClick={history}>
          My history
        </button>
        </div>
      ):(
        <div>
          <h1>이름을 입력하세요</h1>
          <MyInput />
          
        </div>
      )}
    
    </div>
  );
};

export default CreateRoom;
