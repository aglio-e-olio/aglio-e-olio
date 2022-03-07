import React, { useContext } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import { useNavigate } from 'react-router-dom';
import { DotsHorizontalIcon, XIcon } from '@heroicons/react/outline';

const Navbar = () => {
  const { persistUser } = useContext(codeContext);
  const navigate = useNavigate();

  return (
    <div class="navbar bg-base-100">
      <div class="flex-none">
        <button class="btn btn-square btn-ghost">
          <XIcon class="inline-block w-5 h-5 stroke-current" onClick = {() => navigate(-1)} />
        </button>
      </div>
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">
          {persistUser}님 반갑습니다!
        </a>
      </div>
    </div>
  );
};

export default Navbar;
