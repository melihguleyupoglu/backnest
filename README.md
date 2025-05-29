# 🛒 Backnest API (NestJS + PostgreSQL + Docker)

Backnest is a modular, containerized backend API for an e-commerce system, built using **NestJS**, **Prisma ORM**, and **PostgreSQL**. It leverages **Docker Compose** to simplify local development and environment management.

## ✨ Features

- 🛡️ JWT-based Authentication
- 🔁 Refresh Token Support
- 👤 User Management (Register, Login)
- 📊 Rate Limiting via Throttler
- ⚙️ Environment-based Configuration
- 🧩 Prisma ORM Integration
- 🧪 (Upcoming) Basic Unit Testing
- 🐳 Fully Dockerized via Docker Compose


## 📦 Requirements

- [Docker](https://www.docker.com/)
- [pnpm](https://pnpm.io/) *(optional, only for local development outside Docker)*

## 🛠️ Environment Variables

Create a `.env` file in the root directory with the following contents:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/backnest
JWT_SECRET=your_jwt_secret
```

## Getting Started

To build and run the project using Docker:
```bash 
docker compose up --build
```

The API will be accessible at:

`http://localhost:3000`

## Running Migrations

If you want to manually apply Prisma migrations to the database:
`docker compose exec api pnpm exec prisma migrate dev`

## Verifying It's Running

`curl http://localhost:3000`

It should log "Hello world!"

## 📄 License

This project is licensed under the MIT License.



