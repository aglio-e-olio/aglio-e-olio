import * as React from 'react';
// import { awareness } from '../utils/y';

const USER_COLORS = [
  '#EC5E41',
  '#F2555A',
  '#F04F88',
  '#E34BA9',
  '#BD54C6',
  '#9D5BD2',
  '#7B66DC',
  '#5373E6',
  '#369EFF',
  '#02B1CC',
  '#11B3A3',
  '#39B178',
  '#55B467',
  '#FF802B',
];

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Subscribe to the user's own presence within the provider's awareness API.
 */
export function useUser({awareness}) {

  const [user, setUser] = React.useState();

  // Set the initial user's state
  React.useEffect(() => {
    const user = {
      id: awareness.clientID,
      point: [0, 0],
      color: sample(USER_COLORS),
      isActive: true,
    };

    awareness.setLocalState(user);

    setUser(awareness.getLocalState());
  }, []);

  // Activate the user (idle -> active)
  const activateUser = React.useCallback(() => {
    awareness.setLocalStateField('isActive', true);
    setUser(awareness.getLocalState());
  }, []);

  // Dectivate the user (active -> idle)
  const deactivateUser = React.useCallback(() => {
    awareness.setLocalStateField('isActive', false);
    setUser(awareness.getLocalState());
  }, []);

  // Update the user's cursor point
  const updateUserPoint = React.useCallback((point) => {
    awareness.setLocalStateField('point', point);
    setUser(awareness.getLocalState());
  }, []);

  return { user, updateUserPoint, activateUser, deactivateUser };
}
