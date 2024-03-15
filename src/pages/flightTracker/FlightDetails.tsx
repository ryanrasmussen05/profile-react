import { useEffect, useRef, useState } from 'react';
import styles from './FlightDetails.module.css';
import classNames from 'classnames';
import { fetchAircraftPhoto } from './aircraftPhotoUtils';
import { Popover, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Flight, FlightAwareAirport } from './types';

function Details({ text, label }: { text: string | number; label: string }) {
  return (
    <div className={styles.details}>
      <span className={styles.detailsText}>{text}</span>
      <span className={styles.detailsLabel}>{label}</span>
    </div>
  );
}

function AircraftPhoto({ photoURL }: { photoURL: string }) {
  if (photoURL === 'not found') {
    return (
      <div className={styles.imageNotFound}>
        <ExclamationCircleOutlined />
        <span className={styles.imageNotFoundText}>Aircraft photo not available</span>
      </div>
    );
  }
  return <img className={styles.image} src={photoURL} alt="Aircarft photo" />;
}

function AirportDetails({
  label,
  name,
  airportDetails,
}: {
  label: string;
  name: string;
  airportDetails?: FlightAwareAirport;
}) {
  if (!airportDetails) {
    return <Details text={name ?? '???'} label={label} />;
  }

  const popupContent = (
    <div className={styles.airportDetails}>
      <span className={styles.airportDetailsName}>{airportDetails.name}</span>
      <span className={styles.airportDetailsCity}>{airportDetails.city}</span>
    </div>
  );

  return (
    <div className={styles.details}>
      <div>
        <Popover content={popupContent} trigger="click">
          <span className={styles.moreDetailsText}>{name}</span>
        </Popover>
      </div>
      <span className={styles.detailsLabel}>{label}</span>
    </div>
  );
}

function FlightDetails({ flight }: { flight: Flight | null }) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [aircraftPhotoURL, setAircraftPhotoURL] = useState<string | null>(null);

  const imageCache = useRef(new Map<string, string>());

  useEffect(() => {
    // clear photo when flight changes
    setAircraftPhotoURL(null);

    async function fetchPhoto() {
      if (!flight || !flight.tailNumber) {
        setAircraftPhotoURL(null);
        return;
      }

      // check cache
      if (imageCache.current.has(flight.tailNumber)) {
        const cachedURL = imageCache.current.get(flight.tailNumber) as string;
        setAircraftPhotoURL(cachedURL);
        return;
      }

      setIsImageLoading(true);
      try {
        const photosData = await fetchAircraftPhoto(flight.tailNumber);
        imageCache.current.set(flight.tailNumber, photosData.url);
        setAircraftPhotoURL(photosData.url);
      } catch (error) {
        console.error('Failed to fetch photo:', error);
        console.log('Image not found for tail number:', flight.tailNumber);
        imageCache.current.set(flight.tailNumber, 'not found');
        setAircraftPhotoURL('not found');
      }
      setIsImageLoading(false);
    }
    fetchPhoto();
  }, [flight]);

  if (!flight) {
    return <></>;
  }

  return (
    <>
      {isImageLoading && (
        <div className={styles.imageLoading}>
          <Spin size="small" />
          <span className={styles.imageLoadingText}>Finding photo</span>
        </div>
      )}
      {aircraftPhotoURL && <AircraftPhoto photoURL={aircraftPhotoURL} />}
      <div className={styles.gridContainer}>
        {flight.flightNumber && (
          <div className={classNames(styles.flightNumberCell, styles.gridCell)}>
            <Details text={flight.flightNumber} label="Flight Number" />
          </div>
        )}
        {flight.tailNumber && (
          <div className={classNames(styles.tailNumberCell, styles.gridCell)}>
            <Details text={flight.tailNumber} label="Tail Number" />
          </div>
        )}
        <div className={classNames(styles.aircraftCell, styles.gridCell)}>
          <Details text={flight.aircraft ?? '???'} label="Aircraft" />
        </div>
        <div className={classNames(styles.latitudeCell, styles.gridCell)}>
          <Details text={flight.latitude} label="Latitude" />
        </div>
        <div className={classNames(styles.longitudeCell, styles.gridCell)}>
          <Details text={flight.longitude} label="Longitude" />
        </div>
        <div className={classNames(styles.headingCell, styles.gridCell)}>
          <Details text={flight.heading ?? '???'} label="Heading" />
        </div>
        <div className={classNames(styles.altitudeCell, styles.gridCell)}>
          <Details text={`${flight.altitude.toLocaleString()} ft`} label="Altitude" />
        </div>
        <div className={classNames(styles.speedCell, styles.gridCell)}>
          <Details text={`${flight.speed} mph`} label="Speed" />
        </div>
        <div className={classNames(styles.originCell, styles.gridCell)}>
          <AirportDetails
            label="Origin"
            name={flight.departureAirport ?? '???'}
            airportDetails={flight.departureAirportDetails}
          />
        </div>
        <div className={classNames(styles.destinationCell, styles.gridCell)}>
          <AirportDetails
            label="Destination"
            name={flight.destinationAirport ?? '???'}
            airportDetails={flight.destinationAirportDetails}
          />
        </div>
      </div>
    </>
  );
}

export default FlightDetails;
