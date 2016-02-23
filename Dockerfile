FROM node:latest
MAINTAINER Joe Nudell <joenudell@gmail.com>

# Set locale
RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install -y --no-install-recommends locales

RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
RUN locale-gen en_US.UTF-8 && dpkg-reconfigure locales
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV LC_CTYPE en_US.UTF-8


# Build app
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD ./npm-shrinkwrap.json /usr/src/app/npm-shrinkwrap.json
COPY ./dist /usr/src/app/dist

RUN npm install

EXPOSE 3030
CMD [ "node", "dist/server.js" ]
