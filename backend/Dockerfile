FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV PORT=3001
EXPOSE 3001

# Start the server using the new start script
CMD ["npm", "start"]
