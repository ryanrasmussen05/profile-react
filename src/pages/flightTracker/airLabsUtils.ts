const API_KEY = '98b44bac-c957-4afa-88ff-1ada321e9316'; // todo remove this
const BASE_URL = 'https://airlabs.co/api/v9/flights';

const mockDeparture = [
  [40.99678, -95.074075, 5902, 116.1, 768, 'en-route', '2046', 'B738', 'SWA', 'OMA', 'MCO', 'N8324A'],
  [42.508779, -98.784537, 10825, 299, 750, 'en-route', '361', 'B39M', 'ASA', 'OMA', 'SEA', 'N976AK'],
  [40.798008, -97.20773, 6108, 63.6, 704, 'en-route', '4835', 'E75L', 'AAL', 'OMA', 'LAX', 'N506SY'],
  [39.838781, -100.366309, 8485, 249.1, 774, 'en-route', '2203', 'A319', 'AAL', 'OMA', 'PHX', 'N724UW'],
  [40.12668, -109.393463, 10025, 273.5, 732, 'en-route', '3679', 'E75L', 'DAL', 'OMA', 'SLC', 'N297SY'],
  [36.896648, -106.868291, 11640, 230.5, 630, 'en-route', '3247', 'B737', 'SWA', 'OMA', 'PHX', 'N451WN'],
  [37.259625, -105.96818, 9781, 234.7, 643, 'en-route', '713', 'A320', 'AAY', 'OMA', 'AZA', 'N255NV'],
  [39.451112, -80.567064, 11419, 106.2, 756, 'en-route', '2229', 'B737', 'SWA', 'OMA', 'DCA', 'N7866A'],
  [41.545816, -87.974864, 9125, 271.3, 744, 'en-route', '4803', 'CRJ9', 'EDV', 'OMA', 'LGA', 'N310PQ'],
  [41.677145, -87.88785, 1023, 39.3, 352, 'en-route', '2186', 'B737', 'SWA', 'OMA', 'MDW', 'N919WN'],
  [40.418961, -102.700863, 9659, 256.9, 683, 'en-route', '1592', 'B739', 'UAL', 'OMA', 'DEN', 'N75425'],
  [38.917127, -109.883846, 10908, 233.2, 715, 'en-route', '2234', 'B738', 'SWA', 'OMA', 'LAS', 'N8564Z'],
];

const mockArrival = [
  [32.723369, -86.032768, 13332, 323.6, 710, 'en-route', '385', 'C56X', 'SLH', 'APF', 'OMA', 'N385SH'],
  [36.511789, -96.836582, 8318, 356.7, 791, 'en-route', '2269', 'B738', 'AAL', 'DFW', 'OMA', 'N992AN'],
  [37.01939, -107.486049, 11328, 62.3, 1065, 'en-route', '973', 'B38M', 'SWA', 'PHX', 'OMA', 'N8788L'],
  [40.744999, -99.813653, 11518, 78.6, 936, 'en-route', '1386', 'B737', 'SWA', 'DEN', 'OMA', 'N7885A'],
  [36.196326, -114.95567, 5460, 90.8, 688, 'en-route', '1257', 'B737', 'SWA', 'LAS', 'OMA', 'N563WN'],
  [41.446536, -83.840313, 9194, 274.5, 783, 'en-route', '4803', 'CRJ9', 'EDV', 'LGA', 'OMA', 'N310PQ'],
];
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

export async function fetchFlightData(incoming: boolean, outgoing: boolean): Promise<Flight[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('_view', 'array');
  url.searchParams.set(
    '_fields',
    'lat,lng,alt,dir,speed,status,flight_number,aircraft_icao,airline_icao,dep_iata,arr_iata,reg_number'
  );

  const flights = [];

  if (incoming) {
    // url.searchParams.set('arr_iata', 'OMA');
    // const response = await fetch(url.toString());
    // const data = await response.json();
    const incomingFlights = parseAndFilterFlights(mockArrival);
    flights.push(...incomingFlights);
  }

  url.searchParams.delete('arr_iata');

  if (outgoing) {
    // url.searchParams.set('dep_iata', 'OMA');
    // const response = await fetch(url.toString());
    // const data = await response.json();
    const outgoingFlights = parseAndFilterFlights(mockDeparture);
    flights.push(...outgoingFlights);
  }

  return flights;
}

function parseAndFilterFlights(flights: any[]) {
  const parsedFlights = flights.map(toFlight);
  return parsedFlights.filter((flight) => flight.status === 'en-route');
}

function toFlight(flightArray: any): Flight {
  return {
    latitude: flightArray[0],
    longitude: flightArray[1],
    altitude: Math.floor((flightArray[2] || 0) * 3.28084), // meters to feet
    heading: flightArray[3],
    speed: Math.floor((flightArray[4] || 0) * 0.621371), // kph to mph
    status: flightArray[5],
    flightNumber: flightArray[6],
    aircraft: flightArray[7],
    airline: flightArray[8],
    departureAirport: flightArray[9],
    destinationAirport: flightArray[10],
    tailNumber: flightArray[11],
  };
}
