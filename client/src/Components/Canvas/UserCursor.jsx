import * as React from 'react';

export const UserCursor = React.memo(({ user }) => {
  return (
    <g>
    <circle
      key={user.id}
      cx={user.point[0]*window.innerWidth}
      cy={user.point[1]-window.scrollY}
      r={5}
      fill={user.isActive ? user.color : 'grey'}
    />
      <text
        x={user.point[0] * window.innerWidth} y={user.point[1] - window.scrollY} dx="1%"
        fill={user.isActive ? user.color : 'grey'}
      >{user.name}</text>
   </g>
  );
});
