import { Flight } from './airLabsUtils';
import styles from './FlightDetails.module.css';
import classNames from 'classnames';

function FlightDetails({ flight }: { flight: Flight | null }) {
  if (!flight) {
    return <></>;
  }

  const flightNumber = flight.flightNumber && flight.airline ? `${flight.airline}${flight.flightNumber}` : null;

  return (
    <div className={styles.gridContainer}>
      {flightNumber && <div className={classNames(styles.flightNumberCell, styles.gridCell)}>{flightNumber}</div>}
      {flight.tailNumber && (
        <div className={classNames(styles.tailNumberCell, styles.gridCell)}>{flight.tailNumber}</div>
      )}
      <div className={classNames(styles.aircraftCell, styles.gridCell)}>{flight.aircraft}</div>
      <div className={classNames(styles.latitudeCell, styles.gridCell)}>Latitude: {flight.latitude}</div>
      <div className={classNames(styles.longitudeCell, styles.gridCell)}>Longitude: {flight.longitude}</div>
      <div className={classNames(styles.headingCell, styles.gridCell)}>Heading: {flight.heading}</div>
      <div className={classNames(styles.altitudeCell, styles.gridCell)}>Altitude: {flight.altitude}</div>
      <div className={classNames(styles.speedCell, styles.gridCell)}>Speed: {flight.speed}</div>
      <div className={classNames(styles.originCell, styles.gridCell)}>Origin: {flight.departureAirport}</div>
      <div className={classNames(styles.destinationCell, styles.gridCell)}>
        Destination: {flight.destinationAirport}
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
