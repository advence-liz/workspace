#


## 
ulimit -c unlimited // 不开启生成 core-dump
node --abort-on-uncaught-exception app.js
llnode node -c  core-node-63177-1704730085
ulimit -c 1024

## 
ulimit -a
core file size     (blocks, -c) 0
data seg size      (kbytes, -d) unlimited
file size        (blocks, -f) unlimited
pending signals         (-i) 1024
max locked memory    (kbytes, -l) 32
max memory size     (kbytes, -m) unlimited
open files           (-n) 1024
pipe size      (512 bytes, -p) 8
POSIX message queues   (bytes, -q) 819200
stack size       (kbytes, -s) 10240
cpu time        (seconds, -t) unlimited
max user processes       (-u) 4096
virtual memory     (kbytes, -v) unlimited
file locks           (-x) unlimited

## 查看 block
stat / | grep "IO Block"
  Size: 4096      	Blocks: 8          IO Block: 4096   directory

  4096/8 = 512
## 参考
https://hideonheart.top/archives/gcore-llnode
https://www.javascriptc.com/books/node-in-debugging/3.7-uncaughtException-llnode.html

