### Setup Dev Environment
FROM node:22-alpine AS dependencies

ARG ENVIRONMENT=production

USER node
WORKDIR /home/node/app

COPY --chown=node:node package.json package-lock.json tsconfig.json nest-cli.json ./
RUN --mount=type=cache,target=/home/node/.npm/,uid=1000,gid=1000 \
  npm ci --loglevel info --omit optional

COPY --chown=node:node ./prisma/ ./prisma/
COPY --chown=node:node ./src/ ./src/

RUN npx prisma generate

### Image for Dev Container
FROM dependencies AS watch

EXPOSE 3000/tcp 9229/tcp

CMD [ "npm", "run", "start:debug" ]

### Build for Deployment
FROM dependencies AS build

RUN npm run build
RUN npm prune --omit dev --omit optional

### Image for Deployment
FROM node:22-alpine AS application

ENV NODE_ENV=$ENVIRONMENT IS_CONTAINER_ENV=true

USER node
WORKDIR /home/node/app

COPY --from=build --chown=node:node /home/node/app/dist/ ./dist/
COPY --from=build --chown=node:node /home/node/app/node_modules/ ./node_modules/

EXPOSE 3000/tcp

CMD [ "node", "--enable-source-maps", "dist/main.js" ]
