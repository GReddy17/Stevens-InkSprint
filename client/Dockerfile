# Use Node.js version 22 alpine
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Tell Docker app uses port 5173 (Vite default)
EXPOSE 5173

# Run development server
CMD ["npm", "run", "dev", "--", "--host"]