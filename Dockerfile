FROM node as build 


WORKDIR /react-app


COPY package*.json ./

COPY yarn.lock ./


RUN yarn install


COPY . .


RUN yarn run build


FROM --platform=linux/amd64 nginx


COPY ./nginx/nginx.conf /etc/nginx/nginx.conf


COPY --from=build /react-app/build /usr/share/nginx/html