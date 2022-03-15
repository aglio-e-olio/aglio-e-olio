import React from 'react';

const HelpIcon = () => {
  return (
    <svg
      class="m-auto"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      aria-labelledby="helpIconTitle"
      stroke="#fff"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      color="#fff"
    >
      {' '}
      <title id="helpIconTitle">Help</title>{' '}
      <path d="M12 14C12 12 13.576002 11.6652983 14.1186858 11.1239516 14.663127 10.5808518 15 9.82976635 15 9 15 7.34314575 13.6568542 6 12 6 11.1040834 6 10.2998929 6.39272604 9.75018919 7.01541737 9.49601109 7.30334431 9.29624369 7.64043912 9.16697781 8.01061095" />{' '}
      <line x1="12" y1="17" x2="12" y2="17" /> <circle cx="12" cy="12" r="10" />{' '}
    </svg>
  );
};

export default HelpIcon;
