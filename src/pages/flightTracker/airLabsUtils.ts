const BASE_URL = 'https://airlabsflights-7vj4jmsdna-uc.a.run.app';

export interface Flight {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  speed: number;
  status: string;
  flightNumber?: string;
  aircraft: string;
  airline?: string;
  departureAirport: string;
  destinationAirport: string;
  tailNumber?: string;
}

export async function fetchFlightData(): Promise<Flight[]> {
  const url = new URL(BASE_URL);
  const response = await fetch(url.toString());
  const data = await response.json();
  const flights = parseAndFilterFlights(data);

  return flights;
}

function parseAndFilterFlights(flights: any[]) {
  const parsedFlights = flights.map(toFlight);
  return parsedFlights.filter((flight) => flight.status === 'en-route');
}

function toFlight(flightArray: any): Flight {
  const flightNumber = flightArray[6];
  const flightAirline = flightArray[8];

  return {
    latitude: flightArray[0],
    longitude: flightArray[1],
    altitude: Math.floor((flightArray[2] || 0) * 3.28084), // meters to feet
    heading: flightArray[3],
    speed: Math.floor((flightArray[4] || 0) * 0.621371), // kph to mph
    status: flightArray[5],
    flightNumber: flightNumber && flightAirline ? `${flightAirline}${flightNumber}` : undefined,
    aircraft: flightArray[7],
    airline: flightArray[8],
    departureAirport: flightArray[9],
    destinationAirport: flightArray[10],
    tailNumber: flightArray[11],
  };
}
