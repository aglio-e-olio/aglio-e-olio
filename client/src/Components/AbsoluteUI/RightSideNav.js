import React from 'react';

const RightSideNav = ({setIsOpen}) => {
  return (
    <ul class="menu bg-neutral rounded-box absolute top-1/3 right-0 w-16">
      <li>
      <button class="btn btn-secondary mx-3" onClick={() => setIsOpen(true)}>Open</button>
      </li>
    </ul>
  );
};

export default RightSideNav;
