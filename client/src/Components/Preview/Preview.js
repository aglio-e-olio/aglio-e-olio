import React, { useContext } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import axios from 'axios';

function Preview() {
  const { selectedPreviewKey } = useContext(codeContext);
  const [metaData, setMetaData] = useState(false);

  /* preview에서 meta data 서버에 요청 */
  useEffect(async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://localhost:4000/meta',
        params: { _id: selectedPreviewKey },
      });
      setMetaData(res.data[0]);
      console.log(res.data[0]);
    } catch (err) {
      console.error(err);
    }
  }, [selectedPreviewKey]);

  return metaData ? (
    <div class="card w-96 glass">
      <figure>
        <img src="https://api.lorem.space/image/car?w=600&h=500" alt="car!" />
      </figure>
      <div class="card-body">
        <h2 class="card-title">{metaData.title}</h2>
        <p>How to park your car at your garage?</p>
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
