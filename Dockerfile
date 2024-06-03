FROM node as build 


WORKDIR /react-app


COPY package*.json ./

COPY yarn.lock ./


RUN yarn install


COPY . .


RUN yarn run build


FROM --platform=linux/amd64 nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /react-app/build /usr/share/nginx/html
# Create a directory for Let's Encrypt
RUN mkdir -p /var/www/letsencrypt

# Expose this directory as a volume
VOLUME /var/www/letsencrypt