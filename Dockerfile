### Setup Dev Environment
FROM node:22-alpine AS dependencies

USER node:node
WORKDIR /home/node/app

COPY --chown=node:node package.json package-lock.json tsconfig.json nest-cli.json ./
RUN --mount=type=cache,id=npm,target=/home/node/.npm/,uid=1000,gid=1000 \
  npm ci --loglevel info --omit optional

COPY --chown=node:node ./prisma/ ./prisma/
RUN npx prisma generate

COPY --chown=node:node ./src/ ./src/

### Image for Dev Container
FROM dependencies AS watch

EXPOSE 3000/tcp 9229/tcp
HEALTHCHECK CMD netstat -an | grep 9229 > /dev/null; if [ 0 != $? ]; then exit 1; fi;

CMD [ "npm", "run", "start:debug" ]

### Build for Deployment
FROM dependencies AS build

RUN npm run build && npm prune --omit dev --omit optional

### Image for Deployment
FROM node:22-alpine AS application

USER node:node
WORKDIR /home/node/app

COPY --from=build --chown=node:node /home/node/app/dist/ ./dist/
COPY --from=build --chown=node:node /home/node/app/node_modules/ ./node_modules/

EXPOSE 3000/tcp
HEALTHCHECK CMD netstat -an | grep 3000 > /dev/null; if [ 0 != $? ]; then exit 1; fi;

CMD [ "node", "--enable-source-maps", "dist/main.js" ]
