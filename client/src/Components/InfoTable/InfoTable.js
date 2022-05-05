import React, { useContext, useRef } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import PictureIcon from '../Atoms/PictureIcon';
import CameraIcon from '../Atoms/CameraIcon';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';

/* props로 아무것도 안 줬을 때의 컴포넌트도 따로 만들어야 할 듯. */
function InfoTable() {
  const { selectPreview, searchedData } = useContext(codeContext);
  const cacheRef = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 100,
    })
  ); // 변화해도 리렌더링이 일어나지 않는 값

  /* Preview에서 사용할 _id 만들어주기 */
  function handleTableClick(value) {
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
        <tr
          class="hover"
          onClick={() => handleTableClick(value)}
          key={key}
          style={style}
        >
          <th></th>
          <td>{value.type === 'image' ? <PictureIcon /> : <CameraIcon />}</td>
          <td>{value.title}</td>
          <td>{value.save_time}</td>
        </tr>
      </CellMeasurer>
    );
  }

  return (
    <div>
      <div
        class="overflow-y-auto overflow-x-hidden m-auto"
      >
        <table class="table w-full">
          <thead>
            <tr>
              <th></th>
              <th>Type</th>
              <th>Title</th>
              <th>Save Time</th>
            </tr>
          </thead>
          <tbody style={{ width: '100%', height: '74vh' }}>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InfoTable;
