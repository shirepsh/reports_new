import React, { useState, useContext } from 'react';
import { Link } from "react-router-dom";
import './Navbar.css'
import { UserTypeContext } from '../Context/UserTypeContext'
import { IsLoggedContext } from '../Context/IsLoggedContext'

const Navbar = () => {

  const { UserType, setUserType } = useContext(UserTypeContext);

  const { IsLogged, setIsLogged } = useContext(IsLoggedContext);

  console.log("fgtht", UserType)

  const handleLogout = () => {
    setIsLogged(false);
    setUserType("");
  };

  return (
    <div>
      <ul>
        <li style={{ backgroundColor: "#609bf3", float: "left" }}><Link to="/">home</Link></li>

        {UserType === "superuser" && (
          <li>
            <Link to="/Admins">כניסת מנהלים</Link>
          </li>
        )}

        {IsLogged && (
             <li style={{ backgroundColor: "#609bf3", float: "right" }}>
             <Link to="/Home" onClick={handleLogout}>Log out</Link>
           </li>
        )}


      </ul>
    </div>)
}
export default Navbar
