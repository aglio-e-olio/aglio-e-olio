import React from 'react';

const RightSideNav = ({ setIsOpen }) => {
  return (
    <ul class="menu bg-neutral hover:bg-neutral-focus cursor-pointer rounded-box absolute top-1/3 right-0 w-8">
      <li>
        <svg
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          width="32px"
          height="32px"
          viewBox="0 0 24 24"
          aria-labelledby="chevronLeftIconTitle"
          stroke="#ffffff"
          stroke-width="1.5"
          stroke-linecap="square"
          stroke-linejoin="miter"
          fill="none"
          color="#ffffff"
          onClick={() => setIsOpen(true)}
        >
          {' '}
          <title id="chevronLeftIconTitle">Chevron Left</title>{' '}
          <polyline points="14 18 8 12 14 6 14 6" />{' '}
        </svg>
      </li>
    </ul>
  );
};

export default RightSideNav;
