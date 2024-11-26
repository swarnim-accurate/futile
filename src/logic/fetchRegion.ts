// src/logic/fetchRegion.ts
import { Tile, Coordinates } from "../types";
import { downloadTile } from ".";
import { coordsToTile, isValidTile, saveTileToDisk } from "../utils";

export async function downloadRegion(
  topLeft: Coordinates,
  bottomRight: Coordinates,
  minZoom: number,
  maxZoom: number
): Promise<{ success: number, failure: number }> {
  let totalSuccessCount = 0;
  let totalFailureCount = 0;
  const CHUNK_SIZE = 25; // attempt to download these many tiles parellely
  const CHUNK_DELAY = 5 * 1000; // milliseconds

  for (let zoom = minZoom; zoom <= maxZoom; ++zoom) {
    const topLeftTile: Tile = await coordsToTile(topLeft, zoom);
    const bottomRightTile: Tile = await coordsToTile(bottomRight, zoom)

    const { x: minX, y: minY } = topLeftTile;
    const { x: maxX, y: maxY } = bottomRightTile;
    console.log(`Zoom level: ${zoom}`);
    console.log(`Min X: ${minX}, Min Y: ${minY}`);
    console.log(`Max X: ${maxX}, Max Y: ${maxY}`);

    const tiles: Array<Tile> = []; // all valid tiles to be downloaded

    // Collect all valid tiles
    for (let x = minX; x <= maxX; ++x) {
      for (let y = minY; y <= maxY; ++y) {
        const tile: Tile = { x, y, z: zoom, image: null };
        if (!isValidTile(tile)) continue;
        tiles.push(tile);
      }
    }

    // Process chunks
    for (let i = 0; i < tiles.length; i += CHUNK_SIZE) {
      // here we consider tiles from i -> i + CHUNK_SIZE
      const chunk = tiles.slice(i, i + CHUNK_SIZE);

      // TODO: types
      const chunkResults = await Promise.allSettled(
        chunk.map(async (tile) => {
          try {
            await downloadTile(tile);
            await saveTileToDisk(tile);
            return true;
          } catch (err) {
            console.error(`Failed to download/save tile: ${tile.x},${tile.y},${tile.z}`, err);
            return false
          }
        })
      );

      const chunkSuccessCount = chunkResults.filter(result => result.status === 'fulfilled' && result.value === true).length;
      const chunkFailureCount = chunkResults.filter(result => result.status === 'rejected' || result.value === false).length;
      totalSuccessCount += chunkSuccessCount;
      totalFailureCount += chunkFailureCount;

      console.log(`Processed ${i} to ${Math.min(i + CHUNK_SIZE, tiles.length)} tiles for zoom level: ${zoom}`);
      console.log(`    Success: ${chunkSuccessCount}`);
      console.log(`    Failure: ${chunkFailureCount}`);
      console.log(`    Total Tiles: ${tiles.length}`);

      // Give time between chunk processing
      await new Promise(resolve => setTimeout(resolve, CHUNK_DELAY));
    }
  }
  return { success: totalSuccessCount, failure: totalFailureCount };
}
