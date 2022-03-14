import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
// import CreateRoom from './routes/CreateRoom';
// import Room from './routes/Room';
// import History from './routes/History';
import './App.css';
// import SelfStudyRoom from './routes/SelfStudyRoom';
// import JoinRoom from './routes/JoinRoom';
import { codeContext } from './Context/ContextProvider';
import ReactToolTip from 'react-tooltip';
// import Login from './routes/Login';

const CreateRoom = React.lazy(() => import('./routes/CreateRoom'));
const Room = React.lazy(() => import('./routes/Room'));
const JoinRoom = React.lazy(() => import('./routes/JoinRoom'));
const History = React.lazy(() => import('./routes/History'));
const SelfStudyRoom = React.lazy(() => import('./routes/SelfStudyRoom'));
const Login = React.lazy(() => import('./routes/Login'));

const loading = () => <p>Loading</p>;

function App() {
  const login_info = localStorage.getItem('persistLogin');
  const [login, setLogin] = useState(false);
  
  useEffect(() => { 
    setLogin(login_info)
  },[login_info])

  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={loading}>
          <Routes>
            <Route
              path="/"
              element={
                login_info ? (
                  <CreateRoom />
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />
            <Route
              path="/room/:roomID"
              element={
                login_info ? <Room /> : <Navigate replace to="/join" />
              }
            />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/login" element={<Login />} />

            <Route path="/history/:userID" element={<History />} />
            <Route
              path="/history/selfstudy/:userID"
              element={<SelfStudyRoom />}
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ReactToolTip />
    </div>
  );
}

export default App;
