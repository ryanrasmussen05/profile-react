import AirplaneSVG from './AirplaneSVG';
import { Flight } from './airLabsUtils';
import styles from './FlightMarker.module.css';

function FlightMarker({
  flight,
  onClick,
}: {
  flight: Flight;
  onClick: (flight: Flight) => void;
  lat?: number;
  lng?: number;
}) {
  return (
    <button className={styles.button} onClick={() => onClick(flight)}>
      <AirplaneSVG rotation={flight.heading} />
    </button>
  );
}

export default FlightMarker;
