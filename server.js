console.clear();
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";

import configSecurity from "./src/security/index.js";
import errorHandler, { notFound } from "./src/utils/errorHandler.js";
import { logger } from "./src/utils/logger.js";
import routes from "./src/routes/index.route.js";
import connectDB from "./src/config/database.js";

// initialize DB Connection
connectDB();

const AppServer = express();

// helmet, rate limit and cors middlewares
configSecurity(AppServer);
AppServer.use(express.json());
AppServer.use(cookieParser());
// Response capture logger middleware
AppServer.use(logger.responseCapture);
// Request capture logger middleware
AppServer.use(logger.requestLogger);
// Handle favicon.ico requests
AppServer.get("/favicon.ico", (req, res) => res.status(204).end());

// ROUTES
AppServer.use(routes);

// ******************************************
// Handle Errors ==> Error Middleware
// Error: Not Found
AppServer.use(notFound);
// Error: Any other App error
AppServer.use(errorHandler);

const PORT = process.env.PORT || process.env.SERVER_PORT || 5174;
AppServer.listen(PORT, () => logger.server(PORT));
