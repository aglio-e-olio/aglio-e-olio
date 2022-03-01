import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import CreateRoom from './routes/CreateRoom';
import Room from './routes/Room';
import History from './routes/History';
import './App.css';
import SelfStudyRoom from './routes/SelfStudyRoom';
import {isLogin} from './utils/isLogin';
import JoinRoom from './routes/JoinRoom';
import { codeContext } from './Context/ContextProvider';

function App() {
  const {persistLogin} = useContext(codeContext);
  
  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CreateRoom />} />
            <Route
              path="/room/:roomID"
              element={persistLogin ? <Room /> : <Navigate replace to="/join" />}
            />
            <Route path="/join" element={<JoinRoom />} />

            <Route path="/history/:userID" element={<History />} />
            <Route
              path="/history/selfstudy/:userID"
              element={<SelfStudyRoom />}
            />
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
