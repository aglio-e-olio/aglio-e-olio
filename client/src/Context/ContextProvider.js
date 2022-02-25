import React, { useReducer } from 'react';

// context를 생성한 후 export 한다
export const codeContext = React.createContext();

// state의 초기 값을 설정한다
const initialState = {
  codes: '',
  compileResult: '',
  roomInfo: '',
  nickName: '',
  currentTag: '',
  urlSnapshot: '',
};

// reducer는 action에서 받은 type에 따라서 state를 변경한다.
const reducer = (state, action) => {
  switch (action.type) {
    case 'EXTRACT_CODE':
      return {
        ...state, //현재 state가 하나뿐이라 생략해도 된다. 두개 이상일 경우 변경하지 않은 state를 유지하기 위해 사용한다
        codes: action.payload, // action.value에서 value는 추후 component에서 dispatch 할 때 payload로 보내주는 값의 이름이다.
      };

    case 'COMPILE':
      return {
        ...state,
        compileResult: action.payload,
      };

    case 'MATCHING_ROOM':
      return {
        ...state,
        roomInfo: action.payload,
      };
    
    case 'USER_JOIN':
      return {
        ...state,
        nickName: action.payload,
      }
    
    case 'SET_TAG':
      return {
        ...state,
        currentTag: action.payload,
      }
    
    case 'CAPTURE_URL':
      return {
        ...state,
        urlSnapshot: action.payload,
      }

    default:
      throw new Error();
  }
};

const ContextProvider = ({ children }) => {
  // useReducer를 사용해서 state와 dispatch를 생성한다.
  const [state, dispatch] = useReducer(reducer, initialState);

  function extractCode(codes) {
    dispatch({
      type: 'EXTRACT_CODE',
      payload: codes,
    });
  }

  function getCompileResult(res) {
    dispatch({
      type: 'COMPILE',
      payload: res,
    });
  }

  function getRoomInfo(roomInfo) {
    dispatch({
      type: 'MATCHING_ROOM',
      payload: roomInfo,
    });
  }

  function joinUser(nickName) {
    dispatch({
      type: 'USER_JOIN',
      payload: nickName,
    });
  }

  function getTag(currentTag) {
    dispatch({
      type: 'SET_TAG',
      payload: currentTag,
    })
  }

  function getUrl(urlSnapshot) {
    dispatch({
      type: 'CAPTURE_URL',
      payload: urlSnapshot,
    })
  }

  return (
    <codeContext.Provider
      //provider에 value props로 state와 dispatch를 내려준다.
      value={{
        codes: state.codes,
        extractCode,
        compileResult: state.compileResult,
        getCompileResult,
        roomInfo: state.roomInfo,
        getRoomInfo,
        nickName: state.nickName,
        joinUser,
        currentTag: state.currentTag,
        getTag,
        urlSnapshot: state.urlSnapshot,
        getUrl,
      }}
    >
      {children}
    </codeContext.Provider>
  );
};

export default ContextProvider;
