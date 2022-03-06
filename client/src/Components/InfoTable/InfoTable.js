import React, { useContext, useEffect, useState } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import PictureIcon from '../Atoms/PictureIcon';
import CameraIcon from '../Atoms/CameraIcon';

/* props로 아무것도 안 줬을 때의 컴포넌트도 따로 만들어야 할 듯. */
function InfoCards() {
  const { selectPreview, searchedData, setSearchedData, keywords } =
    useContext(codeContext);

  /* Preview에서 사용할 _id 만들어주기 */
  function handleCardClick(value) {
    selectPreview(value._id);
  }

  return (
    <div>
      <div class="overflow-x-auto h-screen m-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th></th>
              <th>Type</th>
              <th>Title</th>
              <th>Save Time</th>
            </tr>
          </thead>
          {searchedData.map((value) => {
            return (
              <tr
                class="hover"
                onClick={() => handleCardClick(value)}
                key={value.prop}
              >
                <th></th>
                <td>
                  {value.type === 'image' ? <PictureIcon /> : <CameraIcon />}
                </td>
                <td>{value.title}</td>
                <td>{value.save_time}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
}

export default InfoCards;
