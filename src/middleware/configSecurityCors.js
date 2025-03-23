import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

const configSecurity = (appServer) => {
  // Helmet configuration
  if (process.env.NODE_ENV === "development") {
    helmet({
      contentSecurityPolicy: false, // Disable CSP in development
      hsts: false, // Disable HSTS in development
    });
  } else {
    appServer.use(helmet());
  }

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 200, // Increased limit for smoother requests
    message: {
      success: false,
      statusCode: 429,
      message: "Too many requests, please try again later",
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers (recommended)
  });
  appServer.use(limiter);

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    credentials: true, // Required for cookies and credentials
    optionsSuccessStatus: 204, // Handles preflight requests properly
  };
  appServer.use(cors(corsOptions));

  // Handle OPTIONS requests for preflight
  appServer.options("*", cors(corsOptions));
};

export default configSecurity;
