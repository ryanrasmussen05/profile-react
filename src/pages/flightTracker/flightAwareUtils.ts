import { flightAwareMockFlights, flightAwareMockTrackMap } from './mockData';
import { Flight, FlightAwareFlight, FlightAwareFlightTrack } from './types';

const SEARCH_URL = 'https://flightawareomahaflights-7vj4jmsdna-uc.a.run.app';
const TRACK_URL = 'https://flightawareflighttrack-7vj4jmsdna-uc.a.run.app';

export async function fetchFlightData(): Promise<Flight[]> {
  const url = new URL(SEARCH_URL);
  const response = await fetch(url.toString());
  const data: FlightAwareFlight[] = await response.json();

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Quota exceeded - flightAwareUtils');
    }
    throw new Error('Failed while finding FlightAware flights - flightAwareUtils');
  }

  return data.map(toFlight);
}

export async function fetchFlightTrack(flight: Flight): Promise<Flight> {
  if (!flight.flightAwareId || flight.track) {
    return flight;
  }
  const url = new URL(TRACK_URL);
  url.searchParams.set('flightId', flight.flightAwareId);
  const response = await fetch(url.toString());
  const track = (await response.json()) as FlightAwareFlightTrack;

  if (!response.ok) {
    throw new Error('Failed to fetch flight track - flightAwareUtils');
  }

  flight.track = track;
  return flight;
}

export function fetchMockFlightData(): Flight[] {
  const flights = flightAwareMockFlights.map(toFlight);
  flights.forEach((flight) => {
    flight.track = flightAwareMockTrackMap[flight.flightAwareId as string];
  });
  return flights;
}

function toFlight(flightAwareFlight: FlightAwareFlight): Flight {
  return {
    latitude: flightAwareFlight.last_position.latitude,
    longitude: flightAwareFlight.last_position.longitude,
    altitude: flightAwareFlight.last_position.altitude * 100, // hundreds of feet to feet
    heading: flightAwareFlight.last_position.heading,
    speed: Math.floor(flightAwareFlight.last_position.groundspeed * 1.15078), // knots to mph
    flightNumber: flightAwareFlight.flightNumber ?? undefined,
    aircraft: flightAwareFlight.aircraft_type,
    airline: flightAwareFlight.ident_icao,
    departureAirport: flightAwareFlight.origin?.code_iata || flightAwareFlight.origin?.code_icao,
    departureAirportDetails: flightAwareFlight.origin ?? undefined,
    destinationAirport: flightAwareFlight.destination?.code_iata || flightAwareFlight.destination?.code_icao,
    destinationAirportDetails: flightAwareFlight.destination ?? undefined,
    tailNumber: flightAwareFlight.registration ?? undefined,
    waypoints: flightAwareFlight.waypoints,
    flightAwareId: flightAwareFlight.fa_flight_id,
  };
}
