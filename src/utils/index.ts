// src/utils/index.ts
import { Tile, Coordinates, MapKind } from "../types";
import { existsSync, mkdirSync, writeFileSync } from 'fs';

// See: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames [Section: Lon./lat. to tile numbers]
export async function coordsToTile(coordinates: Coordinates, zoom: number, mapKind: MapKind): Promise<Tile> {
  const tile: Tile = { x: 0, y: 0, z: zoom, mapKind: mapKind, image: null };
  tile.y = latToTile(coordinates.latitude, zoom);
  tile.x = lonToTile(coordinates.longitude, zoom);
  console.log(tile)
  return tile;
}

function lonToTile(lon: Coordinates["longitude"], zoom: Tile["z"]): Tile["x"] {
  return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
}

function latToTile(lat: Coordinates["latitude"], zoom: Tile["z"]): Tile["y"] {
  return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
}

export function isValidTile(tile: Tile): boolean {
  const n = Math.pow(2, tile.z);
  return tile.x >= 0 && tile.x < n && tile.y >= 0 && tile.y < n;
}

export async function saveTileToDisk(tile: Tile): Promise<void> {
  const tileParentDir = `./tiles/${tile.mapKind}/${tile.z}/${tile.x}`
  const tilePath = `${tileParentDir}/${tile.y}.png`;
  if (existsSync(tilePath)) return;
  mkdirSync(tileParentDir, { recursive: true });
  if (!tile.image) throw new Error(`no image data to be saved in buffer`);
  writeFileSync(tilePath, tile.image);
  return;
}
