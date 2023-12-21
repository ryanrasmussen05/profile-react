import { Button } from 'antd';
import styles from './FlightTrackerPage.module.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Flight, fetchFlightData } from './airLabsUtils';
import GoogleMapReact from 'google-map-react';
import FlightMarker from './FlightMarker';

function FlightTrackerPage() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => {
    async function fetchFlights() {
      const flightData = await fetchFlightData(true, true);
      setFlights(flightData);
    }
    fetchFlights();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.backButton}>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')}/>
      </div>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyDLnN6_nWqUCJhgZKTuL9SNMCjUMfm65v4" }}
        defaultCenter={{ lat: 41.3015, lng: -95.8945 }}
        defaultZoom={6}
      >
        {flights.map((flight, index) => ( 
          <FlightMarker key={index} flight={flight} lat={flight.latitude} lng={flight.longitude} />
        ))}
      </GoogleMapReact>
    </div>
  );
}

export default FlightTrackerPage;
