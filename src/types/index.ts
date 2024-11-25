// src/types/index.ts

export interface Coordinates {
  latitude: number,
  longitude: number
}

export interface Tile {
  x: number,
  y: number,
  z: number,
  image: Buffer | null
}
