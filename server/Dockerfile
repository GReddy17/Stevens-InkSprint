# Use Node.js version 22 alpine (small Linux image with Node)
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files from local to container
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all source code to container
COPY src ./src

# Tell Docker that app listens on port 4000
EXPOSE 4000

# Run the server when container starts
CMD ["node", "src/server.js"]