import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateRoom from './routes/CreateRoom';
import Room from './routes/Room';
import History from './routes/History';
import './App.css';
import ContextProvider from './Context/ContextProvider';

function App() {

  return (
    <div className="App">
      <ContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CreateRoom />} />
            <Route path="/room/:roomID" element={<Room />} />
            <Route path="/history/:userID" element={<History />} />
          </Routes>
        </BrowserRouter>
      </ContextProvider>
    </div>
  );
}

export default App;
