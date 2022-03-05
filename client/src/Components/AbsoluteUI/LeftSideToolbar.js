import React from 'react';
import PenIcon from '../Atoms/PenIcon';
import EraserIcon from '../Atoms/EraserIcon';
import TrashIcon from '../Atoms/TrashIcon';


const LeftSideToolbar = () => {
    return (
        <ul class="menu bg-neutral p-2 rounded-box fixed left-1 z-50 top-1/3 ">
          <li>
            <a>
              <PenIcon />
            </a>
          </li>
          <li>
            <a>
              <EraserIcon />
            </a>
          </li>
          <li>
            <a>
              <TrashIcon />
            </a>
          </li>
        </ul>
    );
};

export default LeftSideToolbar;