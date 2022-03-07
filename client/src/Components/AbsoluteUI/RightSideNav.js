import React from 'react';
import ReactToolTip from 'react-tooltip';

const RightSideNav = ({ setIsOpen }) => {
  function handleClick() {
    setIsOpen(true);
  }

  return (
    <ul class="menu z-50 bg-ghost cursor-pointer rounded-box absolute top-1/3 right-0 w-8">
      <button class="btn btn-ghost btn-xs w-8 h-24" onClick={handleClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={4}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>
    </ul>
  );
};

export default RightSideNav;
