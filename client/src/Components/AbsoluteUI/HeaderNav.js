import React from 'react';
import MyAudio from '../Audio/MyAudio';
import Audio from '../Audio/Audio';
import UrlCopy from '../UrlCopy';
import { useNavigate } from 'react-router-dom';

const HeaderNav = ({peers, handleSave}) => {
  const navigate = useNavigate();
  return (
    <div class="navbar bg-neutral z-111 rounded-box m-1">
      <div class="navbar-start">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class='btn btn-info' onClick={() => navigate(-1)}>X</button>
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
              </li>)
          })}
        </ul>
      </div>
      <div class="navbar-center lg:flex">
        <a class="btn btn-primary normal-case text-xl">AO</a>
      </div>
      <div class="navbar-end">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class="btn btn-secondary mx-3">Record</button>
          </li>
          <li>
            <button class="btn btn-secondary mx-3" onClick={handleSave}>Snap Save</button>
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
