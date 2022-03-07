import React, { useContext } from 'react';
import MyAudio from '../Audio/MyAudio';
import Audio from '../Audio/Audio';
import UrlCopy from '../UrlCopy';
import { useNavigate } from 'react-router-dom';
import { codeContext } from '../../Context/ContextProvider';
import Swal from 'sweetalert2';
import ReactTooltip from "react-tooltip";

const HeaderNav = ({ peerAudios, handleSave, startRecord, stopRecord }) => {
  const navigate = useNavigate();
  const {setDocGCount, setExitSave} = useContext(codeContext);
  
  function endStudy() {
    Swal.fire({
      title: '로비로 이동합니다. 저장하지 않은 스터디 영상과 스냅샷은 사라집니다. 괜찮습니까?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Save',
      denyButtonText: `Don't save`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        setExitSave(1);
        handleSave();
        // Swal.fire('Saved!', '', 'success')
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info').then((result) =>{
          setDocGCount(0);
          navigate('/');
        })
      }
    })
    
  }

  return (
    <div class="navbar bg-neutral z-10 h-12">
      <div class="navbar-start">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class="btn btn-ghost" onClick={endStudy} data-tip = "클릭시 메인화면으로 이동합니다.">
              <svg
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                width="28px"
                height="28px"
                viewBox="0 0 24 24"
                aria-labelledby="closeIconTitle"
                stroke="#ffffff"
                stroke-width="1.5"
                stroke-linecap="square"
                stroke-linejoin="miter"
                fill="none"
                color="#ffffff"
              >
                {' '}
                <title id="closeIconTitle">Close</title>{' '}
                <path d="M6.34314575 6.34314575L17.6568542 17.6568542M6.34314575 17.6568542L17.6568542 6.34314575" />{' '}
              </svg>
            </button>
          </li>
          <li>
            <MyAudio />
          </li>
          {Array.from(peerAudios.keys()).map((id) => {
            return (
              <li>
                <Audio key={id} peerAudio={peerAudios.get(id)} />
              </li>
            );
          })}
        </ul>
      </div>
      <div class="navbar-center lg:flex">
        <a class="btn btn-ghost normal-case text-xl" data-tip = "알리오 올리오 입니다.">AO</a>
      </div>
      <div class="navbar-end">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class="btn btn-secondary mx-3" onClick={startRecord} data-tip = "클릭시 녹화를 시작합니다">Record Start</button>
          </li>
          <li>
            <button class="btn btn-secondary mx-3" onClick={stopRecord} data-tip = "클릭시 녹화를 멈춥니다">Record Stop</button>
          </li>
          <li>
            <button class="btn btn-ghost mx-3" onClick={handleSave} data-tip = "클릭시 화면을 저장합니다">
              <svg
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                width="28px"
                height="28px"
                viewBox="0 2 24 24"
                aria-labelledby="downloadIconTitle"
                stroke="#ffffff"
                stroke-width="1.5"
                stroke-linecap="square"
                stroke-linejoin="miter"
                fill="none"
                color="#ffffff"
              >
                {' '}
                <title id="downloadIconTitle">Download</title>{' '}
                <path d="M12,3 L12,16" /> <polyline points="7 12 12 17 17 12" />{' '}
                <path d="M20,21 L4,21" />{' '}
              </svg>
            </button>
          </li>
          <li>
            <UrlCopy />
          </li>
        </ul>
      </div>
    </div>
    
  );
};

export default HeaderNav;
