// src/index.ts

import 'dotenv/config'
import express, { Express } from "express";
import encompassedRouter from "./routes";
import { corsMiddleware } from "./middleware";


const app: Express = express();

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// Routes
app.use(encompassedRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
