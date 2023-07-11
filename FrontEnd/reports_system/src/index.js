import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Login from './components/Login';
import ParkingLotDetails from './components/ParkingLotDetails';
import MyParkingLots from './components/MyParkingLots';
import Admins from './components/Admins';
import Home from './components/Home';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} >
          <Route
            index
            element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Admins" element={<Admins />} />
          <Route path="/MyParkingLots" element={<MyParkingLots />} />
          <Route exact path="/parking_lot/:parking_lot_id/" element={<ParkingLotDetails/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>);
