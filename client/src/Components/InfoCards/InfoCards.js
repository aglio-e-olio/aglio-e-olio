import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './InfoCards.css';
import { codeContext } from '../../Context/ContextProvider';
import PictureIcon from '../Atoms/PictureIcon';
import CameraIcon from '../Atoms/CameraIcon';

/* props로 아무것도 안 줬을 때의 컴포넌트도 따로 만들어야 할 듯. */
function InfoCards() {
  const { selectPreview, searchedData } = useContext(codeContext);

  /* Preview에서 사용할 _id 만들어주기 */
  function handleCardClick(value) {
    selectPreview(value._id);
  }

  return (
    <div>
      <div class="overflow-auto h-screen card-wrapper" style={{height:'80vh'}}>
        {searchedData.map((value, index) => {
          return (
            <div
              class="card w-96 bg-base-100 card-compact shadow-xl hover:shadow-md cursor-pointer"
              onClick={() => handleCardClick(value)}
              key={index}
            >
              <div class="card-body hover:bg-sky-700">
                {value.type === 'image' ? <PictureIcon /> : <CameraIcon />}
                <h2 class="card-title">{value.title}</h2>
                <p>{value.announcer}</p>
                <p>{value.save_time}</p>
                <div class="justify-end card-actions">
                  {value.algo_tag &&
                    value.algo_tag.map((tag, index) => {
                      return (
                        <span key={index} class="badge badge-outline">
                          {tag}
                        </span> // tag 안에 _id와 value 넣음
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InfoCards;
