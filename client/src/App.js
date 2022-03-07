import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import CreateRoom from './routes/CreateRoom';
import Room from './routes/Room';
import History from './routes/History';
import './App.css';
import SelfStudyRoom from './routes/SelfStudyRoom';
import JoinRoom from './routes/JoinRoom';
import { codeContext } from './Context/ContextProvider';
import ReactToolTip from 'react-tooltip';

function App() {
  const { persistLogin, persistEmail } = useContext(codeContext);
  const login_info = localStorage.getItem('persistLogin');

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreateRoom />} />
          <Route
            path="/room/:roomID"
            element={login_info ? <Room /> : <Navigate replace to="/join" />}
          />
          <Route path="/join" element={<JoinRoom />} />

          <Route path="/history/:userID" element={<History />} />
          <Route
            path="/history/selfstudy/:userID"
            element={<SelfStudyRoom />}
          />
        </Routes>
      </BrowserRouter>
      <ReactToolTip/>
    </div>
  );
}

export default App;
