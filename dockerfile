# Use the official Node.js 20 Alpine image as the base image
FROM node:20-alpine AS BUILD

# Build stage
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD  ["npm", "run", "build"]

# CMD ["tail", "-f", "/dev/null"]
