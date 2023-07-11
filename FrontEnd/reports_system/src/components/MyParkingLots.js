import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { MYSERVER } from '../env';
import { TokenContext } from "../Context/TokenContext";
import './MyParkingLots.css';

const MyParkingLots = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // use context for the user token
  const { token, setToken } = useContext(TokenContext);
  const navigate = useNavigate();

  // config of the token for validation
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // call to the function fetchParkingLots when the component is reload
  useEffect(() => {
    fetchParkingLots();
  }, []);

  // function to reload the data from the server
  const fetchParkingLots = async () => {
    try {
      await axios
        .get(MYSERVER + "my_parking_lots", config)
        .then((res) => setParkingLots(res.data), setLoading(false))
    } catch (error) {
      console.error(error);
      setError('Error fetching parking lots');
      setLoading(false);
    }
  };

  // function that navigate to the next component due to the selected parking lot
  const handleParkingLotClick = (parkingLotId, parkingLotName) => {
    navigate(`/parking_lot/${parkingLotId}/?name=${encodeURIComponent(parkingLotName)}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2 className="label">:החניונים שלי</h2><br/>
      <h5>בחר את החניון שעבורו תרצה לראות את נתוני המזומנים</h5>
      <div className="card-container">
        {parkingLots.map((parkingLot) => (
          <div className="card" key={parkingLot['parking_lot_id']}>
            <p>{parkingLot['parking_lot_id']} :מזהה חניון</p> 
            <p>{parkingLot['parking_lot_name']} :שם חניון</p> <br/>
            <button onClick={() => handleParkingLotClick(parkingLot['parking_lot_id'], parkingLot['parking_lot_name'])}>
              בחר
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyParkingLots;
