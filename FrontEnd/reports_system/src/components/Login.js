import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { MYSERVER } from '../env';
import { TokenContext } from "../Context/TokenContext";
import {UserTypeContext} from '../Context/UserTypeContext'
import {IsLoggedContext} from '../Context/IsLoggedContext'
import './Login.css'

const Login = () => {
  const [username, setuname] = useState("");
  const [password, setpassword] = useState("");

  // const [isLogged, setIsLogged] = useState(false);

  const { token, setToken } = useContext(TokenContext);

  const { UserType, setUserType } = useContext(UserTypeContext);

  const { IsLogged, setIsLogged } = useContext(IsLoggedContext);

  const navigate = useNavigate();

  const handleLogin = () => {
    axios
      .post(MYSERVER + "login", { username, password })
      .then((res) => {
        const token = res.data.access;
        console.log("Token received:", token);
        setToken(token);
  
        axios
          .get(MYSERVER + "type_logged", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            const type = res.data;
            console.log("type:", type);
            setUserType(type);
            setIsLogged(true);
            navigate("/MyParkingLots"); // Navigate to the desired component
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          toast.error("Username or password incorrect", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
        if (error.response && error.response.status === 400) {
          toast.error("You need to fill all the fields!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      });
  };
  
 
  return (
    <div>

      <h2 className="LoginTxt">התחברות למערכת</h2><br /><br />

      <Form>
        <Form.Group>
          <Form.Label>שם משתמש</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter username'
            onChange={(e) => setuname(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>ססמה</Form.Label>
          <Form.Control
            type='password'
            placeholder='Enter password'
            onChange={(e) => setpassword(e.target.value)}
            required
          />
        </Form.Group>

        {IsLogged ? (
          <div>
            <Link to="/MyParkingLots">
              <Button className="btn btn-outline-success" style={{ margin: '20px', color: "wheat" }} onClick={() => { handleLogin(username, password) }}>
                Login
              </Button>
            </Link>
          </div>
        ) : (
          <Button className="btn btn-outline-success" style={{ margin: '20px', color: "wheat" }} onClick={() => { handleLogin(username, password) }}>
            Login
          </Button>
        )}

        <ToastContainer />
      </Form>
      <br />
    </div>
  );
};

export default Login;
