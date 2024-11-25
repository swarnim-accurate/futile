// src/routes/index.ts
import { Router } from "express";
import tileRoute from "./fetchTileRoute";
import tileRegionRoute from "./fetchRegionRoute";

const router = Router();

router.use(tileRoute);
router.use(tileRegionRoute);

export default router;
