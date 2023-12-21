const API_KEY = '98b44bac-c957-4afa-88ff-1ada321e9316';
const BASE_URL = 'https://airlabs.co/api/v9/flights';

// const mockDeparture = [
//   [
//       41.475902,
//       -96.064389,
//       876,
//       133,
//       314,
//       "en-route",
//       "642",
//       "B737",
//       "SWA",
//       "DEN",
//       "OMA"
//   ],
//   [
//       41.415152,
//       -96.002623,
//       853,
//       144,
//       305,
//       "en-route",
//       "1586",
//       "B739",
//       "UAL",
//       "DEN",
//       "OMA"
//   ],
//   [
//       37.053812,
//       -103.188132,
//       11285,
//       65,
//       868,
//       "en-route",
//       "2203",
//       "A320",
//       "AAL",
//       "PHX",
//       "OMA"
//   ],
//   [
//       34.025482,
//       -118.151121,
//       2423,
//       68,
//       492,
//       "en-route",
//       "4924",
//       "E75L",
//       "SKW",
//       "LAX",
//       "OMA"
//   ],
//   [
//       40.769806,
//       -73.88237,
//       0,
//       51,
//       5,
//       "scheduled",
//       "5714",
//       "E170",
//       "RPA",
//       "LGA",
//       "OMA"
//   ],
//   [
//       29.447735,
//       -83.21368,
//       10972,
//       324.3,
//       703,
//       "en-route",
//       "785",
//       "B38M",
//       "SWA",
//       "MCO",
//       "OMA"
//   ],
//   [
//       41.558121,
//       -90.216605,
//       12192,
//       270.9,
//       792,
//       "en-route",
//       "792",
//       "CL35",
//       "EJA",
//       "TEB",
//       "OMA"
//   ],
//   [
//       41.345184,
//       -95.930682,
//       518,
//       144,
//       194,
//       "en-route",
//       "811",
//       "C560",
//       "SLH",
//       "PWK",
//       "OMA"
//   ],
//   [
//       41.301498,
//       -95.894547,
//       274,
//       163,
//       18,
//       "landed",
//       "3625",
//       "E75L",
//       "SKW",
//       "MSP",
//       "OMA"
//   ],
//   [
//       42.806763,
//       -99.683013,
//       10668,
//       114,
//       861,
//       "en-route",
//       "312",
//       "B739",
//       "ASA",
//       "SEA",
//       "OMA"
//   ],
//   [
//       31.832048,
//       -96.127176,
//       9753,
//       348.9,
//       837,
//       "en-route",
//       "4691",
//       "CRJ7",
//       "SKW",
//       "IAH",
//       "OMA"
//   ],
//   [
//       29.351944,
//       -93.91858,
//       8267,
//       273.8,
//       703,
//       "en-route",
//       "3513",
//       "B38M",
//       "SWA",
//       "PWM",
//       "OMA"
//   ],
//   [
//       41.622215,
//       -81.449249,
//       13106,
//       273,
//       683,
//       "en-route",
//       null,
//       "C56X",
//       "EGC",
//       "PVD",
//       "OMA"
//   ],
//   [
//       41.073257,
//       -95.639404,
//       1737,
//       354,
//       322,
//       "en-route",
//       null,
//       "BT36",
//       null,
//       "OJC",
//       "OMA"
//   ],
//   [
//       41.30302,
//       -95.886337,
//       0,
//       146,
//       0,
//       "landed",
//       null,
//       "PRM1",
//       null,
//       "MKC",
//       "OMA"
//   ]
// ]

