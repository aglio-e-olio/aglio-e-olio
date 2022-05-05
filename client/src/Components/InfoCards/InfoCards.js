import React, { useContext, useRef } from 'react';
import './InfoCards.css';
import { codeContext } from '../../Context/ContextProvider';
import PictureIcon from '../Atoms/PictureIcon';
import CameraIcon from '../Atoms/CameraIcon';
import DataMapBadge from '../Atoms/DataMapBadge';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';

/* props로 아무것도 안 줬을 때의 컴포넌트도 따로 만들어야 할 듯. */
function InfoCards() {
  const { selectPreview, searchedData } = useContext(codeContext);
  const cacheRef = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 100,
    })
  );

  /* Preview에서 사용할 _id 만들어주기 */
  function handleCardClick(value) {
    selectPreview(value._id);
  }

  function rowRenderer({ key, index, style, parent }) {
    const value = searchedData[index];

    return (
      <CellMeasurer
        key={key}
        cache={cacheRef.current}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        <div key={key} style={style}>
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
                {value.algo_tag && <DataMapBadge data={value.algo_tag} />}
              </div>
            </div>
          </div>
        </div>
      </CellMeasurer>
    );
  }

  return (
    <div>
      <div
        class="overflow-auto h-screen card-wrapper"
        style={{ width: '100%', height: '80vh' }}
      >
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              rowHeight={cacheRef.current.rowHeight}
              deferredMeasurementCache={cacheRef.current}
              rowCount={searchedData.length}
              rowRenderer={rowRenderer}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
}

export default InfoCards;
