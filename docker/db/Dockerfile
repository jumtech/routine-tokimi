FROM postgres:alpine

# https://github.com/docker-library/postgres/issues/220
RUN apk add --no-cache tzdata

ADD init-user-db.sh /docker-entrypoint-initdb.d/init-user-db.sh
