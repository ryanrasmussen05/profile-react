import { Button, Drawer } from 'antd';
import styles from './FlightTrackerPage.module.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Flight, fetchFlightData } from './airLabsUtils';
import GoogleMapReact from 'google-map-react';
import FlightMarker from './FlightMarker';
import FlightDetails from './FlightDetails';

function FlightTrackerPage() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  useEffect(() => {
    async function fetchFlights() {
      const flightData = await fetchFlightData(true, true);
      setFlights(flightData);
    }
    fetchFlights();
  }, []);

  const handleFlightClick = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedFlight(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.backButton}>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')} />
      </div>
      <Drawer
        title="Flight Details"
        placement="left"
        mask={false}
        className="foo"
        styles={{ body: { padding: 0 } }}
        open={isDrawerOpen}
        onClose={handleDrawerClose}
      >
        <FlightDetails flight={selectedFlight} />
      </Drawer>
      <GoogleMapReact
        bootstrapURLKeys={{ key: '${API_KEY}' }}
        defaultCenter={{ lat: 41.3015, lng: -95.8945 }}
        defaultZoom={6}
      >
        {flights.map((flight, index) => (
          <FlightMarker
            key={index}
            flight={flight}
            onClick={handleFlightClick}
            selected={selectedFlight === flight}
            lat={flight.latitude}
            lng={flight.longitude}
          />
        ))}
      </GoogleMapReact>
    </div>
  );
}

export default FlightTrackerPage;
