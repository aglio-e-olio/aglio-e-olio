import React, { useContext } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import CodeEditor from '../CodeEditor/Editor';

const CodeEditorWrapper = ({ doc, provider }) => {
  const { compileResult } = useContext(codeContext);
  return (
    <div class='h-300px w-full'>
      <CodeEditor doc={doc} provider={provider} />
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

export default CodeEditorWrapper;
