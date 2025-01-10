import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

const configSecurity = (appServer) => {
  // Helmet configuration
  appServer.use(helmet());

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
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
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
