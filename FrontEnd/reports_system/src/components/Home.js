import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { Button } from 'react-bootstrap';

const Home = () => {
    return (
        <div className="container">
            <h2 style={{marginTop: "20px" , fontWeight:"bolder"}} >ברוכים הבאים למערכת בקרת הדוחות של טכנוסו</h2> <br/>
            <p>
                בעזרת מערכת זו תוכלו להיות במעקב תמידי אחרי פעולות המזומנים שבעמדות התשלום שלכם
            </p>
            <p>
                
            </p>
            <Link to="/Login" >
                <Button style={{color:"white"}} className="btn btn-outline-success">Get Started</Button>
            </Link>
        </div>
    );
};

export default Home;
