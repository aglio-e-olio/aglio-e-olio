import React, { useEffect, useReducer, useState } from 'react';

// context를 생성한 후 export 한다
export const codeContext = React.createContext();

// state의 초기 값을 설정한다
const initialState = {
  codes: '',
  compileResult: '',
  roomInfo: '',
  allAudioStreams: [],
  nickName: '',
  email: '',
  currentTag: '',
  urlSnapshot: '',
  selectedPreviewKey: '',
  searchedData: [],
  keywords: [],
  docGenerateCount: 0,
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
      };

    case 'USER_EMAIL':
      return {
        ...state,
        email: action.payload,
      };

    case 'SET_TAG':
      return {
        ...state,
        currentTag: action.payload,
      };

    case 'CAPTURE_URL':
      return {
        ...state,
        urlSnapshot: action.payload,
      };

    case 'SELECT_PRE':
      return {
        ...state,
        selectedPreviewKey: action.payload,
      };

    case 'ADD_AUDIO_STREAM':
      return {
        ...state,
        allAudioStreams: [...state.allAudioStreams, action.payload],
      };

    case 'SEARCH_DATA':
      return {
        ...state,
        searchedData: action.payload,
      };

    case 'SET_KEYWORDS':
      return {
        ...state,
        keywords: action.payload
      };
    
    case 'DOC_COUNT':
      return {
        ...state,
        docGenerateCount: action.payload
      }

    default:
      throw new Error();
  }
};

const ContextProvider = ({ children }) => {
  // useReducer를 사용해서 state와 dispatch를 생성한다.
  const [state, dispatch] = useReducer(reducer, initialState);

  const [persistUser, setPersistUser] = useState('');
  const [persistEmail, setPersistEmail] = useState('');
  const [persistLogin, setPersistLogin] = useState(false);

  useEffect(() => {
    const persistUserData = JSON.parse(localStorage.getItem('persistUser'));
    if (persistUserData) {
      setPersistUser(persistUserData);
    }
    const persistEmail = JSON.parse(localStorage.getItem('persistEmail'));
    if (persistEmail) {
      setPersistEmail(persistEmail);
    }
    const persistLogin = JSON.parse(localStorage.getItem('persistLogin'));
    if (persistLogin) {
      setPersistLogin(persistLogin);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('persistUser', JSON.stringify(persistUser));
    localStorage.setItem('persistEmail', JSON.stringify(persistEmail));
    localStorage.setItem('persistLogin', persistLogin);
  }, [persistUser, persistEmail, persistLogin]);

  function addUser(newUser) {
    setPersistUser(newUser);
  }

  function addEmail(newEmail) {
    setPersistEmail(newEmail);
  }

  function addLogin(newLogin) {
    setPersistLogin(newLogin);
  }

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

  function addAudioStream(audioStream) {
    dispatch({
      type: 'ADD_AUDIO_STREAM',
      payload: audioStream,
    });
  }

  function joinUser(nickName) {
    dispatch({
      type: 'USER_JOIN',
      payload: nickName,
    });
  }

  function getEmail(email) {
    dispatch({
      type: 'USER_EMAIL',
      payload: email,
    });
  }

  function getTag(currentTag) {
    dispatch({
      type: 'SET_TAG',
      payload: currentTag,
    });
  }

  function getUrl(urlSnapshot) {
    dispatch({
      type: 'CAPTURE_URL',
      payload: urlSnapshot,
    });
  }

  function selectPreview(selectedPreviewKey) {
    dispatch({
      type: 'SELECT_PRE',
      payload: selectedPreviewKey,
    });
  }

  function setSearchedData(searchedData) {
    dispatch({
      type: 'SEARCH_DATA',
      payload: searchedData,
    });
  }

  function setKeywords(keywords) {
    dispatch({
      type: 'SET_KEYWORDS',
      payload: keywords,
    });
  }

  function setDocGCount(counts) {
    dispatch({
      type: 'DOC_COUNT',
      payload: counts,
    });
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
        allAudioStreams: state.allAudioStreams,
        addAudioStream,
        nickName: state.nickName,
        joinUser,
        email: state.email,
        getEmail,
        currentTag: state.currentTag,
        getTag,
        urlSnapshot: state.urlSnapshot,
        getUrl,
        selectedPreviewKey: state.selectedPreviewKey,
        selectPreview,
        persistUser,
        addUser,
        persistEmail,
        addEmail,
        persistLogin,
        addLogin,
        searchedData: state.searchedData,
        setSearchedData,
        keywords: state.keywords,
        setKeywords,
        docGenerateCount: state.docGenerateCount,
        setDocGCount,
      }}
    >
      {children}
    </codeContext.Provider>
  );
};

export default ContextProvider;
