# Process

## Step 1:

0. Generate Folder Structure:

```bash
  project-root/
  ├── src/                  # All source code
  │   ├── config/           # Configuration files, env variables
  │   ├── models/           # MongoDB models/schemas
  │   ├── controllers/      # Business logic
  │   ├── routes/           # Route definitions
  │   ├── middleware/       # Custom middleware
  │   ├── services/         # External services, complex business logic
  │   ├── utils/            # Helper functions, utilities
  │   └── validators/       # Input validation schemas
  ├── tests/
  │   ├── unit/             # Unit tests
  │   ├── integration/      # Integration tests
  │   └── fixtures/         # Test data
  ├── server.js             # Entry point
  └── package.json
```

1. Install Express, DotEnv, Mongoose, Cors dependencies and chalk & morgan (logs) and nodemon as dev dependencies

```zsh
  $ npm install express cors dotenv express-rate-limit morgan chalk
  $ npm install --save-dev nodemon
```

2. Set up Server --> create variables (.env file) like PORT, other configs...
3. Add Custom Logger with chalk and
4. Error handling

npm install bcryptjs cors dotenv express express-rate-limit helmet joi jsonwebtoken morgan winston

npm install --save-dev @types/bcrypt @types/cors @types/express @types/jsonwebtoken @types/morgan @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier nodemon prettier ts-node typescript

husky
