import React, { useContext, useState, useEffect } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import Swal from 'sweetalert2';


function Preview() {
  const { selectedPreviewKey, persistEmail, setExitSave } = useContext(codeContext);
  const [metaData, setMetaData] = useState(false);
  const navigate = useNavigate();

  /* preview에서 meta data 서버에 요청 */
  const getData = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'https://aglio-olio-api.shop/myroom/preview',
        params: { _id: selectedPreviewKey },
      });
      setMetaData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(async () => {
    getData();
  }, [selectedPreviewKey]);

  function goToSelfstudy() {
    setExitSave(0);
    const userID = persistEmail;
    navigate(`/history/selfstudy/${userID}`);
  }

  async function handleDelete() {
    try {
      const res = await axios({
        method: 'DELETE',
        url: `https://aglio-olio-api.shop/myroom/delete/${selectedPreviewKey}`,
        params: { _id: selectedPreviewKey },
      });
      // alert('delete 성공');
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'delete 성공!',
        showConfirmButton: false,
        timer : 2000
      })
      
      window.location.reload();
    } catch (err) {
      console.error(err);
      // alert('delete 실패');
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'delete 실패!',
        showConfirmButton: false,
        timer : 2000
      })
    }
  }

  return metaData && metaData !== 'error' ? (
    <div class="card w-96 glass">
      <figure>
        {metaData.type === 'image' ? (
          <img
            class="object-scale-down h-60 w-96"
            src={metaData.type && metaData.image_tn_ref}
            alt="thumbnail"
            onClick={goToSelfstudy}
          />
        ) : (
          <ReactPlayer
            className="react-player"
            url={metaData.image_tn_ref} // 플레이어 url
            width="400px" // 플레이어 크기 (가로)
            height="300px" // 플레이어 크기 (세로)
            playing={false} // 자동 재생 on
            muted={false} // 자동 재생 on
            controls={true} // 플레이어 컨트롤 노출 여부
            light={false} // 플레이어 모드
            pip={true} // pip 모드 설정 여부
            poster={
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
            } // 플레이어 초기 포스터 사진
          />
        )}
      </figure>
      <div class="card-body">
        <h2 class="card-title">{metaData.title}</h2>
        <div class="justify-end card-actions">
          {metaData.algo_tag &&
            metaData.algo_tag.map((tag) => {
              return (
                <span class="badge badge-outline">{tag}</span> // tag 안에 _id와 value 넣음
              );
            })}
        </div>
        <div class="justify-end card-actions">
          {metaData.extra_tag &&
            metaData.extra_tag.map((tag, index) => {
              return <kbd key={index} class="kbd kbd-sm">{tag}</kbd>;
            })}
        </div>
        <div class="justify-end card-actions">
          <button
            onClick={handleDelete}
            class="btn btn-error sm:btn-sm md:btn-md lg:btn-sm"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  ) : null;
}

export default Preview;