// const mockArrival = [
//     [
//         42.127355,
//         -88.384116,
//         1424,
//         219.6,
//         374,
//         "en-route",
//         "5360",
//         "E75L",
//         "SKW",
//         "OMA",
//         "ORD"
//     ],
//     [
//         41.290625,
//         -92.849704,
//         9875,
//         82,
//         870,
//         "en-route",
//         "5625",
//         "E75S",
//         "RPA",
//         "OMA",
//         "LGA"
//     ],
//     [
//         39.886688,
//         -93.015986,
//         11529,
//         134,
//         880,
//         "en-route",
//         "2799",
//         "B737",
//         "SWA",
//         "OMA",
//         "MCO"
//     ],
//     [
//         36.570923,
//         -95.439949,
//         11582,
//         183,
//         814,
//         "en-route",
//         "2842",
//         "B38M",
//         "SWA",
//         "OMA",
//         "DAL"
//     ],
//     [
//         38.845329,
//         -103.821533,
//         6697,
//         278,
//         616,
//         "en-route",
//         "3",
//         "C56X",
//         "JTL",
//         "OMA",
//         "APA"
//     ],
//     [
//         27.78177,
//         -82.975194,
//         1386,
//         166,
//         374,
//         "en-route",
//         "2723",
//         "A320",
//         "AAY",
//         "OMA",
//         "PIE"
//     ],
//     [
//         41.546997,
//         -85.675007,
//         10668,
//         90,
//         901,
//         "en-route",
//         "4390",
//         "E75L",
//         "RPA",
//         "OMA",
//         "LGA"
//     ],
//     [
//         36.577676,
//         -87.663594,
//         9738,
//         118,
//         885,
//         "en-route",
//         "2632",
//         "B712",
//         "DAL",
//         "OMA",
//         "ATL"
//     ],
//     [
//         44.908478,
//         -93.282166,
//         480,
//         121,
//         220,
//         "en-route",
//         "3831",
//         "E75L",
//         "SKW",
//         "OMA",
//         "MSP"
//     ],
//     [
//         41.216653,
//         -95.969946,
//         2476,
//         250.9,
//         464,
//         "en-route",
//         "489",
//         "C25B",
//         "ASP",
//         "OMA",
//         "RIL"
//     ],
//     [
//         41.36087,
//         -94.546143,
//         7658,
//         86.7,
//         746,
//         "en-route",
//         "5686",
//         "E75S",
//         "RPA",
//         "OMA",
//         "DCA"
//     ],
//     [
//         39.992844,
//         -101.473816,
//         10370,
//         251.8,
//         800,
//         "en-route",
//         "3251",
//         "A20N",
//         "FFT",
//         "OMA",
//         "LAS"
//     ],
//     [
//         39.755658,
//         -100.586365,
//         11582,
//         247.1,
//         774,
//         "en-route",
//         "150",
//         "B737",
//         "SWA",
//         "OMA",
//         "PHX"
//     ],
//     [
//         39.970322,
//         -103.340759,
//         11094,
//         254.7,
//         787,
//         "en-route",
//         "50",
//         "A319",
//         "AAY",
//         "OMA",
//         "LAS"
//     ],
//     [
//         32.734249,
//         -117.196953,
//         0,
//         327,
//         1,
//         "scheduled",
//         "2243",
//         "B737",
//         "SWA",
//         "OMA",
//         "MKE"
//     ]
// ];

export interface Flight {
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    speed: number;
    status: string;
    flightNumber: string;
    aircraft: string;
    airline: string;
    departureAirport: string;
    destinationAirport: string;
}

export async function fetchFlightData(incoming: boolean, outgoing: boolean): Promise<Flight[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('_view', 'array');
  url.searchParams.set('_fields', 'lat,lng,alt,dir,speed,status,flight_number,aircraft_icao,airline_icao,dep_iata,arr_iata');

  const flights = [];

  // add try catch
  // add parsing flight info with type

  if (incoming) {
    url.searchParams.set('arr_iata', 'OMA');
    const response = await fetch(url.toString());
    const data = await response.json();
    const incomingFlights = parseAndFilterFlights(data);
    flights.push(...incomingFlights);
  }

  url.searchParams.delete('arr_iata');

  if (outgoing) {
    url.searchParams.set('dep_iata', 'OMA');
    const response = await fetch(url.toString());
    const data = await response.json();
    const outgoingFlights = parseAndFilterFlights(data);
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
    altitude: Math.floor((flightArray[2] || 0) * 3.28084),
    heading: flightArray[3],
    speed: Math.floor((flightArray[4] || 0) * 0.621371),
    status: flightArray[5],
    flightNumber: flightArray[6],
    aircraft: flightArray[7],
    airline: flightArray[8],
    departureAirport: flightArray[9],
    destinationAirport: flightArray[10],
  }
}
