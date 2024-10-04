FROM node:18-alpine
WORKDIR /react-test-app-config/
COPY public/ /react-test-app-config/public
COPY src/ /react-test-app-config/src
COPY package.json /react-test-app-config/
COPY scripts/ /react-test-app-config/scripts
RUN node -e "console.log('hello world')"
RUN npm install winston
RUN npm install read-excel-file
RUN npm install
ENTRYPOINT ["sh", "scripts/startup.sh"]
#CMD ["npm", "start"]
