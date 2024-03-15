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

  if (!response.ok) {
    if (response.status === 404) throw new Error('Image not found');
    else throw new Error('Failed to fetch image');
  }

  return data as AircraftPhoto;
}
