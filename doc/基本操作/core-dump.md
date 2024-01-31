# core dump 分析


##  llnode
ulimit -c unlimited // 不开启生成 core-dump
node --abort-on-uncaught-exception app.js
llnode node -c  core-node-63177-1704730085
ulimit -c 1024
## 其他

 du -sh **/node_modules
## 参考
https://hideonheart.top/archives/gcore-llnode
https://www.javascriptc.com/books/node-in-debugging/3.7-uncaughtException-llnode.html
https://lz5z.com/%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BANode-js-%E5%86%85%E5%AD%98%E6%8E%A7%E5%88%B6 内存控制
https://cloud.tencent.com/developer/article/2335110 node 如何处理请求

