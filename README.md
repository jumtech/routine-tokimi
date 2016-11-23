# LINE bot ときみ

## how to use
- build docker image

```
$ docker-compose build
```

### docker-compose up

Run containers.

- node container which serves LINE bot webhook endpoints.
- postgresql container

And you can see "TOKIMI is AWAKE" at `http://localhost:8080/test`.

### docker-compose run

- `docker-compose run [--rm] node version` to see the node version
- `docker-compose run [--rm] node shell` to run bash
  - to crate a new model, `docker-compose run --rm node shell` and `$(npm bin) model:create --name Task --attributes 'userId:string taskName:string'`
- `docker-compose run [--rm] node migrate` to migrate
- `docker-compose run [--rm] node rollback` to rollback the previous migration

- exec `test-postreq.sh` in host
  - you can see error log in docker console
