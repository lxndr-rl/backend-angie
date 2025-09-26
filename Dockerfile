FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build step if needed (uncomment if you use a build step)
# RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/server.js"]
