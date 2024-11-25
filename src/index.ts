// src/index.ts

import express, { Express } from "express";

import { port } from "./config";
import encompassedRouter from "./routes";
import { corsMiddleware } from "./middleware";


const app: Express = express();

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// Routes
app.use(encompassedRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
