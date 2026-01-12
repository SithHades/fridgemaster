## Local Development Setup

To run the application locally with its dependencies:

1.  **Start Services**: Use Docker Compose to start PostgreSQL and Redis.
    ```bash
    docker-compose up -d
    ```

2.  **Environment Setup**: Ensure you have a `.env` file with the correct credentials (see `.env.example`).
    ```bash
    cp .env.example .env
    ```

3.  **Database Setup**: Apply migrations and seed the database.
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

4.  **Run Application**:
    ```bash
    npm run dev
    ```

## Deployment (Coolify)

This project includes a `Dockerfile` optimized for standalone Next.js deployment. 

1.  **Coolify Configuration**:
    - Select "Dockerfile" as the build pack.
    - Set the build context to `.`.

2.  **Environment Variables**:
    - Ensure `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, and `NEXTAUTH_URL` are set in your deployment environment.

3.  **Docker Build**:
    - The Dockerfile uses multi-stage builds to create a lightweight image.
    - It listens on port `3000` by default.
