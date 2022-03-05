import React from 'react';
import MyAudio from '../Audio/MyAudio';
import Audio from '../Audio/Audio';
import UrlCopy from '../UrlCopy';
import { useNavigate } from 'react-router-dom';

const HeaderNav = ({ peers, handleSave }) => {
  const navigate = useNavigate();
  return (
    <div class="navbar bg-neutral z-111 rounded-box m-1 h-4">
      <div class="navbar-start">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class="btn btn-ghost" onClick={() => navigate(-1)}>
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
          <li>
            <MyAudio />
          </li>
          <li>
            <MyAudio />
          </li>
          {peers.map((peer_info, index) => {
            return (
              <li>
                <Audio key={index} peer_info={peer_info} />
              </li>
            );
          })}
        </ul>
      </div>
      <div class="navbar-center lg:flex">
        <a class="btn btn-ghost normal-case text-xl">AO</a>
      </div>
      <div class="navbar-end">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class="btn btn-secondary mx-3">Record</button>
          </li>
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
          <li>
            <UrlCopy />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderNav;
