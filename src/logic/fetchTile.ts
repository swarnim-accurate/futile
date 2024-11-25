// src/logic/fetchTile.ts
import { Tile } from "../types";
import { osmServers } from "../config";

// modify the object passed as reference
// the downloaded tile is saved in the image attribute of the Tile struct
export async function downloadTile(tile: Tile): Promise<void> {
  const randomIndex: number = Math.floor(Math.random() * osmServers.length);
  const random: string = osmServers[randomIndex];
  const osmUrl = `https://${random}.tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;

  const response = await fetch(osmUrl);

  if (!response.ok) throw new Error(`Failed to download tile: ${response.status}`);

  const arrayBuffer = await response.arrayBuffer();
  tile.image = Buffer.from(arrayBuffer);
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
