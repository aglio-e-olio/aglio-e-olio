import React, { useContext } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import { MenuIcon, DotsHorizontalIcon } from '@heroicons/react/outline';

const Navbar = () => {
  const { persistUser } = useContext(codeContext);
  return (
    <div class="navbar bg-base-100">
      <div class="flex-none">
        <button class="btn btn-square btn-ghost">
          <MenuIcon class="inline-block w-5 h-5 stroke-current" />
        </button>
      </div>
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">
          {persistUser}님 반갑습니다!
        </a>
      </div>
      <div class="flex-none">
        <button class="btn btn-square btn-ghost">
          <DotsHorizontalIcon class="inline-block w-5 h-5 stroke-current" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
