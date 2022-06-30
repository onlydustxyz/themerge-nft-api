# Taken from https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn install

# Bundle app source
COPY . .

# Build the app
ENV NODE_ENV production
RUN yarn compile

# Expose running port
ENV PORT 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
