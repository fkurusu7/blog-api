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
    max: process.env.RATE_LIMIT_MAX, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      statusCode: 429,
      message: "Too many requests, please try again later",
    },
  });
  appServer.use(limiter);

  // CORS configuration
  const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 204,
  };
  appServer.use(cors(corsOptions));
};

export default configSecurity;

/*
// auth/passwordUtils.js
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// auth/jwtUtils.js
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

*/
