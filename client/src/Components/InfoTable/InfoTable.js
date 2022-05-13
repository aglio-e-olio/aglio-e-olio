import React, { useContext, useRef } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import PictureIcon from '../Atoms/PictureIcon';
import CameraIcon from '../Atoms/CameraIcon';
import {
  Table,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Column,
} from 'react-virtualized';
import 'react-virtualized/styles.css';
import './InfoTable.css'

/* props로 아무것도 안 줬을 때의 컴포넌트도 따로 만들어야 할 듯. */
function InfoTable() {
  const { selectPreview, searchedData } = useContext(codeContext);
  const cacheRef = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 70,
    })
  ); // 변화해도 리렌더링이 일어나지 않는 값

  /* Preview에서 사용할 _id 만들어주기 */
  function handleTableClick({rowData}) {
    console.log(rowData)
    selectPreview(rowData._id);
  }

  function handleTableMouseOver() {
    
  }

  const TypeCell = ({ cellData }) => (
    <div>{cellData === 'image' ? <PictureIcon /> : <CameraIcon />}</div>
  );

  return (
    <div class="overflow-y-auto overflow-x-hidden m-auto">
      <div style={{ width: '100%', height: '74vh' }}>
        <AutoSizer>
          {({ width, height }) => (
            <Table
              width={width}
              height={height}
              headerHeight={60}
              rowHeight={cacheRef.current.rowHeight}
              rowCount={searchedData.length}
              rowGetter={({ index }) => searchedData[index]}
              onRowMouseOver={handleTableMouseOver}
              onRowClick={handleTableClick}
            >
              <Column
                label="Type"
                dataKey="type"
                width={200}
                cellRenderer={TypeCell}
              />
              <Column label="Title" dataKey="title" width={300} />
              <Column label="Save Time" dataKey="save_time" width={500} />
            </Table>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}

export default InfoTable;
