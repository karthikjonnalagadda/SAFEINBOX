# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install backend dependencies
RUN cd backend && npm install

# Install frontend dependencies
RUN cd frontend && npm install && npm run build

# Expose port
EXPOSE 5000

# Start backend
CMD ["npm", "start", "--prefix", "backend"]
