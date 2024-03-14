import { Button, Drawer, Modal, Select } from 'antd';
import styles from './FlightTrackerPage.module.css';
import { ArrowLeftOutlined, QuestionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { fetchFlightData as fetchAirLabsFlightData } from './airLabsUtils';
import { fetchFlightData as fetchFlightAwareFlightData } from './flightAwareUtils';
import GoogleMapReact from 'google-map-react';
import FlightMarker from './FlightMarker';
import FlightDetails from './FlightDetails';
import { Flight } from './types';

enum DataSource {
  AIRLABS = 'airlabs',
  FLIGHTAWARE = 'flightaware',
}

interface FlightDataCacheItem {
  timestamp: number;
  data: Flight[];
}

function FlightTrackerPage() {
  const navigate = useNavigate();
  const mapsRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const activeWaypointsPath = useRef<any>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>(DataSource.AIRLABS);
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const flightDataCache = useRef<Record<DataSource, FlightDataCacheItem | null>>({
    [DataSource.AIRLABS]: null,
    [DataSource.FLIGHTAWARE]: null,
  });

  // data source change
  useEffect(() => {
    // clear any active selections
    setSelectedFlight(null);
    setIsDrawerOpen(false);

    if (activeWaypointsPath.current) {
      activeWaypointsPath.current.setMap(null);
      activeWaypointsPath.current = null;
    }

    async function fetchFlights() {
      if (flightDataCache.current[dataSource] && Date.now() - flightDataCache.current[dataSource]!.timestamp < 60000) {
        setFlights(flightDataCache.current[dataSource]!.data);
        return;
      }
      setIsLoading(true);
      if (dataSource === DataSource.AIRLABS) {
        const flightData = await fetchAirLabsFlightData(true, true);
        flightDataCache.current[dataSource] = { timestamp: Date.now(), data: flightData };
        setFlights(flightData);
      } else if (dataSource === DataSource.FLIGHTAWARE) {
        const flightData = await fetchFlightAwareFlightData();
        flightDataCache.current[dataSource] = { timestamp: Date.now(), data: flightData };
        setFlights(flightData);
      }
      setIsLoading(false);
    }
    fetchFlights();
  }, [dataSource]);

  const handleFlightClick = (flight: Flight, event: any) => {
    event.stopPropagation();
    setSelectedFlight(flight);
    setIsDrawerOpen(true);

    // clear any existing path
    if (activeWaypointsPath.current) {
      activeWaypointsPath.current.setMap(null);
      activeWaypointsPath.current = null;
    }

    if (!flight.waypoints || flight.waypoints.length < 2) {
      return;
    }

    const flightPlanCoordinates = [];
    for (let i = 0; i < flight.waypoints.length - 1; i += 2) {
      flightPlanCoordinates.push({ lat: flight.waypoints[i], lng: flight.waypoints[i + 1] });
    }

    const flightPath = new mapsRef.current.Polyline({
      path: flightPlanCoordinates,
      strokeColor: '#315b7d',
      strokeOpacity: 0.5,
      strokeWeight: 4,
    });
    flightPath.setMap(mapRef.current);
    activeWaypointsPath.current = flightPath;
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.buttonWrapper}>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')} />
        <div className={styles.dataSourceWrapper}>
          <span className={styles.dataSourceLabel}>Data Source:</span>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={dataSource}
            onChange={(value) => setDataSource(value)}
            style={{ width: 120 }}
            options={[
              { value: DataSource.AIRLABS, label: 'AirLabs' },
              { value: DataSource.FLIGHTAWARE, label: 'FlightAware' },
            ]}
          />
        </div>
        <Button
          type="primary"
          shape="circle"
          size="small"
          icon={<QuestionOutlined />}
          onClick={() => setIsHelpOpen(true)}
        />
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
        bootstrapURLKeys={{ key: '$API_KEY' }}
        defaultCenter={{ lat: 41.3015, lng: -95.8945 }}
        defaultZoom={6}
        onGoogleApiLoaded={({ maps, map }) => {
          mapsRef.current = maps;
          mapRef.current = map;
        }}
        yesIWantToUseGoogleMapApiInternals
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
      {activeWaypointsPath.current && (
        <div className={styles.legendContainer}>
          <div className={styles.legend}>
            <span className={styles.legendPlannedIcon}></span>
            <span className={styles.legendLabel}>Planned Path</span>
          </div>
        </div>
      )}
      <Modal title="Omaha Flight Tracker" open={isHelpOpen} onCancel={() => setIsHelpOpen(false)} footer={null}>
        <div className={styles.helpSectionHeader}>AirLabs*</div>
        <div className={styles.helpSectionText}>
          Limited to commercial flights arriving and departing directly from Eppley Airfield (OMA)
        </div>
        <div className={styles.helpSectionHeader}>FlightAware*</div>
        <div className={styles.helpSectionText}>
          All commercial and civil flights in the immediate Omaha area, includes flight paths
        </div>
        <div className={styles.disclaimerText}>
          * Data is limited to Omaha to help stay within free API tier limits, and may be unavailable if monthly usage
          limits are exceeded
        </div>
      </Modal>
    </div>
  );
}

export default FlightTrackerPage;
