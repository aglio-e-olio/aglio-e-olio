import React from 'react';

const UndoIcon = () => {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="previousAltIconTitle"
      stroke="#ffffff"
      stroke-width="1.5"
      stroke-linecap="square"
      stroke-linejoin="miter"
      color="#ffffff"
    >
      {' '}
      <title id="previousAltIconTitle">Previous</title>{' '}
      <path d="M8 4L4 8L8 12" />{' '}
      <path d="M4 8H14.5C17.5376 8 20 10.4624 20 13.5V13.5C20 16.5376 17.5376 19 14.5 19H5" />{' '}
    </svg>
  );
};

export default UndoIcon;
