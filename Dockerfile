FROM node:16

# Create app directory
WORKDIR /app

# Copy app files
COPY package.json ./
COPY package-lock.json ./
COPY public/ ./public
COPY libs/ ./libs
COPY src/ ./src

# Install app dependencies
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg
RUN npm install

EXPOSE 3378

CMD [ "node", "src/index.ts" ]