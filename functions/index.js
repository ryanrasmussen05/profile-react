import got from 'got';
import https from 'firebase-functions/v2/https';
import { JSDOM } from 'jsdom';

const jetPhotosURL = 'https://www.jetphotos.com';

export const aircraftImage = https.onRequest({ cors: true }, async (request, response) => {
  try {
    const regPageHtml = await got(`${jetPhotosURL}/registration/${request.query.tailNumber}`);
    const dom = new JSDOM(regPageHtml.body);
    const photoPageLink = dom.window.document.querySelectorAll('.result__photoLink')[0].href;

    const photoPageHtml = await got(`${jetPhotosURL}${photoPageLink}`);
    const photoDom = new JSDOM(photoPageHtml.body);
    let photoLink = photoDom.window.document.querySelectorAll('.large-photo__img')[1].src;
    photoLink = photoLink.replace('full', '400');
    response.send({ url: photoLink });
  } catch (err) {
    console.log(err);
    response.send({ error: 'Error fetching data' });
  }
});
