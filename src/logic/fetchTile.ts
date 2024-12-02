// src/logic/fetchTile.ts
import { Tile, MapKind } from "../types";

// modify the object passed as reference
// the downloaded tile is saved in the image attribute of the Tile struct
export async function downloadTile(ptrTile: Tile): Promise<void> {
  // understand ptrTile as pointer to tile
  // passed in here as a pointer so that modifications be done to it
  let tileUrl: string;

  switch (ptrTile.mapKind) {
    case MapKind.openStreetMap:
      const osmServers: Array<string> = ['a', 'b', 'c'];
      const randomIndex: number = Math.floor(Math.random() * osmServers.length);
      const random: string = osmServers[randomIndex];
      tileUrl = `https://${random}.tile.openstreetmap.org/${ptrTile.z}/${ptrTile.x}/${ptrTile.y}.png`;
      break;
    case MapKind.primarMap:
      const primarApiKey = process.env.CELLSTILE_APIKEY;
      tileUrl = `https://primar.ecc.no/primar/cellstile_apikey/${primarApiKey}/${ptrTile.z}/${ptrTile.x}/${ptrTile.y}.png`;
      break;
    default:
      throw new Error(`invalid map kind`);
  }

  let response: Response;
  try {
    response = await fetch(tileUrl, { method: "GET" });
  } catch (err) {
    console.error(err)
    return; // image struct will have null instead of an array buffer
  }

  if (!response.ok) {
    console.log(response);
    console.error(`Failed to download tile: ${response.status}`);
    return; // image struct will have null instead of an array buffer
  }

  const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
  ptrTile.image = Buffer.from(arrayBuffer); // the only modification done to the object
  return;
}
