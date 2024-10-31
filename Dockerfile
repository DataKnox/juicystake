FROM --platform=linux/amd64 node:latest as build 


WORKDIR /react-app


COPY package*.json ./

COPY yarn.lock ./


RUN yarn install


COPY . .


RUN yarn run build


EXPOSE 3000

# Start the React app
CMD ["npm", "start"]