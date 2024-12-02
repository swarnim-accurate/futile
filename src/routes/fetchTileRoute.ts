// src/index/fetchTileRoute.ts
import { Router, Request, Response } from "express";
import { existsSync, readFileSync } from 'fs';
import { Tile, MapKind } from "../types";
import { downloadTile } from "../logic";
import { saveTileToDisk } from "../utils";

const router = Router();

const isInternetAccessible = async (): Promise<boolean> => {
  try { await fetch("https://google.com", { method: "HEAD" }) }
  catch (err: any) { if (err.cause.code === 'ENOTFOUND') return false }
  return true;
};

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
    // TODO: look into restricting cors header
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Access-Control-Allow-Origin', '*');
    if (existsSync(tilePath)) {
      tile.image = readFileSync(tilePath);
      res.status(200).send(tile.image);
      return;
    }

    // tile does not exist
    if (!await isInternetAccessible()) {
      res.status(404).send(null);
    } else {
      await downloadTile(tile);
      res.status(200).send(tile.image);
      await saveTileToDisk(tile);
    }
    return;
  } catch (err) {
    console.error(`Error serving tile ${mapKind}/${tile.z}/${tile.x}/${tile.y}:`, err);
    res.status(500).send('Error serving tile');
    return;
  }
});

export default router;
