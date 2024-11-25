// src/index/fetchTileRoute.ts
import { Router, Request, Response } from "express";
import { existsSync, readFileSync } from 'fs';

import { Tile } from "../types";
import { downloadTile } from "../logic";
import { saveTileToDisk } from "../utils";


const router = Router();


router.get('/tile/:z/:x/:y', async (req: Request, res: Response) => {
  const tile: Tile = { x: 0, y: 0, z: 0, image: null };
  tile.z = parseInt(req.params.z);
  tile.x = parseInt(req.params.x);
  tile.y = parseInt(req.params.y);

  const tilePath: string = `./tiles/${tile.z}/${tile.x}/${tile.y}.png`;
  const tileExists: boolean = existsSync(tilePath);

  try {
    if (!tileExists) {
      res.status(404).send(null);
      return
    } else {
      tile.image = readFileSync(tilePath);

      res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });

      res.status(200).send(tile.image);
    }

  } catch (err) {
    console.error(`Error serving tile ${tile.z}/${tile.x}/${tile.y}:`, err);
    res.status(500).send('Error serving tile');
  }
});


router.get('v1/tile/:z/:x/:y', async (req: Request, res: Response) => {
  const tile: Tile = { x: 0, y: 0, z: 0, image: null };
  tile.z = parseInt(req.params.z);
  tile.x = parseInt(req.params.x);
  tile.y = parseInt(req.params.y);

  const tilePath: string = `./tiles/${tile.z}/${tile.x}/${tile.y}.png`;
  const tileExists: boolean = existsSync(tilePath);


  try {
    if (!tileExists) {
      await downloadTile(tile); // tile.image should contain the image buffer since objects are pass by reference
      if (tile.image === null) throw new Error(`failed to download tile`);
      await saveTileToDisk(tile); // save file for future use
    } else {
      tile.image = readFileSync(tilePath);
    }

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });

    res.status(200).send(tile.image);

  } catch (err) {
    console.error(`Error serving tile ${tile.z}/${tile.x}/${tile.y}:`, err);
    res.status(500).send('Error serving tile');
  }
});


export default router;
