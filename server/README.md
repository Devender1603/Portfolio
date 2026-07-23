# Portfolio API

## Run

1. Copy `.env.example` to `.env` and set `MONGO_URI`.
2. Run `npm install`.
3. Start MongoDB locally.
4. Run `npm run dev`.

Base URL: `/api/v1`

## Resources

`/profile`, `/projects`, `/experience`, `/education`, `/skills`, `/certifications`, `/achievements`, `/blogs`, `/testimonials`, `/services`, and `/contact` expose REST endpoints. Content resources support `GET`, `POST`, `GET/:id`, `PATCH/:id`, and `DELETE/:id`. `/portfolio` returns the public aggregate payload. `/assets` accepts a multipart `image` field, converts supported images to optimized WebP with Sharp, and stores the binary plus metadata in MongoDB.

The API is intentionally transport-focused. Add authentication and role-based authorization before exposing write endpoints publicly in production.
