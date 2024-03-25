import styles from './FlightDetailsCard.module.css';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { Flight } from './types';

function Details({ text, label }: { text: string | number; label: string }) {
  return (
    <div className={styles.details}>
      <span className={styles.detailsLabel}>{`${label}:`}</span>
      <span className={styles.detailsText}>{text}</span>
    </div>
  );
}

function Route({ origin, destination }: { origin: string; destination: string }) {
  return (
    <div className={styles.details}>
      <span className={styles.detailsLabel}>{`Route:`}</span>
      <div className={styles.detailsText}>
        <span className={styles.origin}>{origin}</span>
        <ArrowRightOutlined />
        <span className={styles.destination}>{destination}</span>
      </div>
    </div>
  );
}

function FlightDetailsCard({ flight, onDetailsClick }: { flight: Flight | null; onDetailsClick: () => void }) {
  if (!flight) {
    return <></>;
  }

  const detailsButton = (
    <Button className={styles.detailsButton} type="link" onClick={onDetailsClick}>
      More Details
    </Button>
  );

  return (
    <Card className={styles.card} title={flight.flightNumber || flight.tailNumber} size="small" extra={detailsButton}>
      <Details text={flight.aircraft ?? '???'} label="Aircraft" />
      <Details text={flight.tailNumber ?? '???'} label="Tail Number" />
      <Route origin={flight.departureAirport ?? '???'} destination={flight.destinationAirport ?? '???'} />
    </Card>
  );
}

export default FlightDetailsCard;
