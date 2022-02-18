import * as React from 'react';

export const UserCursor = React.memo(({ user }) => {
  return (
    <circle
      key={user.id}
      cx={user.point[0]}
      cy={user.point[1]}
      r={4}
      fill={user.isActive ? user.color : 'grey'}
    />
  );
});
