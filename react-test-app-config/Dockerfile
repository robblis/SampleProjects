FROM node:18-alpine
WORKDIR /react-test-app-config/
COPY public/ /react-test-app-config/public
COPY src/ /react-test-app-config/src
COPY package.json /react-test-app-config/
RUN node -e "console.log('hello world')"
RUN npm install
CMD ["npm", "start"]