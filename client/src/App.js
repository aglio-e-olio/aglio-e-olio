import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import CreateRoom from './routes/CreateRoom';
import Room from './routes/Room';
import History from './routes/History';
import './App.css';
import ContextProvider, { codeContext } from './Context/ContextProvider';
import SelfStudyRoom from './routes/SelfStudyRoom';
import {isLogin} from './utils/isLogin';
import JoinRoom from './routes/JoinRoom';

function App() {
  useEffect(() => {
    
  }, []);
  
  return (
    <div className="App">
      <ContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CreateRoom />} />
            <Route
              path="/room/:roomID"
              element={isLogin ? <Room /> : <Navigate replace to="/join" />}
            />
            <Route path="/join" element={<JoinRoom />} />

            <Route path="/history/:userID" element={<History />} />
            <Route
              path="/history/selfstudy/:userID"
              element={<SelfStudyRoom />}
            />
          </Routes>
        </BrowserRouter>
      </ContextProvider>
    </div>
  );
}

export default App;
