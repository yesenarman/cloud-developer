import fetch from 'node-fetch'
import { config } from './config/config';

const SERVICE_HOST = config.dev.image_filter_service_host;
const headers = {
  'X-API-Key': config.dev.image_filter_service_api_key
}

/* filterImage processes the image via the image-filter service
 * @Params
 *    imageURL: a url to the source image
 * @Returns:
 *    a promise of a buffer with filtered image data
 */
export async function filterImage(imageURL: string): Promise<Buffer> {
  const encodedURL = encodeURIComponent(imageURL);
  const res = await fetch(`${SERVICE_HOST}/filteredimage?image_url=${encodedURL}`, { headers });
  if (!res.ok) {
    throw new Error(`Image Filter Service Error: ${res.status} ${res.statusText}`);
  }
  return res.buffer();
}
