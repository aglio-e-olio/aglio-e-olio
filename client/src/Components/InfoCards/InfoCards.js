import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './InfoCards.css';
import { codeContext } from '../../Context/ContextProvider';
import PictureIcon from '../Atoms/PictureIcon';
import CameraIcon from '../Atoms/CameraIcon';

/* props로 아무것도 안 줬을 때의 컴포넌트도 따로 만들어야 할 듯. */
function InfoCards() {
  const [dataForRendering, setDataForRendering] = useState([]);
  // const [searchedData, setSearchedData] = useState(tagData);

  const { currentTag, persistEmail, selectPreview, searchedData, setSearchedData, keywords } = useContext(codeContext);


  /* props으로 받은 tag 처리 */
  // useEffect(() => {
  //   axios({
  //     method: 'GET',
  //     url: 'https://aglio-olio-api.shop/myroom/metadata',
  //     params: { algo_tag: currentTag, user_email: persistEmail },
  //   })
  //     .then((res) => {
  //       let firstSortedData = [...res.data];
  //       firstSortedData.sort((a, b) => {
  //         if (a.save_time > b.save_time) return -1;
  //         if (a.save_time < b.save_time) return 1;
  //         return 0;
  //       });
  //       setTagData((data) => [...firstSortedData]);
  //       setSearchedData((data) => [...firstSortedData]);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // }, [currentTag]);

  // /* 검색 처리 : filter 이용 */
  // function handleSearch(e) {
  //   // setQuery(e.target.value);
  //   let value = e.target.value;
  //   let result = [];
  //   result = tagData.filter((data) => {
  //     if (
  //       data.title.search(value) !== -1 ||
  //       data.announcer.search(value) !== -1
  //       // (data.extra_tag ? data.extra_tag.find((tag) => tag.value.includes(value)) : true) // 여러 태그 일부만 검색해도 검색 가능
  //     ) {
  //       return true;
  //     }
  //     return false;
  //   });
  //   setSearchedData(result);
  // }

  function handleCardClick(value) {
    selectPreview(value.post_id);
  }

  return (
    <div>
      <div class="overflow-auto h-screen card-wrapper">
        {searchedData.map((value) => {
          return (
            <div
              class="card w-96 bg-base-100 card-compact shadow-xl hover:shadow-md cursor-pointer"
              onClick={() => handleCardClick(value)}
              key={value.prop}
            >
              <div class="card-body hover:bg-sky-700">
                <h2 class="card-title">{value.title}</h2>
                {value.type === "image" ? <PictureIcon /> : <CameraIcon />}
                <p>{value.announcer}</p>
                <p>{value.save_time}</p>
                <div class="justify-end card-actions">
                  {value.extra_tag &&
                    value.extra_tag.map((tag, index) => {
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
