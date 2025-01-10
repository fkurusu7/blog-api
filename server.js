import dotenv from "dotenv";
dotenv.config();
import express from "express";

import configSecurity from "./src/security/index.js";
import errorHandler, { notFound } from "./src/utils/errorHandler.js";

const AppServer = express();

// helmet, rate limit and cors middlewares
configSecurity(AppServer);
AppServer.use(express.json());

AppServer.get("/test", (req, res) =>
  res.status(200).json({ message: "It works!" })
);

// ******************************************
// Handle Errors ==> Error Middleware
// Error: Not Found
AppServer.use(notFound);
// Error: Any other App error
AppServer.use(errorHandler);

const PORT = process.env.SERVER_PORT || 5174;
AppServer.listen(PORT, () =>
  console.log(`AppServer Server running on ${PORT} port.`)
);
