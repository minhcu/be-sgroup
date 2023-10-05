# Use an official Node.js runtime as the base image
FROM --platform=linux/amd64 node:18-alpine

# Set the working directory inside the container
WORKDIR /www/app

# Install necessary depedencies
RUN apk add git

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application source code to the container
COPY . .

# Expose the port on which the application will run (assuming it's 3000)
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "start"]