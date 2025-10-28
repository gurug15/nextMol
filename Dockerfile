# 1️⃣ Base build stage
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build Next.js app
RUN npm run build

ENV PORT=3000
EXPOSE 3000

# Start app
CMD ["npm", "run", "start"]
