import React, { useContext } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { codeContext } from '../../Context/ContextProvider';

const SelfHeader = ({ handleSave }) => {
  const navigate = useNavigate();
  const { setDocGCount, setExitSave, getCompileResult } =
    useContext(codeContext);

  function endSelfStudy() {
    Swal.fire({
      title: '셀프 스터디 룸으로 이동합니다.\n데이터를 저장해주세요!',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Save',
      denyButtonText: `Don't save`,
    }).then((result) => {
      getCompileResult('');
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        setExitSave(1);
        handleSave();
        // Swal.fire('Saved!', '', 'success')
      } else if (result.isDenied) {
        Swal.fire('변경사항이 기록되지 않습니다.', '', 'info').then(
          (result) => {
            setDocGCount(0);
            navigate(-1);
          }
        );
      }
    });
  }

  return (
    <div class="navbar bg-neutral z-10 h-12">
      <div class="navbar-start">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class="btn btn-ghost" onClick={endSelfStudy}>
              <svg
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                width="32px"
                height="32px"
                viewBox="0 2 24 24"
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
        </ul>
      </div>
      <div class="navbar-center lg:flex">
        <span
          style={{ fontFamily: 'Pacifico', fontSize: '25px', color: 'white' }}
        >
          Aglio Olio
        </span>
      </div>
      <div class="navbar-end">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class="btn btn-ghost mx-3" onClick={handleSave}>
              <svg
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                width="32px"
                height="32px"
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
        </ul>
      </div>
    </div>
  );
};

export default SelfHeader;
