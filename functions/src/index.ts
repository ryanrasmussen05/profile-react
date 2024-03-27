import got from 'got';
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { JSDOM } from 'jsdom';

const JET_PHOTOS_URL = 'https://www.jetphotos.com';
const FLIGHT_AWARE_BASE_URL = 'https://aeroapi.flightaware.com/aeroapi';
const AIR_LABS_BASE_URL = 'https://airlabs.co/api/v9/flights';

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

const aircraftImageCache: Record<string, string> = {};

export const airLabsFlights = onRequest({ cors: true, secrets: ['AIRLABS_API_KEY'] }, async (_request, response) => {
  const url = new URL(AIR_LABS_BASE_URL);
  url.searchParams.set('api_key', process.env.AIRLABS_API_KEY as string);
  url.searchParams.set('_view', 'array');
  url.searchParams.set(
    '_fields',
    'lat,lng,alt,dir,speed,status,flight_number,aircraft_icao,airline_icao,dep_iata,arr_iata,reg_number'
  );

  const flights = [];

  url.searchParams.set('arr_iata', 'OMA');
  let airLabsResponse = await fetch(url.toString());
  const incomingFlights = (await airLabsResponse.json()) || [];
  flights.push(...incomingFlights);

  url.searchParams.delete('arr_iata');

  url.searchParams.set('dep_iata', 'OMA');
  airLabsResponse = await fetch(url.toString());
  const outgoingFlights = (await airLabsResponse.json()) || [];
  flights.push(...outgoingFlights);

  // update airlabs call count
  try {
    // 2 calls (incoming and outgoing) for each search
    updateAirlabsCallCount(2);
  } catch (err) {
    console.error('error updating call count', err);
  }

  response.send(flights);
});

export const aircraftImage = onRequest({ cors: true }, async (request, response) => {
  if (aircraftImageCache[request.query.tailNumber as string]) {
    response.send({ url: aircraftImageCache[request.query.tailNumber as string] });
    return;
  }
  try {
    const regPageHtml = await got(`${JET_PHOTOS_URL}/registration/${request.query.tailNumber}`);
    const dom = new JSDOM(regPageHtml.body);
    // @ts-expect-error element is an achor
    const photoPageLink = dom.window.document.querySelectorAll('.result__photoLink')[0].href;

    const photoPageHtml = await got(`${JET_PHOTOS_URL}${photoPageLink}`);
    const photoDom = new JSDOM(photoPageHtml.body);
    // @ts-expect-error element is an img
    let photoLink = photoDom.window.document.querySelectorAll('.large-photo__img')[1].src;
    photoLink = photoLink.replace('full', '400');
    aircraftImageCache[request.query.tailNumber as string] = photoLink;
    response.send({ url: photoLink });
  } catch (err) {
    console.log(err);
    response.status(404).send({ error: 'Error fetching data' });
  }
});

export const flightAwareOmahaFlights = onRequest(
  { cors: true, secrets: ['FLIGHT_AWARE_API_KEY'] },
  async (_request, response) => {
    // if next call will put us over $5, return error
    try {
      const currentCost = await getFlightAwareCurrentCost();
      if (currentCost > 495) {
        response.status(429).send({ error: 'cost exceeded' });
        return;
      }
    } catch (err) {
      console.error('error calculating current cost', err);
    }

    // search for omaha flights
    try {
      const queryString = '-latlong "40.999229 -96.388079 41.462593 -95.672571"';
      const url = new URL(`${FLIGHT_AWARE_BASE_URL}/flights/search`);
      url.searchParams.set('query', queryString);

      const apiResponse = await fetch(url.toString(), {
        headers: {
          'x-apikey': process.env.FLIGHT_AWARE_API_KEY as string,
        },
      });
      const data = await apiResponse.json();
      const flights = data.flights;

      const regNumberPromises: Promise<any>[] = [];

      flights.forEach((flight: any) => {
        if (flight.ident_icao || flight.ident_iata) {
          // this is a commercial flight and need to fetch reg separately
          flight.flightNumber = flight.ident;
          const identUrl = new URL(`${FLIGHT_AWARE_BASE_URL}/flights/${flight.fa_flight_id}`);
          regNumberPromises.push(
            fetch(identUrl.toString(), {
              headers: {
                'x-apikey': process.env.FLIGHT_AWARE_API_KEY as string,
              },
            })
          );
        } else {
          flight.registration = flight.ident;
          flight.flightNumber = null;
        }
      });

      const identResponses = await Promise.all(regNumberPromises);

      // set registration number for each commercial flight
      await Promise.all(
        identResponses.map(async (identResponse) => {
          const identData = await identResponse.json();
          const identFlight = identData.flights[0];
          const flight = flights.find((f: any) => f.fa_flight_id === identFlight.fa_flight_id);
          flight.registration = identFlight.registration;
        })
      );

      // update cost for the search call and all ident calls
      try {
        // 5 cents for search, 0.5 cents for each ident call
        const cost = 5 + 0.5 * regNumberPromises.length;
        updateFlightAwareCurrentCost(cost);
      } catch (err) {
        console.error('error updating cost', err);
      }

      response.send(flights);
    } catch (err) {
      console.error(err);
      response.status(500).send({ error: 'internal error' });
    }
  }
);

export const flightAwareFlightTrack = onRequest(
  { cors: true, secrets: ['FLIGHT_AWARE_API_KEY'] },
  async (request, response) => {
    // if next call will put us over $5, return empty (no need to error)
    try {
      const currentCost = await getFlightAwareCurrentCost();
      if (currentCost > 498.8) {
        response.send({});
        return;
      }
    } catch (err) {
      console.error('error calculating current cost', err);
    }

    // update cost for the track call
    try {
      // 1.2 cents for each track call
      updateFlightAwareCurrentCost(1.2);
    } catch (err) {
      console.error('error updating cost', err);
    }

    try {
      const url = new URL(`${FLIGHT_AWARE_BASE_URL}/flights/${request.query.flightId}/track`);

      const apiResponse = await fetch(url.toString(), {
        headers: {
          'x-apikey': process.env.FLIGHT_AWARE_API_KEY as string,
        },
      });
      const data = await apiResponse.json();
      response.send(data);
    } catch (err) {
      console.error(err);
      response.status(500).send({ error: 'internal error' });
    }
  }
);

async function getFlightAwareCurrentCost() {
  const currentDate = new Date();
  const currentMonthString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  const docRef = db.collection('flightAwareUsage').doc(currentMonthString);

  const currentCostData = await docRef.get().then((doc) => doc.data());
  return currentCostData?.runningCost || 0;
}

async function updateFlightAwareCurrentCost(costInCents: number) {
  const currentDate = new Date();
  const currentMonthString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  const docRef = db.collection('flightAwareUsage').doc(currentMonthString);

  const currentCostData = await docRef.get().then((doc) => doc.data());
  const runningCost = currentCostData?.runningCost || 0;

  await docRef.set({
    runningCost: runningCost + costInCents,
  });
}

async function updateAirlabsCallCount(amount: number) {
  const currentDate = new Date();
  const currentMonthString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  const docRef = db.collection('airLabsUsage').doc(currentMonthString);

  const currentUsageData = await docRef.get().then((doc) => doc.data());
  const callCount = currentUsageData?.callCount || 0;

  await docRef.set({
    callCount: callCount + amount,
  });
}
