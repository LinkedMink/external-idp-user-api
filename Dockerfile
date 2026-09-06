### Setup Dev Environment
FROM node:24-alpine AS node-alpine

RUN --mount=type=cache,target=/var/cache/apk/,sharing=locked \
    apk add --update-cache openssl

FROM node-alpine AS dependencies

USER node
WORKDIR /home/node/app

COPY --chown=node:node package.json package-lock.json tsconfig.json nest-cli.json prisma.config.ts ./
RUN --mount=type=cache,id=npm,target=/home/node/.npm/,uid=1000,gid=1000 \
    --mount=from=homedir,source=.npmrc,target=.npmrc \
    npm ci --loglevel info --cache /home/node/.npm

COPY --chown=node:node ./prisma/ ./prisma/
COPY --chown=node:node ./src/ ./src/

### Image for Dev Container
FROM dependencies AS dev

COPY --chown=node:node ./cli/ ./cli/

EXPOSE 58080/tcp 9229/tcp
HEALTHCHECK CMD netstat -an | grep 9229

CMD [ "npm", "run", "start:debug" ]

### Build for Deployment
FROM dependencies AS build

RUN npm run build && npm prune --omit dev

### Image for Deployment
FROM node-alpine AS application

USER node
WORKDIR /home/node/app

COPY --from=build --chown=node:node /home/node/app/dist/ /home/node/app/package.json ./
COPY --from=build --chown=node:node /home/node/app/node_modules/ ./node_modules/

EXPOSE 58080/tcp
HEALTHCHECK --interval=1m --timeout=3s --retries=2 --start-period=30s --start-interval=3s \
    CMD netstat -t -l -n | grep 58080

CMD [ "node", "--enable-source-maps", "main.js" ]
