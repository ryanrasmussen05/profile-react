import { Flight } from './airLabsUtils';
import styles from './FlightDetails.module.css';
import classNames from 'classnames';

function Details({ text, label }: { text: string | number; label: string }) {
  return (
    <div className={styles.details}>
      <span className={styles.detailsText}>{text}</span>
      <span className={styles.detailsLabel}>{label}</span>
    </div>
  );
}

function FlightDetails({ flight }: { flight: Flight | null }) {
  if (!flight) {
    return <></>;
  }

  const flightNumber = flight.flightNumber && flight.airline ? `${flight.airline}${flight.flightNumber}` : null;

  return (
    <div className={styles.gridContainer}>
      {flightNumber && (
        <div className={classNames(styles.flightNumberCell, styles.gridCell)}>
          <Details text={flightNumber} label="Flight Number" />
        </div>
      )}
      {flight.tailNumber && (
        <div className={classNames(styles.tailNumberCell, styles.gridCell)}>
          <Details text={flight.tailNumber} label="Tail Number" />
        </div>
      )}
      <div className={classNames(styles.aircraftCell, styles.gridCell)}>
        <Details text={flight.aircraft} label="Aircraft" />
      </div>
      <div className={classNames(styles.latitudeCell, styles.gridCell)}>
        <Details text={flight.latitude} label="Latitude" />
      </div>
      <div className={classNames(styles.longitudeCell, styles.gridCell)}>
        <Details text={flight.longitude} label="Longitude" />
      </div>
      <div className={classNames(styles.headingCell, styles.gridCell)}>
        <Details text={flight.heading} label="Heading" />
      </div>
      <div className={classNames(styles.altitudeCell, styles.gridCell)}>
        <Details text={`${flight.altitude.toLocaleString()} ft`} label="Altitude" />
      </div>
      <div className={classNames(styles.speedCell, styles.gridCell)}>
        <Details text={`${flight.speed} mph`} label="Speed" />
      </div>
      <div className={classNames(styles.originCell, styles.gridCell)}>
        <Details text={flight.departureAirport ?? '???'} label="Origin" />
      </div>
      <div className={classNames(styles.destinationCell, styles.gridCell)}>
        <Details text={flight.destinationAirport ?? '???'} label="Destination" />
      </div>
    </div>
  );
}

export default FlightDetails;

// picture?
// flight number (if available)
// tail number
// aircraft
// lat long
// heading
// altitude
// speed
// departure destination
