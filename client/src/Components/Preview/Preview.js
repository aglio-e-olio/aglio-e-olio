import React, { useContext, useState, useEffect } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import PreviewTagBadge from '../Atoms/PreviewTagBadge';
import { TrashIcon } from '@heroicons/react/outline';
import Swal from 'sweetalert2';

function Preview() {
  const { selectedPreviewKey, persistEmail, setExitSave, setDocGCount } =
    useContext(codeContext);
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
    setExitSave(0);
    setDocGCount(0);
    const userID = persistEmail;
    navigate(`/history/selfstudy/${userID}`);
  }

  async function handleDelete() {
    const showLoading = function () {
      Swal.fire({
        title: '삭제중입니다',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
    };

    showLoading();

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
        timer: 2000,
      });

      window.location.reload();
    } catch (err) {
      console.error(err);
      // alert('delete 실패');
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'delete 실패!',
        showConfirmButton: false,
        timer: 2000,
      });
    }
  }

  return metaData && metaData !== 'error' ? (
    <div class="w-2/3 h-5/12 p-3 m-auto">
      <figure class="transition mt-10">
        {metaData.type === 'image' ? (
          <img
            class="object-scale-down m-auto shadow-xl rounded-3xl"
            style={{ width: '700px', height:'354px', cursor: 'pointer', objectFit: 'contain' }}
            src={metaData.type && metaData.image_tn_ref}
            alt="thumbnail"
            onClick={goToSelfstudy}
          />
        ) : (
          <ReactPlayer
            className="react-player"
            class="shadow-xl rounded-3xl"
            url={metaData.image_tn_ref} // 플레이어 url
            playing={false} // 자동 재생 on
            muted={false} // 자동 재생 on
            controls={true} // 플레이어 컨트롤 노출 여부
            light={false} // 플레이어 모드
            pip={true} // pip 모드 설정 여부
            style={{ margin: 'auto', width: '700px', height:'350px', cursor: 'pointer', objectFit: 'contain' }}
            config={{
              file: {
                hlsOptions: {
                  maxBufferLength: 5, // N초 단위로 버퍼링
                },
              },
            }}
          />
        )}
      </figure>

      <div class="card-body" style={{ height: '90%' }}>
        <div class="grid grid-cols-2 gap-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="text-right font-bold">
              <p>Title</p>
              <p>Announcer</p>
              <p>Save Time</p>
              <p>Update Time</p>
            </div>
            <div class="text-left">
              <p>{metaData.title}</p>
              <p>{metaData.announcer}</p>
              <p>{metaData.save_time}</p>
              <p>{metaData.update_time ? metaData.update_time : '-'}</p>
            </div>
          </div>

          <div style={{ width: '125%' }}>
            <PreviewTagBadge datas={metaData.teamMates} title="Teammates" />
            <PreviewTagBadge datas={metaData.algo_tag} title="Algorithm Tag" />
            <PreviewTagBadge datas={metaData.extra_tag} title="Extra Tag" />
          </div>
        </div>

        <div class="justify-end card-actions">
          <TrashIcon
            class="inline-block w-8 h-8 stroke-current mr-10"
            onClick={handleDelete}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  ) : null;
}

export default Preview;
