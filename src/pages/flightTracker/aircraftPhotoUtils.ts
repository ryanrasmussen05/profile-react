const BASE_URL = 'https://aircraftimage-7vj4jmsdna-uc.a.run.app';

export interface AircraftPhoto {
  url: string;
  error?: string;
}

export async function fetchAircraftPhoto(tailNumber: string): Promise<AircraftPhoto> {
  const url = new URL(BASE_URL);
  url.searchParams.set('tailNumber', tailNumber);

  const response = await fetch(url.toString());
  const data = await response.json();

  return data as AircraftPhoto;
}
