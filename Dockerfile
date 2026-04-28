FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build args for Next.js (NEXT_PUBLIC_ vars are baked in at build time)
ARG NEXT_PUBLIC_API_URL=https://test2.platigames.com/v1
ARG NEXT_PUBLIC_TENANT_ID=921a4273-78be-4b91-a99b-b013e9830456
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_TENANT_ID=$NEXT_PUBLIC_TENANT_ID

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
