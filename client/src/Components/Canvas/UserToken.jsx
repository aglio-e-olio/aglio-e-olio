import * as React from 'react';

export const UserToken = React.memo(({ user, isSelf, index }) => {
  return (
    <>
      <circle
        key={user.id + '_token'}
        cx={32 + 16 * index}
        cy={32}
        r={16}
        strokeWidth={2}
        stroke="white"
        fill={user.isActive ? user.color : 'grey'}
      />
      {isSelf && (
        <circle cx={32 + 16 * index} cy={56} r={4} fill={user.color} />
      )}
    </>
  );
});
