# Railway Deployment Guide

## MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster
2. Create a database user with a strong password — save the username and password
3. Under **Network Access**, add `0.0.0.0/0` to allow Railway's dynamic IPs
4. Get the connection string from **Connect > Drivers**, replace `<password>` with your DB user password, set the database name to `dhreampay`:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/dhreampay?retryWrites=true&w=majority
   ```
5. This string becomes the `MONGODB_URI` Railway environment variable

## Railway Environment Variables

Set the following variables in the Railway dashboard under the service's **Variables** tab:

| Variable | Value |
|----------|-------|
| NODE_ENV | production |
| PORT | 3001 (Railway overrides this automatically with $PORT) |
| MONGODB_URI | `<atlas connection string>` |
| JWT_ACCESS_SECRET | `<generate a 32+ char random string>` |
| JWT_REFRESH_SECRET | `<generate a different 32+ char random string>` |
| JWT_ACCESS_EXPIRY | 15m |
| JWT_REFRESH_EXPIRY | 7d |
| SEED_ADMIN_EMAIL | `<admin email>` |
| SEED_ADMIN_PASSWORD | `<strong password>` |
| AMOUNT_TOLERANCE | 0.01 |
| DATE_WINDOW_DAYS | 1 |
| CORS_ORIGIN | * (update after frontend is deployed with your frontend URL) |

## Railway Deployment Steps

1. Push the repo to GitHub if not already done
2. Go to [railway.app](https://railway.app), create a new project, choose "Deploy from GitHub repo", select dhreampay-backend
3. Railway will detect `railway.json` and build automatically
4. Set all environment variables from above in the Railway dashboard Variables tab
5. Trigger a redeploy after setting variables
6. Once deployed, open the Railway-provided URL and visit `<URL>/api/health` — confirm the response is:
   ```json
   { "success": true, "status": "ok", "db": "connected" }
   ```
   If `db` shows `disconnected`, the `MONGODB_URI` is incorrect or Atlas network access is not open
7. Run the seed script once:
   - Open the Railway dashboard, go to your service shell
   - Run: `node dist/scripts/seedAdmin.js`

## Seed Admin Script

The seed script creates an admin user on the first run. It is safe to run multiple times — it will only create the user if it doesn't exist.

## CORS Configuration

After deploying the frontend, update `CORS_ORIGIN` in Railway variables to the frontend URL (e.g., `https://dhreampay-frontend.up.railway.app`) to restrict API access to your frontend only.