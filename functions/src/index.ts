import got from 'got';
import { onRequest } from 'firebase-functions/v2/https';
import { JSDOM } from 'jsdom';

const JET_PHOTOS_URL = 'https://www.jetphotos.com';

const FLIGHT_AWARE_API_KEY = '$API_KEY';
const FLIGHT_AWARE_BASE_URL = 'https://aeroapi.flightaware.com/aeroapi';

export const aircraftImage = onRequest({ cors: true }, async (request, response) => {
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
    response.send({ url: photoLink });
  } catch (err) {
    console.log(err);
    response.send({ error: 'Error fetching data' });
  }
});

export const flightAwareOmahaFlights = onRequest({ cors: true }, async (_request, response) => {
  try {
    const queryString = '-latlong "40.999229 -96.388079 41.462593 -95.672571"';
    //const queryString = '-latlong "40.722886 -96.835106 41.739411 -95.203278"';
    const url = new URL(`${FLIGHT_AWARE_BASE_URL}/flights/search`);
    url.searchParams.set('query', queryString);

    const apiResponse = await fetch(url.toString(), {
      headers: {
        'x-apikey': FLIGHT_AWARE_API_KEY,
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
              'x-apikey': FLIGHT_AWARE_API_KEY,
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

    response.send(flights);
  } catch (err) {
    console.error(err);
    response.status(500).send({ error: 'internal error' });
  }
});

export const flightAwareFlightTrack = onRequest({ cors: true }, async (request, response) => {
  try {
    const url = new URL(`${FLIGHT_AWARE_BASE_URL}/flights/${request.query.flightId}/track`);

    const apiResponse = await fetch(url.toString(), {
      headers: {
        'x-apikey': FLIGHT_AWARE_API_KEY,
      },
    });
    const data = await apiResponse.json();
    response.send(data);
  } catch (err) {
    console.error(err);
    response.status(500).send({ error: 'internal error' });
  }
});
