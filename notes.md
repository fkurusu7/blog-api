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

### Server status

1. Install Express, DotEnv, Mongoose, Cors dependencies and chalk & morgan (logs) and nodemon as dev dependencies

```zsh
  $ npm install express cors dotenv express-rate-limit morgan chalk
  $ npm install --save-dev nodemon
```

2. Set up Server --> create variables (.env file) like PORT, other configs...
3. Add Custom Logger with Chalk and Morgan
4. Error handling

### Authentication

1. Install mongoose, bcryptjs, jsonwebtoken

```zsh
  $ npm i mongoose
```

2. Add user schema and model
3. Add route for signup (the cookie will be added to the response) in routes/routes.js
4. Connect to DB, mongodb cloud
5. Add Controller functions to sign up, in, and out.
6. Add validations into a new file (manual or with a library) , if library install zod:

```zsh
  $ npm i zod
```

7. Add monitoring (timeout) for the entire request

8. Once validations passed, save data to DB, before that encrypt the password with bcriptjs

```zsh
  $ npm i bcryptjs
```

9.  Add route for signin
10. Validate email and password fields only not empty, create zod schema
11. Find user by email, if user not found or password is incorrect return message "Invalid Credentials"
12. validate password with bcryptjs.compareSync, in case of error, return step 11 error message
13. Generate access token with jsonwebtoken jwt.sign with the user.\_id and JWT Secret keyphrase

```zsh
  $ npm i jsonwebtoken
```

14. Return response with cookie with accesstoken

    .
    .
    .
    .
    .
    .
    .

npm install joi jsonwebtoken

npm install --save-dev @types/bcrypt @types/cors @types/express @types/jsonwebtoken @types/morgan @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier nodemon prettier ts-node typescript

husky
