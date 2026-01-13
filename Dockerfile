# Base image
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN \
    if [ -f package-lock.json ]; then npm ci; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
# Unset variables that might cause build time environment requirement if not strictly needed (e.g. database connection for static generation depends on code)
# For Next.js builds that connect to DB, you might need build args or env vars. 
# Assuming standard build doesn't require live DB connection for static pages unless used in generateStaticParams with DB.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/prisma ./prisma
# Copy the check-env script from builder (source) to runner
COPY --from=builder /app/scripts/check-env.js ./scripts/check-env.js

# Install prisma CLI globally (or rely on standalone if it bundles it? No standalone doesn't bundle node_modules dev deps)
# But we need prisma for migrations.
# Installing global packages in runner stage increases size, but necessary for migrations if not in deps.
# Note: npm install -g needs root, so we switch back to root or do it before USER nextjs?
# The original file did `RUN npm install -g prisma tsx` after `USER nextjs` which might fail if permissions are strict,
# but `base` image is alpine and `npm` is there.
# However, usually better to install as root.

USER root
RUN npm install -g prisma tsx
USER nextjs

# Using shell form to run multiple commands
CMD ["/bin/sh", "-c", "node scripts/check-env.js && npx prisma migrate deploy && node server.js"]
