import React, { useContext, useState, useEffect } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Preview() {
  const { selectedPreviewKey, persistEmail } = useContext(codeContext);
  const [metaData, setMetaData] = useState(false);
  const navigate = useNavigate();


  /* preview에서 meta data 서버에 요청 */
  useEffect(async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'https://aglio-olio-api.shop/myroom/preview',
        params: { post_id: selectedPreviewKey },
      });
      setMetaData(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [selectedPreviewKey]);

  function goToSelfstudy() {
    const userID = persistEmail;
    navigate(`/history/selfstudy/${userID}`)
  }

  return metaData && metaData !== 'error' ? (
    <div class="card w-96 glass">
      <figure>
        <img
          class="object-scale-down h-60 w-96"
          src={
            metaData.is_picture ? metaData.image_tn_ref : metaData.video_tn_ref
          }
          alt="thumbnail"
          onClick={goToSelfstudy}
        />
      </figure>
      <div class="card-body">
        <h2 class="card-title">{metaData.title}</h2>
        <div class="justify-end card-actions">
          {metaData.algo_tag &&
            metaData.algo_tag.map((tag) => {
              return (
                <span class="badge badge-outline">{tag.tag}</span> // tag 안에 _id와 value 넣음
              );
            })}
        </div>
        <div class="justify-end card-actions">
          {metaData.extra_tag &&
            metaData.extra_tag.map((tag) => {
              return <kbd class="kbd kbd-sm">{tag}</kbd>;
            })}
        </div>
        <div class="justify-end card-actions">
          <button class="btn btn-error sm:btn-sm md:btn-md lg:btn-sm">
            삭제
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default Preview;
