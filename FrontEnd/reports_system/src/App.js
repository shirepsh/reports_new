import './App.css';
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Outlet } from "react-router-dom";
import React from "react";

import { TokenProvider } from "./Context/TokenContext";
import { UserTypeProvider } from './Context/UserTypeContext'
import { IsLoggedProvider } from './Context/IsLoggedContext'

const App = () => {
  return (
    <div className="App">
      <TokenProvider>
        <IsLoggedProvider>
          <UserTypeProvider>
            <Navbar />
            {/* Main content start */}
            <Outlet />
            {/* Main content end */}
            <Footer />
          </UserTypeProvider>
        </IsLoggedProvider>
      </TokenProvider>
    </div>);
}

export default App;    
