# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy all files to the container
COPY . .

# Install backend dependencies
RUN cd backend && npm install

# Install frontend dependencies and build the React app
RUN cd frontend && npm install && npm run build

# Copy the React build output to the backend's public folder (or similar)
RUN cp -r frontend/build/* backend/public/

# Expose port (adjust if needed)
EXPOSE 5000

# Start the backend server
CMD ["npm", "start", "--prefix", "backend"]
