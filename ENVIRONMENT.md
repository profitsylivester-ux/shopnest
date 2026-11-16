# ShopNest settings (environment)

Nothing about addresses or secrets is written into the code. The same code runs on your computer and on the
live server; only these settings change. Never commit a real `.env` file and never share these values.

## Website (shopnest-web)

On your computer these live in `shopnest-web/.env.local`; on the live host, in its Environment page.
`NEXT_PUBLIC_` values are fixed into the site when it is built, so set them first and build again after any change.

| Name | Meaning | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Address of the ShopNest API, no trailing slash. Required on the live host (the build stops without it). On your computer it defaults to `http://localhost:3001`. | `https://shopnest-api.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | Public address of the website (share cards, sitemap, search engines). | `https://shopnest-web.onrender.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google sign-in client id (public value). | `...apps.googleusercontent.com` |

## API (shopnest-api)

See `shopnest-api/.env.example` for the full list with comments. The important ones on the live server:

| Name | Meaning |
|---|---|
| `NODE_ENV=production` | Makes the API check its settings at start-up and refuse to run half set up. |
| `DATABASE_URL` | PostgreSQL connection (Neon gives you this). |
| `JWT_SECRET` | Long random text, at least 32 characters. |
| `GOOGLE_CLIENT_ID` | Same client id as above. |
| `FRONTEND_ORIGINS` | Website address(es) allowed to call the API, comma separated, no trailing slash. |
| `TRUST_PROXY=1` | One proxy (the host) stands in front of the API, so real visitor addresses are used. |
| `PICTURE_STORAGE=database` | Keeps pictures inside the database (table `Picture`); they are shown from the same `/uploads/<name>` addresses. Required on the live server unless the five bucket settings below are set. |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | Optional cloud picture storage. Set all five or none. A complete bucket is used instead of the database. With neither, pictures stay in the local uploads folder (only for your own computer). |

## Health check

`GET /health` answers `{"status":"ok","database":true}` when the API is running and can reach the database.
Point the host's health check at it.
