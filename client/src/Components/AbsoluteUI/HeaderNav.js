import React from 'react';

const HeaderNav = ({setIsOpen}) => {
  return (
    <div class="navbar bg-neutral z-111 rounded-box m-1">
      <div class="navbar-start">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class="btn btn-info mx-3">버튼1</button>
          </li>
          <li>
            <button class="btn btn-info mx-3">버튼2</button>
          </li>
          <li>
            <button class="btn btn-info mx-3">버튼3</button>
          </li>
        </ul>
      </div>
      <div class="navbar-center lg:flex">
        <a class="btn btn-primary normal-case text-xl">AO</a>
      </div>
      <div class="navbar-end">
        <ul class="menu menu-horizontal p-0">
          <li>
            <button class="btn btn-secondary mx-3" onClick={() => setIsOpen(true)}>Open</button>
          </li>
          <li>
            <button class="btn btn-secondary mx-3">버튼2</button>
          </li>
          <li>
            <button class="btn btn-secondary mx-3">버튼3</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderNav;
