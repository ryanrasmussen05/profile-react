import AirplaneSVG from './AirplaneSVG';
import styles from './FlightMarker.module.css';
import classNames from 'classnames';
import { Flight } from './types';

function FlightMarker({
  flight,
  onClick,
  selected,
}: {
  flight: Flight;
  onClick: (flight: Flight) => void;
  selected: boolean;
  lat?: number;
  lng?: number;
}) {
  return (
    <button
      className={classNames({ [`${styles.button}`]: true, [`${styles.selected}`]: selected })}
      onClick={() => onClick(flight)}
    >
      <AirplaneSVG rotation={flight.heading ?? undefined} />
    </button>
  );
}

export default FlightMarker;
