#


## 
ulimit -c unlimited // 不开启生成 core-dump
node --abort-on-uncaught-exception app.js
llnode node -c  core-node-63177-1704730085
ulimit -c 1024
## 参考
https://hideonheart.top/archives/gcore-llnode
https://www.javascriptc.com/books/node-in-debugging/3.7-uncaughtException-llnode.html

