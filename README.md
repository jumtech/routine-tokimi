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
- `docker-compose run [--rm] node migrate` to migrate
- `docker-compose run [--rm] node rollback` to rollback the previous migration

#### How to create a model

To create a new model, exec bash in container first.

```
$ docker-compose run --rm node shell
```

Then, you can run sequelize-cli.

```
$ `npm bin`/sequelize model:create --name Task --attributes 'userId:string taskName:string'
```

#### Send a dummy message

Run `test-postreq.sh` in host, and you can see error log in docker console.
