import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useParams,
} from 'react';
import * as Y from 'yjs';
import io from 'socket.io-client';
import html2canvas from 'html2canvas';
import { codeContext } from '../Context/ContextProvider';
import Save from '../Components/Save/Save';
import Canvas from '../Components/Canvas/Canvas';
import CodeEditor from '../Components/CodeEditor/Editor';
import UpdateStudy from '../Components/UpdateStudy/UpdateStudy';
import { WebrtcProvider } from 'y-webrtc';
import { v1 as uuid } from 'uuid';
import axios from 'axios';
import SelfAbsolute from '../Components/SelfAbsolute/SelfAbsolute';

let i = 0;
let doc;
let provider;
let awareness;
let yLines;
let undoManager;
let data;

const SelfStudyRoom = () => {
  const socketRef = useRef();
  const [isOpen, setOpen] = useState(false);
  const [allData, setAllData] = useState({});
  const {
    codes,
    compileResult,
    getCompileResult,
    getUrl,
    selectedPreviewKey,
    docGenerateCount,
    setDocGCount,
  } = useContext(codeContext);
  //   const { roomID } = useParams();
  const roomID = uuid();
  const [isEraser, setIsEraser] = useState(false);

  if (docGenerateCount === 0) {
    doc = new Y.Doc();
    provider = new WebrtcProvider(roomID, doc);
    awareness = provider.awareness;
    yLines = doc.getArray('lines~9');
    undoManager = new Y.UndoManager(yLines);
    setDocGCount(1);
  }

  const handleSave = () => {
    // 여기서 모달 열어줌
    onCapture();
    setOpen(true);
  };

  const onCapture = async () => {
    let snapshotUrl = '';
    console.log('onCapture');
    await html2canvas(document.getElementById("onCapture"))
      .then((canvas) => {
        snapshotUrl = canvas.toDataURL('image/png');
        getUrl(snapshotUrl);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const handleSaveCancel = () => {
    setOpen(false);
  };

  function handleCompileResult(code) {
    getCompileResult(code);
  }

  useEffect(() => {
    socketRef.current = io.connect('/');

    socketRef.current.on('code response', (code) => {
      handleCompileResult(code);
    });

    axios({
      method: 'GET',
      url: 'https://aglio-olio-api.shop/myroom/selfstudy',
      params: { _id: selectedPreviewKey },
    })
      .then((res) => {
        setAllData(res.data);
        const encodedDoc = res.data.canvas_data;
        const docToUint8 = Uint8Array.from(Object.values(encodedDoc[0]));
        Y.applyUpdateV2(doc, docToUint8);
      })
      .catch((error) => console.error(error));
  }, [selectedPreviewKey]);

  return (
    <div>
      <div class="fixed top-0 left-0 right-0 bottom-0 " id='onCapture'>
        <SelfAbsolute
          // peers={peers}
          handleSave={handleSave}
          doc={doc}
          provider={provider}
          awareness={awareness}
          yLines={yLines}
          undoManager={undoManager}
          setIsEraser={setIsEraser}
        />
        <Canvas
          doc={doc}
          provider={provider}
          awareness={awareness}
          yLines={yLines}
          undoManager={undoManager}
          isEraser={isEraser}
        />
      </div>
      <div>
        {isOpen && (
          <UpdateStudy
            isOpen={isOpen}
            onCancel={handleSaveCancel}
            doc={doc}
            data={allData}
          />
        )}

        {/* <Record /> */}
      </div>
    </div>
  );
};

export default SelfStudyRoom;
