# Remix Trello

Trello clone using Remix and Drizzle ORM.

## Installation

Install Dependencies.

```sh
pnpm install
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

| Name         | Description                                                         |
| ------------ | ------------------------------------------------------------------- |
| DATABASE_URL | Database connection url.                                            |
| AUTH_SECRET  | A secret key that is used to sign and verify authentication tokens. |

## Run Locally

To run this project locally first you would need local MySQL Database and run the migrations.

```sh
pnpm migrate
```

From your terminal:

```sh
pnpm dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
pnpm build
```

Then run the app in production mode:

```sh
pnpm start
```
