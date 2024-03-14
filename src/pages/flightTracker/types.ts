export interface Flight {
  latitude: number;
  longitude: number;
  altitude: number; // feet
  heading: number | null;
  speed: number; // mph
  status?: string;
  flightNumber?: string;
  aircraft: string;
  airline?: string | null;
  departureAirport?: string | null;
  destinationAirport?: string | null;
  tailNumber?: string;
  departureAirportDetails?: FlightAwareAirport;
  destinationAirportDetails?: FlightAwareAirport;
  waypoints?: number[];
}

export interface FlightAwareFlight {
  ident: string;
  ident_icao: string | null;
  ident_iata: string | null;
  ident_prefix: string | null;
  fa_flight_id: string;
  origin: FlightAwareAirport | null;
  destination: FlightAwareAirport | null;
  first_position_time: string | null;
  last_position: FlightAwareFlightPosition;
  aircraft_type: string;
  actual_off: string | null;
  actual_on: string | null;
  foresight_predictions_available: boolean;
  predicted_off: string | null;
  predicted_on: string | null;
  predicted_out: string | null;
  predicted_in: string | null;
  predicted_off_source: string | null;
  predicted_on_source: string | null;
  predicted_out_source: string | null;
  predicted_in_source: string | null;
  waypoints: number[];
  bounding_box: number[];
  flightNumber: string | null;
  registration: string | null;
}

export interface FlightAwareAirport {
  code: string | null;
  code_icao: string | null;
  code_iata: string | null;
  code_lid: string | null;
  name: string | null;
  city: string | null;
  timezone: string | null;
  airport_info_url: string | null;
}

export interface FlightAwareFlightPosition {
  fa_flight_id: string | null;
  altitude: number; // hundreds of feet
  groundspeed: number; // knots
  heading: number | null;
  latitude: number;
  longitude: number;
  timestamp: string;
  altitude_change: string | null;
  update_type: string | null;
}
