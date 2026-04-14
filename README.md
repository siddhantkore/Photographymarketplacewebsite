# Photography Marketplace

Full-stack marketplace for selling digital photography assets (photos, bundles, posters, typography, banners).

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL
- Storage: MinIO / AWS S3 / Cloudflare R2
- Payments: Razorpay

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL 14+
- Object storage (MinIO recommended for local)

## Quick Start (Docker)

```bash
npm run docker:up
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001

Stop:

```bash
npm run docker:down
```

## Local Development

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies and set env:

```bash
cd backend
npm install
cp .env.example .env
```

3. Update `backend/.env` with required values:
- `DATABASE_URL`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `PREVIEW_BUCKET_NAME`
- `ORIGINAL_BUCKET_NAME`
- For MinIO: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- For S3: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- For R2: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_ACCOUNT_ID` or `R2_ENDPOINT`

4. Setup database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Start backend:

```bash
npm run dev
```

6. In project root, create `.env` for frontend (optional; defaults to localhost backend):

```env
VITE_API_URL=http://localhost:5000/api/v1
```

7. Start frontend (project root):

```bash
npm run dev
```

## Default Admin (After Seed)

Admin credentials are **not** hardcoded. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables before running `npm run prisma:seed`.
If not set, no admin user will be created.

## Useful Scripts

Root:
- `npm run dev` - start frontend
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run backend` - run backend from root
- `npm run docker:up` - start Docker stack
- `npm run docker:down` - stop Docker stack

Backend (`backend/`):
- `npm run dev` - start API server
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:migrate:deploy`
- `npm run prisma:seed`

## API Spec

- OpenAPI file: `openapi.yaml`

## License

Private