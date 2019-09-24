- [node应用程序docker化](https://nodejs.org/zh-cn/docs/guides/nodejs-docker-webapp/)

docker container run --rm -p 8000:3000 -it koa-demo  /bin/bash
docker image build -t koa-demo .        
docker container ls  --all   