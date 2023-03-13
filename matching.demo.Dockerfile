# Build stage
FROM node:16-alpine3.12

WORKDIR /app

RUN apk add --no-cache git

RUN git clone https://github.com/energywebfoundation/origin-247-sdk.git

WORKDIR /app/origin-247-sdk/packages/matching-demo

RUN npm install --legacy-peer-deps

# Production stage
FROM node:16-alpine3.12

WORKDIR /app

COPY --from=0 /app/origin-247-sdk/packages/matching-demo /app

RUN npm install --legacy-peer-deps

EXPOSE 5000

CMD ["npm", "run", "start:dev"]
