// src/index/fetchTileRoute.ts
import { Router, Request, Response } from "express";
import { existsSync, readFileSync } from 'fs';
import { Tile, MapKind } from "../types";

const router = Router();

router.get('/tile/:mapKind/:z/:x/:y', async (req: Request, res: Response): Promise<void> => {
  const mapKindStr: string = req.params.mapKind;
  let mapKind: MapKind;
  if (mapKindStr === MapKind.openStreetMap || mapKindStr === MapKind.primarMap) {
    mapKind = mapKindStr as MapKind;
  } else {
    res.status(400).json({ error: "map kind invalid" });
    return
  }
  const z = parseInt(req.params.z, 10);
  const x = parseInt(req.params.x, 10);
  const y = parseInt(req.params.y, 10);
  const tile: Tile = { x, y, z, mapKind, image: null };

  const tilePath: string = `./tiles/${mapKind}/${tile.z}/${tile.x}/${tile.y}.png`;

  try {
    if (!existsSync(tilePath)) {
      res.status(404).send(null);
      return;
    } else {
      tile.image = readFileSync(tilePath);
      res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      res.status(200).send(tile.image);
      return;
    }
  } catch (err) {
    console.error(`Error serving tile ${tile.z}/${tile.x}/${tile.y}:`, err);
    res.status(500).send('Error serving tile');
    return;
  }
});

export default router;
