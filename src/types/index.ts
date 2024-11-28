// src/types/index.ts

export interface Coordinates {
  latitude: number,
  longitude: number
}

export enum MapKind {
  openStreetMap = "openStreetMap",
  primarMap = "primarMap",
}

export interface Tile {
  x: number,
  y: number,
  z: number,
  mapKind: MapKind,
  image: Buffer | null,
}
