import { Button, Drawer, Modal, Select, message, notification } from 'antd';
import styles from './FlightTrackerPage.module.css';
import { ArrowLeftOutlined, QuestionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { fetchFlightData as fetchAirLabsFlightData } from './airLabsUtils';
import {
  fetchFlightData as fetchFlightAwareFlightData,
  fetchFlightTrack,
  fetchMockFlightData,
} from './flightAwareUtils';
import GoogleMapReact from 'google-map-react';
import FlightMarker from './FlightMarker';
import FlightDetails from './FlightDetails';
import FlightDetailsCard from './FlightDetailsCard';
import { Flight } from './types';
import useScreenSize from '../../hooks/useScreenSize';

enum DataSource {
  AIRLABS = 'airlabs',
  FLIGHTAWARE = 'flightaware',
}

const MOBILE_WIDTH_THRESHOLD = 768;

interface FlightDataCacheItem {
  timestamp: number;
  data: Flight[];
}

function FlightTrackerPage() {
  const navigate = useNavigate();
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const [messageApi, messageContextHolder] = message.useMessage({ top: '90%' as unknown as number });
  const mapsRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const activeWaypointsPath = useRef<any>(null);
  const activeTrackPath = useRef<any>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>(DataSource.AIRLABS);
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailsCardOpen, setIsDetailsCardOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const flightDataCache = useRef<Record<DataSource, FlightDataCacheItem | null>>({
    [DataSource.AIRLABS]: null,
    [DataSource.FLIGHTAWARE]: null,
  });
  const { width: screenWidth } = useScreenSize();

  const isMobile = screenWidth <= MOBILE_WIDTH_THRESHOLD;

  const showTrackLegend = !!selectedFlight && dataSource === DataSource.FLIGHTAWARE;

  const clearMapSelections = () => {
    setSelectedFlight(null);
    setIsDrawerOpen(false);
    setIsDetailsCardOpen(false);

    if (activeWaypointsPath.current) {
      activeWaypointsPath.current.setMap(null);
      activeWaypointsPath.current = null;
    }
    if (activeTrackPath.current) {
      activeTrackPath.current.setMap(null);
      activeTrackPath.current = null;
    }
  };

  // data source change
  useEffect(() => {
    clearMapSelections();

    async function fetchFlights() {
      // use cached data if available and less than 1 minute old
      if (flightDataCache.current[dataSource] && Date.now() - flightDataCache.current[dataSource]!.timestamp < 60000) {
        setFlights(flightDataCache.current[dataSource]!.data);
        setMapPositionForDataSource(dataSource);
        return;
      }

      // fetch new data
      setIsLoading(true);
      messageApi.open({
        type: 'loading',
        content: 'Loading data...',
        duration: 0,
      });
      try {
        if (dataSource === DataSource.AIRLABS) {
          const flightData = await fetchAirLabsFlightData();
          flightDataCache.current[dataSource] = { timestamp: Date.now(), data: flightData };
          setFlights(flightData);
        } else if (dataSource === DataSource.FLIGHTAWARE) {
          const flightData = await fetchFlightAwareFlightData();
          flightDataCache.current[dataSource] = { timestamp: Date.now(), data: flightData };
          setFlights(flightData);
        }
        setMapPositionForDataSource(dataSource);
      } catch (error: any) {
        console.error('Failed to fetch flight data:', error);
        // handle FA quota exceeded error (show mock data instead of error message)
        if (error.message === 'Quota exceeded - flightAwareUtils') {
          notificationApi.info({
            message: 'Quota Exceeded',
            description: `FlightAware monthly quota exceeded, please try again next month. Displaying mock data for now.`,
            duration: 10,
            placement: 'bottomRight',
          });
          setFlights(fetchMockFlightData());
          setMapPositionForDataSource(dataSource);
        } else {
          notificationApi.error({
            message: 'Error',
            description: `Failed to fetch flights from ${dataSource}`,
            duration: 4.5,
            placement: 'bottomRight',
          });
        }
      }

      // cleanup loading state
      setIsLoading(false);
      messageApi.destroy();
    }
    fetchFlights();
  }, [dataSource, notificationApi, messageApi]);

  const handleOpenDetails = () => {
    if (isMobile) {
      setIsDetailsCardOpen(true);
    } else {
      setIsDrawerOpen(true);
    }
  };

  const handleShowMoreDetails = () => {
    setIsDetailsCardOpen(false);
    setIsDrawerOpen(true);
  };

  const handleFlightClick = (flight: Flight, event: any) => {
    event.stopPropagation();
    setSelectedFlight(flight);
    handleOpenDetails();

    // clear any existing path
    if (activeWaypointsPath.current) {
      activeWaypointsPath.current.setMap(null);
      activeWaypointsPath.current = null;
    }
    if (activeTrackPath.current) {
      activeTrackPath.current.setMap(null);
      activeTrackPath.current = null;
    }

    // set actual path
    fetchFlightTrack(flight)
      .then((flightWithTrack) => {
        if (flightWithTrack.track) {
          const track = flightWithTrack.track;
          const trackCoordinates = track.positions.map((position) => ({
            lat: position.latitude,
            lng: position.longitude,
          }));
          const trackPath = new mapsRef.current.Polyline({
            path: trackCoordinates,
            strokeColor: '#ff0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
          });
          trackPath.setMap(mapRef.current);
          activeTrackPath.current = trackPath;
        }
      })
      .catch((error) => {
        console.error('Failed to fetch flight track:', error);
        if (error.message === 'rate quota exceeded - flightAwareUtils') {
          notificationApi.error({
            message: 'Error',
            description: 'Quota rate exceeded, please try again later',
            duration: 3,
            placement: 'bottomRight',
          });
        } else {
          notificationApi.error({
            message: 'Error',
            description: 'Failed to load track',
            duration: 3,
            placement: 'bottomRight',
          });
        }
      });

    // set planned path
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

  const setMapPositionForDataSource = (dataSource: DataSource) => {
    if (dataSource === DataSource.AIRLABS) {
      mapRef.current?.setCenter({ lat: 41.3015, lng: -95.8945 });
      mapRef.current?.setZoom(6);
    } else if (dataSource === DataSource.FLIGHTAWARE) {
      mapRef.current?.setCenter({ lat: 41.2427, lng: -96.0445 });
      mapRef.current?.setZoom(9);
    }
  };

  return (
    <div className={styles.page}>
      {notificationContextHolder}
      {messageContextHolder}
      <div className={styles.buttonWrapper}>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')} />
        <div className={styles.dataSourceWrapper}>
          <span className={styles.dataSourceLabel}>Data Source:</span>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={dataSource}
            onChange={(value) => setDataSource(value)}
            style={{ width: 128 }}
            size="large"
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
        options={{ fullscreenControl: false }}
        onGoogleApiLoaded={({ maps, map }) => {
          mapsRef.current = maps;
          mapRef.current = map;
          map.addListener('click', clearMapSelections);
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
      {showTrackLegend && (
        <div className={styles.legendContainer}>
          <div className={styles.legend}>
            <span className={styles.legendPlannedIcon}></span>
            <span className={styles.legendLabel}>Planned Path</span>
            <span className={styles.legendTrackIcon}></span>
            <span className={styles.legendLabel}>Actual Path</span>
          </div>
        </div>
      )}
      {isDetailsCardOpen && (
        <div className={styles.cardContainer}>
          <FlightDetailsCard flight={selectedFlight} onDetailsClick={handleShowMoreDetails} />
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
