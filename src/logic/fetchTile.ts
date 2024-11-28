// src/logic/fetchTile.ts
import { Tile, MapKind } from "../types";
import { osmServers } from "../config";

// modify the object passed as reference
// the downloaded tile is saved in the image attribute of the Tile struct
export async function downloadTile(ptrTile: Tile): Promise<void> {
  // understand ptrTile as pointer to tile
  // passed in here as a pointer so that modifications be done to it
  const randomIndex: number = Math.floor(Math.random() * osmServers.length);
  const random: string = osmServers[randomIndex];
  let tileUrl: string;

  switch (ptrTile.mapKind) {
    case MapKind.openStreetMap:
      tileUrl = `https://${random}.tile.openstreetmap.org/${ptrTile.z}/${ptrTile.x}/${ptrTile.y}.png`;
      break;
    case MapKind.primarMap:
      const primarApiKey = process.env.CELLSTILE_APIKEY;
      tileUrl = `https://primar.ecc.no/primar/cellstile_apikey/${primarApiKey}/${ptrTile.z}/${ptrTile.x}/${ptrTile.y}.png`;
      break;
    default:
      throw new Error(`invalid map kind`);
  }

  const response = await fetch(tileUrl, { method: "GET" });

  if (!response.ok) {
    console.log(response);
    throw new Error(`Failed to download tile: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  ptrTile.image = Buffer.from(arrayBuffer); // the only modification done to the object
  return;
}

// Retry logic for rate-limited requests
export async function downloadTileWithRetry(tile: Tile, maxRetries: number = 3): Promise<void> {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await downloadTile(tile);
      return;
    } catch (error: any) {

      lastError = error;

      // If we hit rate limit, wait longer
      if (error.message.includes('429')) {
        // Exponential backoff: 5s, 10s, 20s between retries
        const waitTime = 5000 * Math.pow(2, attempt);
        console.log(`Rate limited, waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // For other errors, shorter wait
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  throw lastError;
}
