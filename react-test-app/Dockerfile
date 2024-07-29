FROM node:18-alpine
WORKDIR /react-test-app/
COPY public/ /react-test-app/public
COPY src/ /react-test-app/src
COPY package.json /react-test-app/

RUN npm install
CMD ["npm", "start"]