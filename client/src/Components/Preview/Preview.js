import React, { useContext, useState, useEffect } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import PreviewTagBadge from '../Atoms/PreviewTagBadge';
import PreviewText from '../Atoms/PreviewText';

function Preview() {
  const { selectedPreviewKey, persistEmail } = useContext(codeContext);
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
    if (selectedPreviewKey) {
      getData();
    }
  }, [selectedPreviewKey]);

  function goToSelfstudy() {
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
      alert('delete 성공');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('delete 실패');
    }
  }

  return metaData && metaData !== 'error' ? (
    <div class="card w-5/12 glass bg-gray-200">
      <figure class="mt-4" >
        {metaData.type === 'image' ? (
          <img
            class="object-scale-down h-60 w-2/3 hover"
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
      </figure >
      <div class="card-body">
        <h1 class="card-title">{metaData.title}</h1>
        <h2 class="text-lg mb-16">{metaData.announcer}</h2>
        <div class="card outline-black p-5 w-5/6 m-auto ">
          <PreviewText data={metaData.save_time} title="Save Time" />
          <PreviewText
            data={metaData.update_time ? metaData.update_time : '-'}
            title="Update Time"
            margin = '1rem'
          />
          <PreviewTagBadge datas={metaData.teamMates} title="Teammates" />
          <PreviewTagBadge datas={metaData.algo_tag} title="Algorithm Tag" />
          <PreviewTagBadge datas={metaData.extra_tag} title="Extra Tag" />
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
