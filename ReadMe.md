# NyaDict

[简体中文](./docs/ReadMe.zh-Hans.md) | [日本語](./docs/ReadMe.ja.md) | English

NyaDict is an open-source web dictionary for Japanese vocabulary memorying.

Demo: [icelava.top/NyaDict/](https://icelava.top/NyaDict/)

## Background

todo

## Deployment

The main function of NyaDict is supplied by the frontend. The backend is only for data synchronizing.

### Frontend

The frontend is static and usable after building.

```bash
pnpm i          # install dependencies
cd frontend     # get into frontend directory
pnpm build      # build
```

To configure backend URL, edit `.env.production`.

Develop:

```bash
pnpm dev
```

### Backend

```bash
pnpm i      # install dependencies
cd backend  # get into backend directory
pnpm build  # build
```

To configure for develop or production mode, edit `.env` or `.env.prod`.

To run in production mode:

```bash
pnpm start:prod
```

To run with pm2:

```bash
pnpm start:prod:pm2
```

To run in develop mode:

```bash
pnpm start:dev
```
