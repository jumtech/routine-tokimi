# LINE bot ときみ
## how to use
- build docker image

```
docker build -t routine-tokimi ./
```

- exec `exec-bash-in-docker.sh`

- exec `awake-tokimi-dev.sh` in docker container

- access `http://localhost:8080/test`
  - you can see "TOKIMI is AWAKE" in browser

- exec `test-postreq.sh` in host
  - you can see error log in docker console