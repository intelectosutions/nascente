FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat git
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG GIT_COMMIT
ARG GIT_BRANCH
ARG SOURCE_COMMIT
ARG SOURCE_BRANCH
ENV GIT_COMMIT=$GIT_COMMIT
ENV GIT_BRANCH=$GIT_BRANCH
ENV SOURCE_COMMIT=$SOURCE_COMMIT
ENV SOURCE_BRANCH=$SOURCE_BRANCH
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN sh scripts/gen-version.sh
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules/postgres ./node_modules/postgres
# web-push (server-only) + suas deps transitivas que o trace do Next não copia
RUN npm install --no-save --no-package-lock web-push@3.6.7 \
  && chown -R nextjs:nodejs /app/node_modules
RUN chmod +x /app/scripts/docker-entrypoint.sh /app/scripts/migrate.mjs 2>/dev/null || true
RUN chown -R nextjs:nodejs /app/scripts
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["/app/scripts/docker-entrypoint.sh"]
