# Mini CRM (Lead Management) — scaffold

This workspace contains a minimal scaffold for a Mini CRM project.

Install from project root

```powershell
cd "C:\Users\Umesh\OneDrive\Desktop\Project 2\mini-crm"
npm install
```

Server (Express + MySQL)

- Location: `mini-crm/server`
- Run (after installing deps):

```powershell
cd "mini-crm/server"
npm install
cp .env.example .env   # or create .env and set DB vars
npm run dev
```

Or from the project root:

```powershell
npm run dev
```

Database

- Use `mini-crm/server/db/schema.sql` to create the database and tables.

Frontend

- The React client lives in `mini-crm/client`.
- From the project root, run it with:

```powershell
npm run client
```

Next steps

- Implement notes endpoints and React UI components.
- Add simple auth and deploy when ready.

Google sign-in setup

- Google sign-in only works with a real Google OAuth Web client ID. Replace the placeholder value `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` in both files:

```powershell
mini-crm/client/.env
mini-crm/server/.env
```

- Set the same client ID in both places:

```powershell
REACT_APP_GOOGLE_CLIENT_ID=your-real-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-real-google-client-id.apps.googleusercontent.com
```

- Make sure `ADMIN_USER` in `mini-crm/server/.env` is the exact Google email address allowed to sign in, for example:

```powershell
ADMIN_USER=munithin177@gmail.com
```

- In Google Cloud Console, add `http://localhost:3000` as an authorized JavaScript origin for the web client.

- Restart both the client and server after changing `.env` files.

Running tests

- To run the integration tests (they create a temporary test DB), provide DB credentials in an `.env` in `mini-crm/server` or via environment variables:

```powershell
# example .env (edit values)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=mini_crm
ADMIN_USER=admin
ADMIN_PASS=password
JWT_SECRET=change-me
```

- Then from the project root run:

```powershell
npm install
npm test
```

If DB credentials are not set, tests will be skipped with an explanatory message.
