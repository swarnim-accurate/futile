// src/logic/fetchRegion.ts

import { Tile, Coordinates } from "../types";
import { downloadTile } from ".";
import { coordsToTile, isValidTile, saveTileToDisk } from "../utils";



export async function downloadRegion(
  topLeft: Coordinates,
  bottomRight: Coordinates,
  /*
  TODO:
  we can download region based on just the top-left and bottom-right;
  min x = top-left->x
  max x = bottom-right->x
  min y = top-left->y
  max y = bottom-right->y
  */
  minZoom: number,
  maxZoom: number
): Promise<{ success: number, failure: number }> {
  console.log(`inside download region`);
  let totalSuccessCount = 0;
  let totalFailureCount = 0;
  const CHUNK_SIZE = 50; // attempt to download these many tiles parellely
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
      let chunkSuccessCount = 0;
      let chunkFailureCount = 0
      // here we consider tiles from i -> i + CHUNK_SIZE
      const chunk = tiles.slice(i, i + CHUNK_SIZE);

      // process tiles in chunk sequentially to avoid rate limits
      // TODO: types
      const promiseList = chunk.map(tile =>
        Promise.all([downloadTile(tile), saveTileToDisk(tile)])
          .then(() => chunkSuccessCount++)
          .catch(() => chunkFailureCount++)
      );

      // wait for all chunks to finish processing
      Promise.all(promiseList);

      // give time in between chunk processing
      await new Promise(resolve => setTimeout(resolve, CHUNK_DELAY));
      console.log(`Processed ${i} to ${Math.min(i+CHUNK_SIZE, tiles.length)} tiles for zoom level: ${zoom}`);
      console.log(`    Success: ${chunkSuccessCount}`);
      console.log(`    Failure: ${chunkFailureCount}`);
      console.log(`    Total Tiles: ${tiles.length}`)

      totalSuccessCount += chunkSuccessCount;
      totalFailureCount += chunkFailureCount;
    }

  }

  return { success: totalSuccessCount, failure: totalFailureCount };
}

// async function downloadRegion(
//   topLeft: Coordinates, topRight: Coordinates, bottomRight: Coordinates, bottomLeft: Coordinates,
//   minZoom: number, maxZoom: number
// ): Promise<{ success: number, failure: number }> {
//   console.log(`inside download region`)
//   let downloadSuccessCount = 0;
//   let downloadFailureCount = 0;
//   for (let zoom = minZoom; zoom <= maxZoom; ++zoom) {
//     console.log(`Zoom level: ${zoom}`);
//     const topLeftTile: Tile = await coordsToTile(topLeft, zoom);
//     const topRightTile: Tile = await coordsToTile(topRight, zoom);
//     const bottomRightTile: Tile = await coordsToTile(bottomRight, zoom); // essentially useless
//     const bottomLeftTile: Tile = await coordsToTile(bottomLeft, zoom);

//     const t: Array<Tile> = [];

//     // so we need to download all t falling in this region
//     // bounded by these 4 t
//     // so x ==> topLeftTile.x to topRightTile.x
//     // &  y ==> topLeftTile.y to bottomLeftTile.y

//     for (let x: number = topLeftTile.x; x <= topRightTile.x; ++x) {
//       for (let y: number = topLeftTile.y; y <= bottomLeftTile.y; ++y) {
//         const tile: Tile = { x: x, y: y, z: zoom, image: null };
//         if (!isValidTile(tile)) continue;
//         t.push(tile);
//       }
//     }

//     const results = await Promise.allSettled(
//       t.map(tile =>
//         downloadTile(tile)
//           .then(() => saveTileToDisk(tile))
//           .then(() => true)
//           .catch(() => false)
//       )
//     );
//     const zoomSuccesses = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
//     const zoomFailures = results.filter(r => r.status === 'rejected' || r.value === false).length;
//     console.log(`Zoom level ${zoom} complete - Success: ${zoomSuccesses}, Failures: ${zoomFailures}`);
//   }
//   return { success: downloadSuccessCount, failure: downloadFailureCount };
// }
