import React, { useContext } from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';
import CreateRoom from './routes/CreateRoom';
import Room from './routes/Room';
import History from './routes/History';
import './App.css';
import ContextProvider, { codeContext } from './Context/ContextProvider';
import SelfStudyRoom from './routes/SelfStudyRoom';
import isLogin from './utils/isLogin';
import JoinRoom from './routes/JoinRoom';

function App() {
  const email = isLogin;
  
  return (
    <div className="App">
      <ContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CreateRoom />} />
            <Route path="/room/:roomID" element={ email ? <Room/> :<JoinRoom/> } />
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
