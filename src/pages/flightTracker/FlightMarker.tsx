import AirplaneSVG from './AirplaneSVG';
import { Flight } from './airLabsUtils';
import styles from './FlightMarker.module.css';
import { Popover } from 'antd';

function FlightMarker({ flight }: { flight: Flight, lat?: number, lng?: number}) {
  return (
    <Popover content={content(flight)} trigger="click">
      <button className={styles.button}><AirplaneSVG rotation={flight.heading} /></button>
    </Popover>
  );
}

function content(flight: Flight) {
  return (
    <div className={styles.contentContainer}>
      <div className={styles.contentLine}>
        <span className={styles.contentLabel}>Flight Number:</span>
        <span>{flight.flightNumber || 'N/A'}</span>
      </div>
      <div className={styles.contentLine}>
        <span className={styles.contentLabel}>Airline:</span>
        <span>{flight.airline || 'N/A'}</span>
      </div>
      <div className={styles.contentLine}>
        <span className={styles.contentLabel}>Aircraft:</span>
        <span>{flight.aircraft || 'N/A'}</span>
      </div>
      <div className={styles.contentLine}>
        <span className={styles.contentLabel}>Altitude:</span>
        <span>{flight.altitude ? `${flight.altitude} ft` : 'N/A'}</span>
      </div>
      <div className={styles.contentLine}>
        <span className={styles.contentLabel}>Speed:</span>
        <span>{flight.speed ? `${flight.speed} MPH` : 'N/A'}</span>
      </div>
      <div className={styles.contentLine}>
        <span className={styles.contentLabel}>Route:</span>
        <span>{flight.departureAirport && flight.destinationAirport ? `${flight.departureAirport} -> ${flight.destinationAirport}` : 'N/A'}</span>
      </div>
    </div>
  );
}

export default FlightMarker;