#!/bin/bash
docker run -it -v `pwd`:/root/routine-tokimi -p 8080:3000 routine-tokimi /bin/bash
