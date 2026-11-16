# ShopNest

ShopNest is a multi-vendor online marketplace. Sellers open a shop and list their products; buyers browse, search and
contact the seller directly on WhatsApp. There is no online checkout: the sale is agreed between the buyer and the
seller.

- **Live website:** https://shopnest-seven-rho.vercel.app
- The server runs on a free plan and sleeps when nobody is using it, so the first page after a quiet period can take up to
  a minute to load.

## What it does

**For visitors and buyers**
- Browse and search products from every shop, filter by category, condition, location, price and more, and open a product or a shop page.
- Contact a seller on WhatsApp from the product page or the shop page.
- Sign up to leave a rating and review for a shop. Stars are shown only when a shop has real reviews.
- English and Swahili, light and dark mode, and a layout made for phones first.

**For sellers**
- A private dashboard to open and edit the shop (name, logo, banner, location, opening hours, delivery and returns).
- Add, edit, hide and remove products, with price, old price, stock, category and condition.
- Simple numbers: shop visits, product views and WhatsApp clicks.
- Account security in Settings: password change and signed-in devices.

**For the site owner**
- An owner dashboard to manage shops, products, reviews, site pages, banners and menus, and to see site activity.
- A "Verified" badge on shops that is earned from real activity (enough active products and enough different
  WhatsApp visitors), and can be withdrawn by the owner with a reason.

## How it is built

| Part | Folder | Technology |
|---|---|---|
| Website | `shopnest-web` | Next.js (App Router), React, Tailwind CSS |
| Server (API) | `shopnest-api` | NestJS, Express, Prisma |
| Database | - | PostgreSQL |

Sign-in uses email and password, or Google. Pictures are resized when they are uploaded and are kept in the database or in
an optional cloud bucket.

## Hosting

| Part | Where |
|---|---|
| Website | Vercel |
| Server (API) | Render |
| Database | Neon (PostgreSQL) |

All addresses and secrets are settings, never part of the code. See [ENVIRONMENT.md](ENVIRONMENT.md) for the full list.
Never commit a real `.env` file.

## Run it on your computer

You need Node.js, [pnpm](https://pnpm.io), and either Docker or your own PostgreSQL.

1. **Database.** With Docker, from the project folder:
   ```bash
   docker compose up -d
   ```
   This starts PostgreSQL on port 5435 with the settings in `docker-compose.yml` (for local use only).

2. **Server.**
   ```bash
   cd shopnest-api
   pnpm install
   cp .env.example .env
   ```
   Open `.env` and set `DATABASE_URL` (for the Docker database above:
   `postgresql://shopnest_user:shopnest_password@localhost:5435/shopnest_db?schema=public`) and `JWT_SECRET` (any long
   random text of 32 or more characters). Then:
   ```bash
   pnpm exec prisma migrate deploy
   pnpm start:dev
   ```
   The server listens on http://localhost:3001. `GET /health` tells you it is running and can reach the database.

3. **Website.** In a second terminal:
   ```bash
   cd shopnest-web
   pnpm install
   pnpm dev
   ```
   Open http://localhost:3000. Without any setting the website talks to the server on port 3001.

### Useful commands

| Where | Command | What it does |
|---|---|---|
| `shopnest-api` | `pnpm test` | Runs the server tests |
| `shopnest-api` | `pnpm build` | Builds the server |
| `shopnest-web` | `pnpm build` | Builds the website |

## Project folders

```
shopnest-web/   the website (pages, components, styles, translations)
shopnest-api/   the server (accounts, shops, products, reviews, owner tools, pictures)
  prisma/       database layout and migrations
ENVIRONMENT.md  every setting, with what it means
docker-compose.yml  local database
```

## Ownership

ShopNest is owned by **SentinEx Co Ltd**. It was developed by **Faida Sylivester Mosses**.
