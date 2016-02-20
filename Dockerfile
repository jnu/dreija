FROM node:latest
MAINTAINER Joe Nudell <joenudell@gmail.com>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN make build

EXPOSE 3030
CMD [ "node", "dist/server.js" ]
