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
import UpdateStudy from '../Components/UpdateStudy/UpdateStudy'
import { WebrtcProvider } from 'y-webrtc';
import { v1 as uuid } from 'uuid';
import axios from 'axios';

let i = 0;
let doc;
let provider;
let awareness;
let yLines;
let undoManager;

const SelfStudyRoom = () => {
  const socketRef = useRef();
  const [isOpen, setOpen] = useState(false);
  const { codes, compileResult, getCompileResult, getUrl, selectedPreviewKey } =
    useContext(codeContext);
  //   const { roomID } = useParams();
  const roomID = uuid();

  if (i === 0) {
    doc = new Y.Doc();
    provider = new WebrtcProvider(roomID, doc);
    awareness = provider.awareness;
    yLines = doc.getArray('lines~9');
    undoManager = new Y.UndoManager(yLines);
  }
  i++;

  const handleSave = () => {
    // 여기서 모달 열어줌
    onCapture();
    setOpen(true);
  };

  const onCapture = async () => {
    let snapshotUrl = '';
    console.log('onCapture');
    await html2canvas(document.body)
      .then(async (canvas) => {
        snapshotUrl = canvas.toDataURL('image/png');
        getUrl(snapshotUrl);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleSaveCancel = () => {
    setOpen(false);
  };

  function sendCode() {
    socketRef.current.emit('code compile', { codes, roomID });
  }

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
      url: 'https://aglio-olio-api.shop/myroom/preview', // url 변경 해야함
      params: { post_id: selectedPreviewKey },
    })
      .then((res) => {
        const encodedDoc = res.data.canvas_data;
        const docToUint8 = Uint8Array.from(Object.values(encodedDoc[0]));
        Y.applyUpdateV2(doc, docToUint8)
      })
      .catch((error) => console.error(error));
  }, [selectedPreviewKey]);

  return (
    <div>
      <div>
        <button className="run-button" onClick={sendCode}>
          Run
        </button>
        <button
          class="btn btn-success cursor-pointer absolute top-0 right-40"
          onClick={handleSave}
        >
          저장 모달 열기
        </button>
        <UpdateStudy isOpen={isOpen} onCancel={handleSaveCancel} yLines={yLines} />
        <Canvas
          doc={doc}
          provider={provider}
          awareness={awareness}
          yLines={yLines}
          undoManager={undoManager}
        />
        <CodeEditor doc={doc} provider={provider} />
      </div>
      <div>
        <textarea
          className="code-result"
          value={compileResult}
          placeholder={
            '코드 결과 출력 창입니다. \n현재 Javascript만 지원중입니다.'
          }
        />
      </div>
    </div>
  );
};

export default SelfStudyRoom;
