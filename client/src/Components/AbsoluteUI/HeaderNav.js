import React, { useContext, useState } from 'react';
import MyAudio from '../Audio/MyAudio';
import Audio from '../Audio/Audio';
import UrlCopy from '../UrlCopy';
import { useNavigate } from 'react-router-dom';
import { codeContext } from '../../Context/ContextProvider';
import Swal from 'sweetalert2';
import ReactTooltip from 'react-tooltip';
import { VideoCameraIcon, StopIcon } from '@heroicons/react/outline';

const HeaderNav = ({
  peerAudios,
  handleSave,
  startRecord,
  stopRecord,
  exit,
}) => {
  const navigate = useNavigate();
  const { setDocGCount, setExitSave } = useContext(codeContext);
  const [isRecord, setIsRecord] = useState(false);

  function endStudy() {
    Swal.fire({
      title:
        '로비로 이동합니다. \n저장하지 않은 스터디 영상과 \n스냅샷은 사라집니다. \n괜찮습니까?',
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
        Swal.fire('변경사항이 기록되지 않습니다.', '', 'info').then(
          (result) => {
            setDocGCount(0);
            exit();
            navigate('/');
          }
        );
      }
    });
  }

  function handleStart() {
    setIsRecord(true);
    startRecord();
  }

  function handleStop() {
    setIsRecord(false);
    console.log(isRecord, 'isRecord?');
    stopRecord();
  }

  return (
    <div class="navbar bg-neutral z-10 h-12">
      <div class="navbar-start">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button
              class="btn btn-ghost"
              onClick={endStudy}
              data-tip="메인화면으로 이동합니다."
            >
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
        <span
          class=""
          style={{ fontFamily: 'Pacifico', fontSize: '30px', color: 'white' }}
        >
          Aglio Olio
        </span>
      </div>
      <div class="navbar-end">
        <ul class="menu menu-horizontal p-0">
          <li>
            {isRecord ? (
              <button
                class="btn btn-ghost mx-3"
                onClick={handleStop}
                data-tip="녹화를 멈춥니다"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
              </button>
            ) : (
              <button
                class="btn btn-ghost mx-3"
                onClick={handleStart}
                data-tip="녹화를 시작합니다"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
          </li>
          <li>
            <button
              class="btn btn-ghost mx-3"
              onClick={handleSave}
              data-tip="화면을 저장합니다"
            >
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
      <ReactTooltip />
    </div>
  );
};

export default HeaderNav;
