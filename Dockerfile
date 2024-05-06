# Common build stage
# FROM node:18.14.0-alpine3.12 as common-build-stage

FROM node:18-alpine
USER node
WORKDIR /home/node/app

# RUN npm install

COPY --chown=node:node ./dist ./dist/
COPY --chown=node:node ./tsconfig.json ./package.json ./
COPY --chown=node:node ./node_modules ./node_modules/
COPY --chown=node:node ./docs ./docs

EXPOSE 3000

ENV NODE_ENV production

CMD ["npm", "start"]
