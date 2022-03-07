import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { v1 as uuid } from 'uuid';
import { codeContext } from '../Context/ContextProvider';
import './CreateRoom.css';
import MyInput from '../Components/Atoms/MyInput';
import LobbyCreate from '../Components/Atoms/LobbyCreate';
import LobbyHistory from '../Components/Atoms/LobbyHistory';

const CreateRoom = (props) => {
  const { persistUser, persistLogin, setExitSave } = useContext(codeContext);
  const login_info = localStorage.getItem('persistLogin');

  const navigate = useNavigate();
  function create() {
    setExitSave(0);
    const id = uuid();
    navigate(`/room/${id}`);
  }

  function history() {
    const userID = persistUser;
    navigate(`/history/${userID}`);
  }

  return (
    <div>
      {login_info ? (
        <div class="flex h-screen divide-x divide-solid">
          <LobbyCreate clickAction={create} buttonName={'CreateRoom'} />
          <LobbyHistory clickAction={history} buttonName={'History'} />
        </div>
      ) : (
        <div class="hero min-h-screen bg-base-200">
          <div class="flex-col hero-content lg:flex-row-reverse">
            <div class="text-center lg:text-left">
              <h1 class="text-5xl font-bold">Start now!</h1>
              <p class="py-6">
                코딩 테스트를 위한 알고리즘 스터디의 처음과 끝을 알리오
                올리오에서 경험해보세요!
              </p>
            </div>
            <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
              <div class="card-body">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">사용자 이름</span>
                  </label>
                  <MyInput />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRoom;
