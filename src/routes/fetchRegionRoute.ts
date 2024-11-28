// src/routes/fetchRegionRoute.ts

import { Router, Request, Response } from "express";

import { Coordinates, MapKind } from "../types";
import { downloadRegion } from "../logic";

const router: Router = Router();

// api to download region
// tl: 37, 60
// br: 0, 100
// minZoom: 5
// maxZoom: 20
router.post('/downloadRegion/', async (req: Request, res: Response) => {
  /*
  example input:
  {
    "topLeft": { "latitude": 37, "longitude": 60 },
    "bottomRight": { "latitude": 0, "longitude": 100 },
    "mapKind": "openStreetMap" // belongs to type MapKind
    "minZoom": 3,
    "maxZoom": 16
  }
  */
  try {
    const topLeft: Coordinates = req.body.topLeft;
    const bottomRight: Coordinates = req.body.bottomRight;
    const minZoom: number = req.body.minZoom;
    const maxZoom: number = req.body.maxZoom;
    const mapKind: MapKind = req.body.mapKind;

    if (mapKind !== MapKind.openStreetMap && mapKind !== MapKind.primarMap) throw new Error(`invalid map kind`)

    console.log(req.body);

    res.set('Connection', 'Keep-Alive');
    res.set('Keep-Alive', 'timeout=600');
    const { success, failure } = await downloadRegion(topLeft, bottomRight, mapKind, minZoom, maxZoom);
    res.status(200).send({ success, failure })
  } catch (err) {
    console.log(typeof err);
    res.status(500).send({ error: "failed to download region" });
  }
});


export default router;
